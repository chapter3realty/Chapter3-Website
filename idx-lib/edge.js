/**
 * What the listing search adds to the site's own pages, at the edge (functions/_middleware.js).
 * Only while the search is on (IDX_LIVE, or the owner's preview cookie):
 *
 * 1. The header's "Search Listings" buttons open /homes/ instead of the old pop-up.
 * 2. A guide page's homes strips are filled. A page carries empty slots,
 *    <div class="hx-strip" data-place="<slug>" data-name="<Name>"></div> (Blog-Brain
 *    tools/glass.js homes()), one per community, where the community's photo was. Each slot
 *    gets one row that pans sideways: up to 10 homes, the most appealing first (never by price),
 *    photos first, each a photo, the price and the listing firm, then "See all N homes".
 *    A place with fewer than 3 homes keeps its empty slot, and the page shows the place's
 *    photo instead. If the MLS copy is stale (503), no listings show at all (CCMLS 16.7).
 * 3. Where listings show, the notice (16.16, 16.17), the sign-up and tour dialogs and the
 *    page script are added once.
 */
import { crm, idxOn, visitorToken } from "./crm.js";
import { PLACES } from "./places.js";
import { FEEDS, feedParams, postFilter, rankHomes } from "./feeds.js";
import { filterBar } from "./filters.js";
import { filterCatalog } from "./catalog.js";
import { catalogLoaded } from "./features.js";
import { STYLE, STRIP_STYLE, SCRIPT, disclaimer, esc, safeUrl, signupDialog, stripCard, tourDialog } from "./render.js";

const SLOT = /<div class="hx-strip" data-place="([a-z0-9-]+)" data-name="([^"<>]*)"(?: data-head="([^"<>]*)")?><\/div>/g;
const STRIP_CARDS = 10;
const STRIP_MIN = 3;
const STRIP_BUDGET_MS = 3000; // a slow CRM never holds up a guide page: past this, no strips
const TYPES = ["house", "condo", "townhouse", "manufactured", "multi", "land"];

/** The CRM search for a place, from validated parts only (contract §3, §5). Null if a part is bad. */
export function placeParams(q) {
  const p = new URLSearchParams();
  if (q.subdivision !== undefined) {
    if (!/^[A-Za-z0-9 .,'&()\/-]{2,80}$/.test(q.subdivision)) return null;
    p.set("subdivision", q.subdivision);
  }
  if (q.near !== undefined) {
    const m = /^(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)$/.exec(q.near);
    if (!m) return null;
    const lat = +m[1], lng = +m[2];
    if (lat < 31 || lat > 37 || lng < -82 || lng > -75) return null;
    p.set("near", `${lat.toFixed(6)},${lng.toFixed(6)}`);
    const miles = Math.min(25, Math.max(0.1, Number(q.miles) || 1));
    p.set("miles", String(miles));
  }
  if (!p.has("subdivision") && !p.has("near")) return null; // never "every listing in the MLS"
  if (q.type !== undefined) {
    if (!TYPES.includes(q.type)) return null;
    p.set("type", q.type);
  }
  // hoa=0: only homes whose listing says there is no HOA (CRM ticket 415). The only value there is.
  if (q.hoa !== undefined) {
    if (String(q.hoa) !== "0") return null;
    p.set("hoa", "0");
  }
  return p;
}

/** Required wherever homes are shown as having no HOA (CRM ticket 415): where that fact comes from. */
export const NO_HOA_NOTE = "No HOA, as listed by the listing agent. Confirm before you buy.";

const PLACE_BAR = { minPhotos: 6, yearMin: 1800, minSqft: 0 };

function strip(slug, name, listings, total, noHoa, head) {
  const all = `/homes/near/${slug}/`;
  // name is our own markup from the page (already escaped there): print it as it is.
  const n = typeof total === "number" ? total : listings.length;
  // head, like name, is our own escaped markup from the page (glass.js homes()).
  return `<p class="hx-s-head"><b>${head || `Homes for sale in ${name} now`}</b><a href="${all}">See all ${esc(String(n))}</a></p>`
    + (noHoa ? `<p class="hx-s-note">${NO_HOA_NOTE}</p>` : "")
    + `<div class="hx-s-row">${listings.filter((l) => safeUrl(l.photo)).slice(0, STRIP_CARDS).map((l) => stripCard(l, false)).join("")}`
    + `<a class="hx-s-all" href="${all}" draggable="false">See all ${esc(String(n))} homes in ${name}</a></div>`;
}

/** Run a feed's searches at once, merged and de-duplicated. "stale", or [listings, total, meta], or null. */
async function runFeed(env, request, feed) {
  const calls = (feed.q || []).map((q) => {
    const p = feedParams(q);
    if (!p) return null;
    p.set("size", feed.q.length > 2 ? "24" : "48");
    return crm(env, request, `/api/idx/listings?${p.toString()}`, { anonymous: true, timeoutMs: STRIP_BUDGET_MS - 500 }).catch(() => null);
  });
  let timer;
  const late = new Promise((done) => { timer = setTimeout(() => done(null), STRIP_BUDGET_MS); });
  const answers = await Promise.race([Promise.all(calls), late]);
  clearTimeout(timer);
  if (!answers) return null;
  if (answers.some((r) => r && r.status === 503 && r.json && r.json.error === "stale")) return "stale";
  const seen = new Set(), out = [];
  let total = 0, meta = null, applied = false;
  for (const r of answers) {
    if (!r || r.status !== 200 || !r.json || !r.json.ok || !Array.isArray(r.json.listings)) continue;
    meta = meta || r.json.meta;
    // The CRM names the wider filters it read (branch website/idx-filters); an older CRM does not.
    if (Array.isArray(r.json.applied) && (r.json.applied.includes("has") || r.json.applied.includes("not"))) applied = true;
    total += typeof r.json.total === "number" ? r.json.total : r.json.listings.length;
    for (const l of r.json.listings) if (l && !seen.has(l.mlsNumber)) { seen.add(l.mlsNumber); out.push(l); }
  }
  // Narrowed to the quality bar and put in order here, so the "at least 3 homes" check counts what will show.
  const kept = rankHomes(postFilter(out, feed.post, feed), feed.rank);
  return [kept, total, meta, applied];
}

/** The homes the title promises, in its order, photos first. */
function feedHomes(feed, listings) {
  // Already narrowed and in order (runFeed): the first STRIP_CARDS with a photo.
  return listings.filter((l) => safeUrl(l.photo)).slice(0, STRIP_CARDS);
}

/** The article's feed: near the top, one line of title, the homes, and the filters to change them. */
function feedSection(feed, listings, total, applied) {
  const link = feed.link || "";
  // "See all" and every search open the map (owner, 2026-10-28: Search listings is the map page).
  const all = `/homes/map/${link ? `?${link}` : ""}`;
  const head = feed.needs === "has" && !applied && feed.headToday ? feed.headToday : feed.head;
  return `<section class="hx-feed${feed.low ? "" : " hx-feed-top"}"><div class="wrap"><div class="hx-strip hx-feed-strip" data-feed="1">`
    + `<p class="hx-feed-eb">Live from the MLS</p>`
    + `<p class="hx-s-head"><b class="hx-feed-h">${esc(head)}</b><a href="${esc(all)}">See all</a></p>`
    + (feed.noHoa ? `<p class="hx-s-note">${NO_HOA_NOTE}</p>` : "")
    + filterBar({ action: "/homes/map/", params: new URLSearchParams(link), features: applied || catalogLoaded(), compact: true, ask: feed.ask || "" })
    + `<div class="hx-s-row" data-hx-row>${feedHomes(feed, listings).map((l) => stripCard(l, false)).join("")}`
    + `<a class="hx-s-all" href="${esc(all)}" draggable="false">See all homes</a></div></div></div></section>`;
}

/**
 * Near the top (owner, 2026-10-26: "close to the top so that there's no scrolling then get
 * into the blog"): right after the part of the page that holds the H1, before the article's
 * first section. Without an H1, or on a tool page (`low`), the old place lower down.
 */
export function placeFeedTop(html, block) {
  const a = html.indexOf("<main"), z = html.indexOf("</main>");
  if (a < 0 || z < 0) return html;
  const main = html.slice(a, z);
  const h1 = main.search(/<h1\b/);
  if (h1 < 0) return placeFeed(html, block);
  let at = -1;
  const open = main.lastIndexOf("<section", h1);
  const closeOpen = open >= 0 ? main.indexOf("</section>", open) : -1;
  if (open >= 0 && closeOpen > h1) at = closeOpen + "</section>".length; // the H1's own section: after it
  else { const next = main.indexOf("<section", h1); if (next >= 0) at = next; }
  if (at < 0) return placeFeed(html, block);
  return html.slice(0, a + at) + block + html.slice(a + at);
}

/** Where the feed goes: before the third section of the article, else before its second <h2>, else at the end. */
export function placeFeed(html, block) {
  const a = html.indexOf("<main"), z = html.indexOf("</main>");
  if (a < 0 || z < 0) return html;
  const main = html.slice(a, z);
  const secs = [...main.matchAll(/<section\b/g)].map((m) => m.index);
  let at = secs.length >= 3 ? secs[2] : -1;
  if (at < 0) {
    const h2 = [...main.matchAll(/<h2\b/g)].map((m) => m.index);
    at = h2.length >= 2 ? h2[1] : main.length;
    // An h2 inside a section that is still open: go before that section, never inside it.
    const open = main.lastIndexOf("<section", at);
    if (open >= 0 && main.indexOf("</section>", open) > at) at = open;
  }
  return html.slice(0, a + at) + block + html.slice(a + at);
}

const switchHeader = (html) => html.replace(/onclick="openIdx\(\)"/g, `onclick="location.href='/homes/map/'"`);

/** The styles, the notice, the dialogs and the script, once, on a page that now shows listings. */
function finish(env, request, gate, html, meta, headers) {
  const signed = Boolean(visitorToken(request));
  html = html
    .replace("</head>", () => `${STYLE}${STRIP_STYLE}</head>`)
    .replace(/<body([^>]*)>/, (m, a) => `<body${a} data-hx-signed="${signed ? "1" : "0"}">`)
    .replace("</main>", () => `<div class="hx-wrap" style="padding-top:0">${disclaimer(meta)}</div></main>`)
    .replace("</body>", () => `${signupDialog(env.TURNSTILE_SITE_KEY)}${tourDialog()}${SCRIPT}</body>`);
  headers.set("cache-control", signed || gate.preview ? "private, no-store" : "public, max-age=300");
  return new Response(html, { status: 200, headers });
}

/** The response with the listing search's additions, or untouched. Never throws. */
export async function withIdx(context, response) {
  let text = null;
  try {
    const { request, env } = context;
    if (request.method !== "GET" || response.status !== 200) return response;
    if (!(response.headers.get("content-type") || "").includes("text/html")) return response;
    const gate = idxOn(env, request);
    if (!gate.on) return response;
    const url = new URL(request.url);
    text = await response.text();
    let html = switchHeader(text);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    // The body changes, so the static file's validators no longer describe it (a 304 would bring back old strips).
    headers.delete("etag");
    headers.delete("last-modified");
    const slots = url.pathname.startsWith("/homes") ? [] : [...html.matchAll(SLOT)];
    // A page with its own strips gets no feed, unless its feed says it goes on top of them (withStrips).
    const own = FEEDS[url.pathname];
    const feed = own && (own.withStrips || (!slots.length && !html.includes('class="hx-strip"'))) ? own : null;
    let feedMeta = null;
    if (feed) {
      // Too few homes for the topic: the fallback, or the Grand Strand's newest, under its own title.
      let used = feed;
      // The CRM's live feature list first (cached an hour): a feed whose key it no longer lists is skipped.
      await filterCatalog(env, request);
      let got = await runFeed(env, request, used);
      // A title the CRM's features make true, from a CRM that did not apply them, would be a false title: fall back.
      const untrue = (f, g) => g && g !== "stale" && f.needs === "has" && !f.headToday && !g[3];
      if (got && got !== "stale" && (got[0].length < STRIP_MIN || untrue(used, got))) {
        const wider = feed.fallback || FEEDS["/buyers/"];
        if (wider !== used) { used = wider; got = await runFeed(env, request, used); }
        // One more step down when the fallback is itself a feature title that cannot be shown.
        if (got && got !== "stale" && (got[0].length < STRIP_MIN || untrue(used, got)) && used.fallback && used.fallback !== used) { used = used.fallback; got = await runFeed(env, request, used); }
      }
      if (got && got !== "stale" && got[0].length >= STRIP_MIN) {
        html = (feed.low ? placeFeed : placeFeedTop)(html, feedSection({ ...used, low: feed.low }, got[0], got[1], got[3]));
        feedMeta = got[2];
      }
      if (!slots.length) return feedMeta ? finish(env, request, gate, html, feedMeta, headers) : new Response(html, { status: 200, headers });
    }
    if (!slots.length) return new Response(html, { status: 200, headers });
    const early = () => (feedMeta ? finish(env, request, gate, html, feedMeta, headers) : new Response(html, { status: 200, headers }));

    const slugs = [...new Set(slots.map((m) => m[1]))].filter((s) => PLACES[s]);
    const calls = Promise.all(slugs.map((s) => {
      const p = placeParams(PLACES[s].q);
      if (!p) return null;
      p.set("status", "active");
      p.set("size", "48");
      return crm(env, request, `/api/idx/listings?${p.toString()}`, { anonymous: true, timeoutMs: STRIP_BUDGET_MS - 500 }).catch(() => null);
    }));
    let timer;
    const late = new Promise((done) => { timer = setTimeout(() => done(null), STRIP_BUDGET_MS); });
    const answers = await Promise.race([calls, late]);
    clearTimeout(timer);
    if (!answers) return early();
    // A stale MLS copy means no listings anywhere on the page (16.7).
    if (answers.some((r) => r && r.status === 503 && r.json && r.json.error === "stale")) return new Response(html, { status: 200, headers });
    const filled = new Map();
    let meta = null;
    slugs.forEach((s, i) => {
      const r = answers[i];
      // The same bar and order as the feeds (owner, 2026-10-26: never "the cheapest dump" first), with no
      // year or size floor: a place's older houses and small beach cottages are what its page is about.
      const ls = r && r.status === 200 && r.json && r.json.ok ? rankHomes(postFilter(r.json.listings || [], PLACE_BAR), "appeal") : [];
      if (ls.length >= STRIP_MIN) { filled.set(s, [ls, r.json.total]); meta = meta || r.json.meta; }
    });
    if (!filled.size) return early();

    html = html.replace(SLOT, (whole, slug, name, head) => {
      const f = filled.get(slug);
      return f ? `<div class="hx-strip" data-place="${slug}" data-name="${name}">${strip(slug, name, f[0], f[1], PLACES[slug].q.hoa !== undefined, head)}</div>` : whole;
    });
    return finish(env, request, gate, html, meta || feedMeta, headers);
  } catch {
    return text === null ? response : new Response(text, { status: response.status, headers: response.headers });
  }
}
