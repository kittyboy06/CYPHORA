import os
from PIL import Image

TARGET_HEIGHT = 125
story_dir = 'public/assets/story'
out_dir = 'public/assets'

def get_alpha_bbox(img, threshold=10):
    import numpy as np
    arr = np.array(img)
    alpha = arr[:,:,3]
    y_idx = np.where(np.any(alpha > threshold, axis=1))[0]
    x_idx = np.where(np.any(alpha > threshold, axis=0))[0]
    if len(y_idx) == 0 or len(x_idx) == 0:
        return None
    return (x_idx[0], y_idx[0], x_idx[-1]+1, y_idx[-1]+1)

def process_file(filename, out_name):
    path = os.path.join(story_dir, filename)
    if not os.path.exists(path):
        return
    img = Image.open(path).convert('RGBA')
    bbox = get_alpha_bbox(img, 10)
    if bbox:
        img = img.crop(bbox)
    aspect = img.width / img.height
    new_width = max(1, int(TARGET_HEIGHT * aspect))
    img = img.resize((new_width, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(out_dir, out_name)
    img.save(out_path)
    print(f"Saved {out_name}")

process_file('jumping_getting_ready_v2.png', 'hero_jump_1.png')
process_file('jumping_getting_ready_2_v2.png', 'hero_jump_2.png')
process_file('landing_on_air_v2.png', 'hero_fall_1.png')
process_file('landing_impact_v2.png', 'hero_fall_2.png')
process_file('recovery_from_landing_impact_v2.png', 'hero_fall_3.png')
