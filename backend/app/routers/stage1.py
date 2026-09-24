import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Team, TaskSubmission
from ..schemas import TaskSubmitRequest, TaskSubmitResponse
from ..auth_utils import get_current_team
from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/stage1", tags=["Stage 1 - OS Navigation"])

# Default tasks catalog for Stage 1 OS Navigation
STAGE1_TASKS = {
    "terminal_boot": {"title": "Terminal Initialization", "points": 50, "description": "Boot the simulated terminal shell"},
    "find_cipher_file": {"title": "Locate Encrypted File", "points": 100, "description": "Navigate filesystem to find secrets.txt"},
    "decode_base64": {"title": "Decode Access Key", "points": 150, "description": "Decode base64 encoded credential string"},
    "patch_permission": {"title": "Grant Execution Right", "points": 100, "description": "Fix script execute permission with chmod"},
    "run_payload": {"title": "Execute Cyber Signal", "points": 200, "description": "Launch the final OS navigation payload"}
}

@router.get("/tasks")
async def list_stage1_tasks(
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    # Fetch tasks completed by this team
    stmt = select(TaskSubmission.task_key).filter(
        TaskSubmission.team_id == current_team.id,
        TaskSubmission.stage == 1
    )
    result = await db.execute(stmt)
    completed_keys = set(result.scalars().all())

    task_list = []
    for key, data in STAGE1_TASKS.items():
        task_list.append({
            "key": key,
            "title": data["title"],
            "points": data["points"],
            "description": data["description"],
            "is_completed": key in completed_keys
        })

    return {
        "stage": 1,
        "team_score": current_team.score,
        "tasks": task_list
    }

@router.post("/submit", response_model=TaskSubmitResponse)
async def submit_stage1_task(
    req: TaskSubmitRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    if req.task_key not in STAGE1_TASKS:
        raise HTTPException(status_code=400, detail="Invalid task key.")

    # Check if already completed
    stmt = select(TaskSubmission).filter(
        TaskSubmission.team_id == current_team.id,
        TaskSubmission.stage == 1,
        TaskSubmission.task_key == req.task_key
    )
    res = await db.execute(stmt)
    already_done = res.scalar_one_or_none()
    if already_done:
        return TaskSubmitResponse(
            success=False,
            task_key=req.task_key,
            points_awarded=0,
            new_total_score=current_team.score,
            message="Task was already completed by your team."
        )

    task_info = STAGE1_TASKS[req.task_key]
    points = task_info["points"]

    # Award points
    current_team.score += points

    # Save submission audit
    submission = TaskSubmission(
        team_id=current_team.id,
        stage=1,
        task_key=req.task_key,
        points_awarded=points,
        metadata_json=json.dumps({"proof": req.proof}) if req.proof else None
    )
    db.add(submission)
    await db.commit()
    await db.refresh(current_team)

    # Real-time broadcast to all 100 computers
    await ws_manager.broadcast_leaderboard(db)

    return TaskSubmitResponse(
        success=True,
        task_key=req.task_key,
        points_awarded=points,
        new_total_score=current_team.score,
        message=f"Success! {points} points awarded for completing {task_info['title']}."
    )
