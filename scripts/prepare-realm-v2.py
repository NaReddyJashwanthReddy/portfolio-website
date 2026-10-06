from pathlib import Path
from PIL import Image
import shutil

ROOT = Path(__file__).resolve().parents[1]
GEN = Path('C:/Users/tangw/.codex/generated_images/01a0f240-1da2-7a30-a01c-2224a10977ae')
OUT = ROOT / 'output/landing-refinement/heavenly-realm-v2'
OUT.mkdir(parents=True, exist_ok=True)
for source, destination, public, size in [
    ('exec-fbd96627-efc1-4586-a120-ad3b9a68c3b6.png', 'heavenly-sky-v2.png', 'heavenly-sky-v2.webp', None),
    ('exec-55952b9b-28ac-4cce-bbf5-6a04cd2c491d.png', 'exhale-front.png', 'guardian/exhale-front.webp', (640, 480)),
]:
    shutil.copy2(GEN / source, OUT / destination)
    image = Image.open(OUT / destination)
    if size:
        assert image.mode == 'RGBA' and image.getchannel('A').getextrema()[0] == 0
        image.thumbnail(size, Image.Resampling.LANCZOS)
    image.save(ROOT / 'public/assets/skygarden' / public, 'WEBP', quality=91, method=6)
    print(destination, image.size, image.mode)
