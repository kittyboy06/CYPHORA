from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Team
from ..schemas import TeamRegisterRequest, TeamLoginRequest, AuthResponse, TeamOut, to_team_out
from ..auth_utils import hash_pin, verify_pin, create_access_token
from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
async def register_team(req: TeamRegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    clean_name = req.name.strip()
    result = await db.execute(select(Team).filter(Team.name == clean_name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Team name is already taken. Try logging in.")

    client_ip = request.client.host if request.client else None
    team = Team(
        name=clean_name,
        pin_hash=hash_pin(req.pin),
        last_ip=client_ip,
        member1=req.member1.strip() if req.member1 else None,
        member2=req.member2.strip() if req.member2 else None,
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)

    # Broadcast updated explorer list
    await ws_manager.broadcast_leaderboard(db)

    token = create_access_token({"sub": str(team.id), "team": team.name})
    return AuthResponse(token=token, team=to_team_out(team))

@router.post("/login", response_model=AuthResponse)
async def login_team(req: TeamLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    clean_name = req.name.strip()
    result = await db.execute(select(Team).filter(Team.name == clean_name))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found. Please register first.")

    if not verify_pin(req.pin, team.pin_hash):
        raise HTTPException(status_code=401, detail="Invalid team PIN.")

    if request.client:
        team.last_ip = request.client.host
    team.status = "active"
    await db.commit()
    await db.refresh(team)

    # Broadcast updated explorer list
    await ws_manager.broadcast_leaderboard(db)

    token = create_access_token({"sub": str(team.id), "team": team.name})
    return AuthResponse(token=token, team=to_team_out(team))

@router.post("/quick-join", response_model=AuthResponse)
async def quick_join(req: TeamRegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Auto registers if new team, or logs in if existing with matching PIN."""
    clean_name = req.name.strip()
    result = await db.execute(select(Team).filter(Team.name == clean_name))
    team = result.scalar_one_or_none()

    client_ip = request.client.host if request.client else None

    if team:
        if not verify_pin(req.pin, team.pin_hash):
            raise HTTPException(status_code=401, detail="Team already exists with a different PIN.")
        team.last_ip = client_ip
        team.status = "active"
        if req.member1:
            team.member1 = req.member1.strip()
        if req.member2:
            team.member2 = req.member2.strip()
        await db.commit()
        await db.refresh(team)
        await ws_manager.broadcast_leaderboard(db)
    else:
        team = Team(
            name=clean_name,
            pin_hash=hash_pin(req.pin),
            last_ip=client_ip,
            status="active",
            member1=req.member1.strip() if req.member1 else None,
            member2=req.member2.strip() if req.member2 else None,
        )
        db.add(team)
        await db.commit()
        await db.refresh(team)
        await ws_manager.broadcast_leaderboard(db)

    token = create_access_token({"sub": str(team.id), "team": team.name})
    return AuthResponse(token=token, team=to_team_out(team))
