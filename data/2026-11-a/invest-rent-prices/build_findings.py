"""Every derived number for /invest/rent-prices/. Run: python3 -I build_findings.py <datadir> (after pull_acs.py,
analyze_pums.py, build_zillow.py, build_fmr.py). Reads acs.json, pums-2024-5yr.json, zillow.json, fmr-history.json and
raw/popest/co-est2025-alldata.csv. Writes findings.json, which the page's charts and tables read.
ACS figures are 2020-2024 5-year estimates (dollars in 2024 dollars); a margin of error is the 90 percent margin Census prints.
A figure whose margin is more than 25 percent of the estimate is flagged "wide" and the page should not print it alone."""
import csv, json, os, sys
D = sys.argv[1]
A = json.load(open(os.path.join(D, "acs.json")))["five_year"]
P = json.load(open(os.path.join(D, "pums-2024-5yr.json")))
Z = json.load(open(os.path.join(D, "zillow.json")))
F = json.load(open(os.path.join(D, "fmr-history.json")))
def n(v):
    try:
        x = float(v); return None if x < 0 else x
    except (TypeError, ValueError): return None
def est(geo, var):
    g = A.get(geo, {}); e, m = n(g.get(var + "E")), n(g.get(var + "M"))
    if e is None: return None
    return {"est": round(e), "moe": None if m is None else round(m), "wide": bool(m is not None and m > 0.25 * e)}
AREAS = [  # (page name, ACS geography). Census-designated places for the unincorporated areas readers search by name.
    ("Carolina Forest", "Carolina Forest CDP"), ("Socastee", "Socastee CDP"), ("Forestbrook", "Forestbrook CDP"),
    ("Myrtle Beach (city)", "Myrtle Beach city"), ("North Myrtle Beach", "North Myrtle Beach city"), ("Surfside Beach", "Surfside Beach town"),
    ("Murrells Inlet", "Murrells Inlet CDP"), ("Garden City", "Garden City CDP"), ("Little River", "Little River CDP"),
    ("Conway (city)", "Conway city"), ("Red Hill", "Red Hill CDP"), ("Bucksport", "Bucksport CDP"),
    ("Horry County", "Horry County"), ("South Carolina", "South Carolina"), ("United States", "United States")]
areas = []
for name, geo in AREAS:
    g = A.get(geo)
    if not g: continue
    ren, tot = n(g.get("B25003_003E")), n(g.get("B25003_001E"))
    rdet = n(g.get("B25032_014E")); rall = n(g.get("B25032_013E"))
    burden_den = (n(g.get("B25070_001E")) or 0) - (n(g.get("B25070_011E")) or 0)
    burden = sum(n(g.get(f"B25070_0{i:02d}E")) or 0 for i in (7, 8, 9, 10))
    fr, rno = n(g.get("B25004_002E")), n(g.get("B25004_003E"))
    areas.append({"name": name, "geo": geo, "median_gross_rent": est(geo, "B25064_001"), "median_contract_rent": est(geo, "B25058_001"),
                  "gross_rent_by_bedrooms": {b: est(geo, f"B25031_00{i}") for b, i in (("1", 3), ("2", 4), ("3", 5), ("4", 6))},
                  "renter_households": None if ren is None else round(ren), "renter_share_pct": None if not tot else round(100 * ren / tot, 1),
                  "renters_in_detached_houses_pct": None if not rall else round(100 * rdet / rall, 1),
                  "rent_30pct_or_more_of_income_pct": None if not burden_den else round(100 * burden / burden_den, 1),
                  "rental_vacancy_rate_pct": None if fr is None or ren is None else round(100 * fr / (ren + fr + (rno or 0)), 1)})
zips = []
for geo, g in A.items():
    if not geo.startswith("ZCTA "): continue
    z = geo[5:]
    zips.append({"zip": z, "median_gross_rent": est(geo, "B25064_001"), "gross_rent_3br": est(geo, "B25031_005"), "gross_rent_2br": est(geo, "B25031_004"),
                 "zillow_asking_all_homes": Z["zips_all_homes"].get(z, {}).get("latest")})
# Population (Census Vintage 2025 county estimates)
with open(os.path.join(D, "raw", "popest", "co-est2025-alldata-sc.csv"), newline="", encoding="latin-1") as f:
    pr = next(r for r in csv.DictReader(f) if r["STATE"] == "45" and r["COUNTY"] == "051")
pop = {"base_2020": int(pr["ESTIMATESBASE2020"]), "july_2025": int(pr["POPESTIMATE2025"]),
       "natural_change_2020_2025": sum(int(pr[f"NATURALCHG{y}"]) for y in range(2020, 2026)),
       "net_migration_2020_2025": sum(int(pr[f"NETMIG{y}"]) for y in range(2020, 2026))}
pop["growth_pct"] = round(100 * (pop["july_2025"] / pop["base_2020"] - 1), 1)
C, G = P["contract_rent"], P["gross_rent"]
out = {
    "note": "Built by build_findings.py. Do not edit by hand.",
    "acs_period": "2020-2024 American Community Survey 5-year estimates", "zillow_latest_month": Z["latest_month"],
    "headline": {
        "zillow_house_asking": round(Z["latest"]["zori_house_sm"]), "zillow_apartment_asking": round(Z["latest"]["zori_apartment_sm"]),
        "zillow_all_asking": round(Z["latest"]["zori_all_sm"]), "zillow_house_12m_pct": Z["change_12m_pct"]["zori_house_sm"],
        "zillow_all_12m_pct": Z["change_12m_pct"]["zori_all_sm"], "zillow_house_peak": Z["peak"]["zori_house_sm"]},
    "fmr_fy2027": F["fiscal_years"]["2027"], "fmr_fy2026": F["fiscal_years"]["2026"],
    "fmr_by_year_2_3_4br": {y: {b: v[b] for b in "234"} for y, v in F["fiscal_years"].items() if int(y) >= 2015},
    "pums_lease_rent": {k: C[k] for k in ("house_detached", "house_detached_2br", "house_detached_3br", "house_detached_4br", "townhouse_attached",
                                          "apartment_or_condo_2plus", "apartment_or_condo_1br", "apartment_or_condo_2br", "mobile_home", "all_renters",
                                          "house_detached_3br_moved_in_last_2y", "house_detached_3br_5y_or_more", "house_detached_moved_in_last_12m",
                                          "house_detached_5y_or_more", "all_moved_in_last_12m", "all_5y_or_more")},
    "pums_gross_rent": {k: G[k] for k in ("house_detached", "house_detached_3br", "house_detached_3br_moved_in_last_2y", "apartment_or_condo_2br")},
    "pums_utilities": P["utilities_paid_by_renter"], "pums_share_of_renter_homes": P["share_of_renter_homes"],
    "pums_detached_bedrooms_share": P["detached_bedrooms_share"], "pums_detached_moved_in": P["detached_moved_in"],
    "areas": areas, "zips": sorted(zips, key=lambda r: r["zip"]),
    "zillow_seasonal_pct_by_month": Z["seasonal_pct_by_month"], "zillow_seasonal_years": [Z["seasonal_years"][0], Z["seasonal_years"][-1]],
    "zillow_growth_since": {k: Z["growth_since"][k] for k in ("2015-09-30", "2019-09-30", "2022-09-30", "2023-09-30") if k in Z["growth_since"]},
    "zillow_house_rent_x12_over_value_pct": Z["house_rent_x12_over_value_pct"],
    "zillow_house_series_sept": {m[:4]: round(v) for m, v in Z["series"]["zori_house_sm"].items() if m[5:7] == "09"},
    "zillow_house_value_series_sept": {m[:4]: round(v, -3) for m, v in Z["series"]["zhvi_house_mid"].items() if m[5:7] == "09" and m >= "2015"},
    "population": pop,
}
# The gap between a new lease and a long one, on a 3-bedroom house
a, b = C["house_detached_3br_moved_in_last_2y"]["median"], C["house_detached_3br_5y_or_more"]["median"]
out["new_vs_long_lease_3br"] = {"moved_in_last_2y": a, "stayed_5y_or_more": b, "gap": a - b, "gap_pct": round(100 * (a / b - 1))}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
for r in areas: print(r["name"], r["median_gross_rent"], {k: (v or {}).get("est") for k, v in r["gross_rent_by_bedrooms"].items()}, "3br moe", (r["gross_rent_by_bedrooms"]["3"] or {}).get("moe"), "| det%", r["renters_in_detached_houses_pct"], "| burden", r["rent_30pct_or_more_of_income_pct"], "| vac", r["rental_vacancy_rate_pct"], "| renters", r["renter_households"])
print(out["population"]); print(out["new_vs_long_lease_3br"]); print(out["zillow_growth_since"])
