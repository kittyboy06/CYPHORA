import sqlite3
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from .config import DATABASE_URL, DB_PATH

Base = declarative_base()

# Async Engine for high-throughput non-blocking operations
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "check_same_thread": False,
        "timeout": 30.0,
    }
)

# Apply SQLite WAL and performance pragmas upon every low-level SQLite connection
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    # 1. Enable Write-Ahead Logging (allows concurrent readers while writing)
    cursor.execute("PRAGMA journal_mode=WAL;")
    # 2. Faster disk sync (safely durable for WAL)
    cursor.execute("PRAGMA synchronous=NORMAL;")
    # 3. Wait up to 5 seconds if database is busy with another write
    cursor.execute("PRAGMA busy_timeout=5000;")
    # 4. Enforce foreign key constraints
    cursor.execute("PRAGMA foreign_keys=ON;")
    # 5. Increase memory cache to 64MB (-64000 KB) for instantaneous index queries
    cursor.execute("PRAGMA cache_size=-64000;")
    cursor.close()

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    """Dependency for injecting an async database session into route handlers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def seed_default_explorers():
    """Seeds default expedition teams into SQLite database if empty."""
    from .models import Team
    from .auth_utils import hash_pin
    from sqlalchemy.future import select
    from sqlalchemy import func

    async with AsyncSessionLocal() as session:
        count_res = await session.execute(select(func.count(Team.id)))
        count = count_res.scalar_one()
        if count == 0:
            default_pin = hash_pin("1234")
            seed_teams = [
                Team(name="Team Cipher",  score=350, standing=1, status="active", pin_hash=default_pin),
                Team(name="Team Vortex",  score=280, standing=2, status="active", pin_hash=default_pin),
                Team(name="Team Nexus",   score=220, standing=3, status="active", pin_hash=default_pin),
                Team(name="Team Phantom", score=160, standing=4, status="idle",   pin_hash=default_pin),
                Team(name="Team Glitch",  score=120, standing=5, status="idle",   pin_hash=default_pin),
                Team(name="Team Rogue",   score=80,  standing=6, status="idle",   pin_hash=default_pin),
                Team(name="Team Epoch",   score=40,  standing=7, status="idle",   pin_hash=default_pin),
                Team(name="Team Blaze",   score=0,   standing=8, status="idle",   pin_hash=default_pin),
            ]
            session.add_all(seed_teams)
            await session.commit()

async def migrate_columns():
    """Ensures newly added columns exist in SQLite database without losing data."""
    from sqlalchemy import text
    async with engine.begin() as conn:
        res = await conn.execute(text("PRAGMA table_info(teams);"))
        existing_cols = {row[1] for row in res.fetchall()}
        if "member1" not in existing_cols:
            await conn.execute(text("ALTER TABLE teams ADD COLUMN member1 TEXT;"))
        if "member2" not in existing_cols:
            await conn.execute(text("ALTER TABLE teams ADD COLUMN member2 TEXT;"))
        if "notes" not in existing_cols:
            await conn.execute(text("ALTER TABLE teams ADD COLUMN notes TEXT;"))
        if "started_at" not in existing_cols:
            await conn.execute(text("ALTER TABLE teams ADD COLUMN started_at TIMESTAMP;"))

async def init_db():
    """Initializes tables, confirms WAL mode, migrates columns, and seeds default explorers."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await migrate_columns()
    await seed_default_explorers()
