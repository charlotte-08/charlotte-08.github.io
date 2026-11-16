import json
import sys
from pathlib import Path
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES=True

manifest_path=Path(sys.argv[1])
items=json.loads(manifest_path.read_text(encoding="utf-8"))
for item in items:
    source=Path(item["source"])
    output=Path(item["output"])
    output.parent.mkdir(parents=True,exist_ok=True)
    with Image.open(source) as image:
        image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        if image.mode not in ("RGB","RGBA"):
            image=image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(output,"WEBP",quality=80,method=6)
