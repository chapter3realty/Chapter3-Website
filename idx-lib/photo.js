/**
 * Listing photos from our own address, sized for where they show and kept 30 days (owners,
 * 2026-10-28). The MLS photo server (Cotality Trestle) allows 240 photos a minute for every
 * visitor together and sends each full size, about 750 KB, so pages waited on it and photos
 * failed in busy minutes. Here each photo is fetched from Trestle once, made smaller by our own
 * resizer (idx-lib/shrink.js: a card photo goes from about 750 KB to about 45 KB), and kept in
 * R2 (the PHOTOS bucket), the edge cache and the browser for 30 days. A photo's link changes when the agent replaces it, so a new photo
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

/* The copies live in R2 (the PHOTOS bucket, bound to the site), one store for every visitor
   wherever they are; the edge cache in front of it saves a read. Without the bucket, the edge cache
   alone. The bucket's own rule deletes a copy 30 days after it was made. */
async function storeKey(size, u) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(u)));
  return `p/v1/${size}/${[...d].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
const served = (body, type) => new Response(body, { headers: { "content-type": type, "cache-control": `public, max-age=${KEEP}, immutable` } });

/** The photo made smaller for one size, as bytes and a type (the original when it cannot be). */
function sized(bytes, type, size) {
  if (/jpe?g/i.test(type)) {
    const small = shrinkJpeg(bytes, WIDTH[size], size === "big" ? 66 : 72);
    if (small && small.length < bytes.length) return [small, "image/jpeg"];
  }
  return [bytes, type];
}

/** GET /homes/p/<size>?u=: the kept copy, or one fetched, made smaller and kept now. */
export async function photo(context, url, size) {
  const u = url.searchParams.get("u") || "";
  if (!WIDTH[size] || !ourPhoto(u)) return new Response("Not found", { status: 404 });
  const env = context.env || {};
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(`https://chapter3realty.com/__photo/v2/${size}/${encodeURIComponent(u)}`);
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  const sk = env.PHOTOS ? await storeKey(size, u) : null;
  if (sk) {
    const o = await env.PHOTOS.get(sk);
    if (o) { const out = served(o.body, (o.httpMetadata && o.httpMetadata.contentType) || "image/jpeg"); if (cache) context.waitUntil(cache.put(key, out.clone())); return out; }
  }
  let r = null;
  try { r = await fetch(u); } catch { r = null; }
  const type = r ? r.headers.get("content-type") || "" : "";
  // The MLS said no (its limit, most often): the browser asks it directly, and nothing is kept.
  if (!r || !r.ok || !/^image\//.test(type)) return new Response(null, { status: 302, headers: { Location: u, "cache-control": "no-store" } });
  const [body, outType] = sized(new Uint8Array(await r.arrayBuffer()), type, size);
  if (sk) context.waitUntil(env.PHOTOS.put(sk, body, { httpMetadata: { contentType: outType }, customMetadata: { src: u.slice(0, 500) } }));
  const out = served(body, outType);
  if (cache) context.waitUntil(cache.put(key, out.clone()));
  return out;
}

/**
 * GET /homes/api/warm?slot=&slots= (owners, 2026-10-28: "auto download the photo 240 a minute
 * every minute until it has all of them"). The photo-warmer Worker calls this every minute, once
 * per slot. Each call takes one page of homes for sale (24) and, for each home whose first photo
 * has no copy yet, fetches it from the MLS once and keeps both sizes: the card and the listing
 * page's main photo. A call fetches at most 12 photos, and stops early when the MLS says fewer
 * than 40 are left this minute or 600 this hour, so visitors browsing meanwhile still get theirs.
 * Pages turn over by the minute, so every page is visited again and again: new listings get
 * their photos within the hour, and a copy the bucket deleted after 30 days is made again.
 * Needs the WARM_KEY secret in the x-warm-key header; without it, or without the bucket, nothing.
 */
export async function warm(context, url, listPage) {
  const env = context.env || {};
  // Trimmed on both sides: a secret typed or piped in may carry a line break.
  const want = String(env.WARM_KEY || "").trim();
  if (want.length < 20 || (context.request.headers.get("x-warm-key") || "").trim() !== want) return new Response("Not found", { status: 404 });
  const reply = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  if (!env.PHOTOS) return reply({ ok: false, error: "no_bucket" });
  const n = (v, lo, hi, d) => { const x = parseInt(v, 10); return Number.isInteger(x) ? Math.min(hi, Math.max(lo, x)) : d; };
  const slots = n(url.searchParams.get("slots"), 1, 30, 12), slot = n(url.searchParams.get("slot"), 0, slots - 1, 0);
  const first = await listPage(1);
  if (!first) return reply({ ok: false, error: "crm" });
  const pages = Math.max(1, Math.ceil(first.total / 24));
  const page = ((Math.floor(Date.now() / 60000) * slots + slot) % pages) + 1;
  // A page whose homes all had their copies is left alone for 6 hours (the newest three for 30
  // minutes): checking finished pages every minute would read the bucket about 37 million times
  // a month, past its free 10 million.
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const done = new Request(`https://chapter3realty.com/__warm/done/${page}`);
  if (cache && (await cache.match(done))) return reply({ ok: true, page, pages, fetched: 0, stored: 0, kept: 0, stop: "done_recently" });
  const got = page === 1 ? first : await listPage(page);
  const left = (r, h) => { const v = r.headers.get(h); return v === null || v === "" || !isFinite(+v) ? Infinity : +v; };
  let fetched = 0, stored = 0, kept = 0, stop = "";
  for (const l of (got && got.listings) || []) {
    const u = l && l.photo;
    if (!ourPhoto(u)) continue;
    const keys = { card: await storeKey("card", u), big: await storeKey("big", u) };
    const missing = [];
    for (const size of ["card", "big"]) if (!(await env.PHOTOS.head(keys[size]))) missing.push(size);
    if (!missing.length) { kept++; continue; }
    if (fetched >= 12) { stop = "enough"; break; }
    let r = null;
    try { r = await fetch(u); } catch { r = null; }
    fetched++;
    if (r && r.ok && /^image\//.test(r.headers.get("content-type") || "")) {
      const type = r.headers.get("content-type"), bytes = new Uint8Array(await r.arrayBuffer());
      for (const size of missing) {
        const [body, outType] = sized(bytes, type, size);
        await env.PHOTOS.put(keys[size], body, { httpMetadata: { contentType: outType }, customMetadata: { src: u.slice(0, 500) } });
      }
      stored++;
    }
    if (r && (left(r, "minute-quota-available") < 40 || left(r, "hour-quota-available") < 600)) { stop = "mls_limit"; break; }
    if (r && !r.ok) { stop = `mls_${r.status}`; break; }
  }
  if (cache && fetched === 0 && got && got.listings && got.listings.length) {
    context.waitUntil(cache.put(done, new Response("done", { headers: { "cache-control": `public, max-age=${page <= 3 ? 1800 : 21600}` } })));
  }
  return reply({ ok: true, page, pages, fetched, stored, kept, stop });
}
