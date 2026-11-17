"""Named places near Mar Vista Grande from OpenStreetMap (https://www.openstreetmap.org/api/0.6/map?bbox=-78.700,33.800,-78.660,33.832, read 2026-11-14,
saved raw/osm-bbox-wide-2026-11-14.xml, ODbL). Center: footprint centre from flood.json. Writes osm-near.json: named nodes/ways with a tourism, amenity, leisure or shop tag, nearest first."""
import xml.etree.ElementTree as ET, json, math, sys
c = json.load(open("flood.json"))["footprint_center"]
r = ET.parse("raw/osm-bbox-wide-2026-11-14.xml").getroot()
nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in r.findall("node")}
def d(a, b):
    la = math.radians((a[0] + b[0]) / 2); return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(la))
out = []
def tags(e): return {t.get("k"): t.get("v") for t in e.findall("tag")}
for e in r:
    if e.tag == "node": p = nodes[e.get("id")]
    elif e.tag == "way":
        pts = [nodes[n.get("ref")] for n in e.findall("nd") if n.get("ref") in nodes]
        if not pts: continue
        p = (sum(x[0] for x in pts) / len(pts), sum(x[1] for x in pts) / len(pts))
    else: continue
    t = tags(e)
    if t.get("name") and any(k in t for k in ("tourism", "amenity", "leisure", "shop", "natural", "man_made")):
        out.append({"name": t["name"], "kind": {k: t[k] for k in ("tourism", "amenity", "leisure", "shop", "natural", "man_made") if k in t}, "metres": round(d(c, p)), "osm": e.tag + "/" + e.get("id")})
out.sort(key=lambda x: x["metres"]); json.dump({"center": c, "places": out}, open("osm-near.json", "w"), indent=1)
for x in out[:90]: print(x["metres"], x["name"], x["kind"])
