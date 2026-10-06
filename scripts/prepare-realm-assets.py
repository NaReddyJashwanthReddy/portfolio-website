"""Package the approved Flowframes results for pausable canvas playback."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / 'output/landing-refinement'
DEST = ROOT / 'public/assets/skygarden/guardian'
DEST.mkdir(parents=True, exist_ok=True)

def atlas(files, name, size, columns):
    sheet = Image.new('RGBA', (size[0] * columns, size[1] * ((len(files) + columns - 1) // columns)))
    for i, file in enumerate(files):
        frame = Image.open(file).convert('RGBA').resize(size, Image.Resampling.LANCZOS)
        sheet.alpha_composite(frame, ((i % columns) * size[0], (i // columns) * size[1]))
    sheet.save(DEST / name, 'WEBP', quality=83, method=6)
    return {'file': name, 'frames': len(files), 'frameWidth': size[0], 'frameHeight': size[1], 'columns': columns}

idle = sorted((REF / 'serpentine-dragon-v3/New folder-10x-RIFE-RIFE4.0-22.22fps').glob('*.png'))
travel = sorted((REF / 'dragon-flowframes-assets-v2/motion/dragon-left-10x-RIFE-RIFE4.0-22.222fps').glob('*.png'))
clouds = sorted((REF / 'cloud-carried-dragon-v1/cloud-interpolated-v2').glob('*.png'))
assert len(idle) == len(travel) == 80
assert len(clouds) == 81
manifest = {
    'idle': atlas(idle, 'idle-atlas.webp', (400, 275), 10),
    'travel': atlas(travel, 'travel-atlas.webp', (400, 275), 10),
    'clouds': atlas(clouds[::10], 'cloud-atlas.webp', (320, 240), 3),
    'frameMs': 45,
    'source': 'User-approved transparent Flowframes PNG exports; right travel mirrors the approved left cycle.'
}
hover = Image.open(REF / 'dragon-motion-reviewed-v3/hover-front-hindlegs-v3.png').convert('RGBA')
hover.thumbnail((640, 480), Image.Resampling.LANCZOS)
hover.save(DEST / 'hover-front.webp', quality=90, method=6)
poster = Image.open(idle[0]).convert('RGBA')
poster.save(DEST / 'idle-poster.webp', quality=90, method=6)
(DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({'assets': manifest, 'bytes': sum(p.stat().st_size for p in DEST.iterdir())}, indent=2))
