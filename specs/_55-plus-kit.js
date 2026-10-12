/* Shared visuals for the four 55+ community specs, batch 2026-10-a (final build,
 * 2026-10-10). Each spec requires this file for its maps, photos, drawings, icon
 * rows and the comparison table. No sentence of page copy lives here: every word a
 * reader sees is written in the spec, so no sentence repeats across the four pages.
 *
 * Data, one source each (all in ../data/):
 *   places.json                map points and drive minutes. A drive is used only when
 *                              its ledger row is verified (each spec names the rows).
 *   photos.json                licensed area photos, with the record each credit needs.
 *   55-plus-communities.json   the comparison table.
 * Tools (Blog-Brain):
 *   tools/area-map.js      communityMaps: a "where it is" region map and an "inside the
 *                          neighborhood" close-up, both drawn, plus mapLinksHtml buttons.
 *                          The old liveMapHtml (a Google embed) is not used: the keyless
 *                          embed is refused in a frame.
 *   tools/photos.js        heroPhoto, gallery, featureCards, creditsList, photoCss.
 *   tools/illustrations.js the drawings inside featureCards.
 *   tools/icons.js         atAGlance, for quick answers that have no drawing.
 * The spec runs from the website working copy (specs/). The batch copy in Blog-Brain
 * (batches/2026-10-a/specs/) is the record; it builds only from the website.
 */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

/* Where the Blog-Brain tools are: the copy an upload package puts in the website's
   tools/blog-brain/ (tools/package-batch.js), then $BLOG_BRAIN, then the Blog-Brain repo. */
const BB = [path.join(__dirname, "..", "tools", "blog-brain"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "area-map.js")) && fs.existsSync(path.join(d, "tools", "photos.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/area-map.js, tools/photos.js)");
const { communityMaps, CREDIT2 } = require(path.join(BB, "tools", "area-map.js"));
const { atAGlance, icon } = require(path.join(BB, "tools", "icons.js"));
const P = require(path.join(BB, "tools", "photos.js"));

const PLACES = require("../data/places.json");
const PHOTOS = require("../data/photos.json").photos;
const COMPARE = require("../data/55-plus-communities.json");

/* Where a map file goes when it is too big to sit inline (over 60 KB). */
const MAP_DIR = path.join(__dirname, "..", "chapter3realty", "images", "maps");
const MAP_SRC = "/images/maps";

/* Photos this rule set refuses for this batch (2026-10-10): the uploader is not the author,
   or the subject is a brand sign. photos.js already refuses a record with a "hold" note. */
const NOT_USED = ["alabama-theatre-barefoot-landing", "broadway-at-the-beach-night", "huntington-beach-state-park-sunset",
  "north-myrtle-beach-dunes-sunrise", "marsh-houses-murrells-inlet"];

/* ---------------------------------------------------------------------------- */
/* Maps                                                                           */

/*
 * The two drawn maps and the Google Maps buttons for one community.
 *   picks: [{ id, name, short, kind, map? }]. id is a landmark id in places.json; the
 *          minutes come from that community's drives (verified ledger rows only).
 *   o.label         a shorter name for the map pin.
 *   o.amenity       the name the page uses for the amenity pin on the close-up ("Clubhouse").
 *   o.regionCaption the words under the "where it is" map; it must say "map".
 *   o.closeCaption  the words under the close-up.
 * Returns { region, close, links }: two h.figure blocks and the button row.
 */
function maps(slug, picks, o = {}) {
  const c = PLACES.communities.find((x) => x.slug === slug);
  if (!c) throw new Error(`no places.json entry for ${slug}`);
  const L = Object.fromEntries(PLACES.landmarks.map((l) => [l.id, l]));
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
  const m = communityMaps(spec, { dir: MAP_DIR, src: MAP_SRC });
  const cap = (words, credit) => {
    if (!/\bmap\b/i.test(words)) throw new Error(`${slug}: a map caption must say "map": ${words}`);
    return `${words} ${credit || CREDIT2}`;
  };
  const region = h.figure(m.region.html, cap(o.regionCaption, m.region.credit));
  const close = h.figure(m.close.html, cap(o.closeCaption, m.close.credit));
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
}

/* ---------------------------------------------------------------------------- */
/* The example story                                                              */

/*
 * The labelled example in a card, then the one plain sentence on what it means and the offer,
 * outside the card (voice/STORY-CRAFT.md, STANDARD T2, owner 2026-10-11). paras: the story's
 * paragraphs. The first opens with the bold "Example:" label, and a Chapter3 agent acts in the
 * story: the example shows how an agent works, in the present tense, so no sentence claims a
 * past client. (STORY-CRAFT's model opener "Here is how a Chapter3 agent handles it" fails the
 * website's build audit, which bans "here is how" teasers and "But"/"So" openers; the website's
 * rules win, so the agent enters the story by name instead.) bg: the card fill, the opposite of the section (as h.cta). offer: optional
 * plain line after the meaning.
 */
function story(paras, meaning, bg, offer) {
  if (!/^<strong>Example:<\/strong> /.test(paras[0] || "")) throw new Error("a story opens with <strong>Example:</strong>");
  const text = paras.join(" ").replace(/<[^>]+>/g, "");
  if (!/\bChapter3 agent\b/.test(text)) throw new Error("a Chapter3 agent acts in the example (owner, 2026-10-11)");
  if (/(?:^|[.!?]\s+)(?:And|So|But|Or|Yet)\b/.test(text.replace(/^Example:\s*/, ""))) throw new Error("no And, So, But, Or or Yet sentence openers (website build.js)");
  if (/\b(?:our clients?|we helped|Chapter ?3 (?:found|helped)|clients?)\b/i.test(text)) throw new Error("an example never says the people are clients");
  /* Present tense only: an agent who "helped", "found" or "got" reads as a real past client. */
  if (/\bagent (?:helped|found|got|read|checked|showed|saw|walked|told|knew|made|gave)\b/i.test(text)) throw new Error("the agent acts in the present tense inside an example");
  const n = text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  /* The simple story test (voice/STORY-SIMPLE.md, STANDARD T8), from the shared tool so every batch runs
     the same check: in Blog-Brain it is tools/story-check.js; in the website copy, the upload package puts
     it beside the specs as _story-check.js. */
  let storyCheck;
  try { storyCheck = require("../../../tools/story-check.js"); } catch (e) { storyCheck = require("./_story-check.js"); }
  const problems = storyCheck.check(text);
  if (problems.length) throw new Error(`the story fails the simple story test: ${problems.join("; ")}`);
  /* Only people act; no figure of speech (RULES 1 and 2; owner's eye, 2026-10-11). */
  if (/\b(?:rules?|law|plan|map|quote) (?:allows?|says?|lets?|makes?|requires?)\b|in front of them/i.test(text)) throw new Error("a rule or paper acts, or a figure of speech inside the example");
  const P = 'style="color:var(--muted);line-height:1.75;max-width:640px;margin:0 0 .9rem"';
  return `<div class="c3-story" style="background:var(--${bg === "ivory" ? "ivory" : "ivory-2"});border-top:3px solid var(--brass);padding:1.5rem 1.5rem .7rem;margin:1.4rem 0 1.4rem;max-width:720px">`
    + paras.map((t) => `<p ${P}>${t}</p>`).join("") + `</div>`
    /* The lesson is set at the reading size, like the line after it (it was 17px beside a
       19.5px offer line on a desktop, 2026-10-11). */
    /* meaning may be empty: on the version 11 pages the offer box under the story says it. */
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
/* Photos and drawings                                                            */

/*
 * One photo set per page. Every call records the photos it shows, so credits() lists
 * exactly the photos on the page, in the order a reader meets them.
 *   ph.css()                 photoCss() and the few kit rules below, once per page.
 *   ph.hero(name, opts)      heroPhoto. opts: alt, caption.
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
  /* An aerial is shown whole: its own shape, no crop (kit ph.aerial). */
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

/* o.aerialWidth (say "760px"): every aerial and photo placed with ph.aerial shows at this one
   width on a wide screen, close views too (the v13c review: two widths on one page looked uneven). */
function photoSet(o = {}) {
  if (o.aerialWidth && !/^[0-9]+px$/.test(o.aerialWidth)) throw new Error("photoSet aerialWidth must be like 760px");
  const used = [];
  let heroRec = null, shareRec = null;
  const rec = (name) => {
    if (NOT_USED.includes(String(name).replace(/\.webp$/, ""))) throw new Error(`photo ${name} is not used in this batch (see NOT_USED)`);
    const r = P.findPhoto(PHOTOS, name);
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
    share(name) { shareRec = P.findPhoto(PHOTOS, name); return this; },
    credits() {
      if (!used.length) throw new Error("no photos shown, so no credits");
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
}

/* ---------------------------------------------------------------------------- */
/* The comparison table                                                           */

/* The four communities, each linked except this page. A real <table> (STANDARD A6), with
   the site's table styles. Under 600 px wide each row becomes a card: the community's name
   on top, then its other facts, each with its column name in front, so a 360 px phone sees
   the price column (review 3). */
const TH = 'style="padding:.55rem .8rem;border-bottom:2px solid var(--navy);color:var(--navy);text-align:left;font-family:var(--sans);font-size:.8rem;letter-spacing:.04em;text-transform:uppercase"';
const TD = 'style="padding:.55rem .8rem;border-bottom:1px solid var(--rule);color:var(--muted)"';
const CMP_CSS = "<style>.c3-cmp tr.c3-self td{background:#fff;font-weight:600;color:var(--navy)!important}"
  + "@media (max-width:599px){.c3-cmp tr.c3-self{background:#fff;border:2px solid var(--brass)}.c3-cmp tr.c3-self td{background:transparent}}"
  + "@media (max-width:599px){"
  + ".c3-cmp table,.c3-cmp tbody,.c3-cmp tr,.c3-cmp td{display:block;width:100%}"
  + ".c3-cmp thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"
  + ".c3-cmp tr{background:var(--ivory-2);border-top:3px solid var(--brass);margin:0 0 .75rem;padding:.4rem 0}"
  + ".c3-cmp td{border:0!important;padding:.25rem .9rem!important}"
  + ".c3-cmp td:first-child{color:var(--navy)!important;font-weight:500;font-size:1rem}"
  + ".c3-cmp td[data-label]:not(:first-child)::before{content:attr(data-label) \": \";color:var(--navy)}"
  /* The name links on the cards: a 44 px tap area that does not move the line (was 22 px). */
  + ".c3-cmp td a{padding:11px 0}"
  + "}</style>";
const compareTable = (self) => {
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const rows = COMPARE.rows.map((r) => {
    const cells = [r.url === self ? `<strong style="color:var(--navy);font-weight:700">${r.cells[0]}</strong>` : h.a(r.url, r.cells[0]), ...r.cells.slice(1)];
    /* This page's own row stands out: bold, shaded, with a brass frame on a phone card. */
    return `<tr${r.url === self ? ' class="c3-self"' : ""}>${cells.map((c, i) => `<td data-label="${esc(COMPARE.head[i])}" ${TD}>${c}</td>`).join("")}</tr>`;
  }).join("");
  return `${CMP_CSS}<div class="c3-cmp" style="overflow-x:auto;margin:1.2rem 0;max-width:760px"><table style="width:100%;border-collapse:collapse;font-size:.92rem"><thead><tr>${COMPARE.head.map((c) => `<th ${TH}>${c}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
};

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

module.exports = { h, maps, story, glance, photoSet, compareTable, atAGlance, icon, CREDIT2, prosCons };
