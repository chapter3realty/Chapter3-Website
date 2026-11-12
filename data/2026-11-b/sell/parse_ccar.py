"""Parse CCAR's September 2026 reports (published as the "October 2026" files) into ccar-2026-09.json.
Inputs (RAW, default raw/): ccar-monthly-indicators-2026-09.pdf  = https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf
               ccar-local-updates-2026-09.pdf      = https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_All_Cities.pdf
Both linked from https://www.ccarsc.org/pages/marketstats/ ; footer "Current as of October 10, 2026".
Needs pdftotext (poppler). Usage: RAW=<scratch> python3 -I parse_ccar.py <datadir>"""
import sys, os, re, json, subprocess, hashlib
D = sys.argv[1]
RAW = os.environ.get("RAW", os.path.join(D, "raw"))  # the PDFs are (c) ShowingTime Plus; kept outside the repo
def txt(f): return subprocess.run(["pdftotext", "-layout", os.path.join(RAW, f), "-"], capture_output=True, text=True, check=True).stdout
def sha(f): return hashlib.sha256(open(os.path.join(RAW, f), "rb").read()).hexdigest()
def num(s):
    s = s.strip().replace("$", "").replace(",", "").replace("%", "")
    return None if s in ("", "––", "--") else float(s)
MI, LU = "ccar-monthly-indicators-2026-09.pdf", "ccar-local-updates-2026-09.pdf"
out = {"meta": {"made": "parse_ccar.py", "data_month": "2026-09", "current_as_of": "2026-10-10",
                "files": {MI: sha(MI), LU: sha(LU)},
                "definitions": {"days_on_market": "Average number of days between when a property is listed and when an offer is accepted in a given month (MI p. 7).",
                                "pct_of_list": "Sales price divided by the most recent list price, averaged over properties sold in the month, not accounting for seller concessions (MI p. 10).",
                                "pending_sales": "A count of the properties on which offers have been accepted in a given month (MI p. 5).",
                                "months_supply": "The inventory of homes for sale at the end of a given month, divided by the average monthly pending sales from the last 12 months (MI p. 13).",
                                "area": "CCAR Local Market Update areas (one or more ZIP codes each), CCAR MLS, Georgetown and Horry Counties."}}}
t = txt(MI)
# overview tables, p. 2 single-family and p. 3 condo
METRICS = ["New Listings", "Pending Sales", "Closed Sales", "Days on Market Until Sale", "Median Sales Price", "Average Sales Price",
           "Percent of List Price Received", "Housing Affordability Index", "Inventory of Homes for Sale", "Months Supply of Inventory"]
V = r"(\$?[\d,]+(?:\.\d+)?%?|––)"; C = r"([+-]\s?[\d.]+%|0\.0%|––)"
over = {}
for seg, start, end in (("single_family", "Single Family Market Overview\nKey", "Condo Market Overview\nKey"), ("condo", "Condo Market Overview\nKey", "New Listings\nA count")):
    i = t.index(start); j = t.index(end, i) if end in t[i:] else len(t); blk = t[i:j]; over[seg] = {}
    for m in METRICS:
        mm = re.search(re.escape(m) + r"\s+" + V + r"\s+" + V + r"\s+" + C + r"(?:\s+" + V + r"\s+" + V + r"\s+" + C + r")?", blk)
        if mm: over[seg][m] = {"sep_2025": num(mm[1]), "sep_2026": num(mm[2]), "ytd_2025": num(mm[4]) if mm[4] else None, "ytd_2026": num(mm[5]) if mm[5] else None}
out["overview"] = over
# monthly series (Oct-2025 .. Sep-2026) for each metric page
MON = r"((?:Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep)-20\d\d)\s+" + V + r"\s+" + C + r"\s+" + V + r"\s+" + C
pages = t.split("\f"); series = {}
for p in pages:
    head = p.strip().split("\n")[0].strip()
    if head in METRICS:
        rows = re.findall(MON, p)
        if rows: series[head] = [{"month": r[0], "single_family": num(r[1]), "condo": num(r[3])} for r in rows]
out["monthly"] = series
# local market updates by area
t2 = txt(LU); areas = {}
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
            if mm: a[key][m.rstrip("*")] = {"sep_2025": num(mm[1]), "sep_2026": num(mm[2]), "ytd_2025": num(mm[4]), "ytd_2026": num(mm[5])}
    areas[name] = a
out["areas"] = areas
json.dump(out, open(os.path.join(D, "ccar-2026-09.json"), "w"), indent=1)
print(json.dumps({k: (list(v) if isinstance(v, dict) else v) for k, v in out.items() if k != "meta"}, indent=0)[:3000])
