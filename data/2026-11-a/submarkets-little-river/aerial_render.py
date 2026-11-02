"""Label the two NAIP 2023 crops for /submarkets/little-river/. Every label is placed from a
ground coordinate through the crop's bbox (equirectangular, EPSG:4326 crop from the Planetary
Computer data API), never by eye. Usage: python3 -I render.py <workdir>"""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
W = sys.argv[1]
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CFG = {
  "waterfront": {
    "src": "pc-waterfront.png", "bbox": [-78.6210, 33.8645, -78.6070, 33.8755],
    "labels": [
      # text, (lon, lat) anchor, (dx, dy) of the label box centre from the anchor, in 1200 px units
      ["Mariner's Pointe", (-78.61798, 33.86831), (40, -190), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Waterfront", (-78.60995, 33.87075), (-80, -150), "last county address point on Mineola Avenue (layer 22), where the street meets the water"],
      ["Intracoastal Waterway", (-78.6115, 33.8675), (0, 0), "a point inside the county water outline (layer 21, Intracoastal Waterway)"],
    ]},
  "harbours": {
    "src": "pc-harbours.png", "bbox": [-78.6440, 33.8570, -78.6310, 33.8680],
    "labels": [
      ["Coquina Harbour", (-78.63774, 33.86453), (-290, -40), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Lightkeepers Village", (-78.63757, 33.86081), (280, -150), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Intracoastal Waterway", (-78.6375, 33.8600), (0, 0), "a point inside the county water outline (layer 21, Intracoastal Waterway)"],
      ["US 17", (-78.6417, 33.8661), (0, 0), "US 17 centreline, Census TIGER/Line (tools/geo/grand-strand-v2.json)"],
    ]},
}
out = {}
for k, c in CFG.items():
    im = Image.open(os.path.join(W, c["src"])).convert("RGB")
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Color(im).enhance(1.05)
    w = int(os.environ.get("WIDTH", "1200")); h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 50)
    x0, y0, x1, y1 = c["bbox"]
    P = lambda lo, la: ((lo - x0) / (x1 - x0) * w, (y1 - la) / (y1 - y0) * h)
    recs = []
    for text, (lo, la), (dx, dy), why in c["labels"]:
        ax, ay = P(lo, la)
        cx, cy = ax + dx, ay + dy
        tb = d.textbbox((0, 0), text, font=f)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        pad = 16
        bx0, by0 = cx - tw / 2 - pad, cy - th / 2 - pad
        bx1, by1 = cx + tw / 2 + pad, cy + th / 2 + pad
        assert bx0 >= 6 and by0 >= 6 and bx1 <= w - 6 and by1 <= h - 6, (k, text, bx0, by0, bx1, by1)
        if dx or dy:
            d.line([(ax, ay), (cx, cy)], fill=(255, 255, 255), width=5)
            d.ellipse([ax - 11, ay - 11, ax + 11, ay + 11], fill=(196, 120, 58), outline=(255, 255, 255), width=4)
        d.rounded_rectangle([bx0, by0, bx1, by1], radius=14, fill=(28, 32, 40), outline=(255, 255, 255), width=3)
        d.text((cx - tw / 2 - tb[0], cy - th / 2 - tb[1]), text, font=f, fill=(255, 255, 255))
        recs.append({"text": text, "lon": lo, "lat": la, "px": [round(ax), round(ay)], "source": why})
    dst = os.path.join(W, f"little-river-{k}-from-above{os.environ.get("SUFFIX", "")}.png")
    im.save(dst)
    out[k] = {"file": dst, "size": [w, h], "bbox": c["bbox"], "labels": recs}
json.dump(out, open(os.path.join(W, "labels" + os.environ.get("SUFFIX", "") + ".json"), "w"), indent=1)
print(json.dumps({k: v["size"] for k, v in out.items()}))
