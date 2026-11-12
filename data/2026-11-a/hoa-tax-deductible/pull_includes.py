"""What the condo fee includes, for condos for sale in Horry County (the site's county_horry flag), from the CRM's public map API
(active CCMLS listings), counted in aggregate. Only counts are kept: no address, MLS number, firm or photo.
Run: python3 -I pull_includes.py <datadir>. Writes includes.json with every URL called."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"; calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            n = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
            calls.append({"url": url, "total": n}); return n
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
KEYS = ["hoa_includes_insurance", "hoa_includes_water_sewer", "hoa_includes_trash", "lawn_care_included", "hoa_includes_internet", "hoa_includes_cable",
        "hoa_includes_pest", "hoa_includes_electric", "community_amenities"]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "groups": {}}
for name, has in (("condos", "county_horry"), ("oceanfront_building", "county_horry,oceanfront_building")):
    n = total({"type": "condo", "has": has}); g = {"listings": n, "includes": {}}
    for k in KEYS:
        c = total({"type": "condo", "has": has + "," + k}); g["includes"][k] = {"count": c, "pct": round(100 * c / n, 1)}
    out["groups"][name] = g; print(name, json.dumps(g))
out["calls"] = calls
json.dump(out, open(D + "/includes.json", "w"), indent=1)
