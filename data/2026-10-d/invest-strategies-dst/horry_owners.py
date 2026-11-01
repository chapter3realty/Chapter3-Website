"""Horry County parcels with a building in land use codes 101, 107 and 109
(samples read 2026-11-01: 101 = lots with a house, 107 = condo units, 109 = townhouse lots),
counted by owner mailing state and by date of the last recorded deed.
Source: Horry County GIS, Parcels layer 24 (statistics queries).
Run: python3 -I horry_owners.py > horry_owners.json
"""
import json, urllib.request, urllib.parse
B = 'https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query'
def count(where):
    q = urllib.parse.urlencode({'where': where, 'f': 'json',
        'outStatistics': json.dumps([{'statisticType': 'count', 'onStatisticField': 'OBJECTID', 'outStatisticFieldName': 'n'}])})
    with urllib.request.urlopen(B + '?' + q, timeout=120) as r:
        return json.load(r)['features'][0]['attributes']['n']
base = "LandUseCode IN ('101','107','109') AND MarketImprv>0"
out = {}
for k, w in {
    'all': base,
    'owner_sc': base + " AND OwnerState='SC'",
    'owner_not_sc': base + " AND OwnerState<>'SC' AND OwnerState IS NOT NULL",
    'owner_state_blank': base + " AND OwnerState IS NULL",
    'condo_all': "LandUseCode='107' AND MarketImprv>0",
    'condo_not_sc': "LandUseCode='107' AND MarketImprv>0 AND OwnerState<>'SC' AND OwnerState IS NOT NULL",
    'not_sc_deed_before_2016_11_01': base + " AND OwnerState<>'SC' AND OwnerState IS NOT NULL AND SaleDate < DATE '2016-11-01'",
    'not_sc_deed_before_2011_11_01': base + " AND OwnerState<>'SC' AND OwnerState IS NOT NULL AND SaleDate < DATE '2011-11-01'",
    'not_sc_deed_before_2006_11_01': base + " AND OwnerState<>'SC' AND OwnerState IS NOT NULL AND SaleDate < DATE '2006-11-01'",
    'not_sc_no_deed_date': base + " AND OwnerState<>'SC' AND OwnerState IS NOT NULL AND SaleDate IS NULL",
}.items():
    out[k] = count(w)
print(json.dumps(out, indent=1))
