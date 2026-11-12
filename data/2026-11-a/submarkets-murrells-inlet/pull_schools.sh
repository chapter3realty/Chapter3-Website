#!/bin/sh
# Horry County Schools attendance areas, 2025-26 (the district's own ArcGIS service, owner hcsd1), in the Murrells Inlet box.
# Run: RAW=<scratch> sh pull_schools.sh   (Georgetown County's zones come from fetch_county.py, GCGIS_Education 4, 5, 6)
U=https://services2.arcgis.com/i2WjYhcoGsRr8Izd/arcgis/rest/services/Curent_and_Future_Attendance_Areas/FeatureServer
for i in 3 4 5; do
  curl -sS "$U/$i/query?where=1%3D1&geometry=-79.105,33.525,-78.950,33.700&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=school,schoolid,school_num&outSR=4326&geometryPrecision=6&f=geojson" -o "$RAW/h-school-$i.geojson"
  python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(sys.argv[1][-20:],[f['properties']['school'] for f in d['features']])" "$RAW/h-school-$i.geojson"
done
