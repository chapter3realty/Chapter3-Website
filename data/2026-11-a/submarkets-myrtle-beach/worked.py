#!/usr/bin/env python3
"""Worked example for /submarkets/myrtle-beach/: a typical one-bedroom in an oceanfront building inside the city, rented nightly by its owner.
Inputs only from findings.json (CRM asking prices in aggregate; tax rate) and AirROI's Myrtle Beach page (raw/airroi-myrtle-beach.txt).
No loan, rate or payment. The HOA fee and the unit's insurance are left as what the remainder must cover.
Run: python3 -I worked.py <datadir>   Writes <datadir>/worked-example.json"""
import sys, os, json
DD = sys.argv[1]
F = json.load(open(os.path.join(DD, "findings.json")))
price = F["listings"]["oceanfront_condos_inside"]["by_beds"]["1"]["median_ask"]
n = F["listings"]["oceanfront_condos_inside"]["by_beds"]["1"]["n"]
gross_1br_median = 17000          # AirROI "What each home size earns": 1 bedroom, typical annual revenue (median) $17,000
avg_gross, avg_costs = 25807, 9830  # AirROI profit table, average listing: gross bookings $25,807; total running costs $9,830
cost_share = avg_costs / avg_gross
running = round(gross_1br_median * cost_share)
tax = round(price * F["tax"]["per_100k_6pct"] / 100000)
left = gross_1br_median - running - tax
out = {"asking_price_median_1br_oceanfront_inside_city": price, "listings": n, "gross_bookings_1br_median": gross_1br_median,
       "running_cost_share": round(cost_share, 4), "running_costs": running, "property_tax_6pct_on_price": tax,
       "left_for_hoa_insurance_and_any_loan": left, "left_per_month": round(left / 12),
       "notes": "Running costs use AirROI's own share for its average Myrtle Beach listing (Airbnb fee, cleaning paid by the cleaning fee, utilities, supplies, repairs, STR insurance, permit), applied to the one-bedroom median. Lodging taxes are paid by the guest on top and are not in these figures. Tax is figured on the asking price, as /buyers/property-taxes/ does; the county's value may be lower."}
json.dump(out, open(os.path.join(DD, "worked-example.json"), "w"), indent=1)
print(out)
