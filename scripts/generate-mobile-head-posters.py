"""Generate transparent WebP posters from first real WebGL head frames.

Input frames are captured by scripts/capture-mobile-head.mjs on the same build.
No changes to the camera, GLB, shader or dynamic pose are required.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import os
captures=Path(os.getenv('HEAD_CAPTURE_DIR','/tmp/mobile-head-captures'))
target=Path('public/assets/images')
target.mkdir(parents=True,exist_ok=True)
def extract(name):
    rgb=np.asarray(Image.open(captures/f'{name}-model-black.png').convert('RGB'),dtype=np.float32)
    # Transparent canvas reconstruction: background is RGB 6–9.
    # Preserve antialiased lines without transferring the black rectangle.
    alpha=np.clip((rgb.max(axis=2)-9.0)/19.0,0.0,1.0)
    if name=='667x375':
        # Landscape canvas screenshot also contains the CRT bezel at the
        # outer perimeter. It is not part of the head: isolate the central
        # silhouette, with ample transparent margin around the geometry.
        height,width=alpha.shape
        alpha[:round(height*.035),:]=0
        alpha[round(height*.95):,:]=0
        alpha[:,:round(width*.28)]=0
        alpha[:,round(width*.72):]=0
    return Image.fromarray(np.concatenate([rgb,(alpha*255)[...,None]],axis=2).astype('uint8'),'RGBA')
def save(image,width,filename):
    height=round(image.height*width/image.width)
    dest=target/filename
    image.resize((width,height),Image.Resampling.LANCZOS).save(dest,'WEBP',quality=91,method=6,exact=True)
    print('GENERATED',dest,width,height,dest.stat().st_size)
p=extract('390x844')
n=extract('320x568')
l=extract('667x375')
save(p,360,'mobile-head-poster-mobile-360.webp')
save(p,540,'mobile-head-poster-mobile-540.webp')
save(n,484,'mobile-head-poster-mobile-320.webp')
save(l,720,'mobile-head-poster-mobile-landscape.webp')
