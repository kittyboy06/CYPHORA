import os
import cv2
import numpy as np
from PIL import Image

prologue_dir = r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\public\assets\prologue'
cand_dir = r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\public\assets\prologue\candidates'
os.makedirs(cand_dir, exist_ok=True)

# Helper to crop a sub-rectangle from an image
def extract_box(img_num, x1, y1, x2, y2, name):
    p = os.path.join(prologue_dir, f'ChatGPT Image Sep 26, 2026, 01_57_47 PM ({img_num}).png')
    img = Image.open(p)
    w, h = img.size
    # clamp coords
    box = (int(x1), int(y1), int(x2), int(y2))
    crop = img.crop(box)
    out_path = os.path.join(cand_dir, f'{name}.png')
    crop.save(out_path)
    print(f'Saved {name}.png: size {crop.size}')
    return f'/assets/prologue/candidates/{name}.png'

# Let's extract specific candidate panels cleanly:

# Screen 1 candidates:
# 1. Full Image (1) (Awakening on wet ground)
extract_box(1, 0, 0, 1672, 941, 's1_cand1_img1_full')

# Screen 2 candidates (The Lost Gear / Abandoned Field Camp):
# 1. Image 4, top-center panel (Field Camp tents, generator, cases)
extract_box(4, 508, 471, 1018, 715, 's2_cand1_img4_camp')
# 2. Image 6, top-center panel (EFM Outpost container in forest)
extract_box(6, 565, 15, 1104, 311, 's2_cand2_img6_outpost')
# 3. Image 10, top-center panel (Field gear, equipment, tents, crates)
extract_box(10, 555, 10, 1100, 325, 's2_cand3_img10_gear_camp')
# 4. Image 5, top-right panel (Station exterior in forest)
extract_box(5, 1140, 10, 1645, 305, 's2_cand4_img5_station')
# 5. Image 4, middle-right panel (Broken base interior with gear, terminal, lantern)
extract_box(4, 1024, 718, 1530, 960, 's2_cand5_img4_broken_base')

# Screen 3 candidates (The Light / Monolith):
# 1. Image 10, top-left panel (Explorer with backpack looking at glowing monolith)
extract_box(10, 15, 10, 545, 325, 's3_cand1_img10_monolith_explorer')
# 2. Image 6, top-left panel (Expedition observing towering monolith at sunset)
extract_box(6, 15, 15, 550, 440, 's3_cand2_img6_monolith_sunset')
# 3. Image 4, top-left panel (Expedition looking at monolith)
extract_box(4, 20, 471, 500, 715, 's3_cand3_img4_monolith_expedition')
# 4. Image 5, top-left panel (Remote station & glowing monolith)
extract_box(5, 15, 10, 550, 305, 's3_cand4_img5_monolith_wide')
# 5. Image 2, top-left panel (Expedition log monolith view)
extract_box(2, 15, 15, 595, 315, 's3_cand5_img2_monolith')

# Screen 4 candidates (The Radio):
# 1. Image 5, middle-center panel (Physical field radio with waveform display and red light)
extract_box(5, 562, 317, 1130, 600, 's4_cand1_img5_radio_hardware')
# 2. Image 9, middle-right panel (Field radio with oscilloscope display)
extract_box(9, 1136, 325, 1650, 615, 's4_cand2_img9_radio')
# 3. Image 7, bottom-left panel (Explorer listening to radio with headset and waveform)
extract_box(7, 15, 620, 565, 870, 's4_cand3_img7_radio_headset')
# 4. Image 6, top-right panel (Explorer listening to radio signal with waveform screen)
extract_box(6, 1110, 15, 1650, 310, 's4_cand4_img6_radio_signal')

# Screen 5 candidates (The Symbol / Something is Wrong):
# 1. Image 7, middle-center panel (Explorer holding logbook with Keyhole symbol)
extract_box(7, 570, 305, 1120, 615, 's5_cand1_img7_logbook_symbol')
# 2. Image 5, middle-right panel (Explorer holding logbook with glowing symbol)
extract_box(5, 1135, 315, 1650, 605, 's5_cand2_img5_logbook_symbol')
# 3. Image 4, top-right panel (Hands holding ancient tablet with glowing Keyhole symbol)
extract_box(4, 1025, 471, 1530, 715, 's5_cand3_img4_tablet_symbol')
# 4. Image 2, bottom-left panel (Metallic/stone plate with symbol in forest ground)
extract_box(2, 15, 610, 395, 895, 's5_cand4_img2_stone_symbol')

# Screen 6 candidates (The Decision / Control Room):
# 1. Image 5, bottom-center panel (Explorer looking at FIELD SYSTEM STATUS OFFLINE console)
extract_box(5, 560, 615, 1130, 915, 's6_cand1_img5_status_offline')
# 2. Image 3, bottom-center panel (Explorer in control room with power/radio/nav offline screens)
extract_box(3, 560, 620, 1130, 915, 's6_cand2_img3_control_room')
# 3. Image 7, bottom-center panel (Multi-screen terminal with POWER CRITICAL, RADIO OFFLINE)
extract_box(7, 570, 620, 1120, 870, 's6_cand3_img7_screens_offline')
# 4. Image 9, middle-left panel (FIELD SYSTEMS OFFLINE terminal console)
extract_box(9, 15, 325, 560, 615, 's6_cand4_img9_terminal_offline')

html = """<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #0c1012; color: #dfb125; font-family: 'Cinzel', serif; padding: 20px; }
  h1 { text-align: center; border-bottom: 2px solid #dfb125; padding-bottom: 10px; }
  h2 { margin-top: 30px; color: #f3d77f; border-left: 4px solid #dfb125; padding-left: 10px; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
  .card { background: rgba(20,25,22,0.9); border: 1px solid rgba(223, 177, 37, 0.4); border-radius: 8px; padding: 12px; max-width: 480px; flex: 1 1 400px; }
  img { width: 100%; height: auto; display: block; border-radius: 4px; border: 1px solid rgba(223,177,37,0.2); }
  h3 { font-size: 14px; margin: 8px 0; color: #e0e0e0; font-family: sans-serif; }
</style>
</head>
<body>
<h1>CYPHORA PROLOGUE — CANDIDATE SELECTIONS</h1>
"""

for screen_num, screen_title in [(1, 'SCREEN 1 — THE AWAKENING'), (2, 'SCREEN 2 — THE LOST GEAR'), (3, 'SCREEN 3 — THE LIGHT'), (4, 'SCREEN 4 — THE RADIO'), (5, 'SCREEN 5 — SOMETHING IS WRONG'), (6, 'SCREEN 6 — THE DECISION')]:
    html += f"<h2>{screen_title}</h2><div class='grid'>"
    prefix = f"s{screen_num}_cand"
    for f in sorted(os.listdir(cand_dir)):
        if f.startswith(prefix) and f.endswith('.png'):
            html += f"""
            <div class='card'>
              <h3>{f}</h3>
              <img src='/assets/prologue/candidates/{f}' />
            </div>
            """
    html += "</div>"

html += "</body></html>"

with open(r'c:\Users\praga\Downloads\CYPHORA\CYPHORA\public\candidates_preview.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('candidates_preview.html generated!')
