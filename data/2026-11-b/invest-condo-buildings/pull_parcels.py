"""Condo units at each oceanfront building, from Horry County's parcel layer (public GIS).
Source: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query
For each building point (raw/building-points.json: the mean point of its listings for sale), every parcel inside a
box of +/- 90 m is read (LegalDescr, LandUseCode, MarketImprv only), and grouped by the regime name (the legal
description before the first ';'). Kept: regime name, units (parcels with a building value), land use codes.
No PIN, owner or unit number is kept. Run: python3 -I pull_parcels.py <this folder>. Writes raw/parcels-by-building.json."""
import json, sys, time, urllib.request, urllib.parse, collections, datetime, math
out = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
pts = json.load(open(f"{out}/raw/building-points.json"))
res = {"read": datetime.datetime.utcnow().isoformat() + "Z", "source": U, "box_m": 90, "buildings": {}}
for slug, (lat, lng) in pts.items():
    dy = 90 / 111000; dx = 90 / (111000 * math.cos(math.radians(lat)))
    feats = []; off = 0
    while True:
        q = {"geometry": f"{lng-dx},{lat-dy},{lng+dx},{lat+dy}", "geometryType": "esriGeometryEnvelope", "inSR": 4326,
             "spatialRel": "esriSpatialRelIntersects", "outFields": "LegalDescr,LandUseCode,MarketImprv", "returnGeometry": "false",
             "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
        j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=90)); time.sleep(0.5)
        f = j.get("features", []); feats += f
        if not j.get("exceededTransferLimit") or not f: break
        off += len(f)
    g = collections.defaultdict(lambda: {"units": 0, "parcels": 0, "landuse": collections.Counter()})
    for x in feats:
        a = x["attributes"]; name = (a.get("LegalDescr") or "").split(";")[0].strip()
        r = g[name]; r["parcels"] += 1
        if (a.get("MarketImprv") or 0) > 0: r["units"] += 1
        r["landuse"][a.get("LandUseCode") or ""] += 1
    rows = sorted(({"regime": k, "units": v["units"], "parcels": v["parcels"], "landuse": dict(v["landuse"].most_common(4))} for k, v in g.items()), key=lambda r: -r["parcels"])
    res["buildings"][slug] = {"point": [lat, lng], "regimes": rows}
    print(slug, [(r["regime"], r["units"]) for r in rows[:5]], flush=True)
json.dump(res, open(f"{out}/raw/parcels-by-building.json", "w"), indent=1)
