"""Crop the NAIP export to the Grand Atlantic and label it from coordinates, never by eye.
Grand Atlantic: the FAA Digital Obstacle File point 45-052667 (33 40 08.57N 078 54 21.07W), facts row 4, inside the lot.
Atlantic Ocean: a given point in the water. Run in a folder holding ga-raw.jpg (the export in naip-frames.json)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('naip-frames.json'))['grand-atlantic']['bbox3857']
im=Image.open('ga-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
inv=lambda x,y:(math.degrees((bb[0]+x/W*(bb[2]-bb[0]))/R), math.degrees(2*math.atan(math.exp((bb[3]-y/H*(bb[3]-bb[1]))/R))-math.pi/2))
WLO,WLA=inv(1500,1100)
CX,CY,CW,CH=240,160,1600,1200
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('ga-crop-plain.jpg',quality=95)
LAB=[('Grand Atlantic',-78.905853,33.669047,'pt'),('Atlantic Ocean',round(WLO,6),round(WLA,6),'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(crop); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la); x-=CX; y-=CY
  assert 0<x<CW and 0<y<CH, text
  font=ImageFont.truetype(FI if st=='it' else FB,76)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x-tw/2-120,y-th-34
  else: ox,oy=x-tw/2,y-th/2
  assert 0<=ox and ox+tw<=CW and 0<=oy and oy+th<=0.9*CH, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=9,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
crop.save('ga-crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'labels':rec},open('labels.json','w'),indent=1)
print(rec)
