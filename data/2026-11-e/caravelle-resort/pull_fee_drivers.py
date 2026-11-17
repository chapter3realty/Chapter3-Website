"""What moves the Caravelle fee, if not size? For each $25 step of hoaMax (575..950), the count of Caravelle listings (subdivision "Caravelle",
6900/7000 N Ocean Blvd) with the fee at or under it: all, oceanfront unit, high floor unit, lazy-river-building flag, in a rental program.
Counts only. Run: python3 -I pull_fee_drivers.py <dir>. Writes fee-drivers.json."""
import json, sys, time, urllib.request, urllib.parse
D = sys.argv[1]; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}; calls = []
def n(p):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(p)
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url); time.sleep(2.1); return j["total"]
out = {}
for name, extra in (("all", {}), ("oceanfront_unit", {"has": "oceanfront_unit"}), ("high_floor_unit", {"has": "high_floor_unit"}), ("low_floor_unit", {"has": "low_floor_unit"}), ("tower", {"subdivision": "Caravelle Tower"})):
    out[name] = {}
    for t in range(575, 976, 25):
        p = {"type": "condo", "subdivision": "Caravelle", "hoaMax": t}; p.update(extra)
        out[name][t] = n(p)
    out[name]["total"] = n(dict({"type": "condo", "subdivision": "Caravelle"}, **extra))
out["calls"] = calls
json.dump(out, open(D + "/fee-drivers.json", "w"), indent=1); print("done")
