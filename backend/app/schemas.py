from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Authentication
class TeamRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=32, description="Team name")
    pin: str = Field(..., min_length=4, max_length=16, description="4-16 digit/char secret PIN created by team")
    member1: Optional[str] = Field(None, max_length=64, description="Name of Member 1")
    member2: Optional[str] = Field(None, max_length=64, description="Name of Member 2")

class TeamLoginRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, description="Team name")
    pin: str = Field(..., min_length=1, max_length=16, description="Team PIN")

class AdminPinResetRequest(BaseModel):
    new_pin: str = Field(..., min_length=4, max_length=16, description="New secret PIN for team")

class TeamOut(BaseModel):
    id: int
    name: str
    member1: Optional[str] = None
    member2: Optional[str] = None
    standing: int
    score: int
    current_stage: int
    round2_unlocked: Optional[int] = 0
    round3_unlocked: Optional[int] = 0
    status: str
    notes: Optional[str] = None
    last_ip: Optional[str] = None
    started_at: Optional[datetime] = None
    round1_started_at: Optional[datetime] = None
    round2_started_at: Optional[datetime] = None
    round3_started_at: Optional[datetime] = None
    round1_completed_at: Optional[datetime] = None
    round2_completed_at: Optional[datetime] = None
    round3_completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

def to_team_out(team) -> TeamOut:
    if hasattr(TeamOut, "model_validate"):
        return TeamOut.model_validate(team)
    return TeamOut.from_orm(team)

class AuthResponse(BaseModel):
    token: str
    team: TeamOut

class RoundStartRequest(BaseModel):
    round: int = Field(1, ge=1, le=3, description="Round number (1, 2, or 3)")
    started_at: Optional[str] = None

# Leaderboard / Explorers Telemetry
class LeaderboardItem(BaseModel):
    rank: int
    id: Optional[int] = None
    name: str
    member1: Optional[str] = None
    member2: Optional[str] = None
    score: int
    round1_score: Optional[int] = 0
    round2_score: Optional[int] = 0
    round3_score: Optional[int] = 0
    final_score: Optional[int] = 0
    status: str
    is_connected: Optional[bool] = False
    current_stage: int
    round2_unlocked: Optional[bool] = False
    round3_unlocked: Optional[bool] = False
    last_ip: Optional[str] = None
    notes: Optional[str] = None
    started_at: Optional[str] = None
    round1_started_at: Optional[str] = None
    round2_started_at: Optional[str] = None
    round3_started_at: Optional[str] = None
    round1_completed_at: Optional[str] = None
    round2_completed_at: Optional[str] = None
    round3_completed_at: Optional[str] = None
    updated_at: Optional[str] = None
    submission_count: Optional[int] = 0

class LeaderboardResponse(BaseModel):
    teams: List[LeaderboardItem]
    total_explorers: int
    timer: Optional[dict] = None
    timers: Optional[dict] = None

class Stage3SubmitRequest(BaseModel):
    level: int = Field(..., description="Stage 3 Blockly Level (1, 2, 3)")
    blocks_used: int = Field(..., description="Number of blocks used")
    efficiency: Optional[str] = Field("Acceptable", description="Efficiency rating")
    score: int = Field(..., description="Score awarded for level (Max 500)")
    time_used_seconds: Optional[int] = Field(None, description="Time taken to solve level in seconds")
    block_score: Optional[int] = Field(None, description="Score from block efficiency (max 250)")
    time_score: Optional[int] = Field(None, description="Score from time efficiency (max 250)")
    team_name: Optional[str] = None

# Task Submissions (Stage 1 OS Navigation)
class TaskSubmitRequest(BaseModel):
    task_key: str = Field(..., description="Unique task identifier in Stage 1")
    proof: Optional[str] = Field(None, description="Optional proof/flag string")
    hints_used: Optional[int] = Field(0, description="Hints revealed for this task (0, 1, or 2)")
    team_name: Optional[str] = Field(None, description="Optional fallback team name")

class TaskSubmitResponse(BaseModel):
    success: bool
    task_key: str
    points_awarded: int
    new_total_score: int
    message: str

# Event Admin
class AdminLoginRequest(BaseModel):
    password: str

class AdminScoreUpdateRequest(BaseModel):
    points_delta: Optional[int] = None
    new_score: Optional[int] = None
    round: Optional[int] = None
    reason: Optional[str] = None

class AdminTeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    member1: Optional[str] = None
    member2: Optional[str] = None
    current_stage: Optional[int] = None
    notes: Optional[str] = None

class AdminNoteUpdateRequest(BaseModel):
    notes: str

class EventConfigUpdate(BaseModel):
    key: str
    value: str

class AdminRound2AccessRequest(BaseModel):
    unlocked: bool

class AdminRound3AccessRequest(BaseModel):
    unlocked: bool

