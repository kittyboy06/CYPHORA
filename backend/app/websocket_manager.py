import json
import logging
from typing import List, Dict, Optional
from fastapi import WebSocket
from sqlalchemy.future import select
from sqlalchemy import desc
from .models import Team

logger = logging.getLogger("cyphora.ws")

class WebSocketManager:
    def __init__(self):
        # Active connections list (handles 100+ concurrent connections)
        self.active_connections: List[WebSocket] = []
        self.connection_teams: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, team_name: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if team_name:
            self.connection_teams[websocket] = team_name
        logger.info(f"WebSocket client connected ({team_name or 'unidentified'}). Active clients: {len(self.active_connections)}")

    def register_team(self, websocket: WebSocket, team_name: str):
        if websocket in self.active_connections:
            self.connection_teams[websocket] = team_name
            logger.info(f"WebSocket client identified as '{team_name}'")

    def is_team_connected(self, team_name: str) -> bool:
        return any(name.lower() == team_name.lower() for name in self.connection_teams.values())

    def disconnect(self, websocket: WebSocket) -> Optional[str]:
        team_name = self.connection_teams.pop(websocket, None)
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected ({team_name or 'unidentified'}). Active clients: {len(self.active_connections)}")
        return team_name

    async def send_personal(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send personal WS message: {e}")

    async def broadcast(self, message: dict):
        """Broadcasts payload to all 100 connected workstations concurrently."""
        if not self.active_connections:
            return

        payload = json.dumps(message)
        dead_connections = []

        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead_connections.append(connection)

        # Cleanup any disconnected clients
        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_leaderboard(self, session):
        """Calculates current ranks and broadcasts to all clients."""
        stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
        result = await session.execute(stmt)
        teams = result.scalars().all()

        leaderboard_data = []
        for rank, team in enumerate(teams, start=1):
            team.standing = rank
            leaderboard_data.append({
                "rank": rank,
                "id": team.id,
                "name": team.name,
                "member1": team.member1,
                "member2": team.member2,
                "score": team.score,
                "status": team.status,
                "current_stage": team.current_stage,
                "notes": team.notes,
                "last_ip": team.last_ip,
                "started_at": team.started_at.isoformat() if team.started_at else None,
                "updated_at": team.updated_at.isoformat() if team.updated_at else None,
            })

        await session.commit()

        await self.broadcast({
            "event": "LEADERBOARD_UPDATE",
            "data": leaderboard_data
        })

# Global singleton manager
ws_manager = WebSocketManager()
