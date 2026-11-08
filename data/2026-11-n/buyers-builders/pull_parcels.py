"""County parcel record (Horry County GIS MapServer layer 24, Parcels) for every parcel on a priced deed in raw/deeds-co.json,
then the postal city (layer 22, Addresses: POSTAL_CITY only, no street or number) for every parcel a company sold.
Adapted from data/2026-10-d/buyers-new-construction/pull_parcels.py. Owner mailing state only, no owner name or street.
Usage: python3 -I pull_parcels.py <this dir> -> raw/parcels.json, raw/postal-city.json"""
import json, sys, os, time, re, urllib.request, urllib.parse, datetime
D = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
deeds = json.load(open(os.path.join(D, "raw", "deeds-co.json")))["deeds"]
pins = sorted(set(d["ParcelNumber"] for d in deeds if (d["Consideration"] or 0) > 10000 and re.fullmatch(r"\d{11}", d["ParcelNumber"] or "")))
copins = sorted(set(d["ParcelNumber"] for d in deeds if d["DirectName"] and (d["Consideration"] or 0) > 10000 and re.fullmatch(r"\d{11}", d["ParcelNumber"] or "")))
print("pins", len(pins), "company pins", len(copins), flush=True)
F = "PIN,PINtext,LandUseCode,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,LegalDescr,TaxDistrict,OwnerState,SaleDate,Acreage,MarketArea,MarketSubArea"
def post(layer, p):
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=urllib.parse.urlencode(p).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
out = {}
for i in range(0, len(pins), 150):
    chunk = pins[i:i + 150]
    d = post(24, {"where": "PIN IN (" + ",".join(chunk) + ")", "outFields": F, "returnGeometry": "true", "outSR": "4326",
              "maxAllowableOffset": "0.0002", "geometryPrecision": "5", "f": "json"})
    for f in d["features"]:
        a = f["attributes"]; g = f.get("geometry") or {}
        pts = [p for r in g.get("rings", []) for p in r]
        a["lng"] = round(sum(p[0] for p in pts) / len(pts), 5) if pts else None
        a["lat"] = round(sum(p[1] for p in pts) / len(pts), 5) if pts else None
        out["%011d" % int(a["PIN"])] = a
    if i % 3000 == 0: print(i, len(out), flush=True)
json.dump({"source": Q % 24, "read": datetime.datetime.utcnow().isoformat() + "Z", "fields": F, "parcels": out}, open(os.path.join(D, "raw", "parcels.json"), "w"))
print("parcels", len(out), flush=True)
pc = {}
for i in range(0, len(copins), 150):
    chunk = copins[i:i + 150]
    d = post(22, {"where": "PIN IN (" + ",".join(chunk) + ")", "outFields": "PIN,POSTAL_CITY", "returnGeometry": "false", "f": "json"})
    for f in d["features"]:
        a = f["attributes"]; pc.setdefault(str(int(a["PIN"])).zfill(11), (a["POSTAL_CITY"] or "").strip().title())
json.dump({"source": Q % 22, "read": datetime.datetime.utcnow().isoformat() + "Z", "note": "POSTAL_CITY by PIN, first address point; no street or number",
           "postal_city": pc}, open(os.path.join(D, "raw", "postal-city.json"), "w"))
print("postal", len(pc))
