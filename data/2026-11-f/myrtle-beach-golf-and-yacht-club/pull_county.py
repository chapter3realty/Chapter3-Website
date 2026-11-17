"""MB Golf & Yacht (Socastee, unincorporated Horry County): parcels whose legal description starts 'MB GOLF & YACHT' from the county public GIS
(https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer, layer 24). No owner names, no PIN saved. Run: python3 -I pull_county.py <dir>"""
import json,sys,urllib.request,urllib.parse,collections,statistics as st,datetime
B="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def post(p):
    return json.loads(urllib.request.urlopen(urllib.request.Request(B,data=urllib.parse.urlencode(dict(p,f="json")).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read())
rows=[];off=0
while True:
    d=post({"where":"LegalDescr LIKE 'MB GOLF & YACHT%'","outFields":"LegalDescr,LandUseCode,Acreage,MarketLand,MarketImprv,MarketProp,TaxDistrict,MarketArea,MarketSubArea,SaleDate,Shape.STArea()","returnGeometry":"true","outSR":"4326","geometryPrecision":"5","resultOffset":off,"resultRecordCount":1000})
    rows+=d["features"]
    if not d.get("exceededTransferLimit"):break
    off+=1000
out=[]
for f in rows:
    a=f["attributes"];g=f.get("geometry",{}).get("rings",[[[0,0]]])[0]
    xs=[p[0] for p in g];ys=[p[1] for p in g]
    out.append({"legal":a["LegalDescr"].split(";")[0]+";"+(a["LegalDescr"].split(";",1)[1][:12] if ";" in a["LegalDescr"] else ""),"luc":a["LandUseCode"],"acres":a["Acreage"],"area_ft2":a["Shape.STArea()"],"land":a["MarketLand"],"imprv":a["MarketImprv"],"prop":a["MarketProp"],"taxdist":a["TaxDistrict"],"ma":a["MarketArea"],"sub":a["MarketSubArea"],"sale":a["SaleDate"],"cx":round(sum(xs)/len(xs),4),"cy":round(sum(ys)/len(ys),4)})
json.dump({"pulled":datetime.datetime.utcnow().isoformat(),"n":len(out),"parcels":out},open(sys.argv[1]+"/parcels.json","w"))
print(len(out),collections.Counter(o["luc"] for o in out),collections.Counter((o["ma"],o["sub"],o["taxdist"]) for o in out))
