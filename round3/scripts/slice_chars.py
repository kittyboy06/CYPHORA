from PIL import Image

def slice_chars():
    img = Image.open('public/assets/char_new.png')
    
    # Let's slice based on fixed width.
    # Total width 1024. 
    # Row 1 has 22 sprites.
    # We can try width = 1024 / 22.0 = 46.545
    
    char_w = 1024 / 22.0
    char_h = 110
    
    for i in range(22):
        x1 = i * char_w
        x2 = (i + 1) * char_w
        char = img.crop((x1, 0, x2, char_h))
        char.save(f'public/assets/char_row1_{i}.png')
        
slice_chars()
