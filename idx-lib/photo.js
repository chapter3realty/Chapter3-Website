/**
 * Listing photos from our own address, sized for where they show and kept 30 days (owners,
 * 2026-10-28). The MLS photo server (Cotality Trestle) allows 240 photos a minute for every
 * visitor together and sends each full size, about 750 KB, so pages waited on it and photos
 * failed in busy minutes. Here each photo is fetched from Trestle once, made smaller by our own
 * resizer (idx-lib/shrink.js: a card photo goes from about 750 KB to about 45 KB), and kept in
 * the edge cache and the browser for 30 days. A photo's link changes when the agent replaces it, so a new photo
 * gets a new copy; a home that sold is no longer shown, and its copy expires by itself.
 *
 *   /homes/p/card?u=<Trestle link>   about 480 px wide: cards, rows, the map
 *   /homes/p/big?u=<Trestle link>    about 1280 px wide: the listing page
 *
 * Only links to our own Trestle feed are served, so this is never a photo service for others.
 */
import { shrinkJpeg } from "./shrink.js";

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

/** GET /homes/p/<size>?u=: the kept copy, or one fetched, made smaller and kept now. */
export async function photo(context, url, size) {
  const u = url.searchParams.get("u") || "";
  if (!WIDTH[size] || !ourPhoto(u)) return new Response("Not found", { status: 404 });
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(`https://chapter3realty.com/__photo/v2/${size}/${encodeURIComponent(u)}`);
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  let r = null;
  try { r = await fetch(u); } catch { r = null; }
  const type = r ? r.headers.get("content-type") || "" : "";
  // The MLS said no (its limit, most often): the browser asks it directly, and nothing is kept.
  if (!r || !r.ok || !/^image\//.test(type)) return new Response(null, { status: 302, headers: { Location: u, "cache-control": "no-store" } });
  let body = new Uint8Array(await r.arrayBuffer()), outType = type;
  if (/jpe?g/i.test(type)) {
    const small = shrinkJpeg(body, WIDTH[size], size === "big" ? 66 : 72);
    if (small && small.length < body.length) { body = small; outType = "image/jpeg"; }
  }
  const out = new Response(body, { headers: { "content-type": outType, "cache-control": `public, max-age=${KEEP}, immutable` } });
  if (cache) context.waitUntil(cache.put(key, out.clone()));
  return out;
}
