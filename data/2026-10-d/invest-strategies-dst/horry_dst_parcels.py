"""Horry County parcels whose owner name contains ' DST' (or 'DST ', or 'DELAWARE STAT').
Source: Horry County GIS, Parcels layer 24. Pulled 2026-11-01.
Run: python3 -I horry_dst_parcels.py > horry_dst_parcels.json
The summary (owners, count, total county market value, last sale dates) prints to stderr.
"""
import json, sys, urllib.request, urllib.parse, datetime
B = 'https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query'
q = urllib.parse.urlencode({'where': "OwnerName LIKE '% DST%' OR OwnerName LIKE 'DST %' OR OwnerName LIKE '%DELAWARE STAT%'",
    'outFields': '*', 'returnGeometry': 'true', 'outSR': '4326', 'f': 'json'})
with urllib.request.urlopen(B + '?' + q, timeout=120) as r:
    d = json.load(r)
print(json.dumps(d))
owners, total, recent = set(), 0, set()
for f in d['features']:
    a = f['attributes']; o = a['OwnerName'].split(' C/O')[0].strip(); owners.add(o)
    total += a['MarketProp'] or 0
    if a['SaleDate'] and datetime.datetime.utcfromtimestamp(a['SaleDate'] / 1000).date() >= datetime.date(2024, 11, 1):
        recent.add(o)
print(json.dumps({'parcels': len(d['features']), 'owners': len(owners), 'county_market_value_total': total,
                  'owners_with_last_sale_since_2024_11_01': len(recent)}), file=sys.stderr)
