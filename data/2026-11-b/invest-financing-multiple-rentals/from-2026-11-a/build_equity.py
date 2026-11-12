"""Equity by purchase year: Zillow Home Value Index, Myrtle Beach metro, single-family, middle third, smoothed, seasonally adjusted.
Input: data/2026-11-a/invest-rent-prices/raw/zillow/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv (pulled 2026-11-02 from
https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv by the rent-prices page).
Cash-out cap: Freddie Mac, 1-unit investment property cash-out refinance, maximum LTV 75 percent (raw/fhlmc-ltv.txt).
Usage: python3 -I build_equity.py <this dir> <zhvi csv>
Writes equity-by-year.json (chart rows and the worked example)."""
import sys, os, csv, json
D, F = sys.argv[1], sys.argv[2]
row = next(r for r in csv.DictReader(open(F)) if r["RegionName"] == "Myrtle Beach, SC")
NOW = "2026-09-30"; now = float(row[NOW])
CAP = 0.75
years = []
for y in range(2012, 2026):
    v = float(row[f"{y}-09-30"])
    years.append({"bought_sept": y, "typical_value_then": round(v), "typical_value_now": round(now), "gain": round(now - v), "gain_pct": round(100 * (now / v - 1), 1)})
peak_month = max((k for k in row if k[:2] == "20"), key=lambda k: float(row[k]) if row[k] else 0)
ex_year = 2019; v0 = float(row[f"{ex_year}-09-30"]); owed = 150000
ex = {"label": "Example", "bought_sept": ex_year, "price_then": round(v0, -2), "value_now": round(now, -2),
      "still_owed_assumed": owed, "cap_share": CAP, "largest_new_loan": round(CAP * round(now, -2), -2),
      "cash_before_closing_costs": round(CAP * round(now, -2) - owed, -2),
      "note": "The owed figure is an assumption for the example, not computed from any rate. The cap is the largest new loan as a share of the appraised value; the page states it in dollars only."}
# what a recent buyer has: bought Sept 2022
v22 = float(row["2022-09-30"])
out = {"source": "Zillow ZHVI metro single-family mid tier SA, Myrtle Beach-Conway-North Myrtle Beach (includes Brunswick County, NC)", "now_month": NOW,
       "value_now": round(now), "peak_month": peak_month, "peak_value": round(float(row[peak_month])), "by_purchase_year": years, "example": ex,
       "bought_2022": {"then": round(v22), "now": round(now), "change_pct": round(100 * (now / v22 - 1), 1)}}
json.dump(out, open(os.path.join(D, "equity-by-year.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
