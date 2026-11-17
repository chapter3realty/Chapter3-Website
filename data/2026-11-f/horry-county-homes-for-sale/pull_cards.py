"""One anonymous card per home for sale inside Horry County (pins placed against the TIGERweb Horry boundary as in pull_county.py), from the site's public map API and card lookup (the card lookup answers found:false now and then under load, so each home is asked up to 5 times) (price, beds, baths, size, year built, monthly HOA fee, MLS city, new construction). No MLS number, address, firm or photo is saved. Usage: python3 -I pull_cards.py <dir>"""
import json,sys,time,urllib.request,urllib.parse,datetime,re,threading
from concurrent.futures import ThreadPoolExecutor
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
D=sys.argv[1];B="https://chapter3realty.com/homes/api/"
def get(u):
    for i in range(8):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
            if r.get("ok") is not False: return r
        except Exception: pass
        time.sleep(3+2*i)
    return None
def m(**p):
    for i in range(8):
        r=get(B+"map?"+urllib.parse.urlencode(p))
        if r and "total" in r: return r
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
        for x in m(type=typ,min=lo,max=hi)["pins"]:
            if poly.contains(Point(x["lng"],x["lat"])): seen[x["mls"]]=(typ,x["addr"].split(",")[-3].strip())
print("pins inside",len(seen),flush=True)
def card(k):
    mls,(t,city)=k; time.sleep(0.1)
    f={}
    for i in range(5):
        r=get(B+"lookup?"+urllib.parse.urlencode({"mls":mls})); f=(r or {}).get("facts") or {}
        if f: break
        time.sleep(2+i)
    return dict(type=t,city=city,price=f.get("listPrice"),beds=f.get("beds"),baths=f.get("baths"),sqft=f.get("sqft"),yb=f.get("yearBuilt"),hoa=f.get("hoaMonthly"),newc=f.get("newConstruction"),answered=bool(f))
with ThreadPoolExecutor(4) as ex: cards=list(ex.map(card,seen.items()))
json.dump({"read":datetime.datetime.now(datetime.UTC).isoformat(),"rule":__doc__,"cards":cards},open(D+"/cards-anon.json","w"))
print(len(cards),sum(c["answered"] for c in cards))
