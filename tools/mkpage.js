#!/usr/bin/env node
/*
 * mkpage.js - build a new article page from a spec, cloning the chrome of a
 * donor page byte for byte (PLAYBOOK A22) and rewriting every identity field
 * (A23). Usage:
 *
 *   node tools/mkpage.js specs/out-of-state.js
 *
 * The spec is a CommonJS module exporting the fields listed in `REQUIRED`.
 * Section bodies are HTML strings; build them with the helpers exported as
 * `h` so every paragraph, table and CTA box carries the site's inline styles.
 *
 * Self-checks, all fatal:
 *   - no donor identity string survives in the output
 *   - the chrome outside <main> and outside the identity elements is byte
 *     identical to the donor
 *   - title and description lengths (A24), hero sub word count (A14)
 *   - every FAQ question and answer in the schema is the visible text
 *
 * Why this exists: the five investor tax pages were hand-cloned and every one
 * kept the donor's BreadcrumbList and WebPage ids (str-rules). A generator
 * that rewrites the identity as one operation cannot leave half of it behind.
 */
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..", "chapter3realty");
const DONOR = path.join(ROOT, "invest", "14-day-rule", "index.html");
const SITE = "https://chapter3realty.com";

/* Strings that identify the donor page. The content phrases may not survive
   anywhere; the path tokens may not survive in the head (a body link to the
   donor page is legitimate). */
const DONOR_TOKENS = ["Your own stays, counted", "Owner-use limits are written", "Condo You Use", "using your own beach condo", "Personal use of more than 14 days"];
const DONOR_HEAD_TOKENS = ["14-day-rule"];

const REQUIRED = ["url", "title", "description", "ogTitle", "crumb", "eyebrow", "h1", "h1em", "sub",
  "heroCta", "author", "shortAnswer", "sections", "faqTitle", "faq", "sources", "bottomCta", "keywords", "about"];

const esc = (s) => String(s).replace(/&(?!(?:amp|lt|gt|quot|#\d+|#x[0-9a-f]+|[a-z]+);)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const todayISO = () => { const d = new Date(); return d.toISOString().slice(0, 10); };
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${d}, ${y}`; };

/* ---------- markup helpers (the donor's exact inline styles) ---------- */
const P = 'style="color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem"';
const H2 = 'style="font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;line-height:1.3"';
const H3 = 'style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem"';
const TH = 'style="padding:.55rem .8rem;border-bottom:2px solid var(--navy);color:var(--navy);text-align:left;font-family:var(--sans);font-size:.8rem;letter-spacing:.04em;text-transform:uppercase"';
const TD = 'style="padding:.55rem .8rem;border-bottom:1px solid var(--rule);color:var(--muted)"';
const LINK = 'style="color:var(--navy);text-decoration:underline"';
const EXT = 'style="color:var(--navy);text-decoration:underline" target="_blank" rel="noopener noreferrer"';

const h = {
  p: (html) => `<p ${P}>${html}</p>`,
  h3: (text) => `<h3 ${H3}>${text}</h3>`,
  a: (href, text) => `<a href="${href}" ${LINK}>${text}</a>`,
  ext: (href, text) => `<a href="${href}" ${EXT}>${text}</a>`,
  ol: (items) => `<ol style="color:var(--muted);line-height:1.75;max-width:720px;margin:0 0 1rem 1.3rem;padding:0">${items.map(i => `<li style="margin-bottom:.5rem">${i}</li>`).join("")}</ol>`,
  ul: (items) => `<ul style="color:var(--muted);line-height:1.75;max-width:720px;margin:0 0 1rem 1.3rem;padding:0">${items.map(i => `<li style="margin-bottom:.5rem">${i}</li>`).join("")}</ul>`,
  table: (head, rows) => `<div style="overflow-x:auto;margin:1.2rem 0;max-width:760px"><table style="width:100%;border-collapse:collapse;font-size:.92rem"><thead><tr>${head.map(c => `<th ${TH}>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td ${TD}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
  /* A CTA box inside a section. `bg` is the box background, the opposite of the
     section it sits in (ivory box on an ivory-2 section and the reverse). */
  cta: (title, text, label, href, bg) => `<div style="border-left:3px solid var(--brass);background:var(--${bg});padding:1.2rem 1.4rem;margin:1.8rem 0;max-width:720px"><p style="color:var(--navy);font-weight:600;margin-bottom:.4rem">${title}</p><p style="color:var(--muted);line-height:1.7;margin-bottom:.8rem">${text}</p><a class="btn btn-brass" href="${href}">${label}</a></div>`,
  /* Raw HTML pass-through for anything the helpers do not cover (a form). */
  raw: (html) => html,
};

const words = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").trim().split(/\s+/).filter(Boolean).length;

function build(spec) {
  for (const k of REQUIRED) if (spec[k] === undefined) throw new Error(`spec missing ${k}`);
  if (!/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/.test(spec.url)) throw new Error(`bad url ${spec.url}`);
  if (spec.title.length > 62) throw new Error(`title is ${spec.title.length} chars (max 62)`);
  if (spec.description.length < 110 || spec.description.length > 165) throw new Error(`description is ${spec.description.length} chars (110-165)`);
  const subWords = words(spec.sub);
  if (subWords < 8 || subWords > 30) throw new Error(`hero sub is ${subWords} words (8-30)`);
  if (/\?\s*$/.test(spec.sub)) throw new Error("hero sub must not be a question");
  if (!["tim", "devin"].includes(spec.author)) throw new Error("author must be tim or devin");
  if (!Array.isArray(spec.faq) || spec.faq.length < 3) throw new Error("at least three FAQ entries");
  for (const f of spec.faq) if (/[<>&]/.test(f.q + f.a)) throw new Error(`FAQ text must be plain characters, no tags or entities: ${f.q}`);

  const donor = fs.readFileSync(DONOR, "utf8");
  const mainStart = donor.indexOf("<main id=\"main\">"), mainEnd = donor.indexOf("</main>") + "</main>".length;
  if (mainStart < 0 || mainEnd < 7) throw new Error("donor main not found");
  let head = donor.slice(0, mainStart), tail = donor.slice(mainEnd);

  const url = SITE + spec.url, iso = spec.datePublished || todayISO(), shown = longDate(iso);
  const hub = spec.hub || { name: "Invest", url: "/invest/" };

  /* ---- head identity ---- */
  const rep = (re, val, what) => { if (!re.test(head)) throw new Error(`donor head lacks ${what}`); head = head.replace(re, val); };
  rep(/<title>[^<]*<\/title>/, `<title>${esc(spec.title)}</title>`, "title");
  rep(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(spec.description)}">`, "description");
  rep(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, "canonical");
  rep(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(spec.ogTitle)}">`, "og:title");
  rep(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(spec.description)}">`, "og:description");
  rep(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, "og:url");
  rep(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(spec.ogTitle)}">`, "twitter:title");
  rep(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(spec.description)}">`, "twitter:description");

  /* ---- JSON-LD: rebuild the four page-identity blocks, keep the rest ---- */
  const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
  const blocks = {
    BreadcrumbList: ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: hub.name, item: `${SITE}${hub.url}` },
      { "@type": "ListItem", position: 3, name: spec.crumb, item: url }] }),
    WebPage: ld({ "@context": "https://schema.org", "@type": "WebPage", author: { "@id": `${SITE}/about/#devin-day` }, "@id": `${url}#webpage`, url, name: spec.ogTitle, description: spec.description,
      isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#org` },
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}/og-image.jpg`, width: 1200, height: 630 },
      dateModified: iso, datePublished: iso, inLanguage: "en-US", breadcrumb: { "@id": `${url}#breadcrumb` },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] }, mainEntity: { "@id": `${url}#article` } }),
    Article: ld({ "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: spec.ogTitle, description: spec.description, url,
      author: { "@id": `${SITE}/#org` }, reviewedBy: { "@type": "Person", name: "Timothy Nash", alternateName: "Tim Nash", jobTitle: "Broker-in-Charge" },
      publisher: { "@id": `${SITE}/#org` }, datePublished: iso, dateModified: iso, inLanguage: "en-US", image: `${SITE}/og-image.jpg`,
      mainEntityOfPage: { "@id": url }, about: { "@type": "Thing", name: spec.about }, keywords: spec.keywords }),
    FAQPage: ld({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: spec.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }),
  };
  let seen = 0;
  head = head.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, body) => {
    let t; try { t = JSON.parse(body)["@type"]; } catch { return m; }
    if (blocks[t]) { seen++; return blocks[t]; }
    return m;
  });
  if (seen !== 4) throw new Error(`replaced ${seen} identity JSON-LD blocks, expected 4`);

  /* ---- main ---- */
  const byline = spec.author === "tim"
    ? `By <strong style="color:var(--navy);font-weight:600">Tim Nash</strong>, Broker-in-Charge, 30+ years on the Grand Strand &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &middot; <span style="white-space:nowrap">Updated ${shown}</span>`
    : `By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Tim Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${shown}</span>`;
  const bgs = ["ivory", "ivory-2"];
  let i = 0; const nextBg = () => bgs[i++ % 2];
  const parts = [];
  parts.push(`<main id="main"><div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="${hub.url}">${hub.name}</a><span>/</span><span style="color:var(--muted)">${spec.crumb}</span></div><p class="eyebrow" style="margin-bottom:1rem">${spec.eyebrow}</p><h1 class="detail-h1">${spec.h1}<br/><em style="font-style:italic;color:var(--brass)">${spec.h1em}</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">${byline}</p><p class="detail-sub">${spec.sub}</p><div style="margin-top:1.8rem"><a class="btn btn-brass btn-lg" href="${spec.heroCta.href}">${spec.heroCta.label}</a></div></div></div>`);
  parts.push(`<section style="background:var(--${nextBg()})"><div class="wrap"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">The short answer</p><p ${P}>${spec.shortAnswer}</p></div></section>`);
  for (const s of spec.sections) {
    const bg = nextBg();
    const body = typeof s.html === "function" ? s.html(bg === "ivory" ? "ivory-2" : "ivory") : s.html;
    parts.push(`<section style="background:var(--${bg})"${s.id ? ` id="${s.id}"` : ""}><div class="wrap">${s.h2 ? `<h2 ${H2}>${s.h2}</h2>` : ""}${body}</div></section>`);
  }
  const faqBg = nextBg();
  const srcLinks = spec.sources.map(x => `<a href="${x.href}" ${EXT}>${x.name}</a>`).join(", ");
  parts.push(`<section style="background:var(--${faqBg})"><div class="wrap"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">Common questions</p><h2 ${H2}>${spec.faqTitle}</h2>${spec.faq.map(f => `<h3 ${H3}>${f.q}</h3><p ${P}>${f.a}</p>`).join("")}<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${srcLinks}. Read ${shown}. ${spec.sourcesNote || "Educational only, not legal or tax advice."}</p></div></section>`);
  parts.push(`<section style="background:var(--navy);padding:3rem 0"><div class="wrap" style="text-align:center;max-width:720px;margin:0 auto"><h2 style="font-family:var(--serif);font-size:1.7rem;color:var(--ivory);margin-bottom:1rem">${spec.bottomCta.h2}</h2><p style="color:rgba(244,239,232,.75);line-height:1.7;margin-bottom:1.6rem">${spec.bottomCta.p}</p><a class="btn btn-brass btn-lg" href="${spec.bottomCta.href}">${spec.bottomCta.label}</a></div></section></main>`);
  const main = parts.join("");
  const out = head + main + tail;

  /* ---- self-checks ---- */
  for (const t of DONOR_TOKENS) if (out.includes(t)) throw new Error(`donor identity survived: "${t}"`);
  const strip = (html) => html.replace(/<main id="main">[\s\S]*<\/main>/, "").replace(/<title>[^<]*<\/title>/, "").replace(/<meta (?:name|property)="(?:description|og:title|og:description|og:url|twitter:title|twitter:description)" content="[^"]*">/g, "").replace(/<link rel="canonical" href="[^"]*">/, "").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (m) => { try { const t = JSON.parse(m.slice(35, -9))["@type"]; return blocks[t] ? "" : m; } catch { return m; } });
  const donorChrome = strip(donor);
  /* Completeness of the identity list: once the identity elements are removed
     from the donor, nothing left may still name the donor page. If this fires,
     the donor gained an identity element this script does not rewrite. */
  for (const t of DONOR_HEAD_TOKENS) if (donorChrome.includes(t)) throw new Error(`donor chrome still names the donor ("${t}") - an identity element is not on the rewrite list`);
  if (strip(out) !== donorChrome) throw new Error("chrome differs from donor outside the identity elements");
  const sourceWords = words(srcLinks) + words(`Read ${shown}. ${spec.sourcesNote || ""}`);
  if (sourceWords > 90) throw new Error(`sources line is ${sourceWords} words (max 90)`);

  const file = path.join(ROOT, ...spec.url.split("/").filter(Boolean), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  return { file, bytes: out.length, subWords, mainWords: words(main) };
}

/* Exported before the CLI block runs: a spec requires this module for the
   helpers while this module is requiring the spec. */
module.exports = { build, h };

if (require.main === module) {
  const specPath = process.argv[2];
  if (!specPath) { console.error("usage: node tools/mkpage.js <spec.js>"); process.exit(1); }
  const spec = require(path.resolve(specPath));
  const r = build(spec);
  console.log(`wrote ${path.relative(process.cwd(), r.file)} (${r.bytes} bytes, hero sub ${r.subWords} words, main ${r.mainWords} words)`);
}
