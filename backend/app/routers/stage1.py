import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..database import get_db
from ..models import Team, TaskSubmission
from ..schemas import TaskSubmitRequest, TaskSubmitResponse
from ..auth_utils import get_current_team
from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/stage1", tags=["Stage 1 - OS Navigation"])

# Comprehensive catalog for Round 1 Investigation Tasks (12 Tasks across 4 Tiers)
# Comprehensive catalog for Round 1 Investigation Tasks (12 Tasks across 4 Tiers)
# Canonical Source of Truth as defined in Prompts/pro3.md and taskContent.js
STAGE1_TASKS = {
    "r1_t01": {
        "title": "Task 01 — Encoded Message",
        "points": 20,
        "stage": 1,
        "scenario": "A short message recovered from an unknown source has been left on the workstation. Its original meaning is unreadable in its current numerical form.",
        "objective": "Locate message.txt.\nUse a data converter to translate the numerical character values into readable text.\nEnter the decoded word below.",
        "description": "Locate message.txt.\nUse a data converter to translate the numerical character values into readable text.\nEnter the decoded word below.",
        "hints": [
            "message.txt is located on the Desktop.",
            "Open the file and identify the number sequence. Use a Universal Converter and convert the values from Decimal/ASCII → Text."
        ],
        "accepted": ["HIDE"]
    },
    "r1_t02": {
        "title": "Task 02 — File Information",
        "points": 20,
        "stage": 1,
        "scenario": "An expedition image was recovered during the investigation, but its visual picture does not identify its creator. The underlying file records hold the author entry.",
        "objective": "Locate evidence.jpg.\nUse a file inspector to inspect the file properties and technical attributes rather than the visual pixels.\nEnter the registered author name below.",
        "description": "Locate evidence.jpg.\nUse a file inspector to inspect the file properties and technical attributes rather than the visual pixels.\nEnter the registered author name below.",
        "hints": [
            "evidence.jpg is located in the Pictures folder.",
            "Open the image with a Metadata Inspector and examine the available information fields. Look specifically for the field related to the creator/author."
        ],
        "accepted": ["ARLO", "DR. ARLO VANCE", "DR ARLO VANCE", "ARLO VANCE"]
    },
    "r1_t03": {
        "title": "Task 03 — Image Message",
        "points": 20,
        "stage": 1,
        "scenario": "A recovered poster contains an embedded optical matrix marking that cannot be interpreted through standard visual viewing.",
        "objective": "Locate poster.png.\nUse an optical scanning inspector to scan the machine-readable matrix graphic.\nEnter the revealed sector code below.",
        "description": "Locate poster.png.\nUse an optical scanning inspector to scan the machine-readable matrix graphic.\nEnter the revealed sector code below.",
        "hints": [
            "poster.png is located in the Pictures folder.",
            "Open the image using a QR/Barcode Scanner and scan the optical matrix to retrieve its encoded message."
        ],
        "accepted": ["SECTOR-7", "SECTOR 7", "SECTOR7"]
    },
    "r1_t04": {
        "title": "Task 04 — The Earliest Record",
        "points": 20,
        "stage": 2,
        "scenario": "Workstation access records are scrambled out of order. An initial trigger event initiated the recorded sequence.",
        "objective": "Locate access.log.\nInspect the chronological timestamps at the beginning of each line using a document inspector or text reader.\nIdentify the earliest entry and use the Universal Converter to decode its color code into a readable color name.\nEnter the decoded color name below.",
        "description": "Locate access.log.\nInspect the chronological timestamps at the beginning of each line using a document inspector or text reader.\nIdentify the earliest entry and use the Universal Converter to decode its color code into a readable color name.\nEnter the decoded color name below.",
        "hints": [
            "access.log is located in the Documents folder.",
            "Open the log and compare all the timestamps to identify the earliest entry. Use the Universal Converter (Color Code → Text) to translate the color code into readable text."
        ],
        "accepted": ["YELLOW", "Yellow", "yellow", "#FFFF00", "FFFF00"]
    },
    "r1_t05": {
        "title": "Task 05 — The Changed Record",
        "points": 20,
        "stage": 2,
        "scenario": "Two versions of a critical transmission log exist on the workstation. Most lines are identical, but one operational parameter was modified.",
        "objective": "Locate message_old.txt and message_new.txt.\nUse a file comparison inspector to analyze both documents side-by-side.\nEnter the updated operational value from the revised record below.",
        "description": "Locate message_old.txt and message_new.txt.\nUse a file comparison inspector to analyze both documents side-by-side.\nEnter the updated operational value from the revised record below.",
        "hints": [
            "message_old.txt and message_new.txt are located in the Documents folder.",
            "Open both files in a File Comparison Tool and compare them line by line. Locate the value that differs between the two versions."
        ],
        "accepted": ["9941"]
    },
    "r1_t06": {
        "title": "Task 06 — The Fragmented Password",
        "points": 20,
        "stage": 2,
        "scenario": "Three fragments of a security passcode were recovered separately. Each fragment is incomplete on its own, and their order is scrambled.",
        "objective": "Locate fragment_01.txt, fragment_02.txt, and fragment_03.txt.\nInspect each fragment to determine its recorded timestamp and sort them chronologically.\nCombine the ordered values and use a data converter to decode the complete password below.",
        "description": "Locate fragment_01.txt, fragment_02.txt, and fragment_03.txt.\nInspect each fragment to determine its recorded timestamp and sort them chronologically.\nCombine the ordered values and use a data converter to decode the complete password below.",
        "hints": [
            "The three fragment files are located in the Documents folder.",
            "Check the timestamps of all three fragments and arrange them from earliest to latest. Combine the fragments and decode the resulting string using Base64."
        ],
        "accepted": ["CYPHORA", "JUMP"]
    },
    "r1_t07": {
        "title": "Task 07 — The Hidden Record",
        "points": 20,
        "stage": 3,
        "scenario": "An archival survey photograph appears ordinary, but operational data was preserved inside its descriptive technical properties.",
        "objective": "Locate archive_photo.png.\nUse a file inspector to examine its technical file properties and recover the embedded description code.\nUse a data converter to translate the character codes into readable text and enter the message below.",
        "description": "Locate archive_photo.png.\nUse a file inspector to examine its technical file properties and recover the embedded description code.\nUse a data converter to translate the character codes into readable text and enter the message below.",
        "hints": [
            "archive_photo.png is located in the Pictures folder.",
            "Open the image with a Metadata Inspector and examine its description/details. Convert the numerical character codes using Decimal/ASCII → Text."
        ],
        "accepted": ["RESCUE", "HELP"]
    },
    "r1_t08": {
        "title": "Task 08 — The Disguised File",
        "points": 20,
        "stage": 3,
        "scenario": "Crucial investigation evidence has been deliberately concealed in a hidden subdirectory within the workstation archives.",
        "objective": "Explore the directory structure using a file inspector or manager capable of revealing concealed files.\nLocate clue.txt inside the hidden archive.\nSubmit the numerical passcode contained within.",
        "description": "Explore the directory structure using a file inspector or manager capable of revealing concealed files.\nLocate clue.txt inside the hidden archive.\nSubmit the numerical passcode contained within.",
        "hints": [
            "Look inside the Archive folder.",
            "Open the Archive folder in File Manager, right-click and select \"Show Hidden Files\" to reveal concealed directories, then locate clue.txt."
        ],
        "accepted": ["7314", "RECOVERY"]
    },
    "r1_t09": {
        "title": "Task 09 — The Evidence Trail",
        "points": 20,
        "stage": 3,
        "scenario": "An investigative trail spans across multiple records, beginning with an optical marking on a survey map.",
        "objective": "Locate map.png and use an optical scanning inspector to recover the clue reference key.\nCross-reference that key in index.txt to determine the target log record.\nInspect activity.log to identify which file ID USER-A downloaded, and enter that number below.",
        "description": "Locate map.png and use an optical scanning inspector to recover the clue reference key.\nCross-reference that key in index.txt to determine the target log record.\nInspect activity.log to identify which file ID USER-A downloaded, and enter that number below.",
        "hints": [
            "The starting image is in Pictures; related files are in Documents.",
            "Scan the image to obtain the first clue. Use that clue to locate the relevant entry in the index file, then follow its reference to the activity log and inspect the specified record."
        ],
        "accepted": ["17", "FILE=17", "FILE 17"]
    },
    "r1_t10": {
        "title": "Task 10 — The Altered Record",
        "points": 20,
        "stage": 4,
        "scenario": "Two versions of a secure configuration record contain a subtle hexadecimal difference that conceals an operational word.",
        "objective": "Locate alpha.txt and beta.txt.\nUse a file comparison inspector to isolate the modified configuration entry.\nUse a data converter to translate the altered hexadecimal sequence into readable text and enter the resulting word below.",
        "description": "Locate alpha.txt and beta.txt.\nUse a file comparison inspector to isolate the modified configuration entry.\nUse a data converter to translate the altered hexadecimal sequence into readable text and enter the resulting word below.",
        "hints": [
            "alpha.txt and beta.txt are located in the Documents folder.",
            "Compare both configuration files and locate the modified line. Identify the hexadecimal sequence and convert it from Hexadecimal → Text."
        ],
        "accepted": ["VECTOR", "JUMP"]
    },
    "r1_t11": {
        "title": "Task 11 — Follow the Trail",
        "points": 20,
        "stage": 4,
        "scenario": "A field note points to an archive document, which links to monitored hardware evidence across the workstation.",
        "objective": "Locate incident_note.txt and follow its pointer to the referenced archive record.\nCheck the archive file to identify the target device photo.\nUse a file inspector on the device image to retrieve its encoded attribute, then use a data converter to translate the value into the clearance word below.",
        "description": "Locate incident_note.txt and follow its pointer to the referenced archive record.\nCheck the archive file to identify the target device photo.\nUse a file inspector on the device image to retrieve its encoded attribute, then use a data converter to translate the value into the clearance word below.",
        "hints": [
            "Start with incident_note.txt in the Documents folder.",
            "Follow the reference path given in the note. Continue through the archive and device image, then inspect the image metadata and decode the character sequence using the appropriate conversion method."
        ],
        "accepted": ["SHIFT"]
    },
    "r1_t12": {
        "title": "Task 12 — Trace the Incident",
        "points": 20,
        "stage": 4,
        "scenario": "Four pieces of evidence across logs, device photos, archives, and transfer records form a connected incident chain.",
        "objective": "Locate system.log to observe the incident sequence.\nUse a file inspector on device.png to identify the registered hardware ID.\nOpen the corresponding archive record to find the transfer ID, inspect the transfer document, and use a data converter to decode the clearance code below.",
        "description": "Locate system.log to observe the incident sequence.\nUse a file inspector on device.png to identify the registered hardware ID.\nOpen the corresponding archive record to find the transfer ID, inspect the transfer document, and use a data converter to decode the clearance code below.",
        "hints": [
            "The evidence is spread across Documents, Pictures, Archive, and Transfers folders.",
            "Start with the system record and follow each file/reference identifier to the next piece of evidence. Reach the final transfer file and decode its hexadecimal payload into text."
        ],
        "accepted": ["SYMPO"]
    }
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
                "scenario": data.get("scenario", ""),
                "objective": data.get("objective", ""),
                "description": data["description"],
                "hints": data.get("hints", []),
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

    # Validate that an answer/proof was actually provided. Empty, null, whitespace-only submissions are strictly rejected!
    if not req.proof or not req.proof.strip():
        return TaskSubmitResponse(
            success=False,
            task_key=resolved_key,
            points_awarded=0,
            new_total_score=current_team.score,
            message="Submission rejected: Answer cannot be empty."
        )

    clean_proof = req.proof.strip().upper()
    accepted = [a.strip().upper() for a in task_info.get("accepted", [])]

    if clean_proof not in accepted:
        return TaskSubmitResponse(
            success=False,
            task_key=resolved_key,
            points_awarded=0,
            new_total_score=current_team.score,
            message="Incorrect answer. Verify evidence and try again."
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
        # Guarantee round1_score is in sync with database records
        stmt_sum = select(func.coalesce(func.sum(TaskSubmission.points_awarded), 0)).filter(
            TaskSubmission.team_id == current_team.id,
            TaskSubmission.stage == 1
        )
        r1_actual = (await db.execute(stmt_sum)).scalar() or 0
        if (current_team.round1_score or 0) != r1_actual:
            current_team.round1_score = r1_actual
            current_team.score = (current_team.round1_score or 0) + (getattr(current_team, 'round2_score', 0) or 0) + (getattr(current_team, 'round3_score', 0) or 0)
            await db.commit()
            await ws_manager.broadcast_leaderboard(db)
        return TaskSubmitResponse(
            success=True,
            task_key=resolved_key,
            points_awarded=0,
            new_total_score=current_team.score,
            message="Task was already completed by your team."
        )

    base_points = task_info.get("points", 20)
    hints_count = max(0, min(2, req.hints_used or 0))
    hint_penalty = hints_count * 5
    points = max(0, base_points - hint_penalty)

    # Award points & update stage
    current_team.round1_score = (getattr(current_team, 'round1_score', 0) or 0) + points
    current_team.score = (getattr(current_team, 'round1_score', 0) or 0) + (getattr(current_team, 'round2_score', 0) or 0) + (getattr(current_team, 'round3_score', 0) or 0)
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
        metadata_json=json.dumps({
            "proof": req.proof,
            "hints_used": hints_count,
            "hint_penalty": hint_penalty,
            "base_points": base_points
        })
    )
    db.add(submission)
    await db.commit()
    await db.refresh(current_team)

    # Real-time broadcast to all 100 workstations (Admin Portal + Participant HUDs)
    await ws_manager.broadcast_leaderboard(db)

    penalty_msg = f" (-{hint_penalty} pts for {hints_count} hint{'s' if hints_count > 1 else ''})" if hint_penalty > 0 else ""
    return TaskSubmitResponse(
        success=True,
        task_key=resolved_key,
        points_awarded=points,
        new_total_score=current_team.score,
        message=f"Success! {points} points awarded for completing {task_info['title']}{penalty_msg}."
    )
