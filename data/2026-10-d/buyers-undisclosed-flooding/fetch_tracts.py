#!/usr/bin/env python3
"""Census tract outlines for Horry County from TIGERweb: current (2020) tracts and 2010 tracts.
The NFIP claims file mixes both vintages in censusGeoid. Run: python3 -I fetch_tracts.py
Writes raw/tracts-horry.json (2020) and raw/tracts-horry-2010.json (GEOID, NAME, geometry WGS84)."""
import json, os, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__))
P = urllib.parse.urlencode(
    {"where": "STATE='45' AND COUNTY='051'", "outFields": "GEOID,NAME,BASENAME,AREALAND", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.0005", "f": "json"})
for url, name in [("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/0/query?", "tracts-horry.json"),
                  ("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2010/MapServer/14/query?", "tracts-horry-2010.json")]:
    d = json.load(urllib.request.urlopen(url + P, timeout=300))
    json.dump(d["features"], open(os.path.join(HERE, "raw", name), "w"))
    print(name, len(d["features"]))
