"""
Restore original high-res character frames from git, crop bounding boxes,
and resize them all to TARGET_H=125 using high-quality Lanczos to match
the hero_run frames. This fixes the size mismatch between running and other animations.
"""
from PIL import Image
import subprocess
import os
import io

STORY_DIR = "public/assets/story"
TARGET_H = 125

# Map: output filename -> (git_ref, original path in git)
FRAMES = {
    "character_standing_v3.png": ("7d8d29c", "round3/public/assets/story/character standing.png"),
    "jumping_getting_ready_v2.png": ("edf7843", "round3/public/assets/story/jumping_getting_ready.png"),
    "jumping_getting_ready_2_v2.png": ("edf7843", "round3/public/assets/story/jumping_getting_ready_2.png"),
    "landing_on_air_v2.png": ("edf7843", "round3/public/assets/story/landing_on_air.png"),
    "landing_impact_v2.png": ("edf7843", "round3/public/assets/story/landing_impact.png"),
    "recovery_from_landing_impact_v2.png": ("edf7843", "round3/public/assets/story/recovery_from_landing_impact.png"),
}

for out_name, (ref, git_path) in FRAMES.items():
    try:
        # Extract original from git
        result = subprocess.run(
            ["git", "show", f"{ref}:{git_path}"],
            capture_output=True, cwd="."
        )
        if result.returncode != 0:
            print(f"SKIP {out_name}: git show failed - {result.stderr.decode()[:100]}")
            continue

        img = Image.open(io.BytesIO(result.stdout)).convert("RGBA")
        original_size = img.size

        # Crop to bounding box (remove transparent padding)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

        cropped_size = img.size

        # Resize to TARGET_H with Lanczos
        ratio = TARGET_H / img.height
        new_w = max(1, int(img.width * ratio))
        resized = img.resize((new_w, TARGET_H), Image.Resampling.LANCZOS)

        out_path = os.path.join(STORY_DIR, out_name)
        resized.save(out_path)
        print(f"{out_name}: {original_size} -> crop {cropped_size} -> {new_w}x{TARGET_H}")
    except Exception as e:
        print(f"ERROR {out_name}: {e}")
