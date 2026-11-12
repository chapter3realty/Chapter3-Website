"""Fetch Horry County parcel (layer 24) and address point (layer 22) records for every PIN in the deed pull.
Usage: python3 -I fetch_parcels.py <datadir>"""
import sys, json, glob, os, time, urllib.request, urllib.parse
D = sys.argv[1]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-2*.json"))) for r in json.load(open(f))["Data"]]
pins = sorted({r["ParcelNumber"].strip() for r in rows if (r["ParcelNumber"] or "").strip().isdigit() and len(r["ParcelNumber"].strip()) == 11})
print(len(pins), "pins")
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def get(layer, where, fields):
    data = urllib.parse.urlencode({"where": where, "outFields": fields, "returnGeometry": "false", "f": "json"}).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=data), timeout=180).read())
            if "error" in d: raise Exception(d["error"])
            return d["features"]
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
out = {}
for layer, fields, name in [(24, "PIN,OwnerName,OwnerCity,OwnerState,OwnerZip,OwnerZipCode,DeedBook,DeedPage,SaleDate,LandUseCode,MarketImprv,MarketLand,MarketProp,LegalDescr,TaxDistrict", "parcels"),
                            (22, "PIN,CITY,POSTAL_CITY,ZIPCODE,SUBDIVISION,UNIT", "addresses")]:
    f = os.path.join(RAW, name + ".json")
    if os.path.exists(f): continue
    feats = []
    for i in range(0, len(pins), 200):
        chunk = pins[i:i + 200]
        feats += [x["attributes"] for x in get(layer, "PIN IN (" + ",".join(chunk) + ")", fields)]
        print(name, i, len(feats), flush=True)
    json.dump(feats, open(f, "w"))
