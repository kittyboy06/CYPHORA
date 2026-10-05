import re

with open('src/game/GameScene.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;",
    "const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;\\n        const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;"
)

with open('src/game/GameScene.ts', 'w', encoding='utf-8') as f:
    f.write(code)
