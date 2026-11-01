"""Fetch the Horry County GIS records this page needs, for every home sale in the sibling deed pull.
Inputs: <web>/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (13,194 home sales, Oct 2025-Sep 2026).
Writes into RAW (default <datadir>/raw):
  parcels-values.json  layer 24 value fields per PIN (no owner fields)
  addresses.json       layer 22 street, unit, building, subdivision per PIN (kept out of the repo: addresses)
  flood-sfha.json      layer 19 polygons in the FEMA high-risk zone (SFHA_TF = 'T'), WGS84
  ocean.json           Census TIGERweb Hydro layer 1, polygons named Atlantic Ocean, WGS84
  cap-stats.json       county-wide statistics: residential parcels with a building, by assessment ratio, taxable below market
Usage: RAW=<scratch> python3 -I fetch_county.py <datadir> <sales.json>"""
import sys, json, os, time, urllib.request, urllib.parse
D, SALES = sys.argv[1], sys.argv[2]
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(layer, params):
    params = dict(params, f="json"); data = urllib.parse.urlencode(params).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", layer, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
pins = sorted({x["pin"] for x in json.load(open(SALES))["sales"]})
print(len(pins), "pins")
for layer, fields, name in [(24, "PIN,LandUseCode,Acreage,AssessedProp,MarketLand,MarketImprv,MarketProp,TaxableProp,MarketArea,MarketSubArea,TaxDistrict,SaleDate", "parcels-values"),
                            (22, "PIN,StreetNum,STREETNAME,UNIT,BUILDING,SUBDIVISION,POSTAL_CITY,ZIPCODE", "addresses")]:
    f = os.path.join(RAW, name + ".json")
    if os.path.exists(f): continue
    feats = []
    for i in range(0, len(pins), 200):
        feats += [x["attributes"] for x in q(layer, {"where": "PIN IN (" + ",".join(pins[i:i + 200]) + ")", "outFields": fields, "returnGeometry": "false"})["features"]]
        print(name, i, len(feats), flush=True)
    json.dump(feats, open(f, "w"))
f = os.path.join(RAW, "flood-sfha.json")
if not os.path.exists(f):
    ids = q(19, {"where": "SFHA_TF='T'", "returnIdsOnly": "true"})["objectIds"]
    feats = []
    for i in range(0, len(ids), 50):
        d = q(19, {"objectIds": ",".join(map(str, ids[i:i + 50])), "outFields": "FLD_ZONE,SFHA_TF,STATIC_BFE", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})
        feats += d["features"]; print("flood", i, len(feats), flush=True)
    json.dump(feats, open(f, "w"))
f = os.path.join(RAW, "ocean.json")
if not os.path.exists(f):
    # The county's Ocean layer is annotation only; use the Census TIGERweb areal hydrography polygons named Atlantic Ocean.
    u = ("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Hydro/MapServer/1/query?where=NAME%3D%27Atlantic+Ocean%27"
         "&geometry=-79.25,33.40,-78.50,33.90&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
         "&outFields=NAME,MTFCC&returnGeometry=true&outSR=4326&maxAllowableOffset=0.00002&f=json")
    open(f, "wb").write(urllib.request.urlopen(u, timeout=300).read())
f = os.path.join(RAW, "cap-stats.json")
if not os.path.exists(f):
    base = "LandUseCode LIKE '1%' AND MarketImprv > 0"
    st = [{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"},
          {"statisticType": "sum", "onStatisticField": "MarketProp", "outStatisticFieldName": "market"},
          {"statisticType": "sum", "onStatisticField": "TaxableProp", "outStatisticFieldName": "taxable"},
          {"statisticType": "sum", "onStatisticField": "AssessedProp", "outStatisticFieldName": "assessed"}]
    out = {}
    for k, w in [("all", base), ("taxable_below_market", base + " AND TaxableProp < MarketProp"),
                 ("legal_res_4pct", base + " AND AssessedProp > 0 AND AssessedProp < 0.05 * TaxableProp"),
                 ("legal_res_4pct_below", base + " AND AssessedProp > 0 AND AssessedProp < 0.05 * TaxableProp AND TaxableProp < MarketProp"),
                 ("other_6pct", base + " AND AssessedProp >= 0.05 * TaxableProp"),
                 ("other_6pct_below", base + " AND AssessedProp >= 0.05 * TaxableProp AND TaxableProp < MarketProp")]:
        d = q(24, {"where": w, "outStatistics": json.dumps(st), "returnGeometry": "false"})
        out[k] = {"where": w, **d["features"][0]["attributes"]}; print(k, out[k], flush=True)
    json.dump(out, open(f, "w"), indent=1)
