"""Every number on /invest/str-tools/ that is arithmetic, built from the raw files. Never type a chart value.
Inputs (raw/):
  airroi-parsed.json   parse_airroi.py over the AirROI market pages (12 months to September 2026)
  listings-str.json    pull_listings.py (CRM active listings: counts, median price, HOA-fee band)
  listings-hoa-incl.json  pull_hoa_incl.py (what the HOA fee covers, for the worked condos)
  noaa-months.json     noaa_months.py (Springmaid Pier water and air temperature, 2022-2025)
  horry-tax-levy-2026.txt  pdftotext of the Horry County Auditor's certified 2026 levy
Run: python3 -I compute.py <this folder>. Writes findings.json."""
import json, os, sys, re
root = sys.argv[1]
J = lambda f: json.load(open(os.path.join(root, "raw", f)))
A = J("airroi-parsed.json"); L = J("listings-str.json"); N = J("noaa-months.json")
try: HI = J("listings-hoa-incl.json")
except FileNotFoundError: HI = {}
lev = open(os.path.join(root, "raw", "horry-tax-levy-2026.txt")).read()
def mill(name):
    return float(re.search(re.escape(name) + r"\s*\.+\s*([\d.]+)", lev).group(1))
CS = mill("TOTAL COUNTY AND SCHOOL PURPOSES")
# Same method as the site's rental-returns calculator (website research/invest-next/returns-facts.md):
# inside a city, county and school plus the city's levy; Garden City and Murrells Inlet (unincorporated, Horry side),
# county and school plus the Murrells Inlet - Garden City fire district plus waste management.
MILLS = {
    "myrtle-beach": round(CS + mill("MYRTLE BEACH"), 1),
    "north-myrtle-beach": round(CS + mill("NORTH MYRTLE BEACH"), 1),
    "surfside-beach": round(CS + mill("SURFSIDE"), 1),
    "garden-city-beach": round(CS + mill("MURRELLS INLET – GARDEN CITY FIRE DISTRICTS") + mill("WASTE MANAGEMENT"), 1),
}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
res = {"mills_6pct": MILLS, "towns": {}, "examples": {}, "months": {}, "notes": []}
for t, a in A.items():
    p = a["pnl"]
    run_pct = p["airbnb_fee"]["pct"] + p["utilities"]["pct"] + p["supplies"]["pct"] + p["repairs"]["pct"]
    cal = a["calendar_month_revenue"]; yr = sum(cal.values())
    s2 = a["by_size"].get("2"); s3 = a["by_size"].get("3")
    bb = a["booked_or_blocked"]
    res["towns"][t] = {
        "revenue_avg": a["revenue"], "occupancy_pct": a["occupancy_pct"], "adr": a["adr"], "listings": a["listings"],
        "yoy_sentence": a["yoy_sentence"], "top3_share_pct": a["top3_share_pct"],
        "july_over_january": round(cal["July"] / cal["January"], 1),
        "jun_jul_aug_share_of_calendar_pct": round(100 * (cal["June"] + cal["July"] + cal["August"]) / yr),
        "dec_jan_feb_share_of_calendar_pct": round(100 * (cal["December"] + cal["January"] + cal["February"]) / yr),
        "two_bed": s2, "three_bed": s3,
        "running_cost_pct_of_gross": run_pct, "cleaning_share_pct": p["cleaning_share_pct"],
        "insurance_line": p["insurance"], "permit_line": p["permit"],
        "kept_avg_listing_airroi": a["left_year_avg"],
        "booked_or_blocked_90_or_fewer_pct": round(bb.get("1-30 days", 0) + bb.get("31-90 days", 0), 1),
        "booked_or_blocked_over_180_pct": round(bb.get("181-270 days", 0) + bb.get("271-366 days", 0), 1),
        "avg_stay_nights": a["avg_stay_nights"], "bookings_per_listing": a["bookings_per_listing"],
        "cleaning_fee_median": a["cleaning_fee_median"], "lead_days": a["lead_days"], "lead_sentence": a["lead_sentence"],
        "professional_mgmt_pct": a["professional_mgmt_pct"], "condo_pct": a["condo_pct"], "house_pct": a["house_pct"],
    }
    if s2:
        # Nights a typical two-bedroom books: its gross less the cleaning-fee share, over its nightly rate.
        res["towns"][t]["two_bed_nights_avg"] = round(s2["average"] * (1 - p["cleaning_share_pct"] / 100) / s2["adr"])
        res["towns"][t]["two_bed_nights_median"] = round(s2["median"] * (1 - p["cleaning_share_pct"] / 100) / s2["adr"])
        # What each booked night keeps after Airbnb's fee, utilities, supplies and repairs (the cleaner is paid by the guest's fee).
        res["towns"][t]["two_bed_kept_per_night"] = round(s2["adr"] * (1 - run_pct / 100))
        # What the average and the median two-bedroom keep in a year, before the HOA fee, tax and any loan.
        for k in ["average", "median"]:
            g = s2[k]
            res["towns"][t][f"two_bed_kept_{k}"] = round(g * (1 - p["cleaning_share_pct"] / 100 - run_pct / 100) - p["insurance"] - p["permit"])
for name, town in [("mb_city_oceanfront_condo_2br", "myrtle-beach"), ("nmb_oceanfront_condo_2br", "north-myrtle-beach"),
                   ("surfside_condo_2br", "surfside-beach"), ("garden_city_condo_2br", "garden-city-beach")]:
    e = L["examples"].get(name)
    if not e or not e.get("price_median"): continue
    tw = res["towns"][town]
    lo, hi = e["fee_median_band_among_with_fee"]; fee = (lo + hi) / 2
    tax = round(e["price_median"] * 0.06 * MILLS[town] / 1000)
    fixed = round(fee * 12 + tax + tw["insurance_line"] + tw["permit_line"])
    kpn = tw["two_bed_kept_per_night"]
    res["examples"][name] = {
        "town": town, "for_sale_n": e["n"], "price_median": e["price_median"], "price_p25": e.get("price_p25"), "price_p75": e.get("price_p75"),
        "hoa_band": [lo, hi], "hoa_used": fee, "hoa_year": round(fee * 12), "mills": MILLS[town], "tax_6pct": tax,
        "insurance_permit": tw["insurance_line"] + tw["permit_line"], "fixed_year": fixed,
        "kept_per_night": kpn, "nights_to_pay_fixed": round(fixed / kpn),
        "two_bed_nights_avg": tw["two_bed_nights_avg"], "two_bed_nights_median": tw["two_bed_nights_median"],
        "avg_two_bed_kept_before_fixed": tw["two_bed_kept_average"] + tw["insurance_line"] + tw["permit_line"],
        "avg_two_bed_left_after_fixed": tw["two_bed_kept_average"] + tw["insurance_line"] + tw["permit_line"] - fixed,
        "median_two_bed_left_after_fixed": tw["two_bed_kept_median"] + tw["insurance_line"] + tw["permit_line"] - fixed,
        "gross_avg_two_bed": tw["two_bed"]["average"], "adr_two_bed": tw["two_bed"]["adr"],
        "hoa_includes": HI.get(name),
        "cap_rate_avg_pct": round(100 * (tw["two_bed_kept_average"] + tw["insurance_line"] + tw["permit_line"] - fixed) / e["price_median"], 1),
    }
for t in ["myrtle-beach", "murrells-inlet", "north-myrtle-beach"]:
    cal = A[t]["calendar_month_revenue"]; yr = sum(cal.values())
    res["months"][t] = [{"month": m, "revenue": cal[m], "share_pct": round(100 * cal[m] / yr, 1), "season": A[t]["calendar_month_season"][m]} for m in MONTHS]
res["months"]["water_f"] = [N["months"]["water_temperature"][str(i)]["mean_f"] for i in range(1, 13)]
res["months"]["air_f"] = [N["months"]["air_temperature"][str(i)]["mean_f"] for i in range(1, 13)]
res["listings_by_town"] = {k: {**v, "condo_str_share_pct": round(100 * v["condo"]["str_allowed"] / v["condo"]["total"]) if v["condo"]["total"] else None,
                               "house_str_share_pct": round(100 * v["house"]["str_allowed"] / v["house"]["total"]) if v["house"]["total"] else None} for k, v in L["towns"].items()}
# A summer week of the average Myrtle Beach two-bedroom: 7 nights at its nightly rate; lodging tax in the city about 13 percent (registry mb-lodging-tax).
w = 7 * A["myrtle-beach"]["by_size"]["2"]["adr"]
res["mb_week"] = {"nights": 7, "adr": A["myrtle-beach"]["by_size"]["2"]["adr"], "rent": w, "tax_13pct": round(w * 0.13)}
json.dump(res, open(os.path.join(root, "findings.json"), "w"), indent=1)
for k, v in res["examples"].items(): print(k, v)
for k, v in res["towns"].items(): print(k, {x: v[x] for x in ["revenue_avg", "jun_jul_aug_share_of_calendar_pct", "july_over_january", "two_bed_nights_avg", "two_bed_kept_per_night", "two_bed_kept_average", "booked_or_blocked_90_or_fewer_pct"] if x in v})
print(res["mills_6pct"], res["mb_week"])
