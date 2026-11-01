#!/usr/bin/env python3
"""Pull Horry County (FIPS 45051) rows from OpenFEMA. Run: python3 -I fetch_fema.py
Writes raw/nfip-claims-horry.json, raw/nfip-multiple-loss-horry.json, raw/hma-sites-horry.json (+ metadata).
'python3 -I fetch_fema.py small' also writes raw/hma-subapps-horry.json (HMA subapplications benefiting Horry),
raw/nfip-penetration-horry.json (residential NFIP take-up, Horry and Georgetown) and raw/nfip-claims-fields.json (data dictionary)."""
import json, os, sys, time, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get('RAW', os.path.join(HERE, 'raw'))  # big raw files live outside the repo; set RAW to a scratch folder
BASE = 'https://www.fema.gov/api/open'

def pull(path, flt, out, key):
    rows, skip = [], 0
    meta = None
    while True:
        q = urllib.parse.urlencode({'$filter': flt, '$top': 10000, '$skip': skip, '$inlinecount': 'allpages'}, quote_via=urllib.parse.quote)
        url = f'{BASE}/{path}?{q}'
        for i in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'chapter3-research'}), timeout=180) as r:
                    d = json.load(r); break
            except Exception as e:
                print('retry', e, file=sys.stderr); time.sleep(5)
        meta = d['metadata']; batch = d[key]
        rows += batch; skip += len(batch)
        print(path, skip, '/', meta.get('count'), file=sys.stderr)
        if not batch or skip >= meta.get('count', 0): break
    json.dump({'source': f'{BASE}/{path}', 'filter': flt, 'pulled': meta['rundate'], 'count': meta.get('count'), 'rows': rows}, open(os.path.join(RAW, out), 'w'))

if __name__ == '__main__':
    if 'claims' in sys.argv[1:] or len(sys.argv)==1: pull('v3/NfipClaims', "countyCode eq '45051'", 'nfip-claims-horry.json', 'NfipClaims')
    if len(sys.argv)==1 or 'other' in sys.argv[1:]: pull('v1/NfipMultipleLossProperties', "fipsCountyCode eq '45051'", 'nfip-multiple-loss-horry.json', 'NfipMultipleLossProperties')
    if len(sys.argv)==1 or 'other' in sys.argv[1:]: pull('v1/HmaSubapplicationsProjectSiteInventories', "stateAbbreviation eq 'SC' and county eq 'Horry'", 'hma-sites-horry.json', 'HmaSubapplicationsProjectSiteInventories')
    if 'small' in sys.argv[1:]:
        for path, q, out in [('v2/HmaSubapplications', {'$filter': "subapplicantStateAbbreviation eq 'SC' and substringof('Horry',benefitingCounties)", '$top': 1000}, 'hma-subapps-horry.json'),
                             ('v1/NfipResidentialPenetrationRates', {'$filter': "fipsCode eq '45051' or fipsCode eq '45043'"}, 'nfip-penetration-horry.json'),
                             ('v1/OpenFemaDataSetFields', {'$filter': "openFemaDataSet eq 'NfipClaims' and datasetVersion eq 3", '$top': 200}, 'nfip-claims-fields.json')]:
            url = f'{BASE}/{path}?' + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)
            open(os.path.join(RAW, out), 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'chapter3-research'}), timeout=180).read())
            print(out, file=sys.stderr)
