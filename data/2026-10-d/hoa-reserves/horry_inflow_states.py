"""Where people moving to Horry County, SC come from, by state, from IRS SOI county-to-county inflow files.
Rows into Horry (y2 state 45, county 051) from other counties; summed by origin state (y1_state).
Codes 96-98 are totals, 57/58/59 are 'other' summary rows; they are skipped and reported separately.
n1 = returns (households), n2 = exemptions (people). Run: python3 -I horry_inflow_states.py raw/countyinflow2223-horry.csv (Horry rows of https://www.irs.gov/pub/irs-soi/countyinflow2223.csv) > horry-inflow-2223.json"""
import csv, sys, json, collections
f = sys.argv[1]
by = collections.Counter(); byp = collections.Counter(); totals = {}
for r in csv.DictReader(open(f, encoding="latin-1")):
    if r["y2_statefips"] != "45" or r["y2_countyfips"] != "051": continue
    s1 = int(r["y1_statefips"])
    if s1 >= 57:
        totals[r["y1_countyname"]] = {"returns": int(r["n1"]), "people": int(r["n2"])}; continue
    if s1 == 45 and r["y1_countyfips"] == "051": continue  # non-movers
    by[r["y1_state"]] += int(r["n1"]); byp[r["y1_state"]] += int(r["n2"])
tot_named = sum(by.values())
out = {"file": f, "summary_rows": totals, "sum_of_named_county_rows_returns": tot_named,
       "by_state": [{"state": s, "returns": n, "people": byp[s], "share_of_named": round(100 * n / tot_named, 1)} for s, n in by.most_common(15)]}
print(json.dumps(out, indent=1))
