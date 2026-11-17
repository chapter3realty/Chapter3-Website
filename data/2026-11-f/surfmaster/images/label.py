"""Crop the NAIP export to the two Surfmaster towers and label them from coordinates, never by eye.
Surfmaster I and II: lot-footprint centers from county layer 24 (data county.json flood.footprint_center and extra raw/distance.txt).
Atlantic Ocean: a given point in the water. Run in a folder holding sm-raw.jpg and bbox in naip-frame.json."""
import json, math, os
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('naip-frame.json'))['bbox3857']
im=Image.open('sm-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
CX,CY,CW,CH=500,300,1600,1200
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('sm-crop-plain.jpg',quality=95)
def ll(px,py):
  x=bb[0]+px/W*(bb[2]-bb[0]); y=bb[3]-py/H*(bb[3]-bb[1])
  return math.degrees(x/R), math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
wlo,wla=ll(1560,960)
LAB=[('Surfmaster I',-78.987089,33.589073,'pt','r'),('Surfmaster II',-78.987544,33.58858,'pt','r'),('Atlantic Ocean',wlo,wla,'it','c')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(crop); rec=[]
for text,lo,la,st,al in LAB:
  x,y=P(lo,la); x-=CX; y-=CY
  assert 0<x<CW and 0<y<CH, text
  font=ImageFont.truetype(FI if st=="it" else FB,76 if st=="pt" else 64)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x+34,y-th/2-8
  else: ox,oy=x-tw/2,y-th/2
  assert 0<=ox and ox+tw<=CW and 0<=oy and oy+th<=0.9*CH, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=9,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
crop.save('sm-crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'labels':rec},open('labels.json','w'),indent=1)
D='/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/wt-139/chapter3realty/images/2026-11-f/surfmaster'
os.makedirs(D,exist_ok=True)
S='surfmaster-from-above'
def save(img,name): img.save(f'{D}/{S}-{name}.webp','WEBP',quality=82,method=6)
c=Image.open('sm-crop-labelled.jpg')
save(c.resize((1200,900),Image.LANCZOS),'1200w'); save(c.resize((600,450),Image.LANCZOS),'600w')
save(c.resize((1200,900),Image.LANCZOS),'4x3')
save(c.crop((0,150,1600,1050)).resize((1200,675),Image.LANCZOS),'16x9')
save(c.crop((100,0,1300,1200)),'1x1')
print(rec)
