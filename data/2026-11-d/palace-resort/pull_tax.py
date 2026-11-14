"""The Palace: the county's taxable assessment per unit, in aggregate, and the tax it implies at the 2026 City of Myrtle Beach
millage (254.6 mills; ledger CON row 21). Source: Horry County GIS layer 24 (AssessedProp, TaxableProp, MarketProp).
Kept: for units taxed at the 6 percent rate, the count and the median and quartiles of TaxableProp and of MarketProp, and the
implied yearly tax (AssessedProp, which is 6 percent of TaxableProp, x 254.6 / 1000, before any credit or fee on the bill). No unit's own record.
Run: python3 -I pull_tax.py <this dir>. Writes tax.json."""
import json, sys, urllib.request, urllib.parse, statistics as st, datetime
D = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'THE PALACE;%'", "outFields": "MarketImprv,MarketProp,AssessedProp,TaxableProp,LandUseCode", "returnGeometry": "false", "f": "json"}
rows = [f["attributes"] for f in json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]]
six = [a for a in rows if (a.get("MarketImprv") or 0) > 0 and (a.get("LandUseCode") or "").startswith("1") and a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002]
def qs(v): v = sorted(v); q = st.quantiles(v, n=4); return {"median": st.median(v), "p25": q[0], "p75": q[2]}
tp = [a["TaxableProp"] for a in six]; mp = [a["MarketProp"] for a in six]; tax = [a["AssessedProp"] * 254.6 / 1000 for a in six]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "units_at_6pct": len(six),
       "taxable_value": qs(tp), "market_value": qs(mp), "implied_tax_city_millage": {k: round(v) for k, v in qs(tax).items()},
       "taxable_below_market_share": round(sum(1 for a in six if a["TaxableProp"] < a["MarketProp"] - 1) / len(six), 3)}
json.dump(out, open(D + "/tax.json", "w"), indent=1); print(json.dumps(out, indent=1)[-700:])
