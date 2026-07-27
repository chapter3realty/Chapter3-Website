# chapter3realty.com

Static HTML site for **Chapter3 Realty**, a real estate brokerage in Myrtle
Beach / the Grand Strand, South Carolina. One `index.html` per folder under
`chapter3realty/`. Deployed to Cloudflare Pages. No framework.

## Read this before creating or editing any page

**[PLAYBOOK.md](PLAYBOOK.md)** is the production procedure. Follow it. It is not
advice — every rule in it exists because that defect actually shipped here.

Pick the lane before you start: **Lane A** for a new page, **Lane B** for an
edit. An edit to `partials/*` or `assets/*` changes every page and must be
verified like every page.

## Commands

```
node build.js preflight   # check + audit. MUST exit 0 before any deploy
node build.js check       # asset links, partial drift, stale hashes
node build.js audit       # page quality, SEO, structured data, compliance
node build.js stitch      # push partials/* into every page
node build.js rehash      # after editing assets/*, renames + updates all refs
node build.js llmsfull    # regenerate llms-full.txt
```

**[MISTAKES.md](MISTAKES.md)** is the log of every mistake made here and what
stops it recurring. Read its five rules before changing anything.

## The five rules that caused the most damage

1. **A change is not verified until it is measured on the rendered page.**
   Reading HTML proves nothing; invisible text has shipped four times.
2. **Before any multi-file replace, list the distinct contexts.** This site has
   two hero types with opposite colours; a blind replace corrupts one of them.
3. **Verify a fix in both directions.** "Ivory is wrong here" does not make dark
   right everywhere. That error broke 24 pages across two passes.
4. **Sanity-check a scanner before believing it** — one case that should match,
   one that should not. Several "findings" here were the scanner being wrong.
5. **Never infer a real-world fact from repo artifacts.** Git history is not the
   launch date.

## Non-negotiables

1. **Never deploy.** The owner deploys, themselves, from PowerShell. Prepare and
   commit; then stop and give them the command.
2. **Never hand-edit chrome inside a page.** Edit `partials/*`, run `stitch`.
   `check` fails on drift.
3. **Never state a down payment, payment amount, or rate** in page copy.
   Regulation Z trigger terms pull in APR and repayment-disclosure obligations.
   Keep financing qualitative.
4. **The TCPA consent string is locked.** Byte-identical on every form that
   collects a phone number. See PLAYBOOK.md.
5. **Never publish a conclusion about a named building, HOA, or builder.**
   Defamation risk. Observable dated facts only.
6. **Never bulk-stamp sitemap `lastmod`.** Only pages whose *visible text*
   changed. Styling, nav and asset-hash changes do not count.
7. **Verify in a browser by measuring the DOM**, not by reading HTML and not by
   screenshot (screenshots time out on this site's animated canvas). Text can be
   present in the HTML and invisible on screen — that has happened twice.
8. **Re-open every source.** In the last research batch 20 of 163 sourced facts
   were wrong. Never carry a number from another page without re-checking it.

## Writing style — owner instruction

Literal and direct. Short sentences. No metaphors, no personification, no
creative hooks, no question-headers as teasers, no em dashes. Explain things
plainly; assume the reader is smart but not in the industry.

## Who is who

- **Timmy Fredrick Nash** — Broker-in-Charge, SC licence 43182, NMLS 252563.
  30+ years on the Grand Strand. Does the CMAs.
- **Devin Day** — Operations Officer, licensed MLO, **NMLS 2721275**. Must be
  shown visibly on financing content.
- **Paul Hankins** — owner of BrickWood Mortgage, NMLS 281393.
- **Abdulla Hijazi** — CMO, builds the site tooling.
- **BrickWood Mortgage** — affiliated lender, NMLS #189497. Any body reference
  requires the RESPA AfBA disclosure inline on that page.

## Gotchas that have bitten before

- **This site has TWO hero types and they are opposite colours.** Check which
  one a page uses before touching any colour in it:
  - `.detail-hero` → **ivory (light)**. Text must be `var(--muted)` / `var(--navy)`.
    Ivory text here is invisible. Shipped broken three times.
  - `.bimb-hero-grid` and the homepage / `/about/` / `/buyers/` / submarket
    heroes → **navy (dark)**. Text must be ivory. Dark text here is invisible.
  A blind find-and-replace across both breaks one of them. That happened: eight
  submarket bylines were "fixed" to dark text and measured 1.00:1 navy-on-navy.
  **Always measure the rendered contrast before and after a colour change.**
- `node --check` validates syntax only. It will not catch an undeclared
  identifier after an edit.
- The site mixes `&#39;` and `&#x27;` for apostrophes. Normalise both when
  comparing schema text to visible text.
- `.grid-2/3/4` set `grid-template-columns` but never `display:grid`, so they
  are inert. Use an inline `display:grid` with `repeat(auto-fit, minmax(...))`.
- Cloudflare Pages production branch is **`production`**, not `main`.
- The analyzer's API worker lives in the Cloudflare dashboard, **not in this
  repo**. `wrangler pages deploy` does not update it. Source of truth is
  `api-proxy-worker.js` at the repo root.
