"""Houses within 15 m (about 50 ft) of a mapped water body, from the county hydrography layer 21, for the community lots. Run: python3 -I water.py <dir>"""
import json,sys,math,urllib.request,urllib.parse,collections
B="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/21/query"
r=json.loads(urllib.request.urlopen(urllib.request.Request(B,data=urllib.parse.urlencode({"geometry":"-79.058,33.640,-79.040,33.656","geometryType":"esriGeometryEnvelope","inSR":"4326","outSR":"4326","spatialRel":"esriSpatialRelIntersects","outFields":"*","returnGeometry":"true","geometryPrecision":"6","f":"json"}).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=180).read())
fs=r.get("features",[]);print(len(fs),r.get("geometryType"),[ {k:v for k,v in f["attributes"].items() if k not in("OBJECTID",) and v not in(None,"")} for f in fs[:5]])
P=[p for p in json.load(open(sys.argv[1]+"/parcels.json"))["parcels"] if p["luc"] in("110","101") and p["imprv"]]
kind=lambda f:f["attributes"].get("FTYPE") or f["attributes"].get("TYPE") or f["attributes"].get("Type")
M=111320.0;lat0=33.65
def d2seg(px,py,ax,ay,bx,by):
    dx,dy=bx-ax,by-ay;t=0 if dx==dy==0 else max(0,min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return math.hypot(px-ax-t*dx,py-ay-t*dy)
def near(p,geom):
    px,py=p["cx"]*M*math.cos(math.radians(lat0)),p["cy"]*M;best=1e9
    for g in geom.get("rings",[])+geom.get("paths",[]):
        for i in range(1,len(g)):
            ax,ay=g[i-1][0]*M*math.cos(math.radians(lat0)),g[i-1][1]*M;bx,by=g[i][0]*M*math.cos(math.radians(lat0)),g[i][1]*M
            best=min(best,d2seg(px,py,ax,ay,bx,by))
    return best
out=collections.Counter();by=collections.Counter()
for f in fs: by[str(kind(f))+"|"+str(f["geometry"].keys() if f.get("geometry") else None)]+=1
print(by)
n=0
for p in P:
    if any(near(p,f["geometry"])<=15 for f in fs if f.get("geometry")):n+=1
json.dump({"houses":len(P),"within_15m_of_mapped_water":n,"features":len(fs),"kinds":dict(by)},open(sys.argv[1]+"/water.json","w"),indent=1);print(n,len(P))
