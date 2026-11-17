"""Label the NAIP export of Landmark Resort from coordinates, never by eye.
Landmark Resort: placed on the oceanfront tower seen in the frame. The middle of the county parcel box for LANDMARK HPR PH I and II (flood.json footprint_bounds, 33.673521 -78.901319) falls on the crosswalk between the tower and the garage, so it is not used.
The Palace: the FAA Digital Obstacle File point 45-000725 (33 40 21.00N 078 54 06.00W)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
fr=json.load(open('naip-frames.json'))['landmark']; bb=fr['bbox3857']
im=Image.open('landmark-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
b=json.load(open('../flood.json'))['footprint_bounds']
LAB=[('Landmark Resort',-78.900740,33.673157,'pt'),('The Palace',-78.901667,33.672500,'pt'),('Atlantic Ocean',-78.89990,33.67215,'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
im.save('landmark-plain.jpg',quality=95)
d=ImageDraw.Draw(im); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la)
  assert 0<x<W and 0<y<H, text
  font=ImageFont.truetype(FI if st=='it' else FB,80)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x-tw/2,y-th-34
  else: ox,oy=x-tw/2,y-th/2
  ox=max(20,min(ox,W-tw-20))
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=9,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
im.save('landmark-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
