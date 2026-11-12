"""Labelled USDA NAIP 2023 aerials for /submarkets/north-myrtle-beach/ (public domain, U.S. government work),
from the USGS National Map NAIP image service (exportImage, imageSR 3857, 1400 x 1000).
Each label is placed from ground coordinates through the export's own extent (the service's f=json
answer, in EPSG:3857), never by eye. Label points: OpenStreetMap points in ../landmarks.json, the
county layers in ../verified/map-parts.geojson (a point inside the waterway, inside a part, or on the
channel houses' area), and US 17 from Census TIGER/Line (Blog-Brain tools/geo/grand-strand-v2.json).
Usage: python3 -I aerial_render.py <dir with naip-<k>.jpg> <out dir>"""
import sys, json, os, math
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from shapely.geometry import shape, Point, box, LineString
HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = sys.argv[1], sys.argv[2]
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
R = 6378137.0
mx = lambda lon: R * math.radians(lon)
my = lambda lat: R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
ilon = lambda x: math.degrees(x / R)
ilat = lambda y: math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)
GJ = json.load(open(os.path.join(HERE, "..", "verified", "map-parts.geojson")))
LM = json.load(open(os.path.join(HERE, "..", "landmarks.json")))
layer = lambda name, key=None: next(shape(f["geometry"]) for f in GJ["features"] if f["properties"]["layer"] == name and (key is None or f["properties"].get("key") == key))
def _dec(flat):
    o, x, y = [], 0, 0
    for i in range(0, len(flat), 2):
        x += flat[i]; y += flat[i + 1]; o.append((x / 1e4 - 80, y / 1e4 + 33))
    return o
_GEO = json.load(open(os.environ.get("BB_GEO", "/home/user/Blog-Brain/tools/geo/grand-strand-v2.json")))["region"]
US17 = [c for c in (_dec(r["p"]) for r in _GEO["roads"] if r.get("r") == "US 17") if len(c) > 1]
BASE = "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage"
CFG = {
  "cherry-grove-channels": {
    "src": "naip-cg.jpg", "ext": [-8752661.9428573251, 4006521.9946112852, -8750658.1920230482, 4007953.245207197],
    "labels": [
      ["Boat ramp", "lm", "Cherry Grove Boat Ramp", (-150, -120)],
      ["Heritage Shores", "lm", "Heritage Shores Nature Preserve", (-120, 150)],
      ["Channel houses", "pt", (-78.6195, 33.8372), (0, 0)],
      ["Atlantic Ocean", "pt", (-78.6120, 33.8356), (0, 0)],
    ]},
  "ocean-drive-main-street": {
    "src": "naip-od.jpg", "ext": [-8758951.4940871447, 4003841.8587367893, -8756947.743252866, 4005273.1093327026],
    "labels": [
      ["Main Street", "lm", "Main Street (Ocean Drive)", (230, -140)],
      ["McLean Park", "lm", "McLean Park", (-170, -170)],
      ["Atlantic Ocean", "pt", (-78.6700, 33.8168), (0, 0)],
    ]},
  "barefoot-landing-waterway": {
    "src": "naip-bf.jpg", "ext": [-8766743.8584426735, 4001095.369830301, -8764740.1076083947, 4002526.6204262143],
    "labels": [
      ["Barefoot Landing", "lm", "Barefoot Landing", (0, 0)],
      ["Intracoastal Waterway", "pt", (-78.74807, 33.80101), (60, 20)],
      ["US 17", "pt", (-78.7460, 33.7965), (0, 0)],
      ["Across the waterway", "pt", (-78.75119, 33.80332), (200, -20)],
    ]},
  "atlantic-beach-between": {
    "src": "naip-ab.jpg", "ext": [-8765329.6781412978, 4000638.8920406951, -8760922.2718424853, 4003787.0393969901],
    "outline": "ATLANTIC BEACH",
    "labels": [
      ["Atlantic Beach", "pt", (-78.7179, 33.8038), (-40, -150)],
      ["Crescent Beach", "part", "cb", (60, 120)],
      ["Windy Hill", "part", "wh", (0, -90)],
      ["Atlantic Ocean", "pt", (-78.7120, 33.7950), (0, 0)],
    ]},
}
POLE = {"cb": (-78.7114, 33.8049), "wh": (-78.7308, 33.7963)}   # shapely polylabel of each part's largest shape (the spec's LABEL_AT)
MUNI = json.load(open(os.path.join(HERE, "..", "raw", "munis-ab.json")))
W = 1200
out = {}
for k, c in CFG.items():
    im = Image.open(os.path.join(SRC, c["src"])).convert("RGB")
    im = ImageEnhance.Contrast(im).enhance(1.05)
    h = round(im.height * W / im.width)
    im = im.resize((W, h), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 44)
    x0, y0, x1, y1 = c["ext"]
    P = lambda lo, la: ((mx(lo) - x0) / (x1 - x0) * W, (y1 - my(la)) / (y1 - y0) * h)
    bb = [ilon(x0), ilat(y0), ilon(x1), ilat(y1)]
    recs = []
    if c.get("outline"):
        rings = next(f["geometry"]["rings"] for f in MUNI["features"] if f["attributes"]["NAME"] == c["outline"])
        for r in rings:
            pts = [P(lo, la) for lo, la in r]
            if len(pts) > 3:
                d.line(pts + [pts[0]], fill=(255, 255, 255), width=9, joint="curve")
                d.line(pts + [pts[0]], fill=(196, 120, 58), width=5, joint="curve")
    for text, kind, ref, (dx, dy) in c["labels"]:
        if kind == "part":
            lo, la = POLE[ref]; why = f"the middle of our {ref} part (map-parts.geojson, polylabel)"
            assert layer("part", ref).contains(Point(lo, la)), (k, text, "not inside its part")
        elif kind == "lm":
            lo, la = LM[ref]["lon"], LM[ref]["lat"]; why = f"OpenStreetMap point for {ref} (landmarks.json)"
        else:
            lo, la = ref; why = "a point read from the county layers"
        pt = Point(lo, la)
        if text == "Channel houses": assert layer("channel_houses").distance(pt) < 0.0006, (k, text, "not on the channel houses")
        if text == "Intracoastal Waterway": assert layer("waterway").contains(pt), (k, text, "not in the waterway")
        if text == "Across the waterway": assert layer("part", "across").distance(pt) < 0.0008 and not layer("waterway").contains(pt), (k, text)
        if text == "US 17": assert min(LineString(r).distance(pt) for r in US17) < 0.0002, (k, text, "not on US 17")
        if text == "Atlantic Beach": assert any(shape({"type": "Polygon", "coordinates": [r]}).buffer(0.0005).contains(pt) for f in MUNI["features"] if f["attributes"]["NAME"] == "ATLANTIC BEACH" for r in f["geometry"]["rings"] if len(r) > 3), (k, text, "not in Atlantic Beach")
        if text == "Atlantic Ocean": assert not layer("city").buffer(0.0003).contains(pt), (k, text, "inside the city")
        ax, ay = P(lo, la)
        cx, cy = ax + dx, ay + dy
        tb = d.textbbox((0, 0), text, font=f)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        pad = 14
        bx0, by0, bx1, by1 = cx - tw / 2 - pad, cy - th / 2 - pad, cx + tw / 2 + pad, cy + th / 2 + pad
        assert bx0 >= 6 and bx1 <= W - 6 and by0 >= 6 and by1 <= h - 6, (k, text, bx0, by0, bx1, by1)
        assert not (bx1 > W - 420 and by1 > h - 60), (k, text, "label in the credit corner")
        if dx or dy:
            d.line([(ax, ay), (cx, cy)], fill=(255, 255, 255), width=5)
            d.ellipse([ax - 11, ay - 11, ax + 11, ay + 11], fill=(196, 120, 58), outline=(255, 255, 255), width=4)
        d.rounded_rectangle([bx0, by0, bx1, by1], radius=14, fill=(28, 32, 40), outline=(255, 255, 255), width=3)
        d.text((cx - tw / 2 - tb[0], cy - th / 2 - tb[1]), text, font=f, fill=(255, 255, 255))
        recs.append({"text": text, "lon": lo, "lat": la, "px": [round(ax), round(ay)], "source": why})
    dst = os.path.join(OUT, f"{k}.png"); im.save(dst)
    req = f"{BASE}?bbox={x0},{y0},{x1},{y1}&bboxSR=3857&imageSR=3857&size=1400,1000&format=jpg&f=image"
    out[k] = {"file": os.path.basename(dst), "size": list(im.size), "bbox_wgs84": [round(v, 6) for v in bb], "source_request": req, "labels": recs}
json.dump(out, open(os.path.join(OUT, "aerial-labels.json"), "w"), indent=1)
print(json.dumps({k: [v["size"], v["bbox_wgs84"]] for k, v in out.items()}))
