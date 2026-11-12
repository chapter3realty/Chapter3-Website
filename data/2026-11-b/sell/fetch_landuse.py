"""Which kept sales sit on a parcel the county codes 107 (condo unit), so deeds_offmarket.py splits houses and condos
the way /sell/home-value/ does (land use 107 or HPR in the legal description).
Usage: SALES=<out-of-state-buyers.json> RAW=<scratch> python3 -I fetch_landuse.py   -> RAW/landuse-107.json (a list of PINs)"""
import os, json, urllib.request, urllib.parse, time
S = json.load(open(os.environ["SALES"]))["sales"]; RAW = os.environ["RAW"]
pins = sorted({s["pin"] for s in S})
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
hit = set()
for i in range(0, len(pins), 150):
    chunk = pins[i:i + 150]
    q = {"where": f"LandUseCode='107' AND PIN IN ({','.join(str(int(p)) for p in chunk)})", "outFields": "PIN", "returnGeometry": "false", "f": "json"}
    for t in range(4):
        try:
            r = json.loads(urllib.request.urlopen(urllib.request.Request(U, data=urllib.parse.urlencode(q).encode(), headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=120).read()); break
        except Exception as e: print("retry", e); time.sleep(5)
    hit |= {str(int(f["attributes"]["PIN"])).zfill(11) for f in r.get("features", [])}
json.dump({"read": time.strftime("%Y-%m-%d"), "source": U, "rule": "LandUseCode = '107'", "pins_checked": len(pins), "pins_107": sorted(hit)}, open(os.path.join(RAW, "landuse-107.json"), "w"))
print(len(pins), len(hit))
