import sys

with open('M:/sympo/round3/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# mojibake replacements based on utf-8 encoded files read as cp1252 or similar
# The strings to search for
replace_pairs = [
    ("â• â• â• ", "==="),
    ("ðŸ”’", "🔒"),
    ("âš ï¸ ", "⚠️"),
    ("â€”", "—")
]

for bad, good in replace_pairs:
    content = content.replace(bad, good)

with open('M:/sympo/round3/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
