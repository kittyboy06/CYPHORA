from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..database import get_db
from ..models import Team
from ..schemas import TeamRegisterRequest, TeamLoginRequest, AuthResponse, TeamOut, to_team_out
from ..auth_utils import hash_pin, verify_pin, create_access_token, get_current_team
from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
async def register_team(req: TeamRegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    clean_name = req.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Team name cannot be empty.")
    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="Team name must be at least 2 characters.")
    
    clean_pin = (req.pin or "").strip()
    if len(clean_pin) < 4:
        raise HTTPException(status_code=400, detail="Please create a secret PIN with at least 4 characters/digits.")

    # Strict globally-unique team name check across all batches (case-insensitive)
    result = await db.execute(select(Team).filter(func.lower(Team.name) == clean_name.lower()))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Team name '{clean_name}' is already taken. If your team is returning or resuming, select 'Resume Expedition' and enter your PIN."
        )

    client_ip = request.client.host if request.client else None
    team = Team(
        name=clean_name,
        pin_hash=hash_pin(clean_pin),
        raw_pin=clean_pin,
        last_ip=client_ip,
        status="active",
        member1=req.member1.strip() if req.member1 else None,
        member2=req.member2.strip() if req.member2 else None,
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)

    # Broadcast updated explorer list to Admin and all workstations
    await ws_manager.broadcast_leaderboard(db)

    token = create_access_token({"sub": str(team.id), "team": team.name})
    return AuthResponse(token=token, team=to_team_out(team))

@router.post("/login", response_model=AuthResponse)
async def login_team(req: TeamLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    clean_name = req.name.strip()
    clean_pin = req.pin.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Please enter your team name.")
    if not clean_pin:
        raise HTTPException(status_code=400, detail="Please enter your team PIN.")

    # Case-insensitive lookup
    result = await db.execute(select(Team).filter(func.lower(Team.name) == clean_name.lower()))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{clean_name}' not found. Please verify the spelling or select 'Register New Team'."
        )

    if not verify_pin(clean_pin, team.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect PIN for team '{team.name}'. Please enter the PIN created during team registration."
        )

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
    """Auto registers if new team, or logs in if existing with verified PIN."""
    clean_name = req.name.strip()
    clean_pin = (req.pin or "").strip()
    result = await db.execute(select(Team).filter(func.lower(Team.name) == clean_name.lower()))
    team = result.scalar_one_or_none()

    client_ip = request.client.host if request.client else None

    if team:
        # Require PIN verification for existing team
        if clean_pin and not verify_pin(clean_pin, team.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Incorrect PIN for existing team '{team.name}'."
            )
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
        if len(clean_pin) < 4:
            raise HTTPException(status_code=400, detail="Please enter a secret PIN of at least 4 digits/characters.")
        team = Team(
            name=clean_name,
            pin_hash=hash_pin(clean_pin),
            raw_pin=clean_pin,
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

@router.get("/me", response_model=TeamOut)
async def get_my_team(current_team: Team = Depends(get_current_team)):
    """Fetches latest team profile directly from backend database."""
    return to_team_out(current_team)

