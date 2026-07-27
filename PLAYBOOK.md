# Chapter3 Realty — page production playbook

Every rule below exists because that exact defect actually reached, or nearly
reached, production on this site. Nothing here is theoretical.

**The one rule that matters:** a step is not done because it was read. It is
done because a command exited 0 or a measurement was taken. Anything verified
by "looks right" is not verified.

---

## Pick your lane first

| You are… | Lane |
|---|---|
| Creating a new page | **Lane A** — all 9 phases |
| Editing existing page copy | **Lane B** |
| Editing `partials/*`, `assets/*`, or anything shared | **Lane B + blast radius** |

Lane B exists because the two worst defects in this site's history — the
invisible hero text on 27 pages, and 54 sitemap URLs stamped with one date —
both came from *edit* passes, not from building new pages. An edit that touches
a shared file changes every page, and must be verified like every page.

---

## The commands

```
node build.js check       # asset links, partial drift, stale hashes, orphans
node build.js audit       # page quality, SEO, structured data, compliance
node build.js preflight   # both of the above
node build.js stitch      # push partials/* into every page
node build.js rehash      # rename assets after editing them, update all refs
node build.js llmsfull    # regenerate llms-full.txt from live HTML
```

`preflight` must exit 0 before any deploy. It exits 1 on a blocker.

Deploy (you run this, never the assistant):

```
npx wrangler pages deploy chapter3realty --project-name chapter3realty --branch production
```

---

# LANE A — building a new page

## Phase 1 — Prove the page should exist

**A1. Search the site before writing anything.**
Grep existing titles, H1s and declared keywords for the topic. If an existing
page already ranks for this intent, expand that page instead. Building first and
checking later is how sibling pages end up splitting the same impressions.
→ *Verify:* you have named the closest existing page and stated in one sentence
how the new page's job differs.

**A2. Only then choose the URL.**
Lowercase, hyphens, directory form with a trailing slash, nested under an
existing hub (`/buyers/ /sell/ /invest/ /submarkets/ /guides/ /market-reports/`).
Keep the slug short; put the locality in the H1 and title, not the slug.
Never publish a URL you might rename — renaming costs a 301 plus sitemap,
llms.txt and internal-link edits.
→ *Verify:* the path is not already in `_redirects`.

**A3. Declare the target keyword, and make it unique.**
One primary phrase per page. It goes in the Article schema `keywords` field.
→ *Verify:* `node build.js audit` fails on any keyword claimed by two pages.

## Phase 2 — Outline before prose

**A4. Write the heading tree first.** One H1. No skipped levels. Headings are
literal statements or literal questions — never teasers, never metaphors.

**A5. Give each H2 exactly one job.** One conclusion per section. Two
conclusions means split it; a shared conclusion means merge them.

**A6. Write the answer block.** 40–120 words directly under the H1 that fully
answer the primary question, including the key number with its unit and date.
No preamble. It must read correctly if an AI quotes it with no other context.

## Phase 3 — Facts, with sources and expiry

**A7. Every number gets a primary source and a date.**
Horry County, SC Code, SC DOR, HUD, CFPB, Fannie/Freddie selling guides, NAR.
Not a blog summarising them.

**A8. Re-open every source and confirm the claim literally.**
In the last research batch, **20 of 163 sourced facts were wrong** — wrong rate,
wrong statute framing, wrong geography, overstated industry claim. Assume the
first pass is wrong until you have re-read the source yourself.
→ *Verify:* each fact has a URL you personally opened and an as-of date.

**A9. Never copy a number from another page on this site** without re-opening
its source. Stale figures propagate silently.

**A10. Record what will go stale.** Millage and assessment ratios yearly, market
stats monthly, statutes quarterly, insurance and program limits twice a year.

## Phase 4 — Draft

**A11. Literal and direct.** No metaphors, no personification, no question
headers as hooks, no em dashes. This is a standing owner instruction.
→ *Verify:* `audit` warns on the banned-phrase list.

**A12. Gloss every jargon term** on first use, in the same sentence.

**A13. Show the reasoning, not just the conclusion.** Firsthand process and real
(anonymised) client files are the one thing competitors cannot copy, and the
strongest signal for both Google and AI answer engines.

## Phase 5 — Compliance, BEFORE the copy is mirrored anywhere

Do this before generating JSON-LD, `llms-full.txt` or the sitemap entry.
Fixing copy afterwards means fixing it in four places.

**A14. Regulation Z.** Never state a down-payment amount or percentage, a
payment amount, the number of payments, or a finance charge. Any one of them
obliges you to also publish APR and full repayment terms. Write qualitatively:
"a larger down payment and a somewhat higher rate; we quote your real numbers."
→ *Verify:* `audit` warns on any `N% down` in prose.

**A15. TCPA.** Any form collecting a phone number carries the locked consent
string byte-for-byte (see Locked strings below), as an unchecked checkbox.
→ *Verify:* `audit` fails if a form exists without the exact string.

**A16. RESPA AfBA.** Any page referring to BrickWood in the body carries the
affiliated-business disclosure inline, not only in the footer.
→ *Verify:* `audit` fails on a BrickWood body link with no disclosure.

**A17. NMLS.** Financing-related content authored by the MLO shows
"Devin Day, licensed MLO, NMLS 2721275" **visibly**. It was rendered invisible
once by a colour bug; visibility is the requirement, not presence in the HTML.

**A18. Fair housing.** No claims about safety, crime, who lives somewhere, or
who a neighbourhood suits. Describe property and geography, not people.
→ *Verify:* `audit` fails on the risk-phrase list.

**A19. No guarantees.** No success rates, no "you won't fail", no promised
outcomes. State process and let the reader conclude.
→ *Verify:* `audit` fails, with a negation guard so "returns are not
guaranteed" correctly passes.

**A20. Named third parties.** Never publish a conclusion about a named condo
building, HOA, or builder ("non-warrantable", "defective"). Describe only
observable, dated facts, or keep the verdict in a private reply. This is
defamation and trade-libel exposure.

**A21. Calculators carry a disclaimer** naming their assumptions and source.

## Phase 6 — Build the file

**A22. Clone the closest existing page** for the chrome so header, footer and
scripts stay byte-identical. Never hand-write chrome.

**A23. Rewrite every unique element:** title, description, canonical, `og:url`,
`og:title`, breadcrumb, WebPage, Article, FAQPage, section id, and the router
`CUR` token. A missed find-and-replace leaves the donor's identity behind.

**A24. Title ≤ 62 characters. Description 110–165.** Both unique sitewide.

**A25. FAQ schema must match the visible page word for word.** Google requires
it. Watch entity encoding: this site mixes `&#39;` and `&#x27;` for the same
apostrophe, which has produced both false passes and false failures.

**A26. Never hand-edit chrome inside a page.** Edit `partials/*`, then `stitch`.

## Phase 7 — Automated gate

**A27. `node build.js preflight` must exit 0.** No exceptions, no "I'll fix it
after". If a rule is wrong, fix the rule in `build.js` and say so.

## Phase 8 — Browser verification (the part source review cannot do)

Screenshots on this site are unreliable — they time out on the animated canvas.
**Measure the DOM instead.** Paste `.claude/verify.js` into `javascript_tool`.

**Resize the window before you measure.** The preview pane can report a `0x0`
viewport, and every measurement taken then is garbage — the script once produced
125 phantom "zero-size text" defects that way. `verify.js` now aborts instead,
but you still have to set a real size:
`resize_window 1280x800`, then `375x812`, then `320x800`.

**A28. Contrast.** Compute the real ratio for every text node against its
painted background. Body text needs 4.5:1, large text 3:1. The hero once
rendered ivory text on an ivory background at **1.00:1** — perfectly invisible,
and completely undetectable by reading the HTML.

**A29. Painted, not just present.** Assert the element has non-zero size, is not
`opacity:0`, and is not covered. This site ships `.sr{opacity:0}` reveal
animations, so "text is in the DOM" proves nothing.

**A30. Selectable.** Hit-test with `document.elementFromPoint` at the element's
centre and confirm it returns that element, not an overlay. `getSelection()` is
not a valid test. An animated pseudo-element without `pointer-events:none` once
made every hero heading unselectable.

**A31. CSS classes do what their names say.** A utility class that sets
`grid-template-columns` but never `display:grid` is inert and silently stacks
your layout. Assert computed `display`, not the class name.

**A32. 320px, 768px, 1280px.** Check for clipped and overflowing text, not just
`scrollWidth`. Content can be cut off inside a scrolling container while the
page reports no overflow.

**A33. Forms.** Exercise every validation path with `c3SendForm` stubbed so no
fake lead is sent. Confirm the error text, the success state, and that nothing
submits when validation fails.

**A34. Calculators.** Hand-compute at least two expected values independently
and compare to the dollar. Also test a typed `0` and a `0%` rate — both have
produced real bugs here.

**A35. Console must be clean.**

## Phase 9 — Wire it in, then record honestly

**A36. Nav** (`partials/header.html` → `stitch`), **footer** if it is a tool,
**sitemap**, **llms.txt**, and at least one **contextual inbound link** from a
related page — a link in body copy, not just the nav.
→ *Verify:* `audit` **fails** on an orphan. Nav and footer links do not count,
because they link everything and would hide a genuinely orphaned page.
`/buyers/new-construction/` shipped orphaned exactly this way.

**A37. `llmsfull`** to regenerate the plain-text mirror.

**A38. Sitemap `lastmod` = today only for pages whose visible text changed.**
Never restamp the whole file. A sitemap where every date matches reads as
auto-generated and Google discounts all of it. Nav, CSS and asset-hash changes
are **not** content changes.

**A39. `preflight` again**, then commit. Never deploy on the owner's behalf.

**A40. After deploy, verify live:** the URL returns 200, the canonical is right,
and the rendered page matches what you built.

---

# LANE B — editing an existing page

1. State what you are changing and why, in one sentence.
2. Make the edit.
3. **Blast radius:** did you touch `partials/*` or `assets/*`? If yes, you just
   changed *every page*. Run `stitch` and/or `rehash`, then verify a sample of
   at least three pages in the browser, not just the one you were thinking about.
4. `node build.js preflight` → must exit 0.
5. Browser-verify the changed region using Phase 8 checks.
6. **Did the visible text change?** If yes, update that page's `lastmod`.
   If you only changed styling, nav, or an asset hash — **do not** touch
   `lastmod`.
7. Commit with a message that names the defect you fixed.

---

## Locked strings — copy exactly, never paraphrase

**TCPA consent** (every form collecting a phone number):

> I consent to receive calls and text messages from Chapter 3 Realty about my
> property inquiry, showing appointments, and listing information I requested, at
> the phone number provided, including calls placed using an automated system or
> an artificial or prerecorded voice. Message frequency varies. Message and data
> rates may apply. Reply HELP for help, STOP to opt out. Consent is not a
> condition of any purchase.

**Identity:** Chapter3 Realty LLC · BrickWood Mortgage NMLS #189497 ·
Devin Day NMLS 2721275 · Timmy Fredrick Nash, BIC, SC licence 43182,
NMLS 252563 · Paul Hankins NMLS 281393 · 854.333.2135 · Murrells Inlet, SC 29576

**Colour contrast traps.** `--ivory #f4efe8` and `--navy #1c2028` are the two
backgrounds, and **the site uses BOTH for heroes**:

| Hero | Background | Text must be |
|---|---|---|
| `.detail-hero` (most inner pages) | **ivory, light** | `var(--muted)` or `var(--navy)` |
| Homepage, `/about/`, `/buyers/`, submarket guides | **navy, dark** | ivory |

A find-and-replace across both breaks one of them. Eight submarket bylines were
once "fixed" from ivory to dark and measured **1.00:1 navy-on-navy** — the same
invisible-text defect, newly created by the fix for it. Before changing any
colour, check which hero the page uses, and measure the rendered contrast
afterwards. The static gate only pins the two known-bad `.detail-hero`
patterns; the browser check in Phase 8 is what covers the general case.

`--brass #c4783a` on ivory measures 3.01:1 — acceptable for large bold text,
below AA for body text.

**Dates.** Every page shows `Updated <date>` in its byline, and that date equals
the page's schema `dateModified` and its sitemap `lastmod`. All three come from
the same source: the newest commit where the text inside `<main>` actually
changed. Never hand-write a date, and never stamp them all the same.

---

## Known accepted exceptions

These are current `audit` warnings that are deliberately not fixed. Do not
"fix" them silently; they need an owner decision.

- **11 legacy pages state a down-payment percentage** (`/buyers/programs/`,
  `/buyers/va-loans/`, `/invest/strategies/dscr-loans/`, and others). Reg Z
  exposure. Pending attorney review. New pages must not add to this list.
- **`--brass` link colour fails AA at body size sitewide.** Brand-level
  decision, not a page defect.
- **`/sell/` ships a stale duplicate JS bundle** (`s.c7400d9a1d.js`, 35KB)
  containing an old `recalcLtr` with the vacancy double-subtraction bug. The
  page renders no calculator UI, so no wrong number is shown to a user, but the
  dead code is a landmine and wasted bandwidth.
