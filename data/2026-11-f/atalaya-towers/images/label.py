"""Crop the NAIP export to Atalaya Towers and label it from coordinates, never by eye.
Atalaya Towers: the middle of the 79 county parcel boxes of ATALAYA TOWERS (parcels-bayview.json; flood.json footprint_center).
Atlantic Ocean: a given point in the water. Run in a folder holding at-raw.jpg (the export in naip-frames.json)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('naip-frames.json'))['atalaya']['bbox3857']
im=Image.open('at-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
CX,CY,CW,CH=600,400,1600,1200
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('at-crop-plain.jpg',quality=95)
# water point: 1900,1050 px of the export, converted to lon/lat
def ll(px,py):
  x=bb[0]+px/W*(bb[2]-bb[0]); y=bb[3]-py/H*(bb[3]-bb[1])
  return math.degrees(x/R), math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
wlo,wla=ll(2150,1250)
LAB=[('Atalaya Towers',-78.992294,33.583265,'pt'),('Atlantic Ocean',wlo,wla,'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(crop); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la); x-=CX; y-=CY
  assert 0<x<CW and 0<y<CH, text
  font=ImageFont.truetype(FI if st=="it" else FB,76 if st=="pt" else 64)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x-tw/2,y-th-34
  else: ox,oy=x-tw/2,y-th/2
  ox=min(ox,CW-tw-20)
  assert 0<=ox and ox+tw<=CW and 0<=oy and oy+th<=0.9*CH, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=9,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
crop.save('at-crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'labels':rec},open('labels.json','w'),indent=1)
print(rec)
