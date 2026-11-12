"""Oceanfront condo listings for sale, grouped by building street address (the address on the listing, without the unit).
Source: the CRM's public map API (https://chapter3realty.com/homes/api/map), the feed under the site's homes pages.
The API returns at most 144 pins a call, so the oceanfront set is split into price slices that each hold fewer.
Kept: building street address, city, listing count, mean point. Not kept: MLS number, unit, price, photo, firm.
Run: python3 -I pull_addresses.py <this folder>. Writes raw/oceanfront-addresses.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime, collections
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
            calls.append(url); time.sleep(2.1); return j
        except Exception:
            time.sleep(20)
    raise SystemExit("API failed: " + url)
P = {"type": "condo", "has": "oceanfront_building"}
total = get(P)["total"]
pins = []
def slice_(lo, hi):
    q = dict(P, min=str(lo), max=str(hi)); j = get(q)
    if j["total"] <= 140 or hi - lo <= 1000:
        if j["total"] > len(j["pins"]): print("cut", lo, hi, j["total"], len(j["pins"]))
        pins.extend(j["pins"]); return
    mid = (lo + hi) // 2
    slice_(lo, mid); slice_(mid + 1, hi)
slice_(0, 100000); slice_(100001, 200000); slice_(200001, 400000); slice_(400001, 20000000)
seen = {}
for p in pins: seen[p["mls"]] = p
by = collections.defaultdict(list)
for p in seen.values():
    a = p["addr"].split(",")
    street = re.sub(r"\s+(unit|apt|#|ste)\b.*$", "", a[0], flags=re.I).strip().rstrip(".")
    city = a[1].strip() if len(a) > 1 else ""
    by[(street, city)].append((p["lat"], p["lng"]))
rows = sorted(({"street": s, "city": c, "listings": len(v), "lat": round(sum(x[0] for x in v)/len(v), 5), "lng": round(sum(x[1] for x in v)/len(v), 5)} for (s, c), v in by.items()), key=lambda r: -r["listings"])
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "query": BASE + urllib.parse.urlencode(P), "total": total, "pins_seen": len(seen), "buildings": rows, "calls": calls}, open(f"{out}/raw/oceanfront-addresses.json", "w"), indent=1)
print(total, len(seen), len(rows))
