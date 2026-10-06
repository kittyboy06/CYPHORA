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

    # Fetch event timer state
    timer_data = None
    try:
        t_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
        t_row = t_res.scalar_one_or_none()
        if t_row and t_row.value:
            timer_data = json.loads(t_row.value)
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

    return LeaderboardResponse(teams=items, total_explorers=len(items), timer=timer_data)

@router.get("/timer")
async def get_event_timer(db: AsyncSession = Depends(get_db)):
    try:
        t_res = await db.execute(select(EventConfig).filter(EventConfig.key == "event_timer"))
        t_row = t_res.scalar_one_or_none()
        if t_row and t_row.value:
            return json.loads(t_row.value)
    except Exception:
        pass
    return {"action": "reset", "duration_minutes": 60, "remaining_seconds": 3600}

@router.post("/heartbeat")
async def team_heartbeat(current_team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    current_team.status = "active"
    await db.commit()
    await ws_manager.broadcast_leaderboard(db)
    return {"status": "ok"}
