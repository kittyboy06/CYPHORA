from typing import Optional, List
from pydantic import BaseModel, Field

# Authentication
class TeamRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=32, description="Team name")
    pin: str = Field(..., min_length=4, max_length=8, description="4-8 digit numeric or alphanumeric PIN")

class TeamLoginRequest(BaseModel):
    name: str
    pin: str

class TeamOut(BaseModel):
    id: int
    name: str
    standing: int
    score: int
    current_stage: int
    status: str

    class Config:
        from_attributes = True

def to_team_out(team) -> TeamOut:
    if hasattr(TeamOut, "model_validate"):
        return TeamOut.model_validate(team)
    return TeamOut.from_orm(team)

class AuthResponse(BaseModel):
    token: str
    team: TeamOut

# Leaderboard / Explorers
class LeaderboardItem(BaseModel):
    rank: int
    name: str
    score: int
    status: str
    current_stage: int

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
class EventConfigUpdate(BaseModel):
    key: str
    value: str
