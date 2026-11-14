"""Build findings.json for /buyers/relocating/myrtle-beach-vs-charleston/ from raw/. Run: python3 -I analyze.py <this folder>"""
import json, csv, sys, collections
D = sys.argv[1]; R = D + '/raw'
CH, MB, CHC, HC = '310M700US16700', '310M700US34820', '050XX00US45019', '050XX00US45051'
def acs(table, g, var):
    d = json.load(open(f'{R}/{table}-{g}.json'))['response']['data']; row = dict(zip(d[0], d[1])); return row[var]
out = {'generated_from': 'raw/ (see pull.sh)', 'acs_vintage': 'ACS 1-year 2025', 'metros': {}}
for name, g in [('charleston_metro', CH), ('myrtle_beach_metro', MB), ('charleston_county', CHC), ('horry_county', HC)]:
    m = {
        'population': int(acs('ACSDT1Y2025.B01003', g, 'B01003_001E')),
        'median_home_value': int(acs('ACSDT1Y2025.B25077', g, 'B25077_001E')),
        'median_home_value_moe': int(acs('ACSDT1Y2025.B25077', g, 'B25077_001M')),
        'median_real_estate_taxes_paid': int(acs('ACSDT1Y2025.B25103', g, 'B25103_001E')),
        'median_real_estate_taxes_moe': int(acs('ACSDT1Y2025.B25103', g, 'B25103_001M')),
        'median_household_income': int(acs('ACSDT1Y2025.B19013', g, 'B19013_001E')),
        'median_year_built': int(acs('ACSDT1Y2025.B25035', g, 'B25035_001E')),
        'median_gross_rent': int(acs('ACSDT1Y2025.B25064', g, 'B25064_001E')),
        'mean_commute_min': float(acs('ACSST1Y2025.S0801', g, 'S0801_C01_046E')),
        'commute_45_59_pct': float(acs('ACSST1Y2025.S0801', g, 'S0801_C01_044E')),
        'commute_60plus_pct': float(acs('ACSST1Y2025.S0801', g, 'S0801_C01_045E')),
        'work_from_home_pct': float(acs('ACSST1Y2025.S0801', g, 'S0801_C01_013E')),
        'workers_16plus': int(acs('ACSST1Y2025.S0801', g, 'S0801_C01_001E')),
    }
    m['commute_45plus_pct'] = round(m['commute_45_59_pct'] + m['commute_60plus_pct'], 1)
    m['value_to_income'] = round(m['median_home_value'] / m['median_household_income'], 2)
    out['metros'][name] = m
for g, key in [(CH, 'charleston_metro'), (MB, 'myrtle_beach_metro')]:
    d = json.load(open(f'{R}/ACSDP1Y2025.DP03-{g}.json'))['response']['data']; row = dict(zip(d[0], d[1]))
    out['metros'][key]['industry_pct'] = {
        'arts_recreation_accommodation_food': float(row['DP03_0043PE']), 'manufacturing': float(row['DP03_0035PE']),
        'professional_scientific_management': float(row['DP03_0041PE']), 'education_health': float(row['DP03_0042PE']),
        'construction': float(row['DP03_0034PE']), 'public_administration': float(row['DP03_0045PE'])}
    out['metros'][key]['median_earnings_workers'] = int(row['DP03_0092E'])
# Zillow ZHVI
rows = list(csv.reader(open(f'{R}/zhvi-metro.csv'))); h = rows[0]; dates = [c for c in h if c[:2] in ('19', '20')]
z = {}
for r in rows[1:]:
    if r[2] in ('Charleston, SC', 'Myrtle Beach, SC', 'United States'):
        v = dict(zip(h, r)); z[r[2]] = {dt: round(float(v[dt])) for dt in dates if v[dt]}
latest = dates[-1]
out['zhvi'] = {'latest_month': latest, 'series_name': 'ZHVI all homes (SFR+condo), mid tier, smoothed, seasonally adjusted, metro',
    'latest': {k: z[k][latest] for k in z}, 'july_2026': {k: z[k]['2026-07-31'] for k in z},
    'year_ago': {k: z[k][dates[-13]] for k in z}, 'ten_years_ago': {k: z[k][dates[-121]] for k in z}, 'ten_years_ago_month': dates[-121],
    'gap_latest': z['Charleston, SC'][latest] - z['Myrtle Beach, SC'][latest],
    'gap_ten_years_ago': z['Charleston, SC'][dates[-121]] - z['Myrtle Beach, SC'][dates[-121]],
    'chart_annual_sept': {dt[:4]: {'charleston': z['Charleston, SC'][dt], 'myrtle_beach': z['Myrtle Beach, SC'][dt]} for dt in dates if dt.endswith('-09-30') and dt >= '2016'}}
# Building permits 2025
for line in open(f'{R}/bps-cbsa2025a.txt', encoding='latin-1'):
    p = line.split(',')
    if len(p) > 8 and p[2] in ('16700', '34820'):
        k = 'charleston_metro' if p[2] == '16700' else 'myrtle_beach_metro'
        out['metros'][k]['permits_2025_single_family_units'] = int(p[6])
        out['metros'][k]['permits_2025_single_family_avg_construction_value'] = round(int(p[7]) * 1000 / int(p[6]))
        out['metros'][k]['permits_2025_total_units'] = int(p[6]) + int(p[9]) + int(p[12]) + int(p[15])
for k in ('charleston_metro', 'myrtle_beach_metro'):
    m = out['metros'][k]; m['sf_permits_per_1000_residents'] = round(m['permits_2025_single_family_units'] / m['population'] * 1000, 1)
# Beach accesses
fs = [f['attributes'] for f in json.load(open(f'{R}/beach-access-dhec-2023.json'))['features']]
cnt = collections.Counter(); area = collections.Counter(); blank = []
for a in fs:
    c = (a['County'] or '').strip().upper()
    if c in ('HORRY', 'CHARLESTON'):
        cnt[(c, (a['ACC_TYPE'] or '').strip() or 'blank')] += 1; area[(c, a['BEACH_AREA'])] += 1
        if not (a['ACC_TYPE'] or '').strip(): blank.append({k: a[k] for k in ('NAME', 'Beach_Name', 'BEACH_AREA', 'ADMIN', 'Notes')})
out['beach_access'] = {'by_county_type': {f'{k[0]}|{k[1]}': v for k, v in cnt.items()}, 'by_area': {f'{k[0]}|{k[1]}': v for k, v in area.items()}, 'horry_blank_type_rows': blank}
# FEMA penetration
out['nfip_penetration'] = json.load(open(f'{R}/openfema-penetration.json'))['NfipResidentialPenetrationRates']
# NOAA normals
nm = {}
for s in ('USW00093718', 'USW00013880'):
    a = json.load(open(f'{R}/normals-ann-{s}.json'))[0]; dd = json.load(open(f'{R}/normals-days-{s}.json'))[0]
    mm = {r['DATE']: r for r in json.load(open(f'{R}/normals-mly-{s}.json'))}
    nm[s] = {'name': a['NAME'], 'ann_high': float(a['ANN-TMAX-NORMAL']), 'ann_low': float(a['ANN-TMIN-NORMAL']), 'ann_precip_in': float(a['ANN-PRCP-NORMAL']),
             'ann_snow_in': float(a['ANN-SNOW-NORMAL']) if a.get('ANN-SNOW-NORMAL') else None,
             'days_90_plus': float(dd['ANN-TMAX-AVGNDS-GRTH090']), 'nights_32_or_below': float(dd['ANN-TMIN-AVGNDS-LSTH032']),
             'jan_high': float(mm['01']['MLY-TMAX-NORMAL']), 'jan_low': float(mm['01']['MLY-TMIN-NORMAL']),
             'jul_high': float(mm['07']['MLY-TMAX-NORMAL']), 'jul_low': float(mm['07']['MLY-TMIN-NORMAL'])}
out['normals_1991_2020'] = nm
# OSRM
def osrm(f):
    r = json.load(open(f'{R}/{f}'))['routes'][0]; return {'miles': round(r['distance'] / 1609.344, 1), 'minutes': round(r['duration'] / 60)}
out['drives_no_traffic'] = {'mb_city_hall_to_charleston_city_hall': osrm('osrm-mbcityhall-chscityhall.json'),
    'charleston_city_hall_to_sullivans_island': osrm('osrm-chscityhall-sullivans.json'),
    'charleston_city_hall_to_folly_beach_pier': osrm('osrm-chscityhall-folly.json'),
    'charleston_city_hall_to_isle_of_palms_front_beach': osrm('osrm-chscityhall-iop.json')}
json.dump(out, open(D + '/findings.json', 'w'), indent=1)
print(json.dumps(out, indent=1)[:6000])
