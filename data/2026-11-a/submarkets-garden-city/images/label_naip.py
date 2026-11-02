"""Label the NAIP close-ups for /submarkets/garden-city/ from ground coordinates, never by eye.
Each label is a lon/lat point (a road label snaps to the nearest vertex of that road in
map-layers.geojson and turns with the road). Usage: python3 label_naip.py <frame> ..."""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont
W2='/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2'
G=json.load(open(W2+'/data/2026-11-a/submarkets-garden-city/map-layers.geojson'))
R=6378137; mx=lambda lo:R*math.radians(lo); my=lambda la:R*math.log(math.tan(math.pi/4+math.radians(la)/2))
ilo=lambda x: math.degrees(x/R); ila=lambda y: math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
ALL={'pier':(-78.9985,33.5772,700),'marsh':(-79.0045,33.5775,600),'streets':(-79.0005,33.5865,700),'inland':(-79.0080,33.6010,700),'point':(-79.0270,33.5385,900)}
def frame(k):
  lo,la,g=ALL[k]; c=math.cos(math.radians(la)); hw=g/2/c; hh=hw*0.75; X,Y=mx(lo),my(la); return [X-hw,Y-hh,X+hw,Y+hh]
def road(name):
  return [c for f in G['features'] if f['properties'].get('name')==name for l in f['geometry']['coordinates'] for c in l]
LAB={
 'pier':[('Garden City Pier',-78.99740,33.57608,'pr'),('Waccamaw Drive','road',(-78.99835,33.57673)),('Atlantic Avenue','road',(-79.00123,33.57862)),('Salt marsh',-79.00102,33.57914,'it')],
 'marsh':[('Salt marsh',-79.00414,33.57758,'it')],
 'streets':[('Salt marsh',-78.99805,33.58537,'it')],
 'inland':[],
 'point':[('Waccamaw Drive','road',(-79.02610,33.53850)),('Atlantic Ocean',-79.02409,33.53704,'it')],
}
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI='/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
out={}
for k in sys.argv[1:]:
  im=Image.open(k+'-raw.jpg').convert('RGB'); Wd,Hd=im.size; bb=frame(k); s=Wd/2400
  P=lambda lo,la:((mx(lo)-bb[0])/(bb[2]-bb[0])*Wd,(bb[3]-my(la))/(bb[3]-bb[1])*Hd)
  rec=[]
  for L in LAB[k]:
    text=L[0]
    if L[1]=='road':
      pts=[c for c in road(text)]; tx,ty=P(*L[2])
      best=min(range(len(pts)),key=lambda i:(P(*pts[i])[0]-tx)**2+(P(*pts[i])[1]-ty)**2)
      a,b=pts[max(0,best-1)],pts[min(len(pts)-1,best+1)]
      (x1,y1),(x2,y2)=P(*a),P(*b); ang=math.degrees(math.atan2(-(y2-y1),x2-x1))
      if ang>90: ang-=180
      if ang<-90: ang+=180
      x,y=P(*pts[best]); lo,la=pts[best]; style='b'
    else:
      lo,la,style=L[1],L[2],L[3]; x,y=P(lo,la); ang=0
    font=ImageFont.truetype(FI if style=='it' else FB,int((104 if style=='pr' else 128)*s))
    tw,th=font.getbbox(text)[2:]; pad=int(24*s)
    layer=Image.new('RGBA',(tw+2*pad,th+2*pad),(0,0,0,0)); d=ImageDraw.Draw(layer)
    d.text((pad,pad),text,font=font,fill=(255,255,255,255),stroke_width=int(14*s),stroke_fill=(20,28,34,215))
    if ang: layer=layer.rotate(ang,expand=True,resample=Image.BICUBIC)
    if style=='ptr':
      dd=ImageDraw.Draw(im); r=int(22*s); dd.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=int(6*s))
      ox,oy=int(x-layer.size[0]/2+0.14*Wd),int(y+0.13*Hd)
    elif style=='pr':
      # Fix round 1: beside the pier, up and to the right of its dot, clear of the photo credit at the bottom.
      dd=ImageDraw.Draw(im); r=int(22*s); dd.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=int(6*s))
      ox,oy=int(min(x+0.025*Wd,Wd-layer.size[0]-0.01*Wd)),int(y-0.115*Hd)
    elif style=='pt':
      dd=ImageDraw.Draw(im); r=int(22*s); dd.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255),outline=(28,32,40),width=int(6*s))
      ox,oy=int(x-layer.size[0]/2),int(y-layer.size[1]-r)
    else:
      ox,oy=int(x-layer.size[0]/2),int(y-layer.size[1]/2)
    im.paste(layer,(ox,oy),layer)
    if not (0<=ox and ox+layer.size[0]<=Wd and 0<=oy and oy+layer.size[1]<=0.88*Hd): raise SystemExit(f'{k}: {text} runs off the frame or into the bottom 12 percent (the credit)')
    if not (0<x<Wd and 0<y<Hd): raise SystemExit(f'{k}: {text} is off the frame')
    rec.append({'label':text,'lon':round(lo,6),'lat':round(la,6),'how':'road vertex, map-layers.geojson' if L[1]=='road' else 'given point'})
  im.save(k+'-labelled.png'); out[k]={'labels':rec,'bbox_wgs84':[round(ilo(bb[0]),6),round(ila(bb[1]),6),round(ilo(bb[2]),6),round(ila(bb[3]),6)],'size':[Wd,Hd]}
  print(k, json.dumps(out[k]))
old=json.load(open('labels.json')) if __import__('os').path.exists('labels.json') else {}
old.update(out); json.dump(old,open('labels.json','w'),indent=1)
