import sys, json, numpy as np
from PIL import Image, ImageDraw
SRC, META, OUTDIR, BASE = sys.argv[1:5]
m = json.load(open(META))
im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
lo, hi = np.percentile(a, 0.5), np.percentile(a, 99.7)
a = np.clip((a - lo) / (hi - lo), 0, 1) ** 0.95 * 255
im = Image.fromarray(a.astype(np.uint8))
dr = ImageDraw.Draw(im)
pts = [tuple(p) for p in m["ring_px"]]
dr.line(pts + [pts[0]], fill=(232, 120, 40), width=9, joint="curve")
im.save(f"{OUTDIR}/{BASE}-2400.png")
for w in (1200, 600):
    im.resize((w, w * 3 // 4), Image.LANCZOS).save(f"{OUTDIR}/{BASE}{'' if w == 1200 else '-600w'}.webp", quality=82, method=6)
im.resize((1200, 900), Image.LANCZOS).save(f"{OUTDIR}/{BASE}-1200w.webp", quality=82, method=6)
print("ok")
