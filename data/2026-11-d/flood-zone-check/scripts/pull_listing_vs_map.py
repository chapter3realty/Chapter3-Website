#!/usr/bin/env python3
"""/buyers/flood-zone-check/ (copied from data/2026-11-b/why-chapter-3/scripts, 2026-11-13; adds price bands, towns and FEMA zone letters).
Does our home search's flood-zone filter find the homes FEMA's map puts in the high-risk zone?  Aggregates only.
1. Active for-sale homes from the Chapter3 map API (CCMLS feed via the CRM), split into price bands until each call
   returns every pin (at most 144 a call). Keeps MLS number (only to drop duplicates and to join the flag), type, lat, lng.
2. The same search with has=flood_zone: the homes whose listing marks a flood zone.
3. Horry County GIS parcelapp layer 19 (FEMA flood zones), SFHA_TF='T' (FEMA high-risk zone), and layer 33 (county outline).
4. Counts, for homes inside Horry County: in FEMA's high-risk zone, and how many of those the listing marks.
Run: RAW=<scratch dir> python3 -I pull_listing_vs_map.py <outdir>.  Writes <outdir>/listing-vs-map.json.
No address, MLS number, firm, price or photo is written to the output."""
import json, sys, os, time, urllib.request, urllib.parse, datetime, collections
import shapely
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union
out = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(out, "raw-big")); os.makedirs(RAW, exist_ok=True)
API = "https://chapter3realty.com/homes/api/map?"
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
TYPES = ["house", "townhouse", "condo", "manufactured"]
def get(p):
    url = API + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
def price(s):
    try: return int(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def town(a):
    parts = [x.strip() for x in str(a or "").split(",")]
    return parts[-3] if len(parts) >= 3 else None
def pull(extra):
    res, totals, warn = {}, {}, []
    def band(t, lo, hi):
        d = get(dict(extra, type=t, min=lo, max=hi))
        if d["total"] > len(d["pins"]) and hi - lo > 500:
            mid = (lo + hi) // 2; band(t, lo, mid); band(t, mid + 1, hi); return
        if d["total"] > len(d["pins"]): warn.append([t, lo, hi, d["total"], len(d["pins"])])
        for p in d["pins"]: res[p["mls"]] = {"type": t, "lat": p.get("lat"), "lng": p.get("lng"), "price": price(p.get("price")), "town": town(p.get("addr"))}
    for t in TYPES:
        band(t, 0, 50000000); totals[t] = get(dict(extra, type=t))["total"]
    return res, totals, warn
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
def cache(name, fn):
    p = os.path.join(RAW, name)
    if not os.path.exists(p): json.dump(fn(), open(p, "w"))
    return json.load(open(p))
def sfha_feats():
    ids = q(PA % 19, {"where": "SFHA_TF='T'", "returnIdsOnly": "true"})["objectIds"]; feats = []
    for i in range(0, len(ids), 50):
        feats += q(PA % 19, {"objectIds": ",".join(map(str, ids[i:i+50])), "outFields": "FLD_ZONE,SFHA_TF,STATIC_BFE", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
        print("sfha", i, len(feats), flush=True)
    return feats
def esri(f):
    rings = f["geometry"]["rings"]; polys = []
    for r in rings:
        p = Polygon(r)
        if not p.is_valid: p = p.buffer(0)
        polys.append(p)
    # ESRI rings: outer rings clockwise, holes counter-clockwise; build by symmetric difference so holes cut out
    g = polys[0]
    for p in polys[1:]: g = g.symmetric_difference(p)
    return g
def cache_listings(name, extra):
    p = os.path.join(RAW, name)  # kept outside the repo: MLS numbers and points only
    if not os.path.exists(p): json.dump(pull(extra), open(p, "w"))
    a, b, c = json.load(open(p)); print(name, len(a), b, c, flush=True); return a, b, c
pulled = datetime.datetime.now(datetime.timezone.utc).isoformat()
allh, tot_all, w1 = cache_listings("listings-all.json", {})
flag, tot_flag, w2 = cache_listings("listings-flagged.json", {"has": "flood_zone"})
county = esri(cache("county.json", lambda: q(PA % 33, {"where": "1=1", "returnGeometry": "true", "outSR": "4326"})["features"])[0])
FE = cache("flood-sfha.json", sfha_feats)
sfha = unary_union([esri(f) for f in FE])
zones = {}
for f in FE: zones.setdefault(f["attributes"].get("FLD_ZONE"), []).append(esri(f))
zones = {k: unary_union(v) for k, v in zones.items()}
for g in zones.values(): shapely.prepare(g)
shapely.prepare(county); shapely.prepare(sfha)
# Edge test: the same count with FEMA's zone shrunk by about 30 m (0.0003 degrees), so pins on a zone's edge drop out.
core = sfha.buffer(-0.0003); shapely.prepare(core)
H = [(m, h) for m, h in allh.items() if h["lat"] and h["lng"]]
import numpy as np
x = np.array([h["lng"] for _, h in H]); y = np.array([h["lat"] for _, h in H])
inc = shapely.contains_xy(county, x, y); ins = shapely.contains_xy(sfha, x, y); inco = shapely.contains_xy(core, x, y)
inz = {k: shapely.contains_xy(g, x, y) for k, g in zones.items()}
BANDS = [(0, 199999, "under $200,000"), (200000, 299999, "$200,000 to $299,999"), (300000, 399999, "$300,000 to $399,999"),
         (400000, 599999, "$400,000 to $599,999"), (600000, 999999, "$600,000 to $999,999"), (1000000, 10**10, "$1 million and up")]
def band_of(v):
    if v is None: return "no price"
    for lo, hi, n in BANDS:
        if lo <= v <= hi: return n
bb = collections.defaultdict(collections.Counter); tw = collections.defaultdict(collections.Counter); zz = collections.defaultdict(collections.Counter)
tt = collections.defaultdict(collections.Counter)
c = collections.Counter()
by = collections.defaultdict(collections.Counter)
for i, (m, h) in enumerate(H):
    if not inc[i]: continue
    f = m in flag; t = h["type"]
    c["horry"] += 1; by[t]["horry"] += 1
    if ins[i]: c["sfha"] += 1; by[t]["sfha"] += 1
    if ins[i] and f: c["sfha_flagged"] += 1; by[t]["sfha_flagged"] += 1
    if ins[i] and not f: c["sfha_not_flagged"] += 1; by[t]["sfha_not_flagged"] += 1
    if f: c["flagged"] += 1; by[t]["flagged"] += 1
    if inco[i]: c["core"] += 1; by[t]["core"] += 1
    if inco[i] and not f: c["core_not_flagged"] += 1; by[t]["core_not_flagged"] += 1
    if f and not ins[i]: c["flagged_not_sfha"] += 1; by[t]["flagged_not_sfha"] += 1
    b = band_of(h.get("price")); tn = (h.get("town") or "unknown").title()
    bb[b]["horry"] += 1; tw[tn]["horry"] += 1
    if ins[i]:
        bb[b]["sfha"] += 1; tw[tn]["sfha"] += 1
        if f: bb[b]["sfha_flagged"] += 1; tw[tn]["sfha_flagged"] += 1
        zl = [k for k in inz if inz[k][i]]
        for k in zl: zz[k]["sfha"] += 1; zz[k]["sfha_flagged"] += 1 if f else 0
        tt[t + "|" + b]["sfha"] += 1
        if f: tt[t + "|" + b]["sfha_flagged"] += 1
json.dump({"pulled": pulled, "source_listings": "Chapter3 map API (CCMLS active listings through the CRM), https://chapter3realty.com/homes/api/map",
  "source_map": "Horry County GIS parcelapp MapServer layer 19 (FEMA flood zones, SFHA_TF='T'), layer 33 (county outline)",
  "listing_field": "has=flood_zone: the Flood zone feature in our home search (idx-lib/features.js, Utilities group); the CRM builds its feature keys from each home's MLS fields, its description and its photos (idx-lib/map.js line 401)",
  "api_totals_all": tot_all, "api_totals_flagged": tot_flag, "pins_all": len(allh), "pins_flagged": len(flag),
  "pins_with_point": len(H), "truncated": w1 + w2, "horry": dict(c), "horry_by_type": {k: dict(v) for k, v in by.items()},
  "price_bands": {n: dict(bb[n]) for _, _, n in BANDS + [(0, 0, "no price")] if n in bb},
  "towns_by_postal_city": {k: dict(v) for k, v in sorted(tw.items(), key=lambda kv: -kv[1]["sfha"])},
  "fema_zone_letter": {k: dict(v) for k, v in zz.items()},
  "type_by_band": {k: dict(v) for k, v in sorted(tt.items())},
  "sfha_polygons": len(FE),
  "core": "core = inside FEMA's high-risk zone shrunk by about 30 m, so a pin on a zone edge is not counted",
  "towns_note": "Town is the postal city in the listing address, not city limits.",
  "limits": "Points are the listing's map pin. A pin on the edge of a zone can fall on either side. FEMA's zone is the county's copy of the effective map (12/16/2021). Georgetown County homes are left out (no map loaded)."},
  open(os.path.join(out, "listing-vs-map.json"), "w"), indent=1)
print(json.dumps(dict(c)), {k: dict(v) for k, v in by.items()})
