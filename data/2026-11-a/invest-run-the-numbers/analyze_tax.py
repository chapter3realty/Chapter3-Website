"""The seller's tax value against the price, for Horry County resales recorded 2026-01-01 to 2026-09-30.
Inputs: the 2026-10-d deed file (sales.json: price = deed consideration, builder flag, condo flag, Census place) and
RAW/parcels-2026-sales.json (county GIS layer 24, read 2026-11-01). For tax year 2026 the county record still carries the seller's
values: SC Code 12-37-3140(A)(1)(b) and (E) move a sold parcel to its transfer value only in the following tax year.
Keeps resales whose parcel has a building (MarketImprv > 0) and a taxable value. Writes tax-reset.json (no PINs, no addresses).
Usage: RAW=<scratch> python3 -I analyze_tax.py <sales.json> <datadir>"""
import sys, os, json, statistics as st
SALES, D = sys.argv[1], sys.argv[2]; RAW = os.environ["RAW"]
P = {}
for p in json.load(open(os.path.join(RAW, "parcels-2026-sales.json"))):
    P[str(int(p["PIN"]))] = p
sales = [s for s in json.load(open(SALES))["sales"] if s["date"] >= "2026/01/01" and not s["builder"]]
rows = []
for s in sales:
    p = P.get(str(s["pin"]))
    if not p or not p["TaxableProp"] or not p["MarketImprv"] or not s["cons"]: continue
    ratio = p["AssessedProp"] / p["TaxableProp"]
    cls = "4" if abs(ratio - 0.04) < 0.0015 else "6" if abs(ratio - 0.06) < 0.0015 else "other"
    rows.append({"price": s["cons"], "taxable": p["TaxableProp"], "market": p["MarketProp"], "cls": cls, "condo": s["condo"],
                 "place": s["place"], "zip": s["zip"], "district": p["TaxDistrict"], "date": s["date"]})
def summ(rs):
    if not rs: return None
    x = sorted(r["price"] / r["taxable"] for r in rs)
    q = st.quantiles(x, n=4)
    return {"n": len(rs), "median_price_over_taxable": round(st.median(x), 3), "q1": round(q[0], 3), "q3": round(q[2], 3),
            "share_price_25pct_or_more_above": round(sum(v >= 1.25 for v in x) / len(x), 3),
            "share_price_50pct_or_more_above": round(sum(v >= 1.5 for v in x) / len(x), 3),
            "share_price_double_or_more": round(sum(v >= 2 for v in x) / len(x), 3),
            "median_price": st.median(r["price"] for r in rs), "median_taxable": st.median(r["taxable"] for r in rs)}
out = {"source": "Horry County AcclaimWeb DEED (001) resales recorded 2026-01-01..2026-09-30 (batch 2026-10-d pull) joined to Horry County GIS layer 24, read 2026-11-01",
       "kept": len(rows), "resales_in_window": len(sales),
       "all": summ(rows), "house": summ([r for r in rows if not r["condo"]]), "condo": summ([r for r in rows if r["condo"]]),
       "class_counts": {c: sum(r["cls"] == c for r in rows) for c in ["4", "6", "other"]},
       "class_counts_house": {c: sum(r["cls"] == c and not r["condo"] for r in rows) for c in ["4", "6", "other"]},
       "class_counts_condo": {c: sum(r["cls"] == c and r["condo"] for r in rows) for c in ["4", "6", "other"]},
       "six_pct_on_record": summ([r for r in rows if r["cls"] == "6"]), "four_pct_on_record": summ([r for r in rows if r["cls"] == "4"]),
       "by_place": {}}
for pl in sorted({r["place"] or "unknown" for r in rows}):
    rs = [r for r in rows if (r["place"] or "unknown") == pl]
    if len(rs) >= 100: out["by_place"][pl] = summ(rs)
# Unincorporated multiplier: an investor buying from a seller whose record is 4 percent, unincorporated Horry County (201.0 mills,
# 2026 levy: county 52.1 + school 119.1 + county fire 20.2 + fire apparatus 1.5 + waste management 8.1; school operating 109.1 exempt at 4 percent).
M, SCH = 201.0, 109.1
out["unincorporated_mills"] = M
def bill(v, r, m): return v * r * m / 1000
inc = [r for r in rows if r["place"] in ("outside any Census place", "Carolina Forest CDP", "Socastee CDP", "Little River CDP", "Red Hill CDP", "Forestbrook CDP", "Garden City CDP")]
mult4, mult4x, mult6, mult6x = [], [], [], []
for r in inc:
    if r["place"] == "Garden City CDP": continue  # Murrells Inlet-Garden City fire district, different millage
    new_no_ex = bill(r["price"], 0.06, M)
    ex = max(0.75 * r["price"], r["market"]) if r["price"] >= r["market"] else r["price"]
    if r["cls"] == "4":
        mult4.append(new_no_ex / bill(r["taxable"], 0.04, M - SCH)); mult4x.append(bill(ex, 0.06, M) / bill(r["taxable"], 0.04, M - SCH))
    if r["cls"] == "6":
        mult6.append(new_no_ex / bill(r["taxable"], 0.06, M))
        mult6x.append(bill(ex, 0.06, M) / bill(r["taxable"], 0.06, M))
out["unincorporated_investor_bill_multiple"] = {
    "seller_on_4pct": {"n": len(mult4), "median": round(st.median(mult4), 2), "q1": round(st.quantiles(mult4, n=4)[0], 2), "q3": round(st.quantiles(mult4, n=4)[2], 2)},
    "seller_on_4pct_with_ati_exemption": {"n": len(mult4x), "median": round(st.median(mult4x), 2), "q1": round(st.quantiles(mult4x, n=4)[0], 2), "q3": round(st.quantiles(mult4x, n=4)[2], 2)},
    "seller_on_6pct_no_ati_exemption": {"n": len(mult6), "median": round(st.median(mult6), 2)},
    "seller_on_6pct_with_ati_exemption": {"n": len(mult6x), "median": round(st.median(mult6x), 2),
        "rule": "12-37-3135(B)(2): exemption is 25% of the transfer value, but the exempted value may not fall below the county's current market value (MarketProp)"}}
json.dump(out, open(os.path.join(D, "tax-reset.json"), "w"), indent=1)
print(json.dumps(out["unincorporated_investor_bill_multiple"], indent=1))
