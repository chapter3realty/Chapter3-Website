"""Which county tax districts hold the Longs-postal houses, and which municipality (county layer 31) a sample point of each sits in. No parcel numbers saved.
Usage: python3 -I district_city.py <buyers-builders dir> > district-city.json"""
import json,sys,urllib.request,urllib.parse,collections,random
B=sys.argv[1]
P=json.load(open(B+"/raw/parcels.json"))["parcels"];PC=json.load(open("postal-all.json"))["postal_city"]
by=collections.defaultdict(list)
for k,v in PC.items():
    if v[0]=="Longs" and k in P and P[k].get("lng"): by[P[k]["TaxDistrict"]].append(k)
random.seed(1);out={}
for t,L in by.items():
    res=collections.Counter()
    for k in random.sample(L,min(12,len(L))):
        p=P[k];q=urllib.parse.urlencode({"geometry":"%f,%f"%(p["lng"],p["lat"]),"geometryType":"esriGeometryPoint","inSR":"4326","spatialRel":"esriSpatialRelIntersects","outFields":"NAME","returnGeometry":"false","f":"json"})
        d=json.load(urllib.request.urlopen(urllib.request.Request("https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/31/query?"+q,headers={"User-Agent":"Mozilla/5.0"}),timeout=60))
        res[(d["features"][0]["attributes"]["NAME"] if d["features"] else "unincorporated")]+=1
    out[t]={"parcels_longs_postal":len(L),"sample_city":dict(res)}
print(json.dumps(out,indent=1))
