from PIL import Image

img = Image.open('public/assets/sprite_sheet.jpg')
pixels = img.load()

# Get background color from top-left (0,0) and a bit down
print("Color at 0,0:", pixels[0, 0])
print("Color at 0,20:", pixels[0, 20])
print("Color at 0,250:", pixels[0, 250])

# Forest background starts around halfway down (y=256-ish)
print("Color at 0,300:", pixels[0, 300])
