@echo off
cd /d "%~dp0"
title CYPHORA Round 3 LAN Host

echo Starting Round 3 for devices on the local network...
echo On this computer: http://localhost:5173
echo On other devices: http://<this-computers-LAN-IP>:5173
echo Keep this window open while Round 3 is in use.
echo Press Ctrl+C to stop the server.
echo.

npm run dev -- --host 0.0.0.0
pause