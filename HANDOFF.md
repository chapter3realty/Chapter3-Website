# Handoff

What a new session needs that is not in the code.

`CLAUDE.md` has the rules, `PLAYBOOK.md` the procedure, `MISTAKES.md` the 41
logged mistakes and what now prevents each. **Read those first.** This file is
only the things they do not say: who you are working with, real-world facts you
cannot infer, what is in flight, and what is unresolved.

Written 2026-07-30. Anything marked **UNRESOLVED** needs the owner.

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
- **Paul Hankins was removed 2026-07-28 and is coming back.** `RESTORE-PAUL.md`
  is the map. Do not revert the commit, it also carries a CSS fix.
- **IndexNow is already configured** under key
  `100285c38d874e7992b8bfc0b1d868a1`, live at the site root. Do not mint a new
  one. `indexnow.ps1` reads the sitemap at run time so it cannot go stale.

---

## State as of this writing

**The site is intentionally offline, returning 503.**
`functions/_middleware.js` line 41 is `MAINTENANCE_ON = true`. It was taken down
for a licensing matter, planned for about three days. Sixteen commits are
pending deployment; nothing since the window opened has gone live.

To bring it back: flip that line to `false`, deploy, then confirm with
`curl.exe -sI https://chapter3realty.com/ | Select-Object -First 1` that it
returns 200. Then run `indexnow.ps1`, resubmit the sitemap, and spend Search
Console quota on the homepage first.

**Twelve URLs still need manual indexing in Search Console** once it is back up.
He ran out of daily quota partway through the list.

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

**2. Condotel financing as an expertise claim.** He said financing "is not our
expertise, we are not a lender." All 77 indexable pages list
`condotel financing` in their `knowsAbout` schema, and `/invest/condotel-financing/`
exists as a full page. Unreconciled. `/invest/str-tools/` also carries a
"Financing a short-term rental" section.

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
