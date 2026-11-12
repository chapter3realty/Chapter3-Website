"""Control for the 4% test in pull_owners.py: the same count for Seagate Village, an inland condo community on HUD's FHA list
(hud-horry-all.json, Approved). If the method works, an inland community where people live should show a much higher share.
Run: python3 -I pull_control.py <this folder>. Writes control.json (counts only)."""
import json, sys, urllib.request, urllib.parse, collections, datetime
out = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'SEAGATE VILLAGE%'", "outFields": "LegalDescr,AssessedProp,TaxableProp,MarketImprv", "returnGeometry": "false", "resultRecordCount": 2000, "f": "json"}
f = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]
r = [x["attributes"] for x in f if (x["attributes"].get("MarketImprv") or 0) > 0]
r4 = sum(1 for a in r if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
json.dump({"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "query": U + "?" + urllib.parse.urlencode(q),
           "seagate_village": {"units": len(r), "legal_residence_4pct": r4, "share": round(100 * r4 / len(r), 1),
                               "regimes": len(collections.Counter(a["LegalDescr"].split(";")[0] for a in r))}}, open(f"{out}/control.json", "w"), indent=1)
print(open(f"{out}/control.json").read())
