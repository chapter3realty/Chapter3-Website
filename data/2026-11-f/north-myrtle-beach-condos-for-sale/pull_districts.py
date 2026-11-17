"""Which tax districts are inside the City of Myrtle Beach. For each tax district seen on condo deeds, take 5 parcels, read the parcel's center
and ask the county Municipalities layer 31 (NAME) which city holds that point. Writes raw/district-city.json."""
import json, urllib.request, urllib.parse, collections, sys
H = {"User-Agent": "Mozilla/5.0"}
def get(u, q): return json.load(urllib.request.urlopen(urllib.request.Request(u + "?" + urllib.parse.urlencode(q), headers=H), timeout=120))
P = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"; M = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/31/query"
dist = json.load(open("raw/sales-districts.json"))["districts"]
out = {}
for d in dist:
    r = get(P, {"where": "TaxDistrict='%s' AND LandUseCode LIKE '1%%'" % d, "outFields": "PIN", "returnGeometry": "true", "outSR": "4326", "resultRecordCount": 7, "f": "json"})
    c = collections.Counter()
    for f in r["features"]:
        ring = f["geometry"]["rings"][0]; x = sum(p[0] for p in ring) / len(ring); y = sum(p[1] for p in ring) / len(ring)
        m = get(M, {"geometry": "%f,%f" % (x, y), "geometryType": "esriGeometryPoint", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outFields": "NAME", "returnGeometry": "false", "f": "json"})
        c[(m["features"][0]["attributes"]["NAME"] if m["features"] else "unincorporated")] += 1
    out[d] = {"parcels_in_deed_set": dist[d], "city_of_sample": dict(c)}
json.dump(out, open("raw/district-city.json", "w"), indent=1)
for d, v in out.items(): print(d, v)
