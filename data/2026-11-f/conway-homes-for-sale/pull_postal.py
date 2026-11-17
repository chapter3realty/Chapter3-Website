"""Postal city (county address layer 42, POSTAL_CITY, ZIPCODE and SUBDIVISION only, no street or number) for every parcel on the county deed file used by data/2026-11-n/buyers-builders. Usage: python3 -I pull_postal.py <buyers-builders dir> <out dir>. Writes postal-all.json."""
import json,sys,os,time,urllib.request,urllib.parse,datetime
B,O=sys.argv[1],sys.argv[2]
Q="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/42/query"
pins=sorted(json.load(open(os.path.join(B,"raw","parcels.json")))["parcels"])
def post(p):
    for k in range(6):
        try:
            d=json.loads(urllib.request.urlopen(urllib.request.Request(Q,data=urllib.parse.urlencode(p).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: time.sleep(5)
    raise SystemExit("failed")
pc={}
for i in range(0,len(pins),150):
    d=post({"where":"PIN IN ("+",".join(pins[i:i+150])+")","outFields":"PIN,POSTAL_CITY,ZIPCODE,SUBDIVISION","returnGeometry":"false","f":"json"})
    for f in d["features"]:
        a=f["attributes"];pc.setdefault(str(int(a["PIN"])).zfill(11),((a["POSTAL_CITY"] or "").strip().title(),str(a["ZIPCODE"] or "")[:5],(a["SUBDIVISION"] or "").strip()))
    if i%3000==0: print(i,len(pc),flush=True)
json.dump({"source":Q,"read":datetime.datetime.now(datetime.UTC).isoformat(),"note":"POSTAL_CITY by PIN, first address point","postal_city":pc},open(os.path.join(O,"postal-all.json"),"w"))
print("done",len(pc))
