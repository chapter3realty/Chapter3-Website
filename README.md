# Chapter 3 Realty website

Plain HTML site for chapter3realty.com. No framework, no build step required to view a page. You edit HTML files and push the `chapter3realty/` folder to Cloudflare Pages with wrangler.

## How the site is laid out

- `chapter3realty/` is the folder that gets deployed. Everything the public sees lives here.
- Each page is its own `index.html` in its own folder (for example `chapter3realty/buyers/va-loans/index.html` is the page at `/buyers/va-loans/`).
- `chapter3realty/assets/` holds the **shared** CSS and JavaScript that every page uses. These files are loaded once and then cached by the visitor's browser, so moving between pages is fast.
- `chapter3realty/_headers` and `chapter3realty/_redirects` are Cloudflare settings (caching rules and URL redirects).
- `build.js` and this `README.md` live at the repo root, **outside** `chapter3realty/`, so they are never deployed.

## Why there is an `assets/` folder

The site used to copy the same ~70KB of CSS and the same big blocks of JavaScript into **every single page**. That made each page around 251KB. On a phone that is slow.

Now the shared CSS and JavaScript live once in `chapter3realty/assets/` with names like `app.b87c0807ee.css`. Every page links to them:

```html
<link rel="stylesheet" href="/assets/app.b87c0807ee.css">
...
<script src="/assets/s.a14ed1fa82.js"></script>
```

The visitor downloads each shared file once, and their browser reuses it on every other page. Pages dropped from ~251KB to ~90KB.

The random-looking part of the file name (`b87c0807ee`) is a **fingerprint of the file's contents**. It lets Cloudflare cache the file "forever" (one year) safely: when you change the file, the fingerprint changes, the file name changes, and browsers automatically fetch the new one. That is why you must re-fingerprint after editing a shared file (see below).

Each page still has a small inline `<style>` with rules unique to that page, and some pages have their own inline `<script>` for page-specific tools (like the investment calculators). That is fine and expected.

## Everyday editing

**Editing the words or layout of one page:** just edit that page's `index.html` and push. Nothing special.

**Editing the shared CSS or shared JavaScript** (a file inside `chapter3realty/assets/`):

1. Edit the file in `chapter3realty/assets/`.
2. Run: `node build.js rehash`
   This renames the file to match its new contents and updates the link on every page, so visitors get your change instead of a cached old copy.
3. Run: `node build.js check`
4. Push (see below).

If you edit a shared asset and skip step 2, visitors can keep seeing the **old** version for up to a year because of the aggressive cache. So: **edit a shared asset, always `rehash`.**

## Before every push: check

```
node build.js check
```

This confirms:

- every `/assets/...` link on every page points to a file that actually exists,
- no page has accidentally re-absorbed the giant shared CSS block (which would make pages fat again),
- no asset file is unused/orphaned.

It also prints any "heavy page" warnings (a large page-specific inline script). Warnings do not block a deploy; they are just a heads-up for future cleanup. If `check` prints `FAIL`, fix it before pushing.

## Pushing to the live site

You push manually (this repo has no auto-deploy). From this folder:

```
wrangler pages deploy chapter3realty --project-name chapter3realty
```

## build.js commands

| Command | When | What it does |
| --- | --- | --- |
| `node build.js check` | Before every push | Verifies asset links, guards against regressions, reports heavy pages. |
| `node build.js rehash` | After editing any file in `chapter3realty/assets/` | Re-fingerprints changed assets and updates every page that links to them, so the browser cache updates. |

## Scaling to many pages (the next step)

The shared CSS/JS now lives in one place, but the page **chrome** (the `<head>` tags, the top navigation, and the footer) is still copy-pasted identically into every `index.html`. That is manageable for ~40 pages but not for thousands.

The natural next step is a small generator: keep the header, footer, and `<head>` as single template files, keep each page as just its unique content, and have a build step stamp the shared chrome into each page before deploy. That keeps the "plain static files on Cloudflare" model (fast, simple, no server) while letting you change the nav or footer in one place instead of forty. `build.js` is the seed of that build step.
