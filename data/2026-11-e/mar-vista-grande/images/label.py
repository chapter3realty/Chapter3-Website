"""Label the NAIP export of Mar Vista Grande from coordinates, never by eye.
Mar Vista Grande: the middle of the county parcel footprint (../flood.json footprint_center, 33.815286 -78.680278); it falls on the tower's roof.
7th S. Public Beach Parking: the middle of OpenStreetMap way 1322432413 (a sand lot); ODbL.
Atlantic Ocean: a given point in the water."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
inv_x=lambda x:math.degrees(x/R); inv_y=lambda y:math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
fr=json.load(open('naip-frames.json'))['mvg']; bb=fr['bbox3857']
im=Image.open('mvg-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
Q=lambda x,y:(inv_x(bb[0]+x/W*(bb[2]-bb[0])),inv_y(bb[3]-y/H*(bb[3]-bb[1])))
ocean=Q(1950,1450)
fl=json.load(open('../flood.json'))['footprint_center']
LAB=[('Mar Vista Grande',fl[1],fl[0],'pt'),('Atlantic Ocean',ocean[0],ocean[1],'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
im.save('mvg-plain.jpg',quality=95)
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
im.save('mvg-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
