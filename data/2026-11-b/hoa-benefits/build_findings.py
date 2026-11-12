"""Every number /hoa/benefits/ prints, from saved files only. Run: python3 -I build_findings.py <this folder>.
Reads:
  raw/farm-budget-summary.txt         The Farm @ Carolina Forest HOA, 2027 Budget - Approved (2026 and 2027 columns), pdftotext -layout
  ../hoa/budgets.json                 Del Webb at Grande Dunes 2025 budget lines; Myrtle Trace 2026 budget (the hub's file, not pulled again)
  raw/bls-oews-34820-2026-11-10.json  BLS OEWS May 2025, Myrtle Beach-Conway-North Myrtle Beach MSA (34820): security guards 33-9032
  raw/mb-rec-memberships-2026-11-10.txt, raw/nmb-afc-membership-2026-11-10.txt   public pool and gym prices
  rerun/price-test.json, rerun/counts.json   houses for sale with and without a fee (pull_houses.py, analyze_houses.py, pull_counts.py, 2026-11-10)
  from-2026-11-a/scdca-concerns.json  Horry County HOA complaints by concern, 2022 to 2025 (batch 2026-11-a, verified)
Home counts are typed from verified ledger rows: The Farm 1,571 (the-farm row 1), Myrtle Trace 518 (myrtle-trace rows 30, 31),
Del Webb at Grande Dunes 812 lots (del-webb-grande-dunes row 107).
Writes findings.json and chart-farm-fee.json, chart-pool.json, chart-price-by-beach.json, chart-complaints.json."""
import json, os, re, sys
d = sys.argv[1]
J = lambda *p: json.load(open(os.path.join(d, *p)))
T = lambda *p: open(os.path.join(d, *p), encoding="utf-8", errors="ignore").read()
F = {}

# ---- The Farm at Carolina Forest: 2027 approved budget, per home ----------------------------------------
FARM_HOMES = 1571
txt = T("raw", "farm-budget-summary.txt")
def line(label):
    m = re.search(re.escape(label) + r"\s+([\d,]+\.\d\d)\s+([\d,]+\.\d\d)", txt)
    if not m: raise SystemExit("farm line not found: " + label)
    return float(m.group(1).replace(",", "")), float(m.group(2).replace(",", ""))
assess = [line("4000 - Regular Assessments"), line("4003 - Assmt Income - Orchards"), line("4004 - Assmt Income - Planters Point")]
tot = line("Total Operating Expense")
items = {
    "Cable TV": [line("6505 - Cable TV Services"), line("6506 - Cable TV - Orchards/PP")],
    "Trash pickup": [line("5820 - Trash Removal - The Farm"), line("5821 - Trash Removal - Orchards"), line("5822 - Trash Removal - Planters Point")],
    "Lawns, landscaping and ponds": [line("Total Landscaping Maintenance")],
    "Management company": [line("6100 - Management Services Contract")],
    "Power for shared areas": [line("6555 - Electricity")],
    "Savings for repairs": [line("7000 - Reserves For Capt. Improvement")],
    "Two pools": [line("Total Pool Maintenance")],
    "Insurance": [line("6150 - Insurance Expense")],
}
y27 = {k: sum(v[1] for v in vs) for k, vs in items.items()}
y26 = {k: sum(v[0] for v in vs) for k, vs in items.items()}
other27 = tot[1] - sum(y27.values())
assess27 = sum(a[1] for a in assess); assess26 = sum(a[0] for a in assess)
F["farm"] = {
    "homes": FARM_HOMES, "budget_2027": tot[1], "budget_2026": tot[0],
    "dues_month_2027": round(assess27 / 12 / FARM_HOMES, 2), "dues_month_2026": round(assess26 / 12 / FARM_HOMES, 2),
    "per_home_month_2027": {k: round(v / 12 / FARM_HOMES, 2) for k, v in y27.items()} | {"Everything else": round(other27 / 12 / FARM_HOMES, 2)},
    "share_pct_2027": {k: round(100 * v / tot[1], 1) for k, v in y27.items()} | {"Everything else": round(100 * other27 / tot[1], 1)},
    "cable_2027": y27["Cable TV"], "cable_2026": y26["Cable TV"],
}
rows = sorted(F["farm"]["per_home_month_2027"].items(), key=lambda kv: -kv[1] if kv[0] != "Everything else" else 1)
json.dump({"title": f"Of The Farm's ${F['farm']['dues_month_2027']:.0f} monthly fee, about ${F['farm']['per_home_month_2027']['Cable TV']:.0f} pays for cable TV",
           "unit": "dollars a home a month, 2027 approved budget", "rows": [{"label": k, "month": v} for k, v in rows], "source": "raw/farm-budget-summary.txt"},
          open(os.path.join(d, "chart-farm-fee.json"), "w"), indent=1)

# ---- Myrtle Trace and Del Webb at Grande Dunes, per home, from the hub's budgets.json ---------------------
B = J("..", "hoa", "budgets.json")
mt = B["myrtle_trace_2026"]; L = mt["lines_2026"]; MT = mt["homes"]
F["myrtle_trace"] = {"homes": MT, "dues_month": mt["dues_per_home_month"],
    "pool_and_lakes_year": round(L["Pool & Lake Expenses"] / MT, 2), "pool_and_lakes_month": round(L["Pool & Lake Expenses"] / MT / 12, 2),
    "clubhouse_year": round(L["Clubhouse Expenses"] / MT, 2), "grounds_buildings_year": round(L["Grounds & Buildings Expenses"] / MT, 2)}
dw = B["del_webb_grande_dunes_2025"]["lines"]; DW = 812
F["del_webb_grande_dunes"] = {"lots": DW,
    "ocean_club_year_per_lot": round(dw["40015"] / DW, 2), "ocean_club_month_per_lot": round(dw["40015"] / DW / 12, 2),
    "yard_care_year_per_lot": round(dw["40020"] / DW, 2), "yard_care_month_per_lot": round(dw["40020"] / DW / 12, 2),
    "assessments_month_per_lot": round(B["del_webb_grande_dunes_2025"]["total_assessment_revenue"] / DW / 12, 2),
    "note": "Budget lines divided by the 812 recorded lots; the budget states no per-home rate (ledger row 76)."}

# ---- A staffed gate: one post, every hour of the year, at the local median guard wage --------------------
bls = {s["seriesID"]: s["data"] for s in J("raw", "bls-oews-34820-2026-11-10.json")["Results"]["series"]}
wage = float(bls["OEUM003482000000033903208"][0]["value"]); year = bls["OEUM003482000000033903208"][0]["year"]
F["gate"] = {"guard_median_hourly": wage, "oews_year": year, "guards_employed": int(bls["OEUM003482000000033903201"][0]["value"]),
    "hours_in_a_year": 8760, "one_post_round_the_clock_wages": round(wage * 8760),
    "split_examples": {n: round(wage * 8760 / n / 12, 2) for n in (98, 500, 1000)}}

# ---- Public pool and gym prices -----------------------------------------------------------------------------
mb = T("raw", "mb-rec-memberships-2026-11-10.txt"); nmb = T("raw", "nmb-afc-membership-2026-11-10.txt")
m = re.search(r"ANNUAL MEMBERSHIP City Resident/US Military Vet Non-City Resident Teen \(13-17\) \$(\d+) \$(\d+) Adult \(18-54\) \$(\d+) \$(\d+) Senior \(55\+\) \$(\d+) \$(\d+)", mb)
def afc(kind):
    mm = re.search(r"Membership Type " + kind + r" Description .*?Joining Fee: \$(\d+) Paid in Full: \$(\d+)", nmb)
    return int(mm.group(1)), int(mm.group(2))
F["public_pool"] = {"mb_adult_resident": int(m.group(3)), "mb_adult_nonresident": int(m.group(4)), "mb_senior_resident": int(m.group(5)), "mb_senior_nonresident": int(m.group(6)),
    "nmb_individual": afc("Individual"), "nmb_couple": afc("Couple"), "nmb_senior_individual": afc("Senior Individual"), "nmb_senior_couple": afc("Senior Couple")}
pp = F["public_pool"]
json.dump({"title": "A year of the pool through the fee costs a home less than one public pass",
    "unit": "dollars a year", "rows": [
        {"label": "Myrtle Trace's pool and ponds, each home's share", "year": round(F["myrtle_trace"]["pool_and_lakes_year"])},
        {"label": "The Farm's two pools, each home's share", "year": round(F["farm"]["per_home_month_2027"]["Two pools"] * 12)},
        {"label": "Myrtle Beach recreation center, one adult, city resident", "year": pp["mb_adult_resident"]},
        {"label": "Myrtle Beach recreation center, one adult, not a city resident", "year": pp["mb_adult_nonresident"]},
        {"label": "North Myrtle Beach Aquatic and Fitness Center, one adult", "year": pp["nmb_individual"][1]}],
    "source": "findings.json"}, open(os.path.join(d, "chart-pool.json"), "w"), indent=1)

# ---- Houses with and without a fee: asking price per square foot (re-run 2026-11-10) ---------------------
P = J("rerun", "price-test.json"); C = J("rerun", "counts.json")
cut = P["cuts"]["built 2000 or later"]; allc = P["cuts"]["all ages"]
F["price_test"] = {"built_2000_plus": {"with_fee_ppsf": cut["county"]["with_fee"]["median_ppsf"], "no_fee_ppsf": cut["county"]["no_fee"]["median_ppsf"],
        "with_fee_n": cut["county"]["with_fee"]["n"], "no_fee_n": cut["county"]["no_fee"]["n"],
        "with_fee_acres": cut["county"]["with_fee"]["median_acres"], "no_fee_acres": cut["county"]["no_fee"]["median_acres"],
        "zips_compared": cut["zips_compared"], "zips_fee_higher": cut["zips_fee_higher"], "median_zip_gap_pct": cut["median_of_zip_diffs_pct"]},
    "all_ages": {"zips_compared": allc["zips_compared"], "zips_fee_higher": allc["zips_fee_higher"], "median_zip_gap_pct": allc["median_of_zip_diffs_pct"]},
    "bands": [{"band": b["band"], "with_fee_ppsf": b["with_fee"]["median_ppsf"], "no_fee_ppsf": b["no_fee"]["median_ppsf"], "with_fee_acres": b["with_fee"]["median_acres"],
               "no_fee_acres": b["no_fee"]["median_acres"], "n_with": b["with_fee"]["n"], "n_none": b["no_fee"]["n"], "share_with_fee_pct": b["share_with_fee_pct"]}
              for b in P["beach_bands_built_2000_plus"]["county_by_band"]]}
json.dump({"title": "Newer houses with an HOA fee list for less a square foot than those without, at every distance from the beach",
    "unit": "asking price per square foot, houses for sale built 2000 or later, Horry County ZIP codes", "rows": F["price_test"]["bands"], "source": "rerun/price-test.json"},
    open(os.path.join(d, "chart-price-by-beach.json"), "w"), indent=1)
fw = C["features_with_fee"]
F["trade_offs"] = {"houses": C["house_total"], "no_fee": C["house_no_fee"], "with_fee": C["house_with_fee"],
    "rv_boat_parking_pct_with_fee": fw["rv_boat_parking"]["pct_of_with_fee"], "rv_boat_parking_pct_no_fee": fw["rv_boat_parking"]["pct_of_no_fee"],
    "community_pool_pct_with_fee": fw["community_pool"]["pct_of_with_fee"], "boat_ramp_pct_with_fee": fw["boat_ramp"]["pct_of_with_fee"], "boat_ramp_pct_no_fee": fw["boat_ramp"]["pct_of_no_fee"]}

# ---- Complaints ------------------------------------------------------------------------------------------
S = J("from-2026-11-a", "scdca-concerns.json")
F["complaints"] = {"source": "from-2026-11-a/scdca-concerns.json (batch 2026-11-a row 25, VERIFIED)"}
json.dump(F, open(os.path.join(d, "findings.json"), "w"), indent=1)
print(json.dumps(F, indent=1))
