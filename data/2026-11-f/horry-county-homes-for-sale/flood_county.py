"""Share of Horry County houses sold in the last 12 months (same set as analyze_county.py: land use 101/106/109, any postal city, priced deed 2025-11-01 to 2026-10-31)
whose parcel center point sits inside a FEMA high-risk (SFHA_TF = T) zone on the National Flood Hazard Layer (hazards.fema.gov NFHL MapServer 28).
Saves counts only. Usage: python3 -I flood_share.py <buyers-builders dir> <this dir>. Writes flood.json"""
import json,sys,re,time,urllib.request,urllib.parse,collections,datetime
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
from shapely.strtree import STRtree
B,D=sys.argv[1],sys.argv[2]
P=json.load(open(B+"/raw/parcels.json"))["parcels"];PC=json.load(open(D+"/postal-all.json"))["postal_city"]
R=json.load(open(B+"/raw/deeds-co.json"))["deeds"]; multi=collections.Counter(d["BookPage"] for d in R)
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
pins=sorted({d["ParcelNumber"] for d in R if (d["Consideration"] or 0)>10000 and re.fullmatch(r"\d{11}",d["ParcelNumber"] or "") and not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "") and multi[d["BookPage"]]==1 and d["ParcelNumber"] in P and P[d["ParcelNumber"]]["LandUseCode"] in("101","106","109") and P[d["ParcelNumber"]]["lng"]})
pts=[(P[k]["lng"],P[k]["lat"],P[k]["TaxDistrict"]) for k in pins]
U="https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"
def q(p):
    for i in range(5):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(U,data=urllib.parse.urlencode(p).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120))
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry",e,file=sys.stderr); time.sleep(5)
    raise SystemExit("FEMA did not answer")
x0,x1=min(p[0] for p in pts)-.002,max(p[0] for p in pts)+.002; y0,y1=min(p[1] for p in pts)-.002,max(p[1] for p in pts)+.002
polys={}; zones={}
nx=ny=8
for i in range(nx):
  for j in range(ny):
    env="%f,%f,%f,%f"%(x0+(x1-x0)*i/nx,y0+(y1-y0)*j/ny,x0+(x1-x0)*(i+1)/nx,y0+(y1-y0)*(j+1)/ny)
    off=0
    while True:
        d=q({"geometry":env,"geometryType":"esriGeometryEnvelope","inSR":"4326","spatialRel":"esriSpatialRelIntersects","where":"SFHA_TF='T'","outFields":"OBJECTID,FLD_ZONE,STATIC_BFE","returnGeometry":"true","outSR":"4326","maxAllowableOffset":"0.00003","resultOffset":off,"resultRecordCount":500,"f":"json"})
        for f in d["features"]:
            a=f["attributes"]
            polys[a["OBJECTID"]]=unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r)>=4]); zones[a["OBJECTID"]]=a["FLD_ZONE"]
        if not d.get("exceededTransferLimit"): break
        off+=500
    print(i,j,len(polys),flush=True)
ids=list(polys); tree=STRtree([polys[i] for i in ids])
inside=collections.Counter(); byz=collections.Counter(); byd=collections.defaultdict(lambda:[0,0])
for x,y,t in pts:
    pt=Point(x,y); hit=[ids[k] for k in tree.query(pt) if polys[ids[k]].contains(pt)]
    byd[t][1]+=1
    if hit: inside["in"]+=1; byz[zones[hit[0]]]+=1; byd[t][0]+=1
out={"read":datetime.date.today().isoformat(),"source":U,"houses":len(pts),"in_high_risk_zone":inside["in"],"by_zone":dict(byz),"by_tax_district":{k:v for k,v in byd.items() if v[1]>=100},"polygons_read":len(polys),"note":"parcel center point against SFHA_TF=T polygons, generalized 0.00003 degrees; counts of houses sold 2025-11-01 to 2026-10-31"}
json.dump(out,open(D+"/flood-county.json","w"),indent=1); print(json.dumps(out,indent=1))
