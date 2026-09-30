import os

folder = "D:/sympo/round3/public/assets"
story_folder = "D:/sympo/round3/public/assets/story"

def rename_in_dir(d):
    for f in os.listdir(d):
        if ' ' in f or '(' in f or ')' in f:
            new_name = f.replace(' ', '_').replace('(', '').replace(')', '')
            os.rename(os.path.join(d, f), os.path.join(d, new_name))
            print(f"Renamed {f} to {new_name}")

rename_in_dir(folder)
rename_in_dir(story_folder)
