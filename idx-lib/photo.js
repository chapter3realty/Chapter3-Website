/**
 * Listing photos from our own address, sized for where they show and kept 30 days (owners,
 * 2026-10-28). The MLS photo server (Cotality Trestle) allows 240 photos a minute for every
 * visitor together and sends each full size, about 750 KB, so pages waited on it and photos
 * failed in busy minutes. Here each photo is fetched from Trestle once, resized by Cloudflare
 * (when Image Transformations is on for the zone; otherwise kept as it came), and kept in the
 * edge cache for 30 days. A photo's link changes when the agent replaces it, so a new photo
 * gets a new copy; a home that sold is no longer shown, and its copy expires by itself.
 *
 *   /homes/p/card?u=<Trestle link>   about 480 px wide: cards, rows, the map
 *   /homes/p/big?u=<Trestle link>    about 1280 px wide: the listing page
 *
 * Only links to our own Trestle feed are served, so this is never a photo service for others.
 */
const ORIGIN = "https://api.cotality.com/trestle/Media/";
// The feed's own segment in every photo link ("12192/13110/20", base64): only our listings.
const FEED = "/MTIxOTIvMTMxMTAvMjA/";
const WIDTH = { card: 480, big: 1280 };
const KEEP = 30 * 24 * 3600;

export const ourPhoto = (u) => typeof u === "string" && u.startsWith(ORIGIN) && u.includes(FEED) && u.length <= 600 && /^[A-Za-z0-9:/._~%=-]+$/.test(u);

/** The link a page uses: our copy for a Trestle photo, the link itself for anything else. */
export function photoUrl(u, size = "card") {
  return ourPhoto(u) ? `/homes/p/${size === "big" ? "big" : "card"}?u=${encodeURIComponent(u)}` : u;
}

/** GET /homes/p/<size>?u=: the kept copy, or one fetched and kept now. */
export async function photo(context, url, size) {
  const u = url.searchParams.get("u") || "";
  if (!WIDTH[size] || !ourPhoto(u)) return new Response("Not found", { status: 404 });
  const accept = context.request.headers.get("accept") || "";
  const format = /image\/avif/.test(accept) ? "avif" : /image\/webp/.test(accept) ? "webp" : "jpeg";
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(`https://chapter3realty.com/__photo/${size}/${format}/${encodeURIComponent(u)}`);
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  let r = null;
  try {
    r = await fetch(u, { cf: { image: { width: WIDTH[size], quality: 75, fit: "scale-down", ...(format === "jpeg" ? {} : { format }) } } });
    // Without Image Transformations on the zone the resize can fail: keep the photo as it came.
    if (!r.ok || !/^image\//.test(r.headers.get("content-type") || "")) r = await fetch(u);
  } catch { r = null; }
  // The MLS said no (its limit, most often): the browser asks it directly, and nothing is kept.
  if (!r || !r.ok || !/^image\//.test(r.headers.get("content-type") || "")) return new Response(null, { status: 302, headers: { Location: u, "cache-control": "no-store" } });
  const out = new Response(r.body, { headers: { "content-type": r.headers.get("content-type"), "cache-control": `public, max-age=${KEEP}, immutable` } });
  if (cache) context.waitUntil(cache.put(key, out.clone()));
  return out;
}
