"""Every derived number for /hoa/benefits/, and the chart and table files the spec reads. Nothing is typed:
each value comes from a pulled file here or a sibling's file named below.
Inputs: counts.json, price-test.json, condo-fees.json, prices.json, scdca-concerns.json (this folder);
../../2026-10-d/hoa-hoa-vs-poa/fees-by-type.json and has-with-fee.json (typical fee and what it includes, 2026-11-01).
Run: python3 -I build_findings.py <this dir>. Writes findings.json and chart-*.json."""
import json, os, sys
d = sys.argv[1]; J = lambda *p: json.load(open(os.path.join(d, *p)))
counts, pt, cf, pr, sc = J("counts.json"), J("price-test.json"), J("condo-fees.json"), J("prices.json"), J("scdca-concerns.json")
sib = os.path.join(d, "..", "..", "2026-10-d", "hoa-hoa-vs-poa")
fees = json.load(open(os.path.join(sib, "fees-by-type.json"))); has = json.load(open(os.path.join(sib, "has-with-fee.json")))
F = {"made": "build_findings.py", "inputs": ["counts.json", "price-test.json", "condo-fees.json", "prices.json", "scdca-concerns.json",
     "../../2026-10-d/hoa-hoa-vs-poa/fees-by-type.json", "../../2026-10-d/hoa-hoa-vs-poa/has-with-fee.json"]}
# 1. Typical fee by kind of home (sibling, 2026-11-01) and condo oceanfront split (this pull, 2026-11-04)
F["typical_fee"] = {t: {"median_month": fees["types"][t]["median_fee_5"]["median_at_or_below"], "with_fee": fees["types"][t]["with_fee"],
                        "year": 12 * fees["types"][t]["median_fee_5"]["median_at_or_below"]} for t in ("condo", "townhouse", "house")}
F["condo_split"] = {g: {k: v for k, v in x.items() if k != "cdf"} | {"year": 12 * x["median_fee_5"]} for g, x in cf["groups"].items()}
# 2. What the fee includes, share of homes with a fee (sibling)
KEYS = [("hoa_includes_insurance", "Insurance"), ("hoa_includes_water_sewer", "Water and sewer"), ("hoa_includes_trash", "Trash pickup"),
        ("lawn_care_included", "Lawn care"), ("hoa_includes_internet", "Internet"), ("community_amenities", "Amenities (pool, clubhouse and the like)"), ("gated", "A gate")]
F["includes"] = {"pulled": has["pulled"], "rows": [{"key": k, "label": l, **{t: round(has["types"][t]["has"][k]["pct_of_with_fee"]) for t in ("condo", "townhouse", "house")}} for k, l in KEYS],
                 "with_fee": {t: has["types"][t]["with_fee"] for t in ("condo", "townhouse", "house")}}
# 3. Houses: share with a fee, by year built; amenities among houses with a fee
F["by_year"] = counts["by_year"]; F["house_counts"] = {k: counts[k] for k in ("house_total", "house_no_fee", "house_with_fee")}
F["house_features"] = counts["features_with_fee"]
since2010 = [r for r in counts["by_year"] if r["yearMin"] and r["yearMin"] >= 2010]
F["built_2010_plus"] = {"houses": sum(r["houses"] for r in since2010), "with_fee": sum(r["with_fee"] for r in since2010)}
F["built_2010_plus"]["pct_with_fee"] = round(100 * F["built_2010_plus"]["with_fee"] / F["built_2010_plus"]["houses"], 1)
# 4. Price test
F["price_test"] = {"pulled": pt["pulled"], "built_2000_plus_county": pt["cuts"]["built 2000 or later"]["county"],
                   "all_ages_zips": {k: pt["cuts"]["all ages"][k] for k in ("zips_compared", "zips_fee_higher", "median_of_zip_diffs_pct")},
                   "built_2000_zips": {k: pt["cuts"]["built 2000 or later"][k] for k in ("zips_compared", "zips_fee_higher", "median_of_zip_diffs_pct")},
                   "beach_bands": pt["beach_bands_built_2000_plus"]["county_by_band"],
                   "zip_band": {k: pt["beach_bands_built_2000_plus"][k] for k in ("zip_band_compared", "zip_band_fee_higher", "median_of_zip_band_diffs_pct")}}
# 5. The house fee against a public pool and gym
house_year = F["typical_fee"]["house"]["year"]; n = pr["nmb_aquatic_fitness"]; m = pr["myrtle_beach_rec"]["annual"]
F["fee_vs_pool"] = {"house_fee_year": house_year, "house_fee_month": F["typical_fee"]["house"]["median_month"],
    "options": [{"label": "Myrtle Beach recreation center, one adult, city resident", "year": m["Adult (18-54)"]["city_resident"], "source": pr["myrtle_beach_rec"]["url"]},
                {"label": "Myrtle Beach recreation center, one adult, not a city resident", "year": m["Adult (18-54)"]["non_city_resident"], "source": pr["myrtle_beach_rec"]["url"]},
                {"label": "North Myrtle Beach Aquatic and Fitness Center, one adult", "year": n["individual"]["annual_paid_in_full"], "joining_fee": n["individual"]["joining_fee"], "source": n["url"]},
                {"label": "North Myrtle Beach Aquatic and Fitness Center, a couple", "year": n["couple"]["annual_paid_in_full"], "joining_fee": n["couple"]["joining_fee"], "source": n["url"]}]}
# 6. Complaints (merge the one label the state spells two ways)
c = dict(sc["total"]["concerns"]); q = "Request to access information/ view documents ignored"
c[q] = c.get(q, 0) + c.pop(q + "?", 0); tot = sc["total"]["horry_complaints"]
F["complaints"] = {"horry_complaints": tot, "reports": list(sc["years"].keys()),
                   "top": [{"concern": k, "count": v, "pct": round(100 * v / tot, 1)} for k, v in sorted(c.items(), key=lambda x: -x[1]) if k != "Other"][:8]}
json.dump(F, open(os.path.join(d, "findings.json"), "w"), indent=1)
json.dump({"title": "Share of houses for sale with an HOA fee, by year built", "rows": [{"label": r["band"], "pct": r["pct_with_fee"], "houses": r["houses"]} for r in counts["by_year"]], "source": "counts.json"}, open(os.path.join(d, "chart-hoa-by-year-built.json"), "w"), indent=1)
json.dump({"title": "Asking price per square foot, houses built 2000 or later, with and without an HOA fee, by distance from the beach",
           "rows": [{"band": r["band"], "with_fee": r["with_fee"]["median_ppsf"], "no_fee": r["no_fee"]["median_ppsf"], "n_with": r["with_fee"]["n"], "n_none": r["no_fee"]["n"],
                     "acres_with": r["with_fee"]["median_acres"], "acres_none": r["no_fee"]["median_acres"], "diff_pct": r["ppsf_diff_pct"], "share_with_fee_pct": r["share_with_fee_pct"]} for r in F["price_test"]["beach_bands"]], "source": "price-test.json"},
          open(os.path.join(d, "chart-price-by-beach.json"), "w"), indent=1)
json.dump({"title": "What Horry County owners complained to the state about", "complaints": tot, "rows": F["complaints"]["top"], "source": "scdca-concerns.json"}, open(os.path.join(d, "chart-complaints.json"), "w"), indent=1)
json.dump({"title": "A year of the typical house fee against a year at a public pool and gym", "rows": [{"label": "The typical house HOA fee", "year": house_year}] + F["fee_vs_pool"]["options"], "source": "findings.json"}, open(os.path.join(d, "chart-fee-vs-pool.json"), "w"), indent=1)
print(json.dumps({k: F[k] for k in ("typical_fee", "condo_split", "built_2010_plus", "fee_vs_pool", "complaints")}, indent=1))
print(json.dumps(F["includes"], indent=1)); print(json.dumps(F["price_test"]["zip_band"]), json.dumps(F["price_test"]["built_2000_zips"]), json.dumps(F["price_test"]["all_ages_zips"]))
