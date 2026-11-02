"""Horry County parcels (GIS layer 24) for the four 55+ communities the site has guides for, plus the county as a whole.
For each home parcel (LandUseCode 1xx, building value > 0) keeps only: PIN, LandUseCode, assessed/taxable/market value,
SaleDate, TaxDistrict and the owner's mailing STATE. No owner names or street addresses are kept.
Assessment class: AssessedProp / TaxableProp, about 0.04 = legal residence (4%), about 0.06 = everything else (6%).
Parcel sets are the same legal-description rules the 2026-10-a ledgers used for each community.
Run: python3 -I pull_parcels.py <datadir>. Writes raw/parcels-55plus.json and raw/county-class-stats.json."""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]; RAW = os.path.join(D, "raw"); os.makedirs(RAW, exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def q(params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
GD_TRACTS = ["MARINA TRACT PH 1A-1", "MARINA TRACT P1-B", "MARINA TRACT P-2", "PARCEL P-3", "MARINA TRACT P-4", "PARCEL P-5", "PARCEL -5", "PARCEL P -5",
             "PARCEL P-6", "PARCEL P-7", "PH 8 MARINA TRACT", "PH P8 MARINA TRACT", "MARINA TRACT PH P9-A", "MARINA TRACT PH P9-B", "PARCEL C-1", "PARCEL C-2",
             "VILLAS @ HEEL TR PH 1A", "VILLAS @ HEEL TR PH 1B", "VILLA AT HEEL TRACT PH 2A", "VILLAS @ HEEL TRACT PH 2B"]
SETS = {
  "Del Webb at Grande Dunes": {"where": "(" + " OR ".join("LegalDescr LIKE '%s%%'" % t for t in GD_TRACTS) + ") OR PIN IN (42102010093,42102010094,42102010095,42102010096,42102040074)",
                               "geometry": "-78.86,33.735,-78.82,33.765", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"},
  "Del Webb North Myrtle Beach": {"where": "LegalDescr LIKE 'CHESTNUT GREENS%'"},
  "Myrtle Trace": {"where": "UPPER(LegalDescr) LIKE '%MYRTLE TRACE%' AND UPPER(LegalDescr) NOT LIKE '%SOUTH%' AND UPPER(LegalDescr) NOT LIKE '%GRAND%'"},
  "Seasons at Prince Creek West": {"where": "LegalDescr LIKE '%SEASON%PRINCE%'"},
}
F = "PIN,LandUseCode,AssessedProp,TaxableProp,MarketProp,MarketImprv,SaleDate,TaxDistrict,OwnerState"
out = {}
for name, p in SETS.items():
    params = dict(p, outFields=F, returnGeometry="false", resultRecordCount=2000)
    rows = [f["attributes"] for f in q(params)["features"]]
    out[name] = rows; print(name, len(rows), flush=True)
json.dump({"source": Q, "fields": F, "pulled": time.strftime("%Y-%m-%d"), "sets": {k: v["where"] for k, v in SETS.items()}, "parcels": out},
          open(os.path.join(RAW, "parcels-55plus.json"), "w"))
# County-wide: home parcels with a building, by assessment class, from server-side statistics (no rows downloaded)
ST = json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}])
base = "LandUseCode LIKE '1%' AND MarketImprv > 0 AND TaxableProp > 0"
cls = {"4%": "AssessedProp < TaxableProp * 0.05", "6%": "AssessedProp >= TaxableProp * 0.05"}
stats = []
for since, w in [("all", "1=1"), ("owned before 2026", "SaleDate < DATE '2026-01-01'")]:
    for c, cw in cls.items():
        for lu, luw in [("all homes", "1=1"), ("101 house", "LandUseCode = '101'")]:
            d = q({"where": " AND ".join([base, w, cw, luw]), "outStatistics": ST, "returnGeometry": "false"})
            stats.append({"set": since, "class": c, "landuse": lu, "n": d["features"][0]["attributes"]["n"]}); print(stats[-1], flush=True)
json.dump({"source": Q, "base": base, "classes": cls, "pulled": time.strftime("%Y-%m-%d"), "stats": stats}, open(os.path.join(RAW, "county-class-stats.json"), "w"), indent=1)
