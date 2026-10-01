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

# Comprehensive catalog for Round 1 Investigation Tasks (12 Tasks across 4 Tiers)
STAGE1_TASKS = {
    "r1_t01": {
        "title": "Task 01 — Encoded Message",
        "points": 50,
        "stage": 1,
        "description": "Convert the encoded value into a human-readable format",
        "accepted": ["HIDE"]
    },
    "r1_t02": {
        "title": "Task 02 — File Information",
        "points": 50,
        "stage": 1,
        "description": "Investigate stored metadata and enter the recorded author",
        "accepted": ["ARLO", "DR. ARLO VANCE", "DR ARLO VANCE", "ARLO VANCE"]
    },
    "r1_t03": {
        "title": "Task 03 — Image Message",
        "points": 50,
        "stage": 1,
        "description": "Analyze the visual evidence and recover the secret designation",
        "accepted": ["SECTOR-7", "SECTOR 7", "SECTOR7"]
    },
    "r1_t04": {
        "title": "Task 04 — Ordering / Reasoning",
        "points": 75,
        "stage": 2,
        "description": "Trace log timestamps and decode the earliest record's color code to readable text",
        "accepted": ["YELLOW", "#FFFF00", "FFFF00"]
    },
    "r1_t05": {
        "title": "Task 05 — File Comparison",
        "points": 75,
        "stage": 2,
        "description": "Compare data revisions and extract the changed checksum hash",
        "accepted": ["9941"]
    },
    "r1_t06": {
        "title": "Task 06 — The Fragmented Password",
        "points": 75,
        "stage": 2,
        "description": "Reassemble fragmented key tokens across the workstation",
        "accepted": ["JUMP"]
    },
    "r1_t07": {
        "title": "Task 07 — Metadata → Conversion",
        "points": 100,
        "stage": 3,
        "description": "Follow metadata pointers and convert encoded payload",
        "accepted": ["HELP"]
    },
    "r1_t08": {
        "title": "Task 08 — Hidden Evidence",
        "points": 100,
        "stage": 3,
        "description": "Extract hidden transmission parameters and frequency pin",
        "accepted": ["7314"]
    },
    "r1_t09": {
        "title": "Task 09 — The Evidence Network",
        "points": 100,
        "stage": 3,
        "description": "Correlate multiple network traces and determine host node ID",
        "accepted": ["17"]
    },
    "r1_t10": {
        "title": "Task 10 — Diff → Interpret → Convert",
        "points": 150,
        "stage": 4,
        "description": "Multi-stage diff inspection, interpretation, and decoding",
        "accepted": ["JUMP"]
    },
    "r1_t11": {
        "title": "Task 11 — Cross-Application Investigation",
        "points": 150,
        "stage": 4,
        "description": "Synthesize audio, image, and text evidence into unified access phrase",
        "accepted": ["SHIFT"]
    },
    "r1_t12": {
        "title": "Task 12 — Final Boss: Trace the Transfer",
        "points": 150,
        "stage": 4,
        "description": "Trace full workstation transfer logs and unlock the core memory fragment",
        "accepted": ["SYMPO"]
    },
    # Backward compatibility aliases
    "terminal_boot": {"title": "Terminal Initialization", "points": 50, "stage": 1, "description": "Boot the simulated terminal shell", "accepted": []},
    "find_cipher_file": {"title": "Locate Encrypted File", "points": 100, "stage": 1, "description": "Navigate filesystem to find secrets.txt", "accepted": []},
    "decode_base64": {"title": "Decode Access Key", "points": 150, "stage": 1, "description": "Decode base64 encoded credential string", "accepted": []},
    "patch_permission": {"title": "Grant Execution Right", "points": 100, "stage": 1, "description": "Fix script execute permission with chmod", "accepted": []},
    "run_payload": {"title": "Execute Cyber Signal", "points": 200, "stage": 1, "description": "Launch the final OS navigation payload", "accepted": []}
}

def resolve_task_key(raw_key: str):
    clean = raw_key.strip().lower()
    if clean in STAGE1_TASKS:
        return clean
    # Try with or without r1_ prefix
    for k in STAGE1_TASKS:
        if k == clean or k.replace("r1_", "") == clean or clean.endswith(k):
            return k
    return None

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
    # Primary 12 tasks in order
    for i in range(1, 13):
        key = f"r1_t{i:02d}"
        data = STAGE1_TASKS.get(key)
        if data:
            task_list.append({
                "key": key,
                "title": data["title"],
                "points": data["points"],
                "stage": data.get("stage", 1),
                "description": data["description"],
                "is_completed": key in completed_keys
            })

    return {
        "stage": current_team.current_stage,
        "team_score": current_team.score,
        "completed_count": len([t for t in task_list if t["is_completed"]]),
        "total_tasks": len(task_list),
        "tasks": task_list
    }

@router.post("/submit", response_model=TaskSubmitResponse)
async def submit_stage1_task(
    req: TaskSubmitRequest,
    current_team: Team = Depends(get_current_team),
    db: AsyncSession = Depends(get_db)
):
    resolved_key = resolve_task_key(req.task_key)
    if not resolved_key:
        raise HTTPException(status_code=400, detail=f"Invalid task key: '{req.task_key}'")

    task_info = STAGE1_TASKS[resolved_key]

    # Validate answer if accepted answers list is defined and proof was sent
    accepted = task_info.get("accepted", [])
    if accepted and req.proof:
        clean_proof = req.proof.strip().upper()
        if clean_proof not in [a.strip().upper() for a in accepted]:
            return TaskSubmitResponse(
                success=False,
                task_key=resolved_key,
                points_awarded=0,
                new_total_score=current_team.score,
                message="Incorrect submission. Verify evidence and try again."
            )

    # Check if already completed
    stmt = select(TaskSubmission).filter(
        TaskSubmission.team_id == current_team.id,
        TaskSubmission.stage == 1,
        TaskSubmission.task_key == resolved_key
    )
    res = await db.execute(stmt)
    already_done = res.scalar_one_or_none()
    if already_done:
        return TaskSubmitResponse(
            success=True,
            task_key=resolved_key,
            points_awarded=0,
            new_total_score=current_team.score,
            message="Task was already completed by your team."
        )

    points = task_info["points"]

    # Award points & update stage
    current_team.score += points
    current_team.status = "active"
    target_stage = task_info.get("stage", 1)
    if target_stage > current_team.current_stage:
        current_team.current_stage = target_stage

    # Save submission audit log
    submission = TaskSubmission(
        team_id=current_team.id,
        stage=1,
        task_key=resolved_key,
        points_awarded=points,
        metadata_json=json.dumps({"proof": req.proof}) if req.proof else None
    )
    db.add(submission)
    await db.commit()
    await db.refresh(current_team)

    # Real-time broadcast to all 100 workstations (Admin Portal + Participant HUDs)
    await ws_manager.broadcast_leaderboard(db)

    return TaskSubmitResponse(
        success=True,
        task_key=resolved_key,
        points_awarded=points,
        new_total_score=current_team.score,
        message=f"Success! {points} points awarded for completing {task_info['title']}."
    )
