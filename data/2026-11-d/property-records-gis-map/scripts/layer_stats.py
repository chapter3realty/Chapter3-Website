# Aggregate statistics from the county's public parcel map service (no owner or address values saved).
import json, sys, urllib.request, urllib.parse
B = 'https://www.horrycountysc.gov/parcelapp/rest/services/HorryCountyGISApp/MapServer'
def q(layer, **p):
    p.setdefault('f', 'json')
    u = f'{B}/{layer}/query?' + urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(u, timeout=120))
def count(layer, where='1=1'):
    return q(layer, where=where, returnCountOnly='true').get('count')
def group(layer, field, where='1=1'):
    d = q(layer, where=where, groupByFieldsForStatistics=field,
          outStatistics=json.dumps([{'statisticType': 'count', 'onStatisticField': 'OBJECTID', 'outStatisticFieldName': 'n'}]))
    if 'error' in d: return d
    return sorted([[f['attributes'][field], f['attributes']['n']] for f in d['features']], key=lambda r: -r[1])
def stat(layer, field, kind):
    d = q(layer, where='1=1', outStatistics=json.dumps([{'statisticType': kind, 'onStatisticField': field, 'outStatisticFieldName': 'v'}]))
    return d.get('features', [{}])[0].get('attributes', {}).get('v') if 'features' in d else d
out = {}
out['parcels_count'] = count(24)
out['parcels_by_type'] = group(24, 'PARCELTYPE')
out['parcels_max_saledate_ms'] = stat(24, 'SaleDate', 'max')
out['parcels_by_taxdistrict'] = group(24, 'TaxDistrict')
out['flood_zones_by_code'] = group(19, 'FLD_ZONE')
out['flood_zones_by_sfha'] = group(19, 'SFHA_TF')
out['retired_parcels_count'] = count(23)
out['parcel_lot_count'] = count(40)
out['pin_numbers_count'] = count(25)
out['address_points_count'] = count(22)
out['line_dimensions_count'] = count(26)
out['line_dimensions_by_type'] = group(26, 'LINETYPE')
out['building_footprints_count'] = count(27)
out['zoning_polygons'] = count(30)
out['zoning_codes'] = group(30, 'ZoningCode')
out['zoning_last_edited_ms'] = stat(30, 'last_edited_date', 'max')
out['zoning_overlays'] = group(29, 'NAME')
out['airport_overlays'] = group(41, 'NAME')
out['spoilage_by_easement'] = group(32, 'EASEMENT')
out['future_land_use'] = group(36, 'FLU_MAP')
out['contour_values_count'] = count(37)
out['contour_min'] = stat(37, 'Contour', 'min'); out['contour_max'] = stat(37, 'Contour', 'max')
out['soils_count'] = count(38)
out['soil_names'] = group(38, 'MUNAME')
out['i73_count'] = count(39)
out['watersheds'] = group(35, 'Name')
json.dump(out, open(sys.argv[1], 'w'), indent=1, default=str)
for k, v in out.items():
    s = json.dumps(v, default=str)
    print(k, ':', s[:300])
