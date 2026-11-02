"""Every derived number for /hoa/liens-and-foreclosure/, from the raw files. No address leaves raw/.
Run: python3 -I build-findings.py   (writes findings.json and the chart rows chart-*.json)"""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); R = lambda f: json.load(open(os.path.join(H, 'raw', f)))
LU = {'101': 'house', '107': 'condo unit', '109': 'townhouse', '110': 'house (other residential code 110)', '120': 'residential code 120', '130': 'residential code 130'}
mie = R('mie-sale.json')
rows = mie['rows']
hoa = [r for r in rows if r['lien_type'] == 'HOA']
mort = [r for r in rows if r['lien_type'] == 'Mortgage']
def ratio(r):
    p = r.get('parcel') or {}
    return round(100 * r['judgment'] / p['MarketProp'], 1) if p.get('MarketProp') else None
f = {'mie': {
    'source': mie['source'], 'read': mie['read'], 'sale_date': mie['sale_date'],
    'cases': len(rows), 'hoa_cases': len(hoa), 'mortgage_cases': len(mort),
    'hoa_land_use': sorted((r.get('parcel') or {}).get('LandUseCode') for r in hoa),
    'hoa_towns': sorted(r['address'].split(',')[-2].strip() for r in hoa),
    'hoa_judgments': sorted(round(r['judgment'], 2) for r in hoa),
    'hoa_judgment_min': min(r['judgment'] for r in hoa), 'hoa_judgment_max': max(r['judgment'] for r in hoa),
    'hoa_judgment_pct_of_county_value': sorted(ratio(r) for r in hoa),
    'hoa_county_values': sorted((r.get('parcel') or {}).get('MarketProp') for r in hoa),
    'hoa_deficiency_demanded': sum(r['deficiency'] == 'Yes' for r in hoa),
    'hoa_special_referee': sum(r['special_referee'] == 'Yes' for r in hoa),
    'mortgage_residential_judgments': sorted(round(r['judgment']) for r in mort if r['judgment'] < 1e6),
    'mortgage_cases_over_1m_excluded': sum(r['judgment'] >= 1e6 for r in mort),
}}
# Winrose v. Hale (S.C. 2019), the master's judgment, from the opinion's text (raw/winrose-v-hale-2019-27934.txt)
w = {'dues_owed': 250.00, 'interest': 80.87, 'litigation_costs': 542.80, 'attorney_fees': 2025.00, 'judgment': 2898.67,
     'winning_bid': 3036.00, 'fair_market_value': 128000, 'mortgage_balance': 66004, 'equity_claimed': 61996}
assert round(w['dues_owed'] + w['interest'] + w['litigation_costs'] + w['attorney_fees'], 2) == w['judgment']
w['judgment_over_dues'] = round(w['judgment'] / w['dues_owed'], 1)
w['fees_share_of_judgment_pct'] = round(100 * (w['litigation_costs'] + w['attorney_fees']) / w['judgment'], 1)
w['bid_pct_of_value'] = round(100 * w['winning_bid'] / w['fair_market_value'], 1)
w['bid_pct_of_equity'] = round(100 * w['winning_bid'] / w['equity_claimed'], 1)
f['winrose'] = w
lc = {x['label']: x['total'] for x in R('listings-counts.json')}
f['listings'] = {'all': lc['type=all has=-'], 'foreclosure': lc['type=all has=foreclosure'], 'condo': lc['type=condo has=-'],
                 'condo_foreclosure': lc['type=condo has=foreclosure'], 'house': lc['type=house has=-'], 'house_foreclosure': lc['type=house has=foreclosure'],
                 'short_sale': lc['type=all has=short_sale'], 'refreshedAt': R('listings-counts.json')[0]['refreshedAt']}
f['listings']['foreclosure_per_1000'] = round(1000 * f['listings']['foreclosure'] / f['listings']['all'], 1)
json.dump(f, open(os.path.join(H, 'findings.json'), 'w'), indent=1)
json.dump([{'part': 'Dues missed', 'dollars': w['dues_owed']}, {'part': 'Interest', 'dollars': w['interest']},
           {'part': 'Court costs', 'dollars': w['litigation_costs']}, {'part': 'Attorney fees', 'dollars': w['attorney_fees']}],
          open(os.path.join(H, 'chart-winrose-judgment.json'), 'w'), indent=1)
json.dump([{'lien': 'Association (HOA or condo)', 'cases': len(hoa)}, {'lien': 'Mortgage', 'cases': len(mort)}],
          open(os.path.join(H, 'chart-mie-sale-by-lien.json'), 'w'), indent=1)
print(json.dumps(f, indent=1))
