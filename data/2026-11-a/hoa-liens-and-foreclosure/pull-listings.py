"""Active for-sale listings from the CRM's public map API, counted in aggregate only (no address kept).
'foreclosure', 'short_sale', 'distressed_sale' are the CRM's flags from the MLS record.
MLS source line: Coastal Carolinas Association of REALTORS(R) Multiple Listing Service (CCMLS).
Run: python3 -I pull-listings.py   (writes raw/listings-counts.json)"""
import json, time, urllib.request, urllib.parse, os
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://chapter3realty.com/homes/api/map?"
rows = []
def q(label, **p):
    p.setdefault("status", "active")
    url = BASE + urllib.parse.urlencode(p)
    for i in range(3):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60)); break
        except Exception as e:
            d = {"error": str(e)}; time.sleep(2)
    rows.append({"label": label, "params": p, "total": d.get("total"), "refreshedAt": (d.get("meta") or {}).get("refreshedAt")})
    print(label, d.get("total"), flush=True)
for t in ["", "house", "condo", "townhouse"]:
    for h in ["", "foreclosure", "short_sale", "distressed_sale"]:
        p = {}
        if t: p["type"] = t
        if h: p["has"] = h
        q(f"type={t or 'all'} has={h or '-'}", **p)
json.dump(rows, open(os.path.join(HERE, "raw", "listings-counts.json"), "w"), indent=1)
