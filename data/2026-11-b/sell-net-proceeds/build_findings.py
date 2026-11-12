"""Builds findings.json (batch 2026-11-b; copied from 2026-11-a and re-run), the one file the page's tables, chart and worked examples read for /sell/net-proceeds/.
Nothing is typed from memory: each constant names the ledger row it rests on. Bracketed row numbers are batch 2026-11-a rows (batches/2026-11-a/sell-net-proceeds/facts.md); batches/2026-11-b/sell-net-proceeds/facts.md maps each to its new row.
Inputs, relative to the website repo root (argv[1]):
  data/2026-10-d/sell-home-value/findings.json              resale prices, county_all (SHV row 2)
  data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json   13,194 recorded home sales (OSB row 1)
  data/2026-10-d/sell-out-of-state-buyers/raw/stock-by-state-condo.json, -house.json   owners by tax-bill state (OSB row 6)
  data/2026-11-b/sell-net-proceeds/listings.json             homes for sale now, price cuts and warranties (this folder)
Usage: python3 -I build_findings.py <website repo root>"""
import json, math, os, sys, statistics
W = sys.argv[1]; HERE = os.path.join(W, "data/2026-11-b/sell-net-proceeds")
J = lambda p: json.load(open(os.path.join(W, p)))
shv = J("data/2026-10-d/sell-home-value/findings.json")["county_all"]
# Fixed rules (ledger rows in brackets).
DEED_PER_500 = 1.85          # [row 4] SC Code 12-24-10(A): $1.85 per $500 or fraction
DEED_RECORD = 15.0           # [row 6] SC Code 8-21-310(A)(1): $15 to record a deed
SATISFACTION = 10.0          # [row 6] SC Code 8-21-310(B)(4): $10 for a mortgage satisfaction
LEVY_OUT = 201.0; SCHOOL_OP = 109.1   # [row 13] 2026 levy outside city limits, mills; school operating share
SC_TOP = 0.0521              # [row 17] top SC rate for a 2026 sale, the withholding rate
def deed_fee(p): return math.ceil(p / 500) * DEED_PER_500
def tax(p, legal):            # [rows 12, 13] the site's tax model: 4% x (levy - school op) or 6% x full levy
    return p * (0.04 * (LEVY_OUT - SCHOOL_OP) if legal else 0.06 * LEVY_OUT) / 1000
def r(x, n=0): return round(x, n) if n else int(round(x))
tiers = [("quarter_house", "A quarter of houses sold for less", shv["resale_house"]["iqr"][0]),
         ("middle_house", "The middle house", shv["resale_house"]["median"]),
         ("upper_house", "A quarter sold for more", shv["resale_house"]["iqr"][1]),
         ("middle_condo", "The middle condo", shv["resale_condo"]["median"])]
F = {"meta": {"made": "build_findings.py", "note": __doc__.splitlines()[0]}, "tiers": []}
for key, label, p in tiers:
    t = {"key": key, "label": label, "price": p, "deed_fee": round(deed_fee(p), 2), "deed_record": DEED_RECORD,
         "satisfaction": SATISFACTION, "per_1pct_commission": r(p / 100),
         "fixed_by_law": round(deed_fee(p) + DEED_RECORD + SATISFACTION, 2),
         "deed_fee_pct": round(100 * deed_fee(p) / p, 3),
         "fixed_pct": round(100 * (deed_fee(p) + DEED_RECORD + SATISFACTION) / p, 3),   # 2026-11-b: share of price set by law
         "fixed_no_mortgage": round(deed_fee(p) + DEED_RECORD, 2),
         "tax_year_legal": r(tax(p, True)), "tax_year_second": r(tax(p, False))}
    for rate in (5, 6):
        t[f"with_{rate}pct"] = r(t["fixed_by_law"] + p * rate / 100)
    F["tiers"].append(t)
# Proration: the seller's share of the year's tax at the end of each quarter (days from January 1, non-leap year).
DAYS = {"end_of_march": 90, "end_of_june": 181, "end_of_september": 273, "end_of_december": 365}
mid = shv["resale_house"]["median"]
F["proration_middle_house"] = {"price": mid, "rule": "seller's share = this year's tax x days owned / 365 [rows 10, 11]; tax as row 13, outside city limits",
    "legal_residence": {k: r(tax(mid, True) * d / 365) for k, d in DAYS.items()},
    "second_home_or_rental": {k: r(tax(mid, False) * d / 365) for k, d in DAYS.items()},
    "year_legal": r(tax(mid, True)), "year_second": r(tax(mid, False))}
# Withholding: the middle condo sold by a seller whose permanent home is outside SC [rows 16, 17].
c = shv["resale_condo"]["median"]
F["withholding_middle_condo"] = {"price": c, "rate": SC_TOP,
    "no_affidavit_on_price": r(c * SC_TOP),
    "note": "12-8-580(A)(1)(b) uses the amount realized; the price less selling costs makes it a little smaller. Example only, with an affidavit (I-295): 5.21% of the gain."}
for gain in (25000, 50000):
    F["withholding_middle_condo"][f"with_affidavit_gain_{gain}"] = r(gain * SC_TOP)
# Deed fees paid by sellers on the 12 months of recorded home sales [row 5].
sales = J("data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json")["sales"]
fees = [deed_fee(s["cons"]) for s in sales if s.get("cons")]
F["deed_fees_12mo"] = {"sales": len(fees), "total": r(sum(fees)), "median": r(statistics.median(fees)),
    "period": "deeds recorded 2025-10-01 to 2026-09-30, home sales of $10,000 or more (OSB filter)"}
# Owners by tax-bill state [row 18]: who would face withholding when they sell (unless exempt).
def share(f):
    d = J(f); tot = sc = blank = 0
    for x in d["features"]:
        s = (x["attributes"]["OwnerState"] or "").strip(); n = x["attributes"]["n"]; tot += n
        sc += n if s == "SC" else 0; blank += n if s == "" else 0
    return {"homes": tot, "outside_sc": tot - sc - blank, "pct": round(100 * (tot - sc - blank) / (tot - blank), 1)}
F["owners_outside_sc"] = {"condo": share("data/2026-10-d/sell-out-of-state-buyers/raw/stock-by-state-condo.json"),
                          "house": share("data/2026-10-d/sell-out-of-state-buyers/raw/stock-by-state-house.json")}
# Homes for sale now [rows 19, 20].
L = json.load(open(os.path.join(HERE, "listings.json")))
F["listings"] = {"pulled": L["pulled"], "house": {k: L["kinds"]["house"][k] for k in ("for_sale", "resale", "price_cut_resale", "pct_price_cut_resale", "warranty", "warranty_new", "warranty_resale", "pct_warranty_resale", "bands")},
                 "condo": {k: L["kinds"]["condo"][k] for k in ("resale", "price_cut_resale", "pct_price_cut_resale", "warranty_resale", "pct_warranty_resale", "bands")}}
json.dump(F, open(os.path.join(HERE, "findings.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in F.items() if k != "listings"}, indent=1))
