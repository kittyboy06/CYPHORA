import os
import shutil
import sqlite3
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Team, TaskSubmission
from ..config import DB_PATH, BACKUP_DIR
from ..websocket_manager import ws_manager

router = APIRouter(prefix="/api/admin", tags=["Event Administration"])

@router.get("/status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team))
    teams = result.scalars().all()

    db_size_kb = os.path.getsize(DB_PATH) / 1024 if DB_PATH.exists() else 0
    wal_path = DB_PATH.with_suffix(".db-wal")
    wal_size_kb = os.path.getsize(wal_path) / 1024 if wal_path.exists() else 0

    return {
        "active_ws_clients": len(ws_manager.active_connections),
        "total_registered_teams": len(teams),
        "database_size_kb": round(db_size_kb, 2),
        "wal_journal_size_kb": round(wal_size_kb, 2),
        "database_file": str(DB_PATH)
    }

@router.post("/backup")
async def trigger_backup():
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"cyphora_backup_{timestamp}.db"

    # Use SQLite VACUUM INTO for online ACID-compliant live snapshot
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(f"VACUUM INTO '{backup_file.as_posix()}'")
        conn.close()
        return {
            "status": "success",
            "backup_file": str(backup_file),
            "size_kb": round(os.path.getsize(backup_file) / 1024, 2)
        }
    except Exception as e:
        # Fallback to copy if vacuum into isn't available
        shutil.copy2(DB_PATH, backup_file)
        return {
            "status": "fallback_copy",
            "backup_file": str(backup_file),
            "error": str(e)
        }
