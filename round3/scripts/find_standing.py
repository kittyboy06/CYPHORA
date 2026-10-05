import subprocess, io, sys
from PIL import Image

result = subprocess.run(
    ["git", "show", "7d8d29c:round3/public/assets/story/character_standing_v3.png"],
    capture_output=True, cwd="D:/sympo"
)
print(f"Return code: {result.returncode}, stdout bytes: {len(result.stdout)}")
if result.returncode == 0 and len(result.stdout) > 100:
    img = Image.open(io.BytesIO(result.stdout))
    print(f"Size: {img.size}")
else:
    print(f"Stderr: {result.stderr.decode()[:200]}")

# Also check if there's an untracked original somewhere
import os
for root, dirs, files in os.walk("D:/sympo/round3/public/assets"):
    for f in files:
        if "character" in f.lower() or "standing" in f.lower():
            path = os.path.join(root, f)
            try:
                img = Image.open(path)
                print(f"Found: {path} -> {img.size}")
            except:
                pass
