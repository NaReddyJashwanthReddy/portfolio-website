"""Publish a finished Flowframes breath without changing any body/cloud assets.

Input: the 1200x600 transparent PNG sequence exported at 6 FPS and x10.
The folder's generated FPS label does not change the intended 60 FPS playback.
"""
from pathlib import Path
import argparse
import hashlib
import json
import tempfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / 'output/desktop-dragon/flame-flowframes-v5-heavenly-demonic/New folder/01-full-breath-10x-RIFE-RIFE4.0-22.222fps'
CROP = (0, 50, 1200, 550)
PALETTE = 'black-gold-crimson'


def export_finished_flames(source):
    source = Path(source).resolve()
    files = sorted(source.glob('*.png'))
    if len(files) != 410 or [p.name for p in files] != [f'{i + 1:08d}.png' for i in range(410)]:
        raise ValueError('Expected all 410 consecutively numbered full-breath PNGs')
    digest = hashlib.sha256()
    for path in files:
        digest.update(path.read_bytes())
        with Image.open(path) as frame:
            if frame.mode != 'RGBA' or frame.size != (1200, 600):
                raise ValueError(f'Invalid transparent frame: {path.name}')
            alpha = frame.getchannel('A')
            if alpha.crop((0, 0, 1200, 1)).getbbox() or alpha.crop((0, 599, 1200, 600)).getbbox():
                raise ValueError(f'Clipped flame: {path.name}')
    with Image.open(files[0]) as first, Image.open(files[-1]) as last:
        if first.getchannel('A').getbbox() or last.getchannel('A').getbbox():
            raise ValueError('The full breath must start and end transparently')

    (ROOT / 'output').mkdir(exist_ok=True)

    for profile in ('desktop', 'mobile'):
        dest = ROOT / 'public/assets/skygarden/guardian/v2' / profile
        manifest_path = dest / 'manifest.json'
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        spec = manifest['animations']['fire']
        original_pages = spec['pages'][:]
        width, height = spec['width'], spec['height']
        columns, page_frames = manifest['columns'], manifest['pageFrames']
        assert width * columns <= 2048
        assert height * ((page_frames + columns - 1) // columns) <= 2048
        # Keep the already verified muzzle registration and mirror in the renderer.
        assert (width, height, spec['left'], spec['top']) == (
            (440, 183, 416, 50) if profile == 'desktop' else (264, 110, 249, 30))
        pages = []
        with tempfile.TemporaryDirectory(prefix='guardian-fire-', dir=ROOT / 'output') as staged:
            staged = Path(staged)
            for start in range(0, len(files), page_frames):
                count = min(page_frames, len(files) - start)
                sheet = Image.new('RGBA', (width * columns, height * ((count + columns - 1) // columns)))
                for slot, path in enumerate(files[start:start + count]):
                    with Image.open(path) as frame:
                        frame = frame.crop(CROP).resize((width, height), Image.Resampling.LANCZOS)
                        sheet.alpha_composite(frame, ((slot % columns) * width, (slot // columns) * height))
                name = f'fire-heavenly-{len(pages):02}.webp'
                sheet.save(staged / name, quality=82, method=4, exact=True)
                with Image.open(staged / name) as check:
                    assert check.mode == 'RGBA' and check.size == sheet.size
                    check.verify()
                pages.append(name)
            for name in pages:
                (dest / name).write_bytes((staged / name).read_bytes())
        spec.update(frames=len(files), fps=60, loop=False, pages=pages)
        manifest.update(fireSeconds=len(files) / 60, firePalette=PALETTE, fireSourceSha256=digest.hexdigest())
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
        for name in set(original_pages) - set(pages):
            old = (dest / name).resolve()
            if old.parent != dest.resolve() or old.suffix != '.webp' or not old.name.startswith('fire-'):
                raise ValueError(f'Unexpected old flame path: {old}')
            old.unlink(missing_ok=True)
        print(f'PASS {profile}: {len(files)} frames, {len(pages)} bounded RGBA pages, registered mouth unchanged', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', nargs='?', type=Path, default=DEFAULT)
    export_finished_flames(parser.parse_args().source)
