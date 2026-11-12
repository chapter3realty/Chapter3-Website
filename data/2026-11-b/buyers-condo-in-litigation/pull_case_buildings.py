"""Units and recent sales at the condo regimes named in public court records (Horry County parcel layer, public GIS).
Source: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query
Reads only LegalDescr, LandUseCode, MarketImprv and SaleDate (the parcel's last recorded sale). No PIN, owner, unit number
or value is kept. A unit = a parcel with a building value whose legal description is not a garage or storage unit.
Run: python3 -I pull_case_buildings.py <this folder>. Writes case-buildings.json."""
import json, sys, time, urllib.request, urllib.parse, collections, datetime
out = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
# Regime-name patterns, chosen from a LIKE '%name%' scan of the layer (README): Riverwalk II and the Riverwalk townhomes
# are other regimes and are left out; Wedgewood is the North Myrtle Beach regime (the only one on the layer).
CASES = {"Riverwalk at Arrowhead Country Club": "(LegalDescr LIKE 'RIVERWALK AT ARROWHEAD%' OR LegalDescr LIKE 'RIVERWALK @ ARROWHEAD%')",
         "Magnolia North": "LegalDescr LIKE 'MAGNOLIA NORTH%'",
         "Wedgewood (name match only, see README)": "LegalDescr LIKE 'WEDGEWOOD%'",
         "Renaissance Tower": "(LegalDescr LIKE 'THE RENAISSANCE%' OR LegalDescr LIKE 'RENAISSANCE TOWER%')"}
now = datetime.datetime.now(datetime.timezone.utc)
res = {"read": now.isoformat(), "source": U, "buildings": {}}
for label, pat in CASES.items():
    feats, off = [], 0
    while True:
        q = {"where": pat, "outFields": "LegalDescr,LandUseCode,MarketImprv,SaleDate",
             "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 1000, "f": "json"}
        j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=90)); time.sleep(0.5)
        f = j.get("features", []); feats += f
        if not j.get("exceededTransferLimit") or not f: break
        off += len(f)
    regimes = collections.Counter(); units = 0; sold12 = 0; years = collections.Counter(); landuse = collections.Counter()
    for x in feats:
        a = x["attributes"]; ld = (a.get("LegalDescr") or "").upper()
        regimes[ld.split(";")[0].strip()] += 1
        if (a.get("MarketImprv") or 0) <= 0 or "GARAGE" in ld or "STORAGE" in ld: continue
        units += 1; landuse[a.get("LandUseCode") or ""] += 1
        sd = a.get("SaleDate")
        if sd:
            d = datetime.datetime.fromtimestamp(sd / 1000, datetime.timezone.utc)
            years[d.year] += 1
            if (now - d).days <= 365: sold12 += 1
    res["buildings"][label] = {"where": pat, "parcels": len(feats), "units": units, "last_sale_within_365_days": sold12,
                               "last_sale_year_counts": dict(sorted(years.items())), "regime_names": dict(regimes.most_common()),
                               "landuse": dict(landuse.most_common(5))}
    print(label, len(feats), units, sold12, flush=True)
json.dump(res, open(f"{out}/case-buildings.json", "w"), indent=1)
