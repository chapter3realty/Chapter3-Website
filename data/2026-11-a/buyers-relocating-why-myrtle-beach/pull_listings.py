"""Counts of homes for sale now from the CRM's public map API (aggregate totals only; no address or price of any single home is kept).
Houses, and all homes (any type), at or under a list of price lines: every $50,000 from $200,000 to $900,000 and each origin county's
typical value (zhvi-origins.json). The feed is the Coastal Carolinas MLS area (Horry, Georgetown and the NC border towns).
Run: python3 -I pull_listings.py <this dir>. Writes listings-counts.json."""
import json, sys, time, subprocess, urllib.parse, datetime
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(3):
        try:
            d = json.loads(subprocess.run(["curl", "-sS", "-m", "60", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout)
            return d.get("total"), d.get("params"), d["meta"]["refreshedAt"], url
        except Exception: time.sleep(2)
    return None, None, None, url
rows = []
def add(label, p):
    n, echo, ref, url = total(p); rows.append({"label": label, "params": p, "echo": echo, "total": n, "refreshedAt": ref, "url": url}); print(label, n, echo, flush=True)
add("all homes for sale", {})
add("all houses for sale", {"type": "house"})
z = json.load(open(f"{D}/zhvi-origins.json"))
lines = sorted(set(list(range(200000, 900001, 50000)) + [round(c["zhvi"], -3) for c in z["counties"] if c.get("zhvi")]))
for m in lines:
    add(f"houses at or under {m}", {"type": "house", "max": m})
    add(f"all homes at or under {m}", {"max": m})
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "rows": rows}, open(f"{D}/listings-counts.json", "w"), indent=1)
