from PIL import Image
import os

def get_sprite_boxes(img):
    """Finds bounding boxes of individual sprites assuming they are separated by transparent pixels horizontally."""
    width, height = img.size
    pixels = img.load()
    
    # Sum alphas vertically to find empty columns
    col_alphas = [sum(pixels[x, y][3] for y in range(height)) for x in range(width)]
    
    boxes = []
    in_sprite = False
    start_x = 0
    
    for x, alpha in enumerate(col_alphas):
        if alpha > 0 and not in_sprite:
            in_sprite = True
            start_x = x
        elif alpha == 0 and in_sprite:
            in_sprite = False
            # Found a sprite spanning from start_x to x
            # Now find top and bottom bounds for this specific slice
            min_y, max_y = height, 0
            for curr_x in range(start_x, x):
                for y in range(height):
                    if pixels[curr_x, y][3] > 0:
                        if y < min_y: min_y = y
                        if y > max_y: max_y = y
            
            # Add some padding
            boxes.append((max(0, start_x - 1), max(0, min_y - 1), min(width, x + 1), min(height, max_y + 1)))
            
    return boxes

def slice_characters():
    img = Image.open('public/assets/char_new.png')
    
    # Row 1 (y: 0 to 110 approx)
    row1 = img.crop((0, 0, 1024, 110))
    boxes1 = get_sprite_boxes(row1)
    
    print(f"Row 1 sprites found: {len(boxes1)}") # Expecting ~22
    
    # Save Idle (frames 0, 1, 2, 3)
    # We only really need 1 frame for idle, but let's grab the first one
    if len(boxes1) > 0:
        row1.crop(boxes1[0]).save('public/assets/char_idle.png')
    
    # Run frames start after Idle (4) + Walk (8) = index 12. Let's grab 6 frames of run.
    run_start = 12
    for i in range(6):
        if run_start + i < len(boxes1):
            row1.crop(boxes1[run_start + i]).save(f'public/assets/char_run_{i}.png')
            
    # Jump (Takeoff) is at the end of Row 1. Let's just grab the last one.
    if len(boxes1) > 0:
        row1.crop(boxes1[-1]).save('public/assets/char_jump.png')
        
    # Row 2 (y: 110 to 220 approx)
    row2 = img.crop((0, 110, 1024, 220))
    boxes2 = get_sprite_boxes(row2)
    print(f"Row 2 sprites found: {len(boxes2)}")
    
    # Fall (Descending) starts after Jump (In Air) (4).
    # So index 4 is the first fall frame. Let's use index 5.
    if len(boxes2) > 5:
        row2.crop(boxes2[5]).save('public/assets/char_fall.png')

slice_characters()

def slice_tiles():
    img = Image.open('public/assets/tiles_new.png')
    
    # Row 2 contains individual floating platforms
    row2 = img.crop((0, 110, 1024, 225))
    boxes2 = get_sprite_boxes(row2)
    print(f"Tile Row 2 sprites found: {len(boxes2)}")
    if len(boxes2) > 2:
        # Let's take the 3rd platform which looks like a nice square block
        row2.crop(boxes2[2]).save('public/assets/tile_ground.png')
        
    # Row 3 contains spikes (bottom left)
    row3 = img.crop((0, 225, 1024, 341))
    boxes3 = get_sprite_boxes(row3)
    print(f"Tile Row 3 sprites found: {len(boxes3)}")
    if len(boxes3) > 1:
        # First one might be a slope, second might be spikes. Let's find the spikes visually.
        # Actually in the image, spikes are around the middle of the bottom row.
        # Let's just save them all and check their filenames.
        for i, b in enumerate(boxes3):
            row3.crop(b).save(f'public/assets/tile3_{i}.png')

slice_tiles()
