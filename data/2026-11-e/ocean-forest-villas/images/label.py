"""Label the NAIP export of Ocean Forest Villas from coordinates, never by eye.
Buildings A to E: the county-parcel centers per building (../zoning.json, the center of each building's unit parcels).
Atlantic Ocean: a point in the water inside the frame (given below as pixel, converted to lon/lat and written out)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
inv_lo=lambda x:math.degrees(x/R); inv_la=lambda y:math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
bb=json.load(open('naip-frames.json'))['ofv']['bbox3857']
im=Image.open('ofv-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
Q=lambda x,y:(inv_lo(bb[0]+x/W*(bb[2]-bb[0])),inv_la(bb[3]-y/H*(bb[3]-bb[1])))
z=json.load(open('../zoning.json'))['buildings']
ocean=Q(1400,930)
LAB=[('Building '+k,v['center'][1],v['center'][0],'pt') for k,v in z.items()]+[('Atlantic Ocean',round(ocean[0],6),round(ocean[1],6),'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
im.save('ofv-plain.jpg',quality=95)
d=ImageDraw.Draw(im); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la)
  assert 0<x<W and 0<y<H, text
  if st=='pt':
    font=ImageFont.truetype(FB,50); ch=text[-1]; tw,th=font.getbbox(ch)[2:]
    r=36; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    d.text((x,y),ch,font=font,fill=(28,32,40),anchor='mm')
    rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]}); continue
  font=ImageFont.truetype(FI,54); tw,th=font.getbbox(text)[2:]
  ox,oy=x-tw/2,y-th/2
  ox=max(20,min(ox,W-tw-20))
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=8,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
im.save('ofv-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
