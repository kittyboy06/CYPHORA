import os
from PIL import Image

def crop_image(filepath):
    try:
        img = Image.open(filepath).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            cropped = img.crop(bbox)
            cropped.save(filepath)
            print(f"Cropped {os.path.basename(filepath)} to {bbox}")
        else:
            print(f"No bbox found for {filepath}")
    except Exception as e:
        print(f"Error on {filepath}: {e}")

assets_dir = "D:/sympo/round3/public/assets"
story_dir = os.path.join(assets_dir, "story")

for f in os.listdir(assets_dir):
    if f.endswith("_block_bridge.png"):
        crop_image(os.path.join(assets_dir, f))

for f in os.listdir(story_dir):
    if f.endswith(".png"):
        crop_image(os.path.join(story_dir, f))
