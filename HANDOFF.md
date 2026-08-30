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

**Timmy Fredrick Nash** is Broker-in-Charge, SC licence 43182, 30+ years on the
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

## Suggested order for the next session

Highest risk of silent damage first, because every one of these is a sitewide
edit and this site's two worst defects both came from edit passes.

1. **Build the gates before the edits.** A first-person-lending gate and a
   tightened down-payment gate. Positive-control each one (plant, fire,
   restore, exit 0) before trusting it. Rule 4 in CLAUDE.md.
2. **Reg Z rewrite** on whatever the tightened gate lists.
3. **Financing voice sweep** on whatever the new gate lists.
4. **`--muted` to 0.64**, measured both directions.
5. **Fonts self-hosted**, then **scripts extracted**, then re-measure mobile.
6. **Early-page audit** for banned phrasing and stale facts. The oldest pages
   predate most of the style rules; `node build.js audit` currently reports
   ~108 review-tier warnings and they have never been swept as a batch.
7. `node build.js preflight` must exit 0, then browser-measure, then commit.

**Do not deploy.** He deploys from PowerShell:
`npx wrangler pages deploy chapter3realty --project-name chapter3realty --branch production`
