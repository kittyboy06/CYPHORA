from PIL import Image
import os

uploads = "C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded"
candidates = [
    "media_1790754791888.png",
    "media_1790754488365.png",
    "media_1790754476474.png",
    "media_1790754352966.png",
    "media_1790754345125.png",
    "media_1790672504617.png",
]
for f in candidates:
    path = os.path.join(uploads, f)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        bbox = img.getbbox()
        print(f"{f}: size={img.size}, bbox={bbox}")
