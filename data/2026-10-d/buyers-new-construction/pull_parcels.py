"""County parcel record (Horry County GIS MapServer layer 24, Parcels) for every parcel on a priced deed in raw/deeds.json.
Saves land use code, county market land and building values, assessed and taxable value, legal description,
tax district, owner mailing state (no owner name or street) and a center point.
Usage: python3 -I pull_parcels.py <this dir> -> raw/parcels.json"""
import json, sys, os, time, re, urllib.request, urllib.parse, datetime
D = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
deeds = json.load(open(os.path.join(D, "raw", "deeds.json")))["deeds"]
pins = sorted(set(d["ParcelNumber"] for d in deeds if (d["Consideration"] or 0) > 10000 and re.fullmatch(r"\d{11}", d["ParcelNumber"] or "")))
print("pins", len(pins), flush=True)
F = "PIN,PINtext,LandUseCode,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,LegalDescr,TaxDistrict,OwnerState,SaleDate,Acreage,MarketArea,MarketSubArea"
out = {}
def post(p):
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=urllib.parse.urlencode(p).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
for i in range(0, len(pins), 150):
    chunk = pins[i:i + 150]
    d = post({"where": "PIN IN (" + ",".join(chunk) + ")", "outFields": F, "returnGeometry": "true", "outSR": "4326",
              "maxAllowableOffset": "0.0002", "geometryPrecision": "5", "f": "json"})
    for f in d["features"]:
        a = f["attributes"]; g = f.get("geometry") or {}
        pts = [p for r in g.get("rings", []) for p in r]
        a["lng"] = round(sum(p[0] for p in pts) / len(pts), 5) if pts else None
        a["lat"] = round(sum(p[1] for p in pts) / len(pts), 5) if pts else None
        out["%011d" % int(a["PIN"])] = a
    if i % 3000 == 0: print(i, len(out), flush=True)
json.dump({"source": Q, "read": datetime.datetime.utcnow().isoformat() + "Z", "fields": F, "parcels": out}, open(os.path.join(D, "raw", "parcels.json"), "w"))
print("parcels", len(out))
