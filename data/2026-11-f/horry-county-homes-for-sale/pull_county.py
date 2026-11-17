"""Homes for sale inside Horry County, from the site's public map API (every pin, sliced by price so none is cut off), each pin placed by its coordinates against the Census TIGERweb Horry County boundary (GEOID 45051). Saves counts by kind, MLS city, zip and price band only. No address, MLS number or photo is saved. Usage: python3 -I pull_county.py <dir>"""
import json,sys,time,urllib.request,urllib.parse,datetime,collections,re
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
D=sys.argv[1];B="https://chapter3realty.com/homes/api/map?"
def get(u,tries=8):
    for i in range(tries):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
        except Exception: time.sleep(3+2*i)
    raise SystemExit("failed "+u)
def m(**p):
    for i in range(8):
        r=get(B+urllib.parse.urlencode(p))
        if "total" in r: return r
        time.sleep(3)
    raise SystemExit("no total")
bj=get("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/11/query?"+urllib.parse.urlencode({"where":"STATE='45' AND BASENAME='Horry'","outFields":"GEOID","returnGeometry":"true","outSR":"4326","f":"json","maxAllowableOffset":"0.0002"}))
poly=unary_union([Polygon(r).buffer(0) for r in bj["features"][0]["geometry"]["rings"] if len(r)>=4])
def slices(lo,hi,typ):
    n=m(type=typ,min=lo,max=hi)["total"]
    if n==0: return []
    if n<140 or hi-lo<=1000: return [(lo,hi)]
    mid=(lo+hi)//2
    return slices(lo,mid,typ)+slices(mid+1,hi,typ)
seen={}
for typ in ["house","condo","townhouse"]:
    for lo,hi in slices(0,20000000,typ):
        for x in m(type=typ,min=lo,max=hi)["pins"]: seen[x["mls"]]=(typ,x["lat"],x["lng"],x["addr"],x["price"])
out={"read":datetime.datetime.now(datetime.UTC).isoformat(),"rule":__doc__,"boundary":"TIGERweb State_County layer 11, Horry GEOID 45051","pins_collected":len(seen)}
inside=collections.Counter();bycity=collections.defaultdict(collections.Counter);byzip=collections.Counter();outside=collections.Counter();prices=collections.defaultdict(list)
for k,(t,la,ln,addr,pr) in seen.items():
    parts=[s.strip() for s in addr.split(",")]
    city=parts[-3] if len(parts)>=3 else "?"; z=re.findall(r"\d{5}",addr); z=z[-1] if z else "?"
    if poly.contains(Point(ln,la)):
        inside[t]+=1; bycity[city][t]+=1; byzip[z]+=1
        prices[t].append(int(re.sub(r"[^\d]","",pr)))
    else: outside[city]+=1
out["inside_by_kind"]=dict(inside); out["inside_total"]=sum(inside.values())
out["inside_by_mls_city"]={c:dict(v) for c,v in sorted(bycity.items(),key=lambda x:-sum(x[1].values()))}
out["inside_by_zip"]=dict(byzip.most_common()); out["outside_by_mls_city"]=dict(outside.most_common(15))
import statistics as st
out["asking"]={t:{"n":len(v),"median":st.median(v),"min":min(v),"max":max(v),"p25":sorted(v)[len(v)//4],"p75":sorted(v)[3*len(v)//4]} for t,v in prices.items()}
bands=[(0,200000),(200000,300000),(300000,400000),(400000,600000),(600000,10**9)]
out["asking_bands_all_kinds"]={f"{a}-{b}":sum(1 for t in prices for p in prices[t] if a<=p<b) for a,b in bands}
out["asking_bands_house"]={f"{a}-{b}":sum(1 for p in prices["house"] if a<=p<b) for a,b in bands}
json.dump(out,open(D+"/county-pull.json","w"),indent=1); print(json.dumps(out,indent=1))
