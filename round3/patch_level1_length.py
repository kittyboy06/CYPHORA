import re

with open('src/levels/level1.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r"length: 24,",
    r"length: 25,",
    code
)

with open('src/levels/level1.ts', 'w', encoding='utf-8') as f:
    f.write(code)
