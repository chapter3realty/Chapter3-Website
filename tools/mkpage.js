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
  /* A figure: an <img> or an inline <svg role="img" aria-label="..."> with a visible caption.
     Answer engines and image search read the caption and the alt text; readers read the picture.
     Build any chart from the data file at generation time (PLAYBOOK A29c), never from typed values. */
  figure: (media, caption) => {
    if (!/<img [^>]*alt="[^"]{12,}"|<svg [^>]*role="img"[^>]*aria-label="[^"]{12,}"/.test(media)) throw new Error(`figure needs an img with alt text or an svg with role="img" and an aria-label: ${caption}`);
    return `<figure style="margin:1.8rem 0;max-width:760px">${media}<figcaption style="color:var(--muted);font-size:.85rem;line-height:1.6;margin-top:.6rem">${caption}</figcaption></figure>`;
  },
  /* Raw HTML pass-through for anything the helpers do not cover (a form). */
  raw: (html) => html,
};

const words = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").trim().split(/\s+/).filter(Boolean).length;

function build(spec) {
  for (const k of REQUIRED) if (spec[k] === undefined) throw new Error(`spec missing ${k}`);
  if (!/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/.test(spec.url)) throw new Error(`bad url ${spec.url}`);
  if (spec.title.length > 62) throw new Error(`title is ${spec.title.length} chars (max 62)`);
  /* Owner rules 2026-09-07: every H1 names a place on the Grand Strand; no headline, sub or CTA label offers financing (Chapter3 is a brokerage). */
  { const LOCAL = /\b(?:Myrtle Beach|Horry|Grand Strand|South Carolina|Conway|Surfside|Murrells Inlet|Pawleys|Georgetown|Carolina Forest|Little River|Longs|Garden City|Litchfield|Socastee|Loris|Aynor|Cherry Grove|Coastal Carolina|Market Common|Waccamaw|Grande Dunes|Barefoot|Intracoastal|Briarcliffe|Burgess|Forestbrook)\b/i;
    if (!LOCAL.test(spec.h1)) throw new Error(`H1 names no place on the Grand Strand: "${spec.h1}" (owner rule 2026-09-07: every headline is local)`);
    const LEND = /^\s*(?:finance|financing|refinanc\w*|get (?:a |your )?(?:loan|mortgage|financing|pre-?approv\w*))\b|\b(?:we |chapter\s*3 )?(?:finance|financing|refinance) (?:your|the next|multiple|more|another)\b|\bwe (?:can )?(?:finance|lend|refinance)\b/i;
    const heads = [["title", spec.title], ["h1", spec.h1], ["sub", spec.sub], ["heroCta", spec.heroCta && spec.heroCta.label || ""], ["bottomCta", spec.bottomCta && spec.bottomCta.label || ""]];
    for (const [k, v] of heads) if (LEND.test(v)) throw new Error(`${k} reads as an offer to finance: "${v}" (owner rule 2026-09-07: Chapter3 is a brokerage, never a lender)`); }
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

  /* datePublished is set once. A spec without one used to get today's date on every rebuild, so
     regenerating a page moved its publication date (found 2026-10-04: 20 of 23 specs had none).
     The page already on disk wins, the same rule data/relocating/assemble-page.js follows. */
  const onDisk = path.join(ROOT, ...spec.url.split("/").filter(Boolean), "index.html");
  const prevPub = fs.existsSync(onDisk) ? (fs.readFileSync(onDisk, "utf8").match(/"datePublished":\s*"(\d{4}-\d{2}-\d{2})"/) || [])[1] : null;
  const url = SITE + spec.url, iso = spec.datePublished || prevPub || todayISO(), shown = longDate(iso);
  /* The Article's author is the person in the byline, not the company. Formal name in
     schema, Tim Nash as alternateName (owner instruction 2026-09-03). */
  const PEOPLE = {
    devin: { "@type": "Person", "@id": `${SITE}/about/#devin-day`, name: "Devin Day", jobTitle: "Operations Officer", url: `${SITE}/about/`, worksFor: { "@id": `${SITE}/#org` } },
    tim: { "@type": "Person", "@id": `${SITE}/about/#timmy-nash`, name: "Timothy Nash", alternateName: "Tim Nash", jobTitle: "Broker-in-Charge", url: `${SITE}/about/`, worksFor: { "@id": `${SITE}/#org` } },
  };
  const authorPerson = PEOPLE[spec.author], reviewerPerson = PEOPLE[spec.author === "tim" ? "devin" : "tim"];
  /* Optional spec.pageImages: the page's own hero photo as ImageObjects in 1x1, 4x3 and 16x9
     (Blog-Brain tools/photos.js pageImages), or a function that returns them, called here,
     after the sections are built. Google, Article: "provide multiple high-resolution images
     ... 16x9, 4x3, and 1x1". Google Images: avoid "an image with text in the schema.org
     markup", which the share card is. They go in Article.image, and the 4x3 one in
     WebPage.primaryImageOfPage, and the 16x9 one in og:image and twitter:image (below). */
  const pageImages = typeof spec.pageImages === "function" ? spec.pageImages() : spec.pageImages;
  if (pageImages !== undefined) {
    if (!Array.isArray(pageImages) || !pageImages.length) throw new Error("pageImages must be a list of ImageObjects");
    for (const im of pageImages) {
      const u = im && (im.contentUrl || im.url);
      if (!im || im["@type"] !== "ImageObject" || !String(u || "").startsWith(`${SITE}/`) || !(im.width * im.height >= 50000))
        throw new Error(`pageImages: each entry is an ImageObject on ${SITE} with width and height (50,000 pixels or more): ${JSON.stringify(im).slice(0, 120)}`);
    }
  }
  /* Share image (og:image, twitter:image). A page with pageImages shares its hero photo: the
     16x9 crop, 1200 px wide, with its own size and alt text (the alt the hero is shown with).
     Google Images: avoid "an image with text in the schema.org markup or og:image meta tag".
     The text card is for pages with no photo.
     Otherwise the page's own card from Blog-Brain tools/ogcard.js when it exists
     (og/<slug>.jpg), else the sitewide default. Google: "avoid using a generic image". */
  const ogSlug = spec.url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  const share = !spec.ogImage && pageImages ? pageImages.find((im) => Math.abs(im.width / im.height - 16 / 9) < 0.01 && im.width >= 1200) : null;
  if (!spec.ogImage && pageImages && !share) throw new Error("pageImages has no 16x9 image 1200 px wide for og:image");
  const ogImage = spec.ogImage || (share ? (share.contentUrl || share.url) : fs.existsSync(path.join(ROOT, "og", `${ogSlug}.jpg`)) ? `${SITE}/og/${ogSlug}.jpg` : `${SITE}/og-image.jpg`);
  const ogW = share ? share.width : 1200, ogH = share ? share.height : 630;
  const ogAlt = spec.ogImageAlt || (share && share.description) || `${spec.h1} ${spec.h1em}`.replace(/<[^>]+>/g, "").trim();
  const primaryImage = pageImages
    ? (({ "@type": t, contentUrl, url: u, width, height }) => ({ "@type": t, url: u || contentUrl, contentUrl: contentUrl || u, width, height }))(pageImages.find((im) => Math.abs(im.width / im.height - 4 / 3) < 0.01) || pageImages[0])
    : { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 };
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
  rep(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${ogImage}">`, "og:image");
  rep(/<meta property="og:image:width" content="[^"]*">/, `<meta property="og:image:width" content="${ogW}">`, "og:image:width");
  rep(/<meta property="og:image:height" content="[^"]*">/, `<meta property="og:image:height" content="${ogH}">`, "og:image:height");
  rep(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(ogAlt)}">`, "og:image:alt");
  rep(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${ogImage}">`, "twitter:image");
  rep(/<meta name="twitter:image:alt" content="[^"]*">/, `<meta name="twitter:image:alt" content="${esc(ogAlt)}">`, "twitter:image:alt");

  /* ---- JSON-LD: rebuild the four page-identity blocks, keep the rest ---- */
  const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
  const blocks = {
    BreadcrumbList: ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: hub.name, item: `${SITE}${hub.url}` },
      { "@type": "ListItem", position: 3, name: spec.crumb, item: url }] }),
    WebPage: ld({ "@context": "https://schema.org", "@type": "WebPage", author: { "@id": authorPerson["@id"] }, "@id": `${url}#webpage`, url, name: spec.ogTitle, description: spec.description,
      isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#org` },
      primaryImageOfPage: primaryImage,
      dateModified: iso, datePublished: iso, inLanguage: "en-US", breadcrumb: { "@id": `${url}#breadcrumb` },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] }, mainEntity: { "@id": `${url}#article` } }),
    Article: ld({ "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: spec.ogTitle, description: spec.description, url,
      author: authorPerson, reviewedBy: reviewerPerson,
      publisher: { "@id": `${SITE}/#org` }, datePublished: iso, dateModified: iso, inLanguage: "en-US", image: pageImages || ogImage,
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
  /* Owner rules: his name is in the byline only, with the title Operations Officer and
   * nothing after it; never his NMLS number, never a licensed-loan-originator claim
   * (2026-09-06, 2026-09-07; PLAYBOOK A17, A20a). */
  const NAME = (n) => `<strong style="color:var(--navy);font-weight:600">${n}</strong>`;
  const byline = spec.author === "devin"
    ? `By ${NAME("Devin Day")}, Operations Officer &middot; Reviewed by ${NAME("Tim Nash")}, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${shown}</span>`
    : `By ${NAME("Tim Nash")}, Broker-in-Charge, 30+ years on the Grand Strand &middot; Reviewed by ${NAME("Devin Day")}, Operations Officer &middot; <span style="white-space:nowrap">Updated ${shown}</span>`;
  /* Optional spec.heroMedia: a small picture or icon row right under the H1, so a phone's
     first screen shows one (Blog-Brain STANDARD P7, PLAIN-4). Under the sub line it fell
     below a 390 x 844 screen on pages with a long H1. The spec keeps it compact. */
  const heroMedia = spec.heroMedia ? `<div class="detail-media" style="margin:0 0 1.2rem;max-width:760px">${spec.heroMedia}</div>` : "";
  const bgs = ["ivory", "ivory-2"];
  let i = 0; const nextBg = () => bgs[i++ % 2];
  const saBg = nextBg();
  const secs = spec.sections.map((s) => { const bg = nextBg(); return { s, bg, body: typeof s.html === "function" ? s.html(bg === "ivory" ? "ivory-2" : "ivory") : s.html }; });
  const faqBg = nextBg();
  /* "On this page" (Blog-Brain playbook, 2026-10-11): a plain list of links to every H2
     section, the FAQ included, each label the H2's own text, not sticky, under the short
     answer on a page with 5 or more H2s. spec.toc = false leaves it out; spec.toc = true
     keeps it on a shorter page. Every H2 section gets an id: the spec's own, else one made
     from the H2 text that no other element on the page uses. */
  const plain = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const slug = (html) => plain(html).replace(/&(?:#39|#x27|rsquo|apos);|['\u2019]/gi, "").replace(/&[a-z#0-9]+;/gi, " ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const cut = (t) => (t.length <= 60 ? t : t.slice(0, 61).replace(/-[^-]*$/, ""));
  const taken = new Set([...(head + tail + secs.map((x) => x.body).join("")).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).concat(secs.filter((x) => x.s.id).map((x) => x.s.id)));
  const uniq = (base) => { base = base || "section"; let id = base, n = 2; while (taken.has(id)) id = `${base}-${n++}`; taken.add(id); return id; };
  for (const x of secs) x.id = x.s.id || (x.s.h2 ? uniq(cut(slug(x.s.h2))) : "");
  const faqId = uniq(cut(slug(spec.faqTitle)) || "questions");
  /* A section may carry a short contents label, s.toc (owner, 2026-10-11: full local headings,
     short labels in the list). The H2 then carries it as data-toc, so a checker can match the
     label to its heading (Blog-Brain score.js H14). */
  const tocItems = secs.filter((x) => x.s.h2).map((x) => [x.id, x.s.toc || x.s.h2]).concat([[faqId, spec.faqTitle]]);
  const toc = (spec.toc === true || (spec.toc !== false && tocItems.length >= 5))
    ? `<nav aria-label="On this page" style="margin-top:2rem;max-width:720px"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.3rem;font-weight:600">On this page</p><ul style="list-style:none;margin:0;padding:0">${tocItems.map(([id, h2]) => `<li><a href="#${id}" style="display:block;padding:.65rem 0;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;line-height:1.35">${plain(h2)}</a></li>`).join("")}</ul></nav>`
    : "";
  /* The call-to-action button sits under the short answer, not in the hero (Blog-Brain
     playbook, 2026-10-11): in the hero it came before the answer and pushed the answer
     further down the first phone screen. spec.heroCta.text, when set, is one sentence
     before the button. */
  const heroCta = `${spec.heroCta.text ? `<p ${P}>${spec.heroCta.text}</p>` : ""}<div style="margin-top:1.4rem"><a class="btn btn-brass btn-lg" href="${spec.heroCta.href}">${spec.heroCta.label}</a></div>`;
  const parts = [];
  parts.push(`<main id="main"><div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="${hub.url}">${hub.name}</a><span>/</span><span style="color:var(--muted)">${spec.crumb}</span></div><p class="eyebrow" style="margin-bottom:1rem">${spec.eyebrow}</p><h1 class="detail-h1">${spec.h1}<br/><em style="font-style:italic;color:var(--brass)">${spec.h1em}</em></h1>${heroMedia}<p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">${byline}</p><p class="detail-sub">${spec.sub}</p></div></div>`);
  parts.push(`<section style="background:var(--${saBg})"><div class="wrap"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">The short answer</p>${(Array.isArray(spec.shortAnswer) ? spec.shortAnswer : [spec.shortAnswer]).map(t => `<p ${P}>${t}</p>`).join("")}${heroCta}${toc}</div></section>`);
  for (const x of secs) parts.push(`<section style="background:var(--${x.bg})"${x.id ? ` id="${x.id}"` : ""}><div class="wrap">${x.s.h2 ? `<h2 ${H2}${x.s.toc ? ` data-toc="${String(x.s.toc).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"` : ""}>${x.s.h2}</h2>` : ""}${x.body}</div></section>`);
  const srcLinks = spec.sources.map(x => `<a href="${x.href}" ${EXT}>${x.name}</a>`).join(", ");
  /* Optional spec.afterSources: small print that belongs with the sources line, such as the
     photo credits (Blog-Brain tools/photos.js creditsList), or a function that returns it,
     called after the sections are built. It goes right after the sources line, so the credits
     no longer sit between the last section and the FAQ (Blog-Brain playbook, component 19). */
  const afterSources = typeof spec.afterSources === "function" ? spec.afterSources() : (spec.afterSources || "");
  parts.push(`<section style="background:var(--${faqBg})" id="${faqId}"><div class="wrap"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">Common questions</p><h2 ${H2}>${spec.faqTitle}</h2>${spec.faq.map(f => `<h3 ${H3}>${f.q}</h3><p ${P}>${f.a}</p>`).join("")}<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${srcLinks}. ${spec.sourcesNote || "Educational only, not legal or tax advice."}</p>${afterSources}</div></section>`);
  parts.push(`<section style="background:var(--navy);padding:3rem 0"><div class="wrap" style="text-align:center;max-width:720px;margin:0 auto"><h2 style="font-family:var(--serif);font-size:1.7rem;color:var(--ivory);margin-bottom:1rem">${spec.bottomCta.h2}</h2><p style="color:rgba(244,239,232,.75);line-height:1.7;margin-bottom:1.6rem">${spec.bottomCta.p}</p><a class="btn btn-brass btn-lg" href="${spec.bottomCta.href}">${spec.bottomCta.label}</a></div></section></main>`);
  const main = parts.join("");
  const out = head + main + tail;

  /* ---- self-checks ---- */
  for (const t of DONOR_TOKENS) if (out.includes(t)) throw new Error(`donor identity survived: "${t}"`);
  /* Owner rules 2026-09-06: his name is never in page copy, and nothing "sets" anything. */
  if (/\bDevin\b/.test(main.replace(byline, "") + spec.title + spec.description)) throw new Error("the Operations Officer's name is in the page copy outside the byline - a story from his files is \"in Chapter3's files\" (owner rule 2026-09-06, PLAYBOOK A20a)");
  if (/\b2721275\b/.test(out) || /Licensed Mortgage Loan Originator/.test(out) || /\bDevin(?: Day)?\b[^.<"]{0,120}\b(?:MLO|loan originator|loan officer|NMLS)\b|\b(?:MLO|loan originator|loan officer|NMLS)\b[^.<"]{0,120}\bDevin\b|Chapter3(?:'s|&#39;s|&#x27;s|\u2019s)?\s+(?:own\s+)?licensed\s+(?:mortgage\s+)?loan\s+(?:originator|officer)|\bour licensed (?:mortgage )?loan (?:originator|officer)\b/i.test(out))
    throw new Error("licence claim: never his NMLS number, never a licensed-loan-originator claim tied to him or to Chapter3; a loan fact that needs a source says \"according to a loan officer at our preferred lender\" (owner rule 2026-09-07, PLAYBOOK A17)");
  { const hit = (main + " " + spec.title + " " + spec.description).replace(/<[^>]+>/g, " ").match(/\b(?:sets(?!\s+of\b)|set by)\b/i);
    if (hit) throw new Error(`"${hit[0]}" - nothing sets anything; write what depends on what (owner rule 2026-09-06)`); }
  /* Owner rules 2026-09-07: nothing "maps" a loan or a plan, nothing "carries" a loan, a payment or a cost. */
  { const txt = (main + " " + spec.title + " " + spec.description).replace(/<[^>]+>/g, " ");
    const m1 = txt.match(/\bmap(?:s|ped|ping)?\s+(?:out\b|the\s+(?:loan|route|path|plan|numbers|deal|purchase|year|way|next)\b)/i);
    if (m1) throw new Error(`"${m1[0]}" - nothing maps a loan or a plan; say plan, list, or the literal action (owner rule 2026-09-07)`);
    const m2 = txt.match(/\bcarr(?:y|ies|ied|ying)\s+(?:a |an |the |its |their |your |his |her |our |new |two |three |both |that |this |each |every |own )*(?:loan|mortgage|payment|payments|cost|costs|debt|note|rest|house|property|premium|itself|themselves)\b|\bcarrying costs?\b/i);
    if (m2) throw new Error(`"${m2[0]}" - nothing carries a loan, a payment or a cost; say who pays what (owner rule 2026-09-07)`); }
  const strip = (html) => html.replace(/<main id="main">[\s\S]*<\/main>/, "").replace(/<title>[^<]*<\/title>/, "").replace(/<meta (?:name|property)="(?:description|og:title|og:description|og:url|twitter:title|twitter:description|og:image|og:image:width|og:image:height|og:image:alt|twitter:image|twitter:image:alt)" content="[^"]*">/g, "").replace(/<link rel="canonical" href="[^"]*">/, "").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (m) => { try { const t = JSON.parse(m.slice(35, -9))["@type"]; return blocks[t] ? "" : m; } catch { return m; } });
  const donorChrome = strip(donor);
  /* Completeness of the identity list: once the identity elements are removed
     from the donor, nothing left may still name the donor page. If this fires,
     the donor gained an identity element this script does not rewrite. */
  for (const t of DONOR_HEAD_TOKENS) if (donorChrome.includes(t)) throw new Error(`donor chrome still names the donor ("${t}") - an identity element is not on the rewrite list`);
  if (strip(out) !== donorChrome) throw new Error("chrome differs from donor outside the identity elements");
  const sourceWords = words(srcLinks) + words(`${spec.sourcesNote || ""}`);
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
