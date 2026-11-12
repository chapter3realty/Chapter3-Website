"""Page data for /invest/financing-multiple-rentals/ (batch 2026-11-b).

Reads from-2026-11-a/equity-by-year.json (Zillow ZHVI, verified 2026-11-04) and
hmda-rentals.json (HMDA 2025 and 2024, Horry County; this folder). Writes:
  chart-equity-by-year.json  what a typical house bought each September has gained (bar chart)
  chart-equity-routes.json   how owners here took equity out in 2025 (bar chart, counts)
  examples.json              the worked example without the struck insurance figure
No rate, no loan payment, no LTV percentage leaves this file for the page.

Usage: python3 -I build_page_data.py <this folder>
"""
import json, os, sys

d = sys.argv[1]
eq = json.load(open(os.path.join(d, "from-2026-11-a/equity-by-year.json")))
hm = json.load(open(os.path.join(d, "hmda-rentals.json")))

# 1. Equity by purchase year, rounded to the nearest $1,000 for the chart labels.
rows = [{"year": r["bought_sept"], "gain": r["gain"], "gain_rounded": int(round(r["gain"] / 1000.0)) * 1000}
        for r in eq["by_purchase_year"] if r["bought_sept"] >= 2015]
json.dump({
    "title": "What a typical Myrtle Beach-area house has gained, by the year it was bought",
    "unit": "dollars, September of the year bought to September 2026",
    "source": eq["source"],
    "now_month": eq["now_month"],
    "rows": rows,
}, open(os.path.join(d, "chart-equity-by-year.json"), "w"), indent=1)

# 2. Equity routes in 2025: loans made (originated), Horry County.
y = hm["years"]["2025"]["by_occupancy"]
routes = {
    "title": "How owners here took cash out of a home in 2025",
    "unit": "loans made in Horry County, 2025",
    "source": "HMDA 2025, Horry County (FFIEC data browser)",
    "rows": [
        {"label": "Cash-out refinance on a rental", "n": y["investment"]["originated_by_kind"].get("cash_out_refinance", 0)},
        {"label": "Line of credit on a rental", "n": y["investment"]["originated_by_kind"].get("line_of_credit", 0)},
        {"label": "Line of credit on a home the owner lives in", "n": y["home"]["originated_by_kind"].get("line_of_credit", 0)},
    ],
    "denied_pct": {
        "rental_cash_out": y["investment"]["denial_rate_by_kind"]["cash_out_refinance"]["denied_pct"],
        "rental_line_of_credit": y["investment"]["denial_rate_by_kind"]["line_of_credit"]["denied_pct"],
        "home_line_of_credit": y["home"]["denial_rate_by_kind"]["line_of_credit"]["denied_pct"],
    },
    "lenders": {
        "rental_line_of_credit": y["investment"]["line_of_credit_originated"]["distinct_lenders"],
        "rental_cash_out": y["investment"]["cash_out_originated"]["distinct_lenders"],
        "home_line_of_credit": y["home"]["line_of_credit_originated"]["distinct_lenders"],
    },
}
json.dump(routes, open(os.path.join(d, "chart-equity-routes.json"), "w"), indent=1)

# 3. Worked example (label "Example"). Inputs: /invest/run-the-numbers/ worked example 1
# (3-bedroom, Carolina Forest 29579, asking $390,000; HUD SAFMR $2,230; tax about $4,700
# at 6 percent, 201.0 mills; HOA $1,200 a year). Insurance is the reader's own quote
# (the $3,300 estimate was struck on 2026-11-04).
value_now = round(eq["value_now"] / 100.0) * 100          # 364,300
cap = round(0.75 * value_now / 100.0) * 100               # 273,200 (Freddie Mac 1-unit investment cash-out)
owed = 150000                                              # assumed, labelled on the page
tax, hoa, rent = 4700, 1200, 2230
non_loan_month = (tax + hoa) / 12.0                        # 491.67
ex = {
    "label": "Example",
    "first_rental": {"bought_sept": 2019, "typical_value_then": 233900, "value_now": value_now,
                     "largest_new_loan": cap, "assumed_owed": owed, "cash_before_closing_costs": cap - owed},
    "next_house": {"zip": "29579", "area": "Carolina Forest", "beds": 3, "asking": 390000,
                   "hud_rent_month": rent, "tax_year": tax, "hoa_year": hoa,
                   "tax_and_dues_month": round(non_loan_month, 2), "tax_and_dues_year": tax + hoa,
                   "rent_counted_long_term": round(rent * 0.75, 2), "rent_counted_short_term": round(rent * 0.5, 2)},
    "reserve": {"new_house_tax_and_dues_6_months": round(6 * non_loan_month),
                "other_balance": cap, "other_share": 0.02, "other_part": round(0.02 * cap),
                "total_before_loan_payment_and_insurance": round(6 * non_loan_month) + round(0.02 * cap),
                "plus": "six months of the new loan's payment and insurance (the reader's own figures)"},
    "worst_case": {"houses": 2, "months": 3, "tax_and_dues": round(2 * 3 * non_loan_month),
                   "rent_not_collected_at_hud_figure": 2 * 3 * rent,
                   "plus": "three payments on each loan, and insurance (the reader's own figures)"},
}
json.dump(ex, open(os.path.join(d, "examples.json"), "w"), indent=1)
print(json.dumps({"equity_rows": rows, "routes": routes, "example": ex}, indent=1))
