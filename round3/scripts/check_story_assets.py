import os
from PIL import Image

folder = "D:/sympo/round3/public/assets/story"
for f in os.listdir(folder):
    if f.endswith('.png'):
        try:
            img = Image.open(os.path.join(folder, f))
            print(f"{f}: {img.size} {img.mode}")
        except Exception as e:
            print(f"Error {f}: {e}")
