#!/usr/bin/env python3
"""Walking and driving routes for /submarkets/myrtle-beach/market-common/ on OpenStreetMap roads and paths.
Walks: the public OSRM foot router (routing.openstreetmap.de/routed-foot); drives: the public OSRM car router (router.project-osrm.org),
free flow (no traffic). Points from OpenStreetMap Nominatim, read 2026-11-08 (osm refs below).
Start for walks to the town center and for every drive: Valor Memorial Garden (Valor Park), the green in the middle of the town center
(OSM way 135902427 centroid). Neighborhood starts: the middle (median longitude and latitude) of each neighborhood's homes from
analyze.py's parcels (RAW/parcels.json; the same legal-description groups).
Run: RAW=<scratch> python3 -I pull_routes.py <this dir>. Writes raw/routes.json."""
import sys, os, json, time, re, statistics, urllib.request
from shapely.geometry import Polygon
from shapely.ops import unary_union
D = sys.argv[1]; RAW = os.environ["RAW"]
VALOR = (-78.939846, 33.667827)
WALK_TO = {  # name: (osm ref, lon, lat)
    "Grand Park (lake path)": ("way 216532168", -78.943764, 33.666653),
    "Savannah's Playground": ("way 605396855", -78.942482, 33.665614),
    "Crabtree Gymnasium": ("way 254374485", -78.9431, 33.665447),
    "Barc Park South (dog park)": ("way 559200619", -78.93587, 33.657768),
    "Warbird Park": ("way 928362892", -78.927936, 33.660849),
    "Food Lion, 3800 South Kings Highway": ("node 2700411758", -78.934236, 33.656662),
    "Horry-Georgetown Technical College, Grand Strand campus": ("way 166970517", -78.943703, 33.660754),
    "Myrtle Beach Police Department annex, Mustang Street": ("way 637580481", -78.934658, 33.669589),
    "Beach access at 29th Avenue South (ocean end)": ("way 891816240 east end", -78.914562, 33.6611741),
}
DRIVE_TO = dict(WALK_TO, **{
    "Walmart Neighborhood Market, 3650 Walton Drive": ("way 911703167", -78.956998, 33.684653),
    "Publix, 955 Wood Duck Drive": ("node 11578840177", -78.968922, 33.663707),
    "Myrtle Beach International Airport terminal": ("way 308490784", -78.922789, 33.681467),
    "Coastal Grand Mall": ("way 24816289", -78.922317, 33.702751),
    "Broadway at the Beach": ("way 24816290", -78.880761, 33.71627),
    "Grand Strand Regional Medical Center": ("way 452337849", -78.81947, 33.75808),
    "South Strand Medical Center": ("way 452337850", -78.970946, 33.66755),
    "Carolina Forest Public Library": ("way 632179812", -78.8910164, 33.7598848),
    "Surfside Beach Pier": ("Surfside page pull_drives.py START", -78.9717534, 33.6049921),
    "Myrtle Beach State Park beach": ("way 135693662", -78.92805, 33.648586),
})
def route(prof, a, b):
    base = "https://routing.openstreetmap.de/routed-foot/route/v1/driving/" if prof == "foot" else "https://router.project-osrm.org/route/v1/driving/"
    u = base + "%f,%f;%f,%f?overview=false" % (a[0], a[1], b[0], b[1])
    for i in range(6):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["routes"][0]
            return {"minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 2), "url": u}
        except Exception as e:
            time.sleep(3)
    return {"error": u}
def rings(g): return unary_union([Polygon(r).buffer(0) for r in g["rings"]])
HOOD = [("Emmens Preserve", r"EMMENS P"), ("Cresswind", r"CRESSWIND"), ("Park Place", r"^PARK PLACE"), ("West Lake", r"^WEST LAKE"),
        ("Balmoral", r"^BALMORAL"), ("The Reserve at Market Common", r"^RESERVE"), ("Withers Preserve", r"WITHERS"),
        ("High Market (condos)", r"^HIGH MARKET"), ("Belle Harbor", r"BELLE HARBOR"),
        ("Sweetgrass Square", r"SWEETGRASS"), ("Town center streets (Market Common parcels R1 to R13)", r"MARKET COMMON|COMMON MARKET")]
pts = {}
for p in json.load(open(os.path.join(RAW, "parcels.json"))):
    l = (p.get("LegalDescr") or "").upper(); lu = p.get("LandUseCode") or ""
    if not (lu.startswith("1") and (p.get("MarketImprv") or 0) > 0) or not p.get("g"): continue
    for n, rx in HOOD:
        if re.search(rx, l):
            try: c = rings(p["g"]).representative_point(); pts.setdefault(n, []).append((c.x, c.y))
            except Exception: pass
            break
out = {"valor_park": VALOR, "walk_from_hood_to_valor": {}, "walk_from_valor": {}, "drive_from_valor": {}, "drive_from_hood_to_beach_29th": {}}
beach = DRIVE_TO["Beach access at 29th Avenue South (ocean end)"][1:]
for n, ps in pts.items():
    c = (statistics.median(x for x, _ in ps), statistics.median(y for _, y in ps))
    out["walk_from_hood_to_valor"][n] = dict(route("foot", c, VALOR), start=[round(c[0], 6), round(c[1], 6)], homes=len(ps)); time.sleep(1)
    out["drive_from_hood_to_beach_29th"][n] = route("car", c, beach); time.sleep(1)
    print(n, out["walk_from_hood_to_valor"][n].get("minutes"), out["drive_from_hood_to_beach_29th"][n].get("minutes"), flush=True)
for k, (ref, x, y) in WALK_TO.items():
    out["walk_from_valor"][k] = dict(route("foot", VALOR, (x, y)), osm=ref); time.sleep(1); print("walk", k, out["walk_from_valor"][k].get("minutes"), out["walk_from_valor"][k].get("miles"), flush=True)
for k, (ref, x, y) in DRIVE_TO.items():
    out["drive_from_valor"][k] = dict(route("car", VALOR, (x, y)), osm=ref); time.sleep(1); print("drive", k, out["drive_from_valor"][k].get("minutes"), out["drive_from_valor"][k].get("miles"), flush=True)
json.dump(out, open(os.path.join(D, "raw", "routes.json"), "w"), indent=1)
