"""Fetch Horry County parcel records (GIS layer 24) for every PIN in the deed pull.
Usage: RAW=<scratch dir> python3 -I fetch_parcels.py [<older parcels.json to reuse> ...]
Writes RAW/parcels.json. Parcel records carry owner names, so RAW stays outside the repo."""
import sys, json, glob, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-20*.json"))) for r in json.load(open(f))["Data"]]
pins = sorted({r["ParcelNumber"].strip() for r in rows if (r["ParcelNumber"] or "").strip().isdigit() and len(r["ParcelNumber"].strip()) == 11 and (r["Consideration"] or 0) >= 10000})
print(len(pins), "pins with a price of $10,000 or more", flush=True)
F = "PIN,OwnerState,DeedBook,DeedPage,SaleDate,LandUseCode,MarketImprv,MarketLand,MarketProp,LegalDescr,TaxDistrict"
out = os.path.join(RAW, "parcels.json")
have = {}
for f in [out] + sys.argv[1:]:
    if os.path.exists(f):
        for p in json.load(open(f)):
            have.setdefault(str(int(p["PIN"])).zfill(11), {k: p.get(k) for k in F.split(",")})
need = [p for p in pins if p not in have]
print(len(have), "reused,", len(need), "to fetch", flush=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def get(where):
    data = urllib.parse.urlencode({"where": where, "outFields": F, "returnGeometry": "false", "f": "json"}).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=180).read())
            if "error" in d: raise Exception(d["error"])
            return d["features"]
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(10)
    raise SystemExit("failed")
for i in range(0, len(need), 400):
    for x in get("PIN IN (" + ",".join(need[i:i + 400]) + ")"):
        a = x["attributes"]; have[str(int(a["PIN"])).zfill(11)] = a
    if i % 4000 == 0:
        print(i, len(have), flush=True); json.dump(list(have.values()), open(out, "w"))
json.dump(list(have.values()), open(out, "w"))
print("done", len(have))
