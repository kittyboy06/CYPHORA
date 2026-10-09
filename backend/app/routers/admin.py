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
from ..auth_utils import create_access_token, hash_pin
from ..schemas import (
    AdminLoginRequest,
    AdminScoreUpdateRequest,
    AdminTeamUpdateRequest,
    AdminNoteUpdateRequest,
    AdminRound2AccessRequest,
    AdminRound3AccessRequest,
    AdminPinResetRequest
)

router = APIRouter(prefix="/api/admin", tags=["Event Administration"])

ADMIN_PASSWORD = os.getenv("CYPHORA_ADMIN_PASSWORD", "JCEAIML")

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
        r1_s = getattr(t, 'round1_score', 0) or 0
        r2_s = getattr(t, 'round2_score', 0) or 0
        r3_s = getattr(t, 'round3_score', 0) or 0
        out.append({
            "rank": rank,
            "id": t.id,
            "name": t.name,
            "member1": t.member1,
            "member2": t.member2,
            "score": t.score,
            "round1_score": r1_s,
            "round2_score": r2_s,
            "round3_score": r3_s,
            "final_score": r2_s + r3_s,
            "status": "active" if ws_manager.is_team_connected(t.name) else t.status,
            "is_connected": ws_manager.is_team_connected(t.name),
            "current_stage": t.current_stage,
            "round2_unlocked": bool(getattr(t, 'round2_unlocked', 0)),
            "round3_unlocked": bool(getattr(t, 'round3_unlocked', 0)),
            "pin": getattr(t, 'raw_pin', None) or "—",
            "notes": t.notes,
            "last_ip": t.last_ip,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "round1_started_at": t.round1_started_at.isoformat() if getattr(t, 'round1_started_at', None) else None,
            "round2_started_at": t.round2_started_at.isoformat() if getattr(t, 'round2_started_at', None) else None,
            "round3_started_at": t.round3_started_at.isoformat() if getattr(t, 'round3_started_at', None) else None,
            "round1_completed_at": t.round1_completed_at.isoformat() if getattr(t, 'round1_completed_at', None) else None,
            "round2_completed_at": t.round2_completed_at.isoformat() if getattr(t, 'round2_completed_at', None) else None,
            "round3_completed_at": t.round3_completed_at.isoformat() if getattr(t, 'round3_completed_at', None) else None,
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
    delta = 0
    if req.new_score is not None:
        delta = req.new_score - team.score
        team.score = max(0, req.new_score)
    elif req.points_delta is not None:
        delta = req.points_delta
        team.score = max(0, team.score + req.points_delta)

    # Determine target round explicitly or from reason
    target_round = req.round
    if not target_round and req.reason:
        reason_lower = req.reason.lower()
        if "round 1" in reason_lower or "r1" in reason_lower or "hint" in reason_lower:
            target_round = 1
        elif "round 2" in reason_lower or "r2" in reason_lower or "image" in reason_lower:
            target_round = 2
        elif "round 3" in reason_lower or "r3" in reason_lower or "level" in reason_lower or "blockly" in reason_lower:
            target_round = 3

    if not target_round:
        target_round = team.current_stage or 1

    if target_round == 3:
        team.round3_score = max(0, (getattr(team, 'round3_score', 0) or 0) + delta)
    elif target_round == 2:
        team.round2_score = max(0, (getattr(team, 'round2_score', 0) or 0) + delta)
    else:
        team.round1_score = max(0, (getattr(team, 'round1_score', 0) or 0) + delta)

    # Mathematically lock total score to sum of individual round scores
    team.score = (getattr(team, 'round1_score', 0) or 0) + (getattr(team, 'round2_score', 0) or 0) + (getattr(team, 'round3_score', 0) or 0)

    # Record submission audit log if reason provided
    if req.reason:
        sub = TaskSubmission(
            team_id=team.id,
            stage=target_round,
            task_key=f"admin_adjust_{datetime.utcnow().strftime('%H%M%S')}",
            points_awarded=delta,
            metadata_json=f'{{"reason": "{req.reason}", "admin": true, "round": {target_round}}}'
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

@router.post("/teams/{team_id}/round2-access")
async def toggle_team_round2_access(
    team_id: int,
    req: AdminRound2AccessRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Authorize or revoke Round 2 access for a specific team."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    team.round2_unlocked = 1 if req.unlocked else 0
    if req.unlocked and team.current_stage < 2:
        team.current_stage = 2
    elif not req.unlocked and team.current_stage >= 2:
        team.current_stage = 1

    await db.commit()
    await db.refresh(team)

    await ws_manager.broadcast({
        "event": "ROUND2_ACCESS_UPDATE",
        "data": {
            "team_id": team.id,
            "team_name": team.name,
            "unlocked": bool(team.round2_unlocked)
        }
    })
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "team_id": team.id,
        "team_name": team.name,
        "round2_unlocked": bool(team.round2_unlocked),
        "current_stage": team.current_stage
    }

@router.post("/teams/{team_id}/pin")
async def reset_team_pin(
    team_id: int,
    req: AdminPinResetRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Reset or update a team's secret PIN."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    clean_pin = req.new_pin.strip()
    if len(clean_pin) < 4:
        raise HTTPException(status_code=400, detail="PIN must be at least 4 characters.")

    team.raw_pin = clean_pin
    team.pin_hash = hash_pin(clean_pin)
    await db.commit()
    await db.refresh(team)

    await ws_manager.broadcast_leaderboard(db)
    return {
        "status": "success",
        "team_id": team.id,
        "team_name": team.name,
        "new_pin": clean_pin
    }


@router.post("/round2/authorize-all")
async def authorize_all_round2(
    req: AdminRound2AccessRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Bulk authorize or revoke Round 2 access for all teams."""
    res = await db.execute(select(Team))
    teams = res.scalars().all()
    for t in teams:
        t.round2_unlocked = 1 if req.unlocked else 0
        if req.unlocked and t.current_stage < 2:
            t.current_stage = 2
        elif not req.unlocked and t.current_stage >= 2:
            t.current_stage = 1

    await db.commit()

    await ws_manager.broadcast({
        "event": "ROUND2_ACCESS_UPDATE_ALL",
        "data": {
            "unlocked": req.unlocked
        }
    })
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "count": len(teams),
        "unlocked": req.unlocked
    }

@router.post("/teams/{team_id}/round3-access")
async def toggle_team_round3_access(
    team_id: int,
    req: AdminRound3AccessRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Authorize or revoke Round 3 access for a specific team."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    team.round3_unlocked = 1 if req.unlocked else 0
    if req.unlocked and team.current_stage < 3:
        team.current_stage = 3
    elif not req.unlocked and team.current_stage >= 3:
        team.current_stage = 2

    await db.commit()
    await db.refresh(team)

    await ws_manager.broadcast({
        "event": "ROUND3_ACCESS_UPDATE",
        "data": {
            "team_id": team.id,
            "team_name": team.name,
            "unlocked": bool(team.round3_unlocked)
        }
    })
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "team_id": team.id,
        "team_name": team.name,
        "round3_unlocked": bool(team.round3_unlocked),
        "current_stage": team.current_stage
    }

@router.post("/round3/authorize-all")
async def authorize_all_round3(
    req: AdminRound3AccessRequest,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Bulk authorize or revoke Round 3 access for all teams."""
    res = await db.execute(select(Team))
    teams = res.scalars().all()
    for t in teams:
        t.round3_unlocked = 1 if req.unlocked else 0
        if req.unlocked and t.current_stage < 3:
            t.current_stage = 3
        elif not req.unlocked and t.current_stage >= 3:
            t.current_stage = 2

    await db.commit()

    await ws_manager.broadcast({
        "event": "ROUND3_ACCESS_UPDATE_ALL",
        "data": {
            "unlocked": req.unlocked
        }
    })
    await ws_manager.broadcast_leaderboard(db)

    return {
        "status": "success",
        "count": len(teams),
        "unlocked": req.unlocked
    }


@router.get("/teams/{team_id}/submissions")
async def get_team_submissions(
    team_id: int,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full audit trail of task submissions, points awarded, and hints used."""
    import json
    stmt = select(TaskSubmission).filter(TaskSubmission.team_id == team_id).order_by(TaskSubmission.submitted_at)
    res = await db.execute(stmt)
    subs = res.scalars().all()
    out = []
    for s in subs:
        meta = {}
        if s.metadata_json:
            try:
                meta = json.loads(s.metadata_json)
            except Exception:
                meta = {"raw": s.metadata_json}
        out.append({
            "id": s.id,
            "stage": s.stage,
            "task_key": s.task_key,
            "points_awarded": s.points_awarded,
            "metadata": meta,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
        })
    return {"team_id": team_id, "submissions": out, "total_submissions": len(out)}

@router.get("/submissions/feed")
async def get_all_submissions_feed(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = 200
):
    """Retrieve global real-time activity/audit feed across all teams with details."""
    import json
    stmt = (
        select(TaskSubmission, Team.name.label("team_name"))
        .join(Team, TaskSubmission.team_id == Team.id, isouter=True)
        .order_by(desc(TaskSubmission.submitted_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    rows = res.all()
    feed = []
    for sub, team_name in rows:
        meta = {}
        if sub.metadata_json:
            try:
                meta = json.loads(sub.metadata_json)
            except Exception:
                meta = {"raw": sub.metadata_json}
        feed.append({
            "id": sub.id,
            "team_id": sub.team_id,
            "team_name": team_name or f"Team #{sub.team_id}",
            "stage": sub.stage,
            "task_key": sub.task_key,
            "points_awarded": sub.points_awarded,
            "metadata": meta,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None
        })
    return {"feed": feed, "count": len(feed)}

@router.post("/reset-leaderboard")
async def reset_leaderboard(
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Purges all mock and test team data, resetting to 0 real participants."""
    from sqlalchemy import delete
    await db.execute(delete(TaskSubmission))
    await db.execute(delete(Team))
    await db.commit()

    await ws_manager.broadcast_leaderboard(db)
    return {"status": "success", "message": "Leaderboard reset. All mock data cleared."}

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
        "Round 1 Score",
        "Round 2 Score",
        "Round 3 Score",
        "Final Score (R2+R3)",
        "Total Score",
        "Stage",
        "Status",
        "Last Workstation IP",
        "Admin Notes",
        "Started At (UTC)",
        "Last Activity (UTC)"
    ])

    for rank, t in enumerate(teams, start=1):
        r1_s = getattr(t, 'round1_score', 0) or 0
        r2_s = getattr(t, 'round2_score', 0) or 0
        r3_s = getattr(t, 'round3_score', 0) or 0
        writer.writerow([
            rank,
            t.name,
            t.member1 or "N/A",
            t.member2 or "N/A",
            r1_s,
            r2_s,
            r3_s,
            r2_s + r3_s,
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
            "round1_score": getattr(t, 'round1_score', 0) or 0,
            "round2_score": getattr(t, 'round2_score', 0) or 0,
            "round3_score": getattr(t, 'round3_score', 0) or 0,
            "final_score": (getattr(t, 'round2_score', 0) or 0) + (getattr(t, 'round3_score', 0) or 0),
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

def _default_timer(round_num: int):
    mins = 60 if round_num == 1 else 30
    return {
        "round": round_num,
        "action": "stopped",
        "duration_minutes": mins,
        "remaining_seconds": mins * 60,
        "ends_at": None,
        "started_at": None,
        "updated_at": datetime.utcnow().isoformat()
    }

async def _fetch_timer(db: AsyncSession, round_num: int) -> dict:
    import json
    from datetime import datetime
    key = f"event_timer_round_{round_num}"
    res = await db.execute(select(EventConfig).filter(EventConfig.key == key))
    cfg = res.scalar_one_or_none()
    d = None
    if cfg and cfg.value:
        try:
            d = json.loads(cfg.value)
            d["round"] = round_num
        except Exception:
            pass

    if not d and round_num == 1:
        res_leg = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
        cfg_leg = res_leg.scalar_one_or_none()
        if cfg_leg and cfg_leg.value:
            try:
                d = json.loads(cfg_leg.value)
                d["round"] = 1
            except Exception:
                pass

    if not d:
        d = _default_timer(round_num)

    # If running, calculate live remaining seconds
    if d.get("action") == "start" and d.get("ends_at"):
        try:
            ends_at_dt = datetime.fromisoformat(d["ends_at"])
            now = datetime.utcnow()
            rem = int((ends_at_dt - now).total_seconds())
            if rem <= 0:
                d["action"] = "expired"
                d["remaining_seconds"] = 0
            else:
                d["remaining_seconds"] = rem
        except Exception:
            pass

    return d

@router.get("/timer")
async def get_admin_event_timer(
    round: Optional[int] = None,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    r1 = await _fetch_timer(db, 1)
    r2 = await _fetch_timer(db, 2)
    r3 = await _fetch_timer(db, 3)
    if round == 1:
        return r1
    if round == 2:
        return r2
    if round == 3:
        return r3

    return {
        "round1": r1,
        "round2": r2,
        "round3": r3,
        **r1,
        "all_timers": {
            "round1": r1,
            "round2": r2,
            "round3": r3
        }
    }

@router.post("/timer")
async def configure_event_timer(
    round: int = 1,
    duration_minutes: Optional[int] = None,
    action: str = "set", # "start" | "pause" | "resume" | "reset" | "set" | "configured"
    remaining_seconds: Optional[int] = None,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Configures or controls the duration and countdown for Round 1, Round 2, or Round 3.
    Supports start, pause, resume, reset, and set actions broadcasted in real time.
    """
    import json
    from datetime import datetime, timedelta

    round_num = int(round) if int(round) in (1, 2, 3) else 1
    now = datetime.utcnow()

    existing_timer = await _fetch_timer(db, round_num)
    cur_mins = duration_minutes if duration_minutes is not None else existing_timer.get("duration_minutes", 60 if round_num == 1 else 30)

    mins = cur_mins or (60 if round_num == 1 else (15 if round_num == 2 else 30))
    if action == "reset":
        mins = 60 if round_num == 1 else (15 if round_num == 2 else 30)
        timer_payload = {
            "round": round_num,
            "action": "configured",
            "duration_minutes": mins,
            "remaining_seconds": mins * 60,
            "ends_at": None,
            "started_at": None,
            "updated_at": now.isoformat()
        }
    elif action == "pause":
        timer_payload = {
            "round": round_num,
            "action": "pause",
            "duration_minutes": mins,
            "remaining_seconds": mins * 60,
            "ends_at": None,
            "started_at": None,
            "updated_at": now.isoformat()
        }
    elif action == "resume":
        timer_payload = {
            "round": round_num,
            "action": "configured",
            "duration_minutes": mins,
            "remaining_seconds": mins * 60,
            "ends_at": None,
            "started_at": None,
            "updated_at": now.isoformat()
        }
    else:  # "set" | "configured" | "start"
        timer_payload = {
            "round": round_num,
            "action": "configured",
            "duration_minutes": mins,
            "remaining_seconds": mins * 60,
            "ends_at": None,
            "started_at": None,
            "updated_at": now.isoformat()
        }

    raw = json.dumps(timer_payload)
    key = f"event_timer_round_{round_num}"
    res = await db.execute(select(EventConfig).filter(EventConfig.key == key))
    cfg = res.scalar_one_or_none()
    if cfg:
        cfg.value = raw
    else:
        cfg = EventConfig(key=key, value=raw)
        db.add(cfg)

    if round_num == 1:
        res_leg = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
        cfg_leg = res_leg.scalar_one_or_none()
        if cfg_leg:
            cfg_leg.value = raw
        else:
            db.add(EventConfig(key="event_timer", value=raw))

    await db.commit()

    r1 = await _fetch_timer(db, 1)
    r2 = await _fetch_timer(db, 2)
    r3 = await _fetch_timer(db, 3)

    # Broadcast timer update over WebSocket to all 100 computers
    await ws_manager.broadcast({
        "event": "EVENT_TIMER_SYNC",
        "data": {
            **timer_payload,
            "all_timers": {
                "round1": r1,
                "round2": r2,
                "round3": r3
            }
        }
    })

    return {
        "status": "ok",
        "timer": timer_payload,
        "round": round_num,
        "all_timers": {
            "round1": r1,
            "round2": r2,
            "round3": r3
        }
    }

@router.post("/teams/{team_id}/timer-reset")
async def reset_team_round_timer(
    team_id: int,
    round_num: Optional[int] = None,
    authorized: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Resets the timing stamps for a team so they can restart their round timer."""
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    target = round_num or team.current_stage or 1
    now = datetime.utcnow()
    if target == 1:
        team.round1_started_at = now
        team.started_at = now
        team.round1_completed_at = None
    elif target == 2:
        team.round2_started_at = now
        team.round2_completed_at = None
    elif target == 3:
        team.round3_started_at = now
        team.round3_completed_at = None

    await db.commit()
    await ws_manager.broadcast_leaderboard(db)
    return {"status": "success", "message": f"Team {team.name} Round {target} timer reset to current time."}

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
