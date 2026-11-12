"""Label the NAIP close-ups for /submarkets/murrells-inlet/ from ground coordinates, never by eye.
A road label snaps to the nearest vertex of that road in map-layers.geojson and turns with the road;
a place label sits on its own point (OpenStreetMap or the county layer), or beside a dot on it.
Run in the scratch folder that holds <frame>-raw.jpg: python3 -I label_naip.py <frame> ..."""
import json, math, sys, os
from PIL import Image, ImageDraw, ImageFont
HERE=os.path.dirname(os.path.abspath(__file__))
G=json.load(open(os.path.join(HERE,'..','map-layers.geojson')))
FR=json.load(open('naip-frames.json'))
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
ilo=lambda x: math.degrees(x/R); ila=lambda y: math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
def road(label):
  return [c for f in G['features'] if f['properties'].get('label')==label for l in (f['geometry']['coordinates'] if f['geometry']['type']=='MultiLineString' else [f['geometry']['coordinates']]) for c in l]
# (text, kind, point, extra): kind 'road' snaps to the road near the point; 'it' italic on the point;
# 'dot' a white dot on the point with the text offset by (dx, dy) as fractions of the frame.
LAB={
 'creek':[('MarshWalk','dot',(-79.03183,33.55795),(0.06,0.05)),('Business 17','road',(-79.0335,33.5585),'US 17 Business')],
 'horry':[],
 'river':[('Waccamaw River','it',(-79.0868,33.5612),None),('Wacca Wache Landing','dot',(-79.08571,33.56199),(0.03,0.05))],
 'between':[('US 17 bypass','road',(-79.0485,33.5501),'US 17 bypass'),('Business 17','road',(-79.0441,33.5488),'US 17 Business')],
 'docks':[('Business 17','road',(-79.0432,33.5500),'US 17 Business'),('Salt marsh','it',(-79.0403,33.5495),None)],
}
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
old=json.load(open('labels.json')) if os.path.exists('labels.json') else {}
for k in sys.argv[1:]:
  im=Image.open(k+'-raw.jpg').convert('RGB'); Wd,Hd=im.size; bb=FR[k]['bbox3857']; s=Wd/2400
  P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*Wd,(bb[3]-my(la))/(bb[3]-bb[1])*Hd)
  rec=[]
  for text,kind,pt,extra in LAB[k]:
    ang=0
    if kind=='road':
      pts=road(extra); assert pts, text
      # the nearest point on the road's line to the given point, and the road's direction there
      from shapely.geometry import LineString, Point
      segs=[f['geometry'] for f in G['features'] if f['properties'].get('label')==extra]
      lines=[LineString([P(*c) for c in l]) for g in segs for l in (g['coordinates'] if g['type']=='MultiLineString' else [g['coordinates']])]
      tp=Point(P(*pt)); ln=min(lines,key=lambda L:L.distance(tp)); d0=ln.project(tp)
      q=ln.interpolate(d0); q1=ln.interpolate(max(0,d0-30)); q2=ln.interpolate(min(ln.length,d0+30))
      x1,y1,x2,y2=q1.x,q1.y,q2.x,q2.y; ang=math.degrees(math.atan2(-(y2-y1),x2-x1))
      if ang>90: ang-=180
      if ang<-90: ang+=180
      x,y=q.x,q.y; lo=ilo(bb[0]+x/Wd*(bb[2]-bb[0])); la=ila(bb[3]-y/Hd*(bb[3]-bb[1]))
    else:
      lo,la=pt; x,y=P(lo,la)
    font=ImageFont.truetype(FI if kind=='it' else FB,int(120*s))
    tw,th=font.getbbox(text)[2:]; pad=int(24*s)
    layer=Image.new('RGBA',(tw+2*pad,th+2*pad),(0,0,0,0)); d=ImageDraw.Draw(layer)
    d.text((pad,pad),text,font=font,fill=(255,255,255,255),stroke_width=int(14*s),stroke_fill=(20,28,34,215))
    if ang: layer=layer.rotate(ang,expand=True,resample=Image.BICUBIC)
    if kind=='dot':
      dd=ImageDraw.Draw(im); r=int(24*s); dd.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=int(7*s))
      ox,oy=int(x+extra[0]*Wd),int(y+extra[1]*Hd)
      dd.line([x,y,ox+pad,oy+layer.size[1]/2],fill=(255,255,255),width=int(6*s))
    else:
      ox,oy=int(x-layer.size[0]/2),int(y-layer.size[1]/2)
    if not (0<=ox and ox+layer.size[0]<=Wd and 0<=oy and oy+layer.size[1]<=0.88*Hd): raise SystemExit(f'{k}: {text} runs off the frame or into the bottom 12 percent (the credit)')
    im.paste(layer,(ox,oy),layer)
    rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'how':'nearest point on the road line, map-layers.geojson' if kind=='road' else 'given point'})
  im.save(k+'-labelled.png'); old[k]={'labels':rec,'bbox_wgs84':[round(ilo(bb[0]),6),round(ila(bb[1]),6),round(ilo(bb[2]),6),round(ila(bb[3]),6)],'size':[Wd,Hd]}
  print(k,json.dumps(old[k]))
json.dump(old,open('labels.json','w'),indent=1)
