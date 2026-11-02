"""Active for-sale listings on the CRM's public map API, counted in aggregate (no addresses kept), against HUD's FY2027
Small Area Fair Market Rent for the same ZIP. Run: python3 -I pull_listings.py <datadir>. Writes listings-vs-rent.json.
Test for a house: list price at or below (12 x the ZIP's 3-bedroom rent) / gross yield, among houses with 3+ bedrooms.
Gross yield 12 percent is the "1 percent rule" (a month's rent is 1 percent of the price)."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]
SAF = json.load(open(D + "/safmr-fy2027.json"))["zips"]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
            return d["total"], d["meta"].get("refreshedAt")
        except Exception as e:
            err = e; time.sleep(3)
    raise SystemExit("failed " + url + " " + str(err))
YIELDS = [0.12, 0.10, 0.08, 0.06]
rows = []; refreshed = None
# Residential ZIPs only (PO box ZIPs 29578, 29587, 29597, 29598 have no street addresses; 29528 is a Conway PO box ZIP).
for z in ["29511","29526","29527","29544","29545","29566","29568","29569","29572","29575","29576","29577","29579","29581","29582","29588"]:
    for kind, beds, br in [("house", 3, "3"), ("condo", 2, "2"), ("condo", 1, "1")]:
        rent = SAF[z][br]
        p = {"zip": z, "type": kind, "beds": beds}
        n, refreshed = total(p)
        r = {"zip": z, "type": kind, "beds_min": beds, "rent_br": br, "rent": rent, "listings": n, "at_or_below": {}}
        for y in YIELDS:
            mx = int(rent * 12 / y)
            m, _ = total(dict(p, max=mx))
            r["at_or_below"][str(y)] = {"max_price": mx, "listings": m}
        rows.append(r); print(r, flush=True)
# Condo dues: count of condos (any bedrooms) by highest monthly HOA fee, county-wide and by ZIP for the beach ZIPs.
dues = {}
for scope in ["", "29577", "29572", "29575", "29576", "29582", "29579", "29588", "29566"]:
    base = {"type": "condo"}
    if scope: base["zip"] = scope
    n, _ = total(base)
    d = {"listings": n, "nohoa": total(dict(base, hoa="0"))[0], "hoaMax": {}}
    for mx in [200, 300, 400, 500, 600, 700, 800, 1000, 1500]:
        d["hoaMax"][str(mx)] = total(dict(base, hoaMax=mx))[0]
    dues[scope or "all"] = d; print(scope, d, flush=True)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "feed_refreshed": refreshed, "api": BASE,
           "yields": YIELDS, "rows": rows, "condo_dues": dues}, open(D + "/listings-vs-rent.json", "w"), indent=1)
