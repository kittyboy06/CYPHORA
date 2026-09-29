from PIL import Image

def is_bg(pixel):
    # Check if pixel is dark (part of the background)
    return pixel[0] < 30 and pixel[1] < 30 and pixel[2] < 30

def make_transparent(img):
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        if is_bg(item):
            new_data.append((0, 0, 0, 0)) # Transparent
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

img = Image.open('public/assets/sprite_sheet.jpg')

# 1. Background
bg = img.crop((0, 290, 1024, 512))
bg.save('public/assets/bg_forest.jpg') # keep bg as jpg

# 2. Characters (y = 40 to 135)
char_y1, char_y2 = 40, 140

# Idle
idle = img.crop((15, char_y1, 100, char_y2))
make_transparent(idle).save('public/assets/char_idle.png')

# Run frames
for i in range(6):
    x_start = 170 + i * 86
    run_frame = img.crop((x_start, char_y1, x_start + 86, char_y2))
    make_transparent(run_frame).save(f'public/assets/char_run_{i}.png')

# Jump & Fall
jump = img.crop((710, char_y1, 800, char_y2))
make_transparent(jump).save('public/assets/char_jump.png')

fall = img.crop((850, char_y1, 950, char_y2))
make_transparent(fall).save('public/assets/char_fall.png')

# 3. Tiles (y = 180 to 280)
tile_y1, tile_y2 = 180, 280

# Normal ground tile (let's use the second block)
ground_tile = img.crop((390, tile_y1, 520, tile_y2))
make_transparent(ground_tile).save('public/assets/tile_ground.png')

# Spikes
spikes = img.crop((650, tile_y1, 715, tile_y2))
make_transparent(spikes).save('public/assets/tile_spikes.png')

print("Extraction complete!")
