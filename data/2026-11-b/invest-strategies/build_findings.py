#!/usr/bin/env python3
"""Findings for /invest/strategies/ (batch 2026-11-b).

Run from the website root:  python3 -I data/2026-11-b/invest-strategies/build_findings.py
Reads only data files other pages already pulled and verified; pulls nothing new from the web.
Writes findings.json (every number the hub prints) and chart-entry-prices.json (the price ladder).
No address, PIN, owner name or MLS number is written.
"""
import json, os, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", ".."))
def load(*p): return json.load(open(os.path.join(DATA, *p), encoding="utf-8"))
def r1k(x): return int(round(x / 1000.0) * 1000)
med = statistics.median

out = {"made": "build_findings.py", "note": "Do not edit by hand. Every value is read from the file named in its 'from'."}

# 1. Fix and flip: Horry County deeds, resales recorded 2025-10-01 to 2026-09-30 (same file and logic as specs/fix-and-flip.js)
F = load("2026-10-c", "horry-flips.json")["flips"]
co = [f for f in F if f.get("resale_seller_company")]
houses = [f for f in F if not f.get("no_land_value")]
out["flip"] = {"from": "data/2026-10-c/horry-flips.json",
  "quick_resales": len(F), "company_resales": len(co),
  "company_gain_median": r1k(med([f["gain"] for f in co])),
  "all_gain_median": r1k(med([f["gain"] for f in F])),
  "houses": len(houses),
  "house_buy_median": r1k(med([f["buy_cons"] for f in houses])),
  "house_resale_median": r1k(med([f["sell_cons"] for f in houses])),
  "house_gain_median": r1k(med([f["gain"] for f in houses])),
  "losses": sum(1 for f in F if f["gain"] < 0),
  "house_first_deed_earliest": min(f["buy_date"] for f in houses).replace("/", "-"),
  "resale_last": max(f["sell_date"] for f in F).replace("/", "-")}

# 2. Small multifamily: county parcels and deeds, MLS listings in aggregate (that page's findings)
S = load("2026-11-b", "invest-strategies-small-multifamily", "findings.json")
ob = S["stock"]["ocean_bands"]; within = ob["under 0.25 mile"] + ob["0.25 to 1 mile"]; placed = sum(ob.values())
out["small_multifamily"] = {"from": "data/2026-11-b/invest-strategies-small-multifamily/findings.json",
  "buildings": S["stock"]["total"], "within_1_mile": within, "placed": placed, "within_1_mile_pct": round(100.0 * within / placed, 1),
  "sold_n": S["sold"]["all"]["n"], "sold_median": S["sold"]["all"]["median"],
  "for_sale_n": S["for_sale"]["horry"]["n"], "for_sale_median": S["for_sale"]["horry"]["median"],
  "listings_pulled": S["meta"]["listings_pulled"]}

# 3. DST: SEC Form D filings, 12 months; Horry County parcels owned by DSTs (the DST page's files)
X = load("2026-10-d", "invest-strategies-dst", "formd_dst_summary.json")
out["dst"] = {"from": "data/2026-10-d/invest-strategies-dst/formd_dst_summary.json",
  "filings": X["filings"], "min_median": int(X["min_inv"]["median"]),
  "commission_median_pct": round(100 * X["commission_plus_finders_share"]["median"], 1),
  "horry_note": "DST ledger row 25 (CORRECTED); counted below from the DST page's parcel file."}
P = load("2026-10-d", "invest-strategies-dst", "horry_dst_parcels.json")["features"]
out["dst"]["horry_from"] = "data/2026-10-d/invest-strategies-dst/horry_dst_parcels.json"
out["dst"]["horry_parcels"] = len(P)
out["dst"]["horry_trusts"] = len(set(f["attributes"]["OwnerName"].split(" C/O ")[0].strip() for f in P))
out["dst"]["horry_market_value"] = int(sum(f["attributes"]["MarketProp"] or 0 for f in P))

# 4. Home prices and buyers: county deeds 2025-10-01 to 2026-09-30 (carried by the 1031 page from /sell/home-value/ and /sell/out-of-state-buyers/)
T = load("2026-11-b", "invest-strategies-1031-exchange", "findings.json")
ca = T["resale_medians_carried"]["county_all"]; bs = T["buyer_states_carried"]
out["prices"] = {"from": "data/2026-11-b/invest-strategies-1031-exchange/findings.json",
  "resale_house_median": ca["resale_house"]["median"], "resale_condo_median": ca["resale_condo"]["median"],
  "sales": bs["all"]["sales"], "buyers_outside_sc_pct": bs["all"]["pct_outside_sc"],
  "company_buyers": bs["by_buyer_kind"]["company"]["sales"],
  "company_buyers_pct": round(100.0 * bs["by_buyer_kind"]["company"]["sales"] / bs["all"]["sales"], 1)}

# 5. Long-term rent: Zillow ZORI and HUD FMR (the rent-prices page's findings)
R = load("2026-11-a", "invest-rent-prices", "findings.json")
out["ltr"] = {"from": "data/2026-11-a/invest-rent-prices/findings.json",
  "house_asking_rent": int(round(R["headline"]["zillow_house_asking"] / 10.0) * 10),
  "house_asking_rent_exact": R["headline"]["zillow_house_asking"], "zillow_month": R["zillow_latest_month"],
  "fmr_3br_fy2027": R["fmr_fy2027"]["3"]}

# 6. Short-term rental: AirROI, trailing 12 months (the site's one STR file)
M = load("str-market.json"); mk = {m["name"]: m for m in M["markets"]}
mb = mk.get("Myrtle Beach")
out["str"] = {"from": "data/str-market.json", "vendor": M["vendor"], "retrieved": M["retrieved"], "dataAsOf": M["dataAsOf"],
  "myrtle_beach_avg_gross": mb["revenue"] if mb else None, "myrtle_beach_listings": mb["listings"] if mb else None,
  "myrtle_beach_median_month": mb["median"] if mb else None,
  "top_market": max(M["markets"], key=lambda m: m["revenue"])["name"],
  "murrells_inlet_avg_gross": mk["Murrells Inlet"]["revenue"], "markets": len(M["markets"])}

# 7. DSCR: share of rent left for the loan at a 1.25 ratio (the DSCR page's findings)
Q = load("2026-11-b", "invest-strategies-dscr-loans", "findings.json")
out["dscr"] = {"from": "data/2026-11-b/invest-strategies-dscr-loans/findings.json", "target_ratio": Q["target_ratio"],
  "cases": [{"name": c["name"], "pct_left_for_loan_at_1_25": c.get("pct_left_for_loan_at_1_25"), "pct_tax_ins_dues": c.get("pct_tax_ins_dues")} for c in Q["cases"]]}

json.dump(out, open(os.path.join(HERE, "findings.json"), "w"), indent=1)

# The one chart: what each way in costs here, at the middle (one message: the ways in start far apart).
# Labels and notes in the verifier's wording (VERIFY.md rows 8, 17, 19, 37): the DST bar is a minimum, not a price;
# the flip bar is the first price of homes with their own land, mostly houses, resold within a year, and its first
# deeds start earlier than the other bars' 12 months, so it carries its own note.
ladder = [
  {"name": "A share of a DST", "value": out["dst"]["min_median"], "note": "usual minimum, not a price", "strategy": "dst", "reference": True},
  {"name": "A condo (resale)", "value": out["prices"]["resale_condo_median"], "note": "middle sale, county deeds", "strategy": "str"},
  {"name": "A house resold within a year (first price)", "value": out["flip"]["house_buy_median"], "note": "middle price paid before the resale", "strategy": "flip"},
  {"name": "A home other than a condo (resale)", "value": out["prices"]["resale_house_median"], "note": "mostly houses, middle sale", "strategy": "ltr"},
  {"name": "A duplex, triplex or fourplex", "value": out["small_multifamily"]["sold_median"], "note": "middle sale, county deeds", "strategy": "small-multifamily"},
]
json.dump({"title": "What each way in costs here, at the middle", "unit": "USD",
  "period": "sales recorded October 2025 to September 2026; DST minimums from SEC filings in the same 12 months",
  "flip_period": "resales recorded October 2025 to September 2026; their first deeds from " + out["flip"]["house_first_deed_earliest"],
  "rows": ladder}, open(os.path.join(HERE, "chart-entry-prices.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
