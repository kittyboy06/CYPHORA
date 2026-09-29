from PIL import Image, ImageDraw

path = "C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790672504617.png"
img = Image.open(path).convert("RGBA")

# Flood fill the (0,0,0,255) from the corner (0,0) with (0,0,0,0)
ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=20)

img.save("public/assets/beast.png")
print("Saved beast.png")
