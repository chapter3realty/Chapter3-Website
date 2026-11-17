"""Splits the condos for sale in Murrells Inlet (MLS city) by county and Garden City, in aggregate. Pins (price slices) give a point; a point inside a Horry County parcel (Horry GIS layer 24) is Horry,
else Georgetown; a Horry point inside the 2020 Garden City Census place polygon (data/2026-11-a/submarkets-garden-city/raw/cdp2020.geojson) is Garden City. Joined in memory to listing cards (lookup).
Keeps counts, price/fee quartiles, flood high-risk count and MLS community names per part. No point, MLS number or address kept. Run: python3 -I parts.py <this dir> <data root>. Writes parts.json."""
import json,sys,time,urllib.request,urllib.parse,statistics as st,collections,datetime
from concurrent.futures import ThreadPoolExecutor
from shapely.geometry import shape,Point
D=sys.argv[1]; R=sys.argv[2]; BASE="https://chapter3realty.com/homes/api/"; H={"User-Agent":"Mozilla/5.0"}
def get(u,p):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u+"?"+urllib.parse.urlencode(p),headers=H),timeout=90))
        except Exception: time.sleep(2+2*i)
    return None
pins={}
def sl(lo,hi):
    d=get(BASE+"map",{"type":"condo","city":"Murrells Inlet","min":lo,"max":hi})
    if len(d["pins"])>=d["total"] or hi-lo<=1:
        for p in d["pins"]: pins[p["mls"]]=p
        return
    m=(lo+hi)//2; sl(lo,m); sl(m+1,hi)
sl(0,20000000)
cdp=shape(json.load(open(R+"/2026-11-a/submarkets-garden-city/raw/cdp2020.geojson"))["features"][0]["geometry"])
HP="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
FE="https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"
def horry(p):
    r=get(HP,{"geometry":"%f,%f"%(p["lng"],p["lat"]),"geometryType":"esriGeometryPoint","inSR":4326,"spatialRel":"esriSpatialRelIntersects","outFields":"TaxDistrict","returnGeometry":"false","f":"json"})
    f=(r or {}).get("features") or []
    return (f[0]["attributes"]["TaxDistrict"] if f else None) if r is not None else "ERR"
def fz(p):
    r=get(FE,{"geometry":"%f,%f"%(p["lng"],p["lat"]),"geometryType":"esriGeometryPoint","inSR":4326,"spatialRel":"esriSpatialRelIntersects","outFields":"FLD_ZONE,SFHA_TF","returnGeometry":"false","f":"json"})
    f=(r or {}).get("features") or []
    return (f[0]["attributes"]["SFHA_TF"]=="T") if f else None
def card(m):
    for i in range(8):
        f=get(BASE+"lookup",{"mls":m}).get("facts")
        if f: return f
        time.sleep(1+i)
    return {}
ml=sorted(pins)
with ThreadPoolExecutor(3) as ex:
    td=list(ex.map(lambda m:horry(pins[m]),ml)); cs=list(ex.map(card,ml)); hz=list(ex.map(lambda m:fz(pins[m]),ml))
def part(m,t):
    p=pins[m]
    if t=="ERR": return "err"
    if t is None: return "georgetown"
    return "garden_city" if cdp.contains(Point(p["lng"],p["lat"])) else "horry"
def qs(v):
    v=sorted(v)
    if not v: return None
    q=st.quantiles(v,n=4) if len(v)>3 else [v[0],st.median(v),v[-1]]
    return {"n":len(v),"min":v[0],"p25":q[0],"median":st.median(v),"p75":q[2],"max":v[-1]}
out={"read":datetime.datetime.now(datetime.timezone.utc).isoformat(),"rule":__doc__,"n":len(ml)}
G=collections.defaultdict(list)
for m,t,c,h in zip(ml,td,cs,hz): G[part(m,t)].append((m,t,c,h))
out["parts"]={}
for k,L in G.items():
    cc=[x[2] for x in L if x[2].get("listPrice")]
    out["parts"][k]={"n":len(L),"tax_districts":dict(collections.Counter(x[1] for x in L)),"price":qs([c["listPrice"] for c in cc]),"hoa":qs([c["hoaMonthly"] for c in cc if c.get("hoaMonthly")]),"yearBuilt_median":(st.median([c["yearBuilt"] for c in cc if c.get("yearBuilt")]) if any(c.get("yearBuilt") for c in cc) else None),"high_risk":sum(1 for x in L if x[3]),"oceanfront_tag":sum(1 for x in L if pins[x[0]].get("tag")=="Waterfront"),"names":collections.Counter(c.get("subdivision") for c in cc).most_common(40)}
json.dump(out,open(D+"/parts.json","w"),indent=1,default=dict)
print(json.dumps({k:{a:b for a,b in v.items() if a!="names"} for k,v in out["parts"].items()},indent=1,default=dict)[:3500])
