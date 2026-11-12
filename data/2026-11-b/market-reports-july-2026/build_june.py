"""Build june.json for /market-reports/july-2026/ from ccar-2026-06.json (parse_june.py), the CCAR
three-year June bars (transcribed below and checked against the PDF text), the Census permit files
and the map API counts. Usage: RAW=<scratch> python3 -I build_june.py <datadir>
RAW holds: Coastal-Carolinas_MMI_2026-06.pdf, cbsa2505c.txt cbsa2605c.txt cbsa2505y.txt cbsa2605y.txt
cbsa2506c.txt cbsa2606c.txt cbsa2506y.txt cbsa2606y.txt from
https://www2.census.gov/econ/bps/CBSA%20(beginning%20Jan%202024)/ (read 2026-11-10)."""
import sys, os, re, json, subprocess, csv, io
D = sys.argv[1]; RAW = os.environ["RAW"]
c = json.load(open(os.path.join(D, "ccar-2026-06.json")))
t = subprocess.run(["pdftotext", "-layout", os.path.join(RAW, "Coastal-Carolinas_MMI_2026-06.pdf"), "-"], capture_output=True, text=True, check=True).stdout
pages = {p.strip().split("\n")[0].strip(): p for p in t.split("\f") if p.strip()}
# Three-year bars, June only (2024, 2025, 2026), as printed on each metric page; YTD where printed.
BARS = {
 "Pending Sales": {"jun": {"single_family": [941, 982, 1060], "condo": [429, 400, 486]}, "ytd": {"single_family": [5844, 5845, 6019], "condo": [2836, 2561, 2834]}},
 "Closed Sales": {"jun": {"single_family": [955, 1056, 1127], "condo": [441, 452, 498]}, "ytd": {"single_family": [5310, 5295, 5422], "condo": [2644, 2434, 2584]}},
 "Days on Market Until Sale": {"jun": {"single_family": [112, 123, 121], "condo": [102, 132, 137]}, "ytd": {"single_family": [120, 125, 125], "condo": [103, 128, 133]}},
 "Median Sales Price": {"jun": {"single_family": [365000, 365000, 359945], "condo": [250000, 239500, 244270]}, "ytd": {"single_family": [363000, 362584, 359843], "condo": [250000, 240000, 232500]}},
 "Percent of List Price Received": {"jun": {"single_family": [97.4, 97.5, 97.3], "condo": [96.8, 96.5, 96.2]}, "ytd": {"single_family": [97.4, 97.3, 97.3], "condo": [96.7, 96.0, 95.9]}},
 "Inventory of Homes for Sale": {"jun": {"single_family": [3342, 4163, 4023], "condo": [2804, 3274, 3294]}},
 "Months Supply of Inventory": {"jun": {"single_family": [3.8, 4.6, 4.3], "condo": [6.2, 8.2, 7.6]}},
}
def fmt(m, v):
    if m == "Median Sales Price": return "${:,}".format(int(v))
    if m == "Percent of List Price Received": return "{:.1f}%".format(v)
    if isinstance(v, float): return "{:.1f}".format(v)
    return "{:,}".format(v)
for m, b in BARS.items():
    p = pages[m]
    for per, segs in b.items():
        for seg, vals in segs.items():
            for v in vals: assert fmt(m, v) in p, (m, per, seg, v)
            o = c["overview"][seg][m]
            k = ("jun_2025", "jun_2026") if per == "jun" else ("ytd_2025", "ytd_2026")
            assert abs(o[k[0]] - vals[1]) < 1e-6 and abs(o[k[1]] - vals[2]) < 1e-6, (m, per, seg, o, vals)
# Census permits, Myrtle Beach-Conway-North Myrtle Beach CBSA 34820, units = 1 + 2 + 3-4 + 5+ units
def units(f):
    for line in open(os.path.join(RAW, f), encoding="latin-1"):
        if ",34820," in line:
            r = next(csv.reader(io.StringIO(line)))
            return sum(int(r[i]) for i in (6, 9, 12, 15)), r
    raise SystemExit(f + ": no CBSA 34820")
perm = {}
for k, f in (("may_2025", "cbsa2505c.txt"), ("may_2026", "cbsa2605c.txt"), ("ytd_may_2025", "cbsa2505y.txt"), ("ytd_may_2026", "cbsa2605y.txt"),
             ("jun_2025", "cbsa2506c.txt"), ("jun_2026", "cbsa2606c.txt"), ("ytd_jun_2025", "cbsa2506y.txt"), ("ytd_jun_2026", "cbsa2606y.txt")):
    perm[k] = units(f)[0]
pct = lambda a, b: round((b - a) / a * 100, 1)
perm["may_change_pct"] = pct(perm["may_2025"], perm["may_2026"]); perm["ytd_may_change_pct"] = pct(perm["ytd_may_2025"], perm["ytd_may_2026"])
perm["jun_change_pct"] = pct(perm["jun_2025"], perm["jun_2026"]); perm["ytd_jun_change_pct"] = pct(perm["ytd_jun_2025"], perm["ytd_jun_2026"])
perm["note"] = "Units authorized, all building sizes, CBSA 34820, Myrtle Beach-Conway-North Myrtle Beach SC metro. c = the month, y = year to date. Census files as read 2026-11-10."
# The 12-month series (Jul 2025 to Jun 2026) for the charts
mon = c["monthly"]
series = {m: [{"month": r["month"], "single_family": r["single_family"], "condo": r["condo"], "sf_chg": r["sf_chg"], "condo_chg": r["condo_chg"]} for r in mon[m]]
          for m in ("Median Sales Price", "Closed Sales", "Pending Sales", "Inventory of Homes for Sale", "Months Supply of Inventory")}
# derived findings
cs = mon["Closed Sales"]; mx = max(cs, key=lambda r: r["single_family"])
inv = mon["Inventory of Homes for Sale"]
neg = [r["month"] for r in inv if r["sf_chg"].startswith("-")]
derived = {
 "sf_closed_jun_2026_is_12mo_high": mx["month"] == "Jun-2026", "sf_closed_12mo_max": mx,
 "sf_inventory_yoy_negative_months": neg,
 "condo_pending_jun_three_year_high": BARS["Pending Sales"]["jun"]["condo"][2] == max(BARS["Pending Sales"]["jun"]["condo"]),
 "sf_inventory_jun_growth_pct": {"2024": "+27.1%", "2025": "+24.6%", "2026": "-3.4%", "printed_on": "MI p. 12"},
 "condo_inventory_jun_growth_pct": {"2024": "+81.8%", "2025": "+16.8%", "2026": "+0.6%"},
}
assert derived["sf_closed_jun_2026_is_12mo_high"] and neg == ["May-2026", "Jun-2026"] and derived["condo_pending_jun_three_year_high"]
for s, l in (("+27.1%", "+24.6%"), ("+81.8%", "+16.8%")):
    assert s.replace("+", "+ ") in pages["Inventory of Homes for Sale"] and l.replace("+", "+ ") in pages["Inventory of Homes for Sale"]
# areas, June and Jan-Jun, houses and condos, with sales counts
areas = {}
for a, v in c["areas"].items():
    areas[a] = {"zips": v["zips"]}
    for seg in ("single_family", "condo"):
        areas[a][seg] = {"median_jun": v[seg]["Median Sales Price"]["jun_2026"], "median_ytd_2025": v[seg]["Median Sales Price"]["ytd_2025"],
                         "median_ytd_2026": v[seg]["Median Sales Price"]["ytd_2026"], "sales_jun": v[seg]["Closed Sales"]["jun_2026"],
                         "sales_ytd_2026": v[seg]["Closed Sales"]["ytd_2026"]}
api = json.load(open(os.path.join(D, "raw", "api-counts-2026-11-10.json")))
out = {"meta": {"made": "build_june.py", "data_month": "2026-06", "data_month_name": "June 2026", "ccar_current_as_of": "2026-07-10",
                "ccar_files": c["meta"]["files"], "ccar_urls": c["meta"]["urls"],
                "permits_source": "https://www2.census.gov/econ/bps/CBSA%20(beginning%20Jan%202024)/", "read": "2026-11-10"},
       "overview": c["overview"], "closed_sales_change_all": c["quick_facts_closed_sales_change"]["all"],
       "national_from_ccar_p1": {"nar_median_existing_jun_2026": 429300, "quote": "the median existing-home price climbing to $429,300 nationwide, an all-time high for the month and 1.3% higher than a year earlier"},
       "three_years": BARS, "monthly": series, "derived": derived, "permits": perm, "areas": areas, "api_counts": api}
assert "$429,300" in t and "all-time high for the month" in t
json.dump(out, open(os.path.join(D, "june.json"), "w"), indent=1)
print(json.dumps({"permits": perm, "derived": derived}, indent=1))
