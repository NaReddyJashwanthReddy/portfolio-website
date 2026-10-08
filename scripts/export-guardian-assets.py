"""Publish the finished companion clips as bounded, transparent web textures.

Run locally where output/desktop-dragon and its completed Flowframes inputs exist.
The generated files are committed; the website does not require Python.
"""
from pathlib import Path
import json, sys
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'output/desktop-dragon'))
import desktop_dragon as desktop
from human_motion import HumanFrames
from cloud_motion import CloudMotion
from companion_layout import dragon_reference

OUT=ROOT/'public/assets/skygarden/guardian/v2'
OUT.mkdir(parents=True,exist_ok=True)

def straight(raw,w,h):
    rgba=np.frombuffer(raw,np.uint8).reshape(h,w,4)[:,:,[2,1,0,3]].copy()
    alpha=rgba[:,:,3:].astype(np.uint16)
    rgba[:,:,:3]=np.minimum(255,(rgba[:,:,:3].astype(np.uint16)*255+np.maximum(alpha,1)//2)//np.maximum(alpha,1)).astype('uint8')
    rgba[rgba[:,:,3]==0,:3]=0
    return Image.fromarray(rgba)

sources=desktop.load_frames()
for profile,size,columns,page_frames in [('mobile',240,5,40),('desktop',400,3,12)]:
    dest=OUT/profile;dest.mkdir(exist_ok=True)
    height=round(size*.95);pad=round(size*.16);width=size+pad*2
    animations={}
    def pack(name,count,fps,frames,left=0,top=0,loop=True):
        iterator=iter(frames);pages=[];written=0
        while written<count:
            number=min(page_frames,count-written);first=next(iterator);fw,fh=first.size
            sheet=Image.new('RGBA',(fw*columns,fh*((number+columns-1)//columns)))
            assert max(sheet.size)<=2048
            sheet.alpha_composite(first,(0,0))
            for i in range(1,number):sheet.alpha_composite(next(iterator),((i%columns)*fw,(i//columns)*fh))
            filename=f'{name}-{len(pages):02}.webp'
            sheet.save(dest/filename,quality=82,method=4,exact=True)
            pages.append(filename);written+=number
        animations[name]={'frames':count,'fps':fps,'width':fw,'height':fh,'left':left,'top':top,'loop':loop,'pages':pages}
        print(profile,name,count,'frames',len(pages),'pages',flush=True)
    for name in ('idle','left','right'):
        pack(name,len(sources[name]),desktop.FRAME_RATES[name],
            (straight(desktop.prepare_frame(frame,size,height,pad,width),width,height) for frame in sources[name]))
    human=HumanFrames(desktop.HUMAN_ASSET,size,height,width,height_extra=desktop.HUMAN_EXTRA_HEIGHT*size/400)
    pack('human',80,desktop.FRAME_RATES['human'],(human.render(i) for i in range(80)))
    registered=json.loads((desktop.HOVER_MOTION/'manifest.json').read_text())['registered_bounds']
    pack('hover',20,desktop.FRAME_RATES['hover'],(desktop.hover_image(frame,size,height,width,registered) for frame in sources['hover']))
    clouds=CloudMotion(size,height,width,desktop.side_layout(size,height,width),desktop.premultiply)
    for kind,frames in clouds.frames.items():
        pack('cloud_'+kind,len(frames),60,(straight(frame.tobytes(),clouds.width,clouds.height) for frame in frames),clouds.left,clouds.top,kind=='drift')
    with Image.open(sources['right'][0]) as source:left,top,fire=desktop.make_breath_frames(size,height,source,'right',pad)
    fh,fw=fire[0].shape[:2]
    pack('fire',len(fire),60,(straight(frame.tobytes(),fw,fh) for frame in fire),left,top,False)
    manifest={'version':2,'profile':profile,'width':width,'height':height,'bodySize':size,'feet':dragon_reference(size,height)[1],
        'columns':columns,'pageFrames':page_frames,'animations':animations,'cloudSeconds':2,'hoverSeconds':5,'fireSeconds':desktop.BREATH_SECONDS}
    (dest/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    poster=straight(desktop.prepare_frame(sources['idle'][0],size,height,pad,width),width,height)
    scale=768/width
    canvas=Image.new('RGBA',(640,600));canvas.alpha_composite(poster.resize((round(width*scale),round(height*scale)),Image.Resampling.LANCZOS),
        (round((640-width*scale)/2),round(402.4-manifest['feet']*scale)))
    canvas.save(dest/'poster.webp',quality=86,method=4)
print('PASS',round(sum(p.stat().st_size for p in OUT.rglob('*.webp'))/1024**2,2),'MiB of web assets',flush=True)
