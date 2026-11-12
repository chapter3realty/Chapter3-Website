"""Every derived number for /invest/property-management/. Run: python3 -I build_findings.py <datadir>. Writes findings.json.
Inputs: owner-distance.json (this folder), fees.json (this folder),
../invest-rent-prices/findings.json (rent for a 3-bedroom house, share of rented houses with a new tenant in 12 months),
../../str-market.json (short-term rental revenue and the owner-observed management ranges)."""
import json, sys, statistics as st
D = sys.argv[1]
od = json.load(open(D + "/owner-distance.json")); fees = json.load(open(D + "/fees.json"))
rp = json.load(open(D + "/../invest-rent-prices/findings.json")); strm = json.load(open(D + "/../../str-market.json"))
F = {"note": "Built by build_findings.py. Do not edit by hand."}
# 1. Who owns the homes that are not anyone's legal residence
a6 = od["all_6pct"]; i6 = od["individual_6pct"]; g = od["groups"]
F["owners"] = {
  "homes_6pct": a6["count"], "homes_4pct": od["all_4pct"]["count"],
  "pct_6pct_not_local": a6["pct_not_local"], "pct_6pct_local": a6["pct_local"],
  "condo_6pct": g["other6_condo"]["count"], "condo_6pct_not_local_pct": g["other6_condo"]["pct_not_local"],
  "house_6pct": g["other6_house_other"]["count"], "house_6pct_not_local_pct": g["other6_house_other"]["pct_not_local"],
  "res4_local_pct": round(100 * od["all_4pct"]["local"] / od["all_4pct"]["count"], 1),
  "individual_all_pct_not_local": i6["all"]["pct_not_local"], "individual_condo_pct_not_local": i6["condo"]["pct_not_local"],
  "individual_house_pct_not_local": i6["house_other"]["pct_not_local"], "bulk_homes": i6["all"]["bulk_homes"], "bulk_addresses": i6["all"]["bulk_addresses"],
  "chart_6pct": [  # where the tax bill goes, homes taxed at 6 percent, all owners
    {"label": "Grand Strand", "n": a6["local"]}, {"label": "Elsewhere in South Carolina", "n": a6["sc_elsewhere"]},
    {"label": "North Carolina", "n": a6["nc"]}, {"label": "Other states", "n": a6["other_states"]}, {"label": "Outside the U.S.", "n": a6["abroad"]}],
  "top_states_condo_6pct": g["other6_condo"]["top_states_outside_sc"][:5], "top_states_house_6pct": g["other6_house_other"]["top_states_outside_sc"][:5],
}
for r in F["owners"]["chart_6pct"]: r["pct"] = round(100 * r["n"] / a6["count"], 1)
# 2. Published long-term fees
lt = fees["long_term"]
pcts = [f["monthly_pct"] for f in lt]; lease = [f["leasing_share_of_month"] for f in lt]
F["lt_fees"] = {"firms": len(lt), "at_10pct": sum(1 for p in pcts if p == 10), "monthly_min_pct": min(pcts), "monthly_max_pct": max(pcts),
  "monthly_median_pct": st.median(pcts), "leasing_median_share": st.median(lease), "leasing_min_share": min(lease), "leasing_max_share": max(lease),
  "renewals_published_usd": sorted(f["renewal_usd"] for f in lt if f.get("renewal_usd")), "excluded": len(fees["long_term_excluded"])}
# 3. Worked year, 3-bedroom house, new lease rent from the rent-prices page (Census PUMS, moved in within 2 years)
rent = round(rp["new_vs_long_lease_3br"]["moved_in_last_2y"] / 100) * 100   # about $1,600
turn = rp["pums_detached_moved_in"]["1"] / 100                             # share of rented houses with a tenant who moved in within 12 months
mgmt = round(rent * 0.10 * 12)
lease_lo, lease_hi = round(rent * 0.5), rent
renew = 125   # midpoint of the two published renewal fees, $100 and $150
# low: half a month's rent to lease, 10 percent every month (J and P Unlimited, PURE HomeRiver terms);
# high: one full month's rent to lease, then 10 percent from the 2nd month (Beach Rental Group's stated terms)
yr_new_lo, yr_new_hi = mgmt + lease_lo, lease_hi + round(rent * 0.10 * 11)
yr_renew = mgmt + renew
avg_lo = round(turn * yr_new_lo + (1 - turn) * yr_renew); avg_hi = round(turn * yr_new_hi + (1 - turn) * yr_renew)
childs_eff = round(100 * max(150, 0.07 * rent) / rent, 1)
F["worked_year"] = {"rent": rent, "annual_rent": rent * 12, "monthly_fee": round(rent * 0.10), "mgmt_year": mgmt, "leasing_half": lease_lo, "leasing_full": lease_hi,
  "renewal_mid": renew, "year_new_tenant_low": yr_new_lo, "year_new_tenant_high": yr_new_hi, "year_renewal": yr_renew,
  "turnover_share_12m": round(turn * 100, 1), "avg_year_low": avg_lo, "avg_year_high": avg_hi,
  "avg_pct_of_rent_low": round(100 * avg_lo / (rent * 12), 1), "avg_pct_of_rent_high": round(100 * avg_hi / (rent * 12), 1),
  "new_year_pct_low": round(100 * yr_new_lo / (rent * 12), 1), "new_year_pct_high": round(100 * yr_new_hi / (rent * 12), 1),
  "seven_pct_with_150_min_effective_pct": childs_eff, "seven_pct_breakeven_rent": round(150 / 0.07)}
# 4. Short-term: the Myrtle Beach market's average revenue and the owner-observed basic plan range
mb = next(m for m in strm["markets"] if m["slug"] == "myrtle-beach"); M = strm["management"]
F["str_year"] = {"market": "myrtle-beach", "revenue": mb["revenue"], "dataAsOf": strm["dataAsOf"], "basic_low_pct": M["basicLow"], "basic_high_pct": M["basicHigh"],
  "basic_low_usd": round(mb["revenue"] * M["basicLow"] / 100, -1), "basic_high_usd": round(mb["revenue"] * M["basicHigh"] / 100, -1),
  "full_low_pct": M["fullServiceLow"], "full_high_pct": M["fullServiceHigh"], "full_base": M["fullServiceBase"]}
json.dump(F, open(D + "/findings.json", "w"), indent=1)
print(json.dumps(F, indent=1))
