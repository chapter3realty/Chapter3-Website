# Build the popup's two fallback stills from popup-green.mp4, keyed with
# exactly the shader in partials/footer.html so the stills and the playing clip
# match. The first frame is the poster while the clip loads. The last frame is
# what a visitor sees when the clip will not play at all, because a closed book
# behind a play button still reads as a book that is not opening.
# Run after replacing the clip:
#   python3 tools/popup-poster.py
import cv2, numpy as np
from PIL import Image

SRC = "chapter3realty/popup-green.mp4"


def key(bgr):
    f = bgr[:, :, ::-1].astype(np.float32) / 255.0      # BGR to RGB, 0..1
    r, g, b = f[:, :, 0], f[:, :, 1], f[:, :, 2]
    # the shader: how far green exceeds the larger of red and blue
    k = g - np.maximum(r, b)
    t = np.clip((k - 0.07) / (0.15 - 0.07), 0.0, 1.0)   # smoothstep(0.07, 0.15, k)
    alpha = 1.0 - (t * t * (3.0 - 2.0 * t))
    spill = np.maximum(k, 0.0) * 0.85                   # pull the green spill
    out = np.dstack([r, np.clip(g - spill, 0, 1), b, alpha])
    img = Image.fromarray((out * 255.0 + 0.5).astype(np.uint8), "RGBA")
    return img.resize((960, int(960 * img.height / img.width)), Image.LANCZOS)


def frame(cap, index):
    cap.set(cv2.CAP_PROP_POS_FRAMES, index)
    ok, bgr = cap.read()
    assert ok, "could not read frame %d of %s" % (index, SRC)
    return bgr


cap = cv2.VideoCapture(SRC)
last = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) - 1
for index, out in ((0, "chapter3realty/popup-green-poster.webp"),
                   (last, "chapter3realty/popup-green-end.webp")):
    img = key(frame(cap, index))
    img.save(out, "WEBP", quality=82, method=6)
    print("wrote %s from frame %d  %dx%d" % (out, index, img.width, img.height))
cap.release()
