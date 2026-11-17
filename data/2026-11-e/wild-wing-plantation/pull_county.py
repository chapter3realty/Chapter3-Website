"""Wild Wing Plantation (near Conway, unincorporated Horry County): the county's public GIS, read for the community's parcels.
Community = every parcel in market area 2 (Conway east) or CARU whose legal description names Wild Wing (section names:
WILD WING PLANTATION*, WILD WING PLNTN*, WILD WING PH 2-B, SANC @ WILD WING*, FAIRWAYS @WILDWING*), land use not commercial.
Layers (https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer): 24 Parcels, 22 Addresses (street names only),
27 Building Footprints, 19 Flood Zones, 21 Hydrography, 30 Zoning, 31 Municipalities. Owner names are never saved except business
names of parcels over 20 acres (to find the golf course); owner mailing state only. Cache goes to RAW (outside the repo).
Run: RAW=<scratch dir> python3 -I pull_county.py <this dir>"""
import json, os, sys, time, re, urllib.request, urllib.parse, datetime
D, RAW = sys.argv[1], os.environ["RAW"]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def post(layer, p):
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(B % layer, data=urllib.parse.urlencode(dict(p, f="json")).encode(),
                headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", layer, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
def allrows(layer, p):
    out, off = [], 0
    while True:
        d = post(layer, dict(p, resultOffset=off, resultRecordCount=1000)); out += d["features"]
        if not d.get("exceededTransferLimit"): return out
        off += 1000
F = "PIN,LegalDescr,LandUseCode,Acreage,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,TaxDistrict,OwnerState,MarketSubArea,MarketArea,SaleDate"
rows = allrows(24, {"where": "(LegalDescr LIKE '%WILD WING%' OR LegalDescr LIKE '%WILDWING%' OR LegalDescr LIKE 'SANC @ WILD%')", "outFields": F + ",Shape.STArea()", "returnGeometry": "true", "outSR": "4326", "geometryPrecision": "6"})
SECT = r"^(WILD WING PLANTATION|WILD WING PLNTN|WILD WING PH|SANC @ WILD WING|FAIRWAYS @WILDWING)"
parcels = {}
for r in rows:
    a = r["attributes"]
    if not re.match(SECT, a["LegalDescr"] or "") or a["MarketArea"] == "CM002": continue
    a["lotSqft"] = round(a.pop("Shape.STArea()")); a["section"] = re.split(";", a["LegalDescr"])[0].strip(); a["rings"] = r["geometry"]["rings"]
    parcels[str(a["PIN"]).zfill(11)] = a
print("parcels", len(parcels), flush=True)
xs = [p[0] for a in parcels.values() for ring in a["rings"] for p in ring]; ys = [p[1] for a in parcels.values() for ring in a["rings"] for p in ring]
env = {"geometry": f"{min(xs)-.002},{min(ys)-.002},{max(xs)+.002},{max(ys)+.002}", "geometryType": "esriGeometryEnvelope", "inSR": "4326",
       "spatialRel": "esriSpatialRelIntersects", "outSR": "4326", "returnGeometry": "true", "geometryPrecision": "6"}
print("envelope", env["geometry"])
layers = {"footprints": (27, "OBJECTID,FTR_CODE"), "flood": (19, "FLD_ZONE,SFHA_TF,STATIC_BFE"), "hydro": (21, "*"), "zoning": (30, "*"), "towns": (31, "*")}
geo = {k: allrows(n, dict(env, outFields=f)) for k, (n, f) in layers.items()}
for k, v in geo.items(): print(k, len(v), flush=True)
big = [r for r in allrows(24, dict(env, outFields="PIN,OwnerName,LegalDescr,LandUseCode,Acreage,Shape.STArea()")) if (r["attributes"]["Shape.STArea()"] or 0) > 20 * 43560]
for r in big:
    n = r["attributes"]["OwnerName"] or ""
    if not re.search(r"\b(LLC|INC|CO|COMPANY|CORP|AUTH|COUNTY|CITY|HOA|POA|ASSOC|SCHOOL|PARTNERSHIP|LP|LTD)\b", n): r["attributes"]["OwnerName"] = "(person)"
geo["big"] = big
pins = sorted(parcels); streets = {}
for i in range(0, len(pins), 150):
    for f in post(22, {"where": "PIN IN (" + ",".join(pins[i:i+150]) + ")", "outFields": "PIN,STREETNAME,CITY,POSTAL_CITY", "returnGeometry": "true", "outSR": "4326"})["features"]:
        a = f["attributes"]; streets.setdefault(str(int(a["PIN"])).zfill(11), []).append({"street": (a["STREETNAME"] or "").strip(), "city": a["CITY"], "postal": a["POSTAL_CITY"], "x": f["geometry"]["x"], "y": f["geometry"]["y"]})
json.dump({"read": datetime.datetime.now(datetime.UTC).isoformat(), "source": B % 24, "parcels": parcels, "addresses": streets, "geo": geo}, open(os.path.join(RAW, "county.json"), "w"))
print("addresses", len(streets))
