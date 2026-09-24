import asyncio
import json
import logging
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import STATIC_DIST_DIR, BASE_DIR
from .database import init_db, AsyncSessionLocal
from .websocket_manager import ws_manager
from .routers import auth, teams, stage1, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cyphora.server")

# Periodic background backup task every 5 minutes
async def periodic_backup_task():
    while True:
        try:
            await asyncio.sleep(300)  # 5 minutes
            from .routers.admin import execute_backup
            res = execute_backup()
            logger.info(f"[BACKUP] Automated 5-min snapshot completed: {res.get('backup_file')}")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"[BACKUP] Snapshot error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite tables & WAL mode
    logger.info("Initializing CYPHORA SQLite Database with WAL mode...")
    await init_db()
    logger.info("Database initialized successfully.")

    # Start background rolling backup
    backup_task = asyncio.create_task(periodic_backup_task())
    yield
    # Shutdown
    backup_task.cancel()
    try:
        await backup_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="CYPHORA Local Event Server",
    description="High-concurrency local event backend and database for 100 workstations",
    version="1.0.0",
    lifespan=lifespan
)

# Open CORS for local LAN subnet
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(stage1.router)
app.include_router(admin.router)

# Real-time WebSocket Gateway for 100 Workstations
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket, team: Optional[str] = None):
    await ws_manager.connect(websocket, team)
    try:
        # If team name was provided on connection, activate in DB and broadcast
        if team:
            async with AsyncSessionLocal() as session:
                from sqlalchemy.future import select
                from .models import Team
                res = await session.execute(select(Team).filter(Team.name == team))
                t = res.scalar_one_or_none()
                if t:
                    t.status = "active"
                    await session.commit()
                await ws_manager.broadcast_leaderboard(session)
        else:
            # Send initial leaderboard immediately upon connection
            async with AsyncSessionLocal() as session:
                from sqlalchemy.future import select
                from sqlalchemy import desc
                from .models import Team
                stmt = select(Team).order_by(desc(Team.score), Team.updated_at)
                result = await session.execute(stmt)
                teams_list = result.scalars().all()
                leaderboard_data = [
                    {
                        "rank": i,
                        "id": t.id,
                        "name": t.name,
                        "member1": t.member1,
                        "member2": t.member2,
                        "score": t.score,
                        "status": t.status,
                        "current_stage": t.current_stage,
                        "notes": t.notes,
                        "last_ip": t.last_ip,
                        "started_at": t.started_at.isoformat() if t.started_at else None,
                        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
                    }
                    for i, t in enumerate(teams_list, start=1)
                ]
                await ws_manager.send_personal({
                    "event": "INITIAL_STATE",
                    "data": leaderboard_data
                }, websocket)

        while True:
            # Keep connection open and receive any client messages/pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
                continue

            try:
                msg = json.loads(data)
                action = msg.get("action")
                if action == "identify":
                    identified_team = msg.get("team")
                    if identified_team:
                        ws_manager.register_team(websocket, identified_team)
                        async with AsyncSessionLocal() as session:
                            from sqlalchemy.future import select
                            from .models import Team
                            res = await session.execute(select(Team).filter(Team.name == identified_team))
                            t = res.scalar_one_or_none()
                            if t:
                                t.status = "active"
                                await session.commit()
                            await ws_manager.broadcast_leaderboard(session)
                elif action == "ping":
                    await websocket.send_text(json.dumps({"action": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        disconnected_team = ws_manager.disconnect(websocket)
        if disconnected_team and not ws_manager.is_team_connected(disconnected_team):
            try:
                async with AsyncSessionLocal() as session:
                    from sqlalchemy.future import select
                    from .models import Team
                    res = await session.execute(select(Team).filter(Team.name == disconnected_team))
                    t = res.scalar_one_or_none()
                    if t:
                        t.status = "idle"
                        await session.commit()
                        await ws_manager.broadcast_leaderboard(session)
            except Exception as e:
                logger.warning(f"Error updating disconnected team status: {e}")
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

# Mount round1 static directory
round1_dir = BASE_DIR / "round1"
if round1_dir.exists():
    app.mount("/round1", StaticFiles(directory=round1_dir.as_posix(), html=True), name="round1")

from fastapi.responses import FileResponse, HTMLResponse

@app.get("/admin")
@app.get("/admin/{full_path:path}")
async def serve_admin_spa():
    index_file = STATIC_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file.as_posix())
    return HTMLResponse("<h1>CYPHORA Admin - Build frontend first</h1>")

# Mount production frontend build if available
if STATIC_DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIST_DIR.as_posix(), html=True), name="static_frontend")
