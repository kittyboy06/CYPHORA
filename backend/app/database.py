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

async def init_db():
    """Initializes tables and confirms WAL mode on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
