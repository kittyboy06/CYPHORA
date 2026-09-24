import csv
import io
import os
import shutil
import sqlite3
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header, Response
from fastapi.responses import StreamingResponse
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from ..database import get_db, AsyncSessionLocal
from ..models import Team, TaskSubmission, EventConfig
from ..config import DB_PATH, BACKUP_DIR, SECRET_KEY, ALGORITHM
from ..websocket_manager import ws_manager
from ..auth_utils import create_access_token
from ..schemas import (
    AdminLoginRequest,
    AdminScoreUpdateRequest,
    AdminTeamUpdateRequest,
    AdminNoteUpdateRequest
)

router = APIRouter(prefix="/api/admin", tags=["Event Administration"])

ADMIN_PASSWORD = "JCEAIML"

async def verify_admin(
    authorization: Optional[str] = Header(None),
    x_admin_password: Optional[str] = Header(None)
) -> bool:
    """Verifies that the caller has provided the hardcoded admin password or valid admin JWT."""
    # Check direct password header
    if x_admin_password == ADMIN_PASSWORD:
        return True

    # Check Bearer token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token == ADMIN_PASSWORD:
            return True
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("role") == "admin":
                return True
        except Exception:
            pass

    raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin credentials")

@router.post("/login")
async def admin_login(req: AdminLoginRequest):
    """Authenticates admin using the hardcoded JCEAIML password."""
    if req.password.strip() != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid administrator credentials.")

    token = create_access_token({"sub": "admin", "role": "admin"})
    return {
        "status": "authenticated",
        "token": token,
        "message": "Admin session unlocked successfully."
    }

@router.get("/status")
async def get_system_status(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Team))
    teams = result.scalars().all()

    active_count = sum(1 for t in teams if t.status == "active")
    total_score = sum(t.score for t in teams)
    avg_score = round(total_score / len(teams), 1) if teams else 0

    db_size_kb = os.path.getsize(DB_PATH) / 1024 if DB_PATH.exists() else 0
    wal_path = DB_PATH.with_suffix(".db-wal")
    wal_size_kb = os.path.getsize(wal_path) / 1024 if wal_path.exists() else 0

    # Timer config
    timer_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
    timer_config = timer_res.scalar_one_or_none()

    return {
        "active_ws_clients": len(ws_manager.active_connections),
        "total_registered_teams": len(teams),
        "active_teams_count": active_count,
        "average_score": avg_score,
        "database_size_kb": round(db_size_kb, 2),
        "wal_journal_size_kb": round(wal_size_kb, 2),
        "timer": timer_config.value if timer_config else None,
        "database_file": str(DB_PATH)
    }

@router.get("/teams")
async def list_admin_teams(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Detailed view of all 100 teams with full telemetry, member names, and audit history."""
    stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
    res = await db.execute(stmt)
    teams = res.scalars().all()

    out = []
    for rank, t in enumerate(teams, start=1):
        out.append({
            "rank": rank,
            "id": t.id,
            "name": t.name,
            "member1": t.member1,
            "member2": t.member2,
            "score": t.score,
            "status": t.status,
            "current_stage": t.current_stage,
            "notes": t.notes,
            "last_ip": t.last_ip,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return {"teams": out, "total": len(out)}

@router.post("/teams/{team_id}/score")
async def update_team_score(
    team_id: int,
    req: AdminScoreUpdateRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Control points: add, deduct, or set points for any workstation team."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    old_score = team.score
    if req.new_score is not None:
        team.score = max(0, req.new_score)
    elif req.points_delta is not None:
        team.score = max(0, team.score + req.points_delta)

    # Record submission audit log if reason provided
    if req.reason:
        sub = TaskSubmission(
            team_id=team.id,
            stage=team.current_stage,
            task_key=f"admin_adjust_{datetime.utcnow().strftime('%H%M%S')}",
            points_awarded=team.score - old_score,
            metadata_json=f'{{"reason": "{req.reason}", "admin": true}}'
        )
        db.add(sub)

    await db.commit()
    await db.refresh(team)

    # Real-time broadcast to all 100 connected workstations
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "team_id": team.id,
        "team_name": team.name,
        "old_score": old_score,
        "new_score": team.score
    }

@router.put("/teams/{team_id}")
async def update_team_details(
    team_id: int,
    req: AdminTeamUpdateRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Edit team name, member names, stage, or notes."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    if req.name is not None and req.name.strip():
        # Check uniqueness if name changed
        clean_new_name = req.name.strip()
        if clean_new_name.lower() != team.name.lower():
            dup_res = await db.execute(select(Team).filter(Team.name == clean_new_name))
            if dup_res.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Team name already exists.")
            team.name = clean_new_name

    if req.member1 is not None:
        team.member1 = req.member1.strip()
    if req.member2 is not None:
        team.member2 = req.member2.strip()
    if req.current_stage is not None:
        team.current_stage = req.current_stage
    if req.notes is not None:
        team.notes = req.notes

    await db.commit()
    await db.refresh(team)

    # Real-time broadcast
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "team": {
            "id": team.id,
            "name": team.name,
            "member1": team.member1,
            "member2": team.member2,
            "score": team.score,
            "notes": team.notes,
            "current_stage": team.current_stage
        }
    }

@router.post("/teams/{team_id}/note")
async def update_team_note(
    team_id: int,
    req: AdminNoteUpdateRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Annotate a team with notes (e.g. issues, flags, disqualifications, awards)."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    team.notes = req.notes.strip() if req.notes else None
    await db.commit()
    await db.refresh(team)

    await ws_manager.broadcast_leaderboard(db)
    return {"status": "success", "team_id": team.id, "notes": team.notes}

@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: int,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Disqualify / delete a team from the competition."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    team_name = team.name
    await db.delete(team)
    await db.commit()

    await ws_manager.broadcast_leaderboard(db)
    return {"status": "success", "message": f"Team '{team_name}' removed."}

@router.get("/export/csv")
async def export_leaderboard_csv(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Export complete leaderboard & telemetry to CSV for spreadsheet analysis."""
    stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
    res = await db.execute(stmt)
    teams = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Rank",
        "Team Name",
        "Member 1",
        "Member 2",
        "Total Score",
        "Stage",
        "Status",
        "Last Workstation IP",
        "Admin Notes",
        "Started At (UTC)",
        "Last Activity (UTC)"
    ])

    for rank, t in enumerate(teams, start=1):
        writer.writerow([
            rank,
            t.name,
            t.member1 or "N/A",
            t.member2 or "N/A",
            t.score,
            f"Stage {t.current_stage}",
            t.status,
            t.last_ip or "Unknown",
            t.notes or "",
            t.started_at.strftime("%Y-%m-%d %H:%M:%S") if t.started_at else "",
            t.updated_at.strftime("%Y-%m-%d %H:%M:%S") if t.updated_at else ""
        ])

    csv_data = output.getvalue()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"cyphora_leaderboard_{timestamp}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/json")
async def export_leaderboard_json(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Export complete database state as JSON."""
    stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
    res = await db.execute(stmt)
    teams = res.scalars().all()

    data = [
        {
            "rank": rank,
            "id": t.id,
            "name": t.name,
            "member1": t.member1,
            "member2": t.member2,
            "score": t.score,
            "current_stage": t.current_stage,
            "status": t.status,
            "last_ip": t.last_ip,
            "notes": t.notes,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for rank, t in enumerate(teams, start=1)
    ]
    return {"export_timestamp": datetime.utcnow().isoformat(), "teams": data}

@router.post("/timer")
async def configure_event_timer(
    duration_minutes: int,
    action: str = "start", # "start" | "pause" | "reset"
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Sets or synchronizes the global event countdown timer across all workstations."""
    import json
    timer_payload = {
        "action": action,
        "duration_minutes": duration_minutes,
        "updated_at": datetime.utcnow().isoformat()
    }
    raw = json.dumps(timer_payload)

    res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
    cfg = res.scalar_one_or_none()
    if cfg:
        cfg.value = raw
    else:
        cfg = EventConfig(key="event_timer", value=raw)
        db.add(cfg)

    await db.commit()

    # Broadcast timer update over WebSocket to all 100 computers
    await ws_manager.broadcast({
        "event": "EVENT_TIMER_SYNC",
        "data": timer_payload
    })

    return {"status": "ok", "timer": timer_payload}

def execute_backup() -> dict:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"cyphora_backup_{timestamp}.db"

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(f"VACUUM INTO '{backup_file.as_posix()}'")
        conn.close()
        return {
            "status": "success",
            "backup_file": str(backup_file),
            "size_kb": round(os.path.getsize(backup_file) / 1024, 2)
        }
    except Exception as e:
        shutil.copy2(DB_PATH, backup_file)
        return {
            "status": "fallback_copy",
            "backup_file": str(backup_file),
            "error": str(e)
        }

@router.post("/backup")
async def trigger_backup(authorized: bool = Depends(verify_admin)):
    return execute_backup()
