"""Common-area (C/A) land parcel of a regime in Horry County layer 24: acreage and the length of its longest side
roughly parallel to the beach (the shore here runs about 40 degrees east of north). Usage: county_land_extent.py "<REGIME>" """
import json, math, sys, urllib.parse, urllib.request
URL = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": f"LegalDescr LIKE '{sys.argv[1]};%' AND Acreage > 0", "outFields": "LandUseCode,Acreage,LegalDescr", "returnGeometry": "true", "outSR": "4326", "f": "json"}
u = URL + "?" + urllib.parse.urlencode(q); print(u)
for ft in json.load(urllib.request.urlopen(u, timeout=60))["features"]:
    a = ft["attributes"]; ring = ft["geometry"]["rings"][0]; lat0 = ring[0][1]
    pts = [(math.radians(x) * math.cos(math.radians(lat0)) * 20902231, math.radians(y) * 20902231) for x, y in ring]
    ang = math.radians(40); proj = [px * math.sin(ang) + py * math.cos(ang) for px, py in pts]
    print(a, "extent along the shore (ft):", round(max(proj) - min(proj)))
