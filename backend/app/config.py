import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
BACKUP_DIR = DATA_DIR / "backups"
DB_PATH = DATA_DIR / "cyphora.db"
STATIC_DIST_DIR = BASE_DIR / "dist"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# Security / Token
SECRET_KEY = os.getenv("CYPHORA_SECRET_KEY", "cyphora-event-secret-key-lan-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours (covers whole event)

# Database URL
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"
SYNC_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"
