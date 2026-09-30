from PIL import Image

path = "C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790754791888.png"
img = Image.open(path).convert("RGBA")
pixels = img.load()

colors = set()
for x in range(20):
    for y in range(20):
        colors.add(pixels[x, y])

print("Top left 20x20 unique colors:", colors)
