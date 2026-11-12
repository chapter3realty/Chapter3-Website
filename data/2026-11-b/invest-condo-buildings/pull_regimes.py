"""Condo units per oceanfront building from Horry County's parcel layer, and the building's recorded sales for one year.
Units: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, every parcel whose
legal description starts with one of the building's regime names (regimes.json); a unit is a parcel with a building
value (MarketImprv > 0). Kept: regime name, units, land use codes. No PIN, owner or unit number.
Sales: Horry County deeds recorded 2025-10-01 to 2026-09-30, as kept by batch 2026-10-d
(data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json: one-parcel residential sales of $10,000 or more),
matched on the same regime names. Kept: count, median, quartiles. That file keeps only land use 1xx (residential);
a regime the county codes otherwise has units here and no sales there, and the output says so.
Run: python3 -I pull_regimes.py <this folder> <website root>. Writes regimes-out.json."""
import json, sys, time, urllib.request, urllib.parse, collections, statistics, datetime
out, site = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
R = json.load(open(f"{out}/regimes.json"))["buildings"]
deeds = json.load(open(f"{site}/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"]
res = {"read": datetime.datetime.utcnow().isoformat() + "Z", "parcels": U, "deeds": "data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (recorded 2025-10-01 to 2026-09-30)", "buildings": {}}
for slug, names in R.items():
    if not names: continue
    where = "(" + " OR ".join("LegalDescr LIKE '" + n.replace("'", "''") + ";%'" for n in names) + ")"
    feats, off = [], 0
    while True:
        q = {"where": where, "outFields": "LegalDescr,LandUseCode,MarketImprv", "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
        j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=90)); time.sleep(0.5)
        f = j.get("features", []); feats += f
        if not j.get("exceededTransferLimit") or not f: break
        off += len(f)
    by = collections.defaultdict(lambda: [0, collections.Counter()])
    for x in feats:
        a = x["attributes"]; n = a["LegalDescr"].split(";")[0].strip()
        if (a.get("MarketImprv") or 0) > 0: by[n][0] += 1
        by[n][1][(a.get("LandUseCode") or "")[:1] + "xx"] += 1
    s = [x["cons"] for x in deeds if x["group"] in names]
    units = sum(v[0] for v in by.values())
    r = {"regimes": {k: {"units": v[0], "landuse": dict(v[1])} for k, v in by.items()}, "units": units,
         "sales": len(s), "sales_median": statistics.median(s) if s else None,
         "sales_quartiles": statistics.quantiles(s, n=4) if len(s) >= 4 else None,
         "pct_units_sold": round(100 * len(s) / units, 1) if units else None,
         "residential_landuse_share": round(sum(v[1].get("1xx", 0) for v in by.values()) / max(1, sum(sum(v[1].values()) for v in by.values())), 2)}
    res["buildings"][slug] = r
    print(slug, units, len(s), r["sales_median"], r["residential_landuse_share"], {k: v[0] for k, v in by.items()}, flush=True)
json.dump(res, open(f"{out}/regimes-out.json", "w"), indent=1)
