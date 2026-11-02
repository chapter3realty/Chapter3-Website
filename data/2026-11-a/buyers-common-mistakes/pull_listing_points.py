"""Homes for sale now (houses and condos) from the CRM's public map API: MLS number, type, point, and whether the MLS entry
carries the "flood zone" feature. Same band-splitting method as data/2026-10-d/buyers-undisclosed-flooding/pull_listings.py
(the API returns at most 144 pins a call). Also fetches Horry County GIS layer 19 (FEMA flood zones), SFHA_TF = 'T' polygons.
Nothing here leaves PRIVATE: no addresses, prices, firms or photos are saved in the repo. analyze_flood_tag.py writes the counts.
Run: PRIVATE=<dir> python3 -I pull_listing_points.py"""
import json, os, sys, time, urllib.request, urllib.parse, datetime
P = os.environ["PRIVATE"]
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
def band(base, lo, hi, acc, warn):
    d = get(dict(base, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(base, lo, mid, acc, warn); band(base, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([base, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]: acc[p["mls"]] = {"lat": p.get("lat"), "lng": p.get("lng")}
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "sets": {}, "totals": {}, "truncated": []}
for t in ("house", "condo"):
    for tag in (None, "flood_zone"):
        base = {"type": t}
        if tag: base["has"] = tag
        acc = {}; band(base, 0, 50000000, acc, out["truncated"])
        k = t + ("|" + tag if tag else ""); out["sets"][k] = acc; out["totals"][k] = get(base)["total"]
        print(k, len(acc), out["totals"][k], flush=True)
json.dump(out, open(os.path.join(P, "listing-points.json"), "w"))
f = os.path.join(P, "flood-sfha.json")
if not os.path.exists(f):
    Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query"
    def q(params):
        data = urllib.parse.urlencode(dict(params, f="json")).encode()
        for i in range(5):
            try:
                d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
                if "error" in d: raise Exception(d["error"])
                return d
            except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
        raise SystemExit("failed")
    ids = q({"where": "SFHA_TF='T'", "returnIdsOnly": "true"})["objectIds"]
    feats = []
    for i in range(0, len(ids), 50):
        feats += q({"objectIds": ",".join(map(str, ids[i:i + 50])), "outFields": "FLD_ZONE,SFHA_TF", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
        print("flood", i, len(feats), flush=True)
    json.dump(feats, open(f, "w"))
