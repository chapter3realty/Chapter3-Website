"""Grande Dunes (Myrtle Beach): every parcel in Horry County's public GIS Parcels layer 24 whose legal description names GRANDE DUNES
(https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24), attributes and outline (WGS84), plus the county Municipalities
layer 31 and FEMA's National Flood Hazard Layer (layer 28) for the same envelope. Owner names are not requested. Saved to RAW (scratch).
Run: RAW=<scratch dir> python3 -I pull_county.py"""
import json, os, urllib.request, urllib.parse, time, sys
RAW = os.environ["RAW"]
def post(url, p):
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode(dict(p, f="json")).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("fail")
H = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
out = []; off = 0
while True:
    d = post(H + "24/query", {"where": "UPPER(LegalDescr) LIKE '%GRANDE DUNES%'", "outFields": "PIN,LegalDescr,LandUseCode,Acreage,OwnerState,TaxDistrict,MarketProp,TaxableProp,AssessedProp,MarketLand,MarketImprv", "returnGeometry": "true", "outSR": "4326", "resultOffset": off, "resultRecordCount": 500})
    out += d["features"]; off += 500
    if not d.get("exceededTransferLimit"): break
json.dump(out, open(os.path.join(RAW, "gd-parcels.json"), "w"))
xs = [p[0] for f in out for r in f["geometry"]["rings"] for p in r]; ys = [p[1] for f in out for r in f["geometry"]["rings"] for p in r]
env = f"{min(xs)-.002},{min(ys)-.002},{max(xs)+.002},{max(ys)+.002}"
q = {"geometry": env, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "returnGeometry": "true", "outSR": "4326"}
mun = post(H + "31/query", dict(q, outFields="NAME"))
fema = post("https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query", dict(q, outFields="FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE"))
json.dump({"envelope": env, "municipalities": mun["features"], "fema": fema["features"]}, open(os.path.join(RAW, "gd-geo.json"), "w"))
print(len(out), len(mun["features"]), len(fema["features"]))
