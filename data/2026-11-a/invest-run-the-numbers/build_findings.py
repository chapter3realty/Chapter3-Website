"""Every derived number for /invest/run-the-numbers/. Reads the pulled files in this folder; writes findings.json and the chart rows.
Run: python3 -I build_findings.py <datadir>"""
import json, sys, os
D = sys.argv[1]; J = lambda f: json.load(open(os.path.join(D, f)))
SAF = J("safmr-fy2027.json")["zips"]; L2 = J("listings-vs-rent-2.json"); L1 = J("listings-vs-rent.json"); MED = J("medians.json"); TAX = J("tax-reset.json")
NAMES = {"29511": "Aynor", "29526": "Conway (east)", "29527": "Conway (west)", "29544": "Galivants Ferry", "29566": "Little River", "29568": "Longs",
         "29569": "Loris", "29572": "Myrtle Beach (north end)", "29575": "Surfside Beach", "29576": "Murrells Inlet and Garden City", "29577": "Myrtle Beach",
         "29579": "Carolina Forest", "29581": "Nichols", "29582": "North Myrtle Beach", "29588": "Socastee"}
# 2026 Horry County levy (tax-levy-2026.pdf): county 52.1, school 119.1 (operating 109.1), county fire 20.2, fire apparatus 1.5, waste 8.1, MI-GC fire 28.0, MB city 83.4
MILLS = {"unincorporated": 52.1 + 119.1 + 20.2 + 1.5 + 8.1, "myrtle_beach_city": 52.1 + 119.1 + 83.4}
F = {"millage": {k: round(v, 1) for k, v in MILLS.items()}}
# 1. Houses against the 1 percent rule
H = {"n": 0, "pass12": 0, "pass10": 0, "pass8": 0, "by_zip": []}
for r in L2["houses"]:
    p = r["pass"]; n = r["beds3plus"]
    a, b, c = (p[y]["exactly3"] + p[y]["four_plus"] for y in ["0.12", "0.1", "0.08"])
    H["n"] += n; H["pass12"] += a; H["pass10"] += b; H["pass8"] += c
    H["by_zip"].append({"zip": r["zip"], "name": NAMES[r["zip"]], "houses_3plus": n, "rent3": r["rent3"], "rent4": r["rent4"], "pass_1pct": a, "pass_10pct_gross": b, "pass_8pct_gross": c})
F["houses_1pct"] = H
# 2. Condos (2+ bedrooms, $50,000+) before and after dues
C = {"n": 0, "price_only": 0, "after_dues_floor": 0, "after_dues_ceiling": 0, "by_zip": []}
for r in L2["condos2"]:
    C["n"] += r["listings"]; C["price_only"] += r["price_only_pass"]; C["after_dues_floor"] += r["floor"]; C["after_dues_ceiling"] += r["ceiling"]
    C["by_zip"].append({"zip": r["zip"], "name": NAMES[r["zip"]], "condos_2plus": r["listings"], "rent2": r["rent2"], "pass_on_price": r["price_only_pass"], "pass_after_dues": [r["floor"], r["ceiling"]]})
F["condos_1pct"] = C
# 3. Gross rent as a share of the median asking price, by ZIP
G = []
for z, m in MED["houses3"].items():
    if m["median_ask"]: G.append({"zip": z, "name": NAMES[z], "type": "house, 3 bedrooms", "listings": m["listings"], "median_ask": m["median_ask"], "rent": SAF[z]["3"],
                                  "gross_yield_pct": round(SAF[z]["3"] * 12 / m["median_ask"] * 100, 1), "median_dues": m["median_dues"]})
for z, m in MED["condos2"].items():
    if m["median_ask"]: G.append({"zip": z, "name": NAMES[z], "type": "condo, 2 bedrooms", "listings": m["listings"], "median_ask": m["median_ask"], "rent": SAF[z]["2"],
                                  "gross_yield_pct": round(SAF[z]["2"] * 12 / m["median_ask"] * 100, 1), "median_dues": m["median_dues"],
                                  "dues_share_of_rent_pct": round(m["median_dues"] / SAF[z]["2"] * 100)})
F["gross_yield_by_zip"] = G
# 4. Two worked examples (sample sheets). Management and repairs-and-empty-months at 10 percent each of rent (rental-returns convention, owner 2026-09-09).
def sheet(label, price, rent, dues, mills, where):
    rent_y = rent * 12; tax = price * 0.06 * mills / 1000; mgmt = 0.10 * rent_y; rep = 0.10 * rent_y; dues_y = dues * 12
    left = rent_y - tax - mgmt - rep - dues_y
    return {"label": label, "where": where, "price": price, "rent_month": rent, "rent_year": rent_y, "tax_year": round(tax), "dues_year": dues_y,
            "management_year": round(mgmt), "repairs_and_empty_months_year": round(rep), "left_before_insurance_and_loan_year": round(left),
            "left_pct_of_price": round(left / price * 100, 1), "costs_share_of_rent_before_insurance_pct": round((rent_y - left) / rent_y * 100),
            "gross_yield_pct": round(rent_y / price * 100, 1), "one_pct_rule_price": rent * 100}
m = MED["houses3"]["29579"]; F["sheet_house"] = sheet("3-bedroom house, Carolina Forest (29579)", m["median_ask"], SAF["29579"]["3"], m["median_dues"], MILLS["unincorporated"], "unincorporated Horry County")
m = MED["houses3"]["29568"]; F["sheet_house_longs"] = sheet("3-bedroom house, Longs (29568)", m["median_ask"], SAF["29568"]["3"], m["median_dues"], MILLS["unincorporated"], "unincorporated Horry County")
m = MED["condos2"]["29577"]; F["sheet_condo"] = sheet("2-bedroom condo, Myrtle Beach (29577)", m["median_ask"], SAF["29577"]["2"], m["median_dues"], MILLS["myrtle_beach_city"], "City of Myrtle Beach")
# 5. The tax reset (deeds)
F["tax_reset"] = {k: TAX[k] for k in ["source", "kept", "all", "house", "condo", "class_counts", "class_counts_house", "class_counts_condo", "unincorporated_investor_bill_multiple"]}
# 6. Condo dues county-wide (all bedrooms)
cd = L1["condo_dues"]["all"]; F["condo_dues_all"] = {"listings": cd["listings"], "at_or_under": cd["hoaMax"]}
F["pulled"] = {"listings": L2["pulled"], "medians": MED["pulled"], "feed_refreshed": L1["feed_refreshed"]}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump([{"name": r["name"], "zip": r["zip"], "houses": r["houses_3plus"], "pass_1pct": r["pass_1pct"], "pass_8pct": r["pass_8pct_gross"]} for r in H["by_zip"] if r["houses_3plus"] >= 40],
          open(os.path.join(D, "chart-houses-1pct-by-zip.json"), "w"), indent=1)
print(json.dumps({k: F[k] for k in ["houses_1pct", "condos_1pct", "sheet_house", "sheet_house_longs", "sheet_condo"]}, indent=1)[:6000])
for g in G: print(g)
