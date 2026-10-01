import os
from PIL import Image

assets_dir = "D:/sympo/round3/public/assets"
story_dir = os.path.join(assets_dir, "story")

TILE_W = 140

# Resize bridges
bridge_sizes = {
    "2_block_bridge.png": 2,
    "3_block_bridge.png": 3,
    "4_block_bridge.png": 4,
    "5_block_bridge.png": 5,
    "6_block_bridge.png": 6
}

for filename, blocks in bridge_sizes.items():
    filepath = os.path.join(assets_dir, filename)
    if os.path.exists(filepath):
        try:
            img = Image.open(filepath).convert("RGBA")
            target_w = blocks * TILE_W
            ratio = target_w / float(img.width)
            target_h = int(float(img.height) * float(ratio))
            
            # High quality resize
            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            resized.save(filepath)
            print(f"Resized {filename} to {target_w}x{target_h}")
        except Exception as e:
            print(f"Failed {filename}: {e}")

# Resize character
CHARACTER_SCALE = 0.12

for f in os.listdir(story_dir):
    if f.endswith(".png"):
        filepath = os.path.join(story_dir, f)
        try:
            img = Image.open(filepath).convert("RGBA")
            target_w = max(1, int(img.width * CHARACTER_SCALE))
            target_h = max(1, int(img.height * CHARACTER_SCALE))
            
            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            resized.save(filepath)
            print(f"Resized {f} to {target_w}x{target_h}")
        except Exception as e:
            print(f"Failed {f}: {e}")

# Resize Beast
beast_path = os.path.join(assets_dir, "beast.png")
if os.path.exists(beast_path):
    try:
        img = Image.open(beast_path).convert("RGBA")
        resized = img.resize((180, 150), Image.Resampling.LANCZOS)
        resized.save(beast_path)
        print("Resized beast.png")
    except Exception as e:
        print(f"Failed beast: {e}")
