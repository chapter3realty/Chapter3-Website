"""Horry County Master-in-Equity principal sale list (the county's public page), parsed,
joined to the county parcel layer for land use and the county's market value.
Run: python3 -I pull-mie.py   (fetches the page to raw/horry-mie-principal-<read>.html, writes raw/mie-sale.json)
Aggregate figures for the page are computed in build-findings.py. Addresses stay in raw/ and never go on the page.
"""
import json, re, html, urllib.request, urllib.parse, os, sys, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'https://www.horrycountysc.gov/departments/master-in-equity/principal-sales/'
P = 'https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query'
read = os.environ.get('READ_DATE', datetime.date.today().isoformat())
src = os.path.join(HERE, 'raw', f'horry-mie-principal-{read}.html')
if not os.path.exists(src):
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    open(src, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
s = open(src, encoding='utf-8').read()
txt = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))
m = re.search(r'Principal Sale ((?:Monday|Tuesday), \w+ \d+, \d{4})', txt)
sale_date = m.group(1) if m else None
i = s.find('<tbody class="mie">'); j = s.find('</tbody>', i)
rows = []
for tr in re.findall(r'<tr>(.*?)</tr>', s[i:j], re.S):
    tds = [html.unescape(re.sub(r'<[^>]+>', '', td)).strip() for td in re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)]
    pin = re.search(r'TMS=(\d+)', tr)
    r = dict(case=tds[0], special_referee=tds[1], address=tds[2], judgment=float(tds[6].replace('$', '').replace(',', '')),
             lien_type=tds[7], deficiency=tds[8], pin=pin.group(1) if pin else None)
    if r['pin']:
        q = urllib.parse.urlencode({'where': f"TMS='{r['pin']}'", 'f': 'json', 'returnGeometry': 'false',
                                    'outFields': 'PIN,TMS,LandUseCode,MarketProp,MarketImprv'})
        a = json.load(urllib.request.urlopen(P + '?' + q, timeout=60)).get('features', [])
        r['parcel'] = a[0]['attributes'] if a else None
    rows.append(r)
json.dump({'source': URL, 'read': read, 'sale_date': sale_date, 'rows': rows}, open(os.path.join(HERE, 'raw', 'mie-sale.json'), 'w'), indent=1)
print(sale_date, len(rows))
