"""The /sell/ hub's numbers, in one file the spec reads. Inputs: ccar-2026-09.json (parse_ccar.py), offmarket.json (deeds_offmarket.py),
and two sibling files read as they are: data/2026-11-b/sell-net-proceeds/findings.json (costs at the county's middle price) and
data/2026-11-b/sell-net-proceeds/listings.json (price cuts on homes for sale, pulled 2026-11-09).
Usage (from the website repo root): python3 -I data/2026-11-b/sell/build_findings.py ."""
import sys, os, json
R = sys.argv[1]; D = os.path.join(R, "data/2026-11-b/sell")
c = json.load(open(os.path.join(D, "ccar-2026-09.json"))); o = json.load(open(os.path.join(D, "offmarket.json")))
npf = json.load(open(os.path.join(R, "data/2026-11-b/sell-net-proceeds/findings.json")))
npl = json.load(open(os.path.join(R, "data/2026-11-b/sell-net-proceeds/listings.json")))
F = {"meta": {"made": "build_findings.py", "ccar_month": c["meta"]["data_month"], "ccar_current_as_of": c["meta"]["current_as_of"]}}
ov = c["overview"]
def seg(k):
    x = ov[k]; g = lambda m, f: x[m][f]
    return {"median_price_sep": g("Median Sales Price", "sep_2026"), "median_price_ytd": g("Median Sales Price", "ytd_2026"),
            "median_price_ytd_prev": g("Median Sales Price", "ytd_2025"), "dom_sep": g("Days on Market Until Sale", "sep_2026"),
            "dom_ytd": g("Days on Market Until Sale", "ytd_2026"), "pct_list_sep": g("Percent of List Price Received", "sep_2026"),
            "pct_list_ytd": g("Percent of List Price Received", "ytd_2026"), "months_supply_sep": g("Months Supply of Inventory", "sep_2026"),
            "inventory_sep": g("Inventory of Homes for Sale", "sep_2026"), "closed_ytd": g("Closed Sales", "ytd_2026"), "closed_ytd_prev": g("Closed Sales", "ytd_2025"),
            "pending_ytd": g("Pending Sales", "ytd_2026"), "pending_ytd_prev": g("Pending Sales", "ytd_2025")}
F["market"] = {"single_family": seg("single_family"), "condo": seg("condo")}
# dollars a seller gives up between the last list price and the sale, at the CCAR median
for k in ("single_family", "condo"):
    m = F["market"][k]; m["gap_dollars_at_median_ytd"] = round(m["median_price_ytd"] * (100 - m["pct_list_ytd"]) / 100 / 100) * 100
# when buyers sign: accepted offers by month
pend = c["monthly"]["Pending Sales"]
F["pending_by_month"] = [{"month": p["month"], "single_family": int(p["single_family"]), "condo": int(p["condo"]), "total": int(p["single_family"] + p["condo"])} for p in pend]
tot = sorted(F["pending_by_month"], key=lambda p: -p["total"])
F["pending_top3"] = [p["month"] for p in tot[:3]]; F["pending_low"] = tot[-1]["month"]
F["dom_by_month"] = [{"month": p["month"], "single_family": int(p["single_family"]), "condo": int(p["condo"])} for p in c["monthly"]["Days on Market Until Sale"]]
# by area, year to date (Jan-Sep 2026); a cell with fewer than 50 sales is not printed
rows = []
for name, a in c["areas"].items():
    r = {"area": name, "zips": a["zips"]}
    for k in ("single_family", "condo"):
        x = a[k]; n = x.get("Closed Sales", {}).get("ytd_2026") or 0
        r[k] = None if n < 50 else {"closed_ytd": int(n), "median_price_ytd": x["Median Sales Price"]["ytd_2026"],
                                   "dom_ytd": x["Days on Market Until Sale"]["ytd_2026"], "pct_list_ytd": x["Percent of List Price Received"]["ytd_2026"]}
    rows.append(r)
F["areas_ytd"] = rows
F["areas_rule"] = "CCAR Local Market Update, January to September 2026 (year to date); cells with fewer than 50 closed sales are left out."
# investors: what they paid and resold for (Horry County deeds)
rp = o["resold_pairs"]["company_bought_resale_house"]; rc = o["ratio_to_county_value"]
F["investor"] = {"pairs_houses": rp["n"], "median_bought": rp["median_first_price"], "median_resold": rp["median_second_price"],
                 "median_markup": round(rp["median_resale_over_purchase"] - 1, 3), "median_days_between": rp["median_days_between_deeds"],
                 "share_paid_of_resale": rp["median_purchase_over_resale"], "bought_over_county_value": rp["first_over_county_value"],
                 "resold_to_company": rp["second_buyer_company"],
                 "company_house_ratio": rc["house_company"]["median_ratio"], "person_house_ratio": rc["house_person"]["median_ratio"],
                 "company_house_n": rc["house_company"]["n"], "person_house_n": rc["house_person"]["n"],
                 "company_condo_ratio": rc["condo_company"]["median_ratio"], "person_condo_ratio": rc["condo_person"]["median_ratio"],
                 "company_condo_n": rc["condo_company"]["n"], "person_condo_n": rc["condo_person"]["n"]}
# a labelled example: a house that would sell for the county's middle resale price once fixed up
mid = 350000
F["example_350k"] = {"price_fixed_up": mid, "investor_price_at_median_share": round(mid * F["investor"]["share_paid_of_resale"] / 1000) * 1000,
                     "listed_at_pct_of_list": round(mid * F["market"]["single_family"]["pct_list_ytd"] / 100 / 1000) * 1000}
# costs and price cuts, read from the net-proceeds files (that page owns them)
mh = next(t for t in npf["tiers"] if t["key"] == "middle_house")
F["costs_middle_house"] = {"price": mh["price"], "fixed_by_law": mh["fixed_by_law"], "per_1pct_commission": mh["per_1pct_commission"]}
F["price_cuts_now"] = {"pulled": npl["pulled"], "house_resale": npl["kinds"]["house"]["resale"], "house_resale_cut": npl["kinds"]["house"]["price_cut_resale"], "house_pct_cut": npl["kinds"]["house"]["pct_price_cut_resale"], "condo": {k: npl["kinds"]["condo"].get(k) for k in ("resale", "price_cut_resale", "pct_price_cut_resale")}}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: F[k] for k in ("market", "pending_top3", "pending_low", "investor", "example_350k", "costs_middle_house")}, indent=1))
