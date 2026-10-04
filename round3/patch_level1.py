import re

with open('src/levels/level1.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r"playerStartX: 0,",
    r"playerStartX: 1,",
    code
)

code = re.sub(
    r"tiles: \[\s*G, G, T",
    r"tiles: [\n    G, G, G, T",
    code
)

with open('src/levels/level1.ts', 'w', encoding='utf-8') as f:
    f.write(code)
