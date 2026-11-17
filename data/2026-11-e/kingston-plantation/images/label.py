"""Label the NAIP export of Kingston Plantation from coordinates, never by eye.
Building points: the building's parcel centre from map-points.json (county Parcels layer 24, rounded to 4 decimals); for a group of
several points (Richmond Park, West Hyde Park) the median point. Atlantic Ocean: a given point in the water.
Run in a folder holding kp-raw.jpg (the export in frame.json) and map-points.json."""
import json, math, statistics as st
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('frame.json'))['bbox3857']
im=Image.open('kp-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
def ll(px,py):
  x=bb[0]+px/W*(bb[2]-bb[0]); y=bb[3]-py/H*(bb[3]-bb[1])
  return math.degrees(x/R), math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
pts=json.load(open('map-points.json'))['points']
def at(name,minu=0):
  v=[p for p in pts if p[3]==name and p[2]>=minu]
  return st.median(p[1] for p in v), st.median(p[0] for p in v)
water=ll(2150,1500)
LAB=[('Margate Tower',)+at('Margate Tower')+('left',),
     ('Brighton Towers',)+at('Brighton Towers')+('left',),
     ('South Hampton',)+at('South Hampton')+('right',),
     ('North Hampton',)+at('North Hampton',100)+('above',),
     ('Richmond Park',)+at('Richmond Park',20)+('above',),
     ('West Hyde Park',)+at('West Hyde Park')+('above',),
     ('Atlantic Ocean',)+water+('it',)]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
d=ImageDraw.Draw(im); rec=[]
for text,lo,la,pos in LAB:
  x,y=P(lo,la)
  font=ImageFont.truetype(FI if pos=='it' else FB,64)
  tw,th=font.getbbox(text)[2:]
  if pos!='it':
    r=17; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
  if pos=='left': ox,oy=x-tw-36,y-th/2-6
  elif pos=='right': ox,oy=x+36,y-th/2-6
  elif pos=='above': ox,oy=x-tw/2,y-th-40
  else: ox,oy=x-tw/2,y-th/2
  ox=max(20,min(ox,W-tw-20))
  assert 0<x<W and 0<y<H and 0<=oy and oy+th<=0.97*H, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=8,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
im.save('kp-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
