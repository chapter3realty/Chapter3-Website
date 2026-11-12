"""Build market.json for /market-reports/ (batch 2026-11-b) from CCAR's September 2026 Monthly Indicators.
Input: RAW/October_2026_Monthly_Market_Report.pdf = https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf
(linked from https://www.ccarsc.org/pages/marketstats/ as "October 2026 Market Report"; data month September 2026;
footer "Current as of October 10, 2026"). The PDF is (c) ShowingTime Plus and stays outside the repo.
Reuses data/2026-11-b/sell/ccar-2026-09.json (the seller hub's parse of the same file, same sha256) for the
overview and the 12 monthly series. Adds: the three-year bars (September and January to September, 2024 to 2026)
read from pages 5 to 8, 12 and 13 by column position. Needs pdftotext (poppler).
Usage: RAW=<scratch> python3 -I build_market.py <this dir> <site root>"""
import sys, os, re, json, subprocess, hashlib, statistics
D, SITE = sys.argv[1], sys.argv[2]
RAW = os.environ["RAW"]
PDF = os.path.join(RAW, "October_2026_Monthly_Market_Report.pdf")
SHA = "1c71eff81a5004f7dff14af0db6afecf54becde0255f5e1420829ca90d497af5"
got = hashlib.sha256(open(PDF, "rb").read()).hexdigest()
assert got == SHA, f"CCAR file changed: {got}. A new month is out; re-read it before building."
SELL = json.load(open(os.path.join(SITE, "data/2026-11-b/sell/ccar-2026-09.json")))
assert SELL["meta"]["files"]["ccar-monthly-indicators-2026-09.pdf"] == SHA
pages = subprocess.run(["pdftotext", "-layout", PDF, "-"], capture_output=True, text=True, check=True).stdout.split("\f")
assert "Current as of October 10, 2026" in pages[1]

NUM = re.compile(r"\$?\d[\d,]*(?:\.\d+)?")
PCT = re.compile(r"[+-]\s?\d+\.\d%|0\.0%")
def bars(head):
    """Return {segment: {period: {year: value}}} for one metric page's three-year bars."""
    p = next(p for p in pages if p.strip().split("\n")[0].strip() == head)
    lines = p.split("\n")
    yi = next(i for i, l in enumerate(lines) if re.match(r"\s*2024\s+2025\s+2026", l))
    pl = lines[yi - 1][:155]
    cols = [((m.start() + m.end()) / 2) for m in PCT.finditer(pl)]
    assert len(cols) in (6, 12), (head, len(cols))
    start = next(i for i, l in enumerate(lines) if l.strip().startswith("September"))
    vals = {c: [] for c in range(len(cols))}
    for l in lines[start + 1: yi - 1]:
        l = l[:155]  # the monthly table sits to the right
        for m in NUM.finditer(l):
            x = (m.start() + m.end()) / 2
            c = min(range(len(cols)), key=lambda k: abs(cols[k] - x))
            if abs(cols[c] - x) < 8: vals[c].append(float(m.group().replace("$", "").replace(",", "")))
    out = {}
    order = (["single_family"] * 3 + ["condo"] * 3) if len(cols) == 6 else (["single_family"] * 3 + ["condo"] * 3) * 2
    for c in range(len(cols)):
        assert len(vals[c]) == 1, (head, c, vals[c])
        period = "september" if c < 6 else "jan_to_sep"
        out.setdefault(order[c], {}).setdefault(period, {})[str(2024 + c % 3)] = vals[c][0]
    return out

M = {}
for head, key in (("Pending Sales", "accepted_offers"), ("Closed Sales", "closed_sales"), ("Days on Market Until Sale", "days_to_offer"),
                  ("Median Sales Price", "median_price"), ("Inventory of Homes for Sale", "for_sale"), ("Months Supply of Inventory", "months_supply")):
    M[key] = bars(head)

# checks against the seller hub's verified parse (2025 and 2026 cells must agree)
OV = SELL["overview"]
for seg in ("single_family", "condo"):
    assert M["median_price"][seg]["september"]["2026"] == OV[seg]["Median Sales Price"]["sep_2026"]
    assert M["median_price"][seg]["jan_to_sep"]["2025"] == OV[seg]["Median Sales Price"]["ytd_2025"]
    assert M["months_supply"][seg]["september"]["2026"] == OV[seg]["Months Supply of Inventory"]["sep_2026"]
    assert M["for_sale"][seg]["september"]["2025"] == OV[seg]["Inventory of Homes for Sale"]["sep_2025"]
    assert M["closed_sales"][seg]["jan_to_sep"]["2026"] == OV[seg]["Closed Sales"]["ytd_2026"]
    assert M["accepted_offers"][seg]["jan_to_sep"]["2026"] == OV[seg]["Pending Sales"]["ytd_2026"]

def series(name):
    return [{"month": r["month"], "house": r["single_family"], "condo": r["condo"]} for r in SELL["monthly"][name]]
monthly = {"median_price": series("Median Sales Price"), "months_supply": series("Months Supply of Inventory"),
           "days_to_offer": series("Days on Market Until Sale"), "for_sale": series("Inventory of Homes for Sale")}
def rng(s, k):
    lo = min(s, key=lambda r: r[k]); hi = max(s, key=lambda r: r[k])
    return {"low": lo[k], "low_month": lo["month"], "high": hi[k], "high_month": hi["month"]}

ytd = M["median_price"]
now = {}
for seg, out in (("single_family", "house"), ("condo", "condo")):
    o = OV[seg]
    now[out] = {"median_sep": o["Median Sales Price"]["sep_2026"], "median_ytd": o["Median Sales Price"]["ytd_2026"],
                "median_ytd_change_pct": round(100 * (o["Median Sales Price"]["ytd_2026"] / o["Median Sales Price"]["ytd_2025"] - 1), 1),
                "days_to_offer_sep": o["Days on Market Until Sale"]["sep_2026"], "days_to_offer_ytd": o["Days on Market Until Sale"]["ytd_2026"],
                "pct_of_list_sep": o["Percent of List Price Received"]["sep_2026"], "pct_of_list_ytd": o["Percent of List Price Received"]["ytd_2026"],
                "months_supply_sep": o["Months Supply of Inventory"]["sep_2026"], "for_sale_sep": o["Inventory of Homes for Sale"]["sep_2026"],
                "closed_ytd": o["Closed Sales"]["ytd_2026"], "accepted_offers_ytd": o["Pending Sales"]["ytd_2026"],
                "new_listings_ytd": o["New Listings"]["ytd_2026"], "new_listings_ytd_2025": o["New Listings"]["ytd_2025"]}
derived = {
    "condo_median_ytd_2024_to_2026_pct": round(100 * (ytd["condo"]["jan_to_sep"]["2026"] / ytd["condo"]["jan_to_sep"]["2024"] - 1), 1),
    "house_median_ytd_2024_to_2026_pct": round(100 * (ytd["single_family"]["jan_to_sep"]["2026"] / ytd["single_family"]["jan_to_sep"]["2024"] - 1), 1),
    "condo_accepted_offers_ytd_most_of_three_years": M["accepted_offers"]["condo"]["jan_to_sep"]["2026"] == max(M["accepted_offers"]["condo"]["jan_to_sep"].values()),
    "monthly_median_range": {"house": rng(monthly["median_price"], "house"), "condo": rng(monthly["median_price"], "condo")},
    "monthly_supply_range": {"house": rng(monthly["months_supply"], "house"), "condo": rng(monthly["months_supply"], "condo")},
    "monthly_days_range": {"house": rng(monthly["days_to_offer"], "house"), "condo": rng(monthly["days_to_offer"], "condo")},
}
out = {"meta": {"made": "build_market.py", "source": "CCAR Monthly Indicators, September 2026 (file 'October 2026 Market Report')",
                "url": "https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf",
                "listed_on": "https://www.ccarsc.org/pages/marketstats/", "sha256": SHA, "data_month": "2026-09", "current_as_of": "2026-10-10",
                "scope": "Sales through the CCAR MLS (Horry and Georgetown Counties). single_family/house = CCAR 'Single-Family'; condo = CCAR 'Condo'.",
                "definitions": SELL["meta"]["definitions"],
                "ledger": "Blog-Brain batches/2026-11-b/market-reports/facts.md"},
       "now": now, "three_years": M, "monthly": monthly, "derived": derived}
json.dump(out, open(os.path.join(D, "market.json"), "w"), indent=1)
print(json.dumps({"three_years": M, "derived": derived}, indent=1))
