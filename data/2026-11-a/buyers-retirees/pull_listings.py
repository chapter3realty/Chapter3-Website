"""Counts of homes for sale now from the CRM's public map API (aggregate counts only; no addresses or prices of single homes kept).
Houses on one level, by price band and town, and homes for sale in the four 55+ communities by MLS subdivision name.
Run: python3 -I pull_listings.py <datadir>. Writes listings-counts.json."""
import json, sys, time, subprocess, urllib.parse, datetime
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(3):
        try:
            d = json.loads(subprocess.run(["curl", "-sS", "-m", "60", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout)
            return d.get("total"), d.get("params"), d["meta"]["refreshedAt"], url
        except Exception as e: time.sleep(2); err = e
    return None, None, None, url
rows = []
def add(label, p):
    n, echo, ref, url = total(p); rows.append({"label": label, "params": p, "echo": echo, "total": n, "refreshedAt": ref, "url": url}); print(label, n, echo, flush=True)
add("all houses", {"type": "house"})
add("houses on one level", {"type": "house", "has": "one_level"})
for lo, hi in [(None, 300000), (300000, 400000), (400000, 500000), (500000, 700000), (700000, None)]:
    p = {"type": "house", "has": "one_level"}
    if lo: p["min"] = lo
    if hi: p["max"] = hi
    add(f"one level {lo}-{hi}", p)
for c in ["Myrtle Beach", "North Myrtle Beach", "Conway", "Murrells Inlet", "Little River", "Longs", "Surfside Beach"]:
    add(f"one level in {c}", {"type": "house", "has": "one_level", "city": c})
    add(f"one level in {c} under 400000", {"type": "house", "has": "one_level", "city": c, "max": 400000})
for s, c in [("Del Webb", "Myrtle Beach"), ("Del Webb", "North Myrtle Beach"), ("Myrtle Trace", None), ("Seasons at Prince Creek", None)]:
    p = {"subdivision": s, "status": "active"}
    if c: p["city"] = c
    add(f"for sale in {s} {c or ''}".strip(), p)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "rows": rows}, open(f"{D}/listings-counts.json", "w"), indent=1)
