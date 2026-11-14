"""Crop the NAIP export to the Palace and Landmark, and label them from coordinates, never by eye.
The Palace: the FAA Digital Obstacle File point 45-000725 (33 40 21.00N 078 54 06.00W), facts row 1.
Landmark Resort: the middle of the county parcel layer's box for LANDMARK HPR PH I and II (parcels-near.json)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
fr=json.load(open('naip-frames.json'))['palace']; bb=fr['bbox3857']
im=Image.open('palace-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
CX,CY,CW,CH=300,300,1600,1200
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('palace-crop-plain.jpg',quality=95)
LAB=[('The Palace',-78.901667,33.672500,'pt'),('Landmark Resort',(-78.901348-78.900264)/2,(33.672695+33.673687)/2,'pt'),('Atlantic Ocean',-78.90012,33.67235,'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(crop); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la); x-=CX; y-=CY
  assert 0<x<CW and 0<y<CH, text
  font=ImageFont.truetype(FI if st=='it' else FB,76)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x-tw/2,y-th-34
  else: ox,oy=x-tw/2,y-th/2

  assert 0<=ox and ox+tw<=CW and 0<=oy and oy+th<=0.9*CH, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=9,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
crop.save('palace-crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'labels':rec},open('labels.json','w'),indent=1)
print(rec)
