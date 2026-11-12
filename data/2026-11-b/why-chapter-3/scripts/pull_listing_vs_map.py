#!/usr/bin/env python3
"""/why-chapter-3/: does a listing's own flood field match FEMA's map?  Aggregates only.
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
def pull(extra):
    res, totals, warn = {}, {}, []
    def band(t, lo, hi):
        d = get(dict(extra, type=t, min=lo, max=hi))
        if d["total"] > len(d["pins"]) and hi - lo > 500:
            mid = (lo + hi) // 2; band(t, lo, mid); band(t, mid + 1, hi); return
        if d["total"] > len(d["pins"]): warn.append([t, lo, hi, d["total"], len(d["pins"])])
        for p in d["pins"]: res[p["mls"]] = {"type": t, "lat": p.get("lat"), "lng": p.get("lng")}
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
        feats += q(PA % 19, {"objectIds": ",".join(map(str, ids[i:i+50])), "outFields": "FLD_ZONE,SFHA_TF", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
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
sfha = unary_union([esri(f) for f in cache("flood-sfha.json", sfha_feats)])
shapely.prepare(county); shapely.prepare(sfha)
# Edge test: the same count with FEMA's zone shrunk by about 30 m (0.0003 degrees), so pins on a zone's edge drop out.
core = sfha.buffer(-0.0003); shapely.prepare(core)
H = [(m, h) for m, h in allh.items() if h["lat"] and h["lng"]]
import numpy as np
x = np.array([h["lng"] for _, h in H]); y = np.array([h["lat"] for _, h in H])
inc = shapely.contains_xy(county, x, y); ins = shapely.contains_xy(sfha, x, y); inco = shapely.contains_xy(core, x, y)
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
json.dump({"pulled": pulled, "source_listings": "Chapter3 map API (CCMLS active listings through the CRM), https://chapter3realty.com/homes/api/map",
  "source_map": "Horry County GIS parcelapp MapServer layer 19 (FEMA flood zones, SFHA_TF='T'), layer 33 (county outline)",
  "listing_field": "has=flood_zone: the listing marks the home as in a flood zone",
  "api_totals_all": tot_all, "api_totals_flagged": tot_flag, "pins_all": len(allh), "pins_flagged": len(flag),
  "pins_with_point": len(H), "truncated": w1 + w2, "horry": dict(c), "horry_by_type": {k: dict(v) for k, v in by.items()},
  "core": "core = inside FEMA's high-risk zone shrunk by about 30 m, so a pin on a zone edge is not counted",
  "limits": "Points are the listing's map pin. A pin on the edge of a zone can fall on either side. FEMA's zone is the county's copy of the effective map (12/16/2021). Georgetown County homes are left out (no map loaded)."},
  open(os.path.join(out, "listing-vs-map.json"), "w"), indent=1)
print(json.dumps(dict(c)), {k: dict(v) for k, v in by.items()})
