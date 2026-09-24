import json
import logging
from typing import List
from fastapi import WebSocket
from sqlalchemy.future import select
from sqlalchemy import desc
from .models import Team

logger = logging.getLogger("cyphora.ws")

class WebSocketManager:
    def __init__(self):
        # Active connections list (can comfortably handle 100+ concurrent connections)
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

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
            if dead in self.active_connections:
                self.active_connections.remove(dead)

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
                "name": team.name,
                "score": team.score,
                "status": team.status,
                "current_stage": team.current_stage
            })

        await session.commit()

        await self.broadcast({
            "event": "LEADERBOARD_UPDATE",
            "data": leaderboard_data
        })

# Global singleton manager
ws_manager = WebSocketManager()
