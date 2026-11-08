"""Findings for /sell/divorce/ (batch 2026-11-n). Run from this folder: python3 -I build_findings.py .
Inputs (reused, not re-pulled):
  ../../2026-10-d/sell-home-value/findings.json  "county_all" (middle Horry County resale house price, deeds Oct 2025 to Sep 2026; verified row 2 of that page's ledger)
  raw/fhfa-34820.csv  FHFA All-Transactions HPI, CBSA 34820 (copied from ../../2026-10-d/sell-home-value/raw/fhfa-34820.csv, read 2026-11-01;
                      source https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv)
Rules (SC Code and IRS; see the ledger): deed fee $1.85 per $500 or part (12-24-10(A)); a spouse-to-spouse deed with no gain under IRC 1041
is exempt (12-24-40(4)); the home-sale exclusion is $250,000 per person, $500,000 on a joint return (IRS Pub 523).
The loan balance in the worked example is an example input, not a fact, and the page must say so."""
import json, sys, csv, math, os
out = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
hv = json.load(open(os.path.join(here, "../../2026-10-d/sell-home-value/findings.json")))
price = hv["county_all"]["resale_house"]["median"]          # 350000
n_house = hv["county_all"]["resale_house"]["n"]
balance = 200000                                             # EXAMPLE INPUT
def deed_fee(v): return math.ceil(v / 500) * 1.85
equity = price - balance
fee_per_1pct = price * 0.01
sale = {
  "price": price, "loan_balance_example": balance, "equity_before_costs": equity,
  "deed_fee": round(deed_fee(price), 2), "agent_fee_per_1_percent": fee_per_1pct,
  "equity_after_deed_fee": round(equity - deed_fee(price), 2),
  "each_half_after_deed_fee_before_agent_fees": round((equity - deed_fee(price)) / 2, 2),
  "each_half_agent_fee_per_1_percent": fee_per_1pct / 2,
  "note": "Equal split shown only as an example; SC courts divide marital property equitably (20-3-620), not always equally. Attorney fees and other closing costs are not counted."
}
buyout = {
  "agreed_value": price, "loan_balance_example": balance, "equity": equity,
  "payment_to_leaving_spouse_if_equal": equity / 2,
  "new_loan_at_least": balance + equity / 2,
  "deed_fee_spouse_to_spouse": 0.0,
  "deed_fee_saved": round(deed_fee(price), 2),
  "agent_fee": 0,
  "note": "New loan = old balance + the payment, before the refinance's own closing costs (not counted). The spouse who keeps the house must qualify alone (Fannie Mae B2-1.3-02)."
}
# FHFA
rows = []
for r in csv.reader(open(os.path.join(here, "raw/fhfa-34820.csv"))):
    if r[1] != "34820" or r[4].strip() == "-": continue
    rows.append((int(r[2]), int(r[3]), float(r[4])))
idx = {(y, q): v for y, q, v in rows}
latest = max(idx)
I_now = idx[latest]
gains = []
for y in range(1995, latest[0] + 1):
    q = latest[1]
    if (y, q) not in idx: continue
    paid = price * idx[(y, q)] / I_now
    gains.append({"year_bought": y, "quarter": q, "index": idx[(y, q)], "implied_price_paid": round(paid, -3),
                  "gain": round(price - paid, -3), "gain_each_half": round((price - paid) / 2, -3)})
over_250 = [g for g in gains if price - price * g["index"] / I_now > 250000]
quarters_over = [(y, q) for (y, q), v in sorted(idx.items()) if price - price * v / I_now > 250000]
first_under = next(((y, q) for (y, q), v in sorted(idx.items()) if price - price * v / I_now <= 250000), None)
findings = {
  "meta": {"made": "build_findings.py", "price_source": "data/2026-10-d/sell-home-value/findings.json county_all.resale_house",
           "fhfa_latest": f"{latest[0]}Q{latest[1]}", "fhfa_latest_index": I_now},
  "price": {"median_resale_house": price, "n": n_house, "period": "deeds recorded 2025-10-01 to 2026-09-30"},
  "worked_sale": sale, "worked_buyout": buyout,
  "chart_gain_by_year_bought": gains,
  "gain_over_250000_quarters": [f"{y}Q{q}" for y, q in quarters_over],
  "first_quarter_with_gain_at_or_under_250000": f"{first_under[0]}Q{first_under[1]}" if first_under else None,
  "gain_rule": "gain = today's middle resale house price minus that price scaled back by the FHFA index; before improvements (which add to basis) and selling costs (which reduce the gain), so a real house's taxable gain is usually lower."
}
json.dump(findings, open(os.path.join(out, "findings.json"), "w"), indent=1)
print(json.dumps({k: findings[k] for k in ("price", "worked_sale", "worked_buyout", "gain_over_250000_quarters", "first_quarter_with_gain_at_or_under_250000")}, indent=1))
for g in gains: print(g)
