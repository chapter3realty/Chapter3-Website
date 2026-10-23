#!/usr/bin/env node
/*
 * compare.js: comparison tables for places and options, and the "I want X, so look at A, B, C"
 * block. For the comparison and decision shapes (reports/Page shapes by kind of page.md,
 * sections 4 and 9, tool gap 4).
 *
 * Usage, in a spec or a batch kit:
 *
 *   const { compareCards, wantPicker } = require("<blog-brain>/tools/compare.js");
 *
 *   compareCards([
 *     { name: "Myrtle Trace", href: "/buyers/55-plus-communities/myrtle-trace/", icon: "golf",
 *       bestFor: "Golf next door", cells: { price: "$250,000", hoa: "$95 a month", beach: "15 min" } },
 *     { name: "Del Webb North Myrtle Beach", href: "/buyers/55-plus-communities/del-webb-north-myrtle-beach/",
 *       icon: "pool", bestFor: "New homes", cells: { price: "$450,000", hoa: "$250 a month", beach: "10 min" } },
 *   ], [
 *     { key: "price", label: "Typical price", num: true },
 *     { key: "hoa", label: "HOA fee" },
 *     { key: "beach", label: "To the beach", num: true },
 *   ], { caption: "Two neighborhoods side by side", nameLabel: "Neighborhood" })
 *
 *   wantPicker([
 *     { icon: "beach", want: "Walk to the beach", places: [{ name: "A", href: "/a/" }, { name: "B", href: "/b/" }] },
 *     { icon: "golf", want: "Golf at the door", places: [ ... two or three ... ] },
 *   ])
 *
 * compareCards(rows, columns, opts)
 *   rows     [{ name, href?, icon?, bestFor?, cells: { <key>: text or number } }]. 2 to 15 rows.
 *            name is the place or option; href links it to its page; icon is a tools/icons.js
 *            name, shown before the name as decoration; bestFor is a short label (32 letters
 *            or fewer) about the place, never about people.
 *   columns  [{ key, label, num? }]. 1 to 4 value columns. num: true right-aligns the column
 *            on a wide screen (prices, minutes, counts). Every row has a value for every key.
 *   opts     caption (required: what the table compares, plain words), nameLabel (the first
 *            column's heading, default "Place"), bestForLabel (default "Best for"), self (this
 *            page's href: its row is bold and not linked), css: false (the style block is
 *            already on the page).
 *   Returns HTML: a style block scoped by .c3-cc, then a real <table> with a <caption>, column
 *   headers and a row header per place (STANDARD A6). Under 640 px wide (wider when the table
 *   has more columns, so it never scrolls sideways) each row becomes a card: the name is its
 *   heading and each value has its label in front.
 *
 * wantPicker(wants, opts)
 *   wants    [{ icon, want, places: [{ name, href }], note? }]. 2 to 10 wants, each with 2 or 3
 *            places. want is what the reader wants, in plain words ("Walk to the beach"); note is
 *            an optional short line under the places. Static: no script, nothing hidden.
 *   opts     lookLabel (default "Look at"), css: false.
 *   Returns HTML: a list of cards, each with its icon, the want and links to the places.
 *
 * Fair housing (STANDARD C5, 42 USC 3604(c)): a table or a want describes the place, never who
 * lives there or who it suits. Every word the reader sees is checked against the "fair-housing"
 * patterns in rules/claims.json and the PROTECTED list below, and the short labels (bestFor, want,
 * note) also against the ABOUT_PEOPLE list. A hit throws, so the page does not build.
 *
 * Text is at the site's reading size (STANDARD H13): var(--read), 18 px on a phone and about
 * 19.5 px on a wide screen (website patch readability.patch), and so are headers, labels and
 * the caption.
 *
 *   node tools/compare.js "Best for families"   # prints what the fair housing check finds
 */
"use strict";
const { icon, esc } = require("./icons.js");
const CLAIMS = require("../rules/claims.json");

/* ---------------------------------------------------------------------------- */
/* The fair housing check                                                         */

/* The site-wide fair housing patterns ("family-friendly", "perfect for retirees", "safe
   neighborhood", school ratings), from the same file claims-scan.js reads. */
const FH_RULE = CLAIMS.rules.find((r) => r.id === "fair-housing");
if (!FH_RULE) throw new Error("compare.js: rules/claims.json has no fair-housing rule");
const FH_PATTERNS = FH_RULE.patterns.map((p) => new RegExp(p, "i"));

/* claims.json catches phrases in sentences. A table cell or a "best for" label is two or three
   words, so the bare word must be caught too. These words name a group of people by a trait
   the Fair Housing Act protects (familial status, age as a stand-in for it, sex, religion,
   national origin, race, disability), or they promise what a place cannot (safety, a quiet
   street, who is let in). */
/* "single-family" and "multi-family" name a kind of house, and "senior exemption" a tax rule, not
   people (each was a table cell on the live site, 2026-10-13). */
const PROTECTED = [
  "(?<![-\\w]|single |multi )famil(?:y|ies)(?![- ]rooms?\\b)", "kids?", "child(?:ren)?", "toddlers?", "teens?", "grandchildren", "grandkids",
  "retirees?", "retired", "seniors?(?! (?:exclusion|exemption|discount|property tax))", "senior citizens?", "elderly", "older (?:adults|people|folks|buyers)", "empty[- ]nesters?",
  "young (?:adults|people|professionals|couples|buyers)", "millennials?", "boomers?", "gen ?z",
  "couples?", "singles", "single (?:people|men|women|parents?)", "newlyweds?", "parents?", "grandparents?",
  "bachelors?", "men", "women", "ladies", "gentlemen",
  "christians?", "jewish", "jews", "muslims?", "catholics?",
  "hispanics?", "latinos?", "latinas?", "asians?", "caucasians?", "immigrants?", "foreigners?",
  "handicapped", "disabled", "able-bodied",
  "safe", "safer", "safest", "crime", "quiet", "exclusive", "integrated", "diverse", "ethnic",
];
/* A short label names what the place has, so it may not name people at all, even by a trait
   the law does not protect ("golfers", "commuters", "investors"). Longer prose may say "an owner
   who rents it out"; a two-word label has no room to say it about the property. */
const ABOUT_PEOPLE = [
  "people", "persons?", "folks", "everyone", "anyone", "someone", "those", "whoever", "who",
  "buyers?", "owners?", "residents?", "neighbou?rs?", "homeowners?", "renters?", "tenants?",
  "golfers?", "boaters?", "beachgoers?", "commuters?", "investors?", "snowbirds?", "workers?", "students?",
  "veterans?", "professionals?", "adults?",
];
const words = (list) => new RegExp(`\\b(?:${list.join("|")})\\b`, "i");
const PROTECTED_RE = words(PROTECTED), PEOPLE_RE = words(ABOUT_PEOPLE);

/* The problems in one piece of text, as a list; empty passes. o.label: a short label, also
   checked for words about people. */
function fairHousing(text, o = {}) {
  const t = String(text == null ? "" : text).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
  const out = [];
  for (const re of FH_PATTERNS) { const m = t.match(re); if (m) out.push(`"${m[0]}" (rules/claims.json fair-housing)`); }
  let m = t.match(PROTECTED_RE);
  if (m) out.push(`"${m[0]}" describes people or promises safety (STANDARD C5)`);
  if (o.label && (m = t.match(PEOPLE_RE))) out.push(`"${m[0]}" is about people; a short label names what the place has`);
  return out;
}
function assertFair(where, text, o) {
  const p = fairHousing(text, o);
  if (p.length) throw new Error(`compare.js: ${where}: ${p.join("; ")}. Describe the place: minutes, fees, prices, amenities, rules.`);
}

/* ---------------------------------------------------------------------------- */
/* Shared                                                                         */

const ICON_SIZE = 22;
const plain = (where, v) => {
  if (v === undefined || v === null || v === "") throw new Error(`compare.js: ${where} is empty`);
  if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error(`compare.js: ${where} is not a number`); return v.toLocaleString("en-US"); }
  if (typeof v !== "string") throw new Error(`compare.js: ${where} must be text or a number`);
  if (/[<>]/.test(v)) throw new Error(`compare.js: ${where} is plain text, no tags: ${v}`);
  return v.trim();
};
const href = (where, u) => {
  if (typeof u !== "string" || !/^(?:\/[^\s"<>]*|#[A-Za-z][\w-]*|https:\/\/[^\s"<>]+)$/.test(u)) throw new Error(`compare.js: ${where} must be a site path, an anchor or an https link: ${u}`);
  return u;
};
/* A link in a heading cell or a card: underlined (the site underlines links only inside p, li,
   td, dd and figcaption), with a 44 px tap height that does not move the line. */
const LINK = 'style="color:var(--navy);text-decoration:underline;text-underline-offset:.18em;text-decoration-thickness:1px"';

/* ---------------------------------------------------------------------------- */
/* compareCards                                                                   */

const CC_CSS = (below) => "<style>"
  + ".c3-cc{margin:1.4rem 0 1.8rem;max-width:960px}"
  + ".c3-cc table{width:100%;border-collapse:collapse;font-size:var(--read,1.0625rem);line-height:1.45;color:var(--muted)}"
  + ".c3-cc caption{caption-side:top;text-align:left;color:var(--navy);font-weight:600;font-size:1em;line-height:1.4;padding:0 0 .7rem}"
  + ".c3-cc th,.c3-cc td{padding:.6rem .7rem;text-align:left;vertical-align:top;border-bottom:1px solid var(--rule);overflow-wrap:break-word}"
  + ".c3-cc thead th{color:var(--navy);font-weight:600;font-size:1em;border-bottom:2px solid var(--navy);vertical-align:bottom}"
  + ".c3-cc tbody th{color:var(--navy);font-weight:600}"
  + ".c3-cc .n{text-align:right;font-variant-numeric:tabular-nums}"
  + ".c3-cc .i{display:inline-flex;vertical-align:-4px;margin-right:.45rem;color:var(--brass-ink)}"
  + ".c3-cc tr.c3-self>*{background:#fff}"
  /* In em, so a reader's larger text setting turns the table into cards sooner (WCAG 1.4.10). */
  + `@media (max-width:${Math.round(below / 16 * 1000) / 1000 - 0.001}em){`
  + ".c3-cc table,.c3-cc tbody,.c3-cc tr,.c3-cc th,.c3-cc td{display:block;width:auto}"
  + ".c3-cc caption{display:block}"
  + ".c3-cc thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}"
  + ".c3-cc tbody tr{background:var(--ivory-2);border-top:3px solid var(--brass);margin:0 0 .8rem;padding:.5rem 0 .6rem}"
  + "section[style*=\"background:var(--ivory-2)\"] .c3-cc tbody tr{background:var(--ivory)}"
  + ".c3-cc tr.c3-self{background:#fff!important;border:2px solid var(--brass)}.c3-cc tr.c3-self>*{background:transparent}"
  + ".c3-cc th,.c3-cc td{border:0;padding:.2rem 1rem}"
  /* The icon stays beside a long name that wraps, not on a line of its own. */
  + ".c3-cc tbody th{display:flex;align-items:center;font-size:1.1em;padding-bottom:.35rem}.c3-cc tbody th .i{flex:none;vertical-align:0}"
  + ".c3-cc tbody th a{display:inline-block;padding:.5rem 0}"
  + ".c3-cc .n{text-align:left}"
  + ".c3-cc td[data-label]::before{content:attr(data-label) \": \";color:var(--navy);font-weight:500}"
  + "}</style>";

function compareCards(rows, columns, opts = {}) {
  if (!Array.isArray(rows) || rows.length < 2 || rows.length > 15) throw new Error("compare.js: compareCards takes 2 to 15 rows");
  if (!Array.isArray(columns) || columns.length < 1 || columns.length > 4) throw new Error("compare.js: compareCards takes 1 to 4 value columns (keep only the columns that change the choice)");
  const caption = plain("the caption", opts.caption);
  assertFair("the caption", caption);
  const nameLabel = plain("nameLabel", opts.nameLabel || "Place"), bfLabel = plain("bestForLabel", opts.bestForLabel || "Best for");
  assertFair("nameLabel", nameLabel); assertFair("bestForLabel", bfLabel);
  const keys = new Set();
  columns = columns.map((c) => {
    if (!c || typeof c.key !== "string" || !c.key) throw new Error("compare.js: each column needs a key");
    if (keys.has(c.key)) throw new Error(`compare.js: column key ${c.key} is used twice`);
    keys.add(c.key);
    const label = plain(`column ${c.key} label`, c.label);
    assertFair(`column ${c.key} label`, label);
    return { key: c.key, label, num: !!c.num };
  });
  const anyBest = rows.some((r) => r.bestFor);
  if (anyBest && !rows.every((r) => r.bestFor)) throw new Error("compare.js: give every row a bestFor, or none");
  const names = new Set();
  const body = rows.map((r, i) => {
    const name = plain(`row ${i + 1} name`, r && r.name);
    if (names.has(name)) throw new Error(`compare.js: ${name} is in the table twice`);
    names.add(name);
    const extra = Object.keys(r.cells || {}).filter((k) => !keys.has(k));
    if (extra.length) throw new Error(`compare.js: ${name} has a value with no column: ${extra.join(", ")}`);
    const self = opts.self && r.href === opts.self;
    const ic = r.icon ? `<span class="i">${icon(r.icon, { size: ICON_SIZE })}</span>` : "";
    const nm = (r.href && !self) ? `<a href="${esc(href(`${name} href`, r.href))}" ${LINK}>${esc(name)}</a>` : esc(name);
    let cells = `<th scope="row">${ic}${nm}</th>`;
    if (anyBest) {
      const bf = plain(`${name} bestFor`, r.bestFor);
      if (bf.length > 32) throw new Error(`compare.js: ${name} bestFor is ${bf.length} letters; a label is 32 or fewer: ${bf}`);
      assertFair(`${name} bestFor`, bf, { label: true });
      cells += `<td data-label="${esc(bfLabel)}">${esc(bf)}</td>`;
    }
    for (const c of columns) {
      const v = plain(`${name} ${c.label}`, (r.cells || {})[c.key]);
      if (v.length > 40) throw new Error(`compare.js: ${name} ${c.label} is ${v.length} letters; a cell is short, 40 or fewer, not a sentence: ${v}`);
      assertFair(`${name} ${c.label}`, v);
      cells += `<td${c.num ? ' class="n"' : ""} data-label="${esc(c.label)}">${esc(v)}</td>`;
    }
    return `<tr${self ? ' class="c3-self"' : ""}>${cells}</tr>`;
  }).join("");
  if (opts.self && !rows.some((r) => r.href === opts.self)) throw new Error(`compare.js: no row links to self ${opts.self}`);
  const head = `<th scope="col">${esc(nameLabel)}</th>` + (anyBest ? `<th scope="col">${esc(bfLabel)}</th>` : "")
    + columns.map((c) => `<th scope="col"${c.num ? ' class="n"' : ""}>${esc(c.label)}</th>`).join("");
  /* The width below which rows become cards: 640 px for up to four columns in all, and 160 px
     more for each column after that, so a wide table turns into cards before it would have to
     scroll sideways. */
  const total = 1 + (anyBest ? 1 : 0) + columns.length;
  const below = cardsBelow(total);
  return (opts.css === false ? "" : CC_CSS(below))
    + `<div class="c3-cc"><table><caption>${esc(caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const cardsBelow = (columnsInAll) => Math.max(640, 640 + 160 * (columnsInAll - 4));

/* ---------------------------------------------------------------------------- */
/* wantPicker                                                                     */

const WP_CSS = "<style>"
  + ".c3-want{list-style:none;margin:1.4rem 0 1.8rem;padding:0;display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(min(18rem,100%),1fr));max-width:960px}"
  + ".c3-want>li{margin:0;background:var(--ivory-2);border-top:3px solid var(--brass);padding:1rem 1.1rem .7rem}"
  + "section[style*=\"background:var(--ivory-2)\"] .c3-want>li{background:var(--ivory)}"
  + ".c3-want .w{display:flex;align-items:center;gap:.65rem;margin:0 0 .5rem;color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.35}"
  + ".c3-want .i{flex:none;display:flex;width:2.4rem;height:2.4rem;border-radius:50%;background:#fff;color:var(--brass-ink);align-items:center;justify-content:center}"
  + ".c3-want .k{margin:0;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.4}"
  + ".c3-want ul{list-style:none;margin:0;padding:0}"
  + ".c3-want ul li{margin:0;font-size:var(--read,1.0625rem);line-height:1.4}"
  + ".c3-want ul a{display:inline-block;padding:.55rem 0;color:var(--navy);font-weight:500;text-decoration:underline;text-underline-offset:.18em;text-decoration-thickness:1px}"
  + ".c3-want .note{margin:.3rem 0 .3rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5}"
  + "</style>";

function wantPicker(wants, opts = {}) {
  if (!Array.isArray(wants) || wants.length < 2 || wants.length > 10) throw new Error("compare.js: wantPicker takes 2 to 10 wants");
  const look = plain("lookLabel", opts.lookLabel || "Look at");
  assertFair("lookLabel", look, { label: true });
  const seen = new Set();
  const cards = wants.map((w, i) => {
    const want = plain(`want ${i + 1}`, w && w.want);
    if (seen.has(want.toLowerCase())) throw new Error(`compare.js: the want "${want}" is listed twice`);
    seen.add(want.toLowerCase());
    if (want.length > 48) throw new Error(`compare.js: the want "${want}" is ${want.length} letters; say it in 48 or fewer`);
    assertFair(`the want "${want}"`, want, { label: true });
    if (!w.icon) throw new Error(`compare.js: the want "${want}" needs an icon`);
    if (!Array.isArray(w.places) || w.places.length < 2 || w.places.length > 3) throw new Error(`compare.js: the want "${want}" names 2 or 3 places`);
    const names = new Set();
    const list = w.places.map((p, j) => {
      const name = plain(`the want "${want}" place ${j + 1}`, p && p.name);
      if (names.has(name)) throw new Error(`compare.js: the want "${want}" names ${name} twice`);
      names.add(name);
      return `<li><a href="${esc(href(`${name} href`, p.href))}">${esc(name)}</a></li>`;
    }).join("");
    let note = "";
    if (w.note) {
      const n = plain(`the want "${want}" note`, w.note);
      if (n.length > 90) throw new Error(`compare.js: the note under "${want}" is ${n.length} letters; keep it to 90 or fewer`);
      assertFair(`the note under "${want}"`, n, { label: true });
      note = `<p class="note">${esc(n)}</p>`;
    }
    return `<li><p class="w"><span class="i">${icon(w.icon, { size: ICON_SIZE })}</span><span>${esc(want)}</span></p><p class="k">${esc(look)}:</p><ul>${list}</ul>${note}</li>`;
  }).join("");
  return (opts.css === false ? "" : WP_CSS) + `<ul role="list" class="c3-want">${cards}</ul>`;
}

module.exports = { compareCards, wantPicker, fairHousing, cardsBelow, PROTECTED, ABOUT_PEOPLE };

if (require.main === module) {
  const text = process.argv.slice(2).join(" ");
  if (!text) { console.error('usage: node tools/compare.js "<label to check>"'); process.exit(2); }
  const p = fairHousing(text, { label: true });
  console.log(p.length ? p.map((x) => `- ${x}`).join("\n") : "passes the fair housing check");
  process.exit(p.length ? 1 : 0);
}
