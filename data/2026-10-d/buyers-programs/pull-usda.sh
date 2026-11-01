#!/bin/sh
# USDA Rural Development single-family housing INELIGIBLE areas (layer 4 "RHS SFH MFH") in a box around
# Horry County, and the Horry County boundary from Census TIGERweb. GeoJSON, WGS84. Run: sh pull-usda.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
BOX='{"xmin":-79.5,"ymin":33.3,"xmax":-78.4,"ymax":34.4,"spatialReference":{"wkid":4326}}'
curl -sS -A "Mozilla/5.0" -G "https://rdgdwe.sc.egov.usda.gov/arcgis/rest/services/Eligibility/Eligibility/MapServer/4/query" \
  --data-urlencode "geometry=$BOX" --data "geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=4326&f=geojson" \
  -o "$OUT/usda-sfh-ineligible-horry.geojson"
curl -sS -A "Mozilla/5.0" -G "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query" \
  --data "where=GEOID%3D%2745051%27&outFields=GEOID,NAME,AREALAND&outSR=4326&f=geojson" -o "$OUT/horry-county-boundary.geojson"
curl -sS -A "Mozilla/5.0" "https://rdgdwe.sc.egov.usda.gov/arcgis/rest/services/Eligibility/Eligibility/MapServer/4?f=json" -o "$OUT/usda-layer4-meta.json"
