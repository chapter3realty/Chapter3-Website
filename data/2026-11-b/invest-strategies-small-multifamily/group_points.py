"""The middle point of each named group of 2 to 4 unit parcels, for the page's map (group centers only).
Reads RAW smf-parcels.json and smf-addresses.json (outside the repo), the same grouping as analyze.py.
Writes group-points.json: name, buildings, median lat and lon rounded to 3 decimals (about 100 m). No PIN, no address.
RAW=<scratch>/smf-raw python3 -I group_points.py ."""
import json, os, re, sys, statistics, collections
D = sys.argv[1]; RAW = os.environ["RAW"]
P = json.load(open(os.path.join(RAW, "smf-parcels.json"))); A = json.load(open(os.path.join(RAW, "smf-addresses.json")))["addresses"]
pt = {}
for a in A: pt.setdefault(a["PIN"], (a["lng"], a["lat"]))
NAMES = {"CRESCENT BCH": "CRESCENT BEACH", "CHERRY GROVE BCH": "CHERRY GROVE BEACH", "CHERRY GROVE": "CHERRY GROVE BEACH", "E CHERRY GROVE BEACH": "CHERRY GROVE BEACH",
         "WINDY HILL BCH": "WINDY HILL BEACH", "OCEAN DR BCH": "OCEAN DRIVE BEACH", "OCEAN TERR": "OCEAN TERRACE", "WINDTREE EST": "WINDTREE ESTATES"}
g = collections.defaultdict(list); n = collections.Counter()
for p in P["parcels"]:
    k = re.sub(r"\s+", " ", (p["LegalDescr"] or "").split(";")[0]).strip().upper(); k = NAMES.get(k, k)
    if not k: continue
    n[k] += 1
    if p["PIN"] in pt: g[k].append(pt[p["PIN"]])
out = [{"name": k, "buildings": c, "lat": round(statistics.median(y for _, y in g[k]), 3), "lon": round(statistics.median(x for x, _ in g[k]), 3)} for k, c in n.most_common(14) if g[k]]
json.dump({"made": "group_points.py", "note": "Median address point of each named group, rounded to 3 decimals. Group centers only.", "groups": out}, open(os.path.join(D, "group-points.json"), "w"), indent=1)
print(json.dumps(out))
