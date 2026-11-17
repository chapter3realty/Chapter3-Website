"""Straight-line miles from the Patricia Grand parcel footprint centre (flood.json) to the OSM points in
data/2026-11-b/invest-condo-buildings/landmark-distances.json (CB row 26). Run: python3 -I pull_distances.py <this dir> <website root>"""
import json,math,sys
D,W=sys.argv[1:3]
c=json.load(open(D+"/flood.json"))["footprint_center"]
L=json.load(open(W+"/data/2026-11-b/invest-condo-buildings/landmark-distances.json"))["landmarks"]
def mi(a,b):
    R=3958.8;p1,p2=math.radians(a[0]),math.radians(b[0]);dl=math.radians(b[1]-a[1])
    return 2*R*math.asin(math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
out={"center":c,"method":__doc__,"miles":{k:round(mi(c,v),2) for k,v in L.items()}}
json.dump(out,open(D+"/distances.json","w"),indent=1);print(json.dumps(out["miles"],indent=1))
