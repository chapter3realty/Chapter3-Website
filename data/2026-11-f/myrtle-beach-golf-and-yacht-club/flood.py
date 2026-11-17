"""Share of the community's lot centroids inside each FEMA flood zone, from the county GIS flood layer 19 (FEMA NFHL copy). Run: python3 -I flood.py <dir>"""
import json,sys,urllib.request,urllib.parse,collections
B="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query"
P=[p for p in json.load(open(sys.argv[1]+"/parcels.json"))["parcels"] if p["luc"] in("110","101") and p["imprv"]]
env="-79.056,33.642,-79.043,33.654"
r=json.loads(urllib.request.urlopen(urllib.request.Request(B,data=urllib.parse.urlencode({"geometry":env,"geometryType":"esriGeometryEnvelope","inSR":"4326","outSR":"4326","spatialRel":"esriSpatialRelIntersects","outFields":"FLD_ZONE,SFHA_TF","returnGeometry":"true","geometryPrecision":"6","maxAllowableOffset":"0.00002","f":"json"}).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=180).read())
polys=[(f["attributes"]["FLD_ZONE"],f["geometry"]["rings"]) for f in r["features"]]
def inring(x,y,ring):
    c=False
    for i in range(len(ring)):
        x1,y1=ring[i];x2,y2=ring[i-1]
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:c=not c
    return c
def inpoly(x,y,rings):
    n=0
    for g in rings:
        if inring(x,y,g):n+=1
    return n%2==1
cnt=collections.Counter()
for p in P:
    z=[n for n,rg in polys if inpoly(p["cx"],p["cy"],rg)]
    cnt[z[0] if z else "outside mapped zones (zone X)"]+=1
out={"houses_tested":len(P),"zones":dict(cnt),"polygons":[(n,len(rg)) for n,rg in polys]}
json.dump(out,open(sys.argv[1]+"/flood.json","w"),indent=1);print(out)
