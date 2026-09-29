from PIL import Image, ImageDraw

def draw_grid():
    img = Image.open('public/assets/sprite_sheet.jpg')
    width, height = img.size
    print(f"Size: {width}x{height}")
    
    draw = ImageDraw.Draw(img)
    
    # Draw vertical lines every 100px
    for x in range(0, width, 100):
        draw.line([(x, 0), (x, height)], fill='red', width=2)
        # Add text labels occasionally
        if x % 200 == 0:
            draw.text((x+5, 10), str(x), fill='red')

    # Draw horizontal lines every 100px
    for y in range(0, height, 100):
        draw.line([(0, y), (width, y)], fill='red', width=2)
        if y % 100 == 0:
            draw.text((10, y+5), str(y), fill='red')
            
    img.save('public/assets/grid.jpg')
    print("Saved grid.jpg")

draw_grid()
