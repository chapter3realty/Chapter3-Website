#!/usr/bin/env python3
"""Yearly cost of owning the middle house and the middle condo, by area, besides the mortgage. Builds examples.json,
the one file the page's table, chart and worked example read. Nothing here is typed from memory: every input is a
data file or a verified ledger row (batches/2026-11-a/buyers-cost-to-own/facts.md names the row for each constant).

Inputs (paths relative to the website repo root, passed as argv[1]):
  data/2026-10-d/sell-home-value/findings.json      middle resale price by area (SHV ledger rows 2 and 3, verified)
  data/2026-11-a/buyers-cost-to-own/pums-2024-1yr.json        what Horry owners pay: insurance, utilities (Census ACS PUMS)
  data/2026-11-a/buyers-cost-to-own/hoa-by-area.json          middle HOA fee of homes for sale, by ZIP (CRM, aggregate)
  data/2026-11-a/buyers-cost-to-own/flood-by-area.json        FEMA flood policy cost by zone (OpenFEMA)
  data/2026-11-a/buyers-cost-to-own/ahs-2023-maintenance.json, ahs-2023-replacements.json   upkeep (Census AHS 2023)
Tax model: the site's own calculator (/buyers/property-taxes/, /buyers/cost-to-own/): 4 percent of value x (levy - 109.1
school operating mills), less the City of Myrtle Beach credit of 53.4 percent of its 83.4-mill levy on a 4 percent home;
6 percent of value x the full levy. Levies: Horry County Auditor, 2026 Horry County Tax Levies (certified 7/27/2026).
Flat fees on the bill, kept as their own line: unincorporated stormwater $89.40 (on house and condo bills: the Little River sample bill is a condo; one Carolina Forest district 800 sample bill carried no fee); Surfside Beach $82.00 (2026 sample bills).
The county taxes its own value, not the price; after a sale the value resets toward the price (CM ledger row 15).
Usage: python3 -I build_examples.py <website repo root>"""
import json, os, sys
R = sys.argv[1]
D = os.path.join(R, 'data/2026-11-a/buyers-cost-to-own')
shv = json.load(open(os.path.join(R, 'data/2026-10-d/sell-home-value/findings.json')))
pums = json.load(open(os.path.join(D, 'pums-2024-1yr.json')))['groups']
hoa = json.load(open(os.path.join(D, 'hoa-by-area.json')))
# Verifier 2026-11-02 (ledger rows 4, 25): pull_hoa.py's first cut() never tested $0, so a median or quartile
# of $0 printed as $25. The file's own no-fee count settles it: where the listings with no fee reach the share,
# the value is $0. pull_hoa.py is fixed; this keeps the verified pull of 2026-11-02 (the ZIP figures the verifier
# re-tested) instead of a later pull whose counts have moved.
for z, a in hoa['areas'].items():
    for kind, r in a.items():
        if not isinstance(r, dict) or 'no_hoa' not in r: continue
        for key, share in (('q1', .25), ('median', .5), ('q3', .75)):
            if r['no_hoa'] >= r['listings'] * share: r[key] = 0
# The 15 Horry County ZIPs together (the whole feed also holds Georgetown, Marion, Dillon and NC ZIPs): from the
# fixed pull_hoa.py's run of 2026-11-02, file hoa-horry.json.
hoa['horry'] = json.load(open(os.path.join(D, 'hoa-horry.json')))['horry']
flood = json.load(open(os.path.join(D, 'flood-by-area.json')))
ahs = json.load(open(os.path.join(D, 'ahs-2023-maintenance.json')))['groups']
rep = json.load(open(os.path.join(D, 'ahs-2023-replacements.json')))

SCHOOL_OPS, MB_CITY, MB_CREDIT = 109.1, 83.4, 0.534
TAX = {  # tax area -> (full 2026 levy in mills, city levy that gets the MB credit, flat fee on the bill)
    'City of Myrtle Beach': (254.6, MB_CITY, 0.0),
    'North Myrtle Beach': (221.2, 0, 0.0),
    'Conway': (272.5, 0, 0.0),
    'Surfside Beach': (214.2, 0, 82.0),
    'Garden City (unincorporated)': (207.3, 0, 89.40),
    'Unincorporated Horry County': (201.0, 0, 89.40),
}
def fee(area): return TAX[area][2]
def tax(value, area, legal_residence):
    """Tax only, without the flat fee (the same parts as /buyers/common-mistakes/ row 12 and /buyers/property-taxes/)."""
    levy, city, _ = TAX[area]
    if legal_residence:
        t = value * 0.04 * (levy - SCHOOL_OPS) / 1000 - value * 0.04 * city / 1000 * MB_CREDIT
    else:
        t = value * 0.06 * levy / 1000
    return round(t)

by_area = {a['area']: a for a in shv['by_area']}
# place on the page -> (SHV area, tax area, CRM ZIP for the HOA fee)
HOUSES = [('Carolina Forest', 'Carolina Forest', 'Unincorporated Horry County', '29579'),
          ('Conway', 'Conway (city)', 'Conway', '29526'),
          ('Myrtle Beach', 'Myrtle Beach (city)', 'City of Myrtle Beach', '29577'),
          ('North Myrtle Beach', 'North Myrtle Beach (city)', 'North Myrtle Beach', '29582'),
          ('Socastee', 'Socastee', 'Unincorporated Horry County', '29588')]
CONDOS = [('Myrtle Beach', 'Myrtle Beach (city)', 'City of Myrtle Beach', '29577'),
          ('North Myrtle Beach', 'North Myrtle Beach (city)', 'North Myrtle Beach', '29582'),
          ('Garden City', 'Garden City', 'Garden City (unincorporated)', '29576'),
          ('Little River', 'Little River', 'Unincorporated Horry County', '29566'),
          ('Carolina Forest', 'Carolina Forest', 'Unincorporated Horry County', '29579')]

ins_house = pums['house_detached']['INSP']['median']             # yearly, Horry owners of a one-family house
ins_condo = pums['apartment_building_3plus']['INSP']['median']   # yearly, Horry owners of a unit in a building of 3+
elec_house = pums['house_detached']['ELEP']['median'] * 12
water_house = pums['house_detached']['WATP']['median']
elec_condo = pums['apartment_building_3plus']['ELEP']['median'] * 12
water_condo = pums['apartment_building_3plus']['WATP']['median']
upkeep_house = ahs['SouthAtlantic']['yearly']['mean'] + rep['mean_yearly_spend_on_these_jobs_per_home']
upkeep_condo = ahs['SouthAtlantic_owned_unit_in_building_of_3plus']['yearly']['mean']

def row(kind, name, shv_area, tax_area, z):
    price = by_area[shv_area][kind]['median']
    h = hoa['areas'][z][kind]
    fee_m = h.get('median')
    ins, up = (ins_house, upkeep_house) if kind == 'house' else (ins_condo, upkeep_condo)
    t4, t6 = tax(price, tax_area, True), tax(price, tax_area, False)
    hoa_y = fee_m * 12 if fee_m is not None else None
    f = fee(tax_area)
    own = t4 + f + ins + (hoa_y or 0) + up
    return {'place': name, 'kind': kind, 'middle_price': price, 'sales': by_area[shv_area][kind]['n'], 'tax_area': tax_area,
            'tax_legal_residence': t4, 'tax_second_home': t6, 'fee_on_tax_bill': f, 'insurance': ins, 'hoa_zip': z, 'hoa_listings': h['listings'],
            'hoa_monthly_middle': fee_m, 'hoa_yearly': hoa_y, 'upkeep': up,
            'total_legal_residence': own, 'total_second_home': own - t4 + t6,
            'total_per_month_legal_residence': round(own / 12)}

county_house = shv['county_all']['resale_house']['median']
county_condo = shv['county_all']['resale_condo']['median']
# Verifier 2026-11-02: the whole feed ('all') holds Georgetown, Marion, Dillon and NC ZIPs; use the 15 Horry ZIPs ('horry').
hc = hoa['horry']['house']['median'] * 12; cc = hoa['horry']['condo']['median'] * 12
worked = {}
for label, area in (('unincorporated', 'Unincorporated Horry County'), ('city_of_myrtle_beach', 'City of Myrtle Beach')):
    t4 = tax(county_house, area, True)
    tot = t4 + fee(area) + ins_house + hc + upkeep_house
    worked[label] = {'price': county_house, 'tax_legal_residence': t4, 'tax_second_home': tax(county_house, area, False), 'fee_on_tax_bill': fee(area),
                     'insurance': ins_house, 'hoa_yearly': hc, 'upkeep': upkeep_house, 'total': tot, 'total_per_month': round(tot / 12),
                     'total_second_home': tot - t4 + tax(county_house, area, False),
                     'utilities': elec_house + water_house, 'total_with_utilities': tot + elec_house + water_house,
                     'check_vs_census_paid_off_house': {'same_parts_as_census_no_upkeep_per_month': round((tot - upkeep_house + elec_house + water_house) / 12),
                         'census_median_per_month': pums['house_detached_no_mortgage']['SMOCP']['median']}}
worked['condo_unincorporated'] = {'price': county_condo, 'tax_legal_residence': tax(county_condo, 'Unincorporated Horry County', True), 'fee_on_tax_bill': fee('Unincorporated Horry County'),
    'insurance': ins_condo, 'hoa_yearly': cc, 'upkeep': upkeep_condo}
worked['condo_unincorporated']['total'] = sum(worked['condo_unincorporated'][k] for k in ('tax_legal_residence', 'fee_on_tax_bill', 'insurance', 'hoa_yearly', 'upkeep'))
# Condo water rests on 36 records (verifier, ledger row 33): cut. Condo utilities = electricity only.
worked['condo_unincorporated']['utilities'] = elec_condo

# The chart: the same $350,000 house, tax only, as your home and as a second home, in each tax area.
chart = [{'tax_area': a, 'legal_residence': tax(county_house, a, True), 'second_home': tax(county_house, a, False),
          'times': round(tax(county_house, a, False) / tax(county_house, a, True), 1)} for a in TAX]

cf = flood['county']
out = {'rule': __doc__, 'houses': [row('house', *h) for h in HOUSES], 'condos': [row('condo', *c) for c in CONDOS],
       'worked_example': worked, 'tax_chart_same_house': {'value': county_house, 'rows': chart},
       'flood_extra': {'house_lived_in_outside_high_risk': cf['house|lived in']['X']['median'],
                       'house_lived_in_high_risk_A': cf['house|lived in']['A']['median'],
                       'house_not_lived_in_high_risk_A': cf['house|not lived in']['A']['median'],
                       'condo_unit_lived_in_outside_high_risk': cf['condo_unit|lived in']['X']['median']},
       'utilities': {'house_electric_year': elec_house, 'house_water_year': water_house, 'condo_electric_year': elec_condo},
       'paid_off_house_month': {'horry': pums['house_detached_no_mortgage']['SMOCP'], 'note': 'ACS selected monthly owner costs, no mortgage: tax, insurance, utilities, fuels, HOA or condo fee. No upkeep.'}}
json.dump(out, open(os.path.join(D, 'examples.json'), 'w'), indent=1)
for r in out['houses'] + out['condos']:
    print(f"{r['kind']:5} {r['place']:18} ${r['middle_price']:>8,} fee {r['fee_on_tax_bill']} tax4 {r['tax_legal_residence']:>5} tax6 {r['tax_second_home']:>5} ins {r['insurance']} hoa {r['hoa_yearly']} up {r['upkeep']} = {r['total_legal_residence']:>6} ({r['total_per_month_legal_residence']}/mo); 2nd {r['total_second_home']}")
print(json.dumps(worked, indent=1)); print(json.dumps(chart, indent=1))
