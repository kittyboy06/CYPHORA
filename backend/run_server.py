import socket
import sys
import uvicorn
from pathlib import Path

# Add backend directory to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

def get_lan_ip():
    """Detects the active IPv4 address on the local LAN network adapter."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Does not actually send data over wire, but selects the outgoing route
        s.connect(('10.254.254.254', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def main():
    lan_ip = get_lan_ip()
    port = 8000

    print("=" * 65)
    print("      CYPHORA LOCAL EVENT SERVER & DATABASE (100 NODES)")
    print("=" * 65)
    print(f" [*] Localhost Access      : http://localhost:{port}")
    print(f" [*] LAN Workstations URL  : http://{lan_ip}:{port}")
    print(f" [*] Interactive API Docs  : http://{lan_ip}:{port}/docs")
    print(f" [*] Real-time WebSocket   : ws://{lan_ip}:{port}/ws/live")
    print(f" [*] Database Engine       : SQLite WAL Mode (data/cyphora.db)")
    print(f" [*] Automated Backups     : data/backups/ (Every 5 mins)")
    print("=" * 65)
    print(" >> Share the LAN Workstations URL with all 100 computers.")
    print(" >> Press Ctrl+C to safely shut down the server.\n")

    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()
