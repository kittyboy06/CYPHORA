import os
from PIL import Image, ImageDraw

folder = "D:/sympo/round3/public/assets/story"
out_folder = "D:/sympo/round3/public/assets"

bridges = ["2 block bridge.png", "3 block bridge.png", "4 block bridge.png", "5 block bridge.png"]

for bridge_name in bridges:
    img = Image.open(os.path.join(folder, bridge_name)).convert("RGBA")
    # Floodfill from (0,0) with transparent
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=20)
    img.save(os.path.join(out_folder, bridge_name))
    print(f"Cleaned {bridge_name}")
