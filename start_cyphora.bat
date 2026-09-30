@echo off
title CYPHORA Event Launcher
cd /d "%~dp0"

echo ===================================================================
echo                     CYPHORA EVENT SYSTEM
echo         Starting Backend (Port 8000) ^& Frontend (Port 5173)
echo ===================================================================
echo.

REM 1. Verify Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.10+ from python.org and check Add to PATH.
    echo.
    pause
    exit /b 1
)

REM 2. Verify Node.js / npm installation
call npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not installed or not in your system PATH.
    echo Please install Node.js from https://nodejs.org/ and retry.
    echo.
    pause
    exit /b 1
)

REM 3. Check frontend node_modules
if not exist node_modules (
    echo [*] Installing frontend npm packages - first-time setup...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
)

REM 4. Verify Python dependencies
echo [*] Checking backend Python dependencies...
python -m pip install -q -r backend\requirements.txt

echo.
echo [*] Launching Backend Server on port 8000...
start "CYPHORA Backend (Port 8000)" cmd /k python backend\run_server.py

REM Wait briefly for backend to bind port 8000
ping -n 3 127.0.0.1 >nul

echo [*] Launching Frontend Server on port 5173...
start "CYPHORA Frontend (Port 5173)" cmd /k npm run dev

REM Wait briefly for Vite to start up
ping -n 3 127.0.0.1 >nul

REM Automatically open browser
echo [*] Opening CYPHORA in your default browser...
start http://localhost:5173

echo.
echo ===================================================================
echo                  CYPHORA IS READY AND RUNNING!
echo ===================================================================
echo  [Local Links]
echo   - Player Workstation : http://localhost:5173
echo   - Admin Portal       : http://localhost:5173/admin  [Password: JCEAIML]
echo   - Backend API Docs   : http://localhost:8000/docs
echo.
echo  [LAN Workstations]
echo   Check the CYPHORA Backend window for your machine's LAN IP address.
echo   Other computers on the network can connect via:
echo   http://^<YOUR_LAN_IP^>:5173
echo.
echo  [Shutdown]
echo   Close the opened backend and frontend command windows to stop CYPHORA.
echo ===================================================================
echo.
pause
