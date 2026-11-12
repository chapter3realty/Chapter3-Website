import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
sys.path.insert(0,'eri'); from proj import P
Image.MAX_IMAGE_PIXELS=None
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
import glob
for f in glob.glob('/usr/share/fonts/**/*.ttf',recursive=True):
  if 'DMSans' in f or 'Inter' in f: FONT=f
G=json.load(open('/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2/data/2026-11-a/submarkets-surfside-beach/map-layers.geojson'))
full=Image.open('eri/f.jpg')
def adjust(im):
  im=ImageEnhance.Contrast(im).enhance(1.08); im=ImageEnhance.Color(im).enhance(1.08); return im
def pill(d, xy, text, size, anchor='mm', bg=(28,32,40,215), fg=(255,255,255,255), dot=None):
  fnt=ImageFont.truetype(FONT,size)
  lines=text.split('\n'); bbs=[d.textbbox((0,0),l,font=fnt) for l in lines]
  w=max(b[2]-b[0] for b in bbs); lh=int(size*1.18); h=lh*len(lines)
  padx=int(size*.62); pady=int(size*.42)
  x,y=xy
  if anchor=='mm': x0=x-w/2-padx; y0=y-h/2-pady
  elif anchor=='lm': x0=x; y0=y-h/2-pady
  elif anchor=='rm': x0=x-w-2*padx; y0=y-h/2-pady
  d.rounded_rectangle([x0,y0,x0+w+2*padx,y0+h+2*pady],radius=int((h+2*pady)/2) if len(lines)==1 else int(size*.6),fill=bg)
  for i,l in enumerate(lines):
    d.text((x0+padx,y0+pady+i*lh+lh*0.08),l,font=fnt,fill=fg)
  return (x0,y0,x0+w+2*padx,y0+h+2*pady)
def crop(box,outw):
  x0,y0,x1,y1=box; im=full.crop(box).convert('RGB'); s=outw/(x1-x0)
  im=im.resize((outw,int((y1-y0)*s)),Image.LANCZOS)
  T=lambda lon,lat:((P(lon,lat)[0]-x0)*s,(P(lon,lat)[1]-y0)*s)
  return adjust(im),T,s
