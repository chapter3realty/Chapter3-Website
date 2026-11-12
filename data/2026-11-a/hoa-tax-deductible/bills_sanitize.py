"""Turn the three 2026 Horry County Treasurer bills read with
data/2026-11-a/buyers-relocating-which-town/bill.py into one file with no PIN, owner, unit or building name.
Run: python3 -I bills_sanitize.py <dir with bill-*.txt> <datadir>. Writes <datadir>/raw/bills-2026.json."""
import sys, re, json, glob
src, D = sys.argv[1], sys.argv[2]
out = {"source": "Horry County Treasurer, public tax search, https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx, read 2026-11-04",
       "why": "One condo unit per case, chosen as the median-assessed unit of its group in county parcel layer 24 (build_findings.py names the group).",
       "bills": []}
def g(t, k, pat=r"([\d,\.]+)"):
    m = re.search(re.escape(k) + r"\s*\$?" + pat, t); return m.group(1) if m else None
for f in sorted(glob.glob(src + "/bill-*.txt")):
    t = open(f).read(); t = t[t.find("Tax Year"):]
    ratio = re.search(r"Building Appraisal:\s*(\d)%", t)
    b = {"tax_year": g(t, "Tax Year:"), "district_levy": g(t, "District/Levy:", r"([\d]+ / [\d\.]+)"), "city_levy": g(t, "City/Levy:", r"(\w+ / [\d\.]+)"),
         "ratio_pct": ratio.group(1) if ratio else None, "appraisal": g(t, "Total Appraisal:"), "assessed": g(t, "Total Assessed:"),
         "county_tax": g(t, "County Tax:"), "city_tax": g(t, "City Tax:"), "fees": g(t, "Fees:"), "residential_exemption": g(t, "Residential Exemption:"),
         "homestead_exemption": g(t, "Homestead Exemption:"), "local_option_credit": g(t, "Local Option Credit:"), "total_taxes": g(t, "Total Taxes:")}
    num = lambda s: float(s.replace(",", "")) if s else 0.0
    lev = float(b["district_levy"].split("/")[1]) + float(b["city_levy"].split("/")[1])
    gross = round(num(b["assessed"]) * lev / 1000, 2)
    b["check"] = f"{b['assessed']} x {lev/1000:.4f} = {gross:,.2f} - {b['residential_exemption']} - {b['local_option_credit']} + {b['fees']} = {gross - num(b['residential_exemption']) - num(b['local_option_credit']) + num(b['fees']):,.2f} (bill: {b['total_taxes']})"
    out["bills"].append(b)
json.dump(out, open(D + "/raw/bills-2026.json", "w"), indent=1)
for b in out["bills"]: print(b["district_levy"], b["ratio_pct"], b["total_taxes"], b["check"])
