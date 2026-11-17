"""Crop the NAIP export to Prince Resort, the pier and the beach, and label them from coordinates, never by eye.
Prince Resort, beach side: the median of the county parcel centres of the labelled Phase I units (parcels.json, layer 24).
Prince Resort, across the road: the same for Phase II units. Cherry Grove Pier and Atlantic Ocean: given points
(a point over the pier's blue-roofed buildings, and one in the water), written as export pixels converted to lon/lat.
Run in a folder holding prince-raw.jpg (the export in naip-frames.json) and parcels.json."""
import json, math, statistics as st
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('naip-frames.json'))['prince']['bbox3857']
im=Image.open('prince-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
def ll(px,py):
  x=bb[0]+px/W*(bb[2]-bb[0]); y=bb[3]-py/H*(bb[3]-bb[1])
  return math.degrees(x/R), math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
CX,CY,CW,CH=500,450,1600,1200
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('prince-crop-plain.jpg',quality=95)
g={'I':[],'II':[]}
for f in json.load(open('parcels.json'))['features']:
  L=f['attributes']['LegalDescr']; ph='II' if 'PH II' in L else ('I' if 'PH I' in L else None)
  if not ph or 'UNIT PH' in L or 'CU-' in L: continue
  r=f['geometry']['rings'][0]; g[ph].append((st.mean(x for x,y in r),st.mean(y for x,y in r)))
c1=(st.median(x for x,y in g['I']),st.median(y for x,y in g['I'])); c2=(st.median(x for x,y in g['II']),st.median(y for x,y in g['II']))
pier=ll(1122,1260); water=ll(2000,1380)
LAB=[('Prince Resort, beach side',)+c1+('pt',),('Prince Resort, across the road',)+c2+('pt',),('Cherry Grove Pier',)+pier+('below',),('Atlantic Ocean',)+water+('it',)]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(crop); rec=[]
for text,lo,la,st_ in LAB:
  x,y=P(lo,la); x-=CX; y-=CY
  assert 0<x<CW and 0<y<CH, text
  font=ImageFont.truetype(FI if st_=='it' else FB,60)
  tw,th=font.getbbox(text)[2:]
  if st_ in('pt','below'):
    r=16; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x-tw/2,(y-th-34 if st_=='pt' else y+30)
  else: ox,oy=x-tw/2,y-th/2
  ox=max(20,min(ox,CW-tw-20))
  assert 0<=ox and ox+tw<=CW and 0<=oy and oy+th<=0.95*CH, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=8,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
crop.save('prince-crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'labels':rec},open('labels.json','w'),indent=1)
print(rec)
