"""HUD fair market rents for Horry County, every fiscal year in HUD's history file.
Source: https://www.huduser.gov/portal/datasets/FMR/FMR_All_1983_2027.csv (linked from https://www.huduser.gov/portal/datasets/fmr.html,
"FMR History"), saved outside the repo; raw/hud/FMR_All_1983_2027-horry.csv is its header and the Horry County row. Row: state 45, county 051 (Horry County).
Columns fmrYY_0..4 are the studio to four-bedroom FMRs for fiscal year 20YY. Run: python3 -I build_fmr.py <datadir>. Writes fmr-history.json."""
import csv, json, os, re, sys
D = sys.argv[1]
with open(os.path.join(D, "raw", "hud", "FMR_All_1983_2027-horry.csv"), newline="", encoding="latin-1") as f:
    r = next(x for x in csv.DictReader(f) if x["state"] == "45" and x["county"] == "051")
years = {}
for k, v in r.items():
    m = re.fullmatch(r"fmr(\d\d)_([0-4])", k)
    if m and v not in ("", None):
        yy = int(m.group(1)); fy = 2000 + yy if yy < 83 else 1900 + yy
        years.setdefault(fy, {})[m.group(2)] = int(float(v))
years = dict(sorted(years.items()))
out = {"source": "HUD FMR history, https://www.huduser.gov/portal/datasets/FMR/FMR_All_1983_2027.csv", "area": r["areaname27"], "county": r["name"],
       "fiscal_years": years}
def pct(a, b): return round(100 * (b / a - 1), 1)
for b in "234":
    out[f"change_{b}br"] = {f"FY{s}-FY2027": pct(years[s][b], years[2027][b]) for s in (2016, 2020, 2022, 2023, 2026) if s in years and b in years[s]}
json.dump(out, open(os.path.join(D, "fmr-history.json"), "w"), indent=1)
for y in range(2014, 2028): print(y, years.get(y))
print({k: v for k, v in out.items() if k.startswith("change")})
