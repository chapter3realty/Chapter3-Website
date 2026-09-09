"""USGS imagery covers land plus an uneven nearshore buffer; beyond it tiles come
back black, and the buffer itself ends in pale strips that read as bars in the
water. Build one sea mask: close the black void so the strips between voids are
absorbed, then subtract anything that looks like land (colour or vegetation), so
the fill never reaches the beach."""
from PIL import Image, ImageFilter
import numpy as np

img = Image.open("grand-strand.jpg").convert("RGB")
a = np.asarray(img).astype(np.int16)
R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
mx, mn = a.max(axis=2), a.min(axis=2)
sat = mx - mn

void = ((R < 26) & (G < 26) & (B < 26)).astype(np.uint8) * 255
# land: colourful, or green-dominant, or bright (sand and roofs)
land = (((sat > 34) | (G - B > 16) | (mx > 168)).astype(np.uint8)) * 255

def pil(m): return Image.fromarray(m, "L")
# close the void across the pale strips, then pull back off anything land-like
closed = pil(void).filter(ImageFilter.MaxFilter(9))
for _ in range(9):
    closed = closed.filter(ImageFilter.MaxFilter(9))
for _ in range(9):
    closed = closed.filter(ImageFilter.MinFilter(9))
land_grown = pil(land).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MaxFilter(7))
sea = np.minimum(np.asarray(closed), 255 - np.asarray(land_grown))
sea = np.maximum(sea, void)  # the true void is always sea

mask = pil(sea.astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(6))
water = Image.new("RGB", img.size, (23, 51, 66))
out = Image.composite(water, img, mask)
out.save("grand-strand.jpg", quality=78, optimize=True, progressive=True)
print("sea fill:", out.size, round(len(open("grand-strand.jpg","rb").read())/1024), "KB",
      "| void", round(void.mean()/255*100,1), "% -> filled", round(np.asarray(mask).mean()/255*100,1), "%")
