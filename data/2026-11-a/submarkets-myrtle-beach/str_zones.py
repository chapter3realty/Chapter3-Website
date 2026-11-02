#!/usr/bin/env python3
"""Which City of Myrtle Beach zoning areas the city's own visitor-accommodation map shades as allowing short-term rentals.
Inputs: raw/mb-str-zone-map-2021.jpg (the city's map image "Zones in the Myrtle Beach City Limits that Allow Visitor
Accommodations (Short Term Rentals)", Date of Print 04/05/2021, embedded on the planning and zoning page), and RAW/zoning.json and
RAW/citylimits-city.json from fetch_gis.py.
Method: the map image is fitted to the city's GIS city limits by a rotation, scale and shift that maximises the overlap of the
image's city land (not ocean, not ICW, not the green county areas) with the GIS outline (work/fit.json; overlap reported as IoU).
Each current zoning polygon is then drawn onto the image, and the share of its pixels that are the map's pink is measured.
Run: RAW=<scratch> python3 -I str_zones.py <datadir>   Writes <datadir>/zone-pink.json."""
import os, sys
RAW = os.environ["RAW"]; DD = sys.argv[1]
os.chdir(RAW); os.makedirs("work", exist_ok=True)
IMG = os.path.join(DD, "raw", "mb-str-zone-map-2021.jpg")
# ---- part 1: fit ----
import json, math, numpy as np
from PIL import Image, ImageDraw
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import unary_union
im=np.array(Image.open(IMG).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]
pink=(r>200)&(g<200)&(g>120)&(b>160)&(r-g>40)
blue=(b>220)&(r<215)&(g>215)
green=(g>225)&(b<230)&(g-r>8)
H,W=r.shape
frame=np.zeros_like(pink); frame[15:775,340:2992]=True
city=frame&~blue&~green
F=4  # downscale
cs=np.array(Image.fromarray((city*255).astype(np.uint8)).resize((W//F,H//F)))>127
fr=np.array(Image.fromarray((frame*255).astype(np.uint8)).resize((W//F,H//F)))>127
def esri2shp(f):
    rings=f['geometry']['rings']; return Polygon(rings[0],rings[1:]) if len(rings)>=1 else None
cl=json.load(open('citylimits-city.json'))
polys=[]
for f in cl:
    for ring in f['geometry']['rings']:
        p=Polygon(ring)
        if p.is_valid and p.area>0: polys.append(p)
lat0=33.70; lon0=-78.90; kx=math.cos(math.radians(lat0))*111320; ky=110540
def proj(pts): return [((x-lon0)*kx,(y-lat0)*ky) for x,y in pts]
# ring orientation: rasterize all rings with even-odd by drawing outer as fill... use shapely union on projected
from shapely.geometry import Polygon as P
pp=[]
for f in cl:
    rings=f['geometry']['rings']
    # esri: outer rings clockwise; holes counter-clockwise
    outers=[];holes=[]
    for ring in rings:
        a=0
        for i in range(len(ring)-1): a+=ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1]
        (outers if a<0 else holes).append(proj(ring))
    for o in outers: pp.append(P(o))
    for h in holes: pp.append(('h',P(h)))
outer=unary_union([p for p in pp if not isinstance(p,tuple)]).buffer(0)
holes=unary_union([p[1] for p in pp if isinstance(p,tuple)]).buffer(0)
cityg=outer.difference(holes)
print('city area km2',cityg.area/1e6)
json.dump({'lat0':lat0,'lon0':lon0},open('work/proj.json','w'))
def raster(geom,params):
    th,s,tx,ty=params
    c,sn=math.cos(th),math.sin(th)
    img=Image.new('L',(W//F,H//F),0); d=ImageDraw.Draw(img)
    gs=geom.geoms if hasattr(geom,'geoms') else [geom]
    def tr(pts): return [((s*(c*x-sn*y)+tx)/F,(-(s*(sn*x+c*y))+ty)/F) for x,y in pts]
    for p in gs:
        d.polygon(tr(p.exterior.coords),fill=255)
        for h in p.interiors: d.polygon(tr(h.coords),fill=0)
    return np.array(img)>127
def score(params):
    m=raster(cityg,params)
    inter=(m&cs).sum(); uni=((m|cs)&fr).sum()+ (m&~fr).sum()
    return inter/uni
# init: coast bearing ~ 50 deg east of north -> vector (sin50,cos50); rotate so it points to +x
best=None
s0=192/1609.34
cx,cy=cityg.centroid.x,cityg.centroid.y
import itertools,random
for thd in range(-60,-20,4):
    th=math.radians(thd)
    for s in [s0*0.9,s0,s0*1.1]:
        c,sn=math.cos(th),math.sin(th)
        X=s*(c*cx-sn*cy); Y=-(s*(sn*cx+c*cy))
        tx=1666-X; ty=400-Y
        sc=score((th,s,tx,ty))
        if best is None or sc>best[0]: best=(sc,(th,s,tx,ty))
print('coarse',best[0],math.degrees(best[1][0]),best[1][1]/s0)
random.seed(1)
cur=best
steps=[0.02,0.03,40,25]
for it in range(1500):
    p=list(cur[1]); k=random.randrange(4)
    p[k]+=random.gauss(0,steps[k]* (0.3 if it>800 else 1))
    sc=score(p)
    if sc>cur[0]: cur=(sc,tuple(p))
print('fine',cur[0],math.degrees(cur[1][0]),cur[1][1]/s0,cur[1][2:])
json.dump({'params':cur[1],'iou':cur[0],'lat0':lat0,'lon0':lon0,'kx':kx,'ky':ky},open('work/fit.json','w'))
m=raster(cityg,cur[1])
ov=np.zeros((H//F,W//F,3),np.uint8); ov[...,0]=cs*255; ov[...,1]=m*255
Image.fromarray(ov).save('work/fit-overlay.png')

# ---- part 2: pink share ----
import json, math, numpy as np, collections
from PIL import Image, ImageDraw
from shapely.geometry import Polygon
from shapely.ops import unary_union
fit=json.load(open('work/fit.json')); th,s,tx,ty=fit['params']; lat0,lon0,kx,ky=fit['lat0'],fit['lon0'],fit['kx'],fit['ky']
im=np.array(Image.open(IMG).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]
pink=(r>200)&(g<200)&(g>120)&(b>160)&(r-g>40)
H,W=pink.shape
# pink areas have street lines inside; close small gaps by dilation-ish: blur
from PIL import ImageFilter
pk=np.array(Image.fromarray((pink*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3)))>127
pk15=np.array(Image.fromarray((pink*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15)))>127  # tolerance about 7 px (about 60 m) for the fit
c,sn=math.cos(th),math.sin(th)
def tr(pts): return [(s*(c*x-sn*y)+tx,-(s*(sn*x+c*y))+ty) for x,y in [((lo-lon0)*kx,(la-lat0)*ky) for lo,la in pts]]
z=json.load(open('zoning.json'))
rows=[]
for f in z:
    code=f['attributes']['ZONING_DIS']
    img=Image.new('L',(W,H),0); d=ImageDraw.Draw(img)
    for ring in f['geometry']['rings']:
        a=sum(ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1] for i in range(len(ring)-1))
        d.polygon(tr(ring),fill=255 if a<0 else 0)
    m=np.array(img)>127
    n=m.sum()
    rows.append((code,int(n),int((m&pk).sum()),int((m&pk15).sum())))
agg=collections.defaultdict(lambda:[0,0,0])
for code,n,p,p15 in rows:
    a=agg[code]; a[0]+=n; a[1]+=p; a[2]+=1
out=[]
for k,(n,p,cnt) in sorted(agg.items(),key=lambda x:str(x[0])):
    out.append({'code':k,'polys':cnt,'px':n,'pink_share':round(p/n,3) if n else None})
    print(f"{str(k):40s} polys {cnt:3d} px {n:7d} pink {p/n if n else 0:.2f}")
rows=[(c,n,p,p15,i) for i,(c,n,p,p15) in enumerate(rows)]
json.dump({'fit_iou':fit['iou'],'by_code':out,'by_poly':[{'i':i,'code':c,'px':n,'pink_px':p,'pink_px_60m':p15} for c,n,p,p15,i in rows]},open(os.path.join(DD,'zone-pink.json'),'w'))
