"""Compare the county's EvacuationZones_Horry polygons with SCEMD's Know Your Zone file.
Usage: python3 -I compare_evac_zones.py <county-evac.geojson> <scemd evac_zones.json>"""
import json, sys
from shapely.geometry import shape
a = {x["properties"]["Zone"]: shape(x["geometry"]).buffer(0) for x in json.load(open(sys.argv[1]))["features"]}
b = {x["properties"]["name"]: shape(x["geometry"]).buffer(0) for x in json.load(open(sys.argv[2]))["features"] if x["properties"]["county"] == "Horry"}
for z in "ABC":
    i = a[z].intersection(b[z]).area
    print(z, "shared share of county polygon", round(i / a[z].area, 4), "of SCEMD polygon", round(i / b[z].area, 4))
