"""Checks that a near= circle search returns only homes inside Horry County and of the asked type. Usage: python3 -I check_near.py lat lng miles. Counts only."""
import json,sys,time,urllib.request,urllib.parse,collections
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
def get(u):
    for i in range(8):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
            if r.get("ok") is not False: return r
        except Exception: pass
        time.sleep(3+2*i)
bj=get("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/11/query?"+urllib.parse.urlencode({"where":"STATE='45' AND BASENAME='Horry'","outFields":"GEOID","returnGeometry":"true","outSR":"4326","f":"json","maxAllowableOffset":"0.0002"}))
poly=unary_union([Polygon(r).buffer(0) for r in bj["features"][0]["geometry"]["rings"] if len(r)>=4])
la,ln,mi=sys.argv[1:4]
for t in ["house","condo"]:
    r=get("https://chapter3realty.com/homes/api/map?"+urllib.parse.urlencode({"near":f"{la},{ln}","miles":mi,"type":t}))
    c=collections.Counter((p["addr"].split(",")[-3].strip(),poly.contains(Point(p["lng"],p["lat"]))) for p in r["pins"])
    print(t,r["total"],len(r["pins"]),dict(c))
