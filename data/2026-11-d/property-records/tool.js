/* The property lookup, as one module for the four property-records specs (hub, GIS map, deeds, tax bill).
 * Each spec calls tool({ live, ... }) and gets back { css, html, cfg }: the tool's CSS (.pr-*), the markup
 * and the script (lookup-core.js and lookup-ui.js, as they are, minus comments). Nothing in the tool's look
 * or code is written in a spec any more. The hub's page is the same as before.
 *   css   goes in a <style> at the top of the page's hero media or first section
 *   html  is the box, the card and the script
 * Options: live(url) says whether a sibling page is built; self is the page's own url (its #zoning link
 * stays on the page); extra is added to the config (a page can switch a link on or off). */
const fs = require("fs"), path = require("path");

const CORE = fs.readFileSync(path.join(__dirname, "lookup-core.js"), "utf8");
const UI = fs.readFileSync(path.join(__dirname, "lookup-ui.js"), "utf8");
if (/<\/script|<!--/i.test(CORE + UI)) throw new Error("tool.js: the lookup's code must not close the script tag");
/* In the page: the same code without its comments and indentation (the test runs the commented file). */
const slim = (js) => js.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.trim()).filter(Boolean).join("\n");

const S = "main#main";
const CARD = "border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(255,255,255,.64));border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px -24px rgba(28,32,40,.45)";

/* The tool card and everything in it. */
const CSS = ""
  + `${S} .pr-tool{${CARD};padding:1.1rem 1.1rem 1.15rem;box-sizing:border-box;font-family:var(--sans)}`
  + `${S} .pr-form{display:grid;grid-template-columns:1fr;gap:.6rem;margin:0}`
  + `@media (min-width:600px){${S} .pr-form{grid-template-columns:minmax(0,1fr) auto}}`
  + `${S} .pr-box{position:relative;min-width:0}`
  + `${S} .pr-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  + `${S} #prQ{display:block;width:100%;box-sizing:border-box;min-height:56px;margin:0;padding:.8rem 1rem;font-family:var(--sans);font-size:1.125rem;color:var(--navy);background:#fff;border:1px solid rgba(28,32,40,.3);border-radius:12px;-webkit-appearance:none;appearance:none}`
  + `${S} #prQ:focus{outline:3px solid rgba(196,120,58,.45);outline-offset:1px;border-color:var(--brass)}`
  + `${S} #prQ::placeholder{color:#6b7080}`
  + `${S} .pr-form .btn{min-height:56px;width:100%;justify-content:center;margin:0;font-size:1.0625rem}`
  + `@media (min-width:600px){${S} .pr-form .btn{width:auto;padding-left:1.6rem;padding-right:1.6rem}}`
  + `${S} #prSug{position:absolute;left:0;right:0;top:100%;z-index:30;margin:.3rem 0 0;padding:.3rem 0;list-style:none;background:#fff;border:1px solid rgba(28,32,40,.18);border-radius:12px;box-shadow:0 18px 40px -20px rgba(28,32,40,.5)}`
  + `${S} #prSug[hidden]{display:none}`
  + `${S} .pr-opt{margin:0;padding:.75rem 1rem;cursor:pointer;font-size:1.0625rem;line-height:1.35;color:var(--navy)}`
  + `${S} .pr-opt[aria-selected=true],${S} .pr-opt:hover{background:rgba(196,120,58,.12)}`
  + `${S} .pr-info,${S} .pr-note{font-size:1rem;color:var(--muted);line-height:1.5;margin:.75rem 0 0}`
  + `${S} .pr-try{background:none;border:0;padding:0;margin:0;font:inherit;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;cursor:pointer}`
  + `${S} #prOut{margin-top:1rem;border-top:2px solid var(--navy)}${S} #prOut[hidden]{display:none}`
  + `${S} .pr-dl{margin:0}`
  + `${S} .pr-r{display:grid;grid-template-columns:6.4rem minmax(0,1fr);column-gap:.9rem;padding:.8rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .pr-r dt{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:.3rem}`
  + `${S} .pr-r dd{margin:0;min-width:0;font-size:1.125rem;line-height:1.5;color:var(--navy)}`
  + `${S} .pr-v{display:block}${S} .pr-more{display:block;font-size:1rem;color:var(--muted);margin-top:.3rem;line-height:1.5}`
  + `${S} .pr-r dd a{color:var(--navy);text-decoration:underline;text-underline-offset:.18em}`
  + `@media (max-width:420px){${S} .pr-r{grid-template-columns:1fr;row-gap:.15rem}${S} .pr-r dt{padding-top:0}}`
  + `${S} .pr-load{display:block;height:4px;width:60%;margin:.7rem 0 .5rem;border-radius:2px;background:linear-gradient(90deg,rgba(196,120,58,.12),rgba(196,120,58,.55),rgba(196,120,58,.12));background-size:200% 100%;animation:prl 1.2s linear infinite}`
  + `@keyframes prl{from{background-position:200% 0}to{background-position:0 0}}@media (prefers-reduced-motion:reduce){${S} .pr-load{animation:none}}`
  + `${S} .pr-btns{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.1rem}`
  + `${S} .pr-r dd a.pr-b{text-decoration:none!important;display:inline-flex;align-items:center;min-height:44px;padding:.45rem 1rem;box-sizing:border-box;border-radius:999px;border:1px solid rgba(28,32,40,.28);background:#fff;font-weight:600;font-size:1rem;text-decoration:none;line-height:1.3}`
  + `${S} .pr-r dd a.pr-b:hover{border-color:var(--navy)}`
  + `${S} .pr-copy{margin-left:.4rem;min-height:36px;padding:.2rem .8rem;border-radius:999px;border:1px solid rgba(28,32,40,.28);background:#fff;color:var(--navy);font:600 .9rem var(--sans);cursor:pointer;vertical-align:.1rem}`
  + `${S} .pr-offer{margin-top:1rem;padding:1rem 1.05rem;border-radius:14px;background:rgba(196,120,58,.1)}`
  + `${S} .pr-offer p{margin:0 0 .75rem;color:var(--navy);font-weight:600;font-size:1.0625rem;line-height:1.45}${S} .pr-offer .btn{min-height:48px}`
  ;

const SELF = "/buyers/property-records/";
const DEEDS = SELF + "deeds/", GISP = SELF + "gis-map/", TAXP = SELF + "tax-bill/";
const FLOODP = "/buyers/flood-zone-check/";
const TRY = "1301 Second Ave, Conway";
/* A one-line lead-in under the H1 on a task page: what this page's reader gets from the box. */
const LEAD_CSS = `${S} .pr-lead{margin:.9rem 0 .7rem;max-width:720px;font-size:1.125rem;line-height:1.5;font-weight:600;color:var(--navy)}`;

/* The hero, as the hub has it: H1, byline, sub, then the tool. A task page that puts the tool in its hero
   media needs the same rules (opts.hero). */
const HERO_CSS = `${S} .detail-hero .wrap{display:flex;flex-direction:column}${S} .detail-hero .detail-media{order:9;width:100%;max-width:720px!important;margin:.4rem 0 0!important}`;

/** The tool for one page. opts: live(url), self (the page's own url), leadIn (text), hero (add the hero rules), extra (config). */
function tool(opts) {
  const o = opts || {}, live = o.live || (() => false), self = o.self || SELF;
  const cfg = {
    lead: "/contact/",
    deedLayer: true, /* PLAN open question 1 (owner to approve): PIN, DeedBook, DeedPage and Acreage only. false opens the deed search instead. */
    floodGuide: live(FLOODP) ? FLOODP : "",
    flooded: "/buyers/undisclosed-flooding/",
    zoningGuide: live(GISP) ? (self === GISP ? "#zoning" : GISP + "#zoning") : "",
    /* The example address is the courthouse, which is tax-exempt, so its Tax bill button finds no bill (VERIFY 15).
       The card says so, so the demo does not look broken. */
    tax: "/api/tax", /* functions/api/tax.js: the Treasurer's bills for the parcel, no names (owner, 2026-11-14) */
    taxGuide: "/buyers/property-taxes/",
    lastSale: "/api/lastsale", /* functions/api/lastsale.js: the deed index's record for the parcel's book and page, no names (owner, 2026-11-14) */
    noBill: { "36800000016": "The courthouse is tax-exempt, so the tax search finds no bill for it." },
    ...(o.extra || {}),
  };
  const TRYQ = TRY;
  const html = `<div class="pr-tool" id="lookup">`
    + `<form class="pr-form" id="prForm" role="search" action="https://www.horrycountysc.gov/gis/parcels" autocomplete="off">`
    + `<div class="pr-box"><label class="pr-lbl" for="prQ">Address in Horry County</label>`
    + `<input id="prQ" name="q" type="text" inputmode="search" enterkeyhint="search" spellcheck="false" placeholder="Type an address" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="prSug">`
    + `<ul id="prSug" role="listbox" aria-label="Matching addresses" hidden></ul></div>`
    + `<button type="submit" class="btn btn-brass">Look it up</button></form>`
    + `<div id="prOut" aria-live="polite" hidden></div>`
    + `<div class="pr-foot"><p class="pr-info"><button type="button" class="pr-try" id="prTry" data-q="${TRYQ}">Try ${TRYQ}</button></p></div>`
    + `<noscript><p class="pr-note">The lookup needs JavaScript. The county's own map is at horrycountysc.gov/gis/parcels.</p></noscript>`
    + `</div>`
    + `<script>(function(){window.PR_CFG=${JSON.stringify(cfg)};\n${slim(CORE)}\n${slim(UI)}\n})();</script>`;
  const lead = o.leadIn ? `<div><p class="pr-lead">${o.leadIn}</p></div>` : "";
  return { css: (o.hero ? HERO_CSS : "") + CSS + (o.leadIn ? LEAD_CSS : ""), html: lead + html, cfg };
}

module.exports = { tool, CSS, CARD, S, TRY, DEEDS, GISP, TAXP, FLOODP };
