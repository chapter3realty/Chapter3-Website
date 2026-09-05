# Handoff

What a new session needs that is not in the code.

`CLAUDE.md` has the rules, `PLAYBOOK.md` the procedure, `MISTAKES.md` the 41
logged mistakes and what now prevents each. **Read those first.** This file is
only the things they do not say: who you are working with, real-world facts you
cannot infer, what is in flight, and what is unresolved.

Written 2026-07-30. State section rewritten 2026-08-14.

**Start with "State as of this writing" below.** The site was offline for
roughly two weeks and is coming back up on 2026-08-14 on the owner's
instruction. There is re-indexing work outstanding and it is listed there.

---

## Who you are working with

**Devin Day** is the person in the chat. Operations Officer, licensed MLO
(NMLS 2721275). He builds and runs the site himself.

He is **not a real estate agent** and Chapter3 is **not a lender**. Both are live
licensing distinctions, not preferences. `audit` fails the build on any phrasing
where the brokerage appears to provide credit; that gate exists because "we
underwrite" had shipped on two pages.

**Timothy Nash** is Broker-in-Charge, SC licence 43182, 30+ years on the
Grand Strand. He is the byline author on every page and the correct home for any
claim about transaction experience.

**How he reviews.** He opens pages and reacts to what he actually reads. Expect
two to four rounds on any content batch. Round one catches business and voice
problems, later rounds catch specifics. Do not treat round one as done.

**"Hard code that"** means add a gate to `build.js` that fails the build. Not a
note in a document. He has said it repeatedly and means it literally.

**He is usually right about his own market.** He said the HOA pages were too
complicated twice. Both times the response was to lower the reading level, and
both times that was the wrong fix: the pages already scored grade 4.8 to 6.8 and
the real defect was that they were written about the industry rather than about
the buyer. See PLAYBOOK A11a.

---

## Facts you cannot infer from the repo

- **The site launched early May 2026.** Roughly three months old. Git history
  starts later and will mislead you. Never date the business from commits.
- **He deploys. You never do.** There is **no git remote.** Deployment is
  `npx wrangler pages deploy chapter3realty --project-name chapter3realty
  --branch production`, run by him from PowerShell. `--branch production` is
  required; without it Cloudflare treats it as a preview and the live site never
  changes.
- **Paul Hankins was removed 2026-07-28.** `RESTORE-PAUL.md` is the map back.
  Do not revert the commit, it also carries a CSS fix. On 2026-08-14 the owner
  confirmed he stays off for the relaunch. He may still return later; that is
  his call and nothing in the repo should pre-empt it. His photo is still at
  `chapter3realty/team/paul.jpg`, referenced by nothing, so the restore stays
  mechanical. One stale claim about him outlived the removal by two weeks: see
  `2dc8dd1`. If he does come back, check for prose that describes him without
  naming him, not just for the string "Paul".
- **IndexNow is already configured** under key
  `100285c38d874e7992b8bfc0b1d868a1`, live at the site root. Do not mint a new
  one. `indexnow.ps1` reads the sitemap at run time so it cannot go stale.

---

## State as of this writing

**The site is coming back up.** On 2026-08-14 the owner asked for it, in his
words, turned back on and returned to the original site with Paul off it.
`functions/_middleware.js` line 41 is now `MAINTENANCE_ON = false`, committed in
`2dc8dd1`. **It is committed, not deployed.** Until he runs wrangler the live
site still returns 503, so check before assuming.

That deploy releases everything held since `771e91d`, which is thirteen commits
and eight new `/hoa/` pages. `git log 771e91d..HEAD` is the list.

### What he did not say

He did not say the South Carolina licensing review is resolved. He said to turn
the site on. Those are different statements and this file should not merge them.
If a later session needs to know the review status, ask him, do not infer it
from the fact that the site is up.

The two rules from that period that still stand on their own merits:

1. **Do not modify published content in order to change how the site's history
   appears.** If his attorney advises a specific change, that is him acting on
   counsel and is fine. A session should not design it.
2. **SEO is not the deciding variable** on anything about the site being up or
   down. That call is his and the reasons are not ranking reasons.

### Re-indexing work, outstanding

This is the live to-do list from the outage. None of it is done.

- Confirm the deploy actually landed:
  `curl.exe -sI https://chapter3realty.com/ | Select-Object -First 1` should
  return 200. Allow a minute for propagation; a 503 immediately after deploying
  is usually the edge, not a failure.
- **Check the Cloudflare dashboard for a `MAINTENANCE` environment variable.**
  The middleware reads `env.MAINTENANCE !== "1"`, so a leftover dashboard value
  of `1` keeps the site down no matter what line 41 says. Maintenance was armed
  from the file, so it probably was never set, but a 503 after a correct deploy
  points here first.
- Run `indexnow.ps1`. It reads the sitemap at run time so it cannot go stale.
- Resubmit the sitemap in Search Console.
- **Twelve URLs still need manual indexing.** He ran out of daily quota partway
  through the list. Spend the homepage's quota first: it is recrawled soonest
  and pulls the rest along behind it.
- Expect a dip in the graphs and do not react to it. After a two-week outage,
  plan for re-indexing work rather than instant recovery. The eight `/hoa/`
  pages have never been crawled at all.

**A page for BrickWood** lives at
`brickwood-partnership/brickwood-recommended-brokerages.html`. Finished for now.
It is not part of the site build and is not deployed by wrangler.

---

## Contradictions: one resolved, one still open

**1. Affiliation. RESOLVED 2026-07-30.** The owner states Chapter3 does not
own BrickWood. Three pages had said the two were "affiliated businesses under
common ownership"; they now use the same wording as the other 81, which
discloses the referral benefit without asserting ownership. Zero pages claim
common ownership.

Still open for compliance counsel, not for a session to decide: an Affiliated
Business Arrangement can exist without common ownership, so whether the full
RESPA AfBA disclosure is required here is a separate question from the
ownership fact. Every page still carries the referral-benefit disclosure and
the you-are-free-to-shop sentence.

**2. Condotel financing as an expertise claim. RESOLVED 2026-08-30.** The
owner's words, verbatim: *"we have a lender partner who advised us and reviewed
these things but never talk as if we finance the loan always as BrickWood
Finances the loan."*

So the knowsAbout claim and the financing pages STAY. The content was reviewed
by the lender partner, and explaining how something works is not a lender
claim. What changes is voice, everywhere, permanently:

- **Never write a sentence where Chapter 3 is the actor doing the lending.**
  Not "we finance", "our loan", "we can get you", "we offer", "our rates",
  "we approve", "we lend".
- **Name BrickWood as the lender when a lender is the actor**, or use the
  neutral "your lender". BrickWood is NMLS #189497; any body reference to
  BrickWood still pulls in the RESPA AfBA disclosure inline on that page
  (non-negotiable 4 in CLAUDE.md, unchanged).
- This is now a first-class writing rule, equal to the no-metaphors rule. It
  needs a `build.js` gate: error on a first-person lending verb in body copy.
  See the task list below.

---

## Facts that were expensive to establish

Do not re-derive these and do not trust a search summary over the primary source.

- **The "$100 HOA fine cap, 14-day notice, adjudicatory panel" is not South
  Carolina law.** Every competing article states it as law. It is bill language,
  filed as S.30 (2009-10), S.218 (2011-12) and S.819 (2013-14), dead in
  committee all three times. Read `t27c030.php` directly.
- **The 48-hour budget-notice rule has a carve-out.** 27-30-140(2) exempts any
  association incorporated under the SC Nonprofit Corporation Act, which is most
  of them. Never state the rule without it.
- **27-30-130(B) covers only rules and regulations**, not the declaration or
  bylaws. 27-30-150 reaches only the annual budget and membership list, and only
  for associations not subject to the Nonprofit Corporation Act.
- **Unpaid dues follow the unit.** 27-31-220 makes a buyer "jointly and severally
  liable with the seller." SC sets no cap on what an association may charge for
  the payoff statement, unlike Florida.
- **South Carolina has no HOA turnover requirement at all.** No percentage-sold
  trigger, no deadline. The declaration governs, and the declarant wrote it.
- **Fannie Mae LL-2026-03 replaced Selling Guide B7-3-04** in March 2026,
  effective for applications from 2026-07-01. The live Guide page still shows
  superseded text, which is exactly how a careful writer gets it wrong.
- **IRS Publication 530 lists HOA fees under "Nondeductible payments."**
  Publication 527 never mentions them, so you may not write "the IRS says they
  are deductible on a rental."

### Do not publish

- **"Insurers pay $3 for every $1 collected here."** He heard it from a local
  realtor. It implies a 300% loss ratio; NAIC data does not support it. Fact-
  checked and rejected.
- **A "typical" loss assessment default limit.** No primary source found.
- **A "typical" HOA document fee or turnaround.** Same reason. His own observed
  figure is roughly three days, stated as how associations behave rather than as
  anything Chapter3 promises.

---

## Environment traps that cost real time

**Windows line endings break every hashed asset.** Git's Windows default
`core.autocrlf=true` rewrites LF to CRLF on checkout. Each asset filename
carries a hash of that file's contents, so the translation makes `preflight`
report every CSS and JS file as "edited but not rehashed", and the fix is not
to run `rehash`, which would rename the files and diverge the clone from the
repo. The repo now ships `.gitattributes` with `* -text`, and a Windows clone
also needs `git config core.autocrlf false` once, then a renormalize:
`git rm -r --cached .` followed by `git reset --hard FETCH_HEAD`.

**The owner's desktop folder is a git clone, not an unzip target.** Deploys
should go through `git fetch origin <branch>` and `git reset --hard FETCH_HEAD`.
Sending zips cost most of an evening on 2026-09-03: the download never saved,
so every extract silently had no source file, and a keep-list cleanup line ran
against the stale folder and deleted the live stylesheet.

- **Screenshots time out** because of the `c3-particles` animated canvas. Hide it
  first, then capture, or the call hangs.
- **The browser viewport can report 0x0**, which produces confident phantom
  measurements. Always assert non-zero before measuring anything.
- **In PowerShell `curl` is an alias for `Invoke-WebRequest`** and will not take
  `-sI`. Use `curl.exe`.
- **The scratchpad was wiped mid-session once.** Workflow journals at
  `subagents/workflows/*/journal.jsonl` are the recovery path; every draft was
  rebuilt from there. Do not keep the only copy of anything in the scratchpad.
- **Session limits killed subagents twice** mid-workflow. Check for partial
  results rather than assuming a clean run.
- **A deploy can report success while the custom domain still serves the previous
  build for a minute.** A 200 straight after deploying is usually propagation,
  not failure. Check again before changing anything.

---

## Open items

1. **42 pages was wrong; the real number was 9 and they are now fixed.** Left
   here because the mistake is instructive: the in-article CTA rule counted only
   `href="#lead-form"`, which exists solely on the generated `/hoa/` pages, so
   the entire back catalogue looked broken. Sanity-check a scanner against a page
   whose state you measured by hand before believing its count.
2. **HOA document analyzer tool.** Upload documents, half the report free,
   contact gate for the rest. Deferred by the owner as its own build.
3. **The HOA cluster is at 16 pages.** Past the point where another HOA page adds
   topical authority. His stated goal is 30 clusters; the next page is worth more
   starting a new one.
4. **`--brass` link colour measures 3.01:1** on ivory, below AA. Brand decision,
   recorded as a standing exception in `MISTAKES.md`. `--muted` body text was
   raised from 0.58 to 0.64 alpha and now passes.

---

## The two things most likely to cause a bad turn

**Deploying.** Never. He deploys. Prepare, commit, hand him the command, stop.

**Believing a scanner.** More than half the entries in `MISTAKES.md` are a check
that reported cleanly while being blind, or reported a defect that was not
there. Before you trust a count, run the rule against one case that should fire
and one that should not, and check the exit code rather than a filtered line.
Silence is not a pass.

---

## Owner decisions taken 2026-08-30, NOT YET IMPLEMENTED

He gave these four answers, then paused the session for a model handoff.
**STATUS 2026-08-30, overnight: ALL FOUR ARE SHIPPED** (commits 1be4d94
through 2009340), except that decision 3 needed no code: the contrast fix
had already shipped on 2026-08-15 at 0.78, darker than the approved 0.64,
and applying 0.64 would have been a regression (MISTAKES row 45). The
sections below are kept for the reasoning; the sweep summary lives in
research/relocating/owner-answers.md under the 2026-08-30 overnight
entries.

### 1. Reg Z: rewrite all ten percentage pages qualitatively

He chose the strictest option. **Remove every stated down-payment percentage
from page copy sitewide**, including the two that the old standing exception
protected: the VA funding-fee schedule and the FHA / SC Housing program table.
Write financing qualitatively ("a larger down payment and a somewhat higher
rate; we quote your real numbers"), so no trigger term exists and no
1026.24(d)(2) disclosure obligation can attach.

Keep the "0% down" carve-out: official commentary to 1026.24(d)(1) says "no
downpayment" is NOT a trigger term, so VA and USDA copy keeps it. Do not
strip that.

After the rewrite, the MISTAKES.md standing exception for those ten pages is
dead. Delete it and tighten the gate from "review" to an error.

### 2. Mobile 80 to 100: only invisible changes

His words: *"do whatever doesnt change any look or functionality of the site
and doesnt hurt SEO AEO or human consumption but dont get rid of the popup."*

That answer decides all four levers I offered him:

- **Self-host the fonts. YES.** No visual change, same two faces.
- **Extract the repeated inline scripts to shared hashed assets. YES.** No
  visual change; it is the committed next-batch item already. Lane B blast
  radius, so verify like every page.
- **Pause the hero canvas on mobile. NO.** He ruled out visible change.
- **Move GA behind first interaction. NO.** It would cost him bounce data,
  which is a functionality change.
- **The welcome popup stays.** Named explicitly. Do not remove, do not defer
  it into uselessness.

If 100 is not reachable inside that constraint, report the honest ceiling and
what it would cost to go further. Do not quietly break the rule to hit the
number.

### 3. Body text contrast: approved

Raise `--muted` from `rgba(28,32,40,0.58)` to **0.64**. Measured: 4.69:1 on
ivory and 4.52:1 on ivory-2, both clearing AA; currently 3.91 and 3.80. This
repaints every page, so measure the rendered contrast before and after on both
hero types (see the two-hero warning in CLAUDE.md) and delete the standing
exception in MISTAKES.md when done.

### 4. Financing voice: BrickWood lends, we never do

See contradiction 2 above, now resolved. The rule applies to every page on the
site, not just new ones, and needs a build.js gate.

---

## 2026-08-31 overnight: the plain-English mandate — SHIPPED

The owner banned the complete rhetorical-device and AI-register taxonomy
("Ban all of these for eternity across the universe... Ban it all HARDCODED
lets never have this conversation again") and asked for a full rewrite of
`/buyers/relocating/from-florida/`. Both are done and committed:

- Taxonomy in PLAYBOOK A11; enforced as **errors** in `build.js`
  (`AI_TELL_PHRASES`, `AI_TELL_REGEX`), positive-controlled. His verbatim
  message and the round log: `research/relocating/owner-answers.md`,
  2026-08-31 entry.
- Florida page rewritten (~40 line edits); the gates then caught 90+ more
  instances sitewide (indirect price verbs, calculator-disclaimer idioms,
  three fixes reverted by spec reassembly). All fixed at the source.
  MISTAKES rows 46-48 cover the three new failure classes.
- Preflight exits 0; page DOM-verified in a browser (body contrast
  6.95-7.34:1, calculator computes with FL preselected, zero page errors).

**Standing rule going forward: when he bans a phrasing, the ban lands in
build.js in the same commit as the fix.** A spec-generated page is only ever
fixed in its spec (`data/relocating/pages/*.js`), never in the built HTML.

Still with the owner (unchanged): deploy + PSI re-run, Maps key referrer
restriction, optional Cloudflare Insights toggle, 20 reading-level warnings
and 8 explicit-date warnings deferred to a daytime pass with him.

---

## 2026-08-31 later: answer-with-data + the search modal - SHIPPED

- Florida page: opening carries the insurance average instead of the tax
  caveat, insurance section is now a metro-by-metro table with an on-average
  yes, tax calculator sits at the top of the tax section (42% down the page,
  was 62%), FAQs lead with yes.
- Sitewide: non-promise hedging removed and gated; the pseudo-cleft gate was
  widened and caught 13 more instances, all fixed at source.
- Two accuracy fixes worth knowing: the SC age-65 and retirement deductions do
  NOT stack (four pages said they did), and Myrtle Beach is "among" the highest
  insurance in SC, not "the highest" (surveys disagree).
- The Grand Strand MLS Search is a modal on all 103 pages, not a page. A
  rebuild of it was **reverted at the owner's instruction on 2026-08-31** and
  every page is byte-identical to its pre-rebuild state. Do not rebuild it
  again without asking him first.

  What is still true and was measured: on a 390x844 phone the modal's sticky
  header and sticky footer leave about 18px of scroll for every filter, so the
  filters are effectively unreachable on a phone. He has seen the rebuild and
  did not want it. If it comes up again, the minimal fix is dropping
  `position:sticky` from `.idx-foot`, which is one declaration and changes
  nothing else.

  Its markup and CSS are duplicated per page rather than stitched from
  partials/, so any edit is a scripted 103-file replace; the blocks are
  byte-identical, which is what makes that safe.

  **Never publish a preview artifact with the modal forced open.** That is what
  made him think the homepage had broken.

---

## 2026-09-01: investor round 2 + /invest/j1-rentals/ - SHIPPED

Morning answers worked into about, hub, brrrr, flip, 1031, dst, str-tools,
small-multifamily; CTA test line ("ask for three current properties with the
full numbers run") on all 17 invest pages; new page /invest/j1-rentals/ built,
wired into sitemap, llms.txt and body links. PLAYBOOK A11e is the story rule:
real, attributed to the person and period, confidential, no blanket
disclaimers. The quiet-sale condo story is deliberately unpublished; see
owner-answers 2026-09-01 before anyone re-adds it. A reminder trigger is armed
until Devin sends the house-hack story, the multifamily story, and who rents
multifamily. New-page trap for the future: every hand-built page carries
`var CUR="<section-key>"` in its MAP script and the page-section div id must
be `page-<that key>`, or the whole page renders display:none (caught by the
browser check this round).

---

## 2026-09-01 evening: subheaders + punch gates, licence, story, agent voice - SHIPPED

Two new gate families in `build.js`, both positive-controlled on /about/:
`SUBHEAD` (hero sub rules, PLAYBOOK A14) and `PUNCH` (sentence rules, PLAYBOOK
A15). The audit went from clean to 644 errors when they landed; every one was
rewritten at source (specs for the 22 relocation pages, HTML elsewhere), then
the audit went back to zero. 92 hero subs rewritten or added (three pages had
none). Eight submarket H2s shortened, five pages got a keyword-bearing H2.

Company licence 28849 is in the footer partial (stitched sitewide) and on
/about/ beside Tim's 43182 / NMLS 252563. CLAUDE.md roster updated.

The quiet-sale story is published on the strategies hub, vague by owner
instruction (no state, no business, no building type, no unit count, "about
20 percent under market"). PLAYBOOK A11e records the override. Story voice is
now "an agent at Chapter3", never "Chapter3 did" (flip and inherited-house
changed).

**Open contradiction for Devin:** /buyers/relocating/ says "40 percent of
Myrtle Beach buyers" come from out of state; /sell/out-of-state-buyers/ says
"over 60 percent of Grand Strand buyers relocate from out of state". Different
framing, both unsourced on the page. The new subs avoid restating either until
he picks one.

Reminder trigger still armed for Q13 (house-hack story), the multifamily
story, and who rents multifamily.

---

## 2026-09-02 later: header phone, hub wording, local edge on strategy pages - SHIPPED

Owner review of the morning round: (1) the header showed two phone boxes; now
one bold text link, no box, measured at both widths (MISTAKES 59). (2) Two hub
sentences swapped to his wording: "Those relationships are why investors are
so successful with Chapter3 Realty" and "This is only one story illustrating
how Chapter3 benefits its investors with our relationships." (3) The six
strategy pages now carry four to six casual, specific reasons to use Chapter3
here, woven into the sections (PLAYBOOK A16), gated by `LOCAL EDGE` (min 4
pairing sentences under /invest/strategies/) and `SALESY` (desperate phrases
fail sitewide). Both positive-controlled: the local-edge gate fired on all six
pages before the weave, the salesy gate on a planted "Call today".

Still open for him: the 40 percent versus over 60 percent out-of-state buyer
figure (relocating hub versus /sell/out-of-state-buyers/), and the reminders
for the house-hack story, the multifamily story and who rents multifamily.

---

## 2026-09-02 evening: three strategy pages, and Reg Z rescoped - SHIPPED

The owner reviewed 1031, BRRRR and DSCR line by line. Three things worth
knowing next session:

1. **Down-payment percentages are now legal on four pages.** He asked what Reg
   Z requires; it does not reach business-purpose investor credit (PLAYBOOK
   A17, MISTAKES 61). DSCR, BRRRR, fix-and-flip and non-warrantable condos may
   state the range with the lender named. Owner-occupied stays qualitative,
   house hacking included. Numbers he supplied as a licensed MLO: 15 to 25
   percent down on a DSCR purchase, more on a condotel, about 25 percent on a
   non-warrantable building, and BrickWood writes DSCR loans down to a 0.75
   ratio.
2. **The DSCR page carries a live calculator.** Three inputs, `c3Dscr()`
   inline on the page. Measured at both widths: math right, readout contrast
   5.81, no horizontal scroll, no JS errors.
3. **Two new facts from him, both published.** BRRRR is scarce because the
   house must be distressed *and* sit where rent is strong, since the
   refinance is judged on rent. And the new-construction version: a builder
   whose finished houses appraise above build cost, with tenants lined up
   during construction about nine times in ten; one house took about $260,000
   of capital, half financed, and appraised at $390,000.

Still open for him: the cash-buyer page he wants to link to (sections are live
on BRRRR and fix-and-flip; the standalone page needs sourced local cash-share
numbers before it is worth building), the 40 versus 60 percent out-of-state
figure, and the three multifamily questions the daily reminder carries.

---

## 2026-09-02 late: the flip page, and invisible text found on the live site

The owner's review of `/invest/strategies/fix-and-flip/` turned up a defect he
could not name because he could not see it. Two paragraphs, the real-deal story
and the who-buys paragraph, sat inside the navy example box in `var(--muted)`
and measured 1.00:1. He reported it as "the example box has a really long
bottom part for no reason". That empty part was the invisible text. Fixed, and
gated (MISTAKES 63).

A full browser contrast sweep of all 105 pages ran afterwards. Result: those
two paragraphs were the ONLY truly invisible text on the site. Nothing else is
below 2.0.

**Open, and worth a decision from him:** the sweep found 121 elements between
2.0 and 3.0 contrast and 306 between 3.0 and 4.5, on 98 pages. Almost all of
them are one thing: the brass eyebrow labels, `var(--brass)` #c4783a on ivory
at about 11.9px, which measures 2.76:1 where small text wants 4.5. The palette
already carries `--brass-ink` #91592b for exactly this, and it measures 4.83:1
on ivory. Swapping the eyebrow colour token would fix roughly 120 elements in
one edit. It is a visible sitewide change, so it needs his yes, and brass on
navy backgrounds must NOT change (CLAUDE.md gotcha 1).

Also this round: the aphorism ban (PLAYBOOK A18, MISTAKES 64), the flip page
rebuilt to four costs with headers, wholesaling given its own section, the cash
section rewritten to say plainly that cash is stronger and that off-market is
how a financed buyer competes.

**One thing needs his answer:** the flip page says the inherited-house deal
sold at $335,000 and netted $224,300, which came from his own written answer on
2026-09-01. On 2026-09-02 he said verbally it was $390,000, not $335,000, and
asked the sub-header to say $130,000 profit. Those two sets do not reconcile,
and $390,000 minus $260,000 is exactly the builder example on the BRRRR page,
so the numbers may have crossed. The sub-header now names no figure until he
confirms which is right.

---

## 2026-09-03: cluster planning, buyer-page backlog, and the AEO research

### Subheader compliance, measured

All 100 indexable pages pass every hero sub-header rule. The 5 exempt pages are
noindex legal and utility pages that carry no hero. The gate was positive
-controlled four ways on `/about/` (a four-word sub, a question, we/our voice,
and no concrete anchor); each planted defect failed the build and the file was
restored byte-identical. The rule is enforced, not merely satisfied today.

### The eight buyer pages, ranked by call intent

Owner's decision 2026-09-03: build the investor tax cluster first, these next.
Each was checked against the site; none duplicates an existing page. Counts are
pages currently mentioning the phrase at all.

1. **Who pays your agent, and what you sign before touring.** Zero coverage on
   all three phrasings ("buyer agency agreement", "who pays the buyer",
   "buyer agent commission"). Since the 2024 rule change this is the question
   that precedes hiring anyone, so answering it plainly *is* the pitch.
2. **Zero down with a USDA loan in inland Horry County.** Three passing
   mentions, no owning page. Conway, Aynor, Loris and Green Sea are in eligible
   territory. Feeds BrickWood directly.
3. **Winning a multiple-offer situation without overpaying.** Zero coverage,
   including "escalation clause" and "appraisal gap". Latest-funnel page here.
4. **What a home inspection finds in a coastal house.** One passing mention.
   Stucco and EIFS, HVAC in salt air, crawlspace moisture, older oceanfront
   buildings. Where Tim's 30 years is visible and a national site is empty.
5. **Manufactured and mobile homes in Horry County.** One mention. Large share
   of this market, different financing, and the de-titling step catches people.
6. **Rent versus buy on the Grand Strand.** Zero coverage. Top of funnel, feeds
   every other buyer page.
7. **What credit score you need, and what to do if you are short.** One
   mention. High volume, early funnel, another BrickWood line.
8. **Title insurance and the attorney closing.** Four mentions, no owner. South
   Carolina requires an attorney at closing and most buyers here are out of
   state, so it surprises them.

**Held back, deliberately.** An affordability page ("how much house can I
afford") returns zero and has enormous search volume, but non-negotiable 3 bans
payment amounts and rates in copy, so it must stay qualitative and lean on
`/buyers/cost-to-own/`. Writable, but the hardest on this list to write inside
the rules. A "best time to buy" page also returns zero but ages badly and would
need date discipline forever.

**Not to be built:** an investor property-tax page. The 4 and 6 percent
assessment ratio is already on 17 pages with a dedicated `/buyers/property-taxes/`
and a working Horry County calculator. It is a link target, not a page.

### AEO: what actually decides whether a model recommends Chapter3

The owner's goal is that an assistant answering "who should I hire for this
investment in Myrtle Beach" names Chapter3. **That goal splits in two and the
halves are won by different things. Do not conflate them again.**

- *Informational* queries ("how does BRRRR work in Myrtle Beach") are won by
  the pages. Content is the lever and the cluster work is correct.
- *Recommendation* queries ("who should I hire") are mostly not won by the
  site. Published research puts roughly 85 percent of top-of-funnel brand
  visibility on domains the brand does not own, finds third-party mentions
  correlate about 3x more strongly with AI visibility than owned content, and
  attributes 70 to 80 percent of AI visibility to brand and third-party trust
  signals. The site is how a model *verifies* Chapter3 once something else has
  named it. The naming happens elsewhere.

**On-site state, measured 2026-09-03.** Entity markup is already strong and
should not be "fixed": `RealEstateAgent`, `telephone`, `PostalAddress` and
`sameAs` are all present on all 100 indexable pages, NAP reads 573 Vista Drive,
Murrells Inlet 29576 and +1-854-333-2135, and `llms.txt` plus `llms-full.txt`
are generated. Two real gaps:

1. **`sameAs` lists only Facebook, Instagram and YouTube.** Missing the
   profiles that actually drive local AI recommendations: Google Business
   Profile, Yelp, Foursquare, Zillow, Realtor.com, LinkedIn, and the SC licence
   lookup. This is entity resolution, it is how a model links the site to the
   business everywhere else, and it is a small edit with high leverage.
2. **Zero `aggregateRating` or `Review` markup sitewide.** Blocked until there
   are reviews to mark up. Never invent them.

**Off-site, which the owner must do and the repo cannot.** Ranked:
Google Business Profile completeness; review volume and rating; a claimed
Foursquare listing (BrightLocal found Foursquare powers 60 to 70 percent of
ChatGPT local results, and the effect is strongest in smaller towns, which
describes this market exactly); Yelp (a source in about 33 percent of searches
across industries); and genuine Reddit participation (Reddit is roughly 40
percent of citations across LLMs and about 47 percent of Perplexity answers).
Vendor blogs claim ChatGPT rarely names businesses under about 150 reviews and
averages 4.3 stars or better. **Treat those two figures as soft** - they come
from SEO vendors with an interest in the number - but the direction is
well-supported across independent sources.

**A tension to resolve, not to paper over.** The Princeton GEO study (Aggarwal
et al., KDD 2024, arXiv 2311.09735) measured citation lifts from inline source
citation, named-expert quotation, specific statistics, and confident prose, and
reports up to 40 percent visibility improvement, with the largest gains going to
lower-ranked pages. Four of those five tactics the writing rules already
enforce. One conflicts: the style rule bans naming the body that wrote a rule in
body copy, and naming sources is exactly what the study measured lifting
citation. The sources line partly covers it. **Ask the owner before widening
that rule; do not quietly relax it.**

**A caution on timelines.** The Seer GEO Olympics study (231,347 responses, 7
platforms, 52 days) found new content does not quickly override an existing
narrative: 1 in 5 factually correct responses still told the stale story three
weeks later. This work compounds slowly. Do not promise the owner a fast turn.

---

## 2026-09-05, round two: two facts he challenged were wrong, page two rewritten for the real query

**He was right twice.** Georgetown County requires NO business licence in its
unincorporated areas or in Pawleys Island (county FAQ, gtcounty.org
Faq.aspx?QID=116). A sentence claiming otherwise came from a search summary
citing a listing aggregator, was published on the accommodations page, and was
used to "correct" a rules-page sentence that had been right. Both fixed.
MISTAKES 67. Surfside Beach late penalty is 5 percent a month from June 1
(town FAQ); the chart had said "Ask the town".

**Page two is now `Can rental losses reduce the tax on your W-2 income?`**
Same URL. Active and passive income defined first. Rental pool defined in its
own section. Each test under its own heading. The $25,000 allowance stated,
with the distinction that a seven-day-average rental does not use it. "Hiring
everything out is fine if you do not need the loss against salary" is on the
page because he asked and it is true. All seven tests re-confirmed from
Publication 925. CTA is "Book a consultation call". His name is out of the
offer sentences on all five pages; A20 warns on them and that is accepted
until Tim's quotes arrive.

**New gate families** (positive-controlled): hedges ("not a verdict", "will
not tell you whether", "nobody can", "hard to undo"), two steps in one
sentence, and a heading in which the page disclaims itself. The disclaimer rule
was first written too wide and caught "What public records cannot tell you"
on `/sell/home-value/`, a literal heading; narrowed to the page as subject.
MISTAKES 68.

**The rule no regex holds, now in CLAUDE.md and PLAYBOOK A22:** define every
term before it is used. Active, passive, rental pool, basis, recapture. If the
reader has to already know it, the page has failed.

**Still open:** which "sliding thing" he meant on the homepage (the stats bar
was deleted; the review carousel was kept); Georgetown County finance for the
lodging totals column; Tim's five answers; the multifamily questions.

## 2026-09-05: the owner could not read the tax pages. All five rewritten, register hard-coded

He read `/invest/accommodations-tax/` for over an hour and understood none of
it. It had passed every gate. His review named the classes: spatial metaphors,
personification, idioms, asides, four-clause sentences for one-clause ideas,
and elaborating on a tax before saying what it was a tax on. **PLAYBOOK A22
and MISTAKES 66 record it. Read both before writing a sentence.**

What changed, all shipped in commit 8ca2afa:
- All five pages rewritten: short literal sentences, every section heading a
  question, the first heading defines the subject. His verbatim wording used
  wherever he gave it. One of his phrases, "when it comes to", is on the
  site's own banned list and became "for".
- `REGISTER_REGEX` in build.js errors on the phrase families, each named by
  type. "Catch" is banned outright. Client quotations are exempt.
- Strict tier: 28 words max, mean 16, But/Or/Yet openers, on the five pages
  and on every page with `datePublished` 2026-09-05 or later. Sitewide caps
  unchanged (MISTAKES 65).
- Question headings: strict pages need 60 percent and a question first; every
  other page warns below 50 percent.
- 56 backlog instances on 40 older pages replaced with literal words, in the
  built pages and in the seven spec files that generate them.
- Six positive controls passed both directions; files restored byte-identical.

**The sitewide question-heading audit he asked for**, measured 2026-09-05
before any rewrite outside the five pages:

| Cluster | Pages | Section headings | Questions | Ratio |
|---|---|---|---|---|
| buyers | 38 | 243 | 8 | 3% |
| submarkets | 9 | 194 | 0 | 0% |
| invest | 22 | 139 | 49 | 35% |
| hoa | 16 | 89 | 13 | 15% |
| sell | 7 | 38 | 5 | 13% |
| Sitewide | 100 | 724 | 79 | 11% |

52 pages have no question heading at all. Rewriting 645 headings is a
project, not a fix; the build now warns on every page below 50 percent so
the list is always current. Recommended order: submarkets (0 percent, 194
headings, the pages national brands cannot match), then buyers.

**Two pre-existing items were not touched:** the breadcrumb slash at 20
percent alpha and the eyebrow over the brass box on `/buyers/second-home/`.

## 2026-09-04: the investor tax cluster, all five pages built

Owner decisions that govern the whole cluster (2026-09-03): a CPA referral
exists but stays **unnamed**; the material participation page **teaches the
test and never applies it**, with no self-check tool; no quote is written for
Tim without his sign-off; "we could help" is written as an **offer**, never as
a track record.

| Page | Status | Preview |
|---|---|---|
| `/invest/accommodations-tax/` | built, gates 0, browser-verified | artifact 19ee51cf |
| `/invest/str-tax-treatment/` | built, gates 0, browser-verified | artifact 007b6443 |
| `/invest/cost-segregation/` | built, gates 0, browser-verified | artifact (this session) |
| `/invest/rental-depreciation/` | built 09-04, gates 0, browser-verified | preview-depr.html |
| `/invest/14-day-rule/` | built 09-04, gates 0, browser-verified | preview-14day.html |

Research files with every source, quote and hard limit: `research/invest-tax/`.
Every rate and rule on the three pages was read at its own source on the day
and is cited inline; the sources lines carry the read dates.

**Page four was rescoped, not dropped.** The owner said "write all of these pages" without answering the scope question, so the assumption was stated to him and acted on: page four became the everyday version (basis on closing day, the land split via the Horry County record, placed in service, repairs against improvements, allowed-or-allowable at sale). Page five ships without a personal-use calculator, matching his call on page two; one can be added later. The original reasoning follows for the record.

**Page four as briefed had no job.** The brief was "depreciation and
recapture when you sell: the land allocation, the 27.5-year schedule, what
comes back at sale". Since then `/invest/cost-segregation/` has taken the
27.5-year schedule, the land rule, and both recapture layers (ordinary income
on reclassified personal property, the 25 percent ceiling on the building),
and `/sell/capital-gains/` already owned recapture at sale with a calculator.
Run PLAYBOOK A1 against those two before drafting anything. The near-duplicate
check warns at 25 percent overlap and is a warning, not an error, so it will
not stop a duplicate on its own.

**Still unresolved, all needing the owner or a phone call:**
- Georgetown County finance, 843-545-3002, for the lodging totals column on
  the accommodations page. The seven published totals on `/invest/str-rules/`
  were never verified; Pawleys Island is disputed at 11 versus 12 percent.
- North Myrtle Beach: a rental counts as a licensed business **on the owner's
  word** (2026-09-03), not the licence office's. If challenged, the answer is
  a call to 843-280-5585.
- The five questions for Tim that would give every page an attributed
  sentence (A20). Asked 2026-09-03, unanswered.
- The three multifamily questions on the daily reminder. His "no story" of
- **Two pre-existing contrast items found 2026-09-04 while verifying, not fixed, not mine.** (1) The breadcrumb separator `/` renders at 20 percent alpha ivory on navy heroes, 1.82:1. It is decorative and sitewide; changing it is a design decision. (2) On `/buyers/second-home/` the eyebrow inside the brass box measures 2.23:1 (0.7-alpha ivory over brass). It belongs with the pending brass decision. Both sit outside the selector set the established checker measures (p, h1-h3, td, th, a, li); they surfaced only when spans and divs were added in report mode.
  2026-09-03 was about the accommodations page only.

**Gate behaviour worth knowing.** Across three pages the build caught 25 real
defects in first drafts, most often: the 62-character title limit, the 165
-character description limit, sentence fragments opening with a conjunction
(". And", ". So"), the "which is why" join, pseudo-clefts, one filler
"actually" per page, and the A19 rule counting **hosts** not links, so two
citations to irs.gov count as one source. Draft against those before running
the audit.

---

## 2026-09-05 evening: homepage, two redesigns rejected, original restored

**Sequence.** He asked for a declutter (commit e177fe9). He opened it and said
"that's really bad": three navy bands stacked, the review carousel boxed in the
hero, and the badge row showing "8" where "Instant" should be, because the
count-up keyed to `.why-stat:nth-child(2)` rewrote it on scroll (MISTAKES 69).
The page was rebuilt as a simple six-section layout (commit 736552b). He said
"go back to the original design". The homepage is now the file from before the
declutter (`git show e177fe9^:chapter3realty/index.html`) with three changes:
the current header chrome stitched in (the mobile phone icon lives in the
partial and every page carries it), the CSS hash updated, and the analyzer
heading "Try our investment analyzer", which he asked for twice. Everything
else from the declutter is undone: the ticker is back, the four stats are back
(30+, 8, 24hr, 1:1), "A new chapter for Grand Strand real estate." is back,
the "Let's have a real conversation." section is back, the reviews are back in
the hero, the effects script is back.

**Measured after a full scroll (A29a), desktop 1366 and mobile 390.** Stats
read 30+, 8, 24hr, 1:1 after the count-up. No reveal element left hidden. All
three team photos loaded. No horizontal overflow. One H1. Ticker present.
Carousel advances. No page errors. The only text under 4.5:1 is the brass
eyebrow "Common Questions", the standing brand exception (open item 4).
Preflight 0.

**Lesson.** Two homepage redesigns in one day, both rejected. The next
homepage change starts with a preview he approves before `index.html` is
touched. Do not turn "declutter" or "simple" into a layout; show him one and
ask.

**Kept from today.** The count-up gate in `build.js audit`, PLAYBOOK A29a,
MISTAKES 69. The original stat row matches the count-up targets, so the gate
passes.

**Two parser facts that cost time.** The hero sub-header must be
`<p style="color:rgba(244,239,232,...` with the style attribute FIRST in the
tag, or `heroSub()` in `build.js` does not see it and the audit fails "no
hero sub-header". And `initReveal()` in the effects script adds `.sr`
(opacity 0) to `.section-h2`, `.chooser-card`, `.why-stat`, `.accordion-item`
and others on every page that loads it; a capture taken without scrolling
shows those elements missing. Scroll first, then capture.

**The previews were the problem.** Every homepage preview sent today came
from a builder that dropped all nine `<style>` blocks in the page head
(MISTAKES 70). The preview showed five reviews stacked in the hero, unstyled
cards, the search form printed at the foot of the page and no team photos.
He judged the declutter, the simple rebuild and the restored original through
that preview and rejected all three. His "no revert it back to the actual
original" came after a broken preview of a page that already was the
original. The builder is fixed and committed as `tools/mkpreview.js`
(`node tools/mkpreview.js /path/ out.html [source-file]`). All six previews
are republished from it.

**His morning list, verbatim, so nobody re-derives it.** "...the facts a
seller may hide. Delete / every chapter starts at home. Delete / The sliding
thing at the top delete / Make the call button on mobile an icon of a phone
and keep the phone number on the desktop version / Call if you have any
questions: 854.333.2135 Remove on home page / Should I buy this house?
replace with 'try our investment analyzer'..." The full text is in the
session transcript. "The sliding thing at the top" is the ticker. That closes
the open question.

**Where it stands.** The repo homepage is the original design plus two items
from that list he asked for explicitly: the mobile phone icon (header
partial, every page) and the analyzer heading. Two corrected previews are
published: the original, and the morning declutter version with the "8" hook
removed (https://claude.ai/code/artifact/ed70c80b-b15a-4929-aff5-b940df51cb39).
He has not said which he wants. Touch nothing on the homepage until he does.

Preview of the original: https://claude.ai/code/artifact/021ff216-8e61-4316-b164-72b0175adc35

## Suggested order for the next session

0. **The homepage is back to its original design.** Any further homepage
   change: mock it up in a preview, open the rendered preview yourself
   (MISTAKES 70), get his yes, then touch `index.html`.
1. **Owner review of the five tax pages** from the previews. Expect line edits;
   apply them to the built page (these are hand-built, not spec-built), then
   dates, preflight 0, browser measure, republish the preview.
2. **Add the lodging totals column** once Georgetown County confirms.
3. **Tim's five answers** into all five pages, one attributed sentence each,
   which clears A20 across the cluster.
4. **Optional: a personal-use split calculator** on `/invest/14-day-rule/`
   if the owner wants one. Days rented over total days used; no verdict.
5. **The eight buyer pages** in the 2026-09-03 section, in the order ranked.

**Do not deploy.** He deploys from PowerShell after `git fetch origin
claude/github-account-check-wutg8b` and `git reset --hard FETCH_HEAD`, then
`node build.js preflight` must exit 0, then
`npx wrangler pages deploy chapter3realty --project-name chapter3realty --branch production`.
