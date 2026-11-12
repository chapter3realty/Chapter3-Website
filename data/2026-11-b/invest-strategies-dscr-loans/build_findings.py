"""Findings for /invest/strategies/dscr-loans/ (batch 2026-11-b).

Run: python3 -I build_findings.py <website-root>  ->  findings.json, chart-rent-split.json

Reads only files other ledgers already verified; types no listing figure:
  data/2026-11-a/invest-run-the-numbers/findings.json   (median asks, HUD rents, dues by ZIP; millage)
  data/2026-11-a/invest-run-the-numbers/insurance.json  (landlord and HO-6 estimates used there)
  data/2026-11-b/invest-airbnb-income/findings.json     (nightly cases and the size table)
  data/2026-11-a/invest-rent-prices/findings.json       (HUD FY2027 county rents by bedrooms)
Tax for a rental: price x 0.06 x mills / 1000 (SC Code 12-43-220(e); 2026 levy).
DSCR as lenders define it: rent counted / PITIA (principal and interest, taxes, insurance, association dues).
No rate and no loan payment is used or produced. The output is shares of the counted rent.
"""
import json, os, sys
root = sys.argv[1]
rd = lambda *p: json.load(open(os.path.join(root, *p)))
RTN = rd("data", "2026-11-a", "invest-run-the-numbers", "findings.json")
INS = rd("data", "2026-11-a", "invest-run-the-numbers", "insurance.json")
AIR = rd("data", "2026-11-b", "invest-airbnb-income", "findings.json")
RP = rd("data", "2026-11-a", "invest-rent-prices", "findings.json")

MILLS = {"unincorporated": 201.0, "myrtle_beach_city": 254.6, "mi_gc_fire": 207.3}
assert RTN["millage"]["unincorporated"] == 201.0 and RTN["millage"]["myrtle_beach_city"] == 254.6
HOUSE_INS = INS["used_on_page"]["house_year"]   # 3,300
CONDO_INS = INS["used_on_page"]["condo_year"]   # 972
TARGET = 1.25                                   # owner's coverage target (run-the-numbers row 22)
STR_COUNT = {"brickwood": 0.75, "published_programs": 0.80}

def zip_row(z, kind):
    for r in RTN["gross_yield_by_zip"]:
        if r["zip"] == z and r["type"].startswith(kind):
            return r
    raise SystemExit(f"missing {z} {kind}")

def case(name, kind, price, rent_month, dues_month, mills, ins_year, basis, src):
    tax_m = price * 0.06 * mills / 1000 / 12
    ins_m = ins_year / 12
    tia = tax_m + ins_m + dues_month
    share = lambda x: round(100 * x / rent_month, 1)
    room = rent_month / TARGET - tia          # what the rent leaves for principal and interest at 1.25
    return {
        "name": name, "kind": kind, "price": price, "rent_counted_month": round(rent_month),
        "rent_basis": basis, "source": src,
        "tax_month": round(tax_m), "insurance_month": round(ins_m), "dues_month": round(dues_month),
        "tax_ins_dues_month": round(tia),
        "pct_tax": share(tax_m), "pct_insurance": share(ins_m), "pct_dues": share(dues_month),
        "pct_tax_ins_dues": share(tia),
        "pct_cushion_at_1_25": round(100 * (1 - 1 / TARGET), 1),
        "pct_left_for_loan_at_1_25": round(100 * room / rent_month, 1),
        "ratio_before_any_loan": round(rent_month / tia, 2),
        "reaches_1_25_with_no_loan": rent_month / tia >= TARGET,
    }

cases = []
cf = zip_row("29579", "house"); lg = zip_row("29568", "house"); cfc = zip_row("29579", "condo"); mbc = zip_row("29577", "condo")
cases.append(case("Longs, 3-bedroom house", "house", lg["median_ask"], lg["rent"], lg["median_dues"], MILLS["unincorporated"], HOUSE_INS,
                  "HUD FY2027 small-area fair market rent, ZIP 29568", "run-the-numbers rows 11, 15, 18"))
cases.append(case("Carolina Forest, 3-bedroom house", "house", cf["median_ask"], cf["rent"], cf["median_dues"], MILLS["unincorporated"], HOUSE_INS,
                  "HUD FY2027 small-area fair market rent, ZIP 29579", "run-the-numbers rows 11, 15, 17"))
cases.append(case("Carolina Forest, 2-bedroom condo", "condo", cfc["median_ask"], cfc["rent"], cfc["median_dues"], MILLS["unincorporated"], CONDO_INS,
                  "HUD FY2027 small-area fair market rent, ZIP 29579", "run-the-numbers rows 11, 15, 16"))
cases.append(case("Myrtle Beach, 2-bedroom condo, yearly lease", "condo", mbc["median_ask"], mbc["rent"], mbc["median_dues"], MILLS["myrtle_beach_city"], CONDO_INS,
                  "HUD FY2027 small-area fair market rent, ZIP 29577", "run-the-numbers rows 11, 15, 19"))
ob = AIR["worked"]["myrtle_beach_oceanfront_2br"]; gc = AIR["worked"]["garden_city_2br"]
def g(d, *ks):
    for k in ks:
        if k in d: return d[k]
    raise SystemExit(f"missing {ks} in {list(d)}")
ob_gross = g(ob, "gross", "gross_year"); gc_gross = g(gc, "gross", "gross_year")
cases.append(case("Myrtle Beach oceanfront, 2-bedroom condo, nightly (75 percent counted)", "condo", ob["price_median"], ob_gross * STR_COUNT["brickwood"] / 12, ob["hoa_month"],
                  MILLS["myrtle_beach_city"], CONDO_INS, "75 percent of a year of guest payments at the average two-bedroom's rate and nights (AirROI)", "airbnb-income row 19"))
cases.append(case("Garden City Beach, 2-bedroom condo, nightly (75 percent counted)", "condo", gc["price_median"], gc_gross * STR_COUNT["brickwood"] / 12, gc["hoa_month"],
                  MILLS["mi_gc_fire"], CONDO_INS, "75 percent of a year of guest payments (AirROI, str-tools arithmetic)", "airbnb-income row 20"))
for c in cases[-2:]:
    c["at_80_percent"] = None
cases[-2]["at_80_percent_pct_tax_ins_dues"] = round(100 * cases[-2]["tax_ins_dues_month"] / (ob_gross * 0.8 / 12), 1)
cases[-1]["at_80_percent_pct_tax_ins_dues"] = round(100 * cases[-1]["tax_ins_dues_month"] / (gc_gross * 0.8 / 12), 1)

# The haircut against a yearly lease: Myrtle Beach area two-bedroom, nightly median and average, counted at 75 and 80 percent.
mb = [t for t in AIR["towns"] if t["slug"] == "myrtle-beach"][0]["by_size"]["2"]
haircut = {
    "mb_2br_nightly_median_year": mb["median"], "mb_2br_nightly_average_year": mb["average"],
    "median_counted_75_month": round(mb["median"] * 0.75 / 12), "median_counted_80_month": round(mb["median"] * 0.80 / 12),
    "average_counted_75_month": round(mb["average"] * 0.75 / 12), "average_counted_80_month": round(mb["average"] * 0.80 / 12),
    "hud_2br_29577_month": mbc["rent"],
    "hud_2br_county_fy2027_month": RP["fmr_fy2027"]["2"],
    "median_counted_75_below_hud_29577": round(mb["median"] * 0.75 / 12) < mbc["rent"],
}
out = {"made": "build_findings.py", "target_ratio": TARGET, "str_counted": STR_COUNT, "mills": MILLS,
       "insurance_year": {"house": HOUSE_INS, "condo_unit": CONDO_INS}, "cases": cases, "haircut": haircut}
HERE = os.path.dirname(os.path.abspath(__file__))
json.dump(out, open(os.path.join(HERE, "findings.json"), "w"), indent=1)
chart = {"title": "How much of the rent the tax, insurance and HOA fee use before the loan",
         "note": "Share of the monthly rent a lender counts. At a 1.25 ratio, 20 percent of the rent must be left over; the rest of the bar is what the rent leaves for principal and interest.",
         "rows": [{"label": c["name"], "tax": c["pct_tax"], "insurance": c["pct_insurance"], "hoa": c["pct_dues"],
                   "cushion": c["pct_cushion_at_1_25"], "left_for_loan": max(c["pct_left_for_loan_at_1_25"], 0),
                   "short_by": round(-min(c["pct_left_for_loan_at_1_25"], 0), 1)} for c in cases]}
json.dump(chart, open(os.path.join(HERE, "chart-rent-split.json"), "w"), indent=1)
for c in cases:
    print(f'{c["name"]:70s} rent {c["rent_counted_month"]:>5} TIA {c["tax_ins_dues_month"]:>5} ({c["pct_tax_ins_dues"]}%) left@1.25 {c["pct_left_for_loan_at_1_25"]}% ratio-no-loan {c["ratio_before_any_loan"]}')
print(haircut)
