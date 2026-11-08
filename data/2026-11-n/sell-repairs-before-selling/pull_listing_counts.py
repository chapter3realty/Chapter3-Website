"""Houses for sale now in Horry County, by year built, and how many advertise a new roof, new heating and air, a home
warranty, a renovation, or that they need work. Aggregate counts only, from the CRM's public map API (the CCMLS listings
the CRM carries). No address, MLS number, price, firm or photo is saved.
Filters: type=house, has=county_horry, not=new_construction (resales; homes a builder is selling are left out).
Feature keys are the CRM's (spec: Blog-Brain batches/2026-10-b/ABDULLA-ASK-2026-10-28.md, table "our own filters"):
new_roof = remarks say "new roof" or a roof year within 5 years; new_hvac = remarks say "new HVAC", "new AC", "new heat pump".
Run: python3 -I pull_listing_counts.py <outdir>. Writes <outdir>/listing-counts.json."""
import json, sys, os, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def total(p):
    time.sleep(1.5)
    url = BASE + urllib.parse.urlencode(p, safe=",")
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            calls.append({"url": url, "total": d["total"], "refreshedAt": (d.get("meta") or {}).get("refreshedAt")})
            return d["total"]
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(10 * (i + 1))
    calls.append({"url": url, "error": "failed"}); return None
BANDS = [("built 1985 or earlier", None, 1985), ("built 1986 to 1995", 1986, 1995), ("built 1996 to 2005", 1996, 2005),
         ("built 2006 to 2015", 2006, 2015), ("built 2016 or later", 2016, None)]
# The whole county with a feature filter returns HTTP 503 (2026-11-08), so the all-houses row is the sum of the bands.
# Check: the bands must add up to the plain whole-county total (no house is left out for a missing year).
FEATS = ["new_roof", "new_hvac", "home_warranty", "renovated", "fixer_upper", "price_reduced", "crawlspace", "slab_foundation"]
rows = []
for name, a, b in BANDS:
    base = {"type": "house", "has": "county_horry", "not": "new_construction"}
    if a: base["yearMin"] = a
    if b: base["yearMax"] = b
    r = {"band": name, "yearMin": a, "yearMax": b, "houses": total(base)}
    for f in FEATS:
        r[f] = total(dict(base, has="county_horry," + f))
    # price cuts among houses that do and do not advertise a new roof
    r["new_roof_and_price_reduced"] = total(dict(base, has="county_horry,new_roof,price_reduced"))
    r["no_new_roof"] = total(dict(base, **{"not": "new_construction,new_roof"}))
    r["no_new_roof_and_price_reduced"] = total(dict(base, has="county_horry,price_reduced", **{"not": "new_construction,new_roof"}))
    rows.append(r); print(json.dumps(r), flush=True)
tot = {k: sum(r[k] for r in rows) if all(r[k] is not None for r in rows) else None for k in rows[0] if k not in ("band", "yearMin", "yearMax")}
tot.update(band="all resale houses (sum of bands)", yearMin=None, yearMax=None)
whole = total({"type": "house", "has": "county_horry", "not": "new_construction"})
tot["whole_county_total_check"] = whole
rows.append(tot); print(json.dumps(tot), flush=True)
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "base_filters": "type=house, has=county_horry, not=new_construction",
       "rows": rows, "calls": calls}
json.dump(res, open(os.path.join(out, "listing-counts.json"), "w"), indent=1)
