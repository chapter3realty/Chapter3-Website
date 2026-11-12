"""Census TIGERweb polygons for the areas on /invest/where-to-buy/: incorporated places (layer 4) and CDPs (layer 5)
in Horry and Georgetown counties, ZIP code tabulation areas (PUMA_TAD_TAZ_UGA_ZCTA layer 1 or 2), and the two county outlines.
Run: python3 -I fetch_areas.py <datadir>. Writes raw/places.json, raw/counties.json, raw/zctas.json."""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]; RAW = os.path.join(D, "raw"); os.makedirs(RAW, exist_ok=True)
def post(url, params):
    data = urllib.parse.urlencode(params).encode()
    for i in range(5):
        try:
            r = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=180).read())
            if "error" in r: raise Exception(r["error"])
            return r
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
BOX = {"geometry": "-79.45,33.25,-78.5,34.25", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects",
       "returnGeometry": "true", "outSR": "4326", "f": "json"}
T = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb"
out = []
for layer in (4, 5):
    r = post(f"{T}/Places_CouSub_ConCity_SubMCD/MapServer/{layer}/query", dict(BOX, where="STATE='45'", outFields="NAME,BASENAME,LSADC,GEOID"))
    out += [{"name": f["attributes"]["NAME"], "geoid": f["attributes"]["GEOID"], "layer": layer, "rings": f["geometry"]["rings"]} for f in r["features"]]
json.dump({"source": f"{T}/Places_CouSub_ConCity_SubMCD/MapServer/4 and /5 (current vintage)", "read": time.strftime("%Y-%m-%d"), "places": out}, open(os.path.join(RAW, "places.json"), "w"))
print(sorted(o["name"] for o in out))
r = post(f"{T}/State_County/MapServer/1/query", {"where": "STATE='45' AND COUNTY IN ('051','043')", "outFields": "NAME,GEOID", "returnGeometry": "true", "outSR": "4326", "f": "json", "maxAllowableOffset": "0.0005"})
json.dump({"source": f"{T}/State_County/MapServer/1", "read": time.strftime("%Y-%m-%d"), "counties": [{"name": f["attributes"]["NAME"], "geoid": f["attributes"]["GEOID"], "rings": f["geometry"]["rings"]} for f in r["features"]]}, open(os.path.join(RAW, "counties.json"), "w"))
print([f["attributes"]["NAME"] for f in r["features"]])
Z = ["29511","29526","29527","29528","29544","29545","29566","29568","29569","29572","29575","29576","29577","29579","29581","29582","29588","29585","29440"]
r = post(f"{T}/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1/query", {"where": "ZCTA5 IN (" + ",".join("'%s'" % z for z in Z) + ")", "outFields": "ZCTA5,GEOID", "returnGeometry": "true", "outSR": "4326", "f": "json", "maxAllowableOffset": "0.0003"})
json.dump({"source": f"{T}/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1", "read": time.strftime("%Y-%m-%d"), "zctas": [{"zcta": f["attributes"]["ZCTA5"], "rings": f["geometry"]["rings"]} for f in r["features"]]}, open(os.path.join(RAW, "zctas.json"), "w"))
print(sorted(f["attributes"]["ZCTA5"] for f in r["features"]))
