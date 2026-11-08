"""Fetch today's assessment of each purchased home in RAW/pairs.json (Horry County GIS layer 24), to tell a home the buyer
lives in (assessed at 4 percent, the legal residence ratio) from one assessed at 6 percent.
Usage: OUT=<scratch dir with pairs.json> python3 -I fetch_assess.py   -> OUT/assess.json (owner names: stays outside the repo)"""
import os, json, time, urllib.request, urllib.parse, sys
OUT = os.environ["OUT"]
pins = sorted({p["buy"]["pin"] for p in json.load(open(os.path.join(OUT, "pairs.json")))})
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
F = "PIN,OwnerName,AssessedProp,TaxableProp,MarketProp,DeedBook,DeedPage"
have = {}
for i in range(0, len(pins), 300):
    data = urllib.parse.urlencode({"where": "PIN IN (" + ",".join(pins[i:i + 300]) + ")", "outFields": F, "returnGeometry": "false", "f": "json"}).encode()
    for k in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=180).read()); break
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(10)
    for x in d["features"]:
        a = x["attributes"]; have[str(int(a["PIN"])).zfill(11)] = a
json.dump(have, open(os.path.join(OUT, "assess.json"), "w"))
print(len(pins), "pins,", len(have), "fetched")
