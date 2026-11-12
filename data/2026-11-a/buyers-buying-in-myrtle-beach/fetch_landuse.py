"""County land use code for every parcel in the deed pull, so a sale counts as a condo by the same rule as
/sell/home-value/ (land use 107 or HPR in the legal description). Horry County GIS parcel layer 24, fields PIN and
LandUseCode only. Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I fetch_landuse.py -> RAW/landuse.json (PINs stay in scratch)."""
import json, os, sys, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; S = json.load(open(os.environ["SALES"]))["sales"]
URL = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
pins = sorted({str(int(x["pin"])) for x in S if x.get("pin")})
out = {}
for i in range(0, len(pins), 400):
    data = urllib.parse.urlencode({"where": "PIN IN (" + ",".join(pins[i:i+400]) + ")", "outFields": "PIN,LandUseCode", "returnGeometry": "false", "f": "json"}).encode()
    for k in range(6):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(URL, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=120))
            if "error" in d: raise Exception(d["error"])
            break
        except Exception as e: print("retry", i, e, file=sys.stderr); time.sleep(4 + 3 * k)
    for f in d["features"]: out[str(int(f["attributes"]["PIN"])).zfill(11)] = f["attributes"]["LandUseCode"]
    print(i, len(out), flush=True)
json.dump(out, open(os.path.join(RAW, "landuse.json"), "w"))
print("pins", len(pins), "found", len(out))
