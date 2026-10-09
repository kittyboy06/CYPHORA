import os
import numpy as np
from PIL import Image

TARGET_HEIGHT = 125
ITEM_TARGET_HEIGHT = 60

story_dir = 'public/assets/story'
out_dir = 'public/assets'

def get_alpha_bbox(img, threshold=10):
    arr = np.array(img)
    alpha = arr[:,:,3]
    y_idx = np.where(np.any(alpha > threshold, axis=1))[0]
    x_idx = np.where(np.any(alpha > threshold, axis=0))[0]
    if len(y_idx) == 0 or len(x_idx) == 0:
        return None
    return (x_idx[0], y_idx[0], x_idx[-1]+1, y_idx[-1]+1)

def process_hero_anim(filename, out_name):
    path = os.path.join(story_dir, filename)
    if not os.path.exists(path):
        print(f"Skipping {filename}")
        return
    img = Image.open(path).convert('RGBA')
    
    # Crop to bounding box of pixels with alpha > 10
    bbox = get_alpha_bbox(img, 10)
    if bbox:
        img = img.crop(bbox)
    
    # Resize to TARGET_HEIGHT
    aspect = img.width / img.height
    new_width = max(1, int(TARGET_HEIGHT * aspect))
    img = img.resize((new_width, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(out_dir, out_name)
    img.save(out_path)
    print(f"Saved {out_name} (Size: {img.size})")

def process_item(filename, out_name):
    path = os.path.join(story_dir, filename)
    if not os.path.exists(path):
        return
    img = Image.open(path).convert('RGBA')
    bbox = get_alpha_bbox(img, 10)
    if bbox:
        img = img.crop(bbox)
    
    aspect = img.width / img.height
    new_width = max(1, int(ITEM_TARGET_HEIGHT * aspect))
    img = img.resize((new_width, ITEM_TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(out_dir, out_name)
    img.save(out_path)

# Process Sword and Shield
process_item("Fantasy Sword .png", "item_sword.png")
process_item("Fantasy Shield.png", "item_shield.png")

# Process hero with sword
for i in [1, 2, 3, 4]:
    process_hero_anim(f"hero_running_with_sword_{i}.png", f"hero_run_sword_{i}.png")
process_hero_anim("hero_running_with_sword_7.png", "hero_run_sword_5.png")
process_hero_anim("hero_running_with_sword_7.png", "hero_run_sword_7.png")

# Also ensure round3/public/assets receives the files
r3_out_dir = 'round3/public/assets'
if os.path.exists(r3_out_dir):
    for f in os.listdir(out_dir):
        if f.startswith('hero_run_sword') or f.startswith('item_'):
            import shutil
            shutil.copy2(os.path.join(out_dir, f), os.path.join(r3_out_dir, f))

# Process hero with sword and shield
for i in [1, 2, 3, 4]:
    process_hero_anim(f"hero_running_with_sword_and_shield_{i}.png", f"hero_run_sword_shield_{i}.png")

