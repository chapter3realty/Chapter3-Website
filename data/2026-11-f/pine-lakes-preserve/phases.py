"""Per-phase table for the Preserve at Pine Lakes: lots, lot size, footprint, county value, sales, golf-edge, which golf parcel. Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I phases.py <this dir>"""
import json,os,sys,math,statistics as st,collections
from shapely.geometry import Polygon
from shapely.ops import unary_union
D=sys.argv[1]; C=json.load(open(os.environ["RAW"]+"/county.json")); P=C["parcels"]; G=C["geo"]
K=111320*math.cos(math.radians(33.735))
def poly(r): return unary_union([Polygon(x).buffer(0) for x in r if len(x)>=4])
golfs=[(b["attributes"]["LegalDescr"],b["attributes"]["LandUseCode"],round(b["attributes"]["Acreage"] or 0,1),poly(b["geometry"]["rings"])) for b in G["big"] if "FOUNDERS NATIONAL GOLF" in (b["attributes"]["OwnerName"] or "")]
def ph(s): return "2" if "PH2" in s or "PH 2" in s else ("1A" if "1A" in s else ("1B" if "1B" in s else "3"))
R=json.load(open(os.environ["SALES"]))["deeds"]; sale={}
for d in R:
    if d["ParcelNumber"] in P and (d["Consideration"] or 0)>10000: sale.setdefault(d["ParcelNumber"],[]).append((d["Consideration"],d["BookPage"]))
res={}
for k in ["1A","1B","2","3"]:
    L=[(p,a) for p,a in P.items() if ph(a["section"])==k and a["LandUseCode"] in("100","101","106","109")]
    H=[(p,a) for p,a in L if (a["MarketImprv"] or 0)>0]
    gl=collections.Counter()
    for p,a in L:
        g=poly(a["rings"])
        for n,u,ac,gp in golfs:
            if g.distance(gp)*K<15: gl[(n,u,ac)]+=1
    sp=[]
    for p,a in H:
        for pr,bp in sale.get(p,[]):
            if pr>=0.5*(a["MarketProp"] or 1): sp.append(pr)
    res[k]={"lots_and_houses":len(L),"houses":len(H),"landuse":dict(collections.Counter(a["LandUseCode"] for p,a in L)),"lot_sqft_median":st.median(a["lotSqft"] for p,a in H),
      "county_value_median":st.median(a["MarketProp"] for p,a in H),"golf_edge":{str(k2):v for k2,v in gl.items()},"sales_ge_half_county_value":sorted(sp),"sales_all":sum(len(sale.get(p,[])) for p,a in H)}
    print(k,json.dumps(res[k]))
allsp=sorted(x for v in res.values() for x in v["sales_ge_half_county_value"]); print(len(allsp),st.median(allsp),allsp[0],allsp[-1],st.quantiles(allsp,n=4))
json.dump(res,open(D+"/phases.json","w"),indent=1)
