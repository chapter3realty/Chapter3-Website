"""Two more aggregate counts for the 'other rules' section, from the CRM's public map API: listings marked pets allowed and
RV or boat parking, for condos and for houses with and without an association fee, Horry County, for sale. Counts only.
Run: python3 -I pull_other_rules.py <datadir>. Writes other-rules.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"; calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            n = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=90))["total"]
            calls.append({"url": url, "total": n}); time.sleep(1.2); return n
        except Exception: time.sleep(15)
    raise SystemExit("failed " + url)
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "groups": {}}
for name, p in {"condo": {"type": "condo", "has": "county_horry"}, "house": {"type": "house", "has": "county_horry"}}.items():
    g = {"listings": total(p)}
    for f in ["pets_allowed", "rv_boat_parking", "home_office"]:
        g[f] = total(dict(p, has=p["has"] + "," + f))
    if name == "house":
        q = dict(p, hoa="0"); g["no_hoa_fee"] = {"listings": total(q)}
        for f in ["rv_boat_parking", "pets_allowed"]:
            g["no_hoa_fee"][f] = total(dict(q, has=q["has"] + "," + f))
    out["groups"][name] = g; print(name, g, flush=True)
out["calls"] = calls
json.dump(out, open(D + "/other-rules.json", "w"), indent=1)
