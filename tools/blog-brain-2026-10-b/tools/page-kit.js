#!/usr/bin/env node
/*
 * page-kit.js: the general page blocks every batch can use. Moved here from the 55+ batch's
 * kit (batches/2026-10-a/specs/_55-plus-kit.js), so a new batch does not copy them (lesson
 * L34: a general helper lives where every batch can use it). No sentence of page copy lives
 * here: every word a reader sees comes from the spec.
 *
 * Usage, in a batch kit (specs/_<batch>-kit.js in the website working copy):
 *
 *   const { h } = require("../tools/mkpage.js");
 *   const PK = require(path.join(BB, "tools", "page-kit.js"));   // BB: see "Finding Blog-Brain" below
 *   const kit = PK.create({
 *     h,                                        // the website's mkpage helpers (h.figure is used)
 *     places: require("../data/places.json"),  // optional: the batch's map points, for maps()
 *     photos: require("../data/photos.json").photos,  // optional: licensed photo records, for photoSet()
 *     notUsed: ["some-photo-name"],             // optional: photos this batch refuses
 *     mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"),  // where a big map file goes
 *     mapSrc: "/images/maps",                   // its url folder
 *   });
 *   kit.maps(slug, picks, o)      the "where it is" map and the Google Maps link for one community
 *   kit.placesMap(name, places, o)   one map of 2 to 15 neighborhoods or towns, with a numbered key
 *   kit.photoSet(o)               one page's photos and their credits
 *   kit.story(paras, meaning, bg, offer)   the labelled example in a card (same as PK.story)
 *   kit.glance(items)             the icon row in the hero (same as PK.glance)
 *   kit.prosCons(pros, cons, o)   the two lists of pros and cons (same as PK.prosCons)
 *   kit.glass                     tools/glass.js: the "liquid glass" theme (glass.page(spec)), the
 *                                 price chart with feature labels (bars) and the offer pill (offer)
 *
 * story, glance and prosCons need no batch data, so they are also exported alone.
 * Comparison tables and the "I want X" block are in tools/compare.js.
 *
 * Batch data shapes:
 *   places   { communities: [{ slug, name, lat, lon, town, drives: [{ to_id, minutes }] }],
 *              landmarks: [{ id, lat, lon }] }. A drive goes in only from a verified ledger row.
 *   photos   the records tools/photos.js checks (license, author, source, crops).
 *
 * Finding Blog-Brain. A batch kit looks, in order, for: the copy an upload package puts in the
 * website's tools/blog-brain/ (tools/package-batch.js, from upload.json "blogBrainTools"), then
 * $BLOG_BRAIN, then the Blog-Brain repo three folders up (a batch's specs folder), then
 * /home/user/Blog-Brain. The first folder with tools/page-kit.js wins:
 *
 *   const BB = [path.join(__dirname, "..", "tools", "blog-brain"), process.env.BLOG_BRAIN,
 *     path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
 *     .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
 *
 * page-kit.js loads area-map.js, icons.js, photos.js and story-check.js from its own folder,
 * so an upload package that lists page-kit.js gets them too (package-batch.js adds them).
 */
"use strict";
const { communityMaps, regionMap, CREDIT2 } = require("./area-map.js");
const { atAGlance, icon } = require("./icons.js");
const P = require("./photos.js");
const storyCheck = require("./story-check.js");
const glass = require("./glass.js");

/* ---------------------------------------------------------------------------- */
/* The example story                                                              */

/*
 * The labelled example in a card, then the one plain sentence on what it means and the offer,
 * outside the card (voice/STORY-CRAFT.md, STANDARD T2, owner 2026-10-11). paras: the story's
 * paragraphs. The first opens with the bold "Example:" label, and a Chapter3 agent acts in the
 * story: the example shows how an agent works, in the present tense, so no sentence claims a
 * past client. (STORY-CRAFT's model opener "Here is how a Chapter3 agent handles it" fails the
 * website's build audit, which bans "here is how" teasers and "But"/"So" openers; the website's
 * rules win, so the agent enters the story by name instead.) bg: the card fill, the opposite of
 * the section (as h.cta). offer: optional plain line after the meaning.
 */
function story(paras, meaning, bg, offer) {
  if (!/^<strong>Example:<\/strong> /.test(paras[0] || "")) throw new Error("a story opens with <strong>Example:</strong>");
  const text = paras.join(" ").replace(/<[^>]+>/g, "");
  if (!/\bChapter3 agent\b/.test(text)) throw new Error("a Chapter3 agent acts in the example (owner, 2026-10-11)");
  if (/(?:^|[.!?]\s+)(?:And|So|But|Or|Yet)\b/.test(text.replace(/^Example:\s*/, ""))) throw new Error("no And, So, But, Or or Yet sentence openers (website build.js)");
  if (/\b(?:our clients?|we helped|Chapter ?3 (?:found|helped)|clients?)\b/i.test(text)) throw new Error("an example never says the people are clients");
  /* Present tense only: an agent who "helped", "found" or "got" reads as a real past client. */
  if (/\bagent (?:helped|found|got|read|checked|showed|saw|walked|told|knew|made|gave)\b/i.test(text)) throw new Error("the agent acts in the present tense inside an example");
  /* The simple story test (voice/STORY-SIMPLE.md, STANDARD T8), from the shared tool so every batch
     runs the same check (tools/story-check.js, beside this file). */
  const problems = storyCheck.check(text);
  if (problems.length) throw new Error(`the story fails the simple story test: ${problems.join("; ")}`);
  /* Only people act; no figure of speech (RULES 1 and 2; owner's eye, 2026-10-11). */
  if (/\b(?:rules?|law|plan|map|quote) (?:allows?|says?|lets?|makes?|requires?)\b|in front of them/i.test(text)) throw new Error("a rule or paper acts, or a figure of speech inside the example");
  const SP = 'style="color:var(--muted);line-height:1.75;max-width:640px;margin:0 0 .9rem"';
  return `<div class="c3-story" style="background:var(--${bg === "ivory" ? "ivory" : "ivory-2"});border-top:3px solid var(--brass);padding:1.5rem 1.5rem .7rem;margin:1.4rem 0 1.4rem;max-width:720px">`
    + paras.map((t) => `<p ${SP}>${t}</p>`).join("") + `</div>`
    /* The lesson is set at the reading size, like the line after it (it was 17px beside a
       19.5px offer line on a desktop, 2026-10-11). meaning may be empty: an offer box under the
       story can say it. */
    + (meaning ? `<p style="color:var(--navy);font-weight:500;font-size:var(--read,1rem);line-height:1.6;max-width:34em;margin-bottom:${offer ? ".4rem" : "1rem"}">${meaning}</p>` : "")
    + (offer ? `<p style="color:var(--muted);line-height:1.7;max-width:720px;margin-bottom:1rem">${offer}</p>` : "");
}

/* ---------------------------------------------------------------------------- */
/* The icon row in the hero                                                       */

/*
 * A compact row of icons with a word and a time each, for spec.heroMedia (website patch
 * mkpage-hero-media.patch). One row at every width: on a phone each item stands as a small
 * column (icon on top, then the words), so all the icons sit in the first screen; from
 * 700 px each item is a chip with the icon at the left. Plain text, escaped; icons are
 * decoration. items: [{ icon, label, text }].
 */
function glance(items) {
  if (!Array.isArray(items) || items.length < 2 || items.length > 4) throw new Error("glance takes 2 to 4 items");
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const css = "<style>.c3-glance{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:.75rem;max-width:760px}"
    + ".c3-glance li{display:flex;align-items:center;gap:.55rem;margin:0;padding:.5rem .6rem;background:rgba(255,255,255,.55);border:1px solid var(--rule);border-radius:6px;line-height:1.25}"
    + ".c3-glance .i{flex:0 0 auto;display:flex;width:2rem;height:2rem;border-radius:50%;background:var(--ivory-2);color:var(--brass-ink);align-items:center;justify-content:center}"
    + ".c3-glance strong{display:block;color:var(--navy);font-size:.9rem;font-weight:500}"
    + ".c3-glance span.t{display:block;color:var(--muted);font-size:1rem}"
    + "@media (max-width:699px){.c3-glance{gap:.3rem}.c3-glance li{flex-direction:column;justify-content:flex-start;text-align:center;gap:.2rem;padding:.4rem .1rem}"
    + ".c3-glance .i{width:1.6rem;height:1.6rem}.c3-glance strong{font-size:.875rem}.c3-glance span.t{font-size:1rem;line-height:1.2}}</style>";
  return css + `<ul role="list" class="c3-glance" style="--n:${items.length}">` + items.map((it) =>
    `<li><span class="i">${icon(it.icon, { size: 20 })}</span><span><strong>${esc(it.label)}</strong>${it.text ? `<span class="t">${esc(it.text)}</span>` : ""}</span></li>`).join("") + "</ul>";
}

/* ---------------------------------------------------------------------------- */
/* Pros and cons                                                                  */

/* prosCons(pros, cons, { bg }): the pros and cons section's two lists (version 14, CRAFT 3: "Name the
   drawbacks, kindly, in their own place"). Good news first. Each list has a word heading ("Pros",
   "Cons"); the marks beside the items are decoration (aria-hidden): a check in a brass circle for a pro,
   a plain dash for a con. A con is a string, or { text, act } where act says what to do about it and
   shows on its own line. Text is at reading size; the two lists sit side by side on a wide screen and
   one above the other on a phone. */
const PC_CSS = "<style>.c3-pc{display:grid;gap:1rem;max-width:960px;margin:1.2rem 0 1.6rem}"
  + "@media (min-width:760px){.c3-pc{grid-template-columns:1fr 1fr;align-items:start}}"
  + ".c3-pc>div{padding:1.1rem 1.2rem .6rem}"
  + ".c3-pc h3{font-family:var(--sans);font-size:1.15rem;font-weight:600;color:var(--navy);margin:0 0 .8rem;display:flex;align-items:center;gap:.55rem}"
  + ".c3-pc,.c3-pc ul{font-size:1em}.c3-pc ul{list-style:none;margin:0;padding:0}"
  + ".c3-pc li{display:flex;gap:.7rem;align-items:flex-start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.7;margin:0 0 .9rem}"
  + ".c3-pc li svg{flex:none;margin-top:.3rem}"
  + ".c3-pc .c3-pc-do{display:block;color:var(--navy);font-weight:500;margin-top:.2rem}</style>";
const PC_YES = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="var(--brass)"/><path d="M6.2 11.4l3.1 3.1 6.5-6.7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PC_NO = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="none" stroke="var(--muted)" stroke-width="1.6"/><path d="M6.8 11h8.4" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/></svg>';
function prosCons(pros, cons, o = {}) {
  if (!Array.isArray(pros) || !Array.isArray(cons) || pros.length < 3 || pros.length > 4 || cons.length < 3 || cons.length > 4)
    throw new Error("prosCons takes 3 or 4 pros and 3 or 4 cons");
  /* o.bg is the card color mkpage passes to html(bg), as story() takes it. */
  const box = o.bg === "ivory" ? "ivory" : "ivory-2";
  const item = (mark) => (x) => {
    const t = typeof x === "string" ? x : x.text, act = typeof x === "string" ? "" : x.act;
    return `<li>${mark}<span>${t}${act ? ` <span class="c3-pc-do">${act}</span>` : ""}</span></li>`;
  };
  /* The headings carry no mark, so they do not look like the first item (v14b review). */
  const col = (title, mark, top, list) => `<div style="background:var(--${box});border-top:3px solid ${top}"><h3>${title}</h3><ul>${list.map(item(mark)).join("")}</ul></div>`;
  return PC_CSS + `<div class="c3-pc">${col("Pros", PC_YES, "var(--brass)", pros)}${col("Cons", PC_NO, "var(--muted)", cons)}</div>`;
}

/* ---------------------------------------------------------------------------- */
/* Maps                                                                           */

/*
 * The figure under a map: the words must say "map" (STANDARD P8), then the data credit.
 * Returns h.figure(html, words + credit).
 */
function mapFigure(h, html, words, credit, who = "") {
  if (!/\bmap\b/i.test(words || "")) throw new Error(`${who ? who + ": " : ""}a map caption must say "map": ${words}`);
  return h.figure(html, `${words} ${credit || CREDIT2}`);
}

/*
 * The two drawn maps and the Google Maps link for one community, from the batch's places.
 *   picks: [{ id, name, short, kind, map? }]. id is a landmark id in places; the minutes come
 *          from that community's drives (verified ledger rows only).
 *   o.label         a shorter name for the map pin.
 *   o.amenity       the name the page uses for the amenity pin on the close-up ("Clubhouse").
 *   o.regionCaption the words under the "where it is" map; it must say "map".
 *   o.closeCaption  the words under the close-up.
 * Returns { region, close, links, where, pair, files }.
 */
function makeMaps(ctx) {
  const { h, places, mapDir, mapSrc } = ctx;
  return function maps(slug, picks, o = {}) {
    if (!places) throw new Error("page-kit: maps() needs the batch's places (create({ places }))");
    const c = places.communities.find((x) => x.slug === slug);
    if (!c) throw new Error(`no places.json entry for ${slug}`);
    const L = Object.fromEntries(places.landmarks.map((l) => [l.id, l]));
    const mins = Object.fromEntries(c.drives.map((d) => [d.to_id, d.minutes]));
    const landmarks = picks.map((p) => {
      if (!L[p.id] || mins[p.id] === undefined) throw new Error(`${slug}: no landmark or drive for ${p.id}`);
      const lm = { name: p.name, short: p.short, kind: p.kind, lat: L[p.id].lat, lon: L[p.id].lon, minutes: mins[p.id] };
      if (p.map) lm.map = p.map;
      return lm;
    });
    const spec = { home: { name: c.name, lat: c.lat, lon: c.lon, town: c.town, area: slug }, landmarks };
    if (o.label) spec.home.label = o.label;
    if (o.amenity) spec.amenity = o.amenity;
    const m = communityMaps(spec, { dir: mapDir, src: mapSrc });
    const region = mapFigure(h, m.region.html, o.regionCaption, m.region.credit, slug);
    const close = mapFigure(h, m.close.html, o.closeCaption, m.close.credit, slug);
    /* mapLinksHtml draws the two Google Maps links with the site's .btn classes. The website
       audit allows a .btn only to /contact/, tel:, a tool page or a form anchor (owner,
       2026-08-25: "the CTAs are trying to get conversions"), so the same two links are shown
       here as text links with a map pin. Same hrefs, same words. */
    const hrefs = [...m.links.matchAll(/href="([^"]+)"/g)].map((x) => x[1]);
    if (hrefs.length !== 2 || !hrefs.every((u) => /^https:\/\/www\.google\.com\/maps\//.test(u))) throw new Error(`${slug}: mapLinksHtml output not understood`);
    const A = 'style="color:var(--navy);text-decoration:underline;text-underline-offset:3px" target="_blank" rel="noopener noreferrer"';
    const links = `<p class="c3-map-links" style="display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.5rem;margin:.6rem 0 1.6rem;max-width:760px;font-size:.95rem">`
      + `<span style="display:inline-flex;align-items:center;gap:.4rem"><span style="color:var(--brass-ink);display:inline-flex">${icon("pin", { size: 20 })}</span><a href="${hrefs[0]}" ${A}>Open ${c.name} in Google Maps</a></span>`
      + `<a href="${hrefs[1]}" ${A}>Get directions</a></p>`;
    /* Version 10 (owner's eye, 2026-10-11): the "where it is" map and one link only. The close-up
       street map is dropped (the aerial shows the same place, and road names mean nothing to a
       buyer from out of state); "Get directions" is dropped (it opens the same place). */
    const one = `<p class="c3-map-links" style="display:flex;align-items:center;gap:.4rem;margin:.6rem 0 1.6rem;max-width:760px;font-size:.95rem">`
      + `<span style="color:var(--brass-ink);display:inline-flex">${icon("pin", { size: 20 })}</span><a href="${hrefs[0]}" ${A}>Open ${c.name} in Google Maps</a></p>`;
    return {
      region, close, links,
      where: region + one,
      /* Both maps side by side from 900 px wide ("where it is" left, "inside" right), stacked
         on a phone, with the Google Maps buttons under them. */
      pair: `<div class="c3-maps">${region}${close}</div>${links}`,
      files: [m.region.file, m.close.file].filter(Boolean),
    };
  };
}

/*
 * A map of many places (2 to 15 neighborhoods or towns) with its caption, and the numbered key
 * under it when a name had no room on the map (area-map.js regionMap with spec.places).
 *   name    the map's name, for its id and file ("Neighborhoods").
 *   places  [{ name, lat, lon, href?, short? }], in order of importance; points from the
 *           batch's verified data.
 *   o.caption  the words under the map; it must say "map".
 *   o.key      true shows the key even when every name is on the map.
 *   o.leaders  names with a leader line where they have no room by their spot (area-map.js
 *              spec.leaders): { places: true, towns: ["Myrtle Beach"] }.
 *   o.areas    named areas drawn as circles or outlines with their names in pills (area-map.js
 *              spec.areas, batch 2026-10-b); places may then be [] for a map of areas alone.
 *   o.areaLabels  "numbers": every area numbered, its name in result.map.areaKey.
 *   o.glass    the names in glass pills; on by default when the kit was made with theme "glass".
 * Returns { html, map }: the figure (and key), and the regionMap result.
 */
function makePlacesMap(ctx) {
  const { h, mapDir, mapSrc } = ctx;
  return function placesMap(name, places, o = {}) {
    /* The new options go in only when set, so a map without them is drawn exactly as before. */
    const spec = { name, places, leaders: o.leaders }, opts = { dir: mapDir, src: mapSrc };
    if (o.areas !== undefined) spec.areas = o.areas;
    if (o.areaLabels !== undefined) spec.areaLabels = o.areaLabels;
    if (o.glass === undefined ? ctx.theme === "glass" : o.glass) opts.glass = true;
    const m = regionMap(spec, opts);
    const fig = mapFigure(h, m.html, o.caption, m.credit, name);
    return { html: fig + (o.key || m.unlabelled.length ? m.key : "") + (m.areaKey || ""), map: m };
  };
}

/* ---------------------------------------------------------------------------- */
/* Photos and drawings                                                            */

/*
 * One photo set per page. Every call records the photos it shows, so credits() lists
 * exactly the photos on the page, in the order a reader meets them.
 *   ph.css()                 photoCss() and the few kit rules below, once per page.
 *   ph.hero(name, opts)      heroPhoto. opts: alt, caption.
 *   ph.aerial(name, caption, opts)  an aerial or photo shown whole (see below).
 *   ph.gallery(items, opts)  gallery of 2 or 3: [{ name, alt, caption }].
 *   ph.cards(items, opts)    featureCards: [{ illustration | name, label, text, alt }].
 *   ph.credits()             creditsList of every photo shown, then the JSON-LD for them: one
 *                            schema.org ImageObject per photo, with the visible caption, the alt
 *                            text, the creator, credit, copyright notice, license and source page
 *                            (photos.js imageSchema; rules/image-metadata.md). Google and Bing read
 *                            JSON-LD anywhere in the page, so it sits at the end of <main>.
 *   ph.pageImages()          the hero's 1x1, 4x3 and 16x9 crops as ImageObjects, for the spec's
 *                            pageImages field: mkpage puts them in Article.image and the 4x3 in
 *                            WebPage.primaryImageOfPage (website patch mkpage-page-images.patch).
 *                            Each spec sets  pageImages: () => ph.pageImages().
 */
const KIT_CSS = "<style>"
  /* Cards are ivory; on an ivory section they take the second ivory, as h.cta does. */
  + "section[style*=\"background:var(--ivory)\"] .c3ph-card{background:var(--ivory-2)}"
  + ".c3ph-cards{max-width:920px}"
  + ".c3ph-card strong{font-family:var(--sans)}"
  /* Card and icon-row text at 16 px, labels at 14 px or more (grader, 2026-10-11: 13 to 14 px
     card text was too small for a reader of 62 on a phone). */
  + ".c3ph-card span.c3ph-t{font-size:1rem!important}.c3ph-card strong{font-size:1rem!important}"
  + "ul[role=list] li span[style*=\"font-size:.9rem\"]{font-size:1rem!important}"
  /* The hero photo continues the short answer: one band, the photo under the answer. */
  + "section#c3-photo{padding-top:0}"
  + "section:has(+section#c3-photo){background:var(--ivory-2)!important;padding-bottom:2rem}"
  + ".c3ph-hero{margin:0}"
  /* An aerial is shown whole: its own shape, no crop (ph.aerial). */
  + ".c3-aerial .c3ph-hero{max-width:900px;margin:1.4rem 0 1.6rem}.c3-aerial .c3ph-hero img{aspect-ratio:auto!important;height:auto}"
  + ".c3-aerial-close .c3ph-hero{max-width:640px}"
  /* o.creditTop: the photo credit sits in the top corner when a label lies under the bottom one. */
  + ".c3-aerial-ctop .c3ph-cr{top:0;bottom:auto;padding:.35rem .6rem 1.6rem 2.6rem;background:radial-gradient(farthest-side at 100% 0%,rgba(28,32,40,.72),rgba(28,32,40,.4) 55%,rgba(28,32,40,0))}"
  /* A last card alone in its row on a phone takes the whole row, so no empty space sits beside it. */
  + "@media (max-width:699px){.c3ph-cards>:last-child:nth-child(odd){grid-column:1/-1}}"
  /* The two maps side by side on a wide screen. */
  + ".c3-maps{display:grid;gap:0 1.5rem;max-width:1136px}"
  + "@media (min-width:900px){.c3-maps{grid-template-columns:1fr 1fr;align-items:start}}"
  + ".c3-maps figure{max-width:none!important;margin:1.4rem 0 .4rem!important}"
  + ".c3-maps svg,.c3-maps img{display:block;width:100%;height:auto}"
  /* The two Google Maps links are 44 px rows on a phone (they were 26 px). */
  + ".c3-map-links{row-gap:0!important}.c3-map-links a{padding:.55rem 0}"
  /* An atAGlance row with a 13rem minimum stays inside the column at the largest text
     setting (at 200% text, 13rem is wider than a phone). */
  + "ul[role=list][style*=\"minmax(13rem,1fr)\"]{grid-template-columns:repeat(auto-fill,minmax(min(13rem,100%),1fr))!important}"
  + "</style>";

function makePhotoSet(ctx) {
  const { photos } = ctx, notUsed = ctx.notUsed || [];
  /* o.aerialWidth (say "760px"): every aerial and photo placed with ph.aerial shows at this one
     width on a wide screen, close views too (the v13c review: two widths on one page looked uneven). */
  return function photoSet(o = {}) {
    if (!photos) throw new Error("page-kit: photoSet() needs the batch's photo records (create({ photos }))");
    if (o.aerialWidth && !/^[0-9]+px$/.test(o.aerialWidth)) throw new Error("photoSet aerialWidth must be like 760px");
    const used = [];
    let heroRec = null, shareRec = null;
    const rec = (name) => {
      if (notUsed.includes(String(name).replace(/\.webp$/, ""))) throw new Error(`photo ${name} is not used in this batch (see NOT_USED)`);
      const r = P.findPhoto(photos, name);
      if (!used.includes(r)) used.push(r);
      return r;
    };
    let cssDone = false;
    return {
      rec,
      css() {
        if (cssDone) throw new Error("photo CSS emitted twice on one page");
        cssDone = true;
        return P.photoCss() + KIT_CSS + (o.aerialWidth ? `<style>.c3-aerial .c3ph-hero,.c3-aerial-close .c3ph-hero{max-width:${o.aerialWidth}}</style>` : "");
      },
      hero(name, o = {}) {
        if (heroRec) throw new Error("one hero photo per page");
        heroRec = rec(name);
        return P.heroPhoto(heroRec, { alt: o.alt, caption: o.caption, css: false, maxWidth: o.maxWidth });
      },
      /* An aerial photo of the neighborhood itself (USDA NAIP 2023, public domain, with
         Chapter3's outline and labels; commit 73f9819). Owner, 2026-10-11 (RULES P10): the
         photo shows what its section is about, so the overview sits near the top of the "where"
         section and a clubhouse close-up beside the clubhouse sentence. Shown whole (no crop to
         4:3 or 16:9, so the drawn outline and labels stay in view) and loaded lazily. The
         overview, which has crops, becomes the page's share image and Article.image; a close-up
         (o.closeUp) is not marked representative of the page. */
      aerial(name, caption, o = {}) {
        const r = rec(name);
        if (!o.closeUp && r.crops && !heroRec) heroRec = r;
        let html = P.heroPhoto(r, { alt: o.alt || r.alt, caption, css: false });
        if (o.closeUp) { const seen = P.SHOWN.get(r); if (seen) seen.hero = false; }
        html = html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
        return `<div class="c3-aerial${o.closeUp ? " c3-aerial-close" : ""}${o.creditTop ? " c3-aerial-ctop" : ""}">${html}</div>`;
      },
      gallery(items, o = {}) {
        return P.gallery(items.map((it) => ({ photo: rec(it.name), alt: it.alt, caption: it.caption })), { css: false, label: o.label, ratio: o.ratio });
      },
      cards(items, o = {}) {
        return P.featureCards(items.map((it) => it.name ? { photo: rec(it.name), alt: it.alt, label: it.label, text: it.text } : it), { css: false, cols: o.cols, ratio: o.ratio });
      },
      /* The photo the page shares (og:image) and puts in Article.image: the aerial when it has
         crops, else the named photo, which must also be shown on the page (credits() checks). */
      share(name) { shareRec = P.findPhoto(photos, name); return this; },
      credits() {
        if (!used.length) throw new Error("no photos shown, so no credits");
        /* A page that shows photos without their stylesheet passed every gate once: the gated page
           of batch 2026-10-b showed two aerials at 1,200 px past the column, with a bare blue credit
           link (lessons-2026-10-b B22). credits() comes last on every page, so it checks. */
        if (!cssDone) throw new Error("photo CSS missing: put ph.css() in the page's CSS before ph.credits()");
        if (shareRec && !used.includes(shareRec)) throw new Error("the share photo is not shown on the page");
        /* The year of a government aerial goes in its credit line, the one place a photo's date
           appears (owner, 2026-10-11: the date once at the top; photo years only in the credits). */
        let html = P.creditsList(used, { css: false });
        for (const r of used) if (/^USDA Farm Service Agency, NAIP$/.test(r.author || "") && r.taken) {
          /* Plain words for a buyer (owner's eye, v10: nobody knows "NAIP"). */
          html = html.split("Photo: USDA Farm Service Agency, NAIP, ").join(`U.S. government aerial photo, ${String(r.taken).slice(0, 4)}, by the USDA Farm Service Agency, `)
            .split("from the NAIP export").join("from the aerial photo");
          break;
        }
        return html + P.imageSchema(used);
      },
      pageImages() {
        const r = (heroRec && heroRec.crops) ? heroRec : shareRec;
        return r ? P.pageImages(r) : undefined;
      },
      used: () => used.slice(),
    };
  };
}

/* ---------------------------------------------------------------------------- */

/* The kit for one batch. ctx: { h, places?, photos?, notUsed?, mapDir?, mapSrc?, theme? }. theme "glass"
   (batch 2026-10-b) puts map names in glass pills; the page itself switches the theme on with
   glass.page(spec) (tools/glass.js), which the kit also carries as kit.glass. */
function create(ctx = {}) {
  if (!ctx.h || typeof ctx.h.figure !== "function") throw new Error("page-kit: create() needs the website's mkpage helpers: create({ h })");
  if (ctx.theme !== undefined && !["glass", "plain"].includes(ctx.theme)) throw new Error(`page-kit: no theme named "${ctx.theme}"`);
  return { h: ctx.h, maps: makeMaps(ctx), placesMap: makePlacesMap(ctx), photoSet: makePhotoSet(ctx), story, glance, prosCons, atAGlance, icon, CREDIT2, glass,
    mapFigure: (html, words, credit) => mapFigure(ctx.h, html, words, credit) };
}

module.exports = { create, story, glance, prosCons, mapFigure, KIT_CSS, atAGlance, icon, CREDIT2, glass };
