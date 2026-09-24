@echo off
:: Auto-elevate to Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges to fix network DNS...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ========================================================
echo       Fixing GitHub Host Resolution for CYPHORA
echo ========================================================

echo [*] 1. Adding GitHub IP to Windows hosts file...
powershell -Command "Add-Content -Path 'C:\Windows\System32\drivers\etc\hosts' -Value '`n20.207.73.82 github.com`n20.207.73.82 api.github.com'"

echo [*] 2. Setting Google DNS (8.8.8.8) on Wi-Fi adapter...
powershell -Command "Set-DnsClientServerAddress -InterfaceAlias 'WiFi 2' -ServerAddresses ('8.8.8.8','1.1.1.1') -ErrorAction SilentlyContinue"

echo [*] 3. Flushing DNS cache...
ipconfig /flushdns

echo ========================================================
echo [SUCCESS] Fixed! You can now push and pull from GitHub.
echo ========================================================
pause
