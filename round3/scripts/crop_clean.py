from PIL import Image

def autocrop_and_save(img, index, prefix):
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        # Check if this crop is too wide (probably caught a label)
        # We can crop the top 20 pixels off first to remove labels!
        cropped.save(f'public/assets/{prefix}_{index}.png')

img = Image.open('public/assets/char_new.png')

# Strip out top labels (y: 0 to 20 is labels, char is below)
# Actually, let's just crop y: 25 to 110 for the characters.
char_y1, char_y2 = 25, 110
char_w = 1024 / 22.0

for i in range(22):
    x1 = i * char_w
    x2 = (i + 1) * char_w
    char = img.crop((x1, char_y1, x2, char_y2))
    autocrop_and_save(char, i, 'clean_char1')
    
# Row 2 (Jump In Air, Fall, etc.)
# y: 135 to 220 (labels are around 110-135)
row2_y1, row2_y2 = 135, 220
char2_w = 1024 / 17.0
for i in range(17):
    x1 = i * char2_w
    x2 = (i + 1) * char2_w
    char = img.crop((x1, row2_y1, x2, row2_y2))
    autocrop_and_save(char, i, 'clean_char2')
