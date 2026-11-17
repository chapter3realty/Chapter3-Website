"""The Preserve at Pine Lakes (Myrtle Beach SC 29577): county GIS parcels whose legal description starts PINE LAKES PH (1A, 1B, 2, 3) or PINE LAKE PH.
(The MLS name "The Preserve at Pine Lakes" sits on Lacebark Trl, Canary Island Ct, Knobcone Lp and Whitebark Dr; the county names them Pine Lakes Phases 1A to 3. "Pine Lakes Estates" is a separate older section: left out.)
Layers (MapServer https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer): 24 Parcels, 42 Addresses (it was 22 until Nov 2026), 27 Building Footprints, 19 Flood Zones, 21 Hydrography, 30 Zoning, 31 Municipalities.
Owner names are kept only for parcels over 5 acres, business names only. Cache goes to RAW (outside the repo).
Run: RAW=<scratch dir> python3 -I pull_county.py"""
import json, os, re, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]; B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def post(layer, p):
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(B % layer, data=urllib.parse.urlencode(dict(p, f="json")).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", layer, e); time.sleep(5)
    raise SystemExit("failed")
def allrows(layer, p):
    out, off = [], 0
    while True:
        d = post(layer, dict(p, resultOffset=off, resultRecordCount=1000)); out += d["features"]
        if not d.get("exceededTransferLimit"): return out
        off += 1000
F = "PIN,LegalDescr,LandUseCode,Acreage,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,TaxDistrict,OwnerState,MarketSubArea,MarketArea"
rows = allrows(24, {"where": "(LegalDescr LIKE 'PINE LAKES PH%' OR LegalDescr LIKE 'PINE LAKE PH%')", "outFields": F + ",Shape.STArea()", "returnGeometry": "true", "outSR": "4326", "geometryPrecision": "6"})
parcels = {}
for r in rows:
    a = r["attributes"]; a["lotSqft"] = round(a.pop("Shape.STArea()")); a["section"] = a["LegalDescr"].split(";")[0].strip(); a["rings"] = r["geometry"]["rings"]
    parcels[str(int(a["PIN"])).zfill(11)] = a
print("parcels", len(parcels))
xs = [p[0] for a in parcels.values() for ring in a["rings"] for p in ring]; ys = [p[1] for a in parcels.values() for ring in a["rings"] for p in ring]
env = {"geometry": f"{min(xs)-.003},{min(ys)-.003},{max(xs)+.003},{max(ys)+.003}", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outSR": "4326", "returnGeometry": "true", "geometryPrecision": "6"}
print("envelope", env["geometry"])
layers = {"footprints": (27, "OBJECTID,FTR_CODE"), "flood": (19, "FLD_ZONE,SFHA_TF,STATIC_BFE"), "hydro": (21, "*"), "zoning": (30, "*"), "towns": (31, "*")}
geo = {k: allrows(n, dict(env, outFields=f)) for k, (n, f) in layers.items()}
for k, v in geo.items(): print(k, len(v))
big = allrows(24, dict(env, outFields="PIN,OwnerName,LegalDescr,LandUseCode,Acreage,Shape.STArea()"))
big = [r for r in big if (r["attributes"]["Shape.STArea()"] or 0) > 5 * 43560]
for r in big:
    n = r["attributes"]["OwnerName"] or ""
    if not re.search(r"\b(LLC|INC|CO|COMPANY|CORP|AUTH|COUNTY|CITY|HOA|POA|ASSOC|SCHOOL|PARTNERSHIP|LP|LTD|CLUB)\b", n): r["attributes"]["OwnerName"] = "(person)"
geo["big"] = big
pins = sorted(parcels); streets = {}
for i in range(0, len(pins), 150):
    for f in post(42, {"where": "PIN IN (" + ",".join(pins[i:i+150]) + ")", "outFields": "PIN,STREETNAME,CITY,POSTAL_CITY,SUBDIVISION", "returnGeometry": "false"})["features"]:
        a = f["attributes"]; streets.setdefault(str(int(a["PIN"])).zfill(11), []).append({"street": (a["STREETNAME"] or "").strip(), "city": a["CITY"], "postal": a["POSTAL_CITY"], "sub": a["SUBDIVISION"]})
json.dump({"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": B % 24, "parcels": parcels, "addresses": streets, "geo": geo}, open(os.path.join(RAW, "county.json"), "w"))
print("addresses", len(streets))
