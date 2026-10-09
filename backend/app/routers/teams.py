from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

import json
from ..database import get_db
from ..models import Team, EventConfig
from datetime import datetime
from ..schemas import TeamOut, LeaderboardResponse, LeaderboardItem, to_team_out, Stage3SubmitRequest, RoundStartRequest
from ..auth_utils import get_current_team

from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/teams", tags=["Teams"])

@router.get("/me", response_model=TeamOut)
async def get_my_team(current_team: Team = Depends(get_current_team)):
    return to_team_out(current_team)

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
    result = await db.execute(stmt)
    teams = result.scalars().all()

    # Fetch event timers for Round 1, Round 2 & Round 3 with live calculation
    t1 = {"round": 1, "action": "stopped", "duration_minutes": 60, "remaining_seconds": 3600}
    t2 = {"round": 2, "action": "stopped", "duration_minutes": 30, "remaining_seconds": 1800}
    t3 = {"round": 3, "action": "stopped", "duration_minutes": 30, "remaining_seconds": 1800}

    now = datetime.utcnow()

    def _calc_live(d):
        if d.get("action") == "start" and d.get("ends_at"):
            try:
                ends_at_dt = datetime.fromisoformat(d["ends_at"])
                rem = int((ends_at_dt - now).total_seconds())
                if rem <= 0:
                    d["action"] = "expired"
                    d["remaining_seconds"] = 0
                else:
                    d["remaining_seconds"] = rem
            except Exception:
                pass
        return d

    try:
        t1_res = await db.execute(select(EventConfig).filter(EventConfig.key.in_(["event_timer_round_1", "event_timer"])))
        for row in t1_res.scalars().all():
            if row and row.value:
                try:
                    t1 = _calc_live(json.loads(row.value))
                    t1["round"] = 1
                    break
                except Exception:
                    pass
    except Exception:
        pass

    try:
        t2_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer_round_2"))
        t2_row = t2_res.scalar_one_or_none()
        if t2_row and t2_row.value:
            try:
                t2 = _calc_live(json.loads(t2_row.value))
                t2["round"] = 2
            except Exception:
                pass
    except Exception:
        pass

    try:
        t3_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer_round_3"))
        t3_row = t3_res.scalar_one_or_none()
        if t3_row and t3_row.value:
            try:
                t3 = _calc_live(json.loads(t3_row.value))
                t3["round"] = 3
            except Exception:
                pass
    except Exception:
        pass

    items = []
    for rank, t in enumerate(teams, start=1):
        r1_s = getattr(t, 'round1_score', 0) or 0
        r2_s = getattr(t, 'round2_score', 0) or 0
        r3_s = getattr(t, 'round3_score', 0) or 0
        items.append(LeaderboardItem(
            rank=rank,
            id=t.id,
            name=t.name,
            member1=t.member1,
            member2=t.member2,
            score=t.score,
            round1_score=r1_s,
            round2_score=r2_s,
            round3_score=r3_s,
            final_score=r2_s + r3_s,
            status="active" if ws_manager.is_team_connected(t.name) else t.status,
            is_connected=ws_manager.is_team_connected(t.name),
            current_stage=t.current_stage,
            round2_unlocked=bool(getattr(t, 'round2_unlocked', 0)),
            round3_unlocked=bool(getattr(t, 'round3_unlocked', 0)),
            notes=t.notes,
            last_ip=t.last_ip,
            started_at=t.started_at.isoformat() if t.started_at else None,
            round1_started_at=t.round1_started_at.isoformat() if getattr(t, 'round1_started_at', None) else None,
            round2_started_at=t.round2_started_at.isoformat() if getattr(t, 'round2_started_at', None) else None,
            round3_started_at=t.round3_started_at.isoformat() if getattr(t, 'round3_started_at', None) else None,
            round1_completed_at=t.round1_completed_at.isoformat() if getattr(t, 'round1_completed_at', None) else None,
            round2_completed_at=t.round2_completed_at.isoformat() if getattr(t, 'round2_completed_at', None) else None,
            round3_completed_at=t.round3_completed_at.isoformat() if getattr(t, 'round3_completed_at', None) else None,
            updated_at=t.updated_at.isoformat() if t.updated_at else None,
        ))

    return LeaderboardResponse(
        teams=items,
        total_explorers=len(items),
        timer=t1,
        timers={"round1": t1, "round2": t2, "round3": t3}
    )

@router.get("/timer")
async def get_event_timer(round: int = None, db: AsyncSession = Depends(get_db)):
    t1 = {"round": 1, "action": "configured", "duration_minutes": 60, "remaining_seconds": 3600}
    t2 = {"round": 2, "action": "configured", "duration_minutes": 30, "remaining_seconds": 1800}
    t3 = {"round": 3, "action": "configured", "duration_minutes": 30, "remaining_seconds": 1800}

    now = datetime.utcnow()

    def _calc_live(d):
        dur = d.get("duration_minutes") or (60 if d.get("round") == 1 else 30)
        d["duration_minutes"] = dur
        if d.get("action") == "start" and d.get("ends_at"):
            try:
                ends_at_dt = datetime.fromisoformat(d["ends_at"])
                rem = int((ends_at_dt - now).total_seconds())
                if rem <= 0:
                    d["action"] = "expired"
                    d["remaining_seconds"] = 0
                else:
                    d["remaining_seconds"] = rem
            except Exception:
                d["remaining_seconds"] = dur * 60
        else:
            d["remaining_seconds"] = dur * 60
        return d

    try:
        r1_res = await db.execute(select(EventConfig).filter(EventConfig.key.in_(["event_timer_round_1", "event_timer"])))
        for row in r1_res.scalars().all():
            if row and row.value:
                try:
                    t1 = _calc_live(json.loads(row.value))
                    t1["round"] = 1
                    break
                except Exception:
                    pass
    except Exception:
        pass

    try:
        r2_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer_round_2"))
        row2 = r2_res.scalar_one_or_none()
        if row2 and row2.value:
            try:
                t2 = _calc_live(json.loads(row2.value))
                t2["round"] = 2
            except Exception:
                pass
    except Exception:
        pass

    try:
        r3_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer_round_3"))
        row3 = r3_res.scalar_one_or_none()
        if row3 and row3.value:
            try:
                t3 = _calc_live(json.loads(row3.value))
                t3["round"] = 3
            except Exception:
                pass
    except Exception:
        pass

    if round == 1:
        return t1
    if round == 2:
        return t2
    if round == 3:
        return t3
    return {"round1": t1, "round2": t2, "round3": t3, **t1, "all_timers": {"round1": t1, "round2": t2, "round3": t3}}

@router.post("/timer/start")
async def report_round_start(
    req: RoundStartRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    round_num = req.round or 1
    if round_num == 1:
        if not current_team.round1_started_at:
            current_team.round1_started_at = now
        if not current_team.started_at:
            current_team.started_at = current_team.round1_started_at
    elif round_num == 2:
        if not current_team.round2_started_at:
            current_team.round2_started_at = now
        if not current_team.round1_completed_at:
            current_team.round1_completed_at = now
    elif round_num == 3:
        if not current_team.round3_started_at:
            current_team.round3_started_at = now
        if not current_team.round2_completed_at:
            current_team.round2_completed_at = now

    current_team.status = "active"
    await db.commit()
    await ws_manager.broadcast_leaderboard(db)
    return {"status": "ok", "round": round_num}

@router.post("/heartbeat")
async def team_heartbeat(current_team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    current_team.status = "active"
    await db.commit()
    await ws_manager.broadcast_leaderboard(db)
    return {"status": "ok"}

@router.post("/stage3/submit")
async def submit_stage3_level(
    req: Stage3SubmitRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    from ..models import TaskSubmission
    task_key = f"r3_level_{req.level}"
    # Check if this level already completed
    stmt = select(TaskSubmission).filter(
        TaskSubmission.team_id == current_team.id,
        TaskSubmission.stage == 3,
        TaskSubmission.task_key == task_key
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()
    points = min(500, max(0, req.score))

    meta_dict = {
        "level": req.level,
        "blocks_used": req.blocks_used,
        "efficiency": req.efficiency,
        "score": points
    }
    if req.time_used_seconds is not None:
        meta_dict["time_used_seconds"] = req.time_used_seconds
    if req.block_score is not None:
        meta_dict["block_score"] = req.block_score
    if req.time_score is not None:
        meta_dict["time_score"] = req.time_score

    if existing:
        # If the new attempt scored higher, update points and metadata
        if points > (existing.points_awarded or 0):
            existing.points_awarded = points
            existing.metadata_json = json.dumps(meta_dict)
            await db.flush()

            # Recalculate total round3 score across all stage 3 submissions
            stmt_all = select(TaskSubmission).filter(
                TaskSubmission.team_id == current_team.id,
                TaskSubmission.stage == 3
            )
            all_r3 = (await db.execute(stmt_all)).scalars().all()
            actual_r3_total = sum(s.points_awarded or 0 for s in all_r3)

            current_team.round3_score = actual_r3_total
            current_team.score = (getattr(current_team, 'round1_score', 0) or 0) + (getattr(current_team, 'round2_score', 0) or 0) + (current_team.round3_score or 0)
            current_team.current_stage = 3
            current_team.status = "active"
            await db.commit()
            await db.refresh(current_team)
            await ws_manager.broadcast_leaderboard(db)

            return {
                "status": "success",
                "level": req.level,
                "points_awarded": points,
                "new_score": current_team.score,
                "new_total_score": current_team.score,
                "round3_score": current_team.round3_score
            }

        return {
            "status": "already_submitted",
            "message": f"Level {req.level} already recorded for team {current_team.name}.",
            "points_awarded": existing.points_awarded,
            "new_score": current_team.score,
            "new_total_score": current_team.score,
            "round3_score": current_team.round3_score or 0
        }

    # Brand new level completion
    sub = TaskSubmission(
        team_id=current_team.id,
        stage=3,
        task_key=task_key,
        points_awarded=points,
        metadata_json=json.dumps(meta_dict)
    )
    db.add(sub)
    await db.flush()

    # Recalculate round3_score from all stage 3 submissions for accuracy
    stmt_all = select(TaskSubmission).filter(
        TaskSubmission.team_id == current_team.id,
        TaskSubmission.stage == 3
    )
    all_r3 = (await db.execute(stmt_all)).scalars().all()
    actual_r3_total = sum(s.points_awarded or 0 for s in all_r3)

    current_team.round3_score = actual_r3_total
    current_team.score = (getattr(current_team, 'round1_score', 0) or 0) + (getattr(current_team, 'round2_score', 0) or 0) + (current_team.round3_score or 0)
    current_team.current_stage = 3
    current_team.status = "active"
    await db.commit()
    await db.refresh(current_team)

    await ws_manager.broadcast_leaderboard(db)
    return {
        "status": "success",
        "level": req.level,
        "points_awarded": points,
        "new_score": current_team.score,
        "new_total_score": current_team.score,
        "round3_score": current_team.round3_score
    }
