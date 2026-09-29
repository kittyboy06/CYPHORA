from PIL import Image

def analyze_image(path):
    try:
        img = Image.open(path)
        print(f"File: {path}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
        # Check corners for background color
        pixels = img.load()
        if img.mode == 'RGBA':
            print("Corner pixels (RGBA):", pixels[0,0], pixels[img.size[0]-1, 0])
        else:
            print("Corner pixels (RGB):", pixels[0,0], pixels[img.size[0]-1, 0])
        print("---")
    except Exception as e:
        print(f"Failed to open {path}: {e}")

analyze_image('C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790495662725.png') # BG
analyze_image('C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790495762397.png') # Tiles
analyze_image('C:/Users/Harshan B/.gemini/antigravity/brain/ea20702c-b4e6-42f2-b9a2-ae35f77b7351/.user_uploaded/media_1790495966298.png') # Char
