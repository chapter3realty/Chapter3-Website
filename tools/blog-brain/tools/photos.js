#!/usr/bin/env node
/*
 * photos.js: photos on a page, done one way everywhere. A wide photo at the top, a
 * row of two or three, small picture cards for features, and the credits at the end.
 *
 * Usage, in a spec or a tool:
 *
 *   const P = require("<blog-brain>/tools/photos.js");
 *   const photos = require("<batch>/data/photos.json").photos;
 *   const rec = (name) => P.findPhoto(photos, name);           // by file name, with or without .webp
 *
 *   P.heroPhoto(rec("conway-riverwalk"), { alt: "The riverwalk on the Waccamaw River in Conway" })
 *   P.gallery([
 *     { photo: rec("conway-main-street"), alt: "Old brick shops on Main Street in Conway", caption: "Main Street, downtown Conway" },
 *     { photo: rec("conway-city-hall"),   alt: "Conway City Hall, a white building with a clock", caption: "City Hall" },
 *   ])                                                          // a phone shows one photo under the other
 *   P.gallery([...], { layout: "row" })                         // a swipe row, with "Swipe for more photos" and dots
 *   P.featureCards([
 *     { illustration: "indoor-pool", label: "Indoor pool", text: "Open all year" },
 *     { photo: rec("murrells-inlet-boats"), alt: "Fishing boats at a marina", label: "Boating", text: "A marina about 10 minutes away" },
 *   ])
 *   P.creditsList([rec("conway-riverwalk"), rec("conway-main-street"), rec("conway-city-hall")])
 *
 *   P.imageSchema([rec("conway-riverwalk"), rec("conway-main-street")])   // JSON-LD: one ImageObject per photo shown
 *   P.pageImages(rec("conway-riverwalk"))                     // Article.image: the hero's 1x1, 4x3 and 16x9 crops
 *   P.embedMetadata(rec("conway-riverwalk"), file)            // IPTC/XMP credit, license and alt text into the file
 *
 *   node tools/photos.js check <photos.json> [image root]     // every record passes the guard; files exist and
 *                                                             // (with exiftool) hold their metadata
 *   node tools/photos.js variants <source image> <out base>   // writes <out base>-600w.webp and -1200w.webp
 *   node tools/photos.js crops <source image> <out base>      // -1x1, -4x3 and -16x9.webp, 1200 px wide
 *   node tools/photos.js embed <photos.json> <image root> ... // writes the metadata into every file of every record
 *   node tools/photos.js meta <file>                          // prints what a file holds
 *
 * Metadata (rules/image-metadata.md, STANDARD S13; tools/image-meta.js checks a page):
 *   - In each file: Creator, Credit Line, Copyright Notice, Web Statement of Rights (license
 *     URL), Licensor URL, Description, Title, Alt Text (Accessibility), Digital Source Type,
 *     Location Shown, Date Created and Source, as XMP (and the old IPTC block in a JPG).
 *     ImageMagick strips it all, so variants and crops are embedded again after.
 *   - In the page: an ImageObject per photo, with the same fields, from the same record.
 *   - A record's "place" ({ city, sublocation }) names where the photo was taken; "crops"
 *     holds the hero's 1x1, 4x3 and 16x9 files for Article.image.
 *
 * What every image gets:
 *   - WebP, a 600w and a 1200w file in srcset, a sizes attribute, and width and height,
 *     so the page does not jump while it loads.
 *   - Alt text. It is required: a missing or one-word alt throws.
 *   - loading="lazy", except the hero, which gets fetchpriority="high" because it may be
 *     the largest thing the phone paints.
 *   - A credit: a tiny "Photo: <author>" on the photo itself, linked to the license, and
 *     the full line in creditsList.
 *
 * What the readers asked for (buyer reads v6, batch 2026-10-a, 62-year-olds on a phone):
 *   - Three of four missed photos in a sideways row: it was cut off and nothing said it
 *     swipes. So a gallery is a plain stack on a phone, one photo under the other, each
 *     with its caption. The swipe row is an option, and it says "Swipe for more photos".
 *   - The credits "read like file names" ("Prices Swamp Run", "(13 May 2023) 11", "Jun 10").
 *     So a credit names the photo by what it shows (the caption it was shown with, else
 *     the record's caption or alt), never by its Commons file title, and carries no date.
 *
 * The guard (checkRecord) throws before any markup is made when a record has:
 *   - no source, author, license or credit line, or (for a licensed photo) no license URL;
 *   - a license other than CC0, public domain, CC BY, CC BY-SA, "own" (Chapter3's own
 *     photo) or "illustration" (a drawing Chapter3 made); NC, ND and "all rights reserved"
 *     are refused;
 *   - a license URL that does not match the license (a CC BY-SA photo must link the BY-SA deed);
 *   - a "hold" note (a photo we found a problem with; the note says what).
 * See rules/images.md for the rules in plain words.
 *
 * Markup: plain HTML strings. Every text is escaped. The few rules that need a media query
 * sit in one small <style> block per call (opts.css: false leaves it out; photoCss()
 * returns all of it once). Class names start with c3ph-. Colors and fonts are the site's
 * CSS variables. No script.
 */
"use strict";

const path = require("path");
const fs = require("fs");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

/* ---------------------------------------------------------------------------- */
/* The guard                                                                      */

/* Each allowed license: how its name reads, and what its URL must contain. */
const LICENSES = [
  { kind: "cc0", name: /^CC0(?: 1\.0)?$/i, url: /creativecommons\.org\/publicdomain\/zero\// },
  { kind: "pd", name: /^public domain$/i, url: /creativecommons\.org\/publicdomain\/mark\/|commons\.wikimedia\.org\/wiki\/Template:PD|\.gov\// },
  { kind: "by", name: /^CC BY (?:[1-4]\.0|2\.5)$/i, url: /creativecommons\.org\/licenses\/by\/[1-4]\.[05]\/?$/ },
  { kind: "by-sa", name: /^CC BY-SA (?:[1-4]\.0|2\.5)$/i, url: /creativecommons\.org\/licenses\/by-sa\/[1-4]\.[05]\/?$/ },
  { kind: "own", name: /^own$/i, url: null },
  { kind: "illustration", name: /^illustration$/i, url: null },
];
const ALLOWED = "CC0, Public domain, CC BY x.x, CC BY-SA x.x, own, illustration";

const label = (rec) => (rec && (rec.file || rec.title || rec.source)) || "(no file)";

function licenseOf(rec) {
  const name = String(rec.license || "").trim();
  return LICENSES.find((l) => l.name.test(name));
}

/*
 * Throws unless the record is a usable, licensed image. Returns the license kind
 * ("cc0", "pd", "by", "by-sa", "own" or "illustration").
 */
function checkRecord(rec) {
  if (!rec || typeof rec !== "object") throw new Error("photos.js: no image record (pass a photos.json entry)");
  const who = label(rec);
  if (rec.hold) throw new Error(`photos.js: ${who} is on hold and may not be used: ${rec.hold}`);
  const source = rec.source || rec.commons_page;
  const missing = [["source", source], ["author", rec.author], ["license", rec.license], ["credit", rec.credit]].filter(([, v]) => !String(v || "").trim()).map(([k]) => k);
  if (missing.length) throw new Error(`photos.js: ${who} has no license record (${missing.join(", ")} missing)`);
  const lic = licenseOf(rec);
  if (!lic) throw new Error(`photos.js: ${who} has license "${rec.license}". Allowed: ${ALLOWED}. Never NC, ND or all rights reserved.`);
  if (lic.url) {
    if (!String(rec.license_url || "").trim()) throw new Error(`photos.js: ${who} has no license URL (license_url)`);
    if (!lic.url.test(rec.license_url)) throw new Error(`photos.js: ${who} license URL ${rec.license_url} does not match "${rec.license}"`);
    const v = (String(rec.license).match(/(\d\.\d)/) || [])[1];
    if (v && !rec.license_url.includes(`/${v}`)) throw new Error(`photos.js: ${who} license URL ${rec.license_url} is not version ${v}`);
    if (!/^https:\/\//.test(source)) throw new Error(`photos.js: ${who} source must be the https page the photo came from`);
  }
  return lic.kind;
}

/* Finds a record by its file name (with or without .webp and a -600w/-1200w ending). */
function findPhoto(list, name) {
  const want = String(name).replace(/\.webp$/, "").replace(/-(?:600|1200)w$/, "");
  const hit = (list || []).find((r) => path.basename(String(r.file || ""), ".webp") === want);
  if (!hit) throw new Error(`photos.js: no photo named ${name}`);
  return hit;
}

/* ---------------------------------------------------------------------------- */
/* srcset                                                                         */

/* The two files and the size of the large one. Records hold variants: { "600": path, "1200": path }. */
function imageSet(rec, base = "/") {
  const v = rec.variants || {};
  if (!v["600"] || !v["1200"]) throw new Error(`photos.js: ${label(rec)} needs variants "600" and "1200" (run: node tools/photos.js variants)`);
  for (const k of ["600", "1200"]) if (!/\.webp$/i.test(v[k])) throw new Error(`photos.js: ${label(rec)} variant ${k} is not WebP`);
  const w = +rec.width, h = +rec.height;
  if (!(w > 0 && h > 0)) throw new Error(`photos.js: ${label(rec)} needs width and height (of the 1200w file)`);
  const url = (p) => base.replace(/\/?$/, "/") + String(p).replace(/^\//, "");
  return { src: url(v["1200"]), srcset: `${url(v["600"])} 600w, ${url(v["1200"])} 1200w`, width: w, height: h };
}

/* Alt text: required, plain, three words or more. */
function altFor(item, rec) {
  const alt = String((item && item.alt) || (rec && rec.alt) || "").trim();
  if (!alt) throw new Error(`photos.js: ${label(rec)} has no alt text. Say what the photo shows.`);
  if (words(alt) < 3) throw new Error(`photos.js: alt text "${alt}" is too short. Say what the photo shows, in a few words.`);
  if (/^(?:image|photo|picture) of\b/i.test(alt)) throw new Error(`photos.js: alt text "${alt}" starts with "${alt.split(" ").slice(0, 2).join(" ")}". Say what it shows.`);
  return alt;
}

function img(rec, alt, o) {
  const s = imageSet(rec, o.base);
  const load = o.hero ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"';
  return `<img src="${esc(s.src)}" srcset="${esc(s.srcset)}" sizes="${esc(o.sizes)}" width="${s.width}" height="${s.height}" alt="${esc(alt)}"${load}${o.cls ? ` class="${o.cls}"` : ""}>`;
}

/* ---------------------------------------------------------------------------- */
/* Credits                                                                        */

const licText = (rec, kind) => (kind === "pd" ? "Public domain" : kind === "own" || kind === "illustration" ? "Chapter3 Realty" : String(rec.license).trim());
const srcName = (rec) => rec.source_name || (/wikimedia\.org/.test(rec.source || rec.commons_page || "") ? "Wikimedia Commons" : "");

/* The author as the photo itself shows it: no "(English Wikipedia)" or "(Flickr: x)" tail.
   The full name is in creditsList. */
const shortAuthor = (a) => String(a).replace(/\s*\([^)]*\)/g, "").trim() || String(a).trim();

const EXT = 'target="_blank" rel="noopener noreferrer"';

/* What Chapter3 did to a photo beyond resizing and cropping, from the record's "changes"
   (an aerial with an outline and labels drawn on it: "Chapter3 Realty drew the outline and
   the labels and adjusted the colors"). It is said in the credits row and in the file's
   Instructions field, in place of "Resized by Chapter3 Realty from the original". */
const changesOf = (rec) => String((rec && rec.changes) || "").trim().replace(/\.$/, "");

/* The short credit on the photo: "Photo: Author", nothing else, and the words link to the
   license. The license name, the source and the note of changes are in creditsList. */
function overlay(rec, kind) {
  if (kind === "illustration") return `<span class="c3ph-cr">Drawing: Chapter3 Realty</span>`;
  /* A record may set display_credit, the short words shown on the photo itself ("U.S. government
     aerial photo"); the credits list and the embedded metadata keep the full author. */
  const body = rec.display_credit ? esc(rec.display_credit) : `Photo: ${esc(shortAuthor(rec.author))}`;
  if (kind === "own" || !rec.license_url) return `<span class="c3ph-cr">${body}</span>`;
  const lic = esc(licText(rec, kind));
  return `<span class="c3ph-cr"><a href="${esc(rec.license_url)}" ${EXT} aria-label="${body}. License: ${lic}" title="License: ${lic}">${body}</a></span>`;
}

/* A date in plain words or numbers: "2018", "Jun 10", "13 May 2023", "late November".
   A credit never carries one (the readers took them for mistakes). */
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = new RegExp(`\\b(?:1[89]|20)\\d\\d\\b|\\b${MONTH}\\.? \\d{1,2}\\b|\\b\\d{1,2} ${MONTH}\\b|\\b(?:early|mid|late|in) ${MONTH}\\b|\\b(?:Thanksgiving|Christmas|Easter)\\b`);
const hasDate = (s) => DATE.test(String(s));

/* The caption and alt each photo was last shown with on a page (heroPhoto, gallery,
   featureCards), so the credits can name it in the same words the reader saw, and the
   schema can repeat the visible caption (full) and the alt text. */
const SHOWN = new WeakMap();
const shown = (rec, caption, alt, extra = {}) => {
  const full = String(caption || "").trim();
  const first = full.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
  SHOWN.set(rec, Object.assign({ caption: first, full, alt }, extra));
};

/*
 * What the photo shows, in plain words, for the credits. The first of: the caption passed to
 * creditsList, the caption it was shown with on the page (a hero's first sentence), the
 * record's caption, the alt it was shown with, the record's alt, the record's "what". Never
 * the Commons file title. A trailing date clause (", in late November") is cut; a text that
 * still has a date, or that talks about "photos" rather than what is in one, is skipped.
 */
function whatItShows(rec, given) {
  const tidy = (s) => String(s || "").trim().replace(/\s+/g, " ").replace(new RegExp(`,? (?:in|on) (?:(?:early|mid|late) )?${MONTH}(?: \\d{4})?\\.?$`), "").replace(/[.\s]+$/, "");
  const seen = SHOWN.get(rec) || {};
  for (const t of [given, seen.caption, rec.caption, seen.alt, rec.alt, rec.what].map(tidy)) {
    if (!t || hasDate(t) || /\bphotos?\b/i.test(t)) continue;
    if (rec.title && t === String(rec.title).trim()) continue;
    return t;
  }
  throw new Error(`photos.js: ${label(rec)} needs a caption or alt with no date, to name it in the credits`);
}

/* ---------------------------------------------------------------------------- */
/* CSS                                                                            */

const CSS = {
  base: ".c3ph-f{position:relative;margin:0;border-radius:6px;overflow:hidden;background:var(--ivory-2)}"
    + ".c3ph-f img{display:block;width:100%;height:auto;object-fit:cover}"
    + ".c3ph-cr{position:absolute;right:0;bottom:0;max-width:100%;padding:1.6rem .6rem .35rem 2.6rem;font:400 .625rem/1.3 var(--sans);letter-spacing:.01em;color:#fff;text-align:right;"
    + "background:radial-gradient(farthest-side at 100% 100%,rgba(28,32,40,.72),rgba(28,32,40,.4) 55%,rgba(28,32,40,0));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}"
    /* The link's tap area is at least 24 px tall (WCAG 2.5.8) with no change to the overlay:
       vertical padding on an inline link does not move the line. Measured 14 px before. */
    + ".c3ph-cr a{color:#fff;text-decoration:underline;text-decoration-color:rgba(255,255,255,.5);text-underline-offset:2px;pointer-events:auto;padding:10px 0 6px}",
  hero: ".c3ph-hero{margin:1.6rem 0 2rem}"
    + ".c3ph-hero .c3ph-f{border-radius:8px}"
    + ".c3ph-hero img{aspect-ratio:4/3}"
    + "@media (min-width:700px){.c3ph-hero img{aspect-ratio:16/9}}"
    + ".c3ph-hero figcaption{color:var(--muted);font-size:.85rem;line-height:1.5;margin-top:.55rem}",
  /* A phone shows the photos one under the other, full width, each with its caption. From
     700 px they sit in a row of 2 or 3. */
  gallery: ".c3ph-gal{display:grid;grid-template-columns:minmax(0,1fr);gap:1.5rem;margin:1.6rem 0;padding:0;list-style:none}"
    + ".c3ph-gal>figure{margin:0;min-width:0}"
    + ".c3ph-gal img{aspect-ratio:var(--c3ph-r,4/3)}"
    + ".c3ph-gal figcaption{color:var(--muted);font-size:.85rem;line-height:1.45;margin-top:.5rem}"
    + "@media (min-width:700px){.c3ph-gal{display:grid;grid-template-columns:repeat(var(--c3ph-n,3),minmax(0,1fr));gap:1rem;overflow:visible;padding:0}.c3ph-gal>figure{min-width:0}}",
  /* layout "row": on a phone the row scrolls sideways and snaps, the next photo shows at the
     edge, and a line under it says "Swipe for more photos" beside one dot per photo. Where the
     browser can tie an animation to the scroll, the dot of the photo in view fills in; elsewhere
     the first dot is filled. From 700 px it is the same grid as the stack. */
  row: "@media (max-width:699px){.c3ph-gal.c3ph-row{display:flex;gap:.75rem;padding:0 var(--c3ph-bleed,1.4rem) .4rem;margin:1.6rem calc(-1*var(--c3ph-bleed,1.4rem)) 0;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--c3ph-bleed,1.4rem);-webkit-overflow-scrolling:touch;scrollbar-width:none}"
    + ".c3ph-row::-webkit-scrollbar{display:none}.c3ph-row>figure{flex:0 0 82%;scroll-snap-align:start}}"
    + ".c3ph-swipe{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.6rem;color:var(--navy);font:500 .95rem/1.3 var(--sans)}"
    + ".c3ph-dots{display:inline-flex;gap:.45rem}.c3ph-dots i{display:block;width:10px;height:10px;border-radius:50%;border:1.5px solid var(--navy);box-sizing:border-box}"
    + ".c3ph-dots i:first-child{background:var(--navy)}"
    + "@supports (animation-timeline:view()){.c3ph-rowbox{timeline-scope:--c3ph-p1,--c3ph-p2,--c3ph-p3}"
    + ".c3ph-row>figure:nth-child(1){view-timeline:--c3ph-p1 inline}.c3ph-row>figure:nth-child(2){view-timeline:--c3ph-p2 inline}.c3ph-row>figure:nth-child(3){view-timeline:--c3ph-p3 inline}"
    + ".c3ph-dots i{animation:c3ph-dot linear both;animation-range:cover}.c3ph-dots i:nth-child(1){animation-timeline:--c3ph-p1}.c3ph-dots i:nth-child(2){animation-timeline:--c3ph-p2}.c3ph-dots i:nth-child(3){animation-timeline:--c3ph-p3}"
    + "@keyframes c3ph-dot{0%,36%{background:transparent}42%,60%{background:var(--navy)}66%,100%{background:transparent}}}"
    + "@media (min-width:700px){.c3ph-swipe{display:none}}",
  cards: ".c3ph-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin:1.4rem 0 1.8rem;padding:0;list-style:none}"
    + "@media (min-width:700px){.c3ph-cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}}"
    + "@media (min-width:1000px){.c3ph-cards.c3ph-4{grid-template-columns:repeat(4,minmax(0,1fr))}}"
    + ".c3ph-card{margin:0;background:var(--ivory);border:1px solid var(--rule);border-radius:6px;overflow:hidden;display:flex;flex-direction:column}"
    + ".c3ph-card .c3ph-f{border-radius:0}"
    + ".c3ph-card img,.c3ph-card svg{display:block;width:100%;height:auto;aspect-ratio:var(--c3ph-r,4/3);object-fit:cover}"
    + ".c3ph-card .c3ph-cr{font-size:.56rem;padding:1.2rem .45rem .25rem 1.6rem}"
    + ".c3ph-card strong{display:block;color:var(--navy);font-size:.98rem;font-weight:500;line-height:1.3;padding:.7rem .8rem 0}"
    + ".c3ph-card span.c3ph-t{display:block;color:var(--muted);font-size:.86rem;line-height:1.45;padding:.2rem .8rem .85rem}",
  /* Small print: the title is the same small size as the lines, only a little darker. */
  credits: ".c3ph-credits{margin:2rem 0 1rem;padding:1rem 0 0;border-top:1px solid var(--rule);color:var(--muted);font-size:.8rem;line-height:1.55;max-width:760px}"
    + ".c3ph-credits .c3ph-h{font-family:var(--sans);font-size:.8rem;font-weight:500;color:var(--navy);margin:0 0 .4rem}"
    + ".c3ph-credits [role=listitem]{margin:0 0 .3rem}"
    + ".c3ph-credits a{color:inherit;text-decoration:underline;text-decoration-color:rgba(28,32,40,.3);text-underline-offset:2px}",
};
const style = (keys, opts) => (opts && opts.css === false ? "" : `<style>${keys.map((k) => CSS[k]).join("")}</style>`);

/* All the CSS at once, for a page that sets opts.css: false on each call. */
const photoCss = () => `<style>${Object.values(CSS).join("")}</style>`;

/* ---------------------------------------------------------------------------- */
/* The four blocks                                                                */

/*
 * A wide photo near the top: 16:9 on a wide screen, 4:3 on a phone (the browser crops
 * with object-fit; the file is not cut). Loads first, never lazy.
 * Options: alt (or rec.alt), caption (plain text under the photo), base ("/"),
 * sizes, maxWidth (CSS length, default 100% of the column), css.
 */
function heroPhoto(rec, opts = {}) {
  const kind = checkRecord(rec);
  const alt = altFor(opts, rec);
  const sizes = opts.sizes || "(max-width: 1200px) 100vw, 1136px";
  const mw = /^[0-9.]+(?:px|rem|em|%)$/.test(opts.maxWidth || "") ? `max-width:${opts.maxWidth};` : "";
  const cap = opts.caption ? `<figcaption>${esc(opts.caption)}</figcaption>` : "";
  shown(rec, opts.caption, alt, { hero: true });
  return `${style(["base", "hero"], opts)}<figure class="c3ph-hero" style="${mw}"><div class="c3ph-f">${img(rec, alt, { base: opts.base || "/", sizes, hero: true })}${overlay(rec, kind)}</div>${cap}</figure>`;
}

/*
 * Two or three photos. On a phone they stand one under the other, full width, each with its
 * caption under it; from 700 px wide they sit side by side in a grid.
 * items: [{ photo: rec, alt, caption }] (or records with .alt and .caption set).
 * Options: layout ("stack", the default, or "row": on a phone a sideways row that snaps,
 * with "Swipe for more photos" and a dot per photo under it), ratio ("4/3" default, "3/2",
 * "1/1", "16/9"), label (for screen readers, default "Photos"), base, sizes, css.
 */
function gallery(items, opts = {}) {
  if (!Array.isArray(items) || items.length < 2 || items.length > 3) throw new Error("photos.js: gallery takes 2 or 3 photos");
  if (opts.layout != null && !["stack", "row"].includes(opts.layout)) throw new Error(`photos.js: gallery layout is "stack" (the default) or "row", not "${opts.layout}"`);
  const row = opts.layout === "row";
  const ratio = ["4/3", "3/2", "1/1", "16/9"].includes(opts.ratio) ? opts.ratio : "4/3";
  const n = items.length;
  const sizes = opts.sizes || `(max-width: 699px) ${row ? "82vw" : "100vw"}, ${n === 2 ? "380px" : "250px"}`;
  const figs = items.map((it) => {
    const rec = it && it.photo ? it.photo : it;
    const kind = checkRecord(rec);
    const alt = altFor(it, rec);
    const caption = String((it && it.caption) || "").trim();
    if (!caption) throw new Error(`photos.js: gallery photo ${label(rec)} needs a caption (a few plain words under the photo)`);
    shown(rec, caption, alt);
    return `<figure><div class="c3ph-f">${img(rec, alt, { base: opts.base || "/", sizes })}${overlay(rec, kind)}</div><figcaption>${esc(caption)}</figcaption></figure>`;
  }).join("");
  const gal = `<div class="c3ph-gal${row ? " c3ph-row" : ""}" role="group" aria-label="${esc(opts.label || "Photos")}" style="--c3ph-n:${n};--c3ph-r:${ratio}">${figs}</div>`;
  if (!row) return `${style(["base", "gallery"], opts)}${gal}`;
  /* The hint is for the eye only: a screen reader already reads every photo in the group. */
  const hint = `<div class="c3ph-swipe" aria-hidden="true"><span class="c3ph-dots">${"<i></i>".repeat(n)}</span><span>Swipe for more photos &#8594;</span></div>`;
  return `${style(["base", "gallery", "row"], opts)}<div class="c3ph-rowbox">${gal}${hint}</div>`;
}

/*
 * Small picture cards for features: a 4:3 (or square) picture, a label and one plain line.
 * Two a row on a phone, three from 700 px, four from 1000 px when opts.cols is 4.
 * items: [{ label, text, photo: rec, alt }] or [{ label, text, illustration: "indoor-pool" }].
 * A drawing is decorative in a card (the label says what it shows) unless the item has alt.
 * Options: cols (3 or 4), ratio ("4/3" or "1/1"), base, css.
 */
function featureCards(items, opts = {}) {
  if (!Array.isArray(items) || !items.length) throw new Error("photos.js: featureCards needs a list of { label, text, photo or illustration }");
  const { illustration } = require("./illustrations.js");
  const ratio = opts.ratio === "1/1" ? "1/1" : "4/3";
  const cards = items.map((it) => {
    if (!it || !String(it.label || "").trim()) throw new Error("photos.js: a feature card needs a label");
    if (!!it.photo === !!it.illustration) throw new Error(`photos.js: feature card "${it.label}" needs a photo or an illustration (one, not both)`);
    let pic;
    if (it.photo) {
      const kind = checkRecord(it.photo);
      const alt = altFor(it, it.photo);
      shown(it.photo, "", alt, { card: [it.label, it.text].filter(Boolean).join(". ") });
      pic = `<div class="c3ph-f">${img(it.photo, alt, { base: opts.base || "/", sizes: "(max-width: 699px) 46vw, 260px" })}${overlay(it.photo, kind)}</div>`;
    } else {
      pic = illustration(it.illustration, it.alt ? { alt: it.alt } : { decorative: true });
    }
    const text = it.text ? `<span class="c3ph-t">${esc(it.text)}</span>` : "";
    return `<li class="c3ph-card">${pic}<strong>${esc(it.label)}</strong>${text}</li>`;
  }).join("");
  return `${style(["base", "cards"], opts)}<ul role="list" class="c3ph-cards${+opts.cols === 4 ? " c3ph-4" : ""}" style="--c3ph-r:${ratio}">${cards}</ul>`;
}

/*
 * "Photo credits" for the end of the page, in small type. One line per photo, each photo
 * once: what it shows, in plain words (see whatItShows), then "Photo: <author>", the license
 * linked to its deed, and "via Wikimedia Commons" linked to the photo's own page. Then one
 * line on what Chapter3 changed. No file titles and no dates: the readers took them for
 * mistakes. That is everything CC BY and CC BY-SA ask for: the author, the license and a
 * link to it, a link to the source, and a note of changes.
 * recs: the photo records used on the page, or { photo, caption } to name a photo in your
 * own words. Built from divs with list roles, so the scorer does not read it as body copy.
 * Options: title ("Photo credits"), id, css.
 */
function creditsList(recs, opts = {}) {
  if (!Array.isArray(recs) || !recs.length) throw new Error("photos.js: creditsList needs the photo records used on the page");
  const seen = new Set();
  let sa = false;
  const items = recs.map((r) => (r && r.photo ? { rec: r.photo, caption: r.caption } : { rec: r }));
  const rows = items.filter(({ rec }) => { const k = label(rec); if (seen.has(k)) return false; seen.add(k); return true; }).map(({ rec, caption }) => {
    const kind = checkRecord(rec);
    if (kind === "by-sa") sa = true;
    const what = esc(whatItShows(rec, caption));
    if (kind === "own") return `<div role="listitem">${what}. Photo: ${esc(rec.author)}, Chapter3 Realty.</div>`;
    if (kind === "illustration") return `<div role="listitem">${what}. Drawing: Chapter3 Realty.</div>`;
    const src = rec.source || rec.commons_page;
    const where = srcName(rec) || new URL(src).hostname.replace(/^www\./, "");
    const lic = `<a href="${esc(rec.license_url)}" ${EXT}>${esc(licText(rec, kind))}</a>`;
    const chg = changesOf(rec) ? ` ${esc(changesOf(rec))}.` : "";
    return `<div role="listitem">${what}. Photo: ${esc(rec.author)}, ${lic}, via <a href="${esc(src)}" ${EXT}>${esc(where)}</a>.${chg}</div>`;
  }).join("");
  const note = `<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.${sa ? " Each photo keeps the license listed with it." : ""}</div>`;
  const id = esc(opts.id || "photo-credits");
  return `${style(["credits"], opts)}<div class="c3ph-credits"><div class="c3ph-h" id="${id}">${esc(opts.title || "Photo credits")}</div><div role="list" aria-labelledby="${id}">${rows}${note}</div></div>`;
}

/* ---------------------------------------------------------------------------- */
/* Files                                                                          */

/*
 * Writes <outBase>-600w.webp and <outBase>-1200w.webp from a source image with ImageMagick.
 * Strips metadata, keeps the colors in sRGB, never enlarges. Returns { width, height, files }
 * for the 1200w file. The source must be at least 1200 px wide.
 */
function makeVariants(src, outBase, o = {}) {
  const { execFileSync } = require("child_process");
  const [w] = execFileSync("identify", ["-format", "%w %h", `${src}[0]`]).toString().trim().split(" ").map(Number);
  if (!(w >= 1200)) throw new Error(`photos.js: ${src} is ${w} px wide; a photo must be at least 1200 px wide`);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  /* Each file has a byte budget: 200 KB for 1200w, 64 KB for 600w. Most photos fit at the
     encoder's normal quality. A leafy photo that does not is encoded again to the budget
     (webp:target-size; this ImageMagick build ignores -quality for WebP). */
  const files = {};
  for (const [size, budget] of [[1200, o.max1200 || 200 * 1024], [600, o.max600 || 64 * 1024]]) {
    const out = `${outBase}-${size}w.webp`;
    const enc = (extra) => execFileSync("convert", [`${src}[0]`, "-auto-orient", "-colorspace", "sRGB", "-resize", `${size}x>`, "-strip", "-define", "webp:method=6", ...extra, out]);
    enc([]);
    if (fs.statSync(out).size > budget) enc(["-define", `webp:target-size=${Math.round(budget * 0.96)}`, "-define", "webp:pass=6"]);
    files[size] = out;
  }
  const [W, H] = execFileSync("identify", ["-format", "%w %h", files[1200]]).toString().trim().split(" ").map(Number);
  /* -strip removed every credit and license field. With o.rec they go back in at once. */
  if (o.rec) for (const f of Object.values(files)) embedMetadata(o.rec, f);
  return { width: W, height: H, files };
}

/*
 * The three crops Google asks for in Article.image ("multiple high-resolution images ...
 * 16x9, 4x3, and 1x1"), each 1200 px wide, so the 16x9 and 4x3 files also meet Discover's
 * "at least 1200 px wide". Writes <outBase>-1x1.webp, -4x3.webp and -16x9.webp from the
 * center of the source. The source must be at least 1200 px on its short side (download the
 * original from its source page; the 1200w file is too small for a 1200 x 1200 square).
 * A crop is cut from the file, so a CC BY-SA crop is adapted material: it keeps BY-SA and the
 * record says so (rules/images.md). With o.rec, the metadata is embedded (adapted).
 * Returns { "1x1": { file, width, height }, "4x3": ..., "16x9": ... }.
 */
const CROPS = { "1x1": 1, "4x3": 4 / 3, "16x9": 16 / 9 };
function makeCrops(src, outBase, o = {}) {
  const { execFileSync } = require("child_process");
  const [w, h] = execFileSync("identify", ["-format", "%w %h", `${src}[0]`]).toString().trim().split(" ").map(Number);
  if (!(Math.min(w, h) >= 1200)) throw new Error(`photos.js: ${src} is ${w} x ${h}; a crop source must be at least 1200 px on its short side`);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  const budget = o.max || 200 * 1024;
  const out = {};
  for (const [name, r] of Object.entries(CROPS)) {
    const cw = w / h > r ? Math.round(h * r) : w, ch = w / h > r ? h : Math.round(w / r);
    const file = `${outBase}-${name}.webp`;
    const enc = (extra) => execFileSync("convert", [`${src}[0]`, "-auto-orient", "-colorspace", "sRGB", "-gravity", o.gravity || "center", "-crop", `${cw}x${ch}+0+0`, "+repage",
      "-resize", "1200x>", "-strip", "-define", "webp:method=6", ...extra, file]);
    enc([]);
    if (fs.statSync(file).size > budget) enc(["-define", `webp:target-size=${Math.round(budget * 0.96)}`, "-define", "webp:pass=6"]);
    const [W, H] = execFileSync("identify", ["-format", "%w %h", file]).toString().trim().split(" ").map(Number);
    if (W < 1200 || W * H < 50000) throw new Error(`photos.js: crop ${file} is ${W} x ${H}; it must be 1200 px wide`);
    if (o.rec) embedMetadata(o.rec, file, { adapted: true });
    out[name] = { file, width: W, height: H };
  }
  return out;
}

/* ---------------------------------------------------------------------------- */
/* Metadata: what search engines read in the file and in the page                */
/*
 * rules/image-metadata.md says what each field is for and where each rule comes from.
 *
 * In the file: the IPTC Photo Metadata fields Google reads, written as XMP with exiftool
 * (a JPG also gets the older IPTC block, and every file gets EXIF Artist, Copyright and
 * ImageDescription): Creator, Credit Line, Copyright Notice, Web Statement of Rights (the
 * license URL), Licensor URL (where to get a license), Description, Title, Alt Text
 * (Accessibility), Digital Source Type, Location Shown, Date Created and Source, plus the
 * Creative Commons fields (cc:license, cc:attributionName, cc:attributionURL).
 * ImageMagick strips all of it (makeVariants, makeCrops use -strip), so embed after every
 * resize or crop: pass { rec } to those two, or run "node tools/photos.js embed".
 *
 * In the page: one ImageObject per photo shown (imageSchema), with the same rights fields.
 * Google: "If you use both methods and they conflict, Google will use the structured data."
 * metaFor() builds both from the one record, so they cannot disagree.
 *
 *   P.metaFor(rec)                       the fields, as plain values
 *   P.embedMetadata(rec, file, { adapted })  writes them into a WebP, JPG or PNG
 *   P.readEmbedded(file)                 what the file holds (exiftool JSON, -G1 -struct)
 *   P.checkEmbedded(rec, file, { adapted })  [] when the file holds every field, with the record's values
 *   P.imageObject(rec, { base })         one schema.org ImageObject for a photo on the page
 *   P.imageSchema(recs, { base })        <script type="application/ld+json"> with one per photo
 *   P.pageImages(rec, { base })          the 1x1, 4x3 and 16x9 crops, for Article.image
 */
const SITE = "https://chapter3realty.com";
const DST = "http://cv.iptc.org/newscodes/digitalsourcetype/";
/* IPTC Digital Source Type (https://cv.iptc.org/newscodes/digitalsourcetype/) by kind:
   photo         digitalCapture: "captured from a real-life source using a digital camera".
   map           dataDrivenMedia: "Digital media representation of data via human programming
                 or creativity" (area-map.js draws streets and water from map data).
   illustration  trainedAlgorithmicMedia ("Created using Generative AI"): the drawings in
                 illustrations.js were written as SVG code by Claude, a generative AI model.
                 A drawing a person makes takes "digital_source_type": "digitalCreation".
   A record may set digital_source_type itself (an old photo scanned from a print: "print").
   An aerial photo with an outline and labels drawn on it by code takes "composite" ("Mix or
   composite of several elements"): the photo is a capture and the drawing is not, so
   "compositeCapture" ("all captures of real life") would be wrong, and no generative AI
   touched it, so "compositeWithTrainedAlgorithmicMedia" would be wrong too. Its "changes"
   says what was drawn. */
const DST_KIND = { photo: "digitalCapture", map: "dataDrivenMedia", illustration: "trainedAlgorithmicMedia" };
const DST_TERMS = ["digitalCapture", "computationalCapture", "negativeFilm", "positiveFilm", "print", "humanEdits", "digitalCreation", "dataDrivenMedia",
  "trainedAlgorithmicMedia", "compositeWithTrainedAlgorithmicMedia", "compositeSynthetic", "composite", "compositeCapture", "algorithmicMedia", "algorithmicallyEnhanced", "screenCapture"];
const STATE = "South Carolina", COUNTRY = "United States", COUNTRY_CODE = "US";

/*
 * The metadata for one record. The file and the page both take it from here.
 * o.adapted: the file was cut from the original (a crop). A CC BY-SA crop says it keeps BY-SA.
 */
function metaFor(rec, o = {}) {
  const kind = checkRecord(rec);
  const own = kind === "own" || kind === "illustration";
  const source = String(rec.source || rec.commons_page || "").trim();
  const author = String(rec.author).trim();
  const lic = String(rec.license).trim();
  const alt = String(rec.alt || "").trim();
  if (words(alt) < 3) throw new Error(`photos.js: ${label(rec)} needs a default alt of 3 or more words; it goes in the file as Alt Text (Accessibility)`);
  const dst = rec.digital_source_type || DST_KIND[rec.kind || (kind === "illustration" ? "illustration" : "photo")];
  if (!DST_TERMS.includes(dst)) throw new Error(`photos.js: ${label(rec)} digital_source_type "${dst}" is not an IPTC term`);
  const pl = rec.place || {};
  const changed = changesOf(rec) || (o.adapted ? "Cropped and resized by Chapter3 Realty from the original" : "Resized by Chapter3 Realty from the original");
  return {
    kind,
    creator: kind === "illustration" ? "Chapter3 Realty" : author,
    creatorType: kind === "illustration" || rec.author_type === "Organization" ? "Organization" : "Person",
    /* The record's credit line without "Photo: " and without a note after it
       ("Credit not required; give it anyway." is for us, not for the reader). */
    credit: String(rec.credit).replace(/^(?:Photo|Drawing|Map):\s*/i, "").split(/\.\s+(?=[A-Z])/)[0].replace(/\.$/, "").trim(),
    copyright: own ? "© Chapter3 Realty" : kind === "pd" ? `Public domain (${author})` : kind === "cc0" ? `${author}, CC0 1.0 (no rights reserved)` : `© ${author}, ${lic}`,
    license: own ? `${SITE}/terms/` : rec.license_url,
    acquire: own ? `${SITE}/contact/` : source,
    licensor: own ? "Chapter3 Realty" : author,
    usage: own ? "© Chapter3 Realty. Ask Chapter3 Realty before using this picture." : kind === "pd" ? "Public domain. No permission needed." : `${lic}. ${rec.license_url}`,
    marked: !(kind === "pd" || kind === "cc0"),
    description: String(rec.what || alt).trim(),
    title: alt,
    alt,
    dst,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(rec.taken || "")) ? rec.taken : "",
    source: own ? SITE : source,
    place: { sublocation: pl.sublocation || "", city: pl.city || "", state: pl.state || STATE, country: COUNTRY, code: COUNTRY_CODE },
    note: own ? "Made by Chapter3 Realty." : `${changed}. ${kind === "by-sa" && o.adapted ? `This crop is shared under the same license, ${lic}.` : `License: ${lic}.`}`,
    cc: kind === "by" || kind === "by-sa" || kind === "cc0",
  };
}

const EXIFTOOL = process.env.EXIFTOOL || "exiftool";
const hasExiftool = () => { try { require("child_process").execFileSync(EXIFTOOL, ["-ver"], { stdio: "pipe" }); return true; } catch { return false; } };
const needExiftool = () => { if (!hasExiftool()) throw new Error("photos.js: exiftool is not installed (apt-get install libimage-exiftool-perl, or https://exiftool.org)"); };
/* A value inside an exiftool structure: , | { } [ ] = are escaped with | */
const sv = (v) => String(v).replace(/[|,{}[\]=]/g, (c) => `|${c}`);

/* Writes every field into the file, replacing what was there. WebP, JPG and PNG. */
function embedMetadata(rec, file, o = {}) {
  needExiftool();
  const m = metaFor(rec, o);
  const ext = path.extname(file).toLowerCase();
  if (![".webp", ".jpg", ".jpeg", ".png"].includes(ext)) throw new Error(`photos.js: embedMetadata takes WebP, JPG or PNG, not ${file}`);
  const loc = [["Sublocation", m.place.sublocation], ["City", m.place.city], ["ProvinceState", m.place.state], ["CountryName", m.place.country], ["CountryCode", m.place.code]]
    .filter(([, v]) => v).map(([k, v]) => `${k}=${sv(v)}`).join(",");
  /* No padding and no indent: the XMP packet is about 3 KB instead of 6 KB on every file. */
  const args = ["-overwrite_original", "-m", "-q", "-api", "Compact=NoPadding,NoIndent", "-XMP:all=", "-EXIF:all=",
    `-XMP-dc:Creator=${m.creator}`,
    `-XMP-dc:Rights=${m.copyright}`,
    `-XMP-dc:Description=${m.description}`,
    `-XMP-dc:Title=${m.title}`,
    `-XMP-photoshop:Credit=${m.credit}`,
    `-XMP-photoshop:Source=${m.source}`,
    `-XMP-photoshop:Instructions=${m.note}`,
    `-XMP-xmpRights:WebStatement=${m.license}`,
    `-XMP-xmpRights:Marked=${m.marked ? "True" : "False"}`,
    `-XMP-xmpRights:UsageTerms=${m.usage}`,
    `-XMP-plus:Licensor={LicensorName=${sv(m.licensor)},LicensorURL=${sv(m.acquire)}}`,
    `-XMP-iptcCore:AltTextAccessibility=${m.alt}`,
    `-XMP-iptcExt:DigitalSourceType=${DST}${m.dst}`,
    `-XMP-iptcExt:LocationShown={${loc}}`,
    `-EXIF:Artist=${m.creator}`,
    `-EXIF:Copyright=${m.copyright}`,
    `-EXIF:ImageDescription=${m.description}`,
    "-EXIF:XResolution=72", "-EXIF:YResolution=72", "-EXIF:ResolutionUnit=inches"];
  if (m.date) args.push(`-XMP-photoshop:DateCreated=${m.date}`);
  if (m.cc) args.push(`-XMP-cc:License=${m.license}`, `-XMP-cc:AttributionName=${m.creator}`, `-XMP-cc:AttributionURL=${m.source}`);
  if (ext === ".jpg" || ext === ".jpeg") {
    /* The old IPTC block caps Credit at 32 bytes and Object Name at 64; XMP holds the full text. */
    args.push("-IPTC:all=", "-IPTC:CodedCharacterSet=UTF8", `-IPTC:By-line=${m.creator.slice(0, 32)}`, `-IPTC:Credit=${(m.credit.length <= 32 ? m.credit : m.creator).slice(0, 32)}`,
      `-IPTC:CopyrightNotice=${m.copyright.slice(0, 128)}`, `-IPTC:Caption-Abstract=${m.description}`, `-IPTC:ObjectName=${m.title.slice(0, 64)}`);
    if (m.place.city) args.push(`-IPTC:City=${m.place.city}`);
    if (m.place.sublocation) args.push(`-IPTC:Sub-location=${m.place.sublocation}`);
    args.push(`-IPTC:Province-State=${m.place.state}`, `-IPTC:Country-PrimaryLocationName=${m.place.country}`);
  }
  require("child_process").execFileSync(EXIFTOOL, [...args, file], { stdio: "pipe" });
  return m;
}

/* What the file holds, as exiftool's JSON with group names ("XMP-dc:Creator"). */
function readEmbedded(file) {
  needExiftool();
  const out = require("child_process").execFileSync(EXIFTOOL, ["-j", "-struct", "-G1", "-XMP:all", "-EXIF:Artist", "-EXIF:Copyright", "-ImageWidth", "-ImageHeight", file], { stdio: "pipe" });
  return JSON.parse(out.toString())[0] || {};
}

/* The fields a file must hold, by the name a person reads in the report. */
const one = (v) => (Array.isArray(v) ? v[0] : v);
const EMBEDDED = [
  ["Creator", (e) => one(e["XMP-dc:Creator"]), (m) => m.creator],
  ["Credit Line", (e) => e["XMP-photoshop:Credit"], (m) => m.credit],
  ["Copyright Notice", (e) => e["XMP-dc:Rights"], (m) => m.copyright],
  ["Web Statement of Rights", (e) => e["XMP-xmpRights:WebStatement"], (m) => m.license],
  ["Licensor URL", (e) => (one(e["XMP-plus:Licensor"]) || {}).LicensorURL, (m) => m.acquire],
  ["Description", (e) => e["XMP-dc:Description"], (m) => m.description],
  ["Alt Text (Accessibility)", (e) => e["XMP-iptcCore:AltTextAccessibility"], (m) => m.alt],
  ["Digital Source Type", (e) => e["XMP-iptcExt:DigitalSourceType"], (m) => DST + m.dst],
];

/*
 * [] when the file holds every field with the record's value; otherwise one line per field
 * that is missing or stale. With no record, only checks each field is present.
 */
function checkEmbedded(rec, file, o = {}) {
  const e = readEmbedded(file);
  const m = rec ? metaFor(rec, o) : null;
  const out = [];
  for (const [name, get, want] of EMBEDDED) {
    const v = get(e);
    if (v === undefined || v === null || String(v).trim() === "") out.push(`no ${name}`);
    else if (m && String(v) !== String(want(m))) out.push(`${name} is "${v}", the record says "${want(m)}"`);
  }
  return out;
}

/* Every file a record names (the original, the 600w and 1200w, the crops), with "adapted". */
function recordFiles(rec) {
  const v = rec.variants || {};
  const list = [rec.file, v["600"], v["1200"]].filter(Boolean).map((p) => ({ path: p, adapted: false }));
  for (const c of Object.values(rec.crops || {})) list.push({ path: c.path, adapted: true });
  return list;
}
/* A record path under an image root: the site keeps images/55-plus/<slug>/, a batch keeps images/<slug>/. */
function resolveImage(root, p) {
  for (const f of [path.join(root, p), path.join(root, String(p).replace(/^images\/55-plus\//, "images/"))]) if (fs.existsSync(f)) return f;
  return null;
}

/* ---- the page ---- */

const absUrl = (base, p) => (/^https?:\/\//.test(p) ? p : String(base || SITE + "/").replace(/\/?$/, "/") + String(p).replace(/^\//, ""));
const placeName = (m) => [m.place.sublocation, m.place.city, m.place.state].filter(Boolean).join(", ");

/* The rights fields every ImageObject carries (Google, image license metadata). */
function rights(m) {
  const o = { creator: { "@type": m.creatorType, name: m.creator }, creditText: m.credit, copyrightNotice: m.copyright, license: m.license, acquireLicensePage: m.acquire };
  if (/^https:\/\//.test(m.source) && m.source !== SITE) o.isBasedOn = m.source;
  return o;
}

/*
 * One ImageObject for a photo on the page: the 1200w file (the <img> src), its size, the
 * visible caption (or the card's label and line), the alt text it was shown with as the
 * description, what it shows as the name, the rights fields and the place. The hero is
 * representativeOfPage. Bing: "Structured data must accurately represent visible content",
 * so nothing here is text the reader cannot see, except the rights the credits link to.
 * o.base: the site root for absolute URLs (default https://chapter3realty.com/).
 */
function imageObject(rec, o = {}) {
  const m = metaFor(rec);
  const s = imageSet(rec, o.base || SITE + "/");
  const seen = SHOWN.get(rec) || {};
  const io = { "@type": "ImageObject", contentUrl: s.src, url: s.src, width: s.width, height: s.height, encodingFormat: "image/webp", name: whatItShows(rec) };
  const caption = seen.full || seen.card || "";
  if (caption) io.caption = caption;
  io.description = seen.alt || m.alt;
  Object.assign(io, rights(m));
  if (placeName(m) !== m.place.state) io.contentLocation = { "@type": "Place", name: placeName(m) };
  if (seen.hero || o.representative) io.representativeOfPage = true;
  return io;
}

/*
 * The JSON-LD for the photos on a page: one <script type="application/ld+json"> holding an
 * @graph of ImageObjects, each photo once. recs: the records shown (photoSet().used()).
 * It may sit in <main>: Google and Bing read JSON-LD anywhere in the page.
 */
function imageSchema(recs, o = {}) {
  if (!Array.isArray(recs) || !recs.length) throw new Error("photos.js: imageSchema needs the photo records shown on the page");
  const seen = new Set();
  const graph = recs.filter((r) => { const k = label(r); if (seen.has(k)) return false; seen.add(k); return true; }).map((r) => imageObject(r, o));
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

/*
 * Article.image for a page whose hero is this photo: the 1x1, 4x3 and 16x9 crops, each an
 * ImageObject with its size and the rights fields (a crop is adapted: its note says so).
 * Google, Article: "provide multiple high-resolution images (minimum of 50K pixels when
 * multiplying width and height) with the following aspect ratios: 16x9, 4x3, and 1x1."
 * Throws when the record has no crops (node tools/photos.js crops).
 */
function pageImages(rec, o = {}) {
  const c = rec.crops || {};
  const miss = Object.keys(CROPS).filter((k) => !c[k] || !c[k].path || !(c[k].width >= 1200) || !(c[k].height > 0));
  if (miss.length) throw new Error(`photos.js: ${label(rec)} has no ${miss.join(", ")} crop (node tools/photos.js crops <source> <out base>)`);
  const m = metaFor(rec, { adapted: true });
  /* description: the alt text the hero was shown with (else the record's), so a page that
     shares the 16x9 crop in og:image has its og:image:alt (website mkpage-photos.patch). */
  const alt = (SHOWN.get(rec) || {}).alt || m.alt;
  return Object.keys(CROPS).map((k) => {
    const u = absUrl(o.base, c[k].path);
    return Object.assign({ "@type": "ImageObject", contentUrl: u, url: u, width: c[k].width, height: c[k].height, encodingFormat: "image/webp" }, alt ? { description: alt } : {}, rights(m));
  });
}

/* Checks every record in a photos.json and, with a root, that its files exist. With
   o.meta, also that every file holds its embedded metadata. Returns problems. */
function checkFile(jsonPath, root, o = {}) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const out = [];
  for (const rec of data.photos || []) {
    try {
      if (rec.hold) { out.push(`hold  ${rec.file}: ${rec.hold}`); continue; }
      checkRecord(rec); imageSet(rec);
      if (!rec.alt) out.push(`warn  ${rec.file}: no default alt (each call must pass alt)`);
      if (root) for (const p of [rec.variants["600"], rec.variants["1200"]]) if (!resolveImage(root, p)) out.push(`FAIL  ${rec.file}: missing ${p}`);
      if (root && o.meta) for (const f of recordFiles(rec)) {
        const at = resolveImage(root, f.path);
        if (!at) { if (f.adapted) out.push(`FAIL  ${rec.file}: missing crop ${f.path}`); continue; }
        const bad = checkEmbedded(rec, at, { adapted: f.adapted });
        if (bad.length) out.push(`FAIL  ${f.path}: ${bad.join("; ")}`);
      }
    } catch (e) { out.push(`FAIL  ${rec.file}: ${e.message}`); }
  }
  return out;
}

/* Embeds the metadata in every file of every record (not on hold) under each root. */
function embedFile(jsonPath, roots) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const out = [];
  for (const rec of data.photos || []) {
    if (rec.hold) { out.push(`hold  ${rec.file}`); continue; }
    for (const root of roots) for (const f of recordFiles(rec)) {
      const at = resolveImage(root, f.path);
      if (!at) continue;
      embedMetadata(rec, at, { adapted: f.adapted });
      out.push(`ok    ${at}`);
    }
  }
  return out;
}

module.exports = { heroPhoto, gallery, featureCards, creditsList, photoCss, checkRecord, findPhoto, imageSet, makeVariants, makeCrops, checkFile, whatItShows, hasDate, LICENSES, esc,
  metaFor, embedMetadata, readEmbedded, checkEmbedded, imageObject, imageSchema, pageImages, recordFiles, resolveImage, embedFile, hasExiftool, SHOWN, SITE, DST, CROPS };

if (require.main === module) {
  const [cmd, a, b, ...rest] = process.argv.slice(2);
  if (cmd === "check" && a) {
    const out = checkFile(a, b, { meta: !!b && hasExiftool() });
    for (const l of out) console.log(l);
    const fails = out.filter((l) => l.startsWith("FAIL")).length;
    console.log(fails ? `\n${fails} problem(s)` : "\nall photo records pass");
    process.exitCode = fails ? 1 : 0;
  } else if (cmd === "variants" && a && b) {
    const r = makeVariants(a, b);
    console.log(`${r.files[600]}\n${r.files[1200]}  (${r.width}x${r.height})`);
  } else if (cmd === "embed" && a && b) {
    const out = embedFile(a, [b, ...rest]);
    for (const l of out) console.log(l);
    console.log(`\n${out.filter((l) => l.startsWith("ok")).length} file(s) written`);
  } else if (cmd === "meta" && a) {
    console.log(JSON.stringify(readEmbedded(a), null, 1));
  } else if (cmd === "crops" && a && b) {
    const r = makeCrops(a, b);
    console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { path: v.file, width: v.width, height: v.height }])), null, 1));
  } else {
    console.log(["node tools/photos.js check <photos.json> [image root]      records pass; files exist; with exiftool, files hold their metadata",
      "node tools/photos.js variants <source image> <out base>",
      "node tools/photos.js crops <source image> <out base>          1x1, 4x3, 16x9 at 1200 px wide, for Article.image",
      "node tools/photos.js embed <photos.json> <image root> [...]   writes the metadata into every file of every record",
      "node tools/photos.js meta <file>                              prints what a file holds"].join("\n"));
  }
}
