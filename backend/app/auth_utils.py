from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from .database import get_db
from .models import Team

import bcrypt

security = HTTPBearer(auto_error=False)

def hash_pin(pin: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pin.encode("utf-8")[:72], salt).decode("utf-8")

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8")[:72], hashed_pin.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

async def get_current_team(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Team:
    # 1. Try Bearer JWT token first
    if credentials and credentials.credentials:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            raw_sub = payload.get("sub")
            if raw_sub is not None:
                try:
                    team_id = int(raw_sub)
                    result = await db.execute(select(Team).filter(Team.id == team_id))
                    team = result.scalar_one_or_none()
                    if team:
                        return team
                except (ValueError, TypeError):
                    pass
            team_claim = payload.get("team")
            if team_claim:
                from sqlalchemy import func
                res = await db.execute(select(Team).filter(func.lower(Team.name) == str(team_claim).strip().lower()))
                team = res.scalar_one_or_none()
                if team:
                    return team
        except Exception:
            pass

    # 2. Resilient fallback for 100-workstation LAN: Check X-Team-Id or X-Team-Name headers
    hdr_id = request.headers.get("X-Team-Id")
    if hdr_id:
        try:
            team_id = int(hdr_id)
            res = await db.execute(select(Team).filter(Team.id == team_id))
            team = res.scalar_one_or_none()
            if team:
                return team
        except Exception:
            pass

    hdr_name = request.headers.get("X-Team-Name")
    if hdr_name:
        clean_name = hdr_name.strip()
        from sqlalchemy import func
        res = await db.execute(select(Team).filter(func.lower(Team.name) == clean_name.lower()))
        team = res.scalar_one_or_none()
        if team:
            return team

        # Substring / prefix fallback (e.g. KB0 vs KB06)
        res = await db.execute(select(Team).filter(
            (func.lower(Team.name).like(f"{clean_name.lower()}%")) |
            (func.literal(clean_name.lower()).like(func.concat(func.lower(Team.name), '%')))
        ))
        team = res.scalars().first()
        if team:
            return team

    # 3. Workstation single-team fallback
    res_all = await db.execute(select(Team))
    all_teams = res_all.scalars().all()
    if len(all_teams) == 1:
        return all_teams[0]

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication token or team identifier required"
    )
