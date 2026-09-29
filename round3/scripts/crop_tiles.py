from PIL import Image

def autocrop(img, path):
    bbox = img.getbbox()
    if bbox:
        img.crop(bbox).save(path)
    else:
        img.save(path)

img = Image.open('public/assets/tiles_new.png')

# Ground tile: Row 2, tile 3 (x: 341 to 512, y: 110 to 220)
ground = img.crop((341, 110, 512, 220))
autocrop(ground, 'public/assets/new_tile_ground.png')

# Spike tile: Row 3, (let's grab x: 300 to 500, y: 220 to 341)
spikes1 = img.crop((300, 220, 500, 341))
autocrop(spikes1, 'public/assets/new_tile_spikes1.png')

# Spike tile 2: Row 3, (let's grab x: 500 to 700, y: 220 to 341)
spikes2 = img.crop((500, 220, 700, 341))
autocrop(spikes2, 'public/assets/new_tile_spikes2.png')
