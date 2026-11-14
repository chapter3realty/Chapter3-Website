/**
 * Listing photos: the copies kept in R2 (the PHOTOS bucket, `listing-photos`), and the MLS licence.
 *
 * THE LICENCE (2026-11-13; CLAUDE.md non-negotiable 9). A listing photo may show only while its
 * listing is in the IDX feed, and must stop within 12 hours of the listing leaving it. A stored
 * copy is allowed only because this file enforces that:
 *   1. Only the photo warmer stores, and only for listings the CRM's API returned in this sweep.
 *      A visitor's request never stores anything.
 *   2. A full removal sweep starts every 5 h 45 min and pages through every home for sale. When
 *      it ends, every listing it did not see loses ALL its copies. A listing whose photos changed
 *      (`v` in the CRM's photo link) loses the old version's copies in the run that sees it.
 *   3. A copy is served only while the last finished sweep is under 6 hours old. Past that, or
 *      with no finished sweep, the page gets the CRM's own link, which the CRM stops serving for
 *      a listing that left IDX.
 *   4. A served copy is cached one hour at most, in the browser and at the edge.
 * The CRM's contract (its docs/website-listing-api.md §8 rule 7) says the website stores no
 * photo; the owner's brief of 2026-11-13 allows R2 copies on exactly these terms.
 *
 * Links on the page are the CRM's own (https://app.chapter3realty.com/api/idx/photo/<listingKey>/
 * <v>/<n>/<w>/<sig>.webp). When one fails, the page asks /homes/p/card?u=<that link>: the copy
 * here when there is a current one, else a redirect back to the link. An MLS host (Trestle) link
 * from before the CRM served photos is made smaller here and never stored.
 *
 *   /homes/p/card?u=<link>   cards, rows, the map
 *   /homes/p/big?u=<link>    the listing page's main photo
 *
 * Only our own feed's links are served, so this is never a photo service for others.
 */
import { shrinkJpeg } from "./shrink.js";
import { sendRequests } from "./crm-requests.js";

const ORIGIN = "https://api.cotality.com/trestle/Media/";
// The feed's own segment in every photo link ("12192/13110/20", base64): only our listings.
const FEED = "/MTIxOTIvMTMxMTAvMjA/";
const WIDTH = { card: 480, big: 1280 };
/** Rule 4: a served copy lives at most an hour in a browser or at the edge. */
export const COPY_MAX_AGE = 3600;

const trestle = (u) => typeof u === "string" && u.startsWith(ORIGIN) && u.includes(FEED) && u.length <= 600 && /^[A-Za-z0-9:/._~%=-]+$/.test(u);
export const CRM_PHOTO = "https://app.chapter3realty.com/api/idx/photo/";
export const crmPhoto = (u) => typeof u === "string" && u.startsWith(CRM_PHOTO) && u.length <= 300 && /^[A-Za-z0-9:/._~-]+$/.test(u) && !u.includes("..");
/** A link this store serves: our Trestle feed's, or the CRM's. Never a photo service for others. */
export const ourPhoto = (u) => trestle(u) || crmPhoto(u);

/** The link a page uses: our copy for a Trestle photo, the link itself for anything else (the CRM's included). */
export function photoUrl(u, size = "card") {
  return trestle(u) ? `/homes/p/${size === "big" ? "big" : "card"}?u=${encodeURIComponent(u)}` : u;
}

const CRM_PARTS = /^https:\/\/app\.chapter3realty\.com\/api\/idx\/photo\/([A-Za-z0-9]{1,30})\/([A-Za-z0-9_-]{1,40})\/(\d{1,3})\/(\d{2,4})\/[A-Za-z0-9_-]{1,100}\.webp$/;
/** A CRM photo link's listing, version, place and width, and the R2 key of its copy: l/<listingKey>/<v>/<n>-<w>.webp. */
export function crmParts(u) {
  const m = crmPhoto(u) ? CRM_PARTS.exec(u) : null;
  return m ? { key: m[1], v: m[2], n: +m[3], w: +m[4], obj: `l/${m[1]}/${m[2]}/${m[3]}-${m[4]}.webp` } : null;
}

// ── The warmer's bookkeeping, in the bucket ─────────────────────────────────
export const STATE = "state/warm.json";
export const FRESH = "state/fresh.json";
export const LOCK = "state/lock";
/** One run at a time, at most one every 14 minutes (the Worker asks every 15). */
export const RUN_EVERY_MS = 14 * 60_000;
/** A run asked for "now" by hand still waits for a run started in the last 5 minutes to finish. */
const BUSY_MS = 5 * 60_000;
/** A sweep starts this long after the last one started: under 6 hours, so a finished sweep is never 6 hours old (rule 3). */
export const SWEEP_EVERY_MS = (5 * 60 + 45) * 60_000;
/** Rule 3: copies are served only while the last finished sweep is younger than this. */
export const FRESH_MS = 6 * 3600_000;
/** CRM listing calls a run makes at most: 16 pages of 48. A sweep of about 9,000 homes takes about 12 runs, 3 hours. */
export const PAGES_PER_RUN = 16;
export const PAGE_SIZE = 48;
/** The CRM answers pages 1 to 100; the sweep starts again from the last price at page 99. */
const LAST_PAGE = 99;
/** Photos a run fetches from the CRM's photo server at most. With the pages, a run makes at most 28 CRM calls, and runs are
 *  15 minutes apart, so no 10 minutes ever holds 30. */
export const PHOTOS_PER_RUN = 12;
/** A sweep not finished this long after it started is dropped and started again: a copy then never outlives its listing by 12 hours (5 h 45 min + 6 h). */
export const SWEEP_MAX_MS = 6 * 3600_000;
/** Old (hash-named) copies a run reads the names of, in lists of 1,000. */
const LEGACY_LISTS_PER_RUN = 10;

/* Copies made before 2026-11-13 were named by a hash of the link and size (p/v1/<size>/<sha256>).
   They are served only once the old-copy pass has kept just those of listings in a finished sweep. */
async function storeKey(size, u) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(u)));
  return `p/v1/${size}/${[...d].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
const served = (body, type) => new Response(body, { headers: { "content-type": type, "cache-control": `public, max-age=${COPY_MAX_AGE}` } });

/** The photo made smaller for one size, as bytes and a type (the original when it cannot be). */
function sized(bytes, type, size) {
  if (/jpe?g/i.test(type)) {
    const small = shrinkJpeg(bytes, WIDTH[size], size === "big" ? 66 : 72);
    if (small && small.length < bytes.length) return [small, "image/jpeg"];
  }
  return [bytes, type];
}

/* Whether copies may be served (rule 3): read from the bucket at most once a minute per isolate. */
let freshMemo = { at: -Infinity, okAt: null, legacy: false };
/** Tests only. */
export function forgetFresh() { freshMemo = { at: -Infinity, okAt: null, legacy: false }; }
async function servable(env, now) {
  if (now - freshMemo.at >= 60_000) {
    let okAt = null, legacy = false;
    try {
      const o = await env.PHOTOS.get(FRESH);
      if (o) { const j = JSON.parse(await o.text()); okAt = typeof j.okAt === "number" ? j.okAt : null; legacy = j.legacy === "done"; }
    } catch { okAt = null; }
    freshMemo = { at: now, okAt, legacy };
  }
  return { ok: freshMemo.okAt !== null && now - freshMemo.okAt <= FRESH_MS, legacy: freshMemo.legacy };
}

/** GET /homes/p/<size>?u=: a current copy, or the link itself. Never stores anything. */
export async function photo(context, url, size) {
  const u = url.searchParams.get("u") || "";
  if (!WIDTH[size] || !ourPhoto(u)) return new Response("Not found", { status: 404 });
  const env = context.env || {};
  const link = () => new Response(null, { status: 302, headers: { Location: u, "cache-control": "no-store" } });
  if (crmPhoto(u)) {
    const parts = crmParts(u);
    if (!parts || !env.PHOTOS) return link();
    const now = (context.now || Date.now)();
    const may = await servable(env, now);
    // The removal sweep is late or never finished: no copy is shown (rule 3). The CRM's link stops for a listing that left IDX.
    if (!may.ok) return link();
    let o = await env.PHOTOS.get(parts.obj);
    if (!o && may.legacy) o = await env.PHOTOS.get(await storeKey(size, u));
    return o ? served(o.body, (o.httpMetadata && o.httpMetadata.contentType) || "image/webp") : link();
  }
  // An MLS host link from before the CRM served photos: made smaller here, never stored, cached an hour at most.
  let r = null;
  try { r = await fetch(u); } catch { r = null; }
  const type = r ? r.headers.get("content-type") || "" : "";
  if (!r || !r.ok || !/^image\//.test(type)) return link();
  const [body, outType] = sized(new Uint8Array(await r.arrayBuffer()), type, size);
  return served(body, outType);
}

// ── The warmer ──────────────────────────────────────────────────────────────

/** One run at a time: the lock's time moves only by a compare-and-swap on its etag, so of many callers at once one runs. */
async function takeLock(R2, now, byHand) {
  let h = await R2.head(LOCK);
  if (!h) { await R2.put(LOCK, "0", { customMetadata: { at: "0" } }); h = await R2.head(LOCK); if (!h) return false; }
  const last = Number((h.customMetadata && h.customMetadata.at) || 0);
  if (now - last < (byHand ? BUSY_MS : RUN_EVERY_MS)) return false;
  const got = await R2.put(LOCK, String(now), { customMetadata: { at: String(now) }, onlyIf: { etagMatches: h.etag } });
  return !!got;
}

const empty = () => ({ v: 2, have: {}, last: null, sweep: null, lastSweepStartedAt: 0, lastSweepOkAt: null, del: [], want: [], legacy: null, pauseUntil: 0, runs: [] });

/** The listing's price for the sweep's price order: whole dollars, or null. */
const priceOf = (l) => (l && typeof l.listPrice === "number" ? l.listPrice : l && typeof l.price === "number" ? l.price : null);

/**
 * GET /homes/api/warm (the photo-warmer Worker, every 15 minutes; WARM_KEY in x-warm-key).
 * One run: copies to delete go first; then up to PAGES_PER_RUN pages of the removal sweep, one
 * call at a time; then up to PHOTOS_PER_RUN photos fetched for listings the sweep saw with no
 * copy of their current version; then the old-copy pass. A run that cannot take the lock does
 * nothing at all (the old Worker called 18 times a minute; 17 of those now cost no CRM call).
 * `listPage(price, page)` is one CRM call: { status, json, retryAfter }. ?run=now: a run by hand,
 * still one at a time. ?status=1: the bookkeeping only, no CRM call.
 */
export async function warm(context, url, listPage) {
  const env = context.env || {};
  const want = String(env.WARM_KEY || "").trim();
  if (want.length < 20 || (context.request.headers.get("x-warm-key") || "").trim() !== want) return new Response("Not found", { status: 404 });
  const reply = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  const R2 = env.PHOTOS;
  if (!R2) return reply({ ok: false, error: "no_bucket" });
  const now = (context.now || Date.now)();
  const load = async () => { try { const o = await R2.get(STATE); return o ? { ...empty(), ...JSON.parse(await o.text()) } : null; } catch { return null; } };
  const summary = (st) => {
    const listings = Object.keys(st.have).length, objects = Object.values(st.have).reduce((n, h) => n + h.keys.length, 0);
    const tenMin = st.runs.filter((r) => now - r.at <= 10 * 60_000).reduce((n, r) => n + r.crm, 0);
    return { listings, objects, lastSweepOkAt: st.lastSweepOkAt, sweep: st.sweep && { startedAt: st.sweep.startedAt, page: st.sweep.page, min: st.sweep.min, seen: Object.keys(st.sweep.seen).length },
      serving: st.lastSweepOkAt !== null && now - st.lastSweepOkAt <= FRESH_MS, legacy: st.legacy === "done" ? "done" : st.legacy ? "in progress" : "waiting for a finished sweep",
      toFetch: st.want.length, toDelete: st.del.length, crmCallsLast10Min: tenMin, runs: st.runs.slice(-8) };
  };
  if (url.searchParams.get("status") === "1") {
    const st = await load();
    let requests = null;
    try { const o = await R2.get("state/crm-requests.json"); if (o) { const j = JSON.parse(await o.text()); requests = { sent: j.sent, checkedAt: j.checkedAt, threads: j.threads }; } } catch { requests = null; }
    return reply({ ok: true, ...(st ? summary(st) : { state: "none" }), requests });
  }
  if (!(await takeLock(R2, now, url.searchParams.get("run") === "now"))) return reply({ ok: true, skipped: "another_run" });

  let st = await load();
  if (!st) {
    // No bookkeeping (the first run, or it was lost): the copies under l/ are listed, so none is ever forgotten.
    st = empty();
    let cursor;
    do {
      const page = await R2.list({ prefix: "l/", cursor, limit: 1000 });
      for (const o of page.objects) {
        const m = /^l\/([A-Za-z0-9]+)\/([A-Za-z0-9_-]+)\//.exec(o.key);
        if (!m) continue;
        const h = st.have[m[1]] || (st.have[m[1]] = { v: m[2], keys: [] });
        // Two versions of one listing: the older goes; the sweep keeps the one it sees.
        if (h.v !== m[2]) st.del.push(o.key); else h.keys.push(o.key);
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }
  const run = { at: now, crm: 0, pages: 0, fetched: 0, stored: 0, deleted: 0, stop: "" };
  try {
    await work(st, run);
  } catch (e) {
    run.stop = run.stop || `error: ${String((e && e.message) || e).slice(0, 120)}`;
  }
  // The CRM's request line (idx-lib/crm-requests.js): notes not sent yet go out once, after the deploy that carries them.
  try { run.requests = await sendRequests(env, now); } catch { run.requests = { sent: [], stop: "error" }; }
  st.runs = [...(st.runs || []), run].filter((x) => now - x.at <= 24 * 3600_000).slice(-120);
  await R2.put(STATE, JSON.stringify(st), { httpMetadata: { contentType: "application/json" } });
  await R2.put(FRESH, JSON.stringify({ okAt: st.lastSweepOkAt, legacy: st.legacy === "done" ? "done" : "no" }), { httpMetadata: { contentType: "application/json" } });
  return reply({ ok: true, run, ...summary(st) });

  async function work(st, run) {
    const drop = (key) => { const h = st.have[key]; if (h) { st.del.push(...h.keys); delete st.have[key]; } };
    /* A listing's photos changed: every copy of it in the bucket that is not this version goes in this run, whether the
       bookkeeping knew of it or not (rule 2). */
    const dropOldVersions = async (key, v) => {
      drop(key);
      let cursor;
      do {
        const page = await R2.list({ prefix: `l/${key}/`, cursor, limit: 1000 });
        for (const o of page.objects) if (!o.key.startsWith(`l/${key}/${v}/`)) st.del.push(o.key);
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    };

    // 1. The removal sweep.
    const crmOk = now >= (st.pauseUntil || 0);
    // A sweep past its time (the CRM was down) is dropped: what it saw hours ago no longer proves a listing is there.
    if (st.sweep && now - st.sweep.startedAt > SWEEP_MAX_MS) st.sweep = null;
    const wanted = new Set(st.want.map((t) => (crmParts(CRM_PHOTO + t) || {}).key));
    if (!st.sweep && now - (st.lastSweepStartedAt || 0) >= SWEEP_EVERY_MS) {
      st.sweep = { startedAt: now, min: 0, page: 1, seen: {} };
      st.lastSweepStartedAt = now;
    }
    if (!crmOk) run.stop = "crm_asked_to_wait";
    while (crmOk && st.sweep && run.pages < PAGES_PER_RUN) {
      const sw = st.sweep;
      run.crm++;
      let r;
      try { r = await listPage(sw.min, sw.page); } catch { r = { status: 502, json: null }; }
      if (r.status === 429) {
        // The CRM's own limit: wait as long as it says, and end the run. Never a retry here.
        const wait = Math.min(Math.max(Number(r.retryAfter) || 60, 1), 3600);
        st.pauseUntil = now + wait * 1000; run.stop = "crm_429"; break;
      }
      if (r.status !== 200 || !r.json || r.json.ok !== true || !Array.isArray(r.json.listings)) {
        run.stop = r.json && r.json.error === "stale" ? "crm_stale" : `crm_${r.status}`; break;
      }
      run.pages++;
      const ls = r.json.listings;
      for (const l of ls) {
        const parts = crmParts(l && l.photo);
        if (!parts) continue;
        sw.seen[parts.key] = parts.v;
        const h = st.have[parts.key];
        // The photos changed: the old version's copies go in this run (rule 2).
        if (h && h.v !== parts.v) await dropOldVersions(parts.key, parts.v);
        if (!st.have[parts.key] && !wanted.has(parts.key)) { wanted.add(parts.key); st.want.push(l.photo.slice(CRM_PHOTO.length)); }
      }
      const last = ls.length ? priceOf(ls[ls.length - 1]) : null;
      if (ls.length < PAGE_SIZE) {
        /* The last page. Every copy in the bucket is checked against what this sweep saw, not against the bookkeeping:
           a copy of a listing it did not see, or of another version, is deleted (rule 2). What is left is the
           bookkeeping from now on. */
        const next = {};
        let cursor;
        do {
          const page = await R2.list({ prefix: "l/", cursor, limit: 1000 });
          for (const o of page.objects) {
            const m = /^l\/([A-Za-z0-9]+)\/([A-Za-z0-9_-]+)\//.exec(o.key);
            if (m && sw.seen[m[1]] === m[2]) (next[m[1]] || (next[m[1]] = { v: m[2], keys: [] })).keys.push(o.key);
            else st.del.push(o.key);
          }
          cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);
        // The old hash-named copies the old-copy pass kept: the same test.
        for (const [key, h] of Object.entries(st.have)) for (const k of h.keys) {
          if (!k.startsWith("p/v1/")) continue;
          if (sw.seen[key] === h.v && (!next[key] || next[key].v === h.v)) (next[key] || (next[key] = { v: h.v, keys: [] })).keys.push(k);
          else st.del.push(k);
        }
        st.have = next;
        st.want = st.want.filter((t) => { const w = crmParts(CRM_PHOTO + t); return w && sw.seen[w.key] === w.v; });
        st.last = sw.seen;
        st.lastSweepOkAt = now; st.sweep = null;
        if (!st.legacy) st.legacy = "start";
        break;
      }
      if (sw.page >= LAST_PAGE && last !== null) { sw.min = last; sw.page = 1; } else sw.page++;
    }

    // 2. Deletions: every copy of a listing that left, and old versions.
    const flush = async () => {
      while (st.del.length) {
        const batch = st.del.slice(0, 1000);
        await R2.delete(batch);
        st.del = st.del.slice(batch.length);
        run.deleted += batch.length;
      }
    };
    await flush();

    // 3. Photos for listings the sweep saw (rule 1), one at a time; a copy already kept is never fetched again.
    // Only a listing the sweep running now, or the last finished one, saw at this version.
    const seenNow = (w) => !!w && ((st.sweep && st.sweep.seen[w.key] === w.v) || (st.last && st.last[w.key] === w.v));
    st.want = st.want.filter((t) => { const w = crmParts(CRM_PHOTO + t); return seenNow(w) && !(st.have[w.key] && st.have[w.key].v === w.v); });
    while (crmOk && st.want.length && run.fetched < PHOTOS_PER_RUN && !run.stop) {
      const t = st.want.shift(), u = CRM_PHOTO + t, w = crmParts(u);
      if (!w) continue;
      if (await R2.head(w.obj)) { st.have[w.key] = { v: w.v, keys: [w.obj] }; continue; }
      let r = null;
      try { r = await fetch(u); } catch { r = null; }
      run.fetched++; run.crm++;
      if (r && r.status === 429) { st.want.unshift(t); run.stop = "photo_429"; break; }
      if (r && r.status >= 500) { st.want.unshift(t); run.stop = `photo_${r.status}`; break; }
      if (r && r.ok && /^image\//.test(r.headers.get("content-type") || "")) {
        await R2.put(w.obj, new Uint8Array(await r.arrayBuffer()), { httpMetadata: { contentType: r.headers.get("content-type") }, customMetadata: { listing: w.key, v: w.v } });
        st.have[w.key] = { v: w.v, keys: [w.obj] };
        run.stored++;
      }
    }

    // 4. The old hash-named copies, once, after a finished sweep: a copy of a listing it saw, at that version, is kept and
    //    tracked like the others (so it goes when the listing goes); every other one is deleted.
    if (st.legacy && st.legacy !== "done" && st.last) {
      let cursor = st.legacy === "start" ? undefined : st.legacy;
      for (let i = 0; i < LEGACY_LISTS_PER_RUN; i++) {
        const page = await R2.list({ prefix: "p/v1/", cursor, limit: 1000, include: ["customMetadata"] });
        for (const o of page.objects) {
          const parts = crmParts(o.customMetadata && o.customMetadata.src);
          const h = parts && st.have[parts.key];
          if (parts && st.last[parts.key] === parts.v && (!h || h.v === parts.v)) {
            (st.have[parts.key] || (st.have[parts.key] = { v: parts.v, keys: [] })).keys.push(o.key);
          } else st.del.push(o.key);
        }
        cursor = page.truncated ? page.cursor : undefined;
        if (!cursor) break;
      }
      await flush();
      st.legacy = cursor || "done";
    }
  }
}
