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

**A11. Literal and direct.** Say the thing itself, in the plainest words that
carry it. This is a standing owner instruction (2026-08-30/31: "stop ever
saying anything besides the direct literal way of saying something").

**Banned for good, sitewide — rhetorical devices:** metaphor, simile,
hyperbole, understatement, personification (numbers, taxes, states, bills and
buildings do not *sit*, *move*, *follow*, *send*, *seal*, *outgrow* or *do*
anything), idiom, irony, sarcasm, oxymoron, synecdoche, metonymy, pun,
allegory, euphemism, innuendo, allusion, circumlocution, hedging,
equivocation, passive-aggressive or indirect speech acts.

**Banned — AI-register constructions:**
- pseudo-clefts and wh-clefts: "What X does is Y", "What you give up is Z",
  "If what you want is…". State it directly: "X does Y." "You give up Z."
- contrast framing: "not just X, but Y", "isn't just about X".
- tricolon for effect, and "No X. No Y. Just Z."
- false suspense: "Here's the kicker", "Here's the thing", "The truth is,".
- grandiose conclusions: "testament to", "enduring legacy", "underscores".
- ornate metaphor stock: tapestry, symphony, beacon, lighthouse, uncharted.
- therapist-speak, physical-shorthand stacking, sensory fixations.
- anaphora (the same opener repeated across clauses for rhythm).
- indirect number verbs: prices, rates, bills and premiums never *run*,
  *sit at*, *move*, *fare* or get *held down*. They **cost**, **are**,
  **average**, or **are taxed**.

**Banned — vocabulary:** delve, leverage, harken, resonate, unlock, navigate,
encapsulate, underscore, foster, crucial, pivotal, testament, vibrant,
dynamic, multifaceted, bespoke, game-changing.

Also standing: no question headers as hooks, no em dashes.

→ *Verify:* `audit` **errors** (not warns) on all of it: the `FIGURATIVE`
list, `AI_TELL_PHRASES`, and `AI_TELL_REGEX` in build.js, scanned across the
full claims surface (prose + title + meta/og/twitter descriptions + JSON-LD).
All positive-controlled. When the owner bans a new phrasing, add it to the
list in the same commit as the fix; that is what "never have this
conversation again" means.

**A11a. The buyer test. Apply this before any readability check.**
For every sentence: *would a buyer, standing in the property, do anything
differently because of this sentence?* If not, cut it.

This exists because the `/hoa/` batch passed every readability score, at grade
4.8 to 6.8, and the owner still could not follow it. **Reading level was not the
defect. Subject matter was.** We wrote about the industry instead of the buyer.

Fails the test, cut on sight:
- **which body wrote a rule.** Never name Fannie Mae, Freddie Mac, a Selling
  Guide, a Lender Letter, the NAIC, an insurance institute or a state
  department in body copy. Say "your lender will require" and move on.
- **when a rule took effect.** No effective dates, no enactment years, no "as
  of March 2026", no "for applications on or after". Two dates per page, and
  only where the date is the point.
- **how a statute is built,** what it does not say, or which section it is.
- **market-wide figures** a buyer cannot act on: insured values, counts of
  associations in a state programme, percentages of exposure.
- **how we verified something.** That belongs in the commit message.

Passes, keep:
- what you are responsible for and what the association is
- what it could cost you
- what to ask for, and when
- what goes wrong if you skip it

→ *Verify:* `audit` errors on a hero sub-header over 45 words and a sources
block over 90 words; warns on 3+ industry bodies, more than 2 dates, and under
2 in-article CTAs on a page over 900 words.

**A11d. Answer the question, with the number.** A page that raises a
comparison must answer it. Lead with **on average, yes** or **on average, no**,
then the figures, then what changes it for this buyer. Never answer with a
refusal to answer: "we will not promise", "nobody can promise", "we cannot say"
are banned and gated. Averages are a point of reference and the page says so in
those words; the individual quote or calculation comes after. Standing owner
rule 2026-08-31: *"give actual data and say on average yes or no whenever it
shows on the site."*

A required legal disclaimer on one household's numbers ("that is one family's
math, not a promise") is not a hedge and stays legal.
→ *Verify:* `audit` errors on the non-promise phrases in `AI_TELL_PHRASES`.

**A11b. The sources line is a list of links, not a second article.**
Three to five entries, each a short plain name and a link. Never quote the
statute, never list section numbers, never write "enacted text read and
re-verified". Under 90 words including link text. One page shipped 1,022.

**A11c. Two calls to action inside the article.** One about a third of the way
down, one before the last section. A single ask in the hero gets buried. 45
pages on this site currently ship with none in the body at all.

**A12. Gloss every jargon term** on first use, in the same sentence.

**A13. Show the reasoning, not just the conclusion.** Firsthand process and real
(anonymised) client files are the one thing competitors cannot copy, and the
strongest signal for both Google and AI answer engines.

## Phase 5 — Compliance, BEFORE the copy is mirrored anywhere

Do this before generating JSON-LD, `llms-full.txt` or the sitemap entry.
Fixing copy afterwards means fixing it in four places.

**A14. Regulation Z.** The four triggering terms in
[12 CFR 1026.24(d)(1)](https://www.consumerfinance.gov/rules-policy/regulations/1026/24/),
quoted verbatim, are:

1. "The amount or percentage of any downpayment"
2. "The number of payments or period of repayment"
3. "The amount of any payment"
4. "The amount of any finance charge"

State any one and 1026.24(d)(2) requires you to also publish the downpayment,
the full repayment terms, **and** the APR using that term.

**Scope, which is the part people get wrong.** 1026.1(c) applies Reg Z to those
who *offer or extend* credit. A brokerage is not a creditor. But 1026.24(a) is
written about "an advertisement for credit", and this brokerage has a disclosed
affiliation with a lender and an MLO on staff, so the safest reading is that
financing copy here can be treated as credit advertising.

Separately, the **MAP Rule (Regulation N, 12 CFR 1014)** covers "any person",
and real estate brokers are named in the rulemaking as likely respondents. But
Reg N prohibits *material misrepresentations* about mortgage terms — it does not
turn an accurate figure into a violation. Accuracy is the defence there.

**Practical rule for new pages:** write financing qualitatively. "A larger down
payment and a somewhat higher rate; we quote your real numbers." Then no
trigger term exists and no disclosure obligation attaches.

Since 2026-08-30 this is enforced, not advised: `audit` ERRORS on any stated
down-payment percentage (only "0% down" / "no down payment" passes, per the
official commentary), any stated lending rate or loan-payment amount, and any
em dash in body copy.

**A14a. The financing voice rule (owner, 2026-08-30).** Chapter 3 is never
the actor doing the lending. BrickWood lends, or "your lender" does. "Our
lending partner" and "our financing partner" are the approved constructions;
"our mortgages", "we finance", and "in-house" beside any lending word are
errors, and the gate scans meta descriptions and JSON-LD too, because the
"in-house mortgage lender" claim once lived in two SERP snippets.

→ *Verify:* `audit` tiers every `N% down`. **HIGH** means the figure sits within
500 characters of the affiliated lender inside `<main>` — that is the closest
thing to an offer and should be rewritten. **review** means it is describing a
government program or the market, which is far weaker ground for calling it an
advertisement.

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

**A38. `node build.js dates`.** Never type a date anywhere — not in the byline,
not in `dateModified`, not in `lastmod`. The command derives each page's date
from git, by finding the commit where that page's prose actually changed, and
writes the same value to all three places.

Why it is a command and not a judgement call. Every hand-made version of this
went wrong: all 54 URLs stamped to one day (a sitemap where every date matches
reads as auto-generated and Google discounts all of it); `llms-full.txt` dated
by UTC clock to a day that had not happened; 30 pages carrying two different
`dateModified` values; and a page counted as edited because the only change was
the date stamp the process had just written to it.

What it deliberately ignores: nav, CSS, asset hashes, the legal-entity name, and
markup-only edits. Wrapping existing words in a link does not age a page.
`datePublished` is never moved; the command aborts if a change would move it.

→ *Verify:* `preflight` runs `dates --check` and fails on any drift.

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
4. `node build.js dates` — never decide a date yourself. It works out whether
   the prose changed and updates all three date fields, or leaves the page alone.
5. `node build.js preflight` → must exit 0.
6. Browser-verify the changed region using Phase 8 checks.
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

---

## Taking the site offline

`functions/_middleware.js`, line 41. One word.

```
const MAINTENANCE_ON = true;    // down: every URL returns 503
const MAINTENANCE_ON = false;   // live
```

Then deploy. That is the entire procedure. Cloudflare Pages needs a deploy for
a dashboard environment variable to take effect anyway, so the dashboard buys
nothing and gives you something to forget to switch back.

**503, never 200.** A maintenance page served with a normal status gets its
content indexed for every URL on the site, so Google sees 69 identical thin
pages and can drop them. 503 means temporary: URLs keep their place and Google
retries. `Retry-After` says when.

**Verify after every flip**, because a deploy that reports success can still
leave the old deployment on the custom domain:

```
curl.exe -sI https://chapter3realty.com/ | Select-Object -First 1
```

`curl.exe`, not `curl`. In PowerShell `curl` is an alias for `Invoke-WebRequest`
and will not take these flags. Allow a minute or two for the edge to update; a
200 immediately after deploying usually means propagation, not failure.

Everything 503s including `robots.txt` and `sitemap.xml`. That is correct.
Googlebot backs off for the duration instead of recording page-level errors. Do
**not** additionally add `Disallow: /`, `noindex`, or remove sitemap URLs. Those
say permanent, and permanent is what costs rankings.

The IndexNow key file is exempt so search-engine verification survives.

`https://chapter3realty.com/?preview=letmein` sets a 24-hour cookie that shows
you the live site while visitors see the notice.

**Keep it under a week.** Past roughly two weeks Google treats a persistent 503
as real and URLs start dropping. Newly indexed pages fall out first.

Coming back: flip to `false`, deploy, confirm 200, run `indexnow.ps1`, resubmit
the sitemap in Search Console, then spend that day's quota on the homepage and
strongest pages.
