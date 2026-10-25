# The listing search on chapter3realty.com (website side)

Built to the CRM's contract v1 (21 Oct 2026, `docs/website-listing-api.md` in the CRM repo). The CRM sends raw JSON; this site draws every page. It is off until `IDX_LIVE=1`.

## What it adds

| Path | What |
|---|---|
| `/homes/` | Search: town, type, price, beds, baths, waterfront, sort. Indexed when unfiltered. |
| `/homes/<MLS#>` | 301 to the listing's own URL. The CRM's emails link this form. |
| `/homes/<MLS#>-<street>-<town>/` | One listing. Public: one photo, the key facts, the listing firm, then a sign-up wall for every photo and the full details. Signed up: all photos, the description, the details, open houses. Heart and "Tour this home" on every listing. Noindex unless `IDX_INDEX_LISTINGS=1`. |
| `/homes/near/<place>/` | Homes in a community from our guide pages (`idx-lib/places.js`). |
| `/homes/terms/` | The listing search terms of use. **Draft for the attorney** (`idx-lib/terms.js`). |
| `/sitemap-homes.xml` | The search and the community pages; single listings only with `IDX_INDEX_LISTINGS=1`. |
| Guide pages | Each community's homes strip is filled at the edge: up to 10 homes across the price range, photo, price and listing firm, then "See all". It pans sideways (drag with a mouse, swipe on a phone). Fewer than 3 homes: the strip stays empty and the photo shows. |
| Header | "Search Listings" opens `/homes/` instead of the old pop-up. |
| Footer | "Chapter3 Realty, Corp." linked home, and "Equal Housing Opportunity" (CCMLS 16.9, contract §8). |
| `/privacy/` | The listing search section (contract §9). |

## Files

- `functions/_middleware.js`: maintenance as before, then `idx-lib/edge.js` (strips, header button).
- `functions/homes/[[path]].js`: every `/homes/*` page and the three endpoints `/homes/api/register`, `/homes/api/views`, `/homes/api/hearts` (POST, JSON, our own origins only, size limits).
- `functions/sitemap-homes.xml.js`.
- `idx-lib/crm.js` (the only door to the CRM; caching rules), `render.js` (all HTML; everything from the CRM escaped), `edge.js`, `places.js` (generated from Blog-Brain), `terms.js` (terms and the locked TCPA string).
- `chapter3realty/homes-shell/index.html`: the page shell, stitched like every page. Never served on its own.
- `tools/idx-test.mjs`: 91 controls against a mock CRM. `node tools/idx-test.mjs` must print "all controls pass".
- `tools/idx-check-places.mjs`: checks every community's search against the real MLS (development key).

## Settings (Cloudflare Pages, Production env)

| Name | Value |
|---|---|
| `IDX_LIVE` | `1` turns it on. Leave it unset until the checklist below is done. |
| `IDX_API_SECRET` | The production key, encrypted. Same value as in Railway. |
| `TURNSTILE_SITE_KEY` | The Turnstile site key (public). Its secret goes in Railway as `TURNSTILE_SECRET_KEY`. |
| `IDX_PREVIEW_WORD` | Optional. Visit `/homes/?idxpreview=<word>` once to see it while it is off. |
| `IDX_INDEX_LISTINGS` | Optional. `1` lets search engines index single listings. |

The development key lives only in `.dev.vars` on your own machine (ignored by git), never in the Preview env.

## Testing locally

```
# .dev.vars (never commit)
IDX_DEV_KEY=...
IDX_LIVE=1
TURNSTILE_SITE_KEY=1x00000000000000000000AA

npx wrangler pages dev chapter3realty
IDX_DEV_KEY=... node tools/idx-check-places.mjs
```

With the development key a sign-up answers `dryRun: true` and saves nothing.

## Go-live checklist

1. Attorney reads `idx-lib/terms.js` and the privacy section. After any wording change, raise `TERMS_VERSION`.
2. Run `tools/idx-check-places.mjs` with the development key. Fix any community whose MLS names are wrong (in Blog-Brain's `idx-places.json`, then regenerate `places.js`).
3. Turnstile widget for chapter3realty.com; site key here, secret in Railway.
4. Private preview with `IDX_PREVIEW_WORD`. Sign up once for real.
5. `IDX_API_SECRET` in Railway and in Cloudflare Pages (Production), then `IDX_LIVE=1`, then deploy.
6. Add `Sitemap: https://chapter3realty.com/sitemap-homes.xml` to `robots.txt` and submit it in Search Console.

## Answered by the CRM (22 Oct 2026)

- **No HOA (ticket 415):** `hoa=0` returns only homes whose listing says there is no HOA (AssociationYN false, no fee above $0). A listing that does not say is left out. Any other value is a 400. The 16 no-HOA places in `places.js` send it. Every no-HOA strip and place page says "No HOA, as listed by the listing agent. Confirm before you buy." (required by the CRM; the wording is ours).
- **Limits** (contract §3, per 10 minutes): 300 searches per visitor IP, 12,000 for the whole site on the production key; the dev key allows 300 per visitor and 1,000 in all. A guide page's 18 strip searches at once are fine. Always send the visitor's IP: calls without one share a single allowance.
- **Sitemap:** the CRM can take several seconds; `/sitemap-homes.xml` waits up to 25 s and is fetched only by crawlers.
- **No key or a wrong key** answers 403 `forbidden` (it was 503 `switched_off`). The site shows the "back soon" message either way.
- **Turnstile:** until `TURNSTILE_SECRET_KEY` is in Railway, a live sign-up answers 503 `signup_off`. Dev-key sign-ups do not need it.
