import asyncio
import logging
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
            from .routers.admin import trigger_backup
            res = await trigger_backup()
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
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
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
                    "name": t.name,
                    "score": t.score,
                    "status": t.status,
                    "current_stage": t.current_stage
                }
                for i, t in enumerate(teams_list, start=1)
            ]
            await ws_manager.send_personal({
                "event": "INITIAL_STATE",
                "data": leaderboard_data
            }, websocket)

        while True:
            # Keep connection open and receive any client ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

# Mount round1 static directory
round1_dir = BASE_DIR / "round1"
if round1_dir.exists():
    app.mount("/round1", StaticFiles(directory=round1_dir.as_posix(), html=True), name="round1")

# Mount production frontend build if available
if STATIC_DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIST_DIR.as_posix(), html=True), name="static_frontend")
