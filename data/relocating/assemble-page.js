#!/usr/bin/env node
/*
 * assemble-page.js — stamp a page spec into the site chrome.
 *
 *   node data/relocating/assemble-page.js data/relocating/pages/cost-of-living.js
 *
 * Takes the current chrome from a donor page (header, footer, scripts, head
 * boilerplate) byte for byte, and replaces only the page-specific parts:
 * title, description, canonical, og/twitter tags, Breadcrumb/WebPage/Article/
 * FAQPage JSON-LD, <main>, the router CUR token. The FAQ block on the page and
 * the FAQPage schema are generated from the same array, so they cannot drift
 * (PLAYBOOK A25). Asserts the donor's identity does not survive (A23).
 *
 * The spec sets datePublished once, on first assembly; after that the value in
 * the existing page wins so `node build.js dates` never sees it move.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SITE = path.join(ROOT, 'chapter3realty');
const DONOR = path.join(SITE, 'buyers', 'cost-to-own', 'index.html');
const DONOR_SLUG = '/buyers/cost-to-own/';
const DONOR_CUR = 'buyers-costtoown';
const ORIGIN = 'https://chapter3realty.com';

const specPath = path.resolve(process.argv[2] || '');
if (!specPath || !fs.existsSync(specPath)) { console.error('usage: node assemble-page.js <spec.js>'); process.exit(1); }
const spec = require(specPath);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* JSON-LD lives inside <script>, where the HTML parser does NOT decode entities.
 * So "calculator&#39;s" in a schema string reaches Google as those six literal
 * characters while the visible page shows an apostrophe, and the FAQ block stops
 * matching its own page. Decode before serialising. Caught by .claude/verify.js
 * on two pages after `audit` passed them, because audit normalised entities on
 * BOTH sides and so could never see the mismatch. */
const deEnt = (s) => String(s)
  .replace(/&#39;|&#x27;|&rsquo;|&lsquo;|&#8217;/g, "'")
  .replace(/&quot;|&#34;|&ldquo;|&rdquo;/g, '"')
  .replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·')
  .replace(/&hellip;/g, '…').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/&rarr;/g, '→').replace(/&deg;/g, '°')
  .replace(/&amp;/g, '&');
const attr = (s) => String(s).replace(/&(?!(amp|quot|lt|gt|#\d+|#x[0-9a-f]+|[a-z]+);)/gi, '&amp;').replace(/"/g, '&quot;');
const localISO = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- validate spec
for (const k of ['slug', 'cur', 'title', 'description', 'headline', 'keywords', 'breadcrumb', 'main', 'faq']) {
  if (spec[k] == null) { console.error(`spec missing ${k}`); process.exit(1); }
}
if (!/^\/[a-z0-9\/-]+\/$/.test(spec.slug)) { console.error('slug must be /lower-case/with-trailing-slash/'); process.exit(1); }
if (spec.title.length > 62) { console.error(`title is ${spec.title.length} chars (max 62)`); process.exit(1); }
if (spec.description.length < 110 || spec.description.length > 165) { console.error(`description is ${spec.description.length} chars (want 110-165)`); process.exit(1); }

const url = ORIGIN + spec.slug;
const outFile = path.join(SITE, ...spec.slug.split('/').filter(Boolean), 'index.html');
const existing = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : null;
const today = localISO();
const datePublished = spec.datePublished
  || (existing && (existing.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/) || [])[1])
  || today;
const dateModified = (existing && (existing.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/) || [])[1]) || today;

let s = fs.readFileSync(DONOR, 'utf8');
const donorTitle = s.match(/<title>([^<]*)<\/title>/)[1];
const donorDesc = s.match(/<meta name="description" content="([^"]*)">/)[1];

// --- head
s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(spec.title)}</title>`);
s = s.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${attr(spec.description)}">`);
s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
s = s.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${attr(spec.title)}">`);
s = s.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${attr(spec.description)}">`);
s = s.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
s = s.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${attr(spec.title)}">`);
s = s.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${attr(spec.description)}">`);

// --- JSON-LD blocks (replace by @type)
function replaceLd(type, obj) {
  const re = new RegExp(`<script type="application/ld\\+json">\\{"@context":"https://schema.org","@type":"${type}"[\\s\\S]*?<\\/script>`);
  if (!re.test(s)) throw new Error(`donor has no ${type} JSON-LD block`);
  s = s.replace(re, `<script type="application/ld+json">${JSON.stringify(obj)}</script>`);
}
const crumbs = [{ name: 'Home', item: ORIGIN + '/' }, ...spec.breadcrumb.map(b => ({ name: b.name, item: ORIGIN + b.href }))];
replaceLd('BreadcrumbList', {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
});
replaceLd('WebPage', {
  '@context': 'https://schema.org', '@type': 'WebPage',
  author: { '@id': ORIGIN + '/about/#devin-day' },
  '@id': url + '#webpage', url, name: deEnt(spec.title), description: deEnt(spec.description),
  isPartOf: { '@id': ORIGIN + '/#website' }, about: { '@id': ORIGIN + '/#org' },
  primaryImageOfPage: { '@type': 'ImageObject', url: ORIGIN + '/og-image.jpg', width: 1200, height: 630 },
  dateModified, datePublished, inLanguage: 'en-US',
  breadcrumb: { '@id': url + '#breadcrumb' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] },
  mainEntity: { '@id': url + '#article' },
});
replaceLd('Article', {
  '@context': 'https://schema.org', '@type': 'Article', '@id': url + '#article',
  headline: deEnt(spec.headline), description: deEnt(spec.description), url,
  author: { '@id': ORIGIN + '/about/#devin-day' },
  reviewedBy: { '@type': 'Person', name: 'Tim Nash', jobTitle: 'Broker-in-Charge' },
  publisher: { '@id': ORIGIN + '/#org' },
  datePublished, dateModified, inLanguage: 'en-US', image: ORIGIN + '/og-image.jpg',
  mainEntityOfPage: { '@id': url + '#webpage' },
  about: { '@type': 'Thing', name: deEnt(spec.headline) },
  keywords: spec.keywords,
});
replaceLd('FAQPage', {
  '@context': 'https://schema.org', '@type': 'FAQPage', '@id': url + '#faq',
  mainEntity: spec.faq.map(f => ({ '@type': 'Question', name: deEnt(f.q), acceptedAnswer: { '@type': 'Answer', text: deEnt(f.a) } })),
});

// --- main
const faqHtml = spec.faq.map(f =>
  `<div style="border-top:1px solid var(--rule);padding:1.4rem 0"><h3 style="font-family:var(--serif);font-size:1.2rem;color:var(--navy);margin-bottom:.5rem">${f.q}</h3><p style="color:var(--muted);line-height:1.7;max-width:680px">${f.a}</p></div>`).join('');
const bylineDate = longDate(dateModified);
const mainInner = typeof spec.main === 'function' ? spec.main({ faqHtml, bylineDate, url }) : spec.main;
if (!/<h1[\s>]/.test(mainInner)) throw new Error('main has no <h1>');
if (/TODO|TK\b|\[verify\]|XXX/.test(mainInner) && !process.env.ALLOW_DRAFT) throw new Error('main still contains a TODO/TK/[verify] marker; set ALLOW_DRAFT=1 to assemble a draft for browser testing');
if (mainInner.indexOf(faqHtml) < 0 && spec.faq.length) throw new Error('main does not include ctx.faqHtml (FAQ must be generated from spec.faq)');
s = s.replace(/<main id="main">[\s\S]*?<\/main>/, () => `<main id="main">\n<div class="page-section active" id="page-${spec.cur}">\n${mainInner}\n</div>\n</main>`);

// --- router token
if (!s.includes(`var CUR="${DONOR_CUR}"`)) throw new Error('donor CUR token not found');
s = s.replace(`var CUR="${DONOR_CUR}"`, `var CUR="${spec.cur}"`);

/* Resolve unhashed asset references to whatever is actually on disk.
 * A spec writes /assets/col.js; `node build.js rehash` renames it to
 * col.<hash>.js. Re-assembling the page would otherwise reinstate the stale
 * unhashed name and `check` would fail with "links missing asset" plus an
 * orphan. Rewrite at assembly time so the two can never disagree. */
const assetsDir = path.join(SITE, 'assets');
s = s.replace(/\/assets\/([a-z0-9-]+)\.js/gi, (full, stem) => {
  if (/\.[0-9a-f]{10}$/.test(stem)) return full;               // already hashed
  if (fs.existsSync(path.join(assetsDir, `${stem}.js`))) return full; // unhashed file really exists
  const hit = fs.readdirSync(assetsDir).find(n => new RegExp(`^${stem}\\.[0-9a-f]{10}\\.js$`).test(n));
  if (!hit) throw new Error(`spec references /assets/${stem}.js but no such asset (hashed or not) exists`);
  return `/assets/${hit}`;
});

// --- identity leak checks (A23)
const leaks = [];
if (s.includes(donorTitle) && donorTitle !== spec.title) leaks.push('donor title');
if (s.includes(donorDesc) && donorDesc !== spec.description) leaks.push('donor description');
if (s.includes(`page-${DONOR_CUR}`) || s.includes(`"${DONOR_CUR}"`)) leaks.push('donor CUR/section id');
if (s.includes(`'cost-to-own')`)) leaks.push("donor c3SendForm page name");
if (leaks.length) { console.error('Donor identity survived: ' + leaks.join(', ')); process.exit(1); }
if (!s.includes(`<link rel="canonical" href="${url}">`)) throw new Error('canonical not set');

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, s);
console.log(`Wrote ${path.relative(ROOT, outFile)} (${(s.length / 1024).toFixed(0)}KB) datePublished=${datePublished} dateModified=${dateModified}`);
