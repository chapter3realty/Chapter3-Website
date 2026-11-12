"""Findings for /hoa/tax-deductible/ (batch 2026-11-a). Every number the page states comes from the files this writes.
Inputs (reused, not pulled again):
  ../invest-condos/findings.json            Horry County condo units, share at the 4 percent ratio, mailing state (county parcel layer 24, read 2026-11-02)
  ../invest-condos/listings.json            condos for sale in Horry County, CRM map API in aggregate (2026-11-02): median dues, rental flags
  ../buyers-cost-to-own/hoa-by-area.json    median condo dues by ZIP area, CRM map API in aggregate (2026-11-02)
  includes.json                             what condo dues include, Horry County condos for sale (pull_includes.py, 2026-11-04)
  raw/bills-2026.json                       three 2026 condo tax bills, no PIN (bills_sanitize.py)
  RAW condo-parcels.json (scratch, kept out of the repo: PINs)  every condo unit parcel, layer 24 (invest-condos/fetch_condo_parcels.py)
Run: RAW=<path to condo-parcels.json> python3 -I build_findings.py <datadir>"""
import json, os, sys, statistics as S
D = sys.argv[1]; up = lambda p: json.load(open(os.path.join(D, p)))
cf = up("../invest-condos/findings.json"); cl = up("../invest-condos/listings.json")
area = up("../buyers-cost-to-own/hoa-by-area.json")
bills = up("raw/bills-2026.json")["bills"]
F = {"made": "build_findings.py", "inputs": ["../invest-condos/findings.json", "../invest-condos/listings.json", "../buyers-cost-to-own/hoa-by-area.json",
     "includes.json", "raw/bills-2026.json", "RAW condo-parcels.json (layer 24, read 2026-11-02)"]}
st = cf["stock"]
F["condo_stock"] = {"units": st["units"], "units_4pct": st["units_4pct"], "pct_4pct": st["pct_4pct"], "pct_not_main_home": round(100 - st["pct_4pct"], 1),
    "pct_mailing_outside_sc": st["pct_mailing_outside_sc"],
    "by_area_pct_4pct": {k: v["pct_4pct"] for k, v in st["by_area"].items()}, "by_area_units": {k: v["units"] for k, v in st["by_area"].items()}}
g = cl["groups"]["condos"]; o = cl["groups"]["oceanfront_building"]
F["listings"] = {"condos_for_sale": g["listings"], "median_dues_month": g["median_dues_25"], "str_allowed": g["flags"]["str_allowed"],
    "rentals_allowed": g["flags"]["rentals_allowed"], "vacation_rental_program": g["flags"]["vacation_rental_program"],
    "pct_str_allowed": round(100 * g["flags"]["str_allowed"] / g["listings"], 1), "pct_rentals_allowed": round(100 * g["flags"]["rentals_allowed"] / g["listings"], 1),
    "oceanfront_listings": o["listings"], "oceanfront_median_dues_month": o["median_dues_25"]}
iz = up("includes.json")  # pull_includes.py, Horry County condos for sale, one pull
F["dues_include"] = {"pulled": iz["pulled"], **iz["groups"]}
rows = []
for z, a in area["areas"].items():
    m = a["condo"].get("median")
    if m is None or a["condo"]["listings"] < 50: continue
    rows.append({"zip": z, "name": a["name"], "listings": a["condo"]["listings"], "median_month": m, "q1": a["condo"]["q1"], "q3": a["condo"]["q3"], "rented_all_year_deductible": m * 12})
rows.sort(key=lambda r: -r["median_month"])
json.dump({"title": "Median monthly condo dues by ZIP area, and the yearly amount a full-year rental deducts", "source": "../buyers-cost-to-own/hoa-by-area.json (pulled " + area["pulled"][:10] + ")",
           "rule": "Condos for sale, ZIP areas with 50 or more listings. Deductible = median x 12 (no personal use, IRS Pub. 527 ch. 4).", "rows": rows},
          open(D + "/chart-dues-by-zip.json", "w"), indent=1)
F["dues_by_zip"] = rows
# Property tax on a condo: the median-assessed unit of each group, and its real 2026 bill
RAW = os.environ.get("RAW")
P = {}
if RAW:
    pr = json.load(open(RAW))["rows"]
    for dist, label in (("880", "City of Myrtle Beach, tax district 880"), ("550", "North Myrtle Beach, tax district 550")):
        for cls in ("6", "4"):
            u = [r for r in pr if r["TaxDistrict"] == dist and r["TaxableProp"] and ((r["AssessedProp"] >= r["TaxableProp"] * 0.05) == (cls == "6"))]
            u.sort(key=lambda r: r["AssessedProp"]); m = u[len(u) // 2]
            P[dist + "_" + cls] = {"label": label, "ratio_pct": cls, "units": len(u), "median_assessed": S.median(r["AssessedProp"] for r in u),
                                   "median_taxable": S.median(r["TaxableProp"] for r in u), "median_unit_assessed": m["AssessedProp"], "median_unit_taxable": m["TaxableProp"]}
F["condo_tax_groups"] = P
num = lambda s: float(s.replace(",", ""))
B = {}
for b in bills:
    B[b["district_levy"].split()[0] + "_" + b["ratio_pct"]] = {"assessed": num(b["assessed"]), "appraisal": num(b["appraisal"]), "total_taxes": num(b["total_taxes"])}
F["bills"] = B
mb = next(r for r in rows if r["zip"] == "29577"); nmb = next(r for r in rows if r["zip"] == "29582")
cmp = {"title": "A year of condo dues against a year of property tax",
       "rows": [{"case": "Myrtle Beach condo, rented (6 percent)", "dues_year": mb["median_month"] * 12, "tax_year": B["880_6"]["total_taxes"]},
                {"case": "Myrtle Beach condo, owner's main home (4 percent)", "dues_year": mb["median_month"] * 12, "tax_year": B["880_4"]["total_taxes"]},
                {"case": "North Myrtle Beach condo, rented (6 percent)", "dues_year": nmb["median_month"] * 12, "tax_year": B["550_6"]["total_taxes"]}],
       "rule": "Dues: median monthly dues of condos for sale in ZIP 29577 (Myrtle Beach) or 29582 (North Myrtle Beach) x 12. Tax: the 2026 bill of the median-assessed condo unit in tax district 880 or 550 at that ratio."}
for r in cmp["rows"]: r["ratio"] = round(r["dues_year"] / r["tax_year"], 1)
json.dump(cmp, open(D + "/chart-dues-vs-tax.json", "w"), indent=1); F["dues_vs_tax"] = cmp
# Worked example on the county median condo dues
dues = g["median_dues_25"] * 12
def case(name, rented, personal, note):
    if rented == 0: share = 0.0
    elif personal == 0: share = 1.0
    else: share = rented / (rented + personal)
    home = personal > max(14, 0.10 * rented)
    out = {"case": name, "rented_days": rented, "personal_days": personal, "rental_share_pct": round(100 * share, 1), "deductible_dues": round(dues * share),
           "counts_as_home": home, "note": note}
    if home and 0 < rented < 15: out["deductible_dues"] = 0; out["rental_share_pct"] = 0.0; out["note"] = (out["note"] + " Rented under 15 days: no rent reported, no rental deduction.").strip()
    return out
W = {"monthly_dues": g["median_dues_25"], "yearly_dues": dues, "source": "median dues of condos for sale in Horry County, ../invest-condos/listings.json",
     "rule": "IRS Pub. 527 (2025): rental share = days rented at a fair price / (those days + personal days); vacant days count for neither. Counts as a home if personal days > the greater of 14 or 10 percent of rented days; then rental deductions cannot exceed rental income.",
     "cases": [case("Lived in all year", 0, 365, "A main home: dues are not deductible (Pub. 530)."),
               case("Rented all year, no personal nights", 365, 0, "All of the dues are a rental expense, including weeks it sat empty while held for rent."),
               case("Rented 120 nights, 20 personal nights", 120, 20, "Counts as a home: 20 is more than 14 and more than 12 (10 percent of 120)."),
               case("Rented 120 nights, 14 personal nights", 120, 14, "Does not count as a home: 14 is not more than 14."),
               case("Lived in, rented 10 nights", 10, 355, "")]}
json.dump(W, open(D + "/worked-example.json", "w"), indent=1); F["worked_example"] = W
json.dump(F, open(D + "/findings.json", "w"), indent=1)
print(json.dumps({k: F[k] for k in ("condo_stock", "listings", "condo_tax_groups", "bills")}, indent=1)); print(json.dumps(cmp, indent=1)); print(json.dumps(W["cases"], indent=1))
for r in rows: print(r)
