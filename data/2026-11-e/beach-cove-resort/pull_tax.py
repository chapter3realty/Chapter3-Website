"""Beach Cove Resort: county taxable assessment per unit in aggregate and the yearly tax it implies at the 2026 North Myrtle Beach rental-rate levy
(county and schools 171.2 mills + city 50 mills = 221.2 mills, no legal-residence credit; derived from website-ledger row AFF 65, a 2026 Treasurer bill). Units taxed at 6 percent only. Aggregate only.
Run: python3 -I pull_tax.py <this dir>. Writes tax.json."""

import json, sys, urllib.request, urllib.parse, statistics as st, datetime
D = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'BEACH COVE%'", "outFields": "MarketImprv,MarketProp,AssessedProp,TaxableProp,LandUseCode", "returnGeometry": "false", "f": "json"}
rows = [f["attributes"] for f in json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]]
six = [a for a in rows if (a.get("MarketImprv") or 0) > 0 and (a.get("LandUseCode") or "").startswith("1") and a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002]
def qs(v): v = sorted(v); q = st.quantiles(v, n=4); return {"median": st.median(v), "p25": q[0], "p75": q[2]}
tp = [a["TaxableProp"] for a in six]; mp = [a["MarketProp"] for a in six]; tax = [a["AssessedProp"] * 221.2 / 1000 for a in six]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "units_at_6pct": len(six),
       "taxable_value": qs(tp), "market_value": qs(mp), "implied_tax_city_millage": {k: round(v) for k, v in qs(tax).items()},
       "taxable_below_market_share": round(sum(1 for a in six if a["TaxableProp"] < a["MarketProp"] - 1) / len(six), 3)}
json.dump(out, open(D + "/tax.json", "w"), indent=1); print(json.dumps(out, indent=1)[-700:])
