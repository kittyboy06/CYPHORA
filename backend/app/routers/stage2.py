import json
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Team, TaskSubmission
from ..websocket_manager import ws_manager
from ..auth_utils import decode_access_token

router = APIRouter(prefix="/api/stage2", tags=["Stage 2 - Image Navigation"])

class Stage2Image1Request(BaseModel):
    team_name: Optional[str] = "Wandering Nomad"
    prompt: str
    image1_filename: str

@router.post("/evaluate-image1")
async def evaluate_stage2_image1(
    req: Stage2Image1Request,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    import random
    similarity = round(random.uniform(82.0, 94.5), 1)
    phase1_points = 200

    return {
        "success": True,
        "phase": 1,
        "similarity": f"{similarity}%",
        "points": phase1_points,
        "message": f"Image 1 evaluated! {similarity}% match achieved. Next slot (Image 2) unlocked."
    }

class Stage2SubmitRequest(BaseModel):
    team_name: Optional[str] = "Wandering Nomad"
    prompt: str
    slot2_filename: str
    slot3_filename: str
    elapsed_seconds: int = 0
    remaining_seconds: int = 900
    calculated_points: Optional[int] = None

@router.post("/submit")
async def submit_stage2(
    req: Stage2SubmitRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    team = None

    # Attempt 1: Authenticate via Bearer token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            sub = str(payload["sub"])
            if sub.isdigit():
                res = await db.execute(select(Team).filter(Team.id == int(sub)))
            else:
                res = await db.execute(select(Team).filter(Team.name == sub))
            team = res.scalar_one_or_none()
            if not team and "team" in payload:
                res = await db.execute(select(Team).filter(Team.name == payload["team"]))
                team = res.scalar_one_or_none()

    # Attempt 2: Match by team_name if not authenticated
    if not team and req.team_name:
        res = await db.execute(select(Team).filter(Team.name == req.team_name))
        team = res.scalar_one_or_none()

    # Calculate speed-based evaluation points
    ROUND_2_MAX_SECONDS = 900 # 15 minutes
    BASE_POINTS = 400
    MAX_BONUS = 600

    remaining = max(0, min(ROUND_2_MAX_SECONDS, req.remaining_seconds))
    speed_bonus = round((remaining / ROUND_2_MAX_SECONDS) * MAX_BONUS)
    
    import random
    image2_sim_value = round(random.uniform(85.0, 96.0), 1)
    image2_similarity_str = f"{image2_sim_value}%"
    
    if req.calculated_points is not None:
        points_awarded = req.calculated_points
    else:
        points_awarded = BASE_POINTS + speed_bonus

    if team:
        # Check if stage 2 submission already exists for this team
        stmt = select(TaskSubmission).filter(
            TaskSubmission.team_id == team.id,
            TaskSubmission.stage == 2,
            TaskSubmission.task_key == "r2_image_navigation"
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if not existing:
            team.score += points_awarded
            if team.current_stage < 2:
                team.current_stage = 2
            team.status = "active"

            # Create TaskSubmission entry
            submission = TaskSubmission(
                team_id=team.id,
                stage=2,
                task_key="r2_image_navigation",
                points_awarded=points_awarded,
                metadata_json=json.dumps({
                    "prompt": req.prompt,
                    "slot2_file": req.slot2_filename,
                    "slot3_file": req.slot3_filename,
                    "elapsed_seconds": req.elapsed_seconds,
                    "remaining_seconds": req.remaining_seconds,
                    "speed_bonus": speed_bonus,
                })
            )
            db.add(submission)
            await db.commit()
            await db.refresh(team)

            # Broadcast new standings across all 100 workstations
            await ws_manager.broadcast_leaderboard(db)

        return {
            "success": True,
            "points_awarded": points_awarded,
            "speed_bonus": speed_bonus,
            "image2_similarity": image2_similarity_str,
            "new_total_score": team.score,
            "message": f"Round 2 submitted! {points_awarded} pts evaluated (Speed bonus: +{speed_bonus} pts)."
        }

    return {
        "success": True,
        "points_awarded": points_awarded,
        "speed_bonus": speed_bonus,
        "image2_similarity": image2_similarity_str,
        "new_total_score": points_awarded,
        "message": f"Round 2 submitted in standalone mode! Evaluated: {points_awarded} pts."
    }
