#!/usr/bin/env python3
"""SC DES beachfront lines for Horry County beaches. Run: python3 -I fetch_beachfront.py
Writes raw/setback-current.json and raw/baseline-current.json (SC DES Shorelines MapServer layers 3 and 2, WGS84), and
raw/setback-layer-meta.json (layer 3 description)."""
import json, os, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, 'raw')
S = "https://gis.des.sc.gov/gisserver/rest/services/Shorelines/MapServer/%d"
HORRY = ['Waties', 'North Myrtle Beach', 'Briarcliffe Acres', 'Arcadian Shores', 'Myrtle Beach', 'Myrtle Beach State Park', 'Springmaid Beach', 'Surfside', 'Garden City']
def get(url, p=None):
    url += '?' + urllib.parse.urlencode(dict(p or {}, f='json'))
    return json.load(urllib.request.urlopen(url, timeout=120))
w = "Beach IN (%s)" % ",".join("'%s'" % b for b in HORRY)
for lid, name in ((3, 'setback-current.json'), (2, 'baseline-current.json')):
    d = get(S % lid + '/query', {'where': w, 'outFields': '*', 'returnGeometry': 'true', 'outSR': '4326'})
    json.dump(d['features'], open(os.path.join(RAW, name), 'w')); print(name, len(d['features']))
json.dump(get(S % 3, {}), open(os.path.join(RAW, 'setback-layer-meta.json'), 'w'))
