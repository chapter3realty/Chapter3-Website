"""Label the NAIP export of the Sea Mist condo lot from coordinates, never by eye.
Sea Mist condo lot: the center of the union of the county's 272 parcels for TIDES/DRIFTWD/OASIS HPR (flood.json footprint_center 33.67498, -78.898459).
Atlantic Ocean: a given point in the water, inside the frame (written below as lon/lat)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
inv_lo=lambda x:math.degrees(x/R); inv_la=lambda y:math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
fr=json.load(open('naip-frames.json'))['seamist']; bb=fr['bbox3857']
im=Image.open('sea-mist-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
Q=lambda x,y:(inv_lo(bb[0]+x/W*(bb[2]-bb[0])),inv_la(bb[3]-y/H*(bb[3]-bb[1])))
fc=json.load(open('../flood.json'))['footprint_center']
ocean=Q(1290,900)
LAB=[('Sea Mist condo lot',fc[1],fc[0],'pt'),('Atlantic Ocean',round(ocean[0],6),round(ocean[1],6),'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
im.save('sea-mist-plain.jpg',quality=95)
d=ImageDraw.Draw(im); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la)
  assert 0<x<W and 0<y<H, text
  font=ImageFont.truetype(FI if st=='it' else FB,64)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=14; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=5)
    ox,oy=x-tw/2,y-th-30
  else: ox,oy=x-tw/2,y-th/2
  ox=max(20,min(ox,W-tw-20))
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=8,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
im.save('sea-mist-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
