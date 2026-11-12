"""Counts of residential parcels with a building in Horry County GIS layer 24, condo units (legal description has 'HPR')
against all other homes, and how many carry the 4 percent legal-residence ratio (AssessedProp under 5 percent of TaxableProp).
Run: python3 -I count_ratio.py <datadir>. Writes raw/ratio-counts.json with every query URL."""
import json, sys, time, urllib.request, urllib.parse
D = sys.argv[1]; Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
BASE = "LandUseCode LIKE '1%' AND MarketImprv > 0"
W = {"condo_all": BASE + " AND LegalDescr LIKE '%HPR%'", "condo_4pct": BASE + " AND LegalDescr LIKE '%HPR%' AND AssessedProp < TaxableProp*0.05",
     "other_all": BASE + " AND LegalDescr NOT LIKE '%HPR%'", "other_4pct": BASE + " AND LegalDescr NOT LIKE '%HPR%' AND AssessedProp < TaxableProp*0.05"}
out = {"read": time.strftime("%Y-%m-%d"), "layer": Q[:-7], "counts": {}}
for k, w in W.items():
    url = Q + urllib.parse.urlencode({"where": w, "returnCountOnly": "true", "f": "json"})
    n = json.load(urllib.request.urlopen(url, timeout=120))["count"]
    out["counts"][k] = {"where": w, "url": url, "count": n}; print(k, n)
json.dump(out, open(D + "/raw/ratio-counts.json", "w"), indent=1)
