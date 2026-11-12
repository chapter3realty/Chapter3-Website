import json, numpy as np
from PIL import Image, ImageDraw, ImageFont
Image.MAX_IMAGE_PIXELS=None
W,H=14204,10652
geo={k:float(v) for k,v in (l.split(':',1) for l in open('eri/f.geom') if l.split(':')[0].strip() in ('ul_lat','ul_lon','ur_lat','ur_lon','ll_lat','ll_lon','lr_lat','lr_lon'))}
src=[(geo['ul_lon'],geo['ul_lat']),(geo['ur_lon'],geo['ur_lat']),(geo['lr_lon'],geo['lr_lat']),(geo['ll_lon'],geo['ll_lat'])]
dst=[(0,0),(W,0),(W,H),(0,H)]
A=[];b=[]
for (x,y),(u,v) in zip(src,dst):
  A.append([x,y,1,0,0,0,-u*x,-u*y]); b.append(u)
  A.append([0,0,0,x,y,1,-v*x,-v*y]); b.append(v)
h=np.linalg.solve(np.array(A),np.array(b)); Hm=np.append(h,1).reshape(3,3)
def P(lon,lat):
  p=Hm@np.array([lon,lat,1]); return (p[0]/p[2],p[1]/p[2])
if __name__=='__main__':
  im=Image.open('eri/f.jpg'); sm=im.resize((W//8,H//8)); d=ImageDraw.Draw(sm)
  g=json.load(open('/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2/data/2026-11-a/submarkets-surfside-beach/map-layers.geojson'))
  col={'nightly':(255,140,0),'no_nightly':(0,255,0),'other':(200,200,200)}
  for f in g['features']:
    pr=f['properties']; gm=f['geometry']
    if gm['type']=='MultiPolygon':
      for poly in gm['coordinates']:
        d.line([tuple(c/8 for c in P(*p)) for p in poly[0]],fill=col[pr['group']],width=3)
  roads=json.load(open('raw/roads.json'))
  for r in roads:
    nm=r['attributes']['FULLNAME']
    for path in r['geometry'].get('paths',[]):
      pts=[tuple(c/8 for c in P(*p)) for p in path]
      if all(0<x<W/8 and 0<y<H/8 for x,y in pts[:1]):
        d.line(pts,fill=(255,255,0),width=1)
        if len(pts)>1: d.text(pts[len(pts)//2],nm,fill=(255,255,255))
  sm.save('eri/overview.jpg',quality=80)
