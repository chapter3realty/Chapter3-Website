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
- **He deploys. You never do.** The remote is `origin`, which is
  github.com/chapter3realty/Chapter3-Website; sessions push to branch
  `claude/github-account-check-wutg8b` and he pulls it into his clone. The
  deploy is four commands run **inside the clone folder**: `git fetch origin
  claude/github-account-check-wutg8b`, `git reset --hard FETCH_HEAD`,
  `node build.js preflight` (must exit 0), then `npx wrangler pages deploy
  chapter3realty --project-name chapter3realty --branch production`.
  `--branch production` is required; without it Cloudflare treats it as a
  preview and the live site never changes. Always give him the `cd` first.
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

- **`C:\Users\DevinDay` is itself a git repo, for `chapter3realty/loanofficer.ai`
  (found 2026-09-07).** A git command typed in a fresh PowerShell answers for
  that project, not this one, and it answers without error, which is what makes
  it dangerous. `git remote get-url origin` there returns loanofficer.ai.
  Wrangler run there says "your working directory is a git repo and has
  uncommitted changes" and then fails on the missing `chapter3realty` folder.
  Anything that shells out to git must set its own working directory first.
- **As of 2026-09-07 there was no Chapter3-Website clone on his computer.**
  Every deploy before that ran from a downloaded copy of the site (MISTAKES 76).
  `deploy.ps1` at the repo root now offers to clone to `C:\c3` and runs the
  whole deploy from there: find or make the clone, pull the branch, preflight,
  ask, deploy, then check the pages are live. Send him that file; it is the
  deploy procedure now.
- **A fresh PowerShell opens in `C:\Users\DevinDay`, not in the clone.** On
  2026-09-05 all four deploy commands failed there: no remote ref, no
  FETCH_HEAD, no `build.js`, no `chapter3realty` folder. His home folder also
  holds a git repo with a remote and no commits (wrangler warned "your working
  directory is a git repo"), so the failures read as git errors instead of
  "wrong folder". Every deploy instruction starts with `cd` into the clone.
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

**Where it stands, 2026-09-05 late.** He opened the corrected preview of
the declutter version and said "This page is not bad i didnt get to see this
before". That version is now the homepage, with his edits applied verbatim:
hero sub ends "with a specialized real estate agent"; analyzer heading "Try
our investor analysis tool" (its button went back to the live label "See the
investor analysis", my call, because the heading now carries the "try"); the
"Call if you have any questions" bar is off the homepage (`body.home`); the
eight badges are orange bold with a brass line icon beside each and a plain
sub line: 30+ years / On the Grand Strand; Instant replies / Weekends
included; Pawleys to NC; 1:1; Specialized agents / For investors, home
buyers, and sellers (his words were "special agents for..."; rendered as the
sub line); Free tools / Investor analyzer, cost of living calculator and
more; Permit data; Clear communication / We avoid confusion and stress. The
count-up hooks are gone, the badges are words. Measured after a full scroll
at 1366 and 390: all eight read as written, icons 30px brass, photos load,
no overflow, carousel advances, preflight 0.

**The Tim Nash photo.** From his Drive: "Timmy Nash - photos / Timmy Image
Main" (jpg, 670x768, seated on a bench). The file is link-shared, so a plain
download works: `https://drive.google.com/uc?export=download&id=176r0ztniTRxMvxSwj9wV4RUCTP_T3ETY`.
No PIL, sharp, cwebp or ImageMagick in this box; `tools/cropwebp.js` crops
and encodes through Chromium's canvas (`node tools/cropwebp.js in.jpg out.webp
sx sy side size quality`; this one used 115 100 440 330 0.86, head and
shoulders, to match the other two cards). Replaced in place at
`/team/timmy.webp`, which 30+ pages reference, so /about/ and the HOA bylines
show it too. Cloudflare caches the old file under the same name: purge the
cache for `/team/timmy.webp` after deploy or the old photo lingers.

**A gate fact.** The hero-sub keyword gate takes the homepage topic from the
title's first segment, "Myrtle Beach Real Estate, By the Numbers", and after
the weak-word filter wants "numbers" in the sub. His new sub has none. The
WebPage schema now carries `"keywords":"specialized real estate agent Myrtle
Beach"` (no space after the colon; the gate's regex needs that), which the
gate reads first, and the sub carries "specialized" and "agent". The title
still says "By the Numbers" while the sub now says "specialized agent"; that
is his call, not a gate's.

Preview of the page as it is now: https://claude.ai/code/artifact/021ff216-8e61-4316-b164-72b0175adc35

## 2026-09-05 late: the ticker deleted sitewide, and the black bands it was painting

**One object, two complaints.** "The little sliding thing at the top, delete
that from every page" and "there's a dark black gradient border on the 5 pages
we were working on" were the same element. The ticker had lost its base CSS in
an earlier cleanup and kept only its two edge-fade overlays, 100px of
`linear-gradient(...var(--navy))` running the full height of the element. On
ivory pages those are black bands down both sides of the hero. MISTAKES 71.

**Removed.** The markup block from all 108 pages (byte-identical on every one),
six CSS rules including the `@keyframes`, the `#c3-ticker` entry in the
print-hide selector, section 6 of `s.940d034594.js`, and the inline copy of
that section in the six older pages that carry the script inline rather than
loading the bundle (`/invest/long-term-rental/`, `/buyers/relocating/`,
`/buyers/first-time-home-buyer-myrtle-beach/`, `/buyers/retirees/`, `/terms/`,
`/privacy/`). Both assets rehashed: `app.650a027cfa.css`, `s.35fe572371.js`.

**Gate.** `build.js check` carries a DELETED list; any of `c3-ticker`,
`ticker-track`, `ticker-item`, `tickerData` or `@keyframes ticker` in a page or
an asset is a build error. Positive-controlled both ways. Add a row to that
list when he deletes the next component.

**Measured.** Eleven pages including all five tax pages, after a full scroll at
1366: no ticker element, no dark gradient, no console errors, no horizontal
overflow, header followed directly by main. Preflight 0.

**Next.** He said "then we will finish working on the pages", meaning the five
tax pages. Their previews are current.

## 2026-09-05 late: the tax-page review round, three pages, two more phrase gates

He reviewed the cost segregation, depreciation and 14-day pages from the
previews and sent one message with every edit. All applied. The accommodations
tax and short-term-rental tax pages had no notes and are unchanged.

**Cost segregation.** New H1 "How do you write off a Myrtle Beach condo faster
than 27.5 years?" with a 29-word sub. Hero button "Talk to a specialized
agent". The short answer now says what a study is, why it matters on a
furnished condo, and how it is done. A bar chart of the four recovery periods
(5, 7, 15, 27.5 years) sits above the recovery table; one hue, bars measured
proportional, the table below it is the accessible view. Two new H3s: a
round-number example ($400,000 condo) and a five-step "How is a study done?".
The rental-pool box is now "Want help finding your next investment?"; a second
box after the 1031 paragraph offers help with the exchange; the bottom CTA
reads "Have us help find your next investment."

**His question, answered from the source.** "Can I use a loss I cannot use
this year to offset rents next year, or do I need to wait to sell?" Pub 925,
re-opened today: a disallowed passive loss carries to the next year and is
deducted against passive income, which includes the rent from this unit and
from any other rental. No sale is needed. Whatever is still unused is released
in full when the whole property is sold in a taxable sale. The page, its FAQ
answer and the schema say exactly that. Quotes in
`research/invest-tax/material-participation-facts.md` and
`cost-segregation-facts.md`.

**Depreciation.** Sub rewritten as a 30-word statement. "Both are fixed on
closing day" deleted. "Get them right in year one" deleted, and the phrase
family is now banned (below). The split section is three question H3s: how to
find the land value on the Horry County record (six steps), what to do when it
is a condo, and how to calculate the yearly deduction (round-number example).
The short answer carries the brief version of all three. "before your CPA sees
it" is now "to help make it make sense".

**Two facts here are not fully verified.** The county's Land Records app is
behind a sign-in, so the page links the assessor department page and describes
the search in words. Whether a Horry County condo record shows a land line was
not checked against a live record; the page covers both cases (use the line if
present, otherwise the CPA sets the share from the master deed). The owner has
county access and can confirm one condo record. Noted in
`rental-depreciation-facts.md`.

**14-day rule.** H1 "How many nights can you use your own Myrtle Beach
rental? The 14-day rule." for the local query. Hero button "Speak to an
expert". The short answer ends "because they were never told this". The
building box is now "Consult an expert real estate agent". The expense-split
section has a worked example ($12,000 of costs, five sixths to the rental,
$1,000 carried forward).

**Two more phrase gates, positive-controlled.** REGISTER_REGEX bans "get it
right / get them right / get the X right" ("never say this again ever").
PUNCH bans the teaser build-ups "most articles leave out", "what nobody tells
you" and the family around them ("straight to the point no build ups"). Both
gates hit two other pages: `/hoa/violations-and-fines/` ("most owners miss
it" is now "few owners check it") and `/sell/fsbo/` (the "get it right"
disclosure line is now "Fill out the state disclosure form completely and
honestly the first time"). Fixed in the same commit.

**Audit facts learned this round.** The hero sub cap is 30 words, not 45, and
a sub may not be a question; both are in `build.js`, and CLAUDE.md and
PLAYBOOK A14 said 45 until this commit. "caught up" trips the catch ban.

**His strategy question, still his call.** He asked whether these pages should
carry more local information or more about Chapter3 for SEO and AEO, or whether
their job is credibility when a model is asked about us. Recommendation given:
the pages earn citations with checkable local facts, so keep them as they are;
Chapter3 credibility lives in schema, /about/, reviews and one short
"what we do here" section per page, which they already have. Waiting on him.

**Measured.** Preflight 0. Dates unchanged (all three pages were already dated
today). All five tax pages at 1366 and 390: no overflow, one H1 each, no
console errors, only the pre-existing brass eyebrow contrast exceptions.
Previews republished at the same three URLs.

## 2026-09-05 night: the next investor batch, ranked, owner choosing

He wants at least ten more investor pages before the weekend ends, and they
must produce investor customers, not only credibility. Ranked by call intent
first, then by the size of the gap on the site, then by whether a local fact
can go on the page that a national site cannot carry. Coverage was measured
with a term count that excludes the shared chrome; several words (furnish,
cap rate, golf, manufactured, boat slip) live in a sitewide block on every
page, so raw grep counts for them are meaningless (rule 4).

0. **`/invest/run-the-numbers/`, a conversion page.** Address plus strategy in,
   numbers back. The hub FAQ already promises this; every investor page links
   here instead of `/contact/`. Locked TCPA string if it takes a phone.
1. **Buying a rental from out of state.** Video walk-through, inspection,
   attorney closing by mail, management set up before closing. Two pages say
   "sight unseen" in passing, none owns it.
2. **Property management here: cost, questions, on-site program vs outside
   company vs self.** Eleven pages mention it, none owns it; `/invest/condos/`
   has one section. Never claim Chapter3 manages; fee figures need a source
   that can be re-opened or stay qualitative.
3. **Rental program vs Airbnb for an oceanfront condo.** Split, program costs,
   owner-use limits, exit terms, loan effect. No conclusions about a named
   building or program (non-negotiable 5).
4. **Where to buy a rental, by strategy: a submarket matrix.** Overlaps the hub
   FAQ paragraph and `/invest/str-rules/`; run A1. The seven lodging totals on
   the rules page were never verified.
5. **How much cash you need to buy a rental here.** Percentages are allowed on
   four investor-financing pages only; this page is qualitative unless he adds
   it to the list in `build.js`. His call, not a session's.
6. **Setting up a short-term rental after closing, in order.** Licence, tax
   accounts, HOA registration, furnishing, photos, listing, timeline.
7. **Mid-term rentals: travel nurses and the 90-day floor.** Zero pages say
   "travel nurse"; `/invest/str-tools/` has one section. Hospitals and lease
   lengths need sources.
8. **Foreclosures and the Horry County Master-in-Equity sale.** Zero coverage.
   Every procedural step from the county's own page, read on the day.
9. **Student rentals near Coastal Carolina in Conway.** Fourteen pages mention
   the university, none sells the product. Enrollment and occupancy rules need
   sources.
10. **Holding a rental in an LLC in South Carolina.** Three passing mentions.
    General only; deed, loan, insurance, tax; points to DSCR page and an
    attorney.
11. **Landlord rules: deposits, leases, notices, evictions in Horry County.**
    Zero coverage. Lower buy intent, reaches current owners (future sellers).
12. **Selling a rental with tenants or bookings in place.** `/sell/sell-my-condo/`
    has one section on bookings; run A1. The investor-seller page.

**Not for this batch, with reasons.** Rental insurance (the coastal insurance
page already owns the landlord and STR section); a cap-rate page (no local
source that can be re-opened for the numbers, rule 8); seller financing and
self-directed IRAs (thin local demand, no local fact); vacant land (a real
market, but zoning, septic and wetlands facts are too heavy for a weekend).

**Facts only he has, asked 2026-09-05.** Whether Chapter3 sets up or refers
management at closing and how it is worded (pages 1, 2, 3, 6 depend on it);
whether the cash-to-close page joins the percentage list.

**Context that governs the whole batch.** These pages win informational
queries. "Who should I hire" answers are won off-site (see the 2026-09-03 AEO
section); no page fixes that.

## 2026-09-06: investor batch 1, four pages built, plus a generator and two gates

He approved all twelve pages from the ranked list and asked for questions "no
AI knows". Batch 1 is the four highest on that list, built in rank order.
Previews: run-the-numbers b53ffca2, out-of-state 1a095913, property-management
abac4e3a, rental-program-vs-airbnb 7abeded4. All four are on the branch and
in the sitemap; preflight 0; browser-measured at 1280, 768 and 320 with no
contrast, overflow or console defects beyond the sitewide brass labels.

**How they were built.** `tools/mkpage.js` takes a spec in `specs/` and
clones the chrome of `/invest/14-day-rule/` byte for byte, rewriting every
identity field as one operation (title, description, canonical, og, twitter,
BreadcrumbList, WebPage, Article, FAQPage). It refuses to write if any donor
phrase survives, if the chrome outside the identity elements differs from the
donor, if the title or description is out of range, or if the hero sub is over
30 words or a question. Every page in the remaining eight should go through it.
Edit the spec, rerun, never hand-edit the page.

**Why the generator exists.** All five tax pages had been hand-cloned and
every one kept the donor's BreadcrumbList @id, WebPage.breadcrumb and
WebPage.mainEntity from `/invest/str-rules/`. Fixed on all five (markup only,
dates untouched) and gated: `audit` now errors when any page-identity @id
names another page. Positive-controlled.

**Two more findings, both fixed.** (1) Seven lead forms let a visitor send an
email-only request without the consent box, showed "Thanks", and sent nothing,
because the shared sender and the CRM both refuse a lead without consent. The
box is now required on all seven and verified in the browser on three.
(2) The browser harness itself sent one real test lead to the CRM (MISTAKES
72). The harness now blocks the CRM route at the network layer and stubs the
sender after load; PLAYBOOK A33 says so. He was asked to delete the test lead
("Test Person", 123 Ocean Blvd, test@example.com, run-the-numbers page).

**The conversion page.** `/invest/run-the-numbers/` is a form: address, plan,
notes, name, phone, email, the locked TCPA string. It posts through
`c3SendForm` with `interest` mapped onto the CRM's closed set ("STR / Vacation
rental" for a short-term plan, "Investment property" otherwise) and the plan
in `message`. It is in `CTA_DESTINATIONS`, so a boxed button to it is a valid
CTA, and the mid-page CTA gate counts it. Every batch-1 page's hero and boxes
point there.

**Facts and their limits.** Research files under `research/invest-next/`,
one per page, with every quote and a "Not verified" list. Every source cited
on a page was re-opened by the writer on 2026-09-06 before the spec was
written. Three limits worth knowing: no primary source exists for a Myrtle
Beach management-fee average, so the management page states none; Vrbo's tax
and liability pages could not be opened, so the rental-program page cites
only Vrbo's fee page; the Horry County ordinance that exempts an owner from
the county business license when a licensed company manages the rental was
retrieved by the researcher through Municode's API but could not be re-opened
by the writer, so it is not on any page.

**What A20 still needs.** None of the four carries an attributed sentence.
The question list sent to him on 2026-09-06 asks for exactly those facts; his
answers go in as one sentence each, then the A20 warnings clear.

**Wiring done.** Inbound body links from the invest hub (step 6, the condo
card, the run-the-numbers FAQ), `/invest/condos/`, and `/invest/14-day-rule/`
(link wrapped on existing words, so its date did not move). The hub and the
condos page moved to 2026-09-06 because their prose changed.

**Batch 2, in rank order.** Where to buy by strategy (A1 against the hub FAQ
and `/invest/str-rules/` first), cash to close (qualitative unless he adds it
to `DOWN_PAYMENT_OK_PAGES`), STR setup after closing, mid-term rentals. Then
foreclosures, student rentals, LLC, landlord rules, selling a rental.

## 2026-09-06: investor batch 2, four more pages, eight of twelve built

Built in rank order after batch 1, without waiting for his review, because he
asked for at least ten before the weekend ended. Previews: cash-to-close
33d26957, where-to-buy 877583a2, str-setup 138ec994, mid-term-rentals
3f3b063b. All four are on the branch, wired, preflight 0, browser-measured at
1280, 768 and 320 with nothing beyond the sitewide brass labels. Every source
cited on a page was re-opened by the writer on 2026-09-06.

**Cash to close.** Qualitative on the loan: no down-payment percentage, rate
or payment amount. The buyer-pays exceptions to the deed fee (foreclosure,
government and retirement-plan deeds) and the county's doubled license rate
for a business with no fixed place in the county are the two facts national
pages do not carry. Whether an out-of-state owner's rental counts as "no
fixed place of business" is the county's call and is in the question list.

**Where to buy.** A seven-row table over nine areas: county, nightly-rental
rule, license, local levies, fit. The fit column is our reading of the
market (the hub's established positions), not a rule. No price figures: the
MLS statistics site (coastalcarolinas.org) would not resolve, so prices link
to the market report. Three facts worth knowing: Georgetown County's tax
threshold is 30 days, not 90; Conway allows nightly rental only as a
commercial use in three downtown districts; and two state bills in committee
would rewrite every row.

**Setting up a short-term rental.** Eight steps in the order the sources
support. The state retail license is needed only for direct bookings. The
City of Myrtle Beach's own site gives two license years (June 1 on the FAQ,
renewals due April 30 on the division page); the page uses the division
page's April 30 and the FAQ conflict is in the question list. The county's
personal property return on furnishings is on the page because the county's
own inventory form lists beds, sofas and the refrigerator.

**Mid-term rentals.** The page's one claim that matters: inside the Myrtle
Beach city limits the floor is 90 nights, not the 30 that national advice
gives, because the city counts any stay under 90 days as a short-term rental
and R zones bar those. The counter-rule is the December 2024 conversion
overlay between Kings Highway and the ocean, where short-term buildings of
more than two units may not be leased for 90 days or more. That ordinance is
a scanned PDF; the writer could not machine-read it and quotes the codified
section the researcher read on Municode and OCR'd. If he wants a human read,
the city's copy is at cityofmyrtlebeach.com under "2024-069 Conversion
Overlay". Surfside Beach defines transient as under 30 days and long-term as
365 or more; the months between are undefined and the page says to ask the
town.

**Not on any page, deliberately.** Tidelands Health's site blocks fetches, so
Tidelands Waccamaw is named with its town only, no beds or address. No
furnished-rent figures exist anywhere primary; the page gives the federal
lodging rate for Horry County as the one public reference and says so. No
Myrtle Beach management-fee average exists; the management page states none.

**Research files.** `research/invest-next/` now holds eight files, one per
page. The mid-term file in commit 4f6bbda was the researcher's 561-line
draft, captured mid-task by `git add -A`; this commit carries the trimmed
final. Every file ends with "Questions only the brokerage can answer"; the
question list sent to him is drawn from those.

**Batch 3, the last four in rank order.** Foreclosures and the Master-in-Equity
sale, student rentals near Coastal Carolina, holding a rental in an LLC,
landlord rules and evictions, and selling a rental with tenants in place.
Same method: research file, sources re-opened by the writer, spec through
`tools/mkpage.js`, gates 0, browser measure, preview.

## 2026-09-06: investor batch 3, the last five pages, twelve of twelve built

Built in rank order after batch 2, same method: research file with verbatim
quotes, every cited source re-opened by the writer on 2026-09-06 (curl and
pypdf phrase checks, all confirmed), spec in `specs/`, page from
`tools/mkpage.js`, audit to zero errors, wired, `preflight` 0, browser-measured
at 1280, 768 and 320 (no low-contrast node, no overflow, one h1, consent gate
holds, no console error). Previews: landlord-rules 207d106d, llc aca79303,
foreclosures 59ebf067, student-rentals 19e1795e, rental-property f9f46d1b. The
five: `/sell/rental-property/`, `/invest/student-rentals/`,
`/invest/landlord-rules/`, `/invest/llc/`, `/invest/foreclosures/`. Inbound
body links were added by wrapping existing words on twelve pages (invest hub,
sell hub, dscr-loans, brrrr, fix-and-flip, cash-to-close, where-to-buy,
out-of-state, property-management, sell-my-condo, conway submarket), so no
page aged except the two hubs, already dated today.

**Selling a rental.** The withholding rate is the state's top individual
rate for the year of the sale (6 percent for 2025, 5.21 percent for 2026), not
the 7 percent every older page on the web still carries; the live tax pages
already had this right. The lease and the deposit follow the property; the
seller stays liable for the deposit until it is transferred and the tenant
told in writing. Bookings that start within 90 days of recording go with the
property, later guests are refunded within 45 days, and every future booking
must be disclosed in writing before the contract.

**Student rentals.** Read from the two zoning PDFs themselves (Conway UDO
dated 7.20.26, Horry County Appendix B dated 9.1.26): the city counts a family
as up to three unrelated people; the CCU Neighborhood Overlay names five
subdivisions of record where unrelated occupants cannot exceed the bedroom
count on the county record, never more than four, with no street or yard
parking 11pm to 8am; the county allows five unrelated and carries the same
overlay on its side of the line. Those five subdivision names are ordinance
text, not conclusions about any community. No public rent index exists for
student houses; the only public figure is the university's $8,086 off-campus
housing allowance, which the page calls a budgeting figure, not a rent.

**Landlord rules.** Statutory minimums only. Fees are the court's statewide
Attachment K ($55 with service) and H.4813, signed 2026-05-15, which doubles
the filing fee to $40 on 2027-01-01; the court has not published the rest of
the new schedule, so the page does not add it up. The county posted in
October 2024 that the Surfside Beach magistrate office was closed for
maintenance and no page says it reopened; the page says call first. Observed
timelines (filing to writ, sit-out scheduling, which office takes which
address) are owner questions, not on the page. The 2026 servicemember rent
ceiling is $10,542.60 (Federal Register, 2026-03-10).

**LLC.** The finding that changes advice: CFRE, LLC v. Greenville County
Assessor (S.C. Supreme Court, 2011) held a single-member LLC-owned home can
take the 4 percent rate when the member meets every test, and Horry County's
application asks for the operating agreement. The common claim that an LLC
forfeits the 4 percent is wrong for a single-member LLC. A deed from a member
to a disregarded single-member LLC owes no recording fee (SCDOR manual,
January 2024) and is not an assessable transfer (12-37-3150(B)(11)). The
federal due-on-sale exemption list names no LLC; the Fannie Mae servicing
rule that allows a post-closing transfer sits in the sources line only, and
body copy says "many conventional loans" and "your servicer's rule governs".
How a partnership-taxed LLC is classed on the I-290 follows from 12-2-25 and
no SCDOR sentence says it outright, so the page tells the reader to ask the
closing attorney. No DOI or carrier page addresses an LLC as named insured.

**Foreclosures.** The county's own documents disagree on the registration
deadline (seven days, one week, the Monday before); the page says at least a
week and names the disagreement. No primary source states the "no post-sale
right of redemption" rule that every law-firm page repeats; the page says only
that the foreclosure chapter sets no period, which is the researcher's
absence finding (0 hits in Title 15 Chapter 39, 36 control hits in the
tax-sale chapter). HUD's owner-occupant exclusive period is 15 days insured
and 5 days uninsured for listings on or after 2025-05-30 (ML 2025-13). Fannie
Mae's First Look pages could not be read (Cloudflare challenge) and are not on
the page. The county tax-sale sheet's redemption interest schedule is
deliberately not on the page (non-negotiable 3). The next sale date is not
printed; it changes monthly.

**Scanner note.** After links were wrapped around existing words, the audit
counted one where-to-buy sentence at 29 and then 30 words while a whitespace
count gave 28 and 29. The sentence was split rather than argued with. If this
recurs, sanity-check the audit's tokenizer against a link followed by a comma
before trusting the count either way.

**Owner questions.** Each research file ends with "Questions only the
brokerage can answer"; the chat reply carries the batch-3 list. Batches 1 and
2 questions are still open. Apply his answers to the specs and regenerate,
never to the pages.

## 2026-09-06 later: the owner answered the batch-3 questions; five pages revised

He answered 31 of 32 questions in one message. The answers are verbatim in
`research/invest-next/owner-answers-batch3.md`, with a list at the end of what
may not go on a page (his "$250 a month on interest", BrickWood by name, any
attorney or screening company by name, the tax-sale interest schedule, and
whether Chapter3 is HUD-registered). Every brokerage fact on the five pages is
attributed to Devin Day or Tim Nash and traceable to that file by answer
number. Preflight 0, browser-measured again at three widths, previews
republished at the same URLs. Where he asked for the legal answer, the writer
re-opened the statute and the answer is on the page:

- **Selling a rental.** FHA occupancy from Handbook 4000.1 (read 2026-09-06):
  "At least one Borrower must occupy the Property within 60 Days of signing
  the security instrument and intend to continue occupancy for at least one
  year." His three-to-four-month line follows from it. VA: the Lenders
  Handbook (Pamphlet 26-7, chapter 3) could not be opened; benefits.va.gov
  and its KnowVA redirect hand fetchers a script shell. The page cites 38
  U.S.C. 3704(c) instead (the veteran certifies intent to occupy as home) and
  prints no VA day count. Deposit liability is 27-40-450: the seller is
  relieved only after written notice to the tenant, and stays liable for the
  deposit unless it is transferred and the tenant notified in writing; the
  statute names no sender, so the page has the seller send both notices on
  closing day. Selling is not one of the three ejectment grounds (27-37-10);
  a month-to-month tenancy ends on 30 days notice (27-40-770).
- **Student rentals.** Two tenant pools, the three-to-five-times income rule,
  about three in four leases with a parent co-signer, the short-lease
  premium, the five risk tools, renewal timing, turnover cost items, HOA
  filtering. Public rent benchmark added: HUD fair market rents for the
  Myrtle Beach-North Myrtle Beach-Conway area (huduser FY27_FMRs.xlsx, read
  2026-09-06): $1,155, $1,258, $1,504, $1,823, $1,981 for zero to four
  bedrooms; FY2026 was $1,145, $1,229, $1,465, $1,805, $2,111. huduser.gov
  needs a browser user agent; a plain curl gets an empty 202. The overlay
  example is labeled as made up.
- **Landlord rules.** His timeline (up to three weeks to the writ, a few days
  for a strong case), a six-item list of what a Chapter3 agent does (the
  filing step is conditional on Chapter3 managing the unit, because only a
  property manager or broker-in-charge may file under 27-40-710(C)),
  all-inclusive versus partial managers, the "cannot end a lease to sell"
  section, screening companies unnamed.
- **LLC.** The occupancy-promise paragraph (deeding a primary-residence-financed
  house to an LLC and renting it a month later is mortgage fraud; no dollar
  figure), every DSCR and business-purpose loan closes in an entity and the
  lender requires it, the attorney drafts the deed and the county rarely
  questions it, every investor client holds in an entity, insurance as a
  commodity, and the multi-member 4 percent proration with its two
  exceptions from 12-43-220(c)(2)(8)(ii) and (iii)(D), read 2026-09-06.
- **Foreclosures.** Tim has bought at the sale many times; the title
  certification quote; earnest money with the closing attorney; about 45
  days for an REO loan (Devin, NMLS line); a past-due HOA assessments
  section (attributed observation, no names); the tax-sale story with the
  statute behind it: notice by certified mail 20 to 45 days before the
  redemption year ends (12-51-120), the county may void a sale for a missed
  step and refund with the interest it earned (12-51-150), only the owner, a
  grantee, or a mortgage or judgment creditor may redeem and redemption
  returns the house to the owner (12-51-90), which corrects his "family can
  take ownership" premise, and the tax deed is prima facie evidence of title
  with a two-year contest window (12-51-160).

**Not on the site, on purpose.** Chapter3 is not a HUD-registered selling
broker (answer 29). The foreclosures page says only that a HUD-registered
broker must submit the offer. Do not state either fact on the site.

**Still open.** The VA 60-day figure (needs the handbook itself); question 15
(which magistrate office takes which address); the stories he offered to add
next; batch-1 and batch-2 question lists.

## 2026-09-06, third pass: four stories, the 60-day rule, and a literal-register sweep

His second message (verbatim at the end of
`research/invest-next/owner-answers-batch3.md`) gave one instruction and four
stories, and asked for a sweep of every phrase, filler word and figure of
speech on the five pages. All applied; preflight 0; browser-measured at three
widths; previews republished at the same URLs.

- **The 60-day rule, his wording.** The selling page now says "most lenders
  require the buyer to move in within 60 days of closing on an FHA, VA or USDA
  loan", linked to Handbook 4000.1 for the FHA figure. The VA statute link
  and the VA-only sentence are gone. Do not narrow it back to FHA alone; the
  wording is his.
- **Stories on the pages, anonymised.** The 15-year owner moving to New York
  (eight months left on the lease, cash flow over $1,200 a month for him and
  about half for the next owner, investors who accept modest cash flow in an
  appreciating area, cash buyer closed 13 days after listing) on the selling
  page. August as the no-vacancy month near campus, with marketing one month
  before the lease ends, on the student page; it replaced the "depends on the
  strategy" line at his request. The few-day eviction after a fight inside
  the unit and a police bar on the landlord page, with no genders or names.
  The brick ranch, the previous owner's sister, the mobile home that was never
  conveyed with the land, the written lease for the back corner, and the
  eleven-day sale, on the foreclosures page under "Why visit the property
  before the sale?" His original had "on paper", "told him everything",
  "getting nowhere" and "bothered to knock"; all rewritten literal.
- **LLC clarification.** "With the servicer's approval you can deed the house
  to your LLC, and that includes a home you live in. The problem is renting
  out a house you told the lender you would live in."
- **Register sweep.** Removed or replaced on the five pages: "the line that
  gets missed", "in the tenant's eyes", "draws the line", "costs you twice",
  "route", "layers", "line up", "walk away with", "the hard part", "run the
  company as a company", "silence", "looks wrong", "hands over", "the clock
  restarted", "upside", "hold back", "shapes the product", "refills",
  "carries a premium", "sits over", "the number that decides the numbers",
  "plenty", "the calendar belongs to", "hands it back". The audit's own
  regexes then caught "taxes leave" (personification) and a stray "The
  former" reading-order phrase; both fixed. The audit does not catch most
  metaphors; the sweep was manual, sentence by sentence. Batches 1 and 2
  have not had this sweep.

**Still open.** Question 15 (which magistrate office takes which address);
the VA handbook itself (the 60-day figure is now his instruction, not a
citation); the batch-1 and batch-2 question lists and the same sweep on
those eight pages.

## 2026-09-06, fourth pass: his name is gone from the five pages, nothing "sets" anything, the LLC page reordered, the homepage cards fixed

He read the third-pass preview and sent one message with a structure question,
two rules to hard-code, five copy edits, two CTA changes, two cannibalization
questions and a homepage defect. The message is verbatim in
`research/invest-next/owner-answers-batch3.md`, "Round 3".

**Two new hard-coded rules, PLAYBOOK A20a and A22a, MISTAKES 73.**

- *His name is never written in page copy.* `build.js` errors on `Devin` in
  the main copy of the five batch-3 pages (`NO_OWNER_NAME_PAGES`) and of every
  page whose `datePublished` is 2026-09-07 or later. `tools/mkpage.js` throws
  before writing a file that contains it, accepts only `author: "tim"`, and its
  byline now reads "Reviewed by Chapter3's licensed mortgage loan originator,
  NMLS 2721275" with no name. The A20 warning on those pages now says "quote
  Tim Nash". The five pages carried the name 24 times; all gone. Three
  `llms.txt` entries that named him were rewritten. The CLAUDE.md line about
  him says so.
- *Nothing "sets" anything.* `SETS_REGEX` (`sets`, `set by`; "sets of" is a
  noun and passes) errors on the same pages and warns on the older ones. The
  five pages said it 24 times; all gone. 45 older pages warn today and fail
  nothing (MISTAKES 65).

**What the rule does not cover, and needs his word.** The sitewide identity
JSON-LD on every page (the Organization `employee` list and the Person entity
`/about/#devin-day`) still names him; that is schema, not copy, and it is on
all 118 pages, so I left it. 24 older pages carry "Reviewed by Devin Day" in
the byline. The eight batch-1 and batch-2 pages name him in copy nine times
and say "sets" 14 times. He said "the pages we are making now", so those wait
for him. Regenerating a batch-1 or batch-2 spec now drops the name from its
byline automatically, but the copy edits are manual.

**The five pages.**

- `/invest/llc/`: he asked whether national answers sat above the local ones.
  They did. Reordered local-first: what an LLC is (one sentence that every
  investor client holds title in an entity), the loan in the LLC's name (every
  DSCR and business-purpose loan closes in the entity, the lender requires it),
  the deed into the LLC, the 4 percent ruling, a new section "Should you form
  a new LLC for each house?" (his figure: about nine in ten investor clients
  do; a claim at one property stops at that property; form it before the
  contract), cost, withholding at sale, and income tax last. The "What do you
  decide before the contract?" section he called nonsensical is deleted; its
  one useful sentence is in the new section. CTAs are his words: "Let us make
  it simple" to `/contact/` and "Call a specialized agent" to the phone link
  at the bottom.
- `/sell/rental-property/`: eyebrow "Selling a rental?" (the hero sub cannot
  be a question, A14, so the question went in the eyebrow). "Who can buy a
  house with a tenant in it?" rewritten plainly: anyone can buy it, the
  question is who can use it; our rule is three to four months or less left
  on the lease and an owner-occupant can close and wait, more than that means
  an investor buyer, a wait, or a buyout. The evict-to-sell paragraph is now
  three sentences and a link to the landlord page, which is the canonical
  answer (his cannibalization question; it was duplicated on both pages).
- `/invest/landlord-rules/`: "What must you give the tenant at move-in?" is
  now "What must a landlord give a new tenant in writing?" and says what the
  section is about in its first sentence. New section "What does the buyer
  need to give the existing tenants?" (name and address of the new owner in
  writing, 27-40-420; the deposit transferred and the tenant told in writing,
  27-40-450; the lease unchanged). The rent-late CTA is his words: "Have us
  help buy your next rental" to `/invest/run-the-numbers/`. New FAQ to match.
- `/invest/student-rentals/` and `/invest/foreclosures/`: name and "sets"
  removed, nothing else changed.

**Cannibalization, his two questions.** "Can you end a lease to sell the
house?" lived on both the landlord page and the selling page; now only the
landlord page answers it and the selling page links there. "What happens to
bookings on a vacation rental?" overlaps one paragraph on
`/sell/sell-my-condo/` and one FAQ on the sell hub; both already link to
`/sell/rental-property/` for the full answer, and the queries differ (selling
a condo, selling a rental), so I left them.

**Homepage "hair" in the "I am" buttons.** It was the fixed particle canvas
(`#c3-particles`, position fixed, z-index 0, opacity .35, appended to `body`
after `main`) painting its dots and arcs over the three ivory chooser cards,
because the cards were positioned with z-index auto and came earlier in the
DOM. Fix: `position:relative;z-index:1` on `.hero-chooser .chooser-card` in
the page-local `c3-ui-tweaks` style block in `index.html` (not a partial, not
`assets/*`, so no stitch and no rehash). Measured with a 2x screenshot and a
pixel scan of one card excluding the label box: 696 stray pixels at 390px
before, 0 after, on three frames each at 1280, 768 and 390; the cards still
take the click at the point tested. The canvas is on 93 pages; any other
ivory box over a dark section may show the same specks. Not touched.

**Gates and browser.** `preflight` exits 0. The harness at 1280, 768 and 320
on the five pages and the homepage: no low-contrast node and no overflow on
the five. The landlord page's hero CTA "missed" the hit-test at 320 in the
first run. Measured cause: the site's `html{scroll-behavior:smooth}` animates
the harness's programmatic scrolls, so after its scroll sweep the hit-test
read the CTA mid-scroll, with its top at -52px. The harness now scrolls with
`behavior:'instant'` and the CTA passes at all three widths on both pages
tested. The harness lived only in the session scratchpad until now; it is in
`tools/verify-forms.js` (MISTAKES 72 describes it), run as
`NODE_PATH=$(npm root -g) node tools/verify-forms.js /invest/llc/ /` against
`python3 -m http.server 8123` started inside `chapter3realty/`. The
homepage's "3.01 Common Questions" contrast and the clipped `#home` section
and 320px brass button are identical on the committed page; pre-existing, not
from this change.

**Two mkpage self-checks fired usefully.** The LLC description came out at
171 characters and the name check caught the generator's own byline, which is
how the byline template got fixed.

**Still open from earlier rounds.** Question 15 (which magistrate office
takes which address), the batch-1 and batch-2 question lists, the VA
handbook citation (unreachable; the page says "most lenders require" as he
instructed), and the sweep above.

## 2026-09-07: the licence claim removed from every page, bylines restored, the student page rewritten, fifth pass on the five

He read the fourth-pass preview and sent one message that reversed one rule and
amended another. It is verbatim in `research/invest-next/owner-answers-batch3.md`,
"Round 4".

**The licence claim, sitewide (PLAYBOOK A17 rewritten, MISTAKES 74).** "Dont
mention my NMLS or say im a licensed loan originator with Chapter3 ever that's
illegal just state the fact and if you need to get credibility say according
to a loan officer at our preferred lender." It was on 117 of 118 pages: the
Person schema on every page, 87 bylines, 22 relocation author boxes, the
About page and the homepage team card, and eight body sentences (five on the
batch-3 pages, cash-to-close, non-warrantable condos, the HOA turnover page
and the jobs page). All gone, by one script of exact replacements plus five
hand edits. Where a fact needed a source it now says "according to a loan
officer at our preferred lender"; the AfBA disclosure in the footer covers
that reference on every page. `build.js` errors sitewide on the number
anywhere in a file, on the title-case schema phrase, and on any sentence that
puts him or Chapter3 next to MLO, loan originator, loan officer or NMLS;
`tools/mkpage.js` refuses either before it writes. Positive control: 117
pages failed before the sweep, none after. `dates` moved 90 pages because
their visible byline changed; that is rule 6 applied, not bulk-stamping.
The cash-to-close sentence was removed in the spec and in the page by the
same edit, without regenerating, because its spec still says "sets" and the
generator now refuses that; regenerate it only after the "sets" sweep.

**Bylines (A20a amended).** "change the Author to by Devin Day and reviewed
by Tim Nash like all the other pages we have." The five pages are author
devin: "By Devin Day, Operations Officer · Reviewed by Tim Nash,
Broker-in-Charge". The generator accepts tim or devin again; a tim page reads
the reverse. The name-in-copy gate now excludes the byline; the first attempt
missed because tag-stripping leaves a space before the comma ("Devin Day ,
Operations Officer"), so the strip regex allows it. Body copy still says "in
Chapter3's files". Ask him whether he wants his name back in the stories.

**Property management.** "we don't do any property management make sure
nothing says we do." The landlord page's "What does a Chapter3 agent do
during an eviction?" section is deleted, with the sentence "When Chapter3
manages the unit, the broker-in-charge files it for you". A sitewide search
for management claims (we manage, we screen, we collect, we serve, we file,
Chapter3 manages) found nothing else.

**A law does nothing for anyone (A22b, MISTAKES 75).** Two REGISTER_REGEX
entries; one sitewide hit before (the sentence he flagged), none after, and
"the law requires" passes. An earlier draft also caught "an owner's policy
protects you" on cash-to-close, which is an insurance policy doing its
literal job, so "policy" and "protects" came out of the pattern.

**The five pages.**

- `/invest/student-rentals/`, rewritten where he said. The sub says who
  rents and states the three-tenant cap plainly. The cap section opens by
  saying the number is a zoning rule, then gives the family definition. The
  parking rule has its solution: a driveway that holds one car per tenant
  and a lease that limits the cars. The rent section is deleted with its two
  FAQs and the fair-market-rent sources; there is no public student rent
  index and he had no figure ("i dont have these stats"). The parents
  section says what happens: a parent buys a house near campus and moves the
  family in, legal residence, 4 percent rate, primary-residence loan; or the
  student rents and a parent co-signs three times in four. The university's
  housing policy STUD-336 (the PDF, revised February 2021, read 2026-09-07)
  exempts automatically a student whose permanent address on file is within
  50 miles of campus and who lives there with a legal guardian, so a
  first- or second-year student can live at the parents' house; new FAQ,
  new source. "The state's landlord and tenant law does not do that for you"
  is deleted. The cap CTA is "Want to rent to college students?" to
  `/contact/`.
- `/invest/foreclosures/`: the sale-list CTA text in his words; "pulled for
  your numbers?" deleted from the REO CTA; the master's deed section now
  defines the master-in-equity and the deed before the warranty point; the
  upset-bid section defines the period before the deficiency judgment.
- `/invest/landlord-rules/`: first CTA "Have us help buy your next unit";
  the eviction section defines eviction and ejectment first; the
  agent-eviction section is gone.
- `/invest/llc/`: the sale section opens with what differs from a personal
  sale; the DSCR entity fact is "according to a loan officer at our preferred
  lender".
- `/sell/rental-property/`: the bookings section defines a vacation rental
  before the statute.

**Gates and browser.** `preflight` exits 0. The harness at 1280, 768 and 320:
the five pages have no low-contrast node, no overflow, one H1 and a hit
hero CTA. The About page and the relocation pages show low-contrast headings
that were there before this change (the byline colour did not move).

**Open.** Question 15; the batch-1 and batch-2 question lists; the eight
older pages still say "sets" 14 times (their bylines are already fixed by the
sweep); the VA handbook citation; his name in stories or not.

## 2026-09-07 evening: the deploy that shipped nothing

He deployed and got "Uploaded 0 files (148 already uploaded)" and asked why.
The prompt showed the folder: `C:\Users\DevinDay\Downloads\chapter3site20260905`.
He deployed a downloaded copy, not his clone, so the upload was byte-identical
to what was already live. Verified against the live site: `/invest/llc/`,
`/invest/landlord-rules/`, `/invest/where-to-buy/` and `/invest/run-the-numbers/`
all 404, the sitemap lists 105 URLs against our 118, and `/about/` still
carries the NMLS number and "licensed mortgage loan originator" three times.
So none of the twelve investor pages and none of the compliance fix are live.

`build.js preflight` now ends with a deploy source check and `node build.js
source` runs it alone (PLAYBOOK A39a, MISTAKES 76). It fails outside a git
clone and otherwise prints the page count, the commit and the branch.

**He may not have a clone on that machine.** If he does not, he needs one
before he can deploy this work at all; the clone command is in the reply and
in the environment section below.

## 2026-09-07 night: investor batch 4, five pages fact-checked from his ten answers

He asked for the next five high-value investor pages, then answered ten
questions in one message and asked for a fact-check of what he said. The
message is verbatim in `research/invest-next/owner-answers-batch4.md`, and the
"Checked" section there records each claim, the verdict and the source that was
re-opened. Read that file before touching these pages.

**Built and wired, all spec-generated, author devin:**

- `/invest/section-8-rentals/`. The two authorities (Housing Authority of
  Myrtle Beach, 660 vouchers, its service area in eastern Horry County; Conway
  Housing Authority, 373, Conway and the unincorporated county), the payment
  standard at 90 to 110 percent of the FY2027 fair market rent, the lower-of
  rule, the six-step approval, the payment timing, what damage and eviction do
  to a voucher. The federal rules were read at law.cornell.edu because eCFR
  returns a bot-block redirect to every fetch; the page links eCFR. Neither
  authority publishes its payment standards online, so the page says to ask.
  His "never get another voucher ever" is corrected to what the rule says.
- `/invest/new-construction-rentals/`. Permits from the Census series on FRED
  (7,152 in 2024, 6,898 in 2025), SC Code 27-30-130 on recording, the county
  records index, his Little River story anonymized (no community, no builder),
  his builder-incentive observation as Chapter3's experience.
- `/invest/financing-multiple-rentals/`. Ten financed properties, the reserve
  tiers, the twelve-month rental-income rule, equity for the next purchase
  kept qualitative (his LTV figures are off the page: not a DOWN_PAYMENT_OK
  page), the second-deal mistakes and his reserve story. Loan facts attributed
  to a loan officer at our preferred lender; the guide is named in the sources
  line only, like the other pages.
- `/invest/landlord-insurance/`. Trade body 25 percent, his 15 to 20, the $250
  flood surcharge from FEMA's fact sheet (read from a state-hosted copy; FEMA
  and floodsmart refused the fetch), the tax multiple from the site's own
  calculator page. The coastal insurance page keeps the averages and the
  three-policy explainer; this page links there instead of repeating them.
- `/invest/rent-prices/`. He has no lease data (answer 10), so the page uses
  the FY2027 fair market rents, the 40th-percentile definition, and the Zillow
  metro rent index (about $1,714 in July 2026, CSV re-opened), and routes to
  the analyzer and to an agent.

**Wiring.** Sitemap and llms.txt entries; three sentences added to the hub's
"how to buy" and "what it costs" paragraphs; nineteen inbound links made by
wrapping existing words on existing pages (markup only, no date change); one
sentence added to `/buyers/new-construction/` and one to the landlord-rules
screening paragraph (both visible, dates moved). Every new page has four to
six inbound links from body copy.

**Gates.** Audit 0, preflight 0 on 128 pages, harness clean on the five at
1280, 768 and 320. The hub's 3.45 stat labels and the buyer page's 3.01 brass
links are pre-existing styles; the new link on that page uses the same style as
its neighbours.

**Traps this round, so the next session does not repeat them.**

- A python edit script that asserts a description length mid-way aborts the
  edits after it, silently. Twice. Apply each edit on its own and print misses.
- The link-wrapping helper put two links into a hero sub (cash-to-close), and
  the sub's word count went to 31 because the counter treats `</a>,` as a
  token. The helper now skips `.detail-sub`.
- "sets up" in link text trips the sets gate. Write "arranges".
- mkpage's self-checks caught all of it before a file was written, which is
  what they are for.

**Not on the pages, on purpose.** His LTV percentages and "0 dollars down";
"never again" for a voucher; BrickWood by name; the state authority's
seven-county list (seen only in a search summary, not re-opened); any
insurance agent.

**Open.** Local payment standards (call each authority); the MBHA landlord
pages, which 404 through the fetch tool; question 15; the batch-1 and batch-2
question lists; the "sets" sweep on the eight older pages; his name in stories.

## 2026-09-07 late: batch-4 round 2, his edit list applied to the five pages

He read the five batch-4 pages and sent an edit list. It is verbatim under
"Round 2" in `research/invest-next/owner-answers-batch4.md`, and a "Round 2,
applied" list under it says what changed and answers his three questions.
Everything was applied at the spec and regenerated. No page was hand-edited.

**Section 8, the page with the most changes.**

- Hero CTA "Call to learn more" (tel). "Rent to them."
- The long paragraphs became tables: who does what; the two authorities with
  voucher counts and phone numbers; the FY2027 fair market rent by bedroom.
- An interactive calculator (`#s8rent`, `#s8inc`, `#s8br`, `#s8pct`): the
  payment standard, the authority's share, the tenant's share, the tenant's
  share of income, a stacked bar of who pays, and five bars of the bedroom
  standards against a line at the rent. The rent check and the 40 percent cap
  appear as notes when they apply. The maths: standard = FMR x percent; tenant
  share = 30 percent of income; authority = min(standard, rent) - tenant share;
  tenant = rent - authority. That is the simple case, no utility allowance and
  no minimum rent, and the disclaimer under the tool says so.
- **The function is a top-level `function c3S8(){}`.** The audit's
  inline-handler gate looks for `function NAME` on the page or in a loaded
  bundle. The first version was `window.c3S8=` inside an IIFE and the audit
  failed the page four times. Every inline `oninput`/`onchange` handler on the
  site must be declared as a plain function.
- **The FY2027 fair market rents are hard-coded twice**: in the visible table
  and in the `FMR` constant inside the spec's `TOOL` string. When FY2028
  publishes (usually late summer), change both, in the spec, then regenerate.
- `tools/verify-s8calc.js` drives the calculator through three hand-computed
  cases and exits 1 on a mismatch, a page error, or sideways scroll at 320.
  Run it after any change to that spec. It is green.
- Two new sections: "What stops you from charging the most the voucher
  allows?" (rent reasonableness, the 40 percent cap, the utility allowance,
  the bedroom count, all from the federal rule read at law.cornell.edu) and
  "How hard is it to find a tenant with a voucher?" (1,033 vouchers, the
  Conway list closed, the Myrtle Beach list open for two days in January 2022
  and 1,000 names drawn by lottery, the 60 days a family has to find a house).
- The approval steps are bold, and the section says the house is approved
  after the family is found, not before. "Does Horry County pay on time?" The
  late-tenant sentence links to the eviction page. The "does not ban a family
  for life" sentence is gone.
- "Which houses fit the program?" He asked whether it was fact or one
  investor's habit. The bedroom logic is what the rule does and is stated as
  fact. The buy-a-fixer-and-add-bedrooms pattern was one client's and is
  labelled that way.

**New construction.** Title "New Construction as a Rental in Myrtle Beach |
Chapter3", H1 "Can you buy new construction as a rental in Myrtle Beach?": the
words people type, and the answer in the first line. "Covenants" is "rules"
everywhere. A recorded rule that bans renting is enforceable in South Carolina;
the page says so and the sources line carries SC Code 27-30-130. "Not in the
sales office" deleted. CTAs "Talk to a new construction agent", "Want to buy a
new construction home?", bottom "Call a specialized agent". The description was
175 characters and mkpage refused it; it is 164 now.

**Financing, insurance, rent prices.** Same facts, shorter sentences, tables
instead of paragraphs (the first-time-investor rules, what counts toward ten,
the reserve tiers; the three policies and the home-versus-rental cost lines;
the rent factors), a static SVG bar chart of the five fair market rents on the
rent page, CTAs renamed ("Plan the next purchase", "Have us run the numbers",
"Have us run the rent", "Call a specialized agent").

**"Send the address" is still on 19 older pages, 30 labels**: cost-to-own,
hoa-vs-poa, thirteen /invest/ pages, home-value, net-proceeds, rental-property,
why-chapter-3. He asked for the change on the batch-4 pages only. Ask before
sweeping: the label is right on the CMA pages.

**Gates.** Audit 0, preflight 0 on 128 pages, harness clean on the five at
1280, 768 and 320, the calculator check green, and the calculator block looked
at in a clipped screenshot. This page has no animated canvas, so a clipped
`page.screenshot` works here. It does not on the homepage.

**Traps this round.**

- The inline-handler gate, above. It did its job.
- The strict register caps FAQ answers too, 28 words a sentence. Split them.
- The chart's "Your rent" label overlapped the last bar. Only the screenshot
  showed it. The DOM checks cannot see a label collision; look at every chart
  once before calling it done.

## 2026-09-07 later: batch-4 round 3, the financing page rebuilt, the new construction page corrected

His third list is verbatim under "Round 3" in
`research/invest-next/owner-answers-batch4.md`, with the fact-checks under
"Round 3, checked" and the changes under "Round 3, applied". Read those before
touching either page. The short version:

- **He doubted the ten-property rule.** It is real, and it was re-opened in the
  conventional selling guide. It applies to a loan on a second home or a rental,
  counts every financed one- to four-unit property in the borrower's name
  including the home and FHA-financed ones, and has no limit for a loan on the
  home you live in. He never hit it because most investors never reach ten and
  the rest use DSCR or portfolio loans, which are outside it. The page now says
  so and DSCR is one sentence, not the focus.
- **FHA is not capped at ten.** Handbook 4000.1 was downloaded (14 MB, 1,883
  pages; the fetch tool refuses it, `curl` plus `pypdf` reads it in about two
  minutes) and read at pages 157 to 158 and 168 to 169: one FHA-insured
  principal residence per borrower, four exceptions, occupancy within 60 days for
  at least a year, the self-sufficiency test on three- and four-unit buildings,
  and the sentence that FHA refuses a loan designed to buy rentals with FHA
  insurance. The page carries all of it and tells the reader to live in each
  home and move when life needs a different home.
- **Reserves.** The lender verifies and never holds them; the other-rentals
  share excludes the home and the subject; DSCR lenders write their own rule.
  Two DSCR lenders' guidelines are the source for "two to six months, sometimes
  a few months per other rental".
- **Builder warranty.** 1-2-10 from a warranty company's page and a builder's
  page; the end-of-first-year repair visit is stated as Chapter3's experience
  because no standard requires it.
- **The financing title** is "Finance Multiple Rental Properties in Myrtle
  Beach | Chapter3" with H1 "How do you finance more than one rental property?"
  because that is the search phrase. llms.txt updated. The URL did not change.
- **"Carry" and "maps" are gates now** (A22c, MISTAKES 77). The 13 older pages
  that say "carrying costs" or "carries the rest" warn, not fail. Sweep them
  when he says so, at the spec for generated pages and in the page for the
  hand-built ones.

**Gates.** Audit 0, preflight 0, harness clean on the five at three widths, the
calculator check green.

**Round 5**, five wording edits, verbatim and applied under "Round 5" in the
same research file: the seller sentence deleted from the second-rental page,
the insurance H2s renamed ("What makes insurance so expensive in Myrtle
Beach?", "Get insurance quotes before making an offer"), the insurance CTA
rewritten to offer quotes, and the rent-prices expenses CTA renamed to "Have
us help find a new rental."

## 2026-09-07 last: batch-4 round 4, headlines local, no headline offers financing, the second-rental page

His fourth list is verbatim under "Round 4" in
`research/invest-next/owner-answers-batch4.md` with the checks and the changes.
Two new standing rules came out of it, both gated:

- **Every H1 names the place** (A22d). Error on pages built from 2026-09-07,
  warning on older ones. Nineteen older H1s warn today: five legal pages
  (accessibility, fair housing, privacy, terms) and fourteen content pages
  (condo-in-litigation, relocating/beaches, undisclosed-flooding, hoa/documents,
  hoa/master-insurance-ho6, hoa/rental-restrictions, hoa/reserves,
  hoa/tax-deductible, invest/accommodations-tax, invest/long-term-rental,
  invest/str-tax-treatment, strategies/dst, map, why-chapter-3). He was given
  the list; do not rewrite live H1s until he says which.
- **No headline offers financing** (A17b, MISTAKES 78). Sitewide error.

**The financing page** is now "Buying a Second Rental in Myrtle Beach" at the
same URL: the three mistakes with his story, equity for the next one ("no new
cash from savings", never "$0 down"), the ten-property limit as one short
section, reserves. No FHA. The hub anchor and llms.txt follow it.

**Insurance** prices the landlord policy ($1,700 to $4,400 a year here, from the
coastal page's homeowner range plus the trade body's 25 percent, with two
statewide figures from a comparison page for context). **Rent prices** has the
eight-row expenses table and the two ways to get the rent as separate steps.

## 2026-09-08: investor batch 5, five pages, a hover map, two calculators, a monthly data page

**What he asked for (verbatim where it decided a page):** "What is being
built on the Grand Strand right now ... we will make this a monthly schedules
run using he counties permit API"; a J-1 "ultimate guide ... what companies
employ the most j-1's does that company have their own j-1 housing ... what
happens if you need to evict one"; "What return should a Myrtle Beach rental
make. all the stats with a few examples in pretty visual graphs and when a
number becomes a deal breaker how to calculate it ... what locations are best
to maximize each number ... a little above view with the sections highlighted
and when you hover over it it gives you the average stats for a long term and
short term rental"; "Buying a Myrtle Beach rental as a Canadian"; "How long
should you hold a rental here before selling ... be careful not to hurt any
other page talking about appreciation". His ten answers are in
`research/invest-next/owner-answers-batch5.md`.

**Research (all primary, all dated, all in `research/invest-next/`):**
`returns-facts.md` + `data/submarkets.json` (Zillow ZIP home values and rents
for July 2026, AirROI August 2025 to July 2026, HUD FY2027 rents, the site's
2025 millage by district, the DSCR floors, Arbor's 7.3 percent national cap
rate); `hold-facts.md` + `data/hold-*.csv` (25 years of metro, city and ZIP
Zillow history, rolling-window outcomes, break-even models, the IRS and
lender waiting periods); `canadian-facts.md` (62 sources); `j1-facts.md`
(66 reads: 22 CFR 62.32, the 2025 State Department counts, the IPMC section
404 text, the city code, SC 27-40, HUD on language rules); and
`construction-pipeline-facts.md` (80 reads: SCDOT on I-73, the state licence
list, the county development layer, council packets, RIDE 4, the airport's
own tables). Every page cites only what those files read.

**The five pages, all spec-built, gates green, harness clean at three widths:**
- `/invest/rental-returns/` (`specs/rental-returns.js`). Every number is
  computed at build time from `submarkets.json`: long-term return by area
  (with a manager 1.1 to 2.3 percent in Horry County; self-managed 2.7 to
  4.6), short-term return by area (1.3 to 5.4 percent on AirROI revenue at 45
  to 65 percent expenses), the nine-area hover map with four color toggles and
  keyboard access, the five dealbreakers as Chapter3's screening rules, the
  return calculator (`c3Ret()`, area picks the millage; Pawleys adds $96 of
  fees) and the rent-versus-price chart. Coverage is shown as the rent divided
  by 1.00, 1.10 and 1.25, never as a payment. Verified by
  `tools/verify-returns-calc.js`: four hand-computed cases, the map's hover,
  focus, Enter and click, the no-data fill, 320px, and a clean console.
- `/invest/how-long-to-hold/` (`specs/how-long-to-hold.js`). Reads the
  `hold-*.csv` files: the price rise that pays the costs back (10.5 percent
  financed at the net-proceeds calculator's example commission, 7.9 cash), the
  years-to-break-even chart, the monthly metro history line 2001 to 2026 with
  the 2007 peak, 2011 low and 2020 recovery, the share of holds of each length
  that covered the costs, the ZIP table, the waiting periods by strategy, and
  the all-cash section (saved rent takes 41 to 67 years to buy a second house
  with a manager; the Pawleys-for-two-Conway trade computed on the returns
  page's inputs, payback about four years through a 1031). It links to the
  returns page for yields and never restates a cap range (A22e).
- `/invest/canadian-buyers/` (`specs/canadian-buyers.js`). Cash or a
  foreign-national loan; the ITIN; the 30 percent rent withholding and the
  election; the two withholdings at sale (federal 15 percent of price; South
  Carolina at its top individual rate, Form I-290); the six-month stay, the
  183-day test and Form 8840; the 6 percent assessment; the estate threshold.
  His answer 7 ("canadians have to do a DSCR loan unless they get their social
  security card") is on the page as Chapter3's experience where the sources
  agree; the sources add that FHA is closed to non-permanent residents.
- `/invest/j1-rentals/` rebuilt at the same URL (`specs/j1-rentals.js`,
  `datePublished` kept at 2026-09-01). The old page's "$500 to $700 a person",
  "624 beds under construction" and "May to September" were replaced with the
  listings' $100 to $140 a week, the 300-bed hall open since May 2025, and the
  program windows by country. His 60-person house (answer 4) is on the page as
  "the owner of a house we sold reported 40 people in 2,500 square feet at
  $700 each and 20 more in a garage" next to the lawful count of 10 to 13,
  labeled the case not to copy. Employers that house students (Lazarus, the
  sponsor listings), the sponsor's housing duty, eviction under the state act,
  and fair housing on language are all sourced.
- `/invest/what-is-being-built/` (`specs/what-is-being-built.js`). Built from
  `research/invest-next/data/pipeline-latest.json`, which `tools/permits.js`
  refreshes (A41). The county development layer answered live (44,735
  approved-but-unbuilt units); the county permit map answered and is stale
  (newest issue date 2025-09-22, so the page says the map is stale); FRED
  refused this environment (HTTP 503 and timeouts to curl) and the tool kept
  the seed months through July 2026 from the research. I-73 is written as
  bought right of way and plans with no contract and no money. **A monthly
  Routine exists**, `trig_01P3kXuXeAjTtX3GqnceSDEo`, first run 2026-09-27 13:05 UTC,
  fresh session each time with push and email notice to the owner. It runs the tool,
  regenerates the page, runs the gates and pushes a `claude/monthly-pipeline-YYYY-MM`
  branch on the 27th of each month at 13:00 UTC; the owner still deploys.

**Other changes on the branch:**
- `/invest/long-term-rental/`: the FAQ's "5 to 7 percent cap range" (visible
  and schema) replaced with the measured 1.1 to 2.3 percent with a manager
  and 2.7 to 4.6 self-managed, linking to the returns page. No source ever
  supported 5 to 7 at the metro price and rent.
- `/sell/rental-property/`: the nonqualified-use sentence had the sequence
  backwards (it is rental years *before* you move in that count against you;
  rental years after you move out, inside the five-year window, do not). Fixed
  and linked to the hold page.
- `/invest/`: the four stat tiles ("19M+", "#2 fastest-growing", "+10.5%",
  "60 mi") had no source and the price figure matched no area. Replaced with
  four dated tiles, each linking to the page that owns the number: +6.1
  percent a year over ten years (Zillow), 6,898 homes permitted in 2025
  (Census), $1,823 three-bedroom benchmark (HUD FY2027), $20,946 average
  Airbnb revenue in Myrtle Beach (AirROI). **He only asked about the +10.5%
  tile; replacing the other three is my call, made because none had a source.**
  Also: the guide paragraph links all five pages, and two card grids with
  300px and 320px minimums no longer scroll the page sideways at 320px
  (MISTAKES 83).
- `specs/out-of-state.js` and `specs/new-construction-rentals.js` gained one
  cross-link each and now pin `datePublished` (2026-09-06 and 2026-09-07) so
  regeneration cannot move it. Any spec regenerated in future needs the same.
- `chapter3realty/llms.txt`, `sitemap.xml`: four new entries, the J-1 line
  rewritten. `build.js dates` and `llmsfull` run; preflight exits 0.

**Facts established this batch that must not be re-derived:** the metro
typical home value was $342,010 in July 2026, +0.2 percent over one year,
-1.7 over three, +26.3 over five (4.8 a year), +80.5 over ten (6.1 a year),
+46.8 over twenty (1.9 a year); the March 2007 peak fell 34.1 percent to
November 2011 and was not passed until December 2020. Horry County long-term
caps at the typical rent and value are 1.1 to 2.3 percent with a manager;
Pawleys at the county's $1,380 three-bedroom rent loses $105 a year before any
loan. AirROI's measured annual occupancy is 30 to 38 percent and June 41.5 to
48.9 across the eight markets it covers. Most DSCR lenders publish 1.10 to
1.25 for standard pricing and some fund to 0.75. Zillow's data site returns
403 to fetches; the CSV files download. FRED refuses this environment's
fetches; the county development layer and the county permit map answer.

**Decisions of mine he should confirm or overrule:** the four hub tiles
(above); the hold page's trade-down example uses two Conway houses at the
returns page's inputs rather than the research file's Loris example, so the
two pages agree; the returns page calls its thresholds "Chapter3's screening
rules"; the J-1 story is anonymized to "the owner of a house we sold"; the
Canadian page carries "in Chapter3's files a few Canadian investors have
closed with a U.S. loan; most have bought with cash".

**Still open on the live site, his call:** the nine submarket pages' seasonal
occupancy curves are labeled illustrative and show June at 52 to 91 percent
against AirROI's measured 41.5 to 48.9; the returns page's fifth dealbreaker
says any projection above 50 percent in June is above the market's best
month, so the two now disagree. Replacing the curves with AirROI's peak and
low months per market is the fix. Also: "Send the address" on 19 older pages;
14 older content pages with non-local H1s (warnings); the brass eyebrow labels
sitewide measure 3.45:1 on white, including the new hub tiles; one element on
`/sell/rental-property/` measures 3.01:1 ("the rent covers less of the co…").

**Previews (artifacts):** combined tabs
https://claude.ai/code/artifact/003da5fd-a197-4861-bf0a-91c62d498639 ;
returns https://claude.ai/code/artifact/3b6a6d25-9dee-4750-97f5-e013919f31fe ;
hold https://claude.ai/code/artifact/85fe0327-ce0c-430a-8d96-605f2e1aa91f ;
Canadian https://claude.ai/code/artifact/4a75ebc3-1ffa-4e32-8209-a3bc23dcdc85 ;
J-1 https://claude.ai/code/artifact/c1ee5b3c-992d-4f99-aafb-0b0652ca862a ;
construction https://claude.ai/code/artifact/31d0a2ab-938a-401d-85a7-10d743888ff9 .
The artifact service refuses wake subscriptions from this session, so nothing
watches them; read comments with the Artifact tool when he says he has left
some.

**Deploy state:** he has not deployed since batch 3 went live on 2026-09-07
night; batches 4 and 5 are on the branch only. He has no clone (MISTAKES 79);
the four commands in the environment section make one at `C:\c3`.

## 2026-09-09: the returns page round 2, and the price error he caught

**His edit list, and what each became.** Seventeen notes on the returns page.
The two that changed the most:

1. **"a $401,110 typical home I dont think this is the typical price for an
   investment property here which may be lowering our Cap rate."** He was
   right, and it was the whole problem. Zillow's headline ZIP value is the
   middle third of every home in the ZIP, beach houses and second homes
   included. Dividing the county's $1,823 three-bedroom rent by that produced
   2.3 to 3.6 percent and made the market look broken next to the 7.3 percent
   national benchmark. Zillow's bottom-tier file for the same ZIPs
   (`Zip_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv`, extracted to
   `research/invest-next/data/zip-bottom-tier.json`) puts the cheaper third at
   $160,703 in the Myrtle Beach core and $263,914 in Murrells Inlet. With his
   10 percent vacancy allowance the same rent returns **4.2 to 7.5 percent with
   a manager and 5.1 to 8.8 percent without one** in Horry County. MISTAKES 84.
2. **"Is our cap rate really that low if national is 7 and ours is 2-4"** —
   answered by the same fix. The page now has a section, "Which price should
   you divide the rent by?", that shows both prices side by side, because that
   question will occur to every investor who reads a national cap-rate figure.

**I was wrong on 2026-09-08 and told him so.** I removed the long-term rental
page's "5 to 7 percent cap range" that day, wrote it up as unsourced, and
logged it as a site defect I had fixed. The claim was right; my arithmetic was
wrong. That page now carries the corrected range and links to the returns page.
MISTAKES 85 and PLAYBOOK A22g: when a number the brokerage published from
experience disagrees with one I derive, my derivation is the suspect.

**The other fifteen edits, all applied:** 10 percent vacancy everywhere;
every return shown with a manager and without; the short answer says the
figures are all-cash before any loan and is followed by four stat tiles
instead of a wall of numbers; "appreciation" replaces "price change"
throughout, including the definitions table; "Most lenders want 1.10 to 1.25"
became "our target is 1.25"; the percent column at the county benchmark rent
is gone; "denominator" is gone; the CTAs are his words ("let us find top
performing properties", "every investor's goals are different"); the
dealbreaker section is four of his numbers in one table with no repeated
chart; the appreciation chart is larger; "A lender uses its own rent estimate"
is deleted; the calculator is rebuilt with a dark header, an input panel, two
big result cards, a line-by-line breakdown and a colour-coded verdict, and it
links to the rental analyzer.

**Two things I decided, both worth his eye.**
- **Short-term returns divide by the typical home value, not the cheaper
  third.** AirROI's revenue is the average of every listing in a market, and
  those are mostly beach properties. Pairing beach revenue with the cheapest
  houses would have shown Surfside at 10.6 percent. It shows 3.4 to 5.4
  percent, and the page explains the difference in one paragraph. If he wants
  the higher framing it needs a different revenue source, not a different
  price.
- **His 60 percent occupancy line stands, with the market average beside it.**
  AirROI measures 25 to 36 percent for the middle listing and 67 to 76 percent
  for the top tenth. The page states the target, states the average, and says
  the gap is the manager, which is his own point back to him.

**The map is a satellite photo now, as he asked.** Base image
`chapter3realty/invest/grand-strand-areas.jpg` (1400x1552, 224 KB), built by
`scratchpad/buildmap.py` from USGS The National Map imagery (public domain),
81 tiles at zoom 12, composited, cropped, desaturated and darkened. The USGS
service covers land plus an uneven nearshore buffer and returns black beyond
it, so `fixocean.py` builds one sea mask (close the black void across the pale
strips, subtract anything colourful or bright so the fill never reaches the
beach) and paints it deep teal. Boundaries are real ZIP polygons from Census
TIGERweb (public domain), simplified with Douglas-Peucker to 10 to 189 points
each, in `research/invest-next/data/map-shapes.json`. Eight areas, because
**Murrells Inlet and Garden City share ZIP 29576 and are now one area with one
label**, which is what he asked for instead of the sentence explaining the
shared ZIP. Both credits are printed under the map. To rebuild it, both
scripts are in the scratchpad and both are re-runnable; copy them into
`tools/` if this becomes a recurring job.

**The hold page was rebased to match.** Its all-cash section used the old 25
percent allowance and typical prices, so it contradicted the returns page the
moment the returns page changed. It now uses the same investor price and the
same 10 percent allowance: saved rent buys a second house in **13 to 24 years**,
not 41 to 67. PLAYBOOK A22e says the two pages carry one number from one
source, and that is what kept this from shipping broken.

**Verification.** `tools/verify-returns-calc.js` rewritten: four hand-computed
cases (including a negative one), every line item, the verdict text and its
colour class, the eight map regions, the four toggles, the satellite image's
natural size, hover, keyboard focus, Enter to pin, the not-measured fill, the
three charts and 320px. All pass. One case disagreed by a dollar and the tool
was right: my hand arithmetic dropped a term in the Pawleys tax. Same class as
MISTAKES 80. `verify-forms.js` clean at 1280, 768 and 320 on all three changed
pages. `preflight` exits 0.

**Still open, his call.** The brass eyebrow labels measure 3.45:1 on white
sitewide, including the four new stat tiles and the hub tiles. Fixing it means
darkening `--brass` everywhere, which is a brand decision, so I left the new
tiles matching the rest of the site rather than introducing a second brass.

**Previews.** Combined, all six pages, returns first:
https://claude.ai/code/artifact/003da5fd-a197-4861-bf0a-91c62d498639 . Hold:
https://claude.ai/code/artifact/85fe0327-ce0c-430a-8d96-605f2e1aa91f . The
standalone returns artifact
(https://claude.ai/code/artifact/3b6a6d25-9dee-4750-97f5-e013919f31fe) still
shows the 2026-09-08 build: the service refused a republish without a full
read of the live copy, so the combined link is the current one for that page.

## 2026-09-09, later: his second pass on the returns page

**Applied.** Hero sub cut to one plain line ("about 4 to 9 percent of the price
in rent each year"). "Which price should you divide the rent by?" became his
title, "How expensive are rental properties in Myrtle Beach?". The CTA is
"Have us find you your next investment" and its sub names off-market
properties. The rental analyzer is a brass CTA button under the calculator,
not a link in a footnote. Deleted: the Murrells Inlet ZIP paragraph, the
platform-fee caution, "The rent return is the same every year you own it."
"That gap is the manager" became "This relies on a good manager."

**Meta-commentary swept from all five pages**, per "delete this type of speech
from all 5 pages". Removed: "This is the question that decides whether the
market looks good or bad", "the whole page in six lines", "The next section is
why that matters more than anything else on this page", "The numbers below are
the whole page", "the one people argue with", "That is the argument for", and
a "from the next section" cross-reference on the J-1 page. The pattern to keep
out is any sentence about the page itself rather than about rentals.

**The nightly-rental section is rebuilt around occupancy, which answers his
question.** He asked why short-term does not beat long-term and guessed the
average occupancy. He was right, and the old chart was also unfair: it put
long-term (on a cheap house) beside short-term (on a typical house), so it
read as long-term winning everywhere. Every bar is now the same house:
a yearly lease, nightly at the market's average occupancy, and nightly at 60
percent. Costs are a single 55 percent of revenue, the midpoint of the
researched 45 to 65. Revenue scales with occupancy at the same nightly rate,
which is sound because AirROI's revenue is not rate times 365 times occupancy
(its listings are not all available all year, ratio 0.55 to 0.69).

**What that shows, and it is worth him seeing:** at average occupancy the
nightly let already beats a yearly lease in the beach markets, and loses in
Myrtle Beach city, Conway and Little River. At 60 percent every market wins.
The new last column is the occupancy a nightly let needs to match a yearly
lease: 20.7 percent in Murrells Inlet, 21.0 in Surfside, 35.8 in Myrtle Beach
city, 58.1 in Little River. That single column answers the strategy question
better than any prose on the page.

**The appreciation chart is his design:** a $150,000 purchase, stacked columns
at 3, 5 and 10 years, grey for what you paid, teal for appreciation at the
metro's ten-year rate, brass for rent kept. $150,000 in, $392,335 after ten
years. The rate is labelled on the chart and the text says plainly it is a
record and not a promise, that the same measure fell over the last three
years, and that rent is held flat so the brass side is understated.

**Verification.** All calculator cases, the map and the three charts pass;
`verify-forms.js` clean at three widths; preflight 0. The only harness flag
left is the 3.45:1 brass eyebrow, sitewide, still his call.

**Stats he asked about but told me not to add yet** (my recommendation, in
order): the break-even occupancy column, which I did add because it replaced
two confusing expense columns; nightly revenue year over year (Myrtle Beach
-10.7 percent, Garden City -11.1, Surfside -10.1, against Pawleys +9.9 and
Conway +9.2); asking-rent growth by ZIP (North Myrtle Beach +10.2 percent,
Little River -3.8); the June-to-January revenue swing; and listing counts as a
competition measure (8,583 in Myrtle Beach). Cash-on-cash with a loan is the
one an investor asks for most and non-negotiable 3 blocks it, because it
cannot be computed without a rate.

**Preview links after this round.** Combined, all six pages:
https://claude.ai/code/artifact/4f1a338e-bcb8-4271-8390-8731a2d2e646 .
Returns alone:
https://claude.ai/code/artifact/9857df6d-674f-4703-b9c4-1ce49e9254f2 . The
older combined (003da5fd) and returns (3b6a6d25) links are stale; the artifact
service refuses to overwrite them without a full read of the live copy, so
they were replaced rather than updated.

## 2026-09-11: the returns page rounds 4 and 5, and a live header defect

**Round 4.** The short answer is three facts and nothing else: what a Horry
County rental costs, the average return with a manager and without one, and the
average appreciation over five and ten years. "Our line" is banned sitewide and
`build.js` errors on it.

**Round 5.** The calculator is now "Investment calculator". Each box carries its
own greyed name inside it, there is a monthly loan payment input, and that input
drives a live coverage ratio and the verdict. The four dealbreakers are
explained in his own words. The appreciation chart lost the rent-kept block, so
only two blocks remain and every gain block carries its number.

**One instruction arrived without its verb.** His list quoted the calculator
verdict, "Passes. Above the 6 percent target with a manager running it.", and
said nothing about what to do with it. The loan payment input changed that
verdict anyway, because the verdict now has to answer the coverage test as well.
It reads "Passes. The return is above the 6 percent target with a manager
running it.", plus a sentence about the monthly cost when a payment is entered.
He has been told that is my reading and it is his to overturn.

**A live defect he has not seen yet, found while measuring this round.** Every
page on the site scrolls sideways between 800px and 979px wide. The page is
980px at its narrowest and the viewport is smaller. The cause is the header:
`nav.primary` hides at `max-width:768px`, so between 769px and 979px the logo,
the full nav and the phone number are all on screen and do not fit. Measured on
five pages, including pages untouched this month, so it is not from this work.
Common laptop windows and Android tablets land in that band. iPad portrait
(768) and landscape (1024) are both clear, which is probably why nobody has
reported it.

The fix is to move the breakpoint that hides the nav and shows the menu button
from 768px up to 979px, in `chapter3realty/assets/app.*.css`, then
`node build.js rehash` and re-verify. It changes every page, so it is its own
change and it needs his yes first. Nothing in this round depends on it.

## Suggested order for the next session

0000. **The returns page round 2 is on the branch** (section above). Expect his
   reaction to the new cap rates, the satellite map and the rebuilt
   calculator. If he wants the short-term figures on the investor price too,
   that needs a revenue source for cheaper properties, not a price change.
000. **Batch 5 is built and on the branch, not deployed.** Five pages, the hub
   tiles, two corrected pages. Expect his edit list from the six previews;
   apply edits to the specs and regenerate (`node tools/mkpage.js specs/<name>.js`),
   then `node build.js dates`, `llmsfull`, `preflight`, the harness, and for the
   returns page `tools/verify-returns-calc.js`. Ask him about the four hub
   tiles and the submarket occupancy curves (both above). The monthly Routine
   for the construction page fires on the 27th; its first run needs
   `tools/permits.js` on a branch it can find.
00. **Seventeen investor pages are built and on the branch.** The twelve are
   live as of 2026-09-07 night; batch 4 (five pages, three sections above) has
   his round-2, round-3 and round-4 edits applied, gates green, and awaits
   his review and deploy.
   Apply his
   edits to the specs and regenerate, never to the pages. Three rules are now
   gates: his NMLS number and any licensed-loan-originator claim never appear
   anywhere (A17), his name is in the byline only (A20a), and nothing "sets"
   anything (A22a). When he says so, sweep the eight batch-1 and batch-2
   pages for "sets" and regenerate them. He has not deployed batches 2 or 3;
   the deploy command is in the environment section. The licence sweep
   touched 117 pages, so the next deploy is a full one.
0. **The three revised tax pages are on the branch and in the previews.** Expect
   the next line edits from him, plus his answer on the local-versus-Chapter3
   question above. Two pages (accommodations tax, STR tax) still await notes.
0a. **Ask him to check one Horry County condo record** for a land line, and
   correct the depreciation page if the record shows something else.
0b. **Homepage: the declutter version with his evening edits is on the branch.**
   He has the corrected preview; expect line edits. Any further homepage
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
