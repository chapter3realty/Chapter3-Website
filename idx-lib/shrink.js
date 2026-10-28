/**
 * Our own photo resizer (owners, 2026-10-28: rather than pay Cloudflare per photo). A JPEG is
 * decoded, scaled down to a width by averaging the pixels each new pixel covers, and saved again
 * as a JPEG. Plain JavaScript (idx-lib/vendor/jpeg-*.js), no add-on to install. It runs once per
 * photo per 30 days (idx-lib/photo.js keeps the result), about a third of a second of work each.
 * Returns null for anything it cannot read, and the caller then keeps the photo as it came.
 */
import decode from "./vendor/jpeg-decode.js";
import encode from "./vendor/jpeg-encode.js";

export function shrinkJpeg(bytes, width, quality = 72) {
  let img;
  try {
    // At most 40 megapixels and 400 MB: a listing photo is far less.
    img = decode(bytes, { useTArray: true, formatAsRGBA: true, maxResolutionInMP: 40, maxMemoryUsageInMB: 400 });
  } catch { return null; }
  const sw = img.width, sh = img.height, src = img.data;
  if (!sw || !sh) return null;
  if (sw <= width) return null; // already small: the original is kept
  const dw = width, dh = Math.max(1, Math.round(sh * dw / sw));
  const out = new Uint8Array(dw * dh * 4);
  const fx = sw / dw, fy = sh / dh;
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor(y * fy), y1 = Math.min(sh, Math.max(y0 + 1, Math.floor((y + 1) * fy)));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor(x * fx), x1 = Math.min(sw, Math.max(x0 + 1, Math.floor((x + 1) * fx)));
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) {
        let i = (yy * sw + x0) * 4;
        for (let xx = x0; xx < x1; xx++, i += 4) { r += src[i]; g += src[i + 1]; b += src[i + 2]; n++; }
      }
      const o = (y * dw + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = 255;
    }
  }
  try { return encode({ data: out, width: dw, height: dh }, quality).data; } catch { return null; }
}
