from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from ..database import get_db
from ..models import Team
from ..schemas import TeamOut, LeaderboardResponse, LeaderboardItem, to_team_out
from ..auth_utils import get_current_team

router = APIRouter(prefix="/api/teams", tags=["Teams"])

@router.get("/me", response_model=TeamOut)
async def get_my_team(current_team: Team = Depends(get_current_team)):
    return to_team_out(current_team)

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
    result = await db.execute(stmt)
    teams = result.scalars().all()

    items = []
    for rank, t in enumerate(teams, start=1):
        items.append(LeaderboardItem(
            rank=rank,
            name=t.name,
            score=t.score,
            status=t.status,
            current_stage=t.current_stage
        ))

    return LeaderboardResponse(teams=items, total_explorers=len(items))

@router.post("/heartbeat")
async def team_heartbeat(current_team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    current_team.status = "active"
    await db.commit()
    return {"status": "ok"}
