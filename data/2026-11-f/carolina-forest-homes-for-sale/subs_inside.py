"""For each MLS subdivision name with homes for sale in the MLS Carolina Forest area, what share of its homes sit inside the Census-designated place outline. Uses the map pins (lat, lng) only; saves counts per subdivision, no coordinates. Usage: python3 -I subs_inside.py <dir>"""
import json,sys,time,urllib.request,urllib.parse,collections
from shapely.geometry import shape,Point
D=sys.argv[1]; cf=shape(json.load(open(D+"/carolina-forest-outline.geojson"))["features"][0]["geometry"])
B="https://chapter3realty.com/homes/api/map?"
def get(p):
    u=B+urllib.parse.urlencode(p)
    for i in range(10):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=60))
            if r.get("ok"): return r
        except Exception: pass
        time.sleep(3+2*i)
    return None
cards=json.load(open(D+"/cards-anon.json")); names=sorted({c["sub"] for c in cards if c["sub"]})
out={}
for n in names:
    r=get({"subdivision":n,"has":"area_carolina_forest"})
    if not r: out[n]={"error":True}; continue
    pins=r["pins"]; ins=sum(1 for p in pins if cf.contains(Point(p["lng"],p["lat"])))
    out[n]={"total":r["total"],"pins":len(pins),"inside_census_place":ins}
    time.sleep(.3)
json.dump(out,open(D+"/subs-inside.json","w"),indent=1)
for n,v in sorted(out.items(),key=lambda x:-x[1].get("total",0)): print(n,v)
