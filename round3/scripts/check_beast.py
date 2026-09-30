from PIL import Image

path = "C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790672504617.png"
img = Image.open(path)
print(f"Mode: {img.mode}")
pixels = img.load()
if img.mode == 'RGBA':
    print(f"Corner pixel: {pixels[0,0]}")
