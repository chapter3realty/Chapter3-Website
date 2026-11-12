"""Fix round 1 (VERIFIED-BY-FIXER): drive minutes from houses in the inland parts to Ocean Boulevard, the road along the beach.
For each of Little River Neck, west of US 17 and across the waterway: 60 houses drawn at random (seed 2026) from the county parcel points
(house land-use codes 100, 101, 102, 110, 126; part from areas.py's run). Destinations: county address points on N or S Ocean Blvd inside the
city, thinned to one every ~400 m. OSRM public table service (free flow). Reported: median and quartiles of each house's nearest destination.
No PIN or point is written out. Run: python3 -I drives_beach.py <raw dir> <areas json> <out json>"""
import json, sys, random, statistics, urllib.request, time, math
RAW, AREAS, OUT = sys.argv[1:4]
P = json.load(open(RAW + "/parcels.json")); A = json.load(open(AREAS)); AD = json.load(open(RAW + "/addr.json"))
HOUSE = {"100", "101", "102", "110", "126"}
pts = {}
for p in P:
    k = A.get(str(int(p["PIN"])))
    if k in ("neck", "west17", "across") and str(p["LandUseCode"]) in HOUSE and (p.get("MarketImprv") or 0) > 0 and p.get("c"):
        pts.setdefault(k, []).append((p["c"]["x"], p["c"]["y"]))
ob = sorted({(round(a["x"], 5), round(a["y"], 5)) for a in AD if a.get("STREETNAME") and "OCEAN BLVD" in a["STREETNAME"] and a.get("POSTAL_CITY") == "North Myrtle Beach"})
dest = []
for x, y in sorted(ob, key=lambda q: q[0]):
    if all(math.hypot((x - u) * 92.6, (y - v) * 111.0) > 0.4 for u, v in dest): dest.append((x, y))
print("ocean blvd points", len(ob), "thinned", len(dest))
random.seed(2026); out = {"method": __doc__, "pulled": time.strftime("%Y-%m-%d"), "destinations": len(dest), "areas": {}}
for k in ("neck", "west17", "across"):
    s = random.sample(pts[k], 60); best = []
    for i in range(0, 60, 30):
        src = s[i:i + 30]; co = ";".join("%f,%f" % c for c in src + dest)
        u = "https://router.project-osrm.org/table/v1/driving/%s?sources=%s&destinations=%s" % (co, ";".join(map(str, range(len(src)))), ";".join(map(str, range(len(src), len(src) + len(dest)))))
        for t in range(6):
            try: r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=90).read()); break
            except Exception as e: print("retry", e); time.sleep(5 + 5 * t)
        best += [min(v for v in row if v is not None) / 60 for row in r["durations"]]
        time.sleep(1)
    q = statistics.quantiles(best, n=4)
    out["areas"][k] = {"houses_in_part": len(pts[k]), "n": len(best), "median": round(statistics.median(best), 1), "p25": round(q[0], 1), "p75": round(q[2], 1)}
    print(k, out["areas"][k])
json.dump(out, open(OUT, "w"), indent=1)
