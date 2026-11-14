#!/bin/bash
# HUD Multifamily Properties - Assisted (HUD open data, ArcGIS), Horry and Georgetown counties.
# Only property-level aggregates are kept: name, city, client group, unit counts, wait months.
set -e
cd "$(dirname "$0")/raw"
B=https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/MULTIFAMILY_PROPERTIES_ASSISTED/FeatureServer/0/query
curl -sS --max-time 60 -G "$B" --data-urlencode "where=STD_ST='SC' AND CURCNTY_NM IN ('Horry','Georgetown','Horry County','Georgetown County')" \
 --data-urlencode "outFields=PROPERTY_NAME_TEXT,PLACED_BASE_CITY_NAME_TEXT,STD_CITY,CURCNTY_NM,CLIENT_GROUP_NAME,CLIENT_GROUP_TYPE,TOTAL_UNIT_COUNT,TOTAL_ASSISTED_UNIT_COUNT,IS_202_811_IND,MONTHS_WAITING,PCT_OCCUPIED,RENT_PER_MONTH,LAST_UPDT_DTTM" \
 --data-urlencode "returnGeometry=false" --data-urlencode "f=json" > hud-mf-assisted-horry-georgetown.json
