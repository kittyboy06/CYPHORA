import sys
from PIL import Image

img = Image.open("D:/sympo/round3/public/assets/story/2 block bridge.png")
print("Bridge corner pixel:", img.getpixel((0,0)))
