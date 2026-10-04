import os
import numpy as np
from PIL import Image

def get_alpha_bbox(img, threshold=10):
    arr = np.array(img)
    alpha = arr[:,:,3]
    y_idx = np.where(np.any(alpha > threshold, axis=1))[0]
    x_idx = np.where(np.any(alpha > threshold, axis=0))[0]
    if len(y_idx) == 0 or len(x_idx) == 0:
        return None
    return (x_idx[0], y_idx[0], x_idx[-1]+1, y_idx[-1]+1)

for i in range(1, 7):
    filename = f"{i}_block_bridge_v2.png"
    path = os.path.join('public/assets', filename)
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        bbox = get_alpha_bbox(img, 10)
        if bbox:
            img = img.crop(bbox)
        img.save(path)
        print(f"Cropped {filename}")
