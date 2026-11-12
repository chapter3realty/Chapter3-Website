"""Which MLS subdivision words pick out each building. For each word, condos for sale whose subdivision matches it,
with the building street addresses those listings carry (to check the word hits one building and not its neighbors).
Source: https://chapter3realty.com/homes/api/map?type=condo&subdivision=<words>. Kept: street address counts only.
Run: python3 -I probe_subdivisions.py <this folder> <word> [<word> ...]. Merges into raw/subdivision-probe.json."""
import json, sys, time, re, os, urllib.request, urllib.parse, datetime, collections
out = sys.argv[1]; words = sys.argv[2:]
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
fn = f"{out}/raw/subdivision-probe.json"
res = json.load(open(fn)) if os.path.exists(fn) else {}
for w in words:
    url = BASE + urllib.parse.urlencode({"type": "condo", "subdivision": w})
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); time.sleep(2.1)
    c = collections.Counter()
    for p in j["pins"]:
        a = p["addr"].split(",")
        st = re.sub(r"\.", "", a[0]).strip(); st = re.sub(r"\bSouth\b", "S", st); st = re.sub(r"\bNorth\b", "N", st)
        c[st + " | " + (a[1].strip() if len(a) > 1 else "")] += 1
    res[w] = {"url": url, "read": datetime.datetime.utcnow().isoformat() + "Z", "total": j["total"], "pins": len(j["pins"]), "streets": c.most_common()}
    print(w, j["total"], c.most_common(6), flush=True)
json.dump(res, open(fn, "w"), indent=1)
