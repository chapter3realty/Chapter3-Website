#!/usr/bin/env node
/*
 * icons.js: small inline SVG line icons for pages, and an "at a glance" row.
 *
 * Usage, in a spec or a tool:
 *
 *   const { icon, atAGlance, ICON_NAMES } = require("<blog-brain>/tools/icons.js");
 *   icon("pool")                         // <svg ... aria-hidden="true">...</svg>, 24 px
 *   icon("beach", { size: 32 })          // 32 px
 *   atAGlance([
 *     { icon: "beach",    label: "Beach",    text: "About 20 minutes by car" },
 *     { icon: "hospital", label: "Hospital", text: "About 2 minutes by car" },
 *   ])                                   // a responsive grid, plain HTML string
 *   atAGlance(items, { title: "Myrtle Trace at a glance" })   // adds an h3 above the grid
 *
 * Command line: `node tools/icons.js` prints every icon name and its aliases.
 *
 * Rules the helpers keep:
 *   - Each icon is drawn on a 24 px grid with a currentColor stroke, so it takes
 *     the text color around it. It has no fill and no external request.
 *   - Icons are decoration: every one is aria-hidden. The words carry the meaning.
 *   - atAGlance escapes every label and text. Pass plain words, not HTML.
 *   - An unknown icon name throws, so a typo fails the build instead of shipping a blank.
 */

/* Each icon: `d` is one path (several subpaths), `c` is a list of circles [cx, cy, r]. */
const ICONS = {
  pool: { d: "M9 15V5a2 2 0 0 0-2-2M15 15V5a2 2 0 0 0-2-2M9 7h6M9 11h6M2 18c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0M2 21.5c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0" },
  "indoor-pool": { d: "M2 10 12 3l10 7M4.5 9v12M19.5 9v12M7.5 15c.8.7 1.7.7 2.5 0s1.7-.7 2.5 0 1.7.7 2.5 0M7.5 18.5c.8.7 1.7.7 2.5 0s1.7-.7 2.5 0 1.7.7 2.5 0" },
  clubhouse: { d: "M3 21h18M5 21V11l7-5 7 5v10M10 21v-5h4v5M12 6V2l3.5 1.3L12 4.6" },
  fitness: { d: "M4.5 9.5v5M7.5 7v10M16.5 7v10M19.5 9.5v5M7.5 12h9M2.5 12h2M19.5 12h2" },
  tennis: { d: "M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8", c: [[12, 12, 9]] },
  pickleball: { d: "M7 2.5h4a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3zM8 13.5v6a1 1 0 0 0 2 0v-6M16.8 17.2h.01M19.2 17.6h.01M17.9 19.6h.01", c: [[18, 18, 3.6]] },
  bocce: { d: "M2 21.5h20", c: [[7.5, 15.5, 4.5], [17, 17, 3], [15, 8, 1.5]] },
  "golf-cart": { d: "M4 4h12M6 4v8M14 4v8M5 17.5H3V12h12l3-4h1.5L21 13v4.5h-2M9 17.5h6", c: [[7, 17.5, 2], [17, 17.5, 2]] },
  beach: { d: "M3 10a9 7 0 0 1 18 0zM12 10v10M2 21c3-1.5 6-1.5 10 0s7 1.5 10 0" },
  hospital: { d: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 7.5v9M7.5 12h9" },
  grocery: { d: "M2.5 4H5l2.2 10.5h10.3L19.6 7H6", c: [[9, 19, 1.6], [16.5, 19, 1.6]] },
  airport: { d: "M16 10h4a2 2 0 0 1 0 4h-4l-4 7H9l2-7H7l-2 2H3l2-4-2-4h2l2 2h4L9 3h3z" },
  pets: { d: "M12 13c-2.5 0-5 2.6-5 5 0 1.6 1.2 2.5 2.6 2.5.9 0 1.6-.5 2.4-.5s1.5.5 2.4.5c1.4 0 2.6-.9 2.6-2.5 0-2.4-2.5-5-5-5z", c: [[5.3, 11, 1.8], [9, 6.3, 1.8], [15, 6.3, 1.8], [18.7, 11, 1.8]] },
  family: { d: "M2.5 20.5v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16 14.5h1a4 4 0 0 1 4 4v2", c: [[8.5, 7, 3.2], [17, 8.8, 2.5]] },
  lawn: { d: "M3 16v-4a1 1 0 0 1 1-1h10.5l2 5M14.5 11l4-7H21M8.5 17.5h4M2 21.5h20", c: [[6.5, 17.5, 2], [14.5, 17.5, 2]] },
  gate: { d: "M4 21V4M20 21V4M3 4h2M19 4h2M4 8q8-3.5 16 0M8 6.9V21M12 6.3V21M16 6.9V21M4 17h16" },
  calendar: { d: "M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" },
  cards: { d: "M5.5 7h8A1.5 1.5 0 0 1 15 8.5v11a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 19.5v-11A1.5 1.5 0 0 1 5.5 7zM8 7V4.5A1.5 1.5 0 0 1 9.5 3h9A1.5 1.5 0 0 1 20 4.5v11a1.5 1.5 0 0 1-1.5 1.5H15M9.5 17.5l-2.3-2.4a1.4 1.4 0 0 1 2.3-1.6 1.4 1.4 0 0 1 2.3 1.6z" },
  pond: { d: "M2 9.5c2.6-3.3 7.4-4 11 0-3.6 4-8.4 3.3-11 0zM13 9.5l5-3.5v7zM5.5 9h.01M2 17c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0M2 20.5c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0" },
  trail: { d: "M12.6 7.6 11 14l-2.6 7M11 14l3.4 3 .6 4M12.4 9l-3.4 2.6M12.4 9l3 2.6 2.6.4", c: [[13.4, 4.4, 2]] },
  dock: { d: "M12 3v13M12 3l7 11h-7M10 6l-5 8h5M3 16h18l-2 4H5z" },
  home: { d: "M3 11.5 12 3.5l9 8M5.5 10v10.5h13V10M10 20.5V15h4v5.5" },
  dollar: { d: "M15 9.4c-.4-1-1.5-1.8-3-1.8-1.8 0-3 1-3 2.2 0 3 6 1.6 6 4.4 0 1.3-1.3 2.2-3 2.2-1.6 0-2.7-.7-3.1-1.8M12 5.8v1.8M12 16.4v1.8", c: [[12, 12, 9]] },
  flood: { d: "M4 11.5 12 4.5l8 7M6.5 10v4.5M17.5 10v4.5M2 17c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0M2 20.5c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0" },
  storm: { d: "M3 8.5h10.5a3 3 0 1 0-3-3M3 12.5h15a3 3 0 1 1-3 3M3 16.5h6" },
  tax: { d: "M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M9 17l6-6", c: [[9.5, 11.5, 1], [14.5, 16.5, 1]] },
  key: { d: "M10.8 12.2 20 3M16.8 6.2l2.5 2.5M14.3 8.7l2 2", c: [[7.5, 15.5, 4.5]] },
  shopping: { d: "M6 8h12l-1 12.1a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9zM9 10V6.5a3 3 0 0 1 6 0V10" },
  town: { d: "M3 21h18M5 21V9.5l5-3V21M10 21V4h9v17M13 8h3M13 12h3M13 16h3M7.5 13h.01M7.5 16.5h.01" },
  golf: { d: "M8 21V3l9 4-9 4M4 21h8" },
  pin: { d: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z", c: [[12, 9.5, 2.5]] },
};

/* Other words a spec may use for the same icon. */
const ALIASES = {
  "swimming-pool": "pool", "indoor": "indoor-pool", "indoorpool": "indoor-pool",
  "gym": "fitness", "exercise": "fitness", "golfcart": "golf-cart", "cart": "golf-cart",
  "dog": "pets", "dogs": "pets", "pet": "pets", "guests": "family", "people": "family",
  "lawn-care": "lawn", "mowing": "lawn", "events": "calendar", "card-games": "cards", "games": "cards",
  "fishing": "pond", "fishing-pond": "pond", "walking": "trail", "walking-trail": "trail",
  "boat": "dock", "marina": "dock", "house": "home", "money": "dollar", "price": "dollar",
  "water": "flood", "wind": "storm", "hurricane": "storm", "taxes": "tax", "keys": "key",
  "shop": "shopping", "store": "shopping", "mall": "shopping", "city": "town", "doctor": "hospital",
  "food": "grocery", "groceries": "grocery", "plane": "airport", "ocean": "beach",
};

const ICON_NAMES = Object.keys(ICONS);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function resolve(name) {
  const k = String(name || "").trim().toLowerCase().replace(/[\s_/]+/g, "-");
  const key = ICONS[k] ? k : ALIASES[k];
  if (!key) throw new Error(`icons.js: no icon named "${name}". Names: ${ICON_NAMES.join(", ")}`);
  return key;
}

/* The inner markup of an icon (no <svg> wrapper), for use inside another SVG such as the area map. */
function iconInner(name) {
  const ic = ICONS[resolve(name)];
  return `<path d="${ic.d}"/>` + (ic.c || []).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("");
}

/* A standalone inline icon. Options: size (px, default 24), stroke (default 1.75), style (extra inline CSS). */
function icon(name, opts = {}) {
  const size = opts.size || 24, sw = opts.stroke || 1.75;
  const style = opts.style ? ` style="${esc(opts.style)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${style}>${iconInner(name)}</svg>`;
}

/*
 * "At a glance": a grid of cards, each an icon, a short label and one plain line.
 * Items: [{ icon, label, text }].
 * Options:
 *   title  an h3 above the grid (plain text).
 *   bg     the card fill, "ivory-2" (default) or "ivory". Use the opposite of the section
 *          the grid sits in, as h.cta does (BRAND: Ivory 2 is the card fill).
 *   min    the card's least width, default "8.5rem". On a 360 px phone that gives two cards
 *          a row; at 760 px, four or five.
 * Weights stay at 400 and 500: the site self-hosts DM Sans 300 to 500 only.
 */
function atAGlance(items, opts = {}) {
  if (!Array.isArray(items) || !items.length) throw new Error("atAGlance needs a list of { icon, label, text }");
  const bg = opts.bg === "ivory" ? "ivory" : "ivory-2", dot = bg === "ivory" ? "ivory-2" : "ivory";
  const min = /^[0-9.]+(rem|px|em)$/.test(opts.min || "") ? opts.min : "8.5rem";
  const cards = items.map((it) => {
    if (!it || !it.label) throw new Error("atAGlance item needs a label");
    return `<li style="background:var(--${bg});border-top:3px solid var(--brass);padding:.9rem .85rem 1rem;margin:0">`
      + `<span style="display:flex;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--${dot});color:var(--brass-ink);align-items:center;justify-content:center;margin-bottom:.6rem">${icon(it.icon, { size: 24 })}</span>`
      + `<strong style="display:block;color:var(--navy);font-size:1rem;font-weight:500;line-height:1.3;margin-bottom:.25rem">${esc(it.label)}</strong>`
      + (it.text ? `<span style="display:block;color:var(--muted);font-size:.9rem;line-height:1.5">${esc(it.text)}</span>` : "")
      + `</li>`;
  }).join("");
  const title = opts.title ? `<h3 style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .8rem">${esc(opts.title)}</h3>` : "";
  return `${title}<ul role="list" style="list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(${min},1fr));gap:.75rem;max-width:760px">${cards}</ul>`;
}

module.exports = { ICONS, ALIASES, ICON_NAMES, icon, iconInner, atAGlance, resolveIcon: resolve, esc };

if (require.main === module) {
  for (const n of ICON_NAMES) {
    const al = Object.keys(ALIASES).filter((a) => ALIASES[a] === n);
    console.log(n + (al.length ? `  (also: ${al.join(", ")})` : ""));
  }
}
