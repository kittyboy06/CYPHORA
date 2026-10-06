from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

import json
from ..database import get_db
from ..models import Team, EventConfig
from ..schemas import TeamOut, LeaderboardResponse, LeaderboardItem, to_team_out
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

    # Fetch event timers for Round 1 & Round 2
    timer_r1 = {"round": 1, "action": "reset", "duration_minutes": 60, "remaining_seconds": 3600}
    timer_r2 = {"round": 2, "action": "reset", "duration_minutes": 30, "remaining_seconds": 1800}
    try:
        t1_res = await db.execute(select(EventConfig).filter(EventConfig.key.in_(["event_timer_round_1", "event_timer"])))
        for row in t1_res.scalars().all():
            if row and row.value:
                try:
                    timer_r1 = json.loads(row.value)
                    timer_r1["round"] = 1
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
                timer_r2 = json.loads(t2_row.value)
                timer_r2["round"] = 2
            except Exception:
                pass
    except Exception:
        pass

    items = []
    for rank, t in enumerate(teams, start=1):
        items.append(LeaderboardItem(
            rank=rank,
            id=t.id,
            name=t.name,
            member1=t.member1,
            member2=t.member2,
            score=t.score,
            status=t.status,
            current_stage=t.current_stage,
            round2_unlocked=bool(getattr(t, 'round2_unlocked', 0) or (t.current_stage and t.current_stage >= 2)),
            notes=t.notes,
            last_ip=t.last_ip,
            started_at=t.started_at.isoformat() if t.started_at else None,
            updated_at=t.updated_at.isoformat() if t.updated_at else None,
        ))

    return LeaderboardResponse(
        teams=items,
        total_explorers=len(items),
        timer=timer_r1,
        timers={"round1": timer_r1, "round2": timer_r2}
    )

@router.get("/timer")
async def get_event_timer(round: int = None, db: AsyncSession = Depends(get_db)):
    t1 = {"round": 1, "action": "reset", "duration_minutes": 60, "remaining_seconds": 3600}
    t2 = {"round": 2, "action": "reset", "duration_minutes": 30, "remaining_seconds": 1800}

    try:
        r1_res = await db.execute(select(EventConfig).filter(EventConfig.key.in_(["event_timer_round_1", "event_timer"])))
        for row in r1_res.scalars().all():
            if row and row.value:
                try:
                    t1 = json.loads(row.value)
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
                t2 = json.loads(row2.value)
                t2["round"] = 2
            except Exception:
                pass
    except Exception:
        pass

    if round == 1:
        return t1
    if round == 2:
        return t2
    return {"round1": t1, "round2": t2, **t1, "all_timers": {"round1": t1, "round2": t2}}

@router.post("/heartbeat")
async def team_heartbeat(current_team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    current_team.status = "active"
    await db.commit()
    await ws_manager.broadcast_leaderboard(db)
    return {"status": "ok"}
