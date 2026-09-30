// Every local file a page points at exists: src, poster, srcset, href of preload links and data-* URLs that start with
// "/". node media.js [page.html ...] (default: chapter3realty/index.html). Exits 1 when one is missing.
// build.js preflight checks asset links but not /media/, so this runs in the accept steps (HANDOFF.md).
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..', '..'), SITE = process.env.SITE || path.join(REPO, 'chapter3realty');
const pages = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(SITE, 'index.html')];
let missing = 0, checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
  const urls = new Set();
  for (const m of html.matchAll(/\s(?:src|poster|data-[a-z-]+)="(\/[^"#?]+)/g)) urls.add(m[1]);
  for (const m of html.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) for (const c of m[1].split(',')) { const u = c.trim().split(/\s+/)[0]; if (u.startsWith('/')) urls.add(u.split(/[?#]/)[0]); }
  for (const m of html.matchAll(/<link[^>]+rel="preload"[^>]*>/g)) { const h = m[0].match(/href="(\/[^"#?]+)/); if (h) urls.add(h[1]); }
  for (const u of urls) {
    if (u.startsWith('//')) continue;
    checked++;
    const f = path.join(SITE, decodeURIComponent(u));
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory() && !fs.existsSync(path.join(f, 'index.html'))) { missing++; console.log('missing: ' + u + '  (' + path.relative(REPO, page) + ')'); }
  }
}
console.log(missing ? `${missing} of ${checked} local files missing` : `all ${checked} local files present`);
process.exitCode = missing ? 1 : 0;
