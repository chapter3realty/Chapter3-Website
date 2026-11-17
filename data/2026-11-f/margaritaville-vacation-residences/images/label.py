"""Label the NAIP 2023 frame (raw.jpg, frame.json) for Margaritaville Vacation Residences from coordinates.
Outline: county parcel SHORE DR; TR E-2 (tract.json, layer 24). Ocean label: a point in the water found by eye then converted."""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
fr=json.load(open('frame.json')); bb=fr['bbox3857']
im=Image.open('raw.jpg').convert('RGB'); W,H=im.size
P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*W,(bb[3]-my(la))/(bb[3]-bb[1])*H)
ll=lambda px,py:(math.degrees((bb[0]+px/W*(bb[2]-bb[0]))/R), math.degrees(2*math.atan(math.exp((bb[3]-py/H*(bb[3]-bb[1]))/R))-math.pi/2))
CX,CY,CW,CH=[int(v) for v in sys.argv[1:5]]
OX,OY=float(sys.argv[5]),float(sys.argv[6])   # ocean label px in full frame
ring=json.load(open('tract.json'))['features'][0]['geometry']['rings'][0]
pts=[P(lo,la) for lo,la in ring]
crop=im.crop((CX,CY,CX+CW,CY+CH)); crop.save('crop-plain.jpg',quality=95)
d=ImageDraw.Draw(crop,'RGBA')
loc=[(x-CX,y-CY) for x,y in pts]
d.polygon(loc,fill=(255,255,255,40)); d.line(loc+[loc[0]],fill=(255,255,255,255),width=7,joint='curve')
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
cx=sum(p[0] for p in loc)/len(loc)-60; cy=min(p[1] for p in loc)-75
olo,ola=ll(OX,OY)
rec=[]
def put(text,x,y,font):
    tw,th=font.getbbox(text)[2:]
    ox,oy=x-tw/2,y-th/2
    ox=max(20,min(ox,CW-tw-20)); oy=max(20,min(oy,CH-th-20))
    d.text((ox,oy),text,font=font,fill=(255,255,255,255),stroke_width=8,stroke_fill=(20,28,34,255))
    return [round(ox),round(oy),tw,th]
f1=ImageFont.truetype(FB,66); f2=ImageFont.truetype(FI,70)
topv=min(loc,key=lambda p:p[1]);
b1=put('Margaritaville Vacation Residences',cx,cy,f1)
d.line([(topv[0],topv[1]-62),(topv[0],topv[1]-6)],fill=(255,255,255,255),width=7)
b2=put('Atlantic Ocean',OX-CX,OY-CY,f2)
rec=[{'label':'Margaritaville Vacation Residences','at':'above the top corner of the county tract SHORE DR; TR E-2, outlined in white','box':b1},{'label':'Atlantic Ocean','lon':round(olo,6),'lat':round(ola,6),'box':b2}]
crop.save('crop-labelled.jpg',quality=95)
json.dump({'crop_px':[CX,CY,CW,CH],'ring_vertices':len(ring),'labels':rec},open('labels.json','w'),indent=1)
print(rec, 'tract bbox px',[round(v) for v in (min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts))])
