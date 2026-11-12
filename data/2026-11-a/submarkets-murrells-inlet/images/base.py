"""The map base for /submarkets/murrells-inlet/: the USGS Imagery Only basemap (public domain), exported
for the box BX in Web Mercator. Run in a scratch folder: python3 -I base.py. Writes mi-aerial-raw.jpg,
then mi-aerial-1000.webp for the page."""
import math, json, urllib.parse, subprocess
from PIL import Image
BX=[-79.105,33.515,-78.985,33.648]; W=1400
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
H=round(W*(my(BX[3])-my(BX[1]))/(mx(BX[2])-mx(BX[0])))
q={'bbox':f'{mx(BX[0])},{my(BX[1])},{mx(BX[2])},{my(BX[3])}','bboxSR':3857,'imageSR':3857,'size':f'{W},{H}','format':'jpg','f':'image'}
url='https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export?'+urllib.parse.urlencode(q)
r=subprocess.run(['curl','-sS','-m','240','--retry','3','-o','mi-aerial-raw.jpg','-w','%{http_code} %{size_download}',url],capture_output=True,text=True); print(W,H,r.stdout,r.stderr)
json.dump({'bbox':BX,'size':[W,H],'url':url},open('base-frame.json','w'),indent=1)
im=Image.open('mi-aerial-raw.jpg').convert('RGB'); im.resize((1000,round(1000*H/W)),Image.LANCZOS).save('mi-aerial-1000.webp',quality=72,method=6)
# The export has a no-imagery block over the sea at the lower right: fill it, row by row, with the sea's
# own colour just left of it (as the Garden City map base does), then soften the seam.
import numpy as np
from PIL import ImageFilter
a=np.array(im).astype(np.int16); Hh,Ww,_=a.shape
white=(a.min(axis=2)>238); white[:int(Hh*0.5),:]=False; white[:,:int(Ww*0.75)]=False
o=a.copy()
for y in range(Hh):
  xs=np.where(white[y])[0]
  if len(xs)==0: continue
  x0=xs[0]; o[y,x0:]=a[y,max(0,x0-40):x0-8].mean(axis=0)
img=Image.fromarray(o.clip(0,255).astype(np.uint8))
mask=Image.fromarray((white*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
img=Image.composite(img.filter(ImageFilter.GaussianBlur(10)),img,mask)
print('filled',int(white.sum()))
img.resize((1000,round(1000*Hh/Ww)),Image.LANCZOS).save('mi-aerial-1000.webp',quality=72,method=6)
