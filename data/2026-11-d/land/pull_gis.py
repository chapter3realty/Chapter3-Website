"""County zoning, town limits and FEMA flood zone under each Horry County land listing's map point, counted in aggregate.
Pins come from the CRM's public map API (type=land&has=county_horry, read by price bands as in pull_land.py). Each pin's map
point is sent to the Horry County GIS identify service (HorryCountyGISApp MapServer, layers 19 Flood Zones, 30 Zoning,
31 Municipalities). Nothing per listing is saved: the file keeps counts by zoning code, by flood zone and by town only.
The point is the listing's geocoded address, so a large tract can hold more than one zone; the count is of the point only.
Run: python3 -I pull_gis.py <this folder>. Writes gis.json."""
import json, sys, time, collections, urllib.request, urllib.parse, datetime
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
API = "https://chapter3realty.com/homes/api/map?"
GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/identify?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
def getj(url, pause):
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90))
            time.sleep(pause); return j
        except Exception:
            time.sleep(10)
    raise SystemExit("failed: " + url)
def api(p): return getj(API + urllib.parse.urlencode(p), 2.1)
pins = {}
def walk(base, a, b):
    j = api(dict(base, min=a, max=b))
    if j["total"] == 0: return
    if j["total"] < 144 or b - a < 1000:
        for p in j["pins"][: j["total"]]: pins[p["mls"]] = (p.get("lat"), p.get("lng"), p.get("acres"))
        return
    m = (a + b) // 2; walk(base, a, m); walk(base, m + 1, b)
base = {"type": "land", "has": "county_horry"}
n = api(base)["total"]; walk(base, 0, 50_000_000)
print("pins", n, len(pins), flush=True)
zoning, flood, town, sfha = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
zon_by_size = collections.defaultdict(collections.Counter)
no_point = 0
for k, (lat, lng, acres) in pins.items():
    if lat is None or lng is None: no_point += 1; continue
    q = {"geometry": f"{lng},{lat}", "geometryType": "esriGeometryPoint", "sr": 4326, "layers": "all:19,30,31", "tolerance": 0,
         "mapExtent": f"{lng-0.05},{lat-0.05},{lng+0.05},{lat+0.05}", "imageDisplay": "400,400,96", "returnGeometry": "false", "f": "json"}
    r = getj(GIS + urllib.parse.urlencode(q), 0.25).get("results", [])
    z = [x["attributes"].get("ZoningCode") for x in r if x["layerId"] == 30]
    f = [x["attributes"].get("FLD_ZONE") for x in r if x["layerId"] == 19]
    m = [x.get("value") for x in r if x["layerId"] == 31]
    zc = z[0] if z else "none"
    zoning[zc] += 1
    town[m[0] if m else "unincorporated"] += 1
    fz = sorted(set(x for x in f if x))
    flood["+".join(fz) if fz else "none"] += 1
    hi = any(x in ("A", "AE", "AO", "AH", "VE", "V") for x in fz)
    sfha["high_risk" if hi else "not_high_risk"] += 1
    try: a = float(acres)
    except (TypeError, ValueError): a = None
    band = "no_acres" if a is None else "under_1" if a < 1 else "1_to_5" if a < 5 else "5_plus"
    zon_by_size[band][zc] += 1
res = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "pins_total": n, "pins_read": len(pins), "no_point": no_point,
       "zoning_at_point": dict(zoning.most_common()), "town_at_point": dict(town.most_common()),
       "flood_zone_at_point": dict(flood.most_common()), "high_risk_flood_at_point": dict(sfha),
       "zoning_by_size": {k: dict(v.most_common()) for k, v in zon_by_size.items()},
       "sources": {"api": API + "type=land&has=county_horry&min=..&max=..", "gis": GIS.rstrip("?") + " layers 19, 30, 31"}}
json.dump(res, open(f"{OUT}/gis.json", "w"), indent=1)
print(json.dumps(res, indent=1))
