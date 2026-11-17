"""Label the NAIP export of the Palms Resort from coordinates. The dot sits on the two oceanfront towers (the oceanfront parcels of the county's THE PALMS regime, outlined and checked in pm-outline.jpg).
Atlantic Ocean: a given point in the water. Run in a folder holding pm-raw.jpg (the export in naip-frames.json)."""
import json, math
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
bb=json.load(open('naip-frames.json'))['palms']['bbox3857']
im=Image.open('pm-raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
def ll(px,py):
  x=bb[0]+px/W*(bb[2]-bb[0]); y=bb[3]-py/H*(bb[3]-bb[1])
  return math.degrees(x/R), math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
wlo,wla=ll(2080,1320)
LAB=[('The Palms Resort',*ll(1330,1040),'pt'),('Atlantic Ocean',wlo,wla,'it')]
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
im.save('pm-plain.jpg',quality=95)
d=ImageDraw.Draw(im); rec=[]
for text,lo,la,st in LAB:
  x,y=P(lo,la)
  font=ImageFont.truetype(FI if st=="it" else FB,90 if st=="pt" else 76)
  tw,th=font.getbbox(text)[2:]
  if st=='pt':
    r=18; d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=6)
    ox,oy=x+45,y-30
  else: ox,oy=x-tw/2,y-th/2
  ox=min(ox,W-tw-20)
  assert 0<=ox and ox+tw<=W and 0<=oy and oy+th<=0.95*H, text
  d.text((ox,oy),text,font=font,fill=(255,255,255),stroke_width=10,stroke_fill=(20,28,34))
  rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'px':[round(x),round(y)]})
im.resize((1600,1200),Image.LANCZOS).save('pm-labelled.jpg',quality=95)
json.dump({'labels':rec},open('labels.json','w'),indent=1)
print(rec)
