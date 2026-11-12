"""Findings for /invest/strategies/1031-exchange/ (batch 2026-11-b). Every number on the page that is not a quoted rule comes from findings.json.
Inputs:
  RAW/listings-active.json                     pull_listings.py (the site's own map API; kept outside the repo)
  ../../2026-10-d/sell-home-value/raw/horry-county.json   Census TIGERweb Horry County boundary (already in the repo)
  ../../2026-10-d/sell-home-value/findings.json           verified resale medians, county deeds Oct 2025 to Sep 2026 (ledger 2026-10-d/sell-home-value rows 2, 3)
  ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers-summary.json  verified buyer tax-bill states (ledger 2026-10-d/sell-out-of-state-buyers rows 2 to 5)
Run: RAW=<scratch> python3 -I analyze.py <this dir>. Writes findings.json and raw/listings-prices.json."""
import json, sys, os, statistics, datetime
D = sys.argv[1]; up = lambda *p: os.path.join(D, "..", "..", *p)
RAW = os.environ.get("RAW", os.path.join(D, "raw"))
L = json.load(open(os.path.join(RAW, "listings-active.json")))
ring = json.load(open(up("2026-10-d", "sell-home-value", "raw", "horry-county.json")))["features"][0]["geometry"]["rings"]
def inside(x, y):
    c = False
    for r in ring:
        for i in range(len(r)):
            x1, y1 = r[i - 1]; x2, y2 = r[i]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def q(v, p):
    v = sorted(v); k = (len(v) - 1) * p; f = int(k); return v[f] + (v[min(f + 1, len(v) - 1)] - v[f]) * (k - f)
def r1000(x): return int(round(x / 1000.0)) * 1000
out = {"meta": {"made": "analyze.py", "listings_pulled": L["pulled"], "listings_source": L["source"], "note": "Active listings in aggregate only. No address, firm or MLS number is in this file."}}
# 1. Replacement market: active listings in Horry County by type
EX = 376000  # the worked example's amount realized (row W1)
lst = {}
for t in ["condo", "multi", "house", "townhouse"]:
    homes = [h for h in L["homes"].values() if h["type"] == t and h["price"] and h["lat"] and h["lng"]]
    hc = [h for h in homes if inside(h["lng"], h["lat"])]
    pr = [h["price"] for h in hc]
    lst[t] = {"all_mls_area": len(homes), "horry": len(hc), "median": r1000(statistics.median(pr)) if pr else None,
              "p25": r1000(q(pr, .25)) if pr else None, "p75": r1000(q(pr, .75)) if pr else None,
              "at_or_over_example": sum(1 for p in pr if p >= EX), "under_200k": sum(1 for p in pr if p < 200000),
              "band_200_400k": sum(1 for p in pr if 200000 <= p < 400000), "band_400_600k": sum(1 for p in pr if 400000 <= p < 600000), "600k_up": sum(1 for p in pr if p >= 600000)}
out["listings_horry"] = lst
json.dump({"pulled": L["pulled"], "rows": sorted([[h["type"], h["price"], inside(h["lng"], h["lat"])] for h in L["homes"].values() if h["price"] and h["lat"] and h["lng"]])}, open(os.path.join(D, "raw", "listings-prices.json"), "w"))
out["listings_api_totals"] = L["api_totals"]; out["listings_truncated_bands"] = L["truncated"]
# 2. Verified sale medians and buyer states (carried, not recomputed)
hv = json.load(open(up("2026-10-d", "sell-home-value", "findings.json")))
out["resale_medians_carried"] = {"county_all": hv["county_all"], "by_area": [a for a in hv["by_area"] if a["area"] in ("Myrtle Beach (city)", "North Myrtle Beach (city)", "Little River", "Surfside Beach", "Garden City", "Carolina Forest", "Conway (city)")]}
ob = json.load(open(up("2026-10-d", "sell-out-of-state-buyers", "out-of-state-buyers-summary.json")))["summary"]
out["buyer_states_carried"] = {"all": ob["all"], "by_type": ob["by_type"], "by_buyer_kind": ob["by_buyer_kind"], "top_states": ob["top_states"][:5]}
# 3. Worked example: the site's standard constructed sale (/sell/capital-gains/ and /invest/strategies/dst/ row 24)
price, bought, dep, cost_pct = 400000, 250000, 60000, 0.06
costs = price * cost_pct; realized = price - costs; basis = bought - dep; gain = realized - basis
rate = 0.0521; deduction = 0.44; boot = 30000
w = {"inputs": {"price": price, "bought": bought, "depreciation": dep, "selling_costs": costs, "rate_2026": rate, "sc_deduction": deduction, "boot_kept": boot},
     "amount_realized": realized, "adjusted_basis": basis, "gain": gain,
     "withhold_no_affidavit": round(realized * rate, 2), "withhold_affidavit_of_gain": round(gain * rate, 2),
     "withhold_full_exchange_paid_to_state": 0,
     "partial_exchange": {"replacement_cost": realized - boot, "gain_recognized": boot, "withhold_on_boot": round(boot * rate, 2), "sc_tax_on_boot_top_rate": round(boot * (1 - deduction) * rate, 2)},
     "sc_tax_full_sale_top_rate": round(gain * (1 - deduction) * rate, 2),
     "replacement_to_defer_all": realized,
     "note": "Constructed example, no mortgage, the seller's other SC income already at or above $30,000 so 5.21 percent is the marginal rate. Withholding: SC Code 12-8-580(A)(1); amount realized = price less selling expenses (SC RR 09-13 Q15). Boot taxed up to its amount: IRC 1031(b)."}
out["worked_example"] = w
# 4. The clock: day 45 and day 180 from a closing day, and the latest closing whose day 180 is on or before April 15
def clock(y, m, d):
    c = datetime.date(y, m, d); return {"closing": c.isoformat(), "day45": (c + datetime.timedelta(45)).isoformat(), "day180": (c + datetime.timedelta(180)).isoformat()}
due = datetime.date(2027, 4, 15)
last_ok = due - datetime.timedelta(180)
out["clock"] = {"examples": [clock(2026, 3, 2), clock(2026, 6, 15), clock(2026, 11, 2)],
                "return_due_2026_sales": due.isoformat(), "latest_closing_with_full_180_without_extension": last_ok.isoformat(),
                "note": "Day counts from 26 USC 1031(a)(3); the earlier of day 180 and the return due date (with extensions). The federal return for a calendar-year individual is due on the 15th day of April after the year (26 USC 6072(a)); April 15, 2027 is a Thursday. Example dates are for the arithmetic only; the page states no calendar date."}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: out[k] for k in ["listings_horry", "worked_example", "clock"]}, indent=1))
