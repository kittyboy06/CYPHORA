import re

with open('src/game/GameScene.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("private groundY = 0;", "private groundY = 0;\n  private tileHeights: number[] = [];")

code = code.replace("tile === 20", "tile === TileType.COLOR_BLUE")
code = code.replace("tile === 21", "tile === TileType.COLOR_RED")
code = code.replace("tile === 22", "tile === TileType.COLOR_GOLD")
code = code.replace("tile === 99", "tile === TileType.GOAL")
code = code.replace("tile === 23", "tile === TileType.FIRE")
code = code.replace("tile === 24", "tile === TileType.GOBLIN")
code = code.replace("tile === 25", "tile === TileType.TOTEM_FIRE")
code = code.replace("tile === 26", "tile === TileType.TOTEM_GOBLIN")

with open('src/game/GameScene.ts', 'w', encoding='utf-8') as f:
    f.write(code)
