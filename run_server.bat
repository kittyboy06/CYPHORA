@echo off
title CYPHORA Local Event Server
echo ========================================================
echo        Starting CYPHORA Local Event Server (100 Nodes)
echo ========================================================

:: Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from python.org and retry.
    pause
    exit /b 1
)

:: Install/verify requirements
echo [*] Checking dependencies...
python -m pip install -q -r backend\requirements.txt

:: Start server launcher
echo [*] Launching FastAPI + SQLite WAL server...
python backend\run_server.py
pause
