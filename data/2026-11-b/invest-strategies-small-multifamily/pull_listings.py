"""Active 2 to 4 unit listings from the site's own public map API (chapter3realty.com/homes/api/map?type=multi), for counts and medians in aggregate only.
Also asks the Horry County parcel layer (24) which land use code sits under each listing's point, so the county's deed records can be matched to the same kind of building.
Keeps MLS number (to drop duplicates), price, square feet, beds, baths, lat, lng, the town from the listing's city field, and the parcel's land use code. No street address, firm, photo or URL is saved.
Run: RAW=<scratch> python3 -I pull_listings.py <outdir>. Writes RAW/multi-active.json (kept outside the repo: MLS numbers and points)."""
import json, sys, os, time, subprocess, urllib.parse, datetime
out = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(out, "raw")); os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
P = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
def curl(url):
    for i in range(4):
        try: return json.loads(subprocess.run(["curl", "-sS", "-m", "90", url], capture_output=True, check=True).stdout)
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
d = curl(BASE + urllib.parse.urlencode({"type": "multi"}))
assert d["total"] == len(d["pins"]), (d["total"], len(d["pins"]))
homes = {}
for p in d["pins"]:
    parts = [x.strip() for x in (p.get("addr") or "").split(",")]
    town = parts[1] if len(parts) >= 3 else ""
    luc = None
    if p.get("lat") and p.get("lng"):
        q = curl(P + urllib.parse.urlencode({"geometry": "%f,%f" % (p["lng"], p["lat"]), "geometryType": "esriGeometryPoint", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outFields": "LandUseCode,MarketImprv", "returnGeometry": "false", "f": "json"}))
        luc = sorted({(f["attributes"]["LandUseCode"] or "") for f in q.get("features", [])})
    homes[p["mls"]] = {"price": num(p["price"]), "sqft": p.get("sqft") or None, "beds": p.get("beds"), "baths": p.get("baths"), "lat": p.get("lat"), "lng": p.get("lng"), "town": town, "tag": p.get("tag"), "status": p.get("status"), "luc": luc}
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": BASE + "type=multi", "mls_meta": d["meta"]["source"], "refreshed": d["meta"]["refreshedAt"], "api_total": d["total"], "homes": homes}, open(os.path.join(RAW, "multi-active.json"), "w"))
print("homes", len(homes))
