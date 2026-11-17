"""Surfmaster extras: (1) the common-area parcels' drawn area in acres (to check the Acreage field), (2) both buildings' deed sales combined.
Run: python3 -I pull_extra.py . ../../.. . Writes extra.json."""
import json, sys, re, urllib.request, urllib.parse, statistics as st
from math import cos, radians
from shapely.geometry import Polygon
from shapely.ops import unary_union
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
out = {}
pins = set()
for n, w in {"I": "LegalDescr LIKE 'SURFMASTER; %'", "II": "LegalDescr LIKE 'SURFMASTER PH II; %'"}.items():
    j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode({"where": w, "outFields": "PIN,MarketImprv,Acreage", "returnGeometry": "true", "outSR": 4326, "f": "json", "resultRecordCount": 2000})))
    ps = []
    for f in j["features"]:
        if (f["attributes"].get("MarketImprv") or 0) > 0: pins.add(str(f["attributes"]["PIN"])); continue
        for r in f["geometry"]["rings"]:
            ps.append(Polygon([((x + 78.987) * 111320 * cos(radians(33.589)), (y - 33.589) * 110574) for x, y in r]).buffer(0))
    a = unary_union(ps).area / 4046.856
    out[n] = {"drawn_acres": round(a, 2)}
d1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if str(s["pin"]) in pins]
c = [s["cons"] for s in d1]
q = st.quantiles(c, n=4)
out["combined_sales_2025-10-01_to_2026-09-30"] = {"n": len(c), "median": st.median(c), "p25": q[0], "p75": q[2], "min": min(c), "max": max(c), "under_400k": sum(1 for x in c if x < 400000), "over_500k": sum(1 for x in c if x > 500000)}
json.dump(out, open(D + "/extra.json", "w"), indent=1); print(json.dumps(out, indent=1))
