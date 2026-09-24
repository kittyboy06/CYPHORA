from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Authentication
class TeamRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=32, description="Team name")
    pin: str = Field(..., min_length=4, max_length=8, description="4-8 digit numeric or alphanumeric PIN")
    member1: Optional[str] = Field(None, max_length=64, description="Name of Member 1")
    member2: Optional[str] = Field(None, max_length=64, description="Name of Member 2")

class TeamLoginRequest(BaseModel):
    name: str
    pin: str

class TeamOut(BaseModel):
    id: int
    name: str
    member1: Optional[str] = None
    member2: Optional[str] = None
    standing: int
    score: int
    current_stage: int
    status: str
    notes: Optional[str] = None
    last_ip: Optional[str] = None
    started_at: Optional[datetime] = None
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

# Leaderboard / Explorers Telemetry
class LeaderboardItem(BaseModel):
    rank: int
    id: Optional[int] = None
    name: str
    member1: Optional[str] = None
    member2: Optional[str] = None
    score: int
    status: str
    current_stage: int
    last_ip: Optional[str] = None
    notes: Optional[str] = None
    started_at: Optional[str] = None
    updated_at: Optional[str] = None
    submission_count: Optional[int] = 0

class LeaderboardResponse(BaseModel):
    teams: List[LeaderboardItem]
    total_explorers: int

# Task Submissions (Stage 1 OS Navigation)
class TaskSubmitRequest(BaseModel):
    task_key: str = Field(..., description="Unique task identifier in Stage 1")
    proof: Optional[str] = Field(None, description="Optional proof/flag string")

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
