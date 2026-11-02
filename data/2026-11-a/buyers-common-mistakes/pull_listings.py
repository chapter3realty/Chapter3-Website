"""Homes for sale now, counted in aggregate from the Chapter3 CRM's public map API (no addresses, prices of single homes or photos kept).
Houses on septic, public sewer and well water by town; houses and condos tagged in a flood zone; condos whose MLS entry allows short-term rentals.
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
        except Exception: time.sleep(2)
    return None, None, None, url
rows = []
def add(label, p):
    n, echo, ref, url = total(p); rows.append({"label": label, "params": p, "echo": echo, "total": n, "refreshedAt": ref, "url": url}); print(label, n, flush=True)
for t in ("house", "condo"):
    add(f"all {t}", {"type": t})
    add(f"{t} flood_zone", {"type": t, "has": "flood_zone"})
for h in ("septic", "public_sewer", "well_water"):
    add(f"house {h}", {"type": "house", "has": h})
for c in ["Myrtle Beach", "North Myrtle Beach", "Conway", "Murrells Inlet", "Little River", "Longs", "Surfside Beach", "Loris", "Aynor", "Galivants Ferry", "Green Sea", "Nichols", "Garden City", "Pawleys Island", "Georgetown"]:
    add(f"house in {c}", {"type": "house", "city": c})
    add(f"house septic in {c}", {"type": "house", "city": c, "has": "septic"})
    add(f"house sewer in {c}", {"type": "house", "city": c, "has": "public_sewer"})
for lo, hi in [(None, 300000), (300000, 500000), (500000, None)]:
    p = {"type": "house", "has": "septic"}
    if lo: p["min"] = lo
    if hi: p["max"] = hi
    add(f"house septic {lo}-{hi}", p)
add("condo str_allowed", {"type": "condo", "has": "str_allowed"})
add("condo long_term_rental_allowed", {"type": "condo", "has": "long_term_rental_allowed"})
add("condo in Myrtle Beach", {"type": "condo", "city": "Myrtle Beach"})
add("condo str_allowed in Myrtle Beach", {"type": "condo", "city": "Myrtle Beach", "has": "str_allowed"})
add("house str_allowed in Myrtle Beach", {"type": "house", "city": "Myrtle Beach", "has": "str_allowed"})
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "rows": rows}, open(f"{D}/listings-counts.json", "w"), indent=1)
