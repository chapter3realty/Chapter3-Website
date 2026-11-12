"""Parse CCAR's June 2026 reports into ccar-2026-06.json, for /market-reports/july-2026/.
Inputs (RAW, a scratch folder outside the repo; the PDFs are (c) ShowingTime Plus):
  Coastal-Carolinas_MMI_2026-06.pdf = https://www.ccarsc.org/clientuploads/2026_Market_Stats/Coastal-Carolinas_MMI_2026-06.pdf
  July_2026_All_Cities.pdf          = https://www.ccarsc.org/clientuploads/2026_Market_Stats/July_2026_All_Cities.pdf
Footer of both: "Current as of July 10, 2026". Read 2026-11-10.
Needs pdftotext (poppler). Usage: RAW=<scratch> python3 -I parse_june.py <datadir>
Adapted from data/2026-11-b/sell/parse_ccar.py (same report format)."""
import sys, os, re, json, subprocess, hashlib
D = sys.argv[1]
RAW = os.environ["RAW"]
MI, LU = "Coastal-Carolinas_MMI_2026-06.pdf", "July_2026_All_Cities.pdf"
EXPECT = {MI: "c6c6d0732351863cf9f312cbd0999f369df338b51d54bf0544c892c1f7c93419",
          LU: "205af1318f3b82f2978458c3bca2cfc7ec99a7f1ffd4595612983c63f51318dd"}
def txt(f): return subprocess.run(["pdftotext", "-layout", os.path.join(RAW, f), "-"], capture_output=True, text=True, check=True).stdout
def sha(f): return hashlib.sha256(open(os.path.join(RAW, f), "rb").read()).hexdigest()
for f, h in EXPECT.items():
    assert sha(f) == h, f + " changed"
def num(s):
    s = s.strip().replace("$", "").replace(",", "").replace("%", "").replace(" ", "")
    return None if s in ("", "––", "--") else float(s)
out = {"meta": {"made": "parse_june.py", "data_month": "2026-06", "current_as_of": "2026-07-10", "read": "2026-11-10",
                "files": EXPECT,
                "urls": {MI: "https://www.ccarsc.org/clientuploads/2026_Market_Stats/" + MI, LU: "https://www.ccarsc.org/clientuploads/2026_Market_Stats/" + LU}}}
t = txt(MI)
assert "Current as of July 10, 2026" in t and "June 2026" in t
METRICS = ["New Listings", "Pending Sales", "Closed Sales", "Days on Market Until Sale", "Median Sales Price", "Average Sales Price",
           "Percent of List Price Received", "Housing Affordability Index", "Inventory of Homes for Sale", "Months Supply of Inventory"]
V = r"(\$?[\d,]+(?:\.\d+)?%?|––)"; C = r"([+-]\s?[\d.]+%|0\.0%|––)"
over = {}
for seg, start, end in (("single_family", "Single Family Market Overview\nKey", "Condo Market Overview\nKey"), ("condo", "Condo Market Overview\nKey", "New Listings\nA count")):
    i = t.index(start); j = t.index(end, i) if end in t[i:] else len(t); blk = t[i:j]; over[seg] = {}
    for m in METRICS:
        mm = re.search(re.escape(m) + r"\s+" + V + r"\s+" + V + r"\s+" + C + r"(?:\s+" + V + r"\s+" + V + r"\s+" + C + r")?", blk)
        if mm: over[seg][m] = {"jun_2025": num(mm[1]), "jun_2026": num(mm[2]), "chg": mm[3].replace(" ", ""),
                               "ytd_2025": num(mm[4]) if mm[4] else None, "ytd_2026": num(mm[5]) if mm[5] else None, "ytd_chg": mm[6].replace(" ", "") if mm[6] else None}
out["overview"] = over
# Quick facts: all properties
q = re.search(r"([+-] [\d.]+%)\s+([+-] [\d.]+%)\s+([+-] [\d.]+%)", t)
out["quick_facts_closed_sales_change"] = {"all": q[1].replace(" ", ""), "single_family": q[2].replace(" ", ""), "condo": q[3].replace(" ", "")}
# monthly series (Jul-2025 .. Jun-2026)
MON = r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-20\d\d)\s+" + V + r"\s+" + C + r"\s+" + V + r"\s+" + C
series = {}
for p in t.split("\f"):
    head = p.strip().split("\n")[0].strip()
    if head in METRICS:
        rows = re.findall(MON, p)
        if rows: series[head] = [{"month": r[0], "single_family": num(r[1]), "sf_chg": r[2].replace(" ", ""), "condo": num(r[3]), "condo_chg": r[4].replace(" ", "")} for r in rows]
out["monthly"] = series
# three-year bars on each metric page: "June" and "Year to Date" for 2024, 2025, 2026 are printed as value lines
t2 = txt(LU); areas = {}
assert "Local Market Update – June 2026" in t2 and "Current as of July 10, 2026" in t2
for p in t2.split("\f"):
    if "Local Market Update" not in p: continue
    lines = [l.strip() for l in p.split("\n") if l.strip()]
    name = lines[2] if lines[1].startswith("A Research Tool") else lines[1]
    zips = next((l for l in lines if l.startswith("ZIP Code") or l.startswith("Area:")), "")
    a = {"zips": zips.replace("ZIP Codes:", "").replace("ZIP Code:", "").strip()}
    for seg, key in (("Single Family Properties", "single_family"), ("Townhouse/Condo", "condo")):
        i = p.index(seg); blk = p[i:i + 2200]; a[key] = {}
        for m in ["New Listings", "Closed Sales", "Median Sales Price*", "Percent of List Price Received*", "Days on Market Until Sale", "Inventory of Homes for Sale"]:
            mm = re.search(re.escape(m) + r"\s+" + V + r"\s+" + V + r"\s+" + C + r"\s+" + V + r"\s+" + V + r"\s+" + C, blk)
            if mm: a[key][m.rstrip("*")] = {"jun_2025": num(mm[1]), "jun_2026": num(mm[2]), "ytd_2025": num(mm[4]), "ytd_2026": num(mm[5])}
    areas[name] = a
out["areas"] = areas
json.dump(out, open(os.path.join(D, "ccar-2026-06.json"), "w"), indent=1)
print(json.dumps(over, indent=0)[:4000]); print(list(series)); print(list(areas))
