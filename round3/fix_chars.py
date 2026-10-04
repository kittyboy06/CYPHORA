import re

with open('src/game/GameScene.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(r'\n        const targetY =', '\n        const targetY =')

with open('src/game/GameScene.ts', 'w', encoding='utf-8') as f:
    f.write(code)
