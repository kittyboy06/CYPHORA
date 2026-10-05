import os

prologue_dir = r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\public\assets\prologue'
scratch_dir = r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\scratch_panels'

html = """<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; }
  .card { background: #222; border: 1px solid #444; border-radius: 8px; padding: 10px; max-width: 500px; }
  img { max-width: 100%; height: auto; display: block; border-radius: 4px; }
  h3 { margin-top: 0; color: #dfb125; font-size: 14px; word-break: break-all; }
  .full-card { max-width: 750px; margin-bottom: 30px; }
</style>
</head>
<body>
<h1>Full Images (1 to 10)</h1>
<div class="grid">
"""

for i in range(1, 11):
    fname = f"ChatGPT Image Sep 26, 2026, 01_57_47 PM ({i}).png"
    p = os.path.join(prologue_dir, fname)
    if os.path.exists(p):
        html += f"""
        <div class="card full-card">
          <h3>({i}) {fname}</h3>
          <img src="/assets/prologue/{fname}" />
        </div>
        """

html += """
</div>
<h1>Existing Scene Files</h1>
<div class="grid">
"""

for s in ['scene1_awakening.png', 'scene2_gear.png', 'scene3_light.png', 'scene4_radio.png', 'scene5_warning.png', 'scene6_decision.png']:
    html += f"""
    <div class="card">
      <h3>{s}</h3>
      <img src="/assets/prologue/{s}" />
    </div>
    """

html += """
</div>
</body>
</html>
"""

with open(r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\public\preview_prologue.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('preview_prologue.html created successfully!')
