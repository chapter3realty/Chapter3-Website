"""Riverwalk (Riverwalk at Arrowhead, Riverwalk II, Riverwalk Townhomes at Arrowhead; Myrtle Beach 29579): Horry County public GIS.
Parcels whose LegalDescr starts RIVERWALK, layers 24 parcels, 22 addresses, 19 flood, 21 hydro, 30 zoning, 31 municipalities, 27 footprints.
Saves aggregate only to county.json; the per-parcel cache goes to RAW (outside the repo). Run: RAW=<dir> python3 -I pull_county.py <this dir>"""
import json, os, sys, time, urllib.request, urllib.parse, datetime
D, RAW = sys.argv[1], os.environ["RAW"]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def post(layer, p):
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(B % layer, data=urllib.parse.urlencode(dict(p, f="json")).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
def allrows(layer, p):
    out, off = [], 0
    while True:
        d = post(layer, dict(p, resultOffset=off, resultRecordCount=1000)); out += d["features"]
        if not d.get("exceededTransferLimit"): return out
        off += 1000
F = "PIN,LegalDescr,LandUseCode,Acreage,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,TaxDistrict,OwnerState,MarketSubArea,SaleDate,MarketArea,OwnerState"
rows = allrows(24, {"where": "LegalDescr LIKE 'RIVERWALK%'", "outFields": F + ",Shape.STArea()", "returnGeometry": "true", "outSR": "4326", "geometryPrecision": "6"})
xs = [p[0] for r in rows for ring in r["geometry"]["rings"] for p in ring]; ys = [p[1] for r in rows for ring in r["geometry"]["rings"] for p in ring]
env = {"geometry": f"{min(xs)-.004},{min(ys)-.004},{max(xs)+.004},{max(ys)+.004}", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outSR": "4326", "returnGeometry": "true", "geometryPrecision": "6"}
geo = {k: allrows(n, dict(env, outFields=f)) for k, (n, f) in {"flood": (19, "FLD_ZONE,SFHA_TF"), "hydro": (21, "*"), "zoning": (30, "*"), "towns": (31, "*"), "footprints": (27, "FTR_CODE")}.items()}
big = [r for r in allrows(24, dict(env, outFields="PIN,OwnerName,LegalDescr,LandUseCode,Shape.STArea()")) if (r["attributes"]["Shape.STArea()"] or 0) > 20 * 43560]
for r in big:
    n = r["attributes"]["OwnerName"] or ""
    import re
    if not re.search(r"\b(LLC|INC|CO|COMPANY|CORP|AUTH|COUNTY|CITY|HOA|POA|ASSOC|CLUB|PARTNERSHIP)\b", n): r["attributes"]["OwnerName"] = "(person)"
geo["big"] = big
json.dump({"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rows": rows, "geo": geo}, open(os.path.join(RAW, "county.json"), "w"))
print(len(rows), {k: len(v) for k, v in geo.items()}, env["geometry"])
