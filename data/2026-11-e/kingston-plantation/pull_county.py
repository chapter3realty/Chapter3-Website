"""Kingston Plantation (Myrtle Beach, 29572): every county parcel whose legal description contains KINGSTON PLANT / KINGSTON PLNT
or a Kingston Plantation building name, from Horry County public GIS Parcels layer 24
(https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24), attributes plus the parcel outline (WGS84).
Owner names go to RAW only (scratch), never the repo. Run: RAW=<scratch> python3 -I pull_county.py"""
import json, os, urllib.request, urllib.parse, time, sys
RAW=os.environ["RAW"]
S="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def post(p):
    for i in range(6):
        try:
            d=json.loads(urllib.request.urlopen(urllib.request.Request(S,data=urllib.parse.urlencode(dict(p,f="json")).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry",e,file=sys.stderr); time.sleep(5)
    raise SystemExit("fail")
out=[];off=0
while True:
    d=post({"where":"UPPER(LegalDescr) LIKE '%KINGSTON%'","outFields":"PIN,TMS,LegalDescr,OwnerState,TaxDistrict,LandUseCode,Acreage,SaleDate,MarketLand,MarketImprv,MarketProp,TaxableProp,AssessedProp,MarketSubArea,MarketArea","returnGeometry":"true","outSR":"4326","resultOffset":off,"resultRecordCount":500})
    out+=d["features"]; off+=500
    if not d.get("exceededTransferLimit"): break
json.dump(out,open(os.path.join(RAW,"kingston-parcels.json"),"w"))
print(len(out))
