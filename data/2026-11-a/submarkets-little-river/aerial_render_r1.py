"""Review round 1: re-cut the two NAIP 2023 aerials for /submarkets/little-river/ to a 4:3 landscape
frame that keeps every label inside it, and keep the bottom-right corner clear for the photo credit.
Labels are placed from ground coordinates through the crop's bbox, never by eye (same as
aerial_render.py). Usage: python3 -I aerial_render_r1.py <dir with pc-*.png> <out dir>"""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
SRC, OUT = sys.argv[1], sys.argv[2]
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W = 1200
CFG = {
  "waterfront": {
    "src": "pc-waterfront.png", "bbox": [-78.6210, 33.8645, -78.6070, 33.8755], "rows": (150, 1050),
    "labels": [
      ["Mariner's Pointe", (-78.61798, 33.86831), (40, -190), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Waterfront", (-78.60995, 33.87075), (-80, -150), "last county address point on Mineola Avenue (layer 22), where the street meets the water"],
      ["Intracoastal Waterway", (-78.61447, 33.86645), (0, 0), "a point inside the county water outline (layer 21, Intracoastal Waterway)"],
    ]},
  "harbours": {
    "src": "pc-harbours.png", "bbox": [-78.6440, 33.8570, -78.6310, 33.8680], "rows": (155, 1055),
    "labels": [
      ["US 17", (-78.63985, 33.8662), (0, 0), "midpoint of the US 17 centreline segment (-78.6432, 33.8650) to (-78.6365, 33.8674), Census TIGER/Line (tools/geo/grand-strand-v2.json)"],
      ["Coquina Harbour", (-78.63774, 33.86453), (-290, -40), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Lightkeepers Village", (-78.63757, 33.86081), (280, -150), "slip parcels centre, county parcels layer 24 (map-points.json)"],
      ["Intracoastal Waterway", (-78.6350, 33.8598), (0, 0), "a point inside the county water outline (layer 21, Intracoastal Waterway)"],
    ]},
}
CREDIT_CLEAR = (820, 70)   # the bottom-right box (width, height in 1200 px units) kept free for the on-photo credit
out = {}
for k, c in CFG.items():
    im = Image.open(os.path.join(SRC, c["src"])).convert("RGB")
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Color(im).enhance(1.05)
    h = round(im.height * W / im.width)
    im = im.resize((W, h), Image.LANCZOS)
    r0, r1 = c["rows"]
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 50)
    x0, y0, x1, y1 = c["bbox"]
    P = lambda lo, la: ((lo - x0) / (x1 - x0) * W, (y1 - la) / (y1 - y0) * h)
    recs = []
    for text, (lo, la), (dx, dy), why in c["labels"]:
        ax, ay = P(lo, la)
        cx, cy = ax + dx, ay + dy
        tb = d.textbbox((0, 0), text, font=f)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        pad = 16
        bx0, by0, bx1, by1 = cx - tw / 2 - pad, cy - th / 2 - pad, cx + tw / 2 + pad, cy + th / 2 + pad
        # inside the cut frame, and clear of the credit corner
        assert bx0 >= 6 and bx1 <= W - 6 and by0 >= r0 + 6 and by1 <= r1 - 6, (k, text, bx0, by0, bx1, by1)
        assert not (bx1 > W - CREDIT_CLEAR[0] + 400 and by1 > r1 - CREDIT_CLEAR[1]), (k, text, "label in the credit corner")
        assert r0 <= ay <= r1, (k, text, "anchor outside the frame")
        if dx or dy:
            d.line([(ax, ay), (cx, cy)], fill=(255, 255, 255), width=5)
            d.ellipse([ax - 11, ay - 11, ax + 11, ay + 11], fill=(196, 120, 58), outline=(255, 255, 255), width=4)
        d.rounded_rectangle([bx0, by0, bx1, by1], radius=14, fill=(28, 32, 40), outline=(255, 255, 255), width=3)
        d.text((cx - tw / 2 - tb[0], cy - th / 2 - tb[1]), text, font=f, fill=(255, 255, 255))
        recs.append({"text": text, "lon": lo, "lat": la, "px": [round(ax), round(ay - r0)], "source": why})
    im = im.crop((0, r0, W, r1))
    lat_top = y1 - (y1 - y0) * r0 / h; lat_bot = y1 - (y1 - y0) * r1 / h
    bbox = [x0, round(lat_bot, 5), x1, round(lat_top, 5)]
    dst = os.path.join(OUT, f"little-river-{k}-from-above-r1.png"); im.save(dst)
    out[k] = {"file": os.path.basename(dst), "size": list(im.size), "bbox": bbox, "labels": recs}
json.dump(out, open(os.path.join(OUT, "aerial-labels-r1.json"), "w"), indent=1)
print(json.dumps({k: [v["size"], v["bbox"]] for k, v in out.items()}))
