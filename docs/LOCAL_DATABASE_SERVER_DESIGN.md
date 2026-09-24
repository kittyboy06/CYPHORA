# CYPHORA Local Server & Database Architecture Specification

## 1. Executive Summary & Purpose
This document specifies the architecture and implementation design for the **CYPHORA Local Event Server & Database**, built to handle **100 concurrent participant workstations** during an on-premise, offline/LAN competition event.

---

## 2. Understanding Summary
* **What**: A unified high-performance local backend built with **Python (FastAPI)** and an optimized **SQLite (WAL Mode)** database.
* **Why**: Coordinates 100 client computers over LAN for real-time team authentication, Stage 1 (OS Navigation) task tracking, live scoring/leaderboards, and native readiness for Stage 2 (image cosine similarity evaluations).
* **Target Audience**: 100 event participant teams and event organizers.
* **Key Constraints**: 100% offline functionality (no external cloud/internet reliance), zero-lag concurrent reads, single-port LAN hosting.
* **Explicit Non-Goals**: Cloud deployment, multi-region database clusters, heavy enterprise microservices.

---

## 3. Assumptions & Non-Functional Requirements
* **Scale**: Up to 100 concurrent active client nodes on local Wi-Fi / Ethernet LAN.
* **Database Engine**: SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;`, `PRAGMA busy_timeout=5000;`).
* **Real-time Pipeline**: WebSockets on FastAPI broadcasting updates to 100 active connections.
* **Security & Auth**: Team Name + 4-digit PIN authentication generating local session tokens.
* **Disaster Recovery**: Rolling snapshots every 5 minutes (`VACUUM INTO 'data/backups/...'`).

---

## 4. Decision Log

| # | Topic | Decision | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **D-01** | **Backend Stack** | Python (FastAPI) | Node.js Express, Go, PocketBase | Native Python allows Stage 2 image cosine similarity algorithms (PyTorch / SentenceTransformers) to run directly on the same host without cross-language microservice overhead. |
| **D-02** | **Database Engine** | SQLite (WAL Mode) | PostgreSQL, MySQL, Redis-only | Single-file zero-dependency database with WAL mode provides sub-millisecond concurrent reads for 100 LAN clients without requiring database server installation. |
| **D-03** | **Real-time Engine** | WebSockets | HTTP Polling (every 3s) | Pushes leaderboard updates instantly to all 100 nodes without flooding the server with hundreds of continuous HTTP GET requests. |
| **D-04** | **Access Control** | Team PIN / Token | Open registration, IP locking | Prevents workstation swapping, session hijacking, or accidental team score overrides. |
| **D-05** | **Hosting Strategy** | Single-Port Serving (Port 8000) | Dual ports (5173 + 8000) | FastAPI serves both API routes and static production React assets (`/dist`), eliminating CORS problems and simplifying participant access. |

---

## 5. System Architecture & Topology

```
CYPHORA/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, static mounts, startup lifecycle
│   │   ├── config.py            # Environment & database settings
│   │   ├── database.py          # SQLite engine, connection pool & WAL pragmas
│   │   ├── models.py            # SQLAlchemy 2.0 ORM models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── websocket_manager.py # Broadcast manager for 100 client connections
│   │   └── routers/
│   │       ├── auth.py          # Team registration & PIN login
│   │       ├── teams.py         # Explorer info & live standings
│   │       ├── stage1.py        # OS Navigation task submissions & validation
│   │       └── admin.py         # Organizer controls & stage unlocking
│   ├── requirements.txt         # fastapi, uvicorn, sqlalchemy, aiosqlite, passlib
│   └── run_server.py            # One-click LAN launcher (auto-detects local IP)
├── data/
│   ├── cyphora.db               # Primary SQLite database
│   └── backups/                 # 5-minute rolling disaster recovery snapshots
└── src/                         # React frontend UI
```

---

## 6. Database Schema Design

```sql
-- 1. Teams Table
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    pin_hash TEXT NOT NULL,
    standing INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    current_stage INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    last_ip TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_teams_score ON teams(score DESC, updated_at ASC);

-- 2. Task Submissions
CREATE TABLE task_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL,
    task_identifier TEXT NOT NULL,
    points_awarded INTEGER NOT NULL,
    metadata JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_submissions_team ON task_submissions(team_id, stage);

-- 3. Event Configuration
CREATE TABLE event_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

---

## 7. Data Flow & Communication Protocol

1. **Team Registration / Login**:
   - `POST /api/auth/register` or `POST /api/auth/login` with `{ name, pin }`.
   - Returns `{ token, team: { id, name, score, current_stage } }`.
2. **Real-time Connection**:
   - Client establishes WebSocket connection: `ws://<SERVER_IP>:8000/ws/live?token=<TOKEN>`.
   - Server registers client in `websocket_manager.py`.
3. **Stage 1 Task Scoring**:
   - Client posts completion: `POST /api/stage1/submit` with `{ task_key, proof }`.
   - Server updates score in transaction, saves submission log, and triggers broadcast:
     ```json
     {
       "event": "LEADERBOARD_UPDATE",
       "data": [
         { "rank": 1, "name": "Team Phoenix", "score": 300, "status": "active" },
         ...
       ]
     }
     ```
4. **Disaster Recovery**:
   - Every 5 minutes, an async background task performs `VACUUM INTO` saving snapshots in `data/backups/cyphora_backup_<timestamp>.db`.
