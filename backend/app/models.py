import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from .database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(64), unique=True, index=True, nullable=False)
    pin_hash = Column(String(128), nullable=False)
    standing = Column(Integer, default=0)
    score = Column(Integer, default=0, index=True)
    current_stage = Column(Integer, default=1)
    status = Column(String(20), default="active")  # 'active' | 'idle'
    last_ip = Column(String(45), nullable=True)
    member1 = Column(String(64), nullable=True)
    member2 = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    submissions = relationship("TaskSubmission", back_populates="team", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_teams_leaderboard", "score", "updated_at"),
    )

class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(Integer, nullable=False, default=1)  # 1: OS Navigation, 2: Image Regen
    task_key = Column(String(64), nullable=False, index=True)
    points_awarded = Column(Integer, nullable=False)
    metadata_json = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    team = relationship("Team", back_populates="submissions")

    __table_args__ = (
        Index("idx_team_stage_task", "team_id", "stage", "task_key"),
    )

class EventConfig(Base):
    __tablename__ = "event_config"

    key = Column(String(64), primary_key=True)
    value = Column(String(256), nullable=False)
