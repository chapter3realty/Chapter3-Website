"""Fix round 1 (2026-11-04): three more frames, Windy Hill, west of US 17 and Tilghman Beach, same method as aerial_render.py\n(exports in the extents below, from the image service's f=json answer). Labelled USDA NAIP 2023 aerials for /submarkets/north-myrtle-beach/ (public domain, U.S. government work),
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
  "windy-hill-beach": {
    "src": "naip-wh.jpg", "ext": [-8765185.385154428, 4000593.013238669, -8763181.635154428, 4002024.263238669],
    "labels": [
      ["Windy Hill", "part", "wh", (0, -90)],
      ["Atlantic Ocean", "pt", (-78.7262, 33.7912), (0, 0)],
    ]},
  "west-of-us-17-new-streets": {
    "src": "naip-west17.jpg", "ext": [-8761734.480939837, 4004009.3275686656, -8759730.730939837, 4005440.5775686656],
    "labels": [
      ["Central Park", "lm", "Central Park", (-230, -40)],
      ["US 17", "pt", (-78.6943, 33.8169), (0, 0)],
      ["West of US 17", "inpart", ("west17", -78.6995, 33.8240), (0, 0)],
    ]},
  "tilghman-beach": {
    "src": "naip-til.jpg", "ext": [-8757838.298762074, 4004411.3138567074, -8755834.548762074, 4005842.5638567074],
    "labels": [
      ["Tilghman Beach", "part", "til", (0, -90)],
      ["Atlantic Ocean", "pt", (-78.6590, 33.8203), (0, 0)],
    ]},
}
POLE = {"cb": (-78.7114, 33.8049), "wh": (-78.7308, 33.7963), "til": (-78.6653, 33.8253)}   # shapely polylabel of each part's largest shape (the spec's LABEL_AT)
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
        elif kind == "inpart":
            key, lo, la = ref; why = f"a point inside our {key} part (map-parts.geojson)"
            assert layer("part", key).contains(Point(lo, la)), (k, text, "not inside its part")
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
