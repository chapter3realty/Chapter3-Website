# Builds the page's data tables from raw/ (run: python3 -I build.py from this folder's parent or anywhere).
import json, os, collections
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, 'raw')
def J(f): return json.load(open(os.path.join(R, f)))
out = {}
# 1. Costs: CareScout 2025 survey
mb, sc, us = J('carescout-myrtle-beach-area.json'), J('carescout-sc.json'), J('carescout-national.json')
keys = ['assisted_living','nursing_home_semi_private','nursing_home_private','home_care_services','adult_day_care']
out['costs'] = {'year': mb['year'], 'area': mb['area'], 'monthly': {k: {'myrtle_beach_area': mb['monthly_costs'][k], 'sc': sc['monthly_costs'][k], 'us': us['monthly_costs'][k]} for k in keys},
  'annual_myrtle_beach_area': {k: mb['annual_costs'][k] for k in keys}, 'home_care_hourly': mb['hourly_costs']['home_care_services'],
  'al_growth_pct_mb': mb['annual_growth_rates']['assisted_living']}
msas = J('carescout-sc-msas.json')['cities']
out['al_by_sc_area'] = sorted([{'area': c.get('area') or c['full_name'], 'al_monthly': c['monthly_costs']['assisted_living']} for c in msas if c['monthly_costs']['assisted_living']], key=lambda x: -x['al_monthly'])
# 2. Licensed facilities, DPH
fac = [f['attributes'] for f in J('dph-facilities-horry-georgetown.json')['features']]
def city(a):
    c = (a['LF_STREET_CITY'] or '').upper().replace('MURRELS', 'MURRELLS')
    return c.title()
rows = []
for a in fac:
    rows.append({'type': {'HLRESIDENTIALCARE':'assisted living (CRCF)','HLNURSINGCARE':'nursing home','HLADULTDAYCARE':'adult day care','HLHOSPICEFACILITY':'hospice facility'}[a['PERMIT_TYPE']],
      'name': a['LF_NAME'], 'city': city(a), 'county': a['LF_STREET_COUNTY'], 'zip5': (a['LF_STREET_ZIP'] or '')[:5],
      'licensed': a['NBR_LICENSED'], 'alzheimer_unit': a['CRC_ALZHEIMER_UNIT'] or a['NH_ALZHEIMER_UNIT'], 'alzheimer_care': a['CRC_ALZHEIMER_CARE'] or a['NH_ALZHEIMER_CARE'],
      'cms_certified': a['CMSCERT_IND'], 'evacuation_zone': a['Evacuation_Zone'], 'license': a['LICENSE_NBR'], 'expires': a['LICENSE_EXPIRES']})
out['facilities'] = sorted(rows, key=lambda r: (r['type'], r['county'], r['city'], r['name']))
by = collections.defaultdict(lambda: collections.Counter())
for r in rows:
    k = (r['county'], r['city'])
    if r['type'].startswith('assisted'):
        by[k]['al'] += 1; by[k]['al_beds'] += r['licensed'] or 0
        if r['alzheimer_unit'] == 'Y': by[k]['al_memory_units'] += 1
    elif r['type'] == 'nursing home':
        by[k]['nh'] += 1; by[k]['nh_beds'] += r['licensed'] or 0
    elif r['type'] == 'adult day care':
        by[k]['adc'] += 1
out['by_town'] = [dict(county=k[0], city=k[1], **v) for k, v in sorted(by.items(), key=lambda kv: (kv[0][0] != 'Horry', -kv[1]['al_beds']))]
def tot(county=None):
    c = collections.Counter()
    for k, v in by.items():
        if county is None or k[0] == county: c.update(v)
    return dict(c)
out['totals'] = {'horry': tot('Horry'), 'georgetown': tot('Georgetown'), 'both': tot()}
# Grand Strand towns only (drops inland Georgetown city, Hemingway, Andrews)
gs = {('Horry', c) for (cty, c) in by if cty == 'Horry'} | {('Georgetown','Murrells Inlet'), ('Georgetown','Pawleys Island')}
c = collections.Counter()
for k in gs:
    if k in by: c.update(by[k])
out['totals']['grand_strand_towns'] = dict(c)
st = [f['attributes'] for f in J('dph-crcf-statewide.json')['features']]
out['statewide_crcf'] = {'count': len(st), 'beds': sum(a['NBR_LICENSED'] or 0 for a in st),
  'horry_count': sum(1 for a in st if a['LF_STREET_COUNTY']=='Horry'), 'horry_beds': sum(a['NBR_LICENSED'] or 0 for a in st if a['LF_STREET_COUNTY']=='Horry'),
  'alz_units': sum(1 for a in st if a['CRC_ALZHEIMER_UNIT']=='Y')}
cnt = collections.Counter(a['LF_STREET_COUNTY'] for a in st); beds = collections.Counter()
for a in st: beds[a['LF_STREET_COUNTY']] += a['NBR_LICENSED'] or 0
out['statewide_crcf']['rank_by_beds'] = beds.most_common(8)
# 3. CCRCs, SC Consumer Affairs
import openpyxl
wb = openpyxl.load_workbook(os.path.join(R, 'scdca-ccrc-2026-11.xlsx'), read_only=True); ws = wb.active
cc = [r for r in ws.iter_rows(min_row=6, values_only=True) if r and r[0]]
out['ccrc'] = {'statewide': len(cc), 'grand_strand': [dict(name=r[0].strip(), city=r[3].title()) for r in cc if r[3].upper() in ('MYRTLE BEACH','PAWLEYS ISLAND','CONWAY','NORTH MYRTLE BEACH','MURRELLS INLET','LITTLE RIVER','SURFSIDE BEACH','GARDEN CITY')]}
# 4. HUD-assisted apartments for older adults
hud = [f['attributes'] for f in J('hud-mf-assisted-horry-georgetown.json')['features']]
eld = [a for a in hud if a['CLIENT_GROUP_TYPE'] == 'Elderly']
out['hud_elderly'] = [dict(name=a['PROPERTY_NAME_TEXT'], city=a['STD_CITY'].strip(), county=a['CURCNTY_NM'].strip(), units=a['TOTAL_UNIT_COUNT'], group=a['CLIENT_GROUP_NAME']) for a in eld]
json.dump(out, open(os.path.join(H, 'senior-living.json'), 'w'), indent=1)
print(json.dumps({k: out[k] for k in ['costs','al_by_sc_area','by_town','totals','statewide_crcf','ccrc','hud_elderly']}, indent=1))
