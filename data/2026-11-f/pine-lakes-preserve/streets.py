"""Which county legal descriptions hold the streets of the MLS 'The Preserve at Pine Lakes' pins. Run: python3 -I streets.py"""
import json,urllib.request,urllib.parse,collections
U="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
def q(l,p):
    return json.loads(urllib.request.urlopen(urllib.request.Request(U+"%d/query"%l,data=urllib.parse.urlencode(dict(p,f="json")).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read())
out={}
for s in ["LACEBARK","CANARY ISLAND","KNOBCONE","WHITEBARK","SPRINGS","PICKENS","POINSETT"]:
    d=q(42,{"where":"STREETNAME LIKE '%%%s%%' AND POSTAL_CITY='Myrtle Beach'"%s,"outFields":"PIN,STREETNAME,SUBDIVISION","returnGeometry":"false","resultRecordCount":3000})
    pins=sorted({int(f["attributes"]["PIN"]) for f in d["features"]})
    c=collections.Counter()
    for i in range(0,len(pins),100):
        r=q(24,{"where":"PIN IN (%s)"%",".join(map(str,pins[i:i+100])),"outFields":"LegalDescr","returnGeometry":"false"})
        for f in r["features"]:c[(f["attributes"]["LegalDescr"] or "").split(";")[0].strip()]+=1
    out[s]={"addresses":len(d["features"]),"parcels":len(pins),"legal":c.most_common(8)}
    print(s,out[s])
json.dump(out,open("raw/streets.json","w"),indent=1)
