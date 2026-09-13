import os
import glob
import json

images_dir = "assets/images"
files = sorted([os.path.basename(f) for f in glob.glob(os.path.join(images_dir, "*.jpg"))])
with open("assets/js/gallery_data.json", "w") as f:
    json.dump(files, f, indent=2)
print(f"Generated gallery_data.json with {len(files)} photos.")
