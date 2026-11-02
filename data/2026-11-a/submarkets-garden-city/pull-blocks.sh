#!/bin/sh
# 2020 Census blocks along Waccamaw Drive (both counties): TIGERweb block polygons with POP100 and HU100, and DHC table H5
# (vacancy status) for every block in the four tracts the strip crosses. Run from the data folder: RAW=<scratch> sh pull-blocks.sh
curl -sS "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/12/query?where=1%3D1&geometry=-79.03,33.52,-78.97,33.60&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=GEOID,POP100,HU100,COUNTY,AREALAND&outSR=4326&f=geojson" -o "$RAW/blocks2020.geojson"
for tr in 45043920510 45051051202 45051051301 45051051302; do
  curl -sS "https://data.census.gov/api/access/data/table?id=DECENNIALDHC2020.H5&g=1400000US$tr\$1000000" -o "raw/census-H5-blocks-$tr.json"
done
