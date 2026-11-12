"""Every Horry County parcel the county codes as a 2, 3 or 4 unit building (land use 102, 103, 104) with a building value, and its address points.
Layer 24 (Parcels): PIN, LandUseCode, AssessedProp, TaxableProp, MarketProp, MarketImprv, TaxDistrict, SaleDate. LegalDescr (subdivision and lot; no owner fields).
Layer 22 (Addresses): PIN, CITY, POSTAL_CITY, ZIPCODE and the point (street names are not kept).
Also the county-wide count of parcels with a building, by land use code (one statistics query), for context.
Usage: RAW=<scratch> python3 -I fetch_county.py <datadir>. Writes RAW/smf-parcels.json, RAW/smf-addresses.json and <datadir>/raw/stock-by-landuse.json."""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True); os.makedirs(os.path.join(D, "raw"), exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(layer, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
par = []
for c in ("102", "103", "104"):
    d = q(24, {"where": "LandUseCode='%s' AND MarketImprv>0" % c, "outFields": "PIN,LandUseCode,AssessedProp,TaxableProp,MarketProp,MarketImprv,TaxDistrict,SaleDate,LegalDescr", "returnGeometry": "false"})
    assert not d.get("exceededTransferLimit"); par += [f["attributes"] for f in d["features"]]
json.dump({"fetched": time.strftime("%Y-%m-%d"), "source": Q % 24, "parcels": par}, open(os.path.join(RAW, "smf-parcels.json"), "w"))
pins = sorted({p["PIN"] for p in par}); adr = []
for i in range(0, len(pins), 200):
    adr += [dict(f["attributes"], lng=f["geometry"]["x"], lat=f["geometry"]["y"]) for f in q(22, {"where": "PIN IN (%s)" % ",".join(map(str, pins[i:i + 200])), "outFields": "PIN,CITY,POSTAL_CITY,ZIPCODE", "returnGeometry": "true", "outSR": "4326"})["features"]]
json.dump({"fetched": time.strftime("%Y-%m-%d"), "source": Q % 22, "addresses": adr}, open(os.path.join(RAW, "smf-addresses.json"), "w"))
st = q(24, {"where": "LandUseCode LIKE '1%' AND MarketImprv>0", "outStatistics": json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}]), "groupByFieldsForStatistics": "LandUseCode"})
json.dump({"fetched": time.strftime("%Y-%m-%d"), "query": "layer 24, LandUseCode LIKE '1%' AND MarketImprv>0, count by LandUseCode", "rows": sorted([[f["attributes"]["LandUseCode"], f["attributes"]["n"]] for f in st["features"]])}, open(os.path.join(D, "raw", "stock-by-landuse.json"), "w"), indent=0)
print(len(par), "parcels", len(adr), "address points")
