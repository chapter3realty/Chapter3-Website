# Mistake log

Every entry is a real mistake made on this project, what caused it, and what
now stops it recurring. Read the **Five rules** before any change; they are
where most of the pain came from.

Mechanical guards live in `node build.js audit`. Judgment rules live here and in
`CLAUDE.md`. Neither layer alone is enough — several of these mistakes were
made *while fixing another one*, and passed a green gate.

---

## The five rules

**1. A change is not verified until it is measured on the rendered page.**
Reading HTML proves nothing. Text that is present in the source can be
invisible on screen. That has now happened four separate times.

**2. Before any multi-file replace, enumerate the distinct contexts.**
This site has two hero types with opposite colours. Three separate times a
find-and-replace assumed one context and silently corrupted the other. List
the variants first, handle each explicitly, and measure a sample from *each
group* afterwards, not just the one you were thinking about.

**3. Verify a fix in both directions.**
"Ivory text is invisible here" does not mean dark text is safe everywhere. A
one-directional rule let 16 pages get broken while the gate stayed green.

**4. Sanity-check a scanner before trusting what it reports.**
Run it against one case that should match and one that should not. Several
"findings" in this project were the scanner being wrong: 125 phantom defects
from a 0×0 viewport, 20 false positives from a nesting-blind text scan, a
"51 pages missing dates" count that was reading JSON-LD instead of visible copy.

**Silence is not a pass.** A rule that cannot match reports nothing, and nothing
looks exactly like clean. Two of these got through: a `dateModified` regex that
required no whitespace skipped 30 pages, and a `ReferenceError` in a new rule
was invisible because the test piped output through `grep` for the *expected*
message — which a crash never contains. Assert the failing case actually fails,
and check the exit code, not a filtered line.

**5. Never infer a fact about the business or the world from repo artifacts.**
Git history is not the site's launch date. A file's presence is not proof a
feature works. Open the real source.

---

## Rendering and CSS

| # | Mistake | Now prevented by |
|---|---|---|
| 1 | Ivory text on the ivory `.detail-hero`, contrast 1.00:1. Shipped, then recurred twice more after "fixes" that used a non-greedy hero regex and missed 16 pages. | `audit` byline rule + `.claude/verify.js` contrast pass |
| 2 | **Fixing #1 backwards:** changed bylines to dark on *navy* heroes, creating navy-on-navy at 1.00:1. Done twice — 8 submarket pages, then 16 more. | `audit` checks **both** directions against the page's hero type |
| 3 | Hero headings unselectable: an animated overlay lacked `pointer-events:none`. | `verify.js` hit-tests with `elementFromPoint` |
| 4 | `.grid-2/3/4` set `grid-template-columns` but never `display:grid`, so cards stacked full width. | `audit` flags the inert class; `verify.js` asserts computed `display` |
| 5 | Inserted a modal before `</main>`, landing it inside a `display:none` section. Measured 0×0. | `verify.js` painted-size check |
| 6 | Tested responsive layout at element widths instead of viewport widths. | Playbook: resize the real viewport, then measure |

## Content and facts

| # | Mistake | Now prevented by |
|---|---|---|
| 7 | Claimed a research finding that did not exist. | Rule 5; cite a source you opened |
| 8 | Told the owner the site was 13 days old, inferred from the first git commit. It was ~2.5 months. | Rule 5; memory records the real launch date |
| 9 | Said Pawleys Island straddles the county line. It is entirely in Georgetown County. | Adversarial fact-check pass; 20 of 163 researched facts were wrong |
| 10 | Copy written with metaphors against the owner's literal-and-direct rule. | `audit` banned-phrase list |
| 11 | Reading-order phrases ("the former") that break a passage when an AI quotes it alone. | `audit` anaphora rule |

## Code

| # | Mistake | Now prevented by |
|---|---|---|
| 12 | Deleted a variable declaration during an edit. `node --check` passed: it validates syntax, not undeclared identifiers. | `audit` verifies every inline handler calls a function that exists; `verify.js` checks the console |
| 13 | Narrowed a CORS header and broke every browser request. `curl` still worked, so it looked fine. | Playbook: verify in the browser, not with curl |
| 14 | Calculator maths bugs: vacancy double-subtracted, typed zeros ignored, 0% rate divide. | Playbook: hand-compute two expected values and compare to the dollar |
| 15 | Copy promised an emailed PDF; the code downloaded locally. | Playbook: exercise the feature, do not describe it from the code |
| 16 | Fired the same analytics event twice for one conversion. | Playbook form step |
| 17 | Broke a `/* */` comment block in `build.js` twice by pasting `*` lines outside it. | `node --check` after every edit to build tooling |

## Site structure

| # | Mistake | Now prevented by |
|---|---|---|
| 18 | Published `/buyers/new-construction/` with no inbound body link from anywhere. | `audit` orphan rule (blocker) |
| 19 | Bulk-stamped all 54 sitemap `lastmod` dates to one day. | `audit` bulk-stamp guard; dates come from real content-change commits |
| 20 | Let `llms.txt` advertise a date older than the newest page. | `audit` freshness rule |
| 21 | Left visible date, schema `dateModified` and sitemap `lastmod` disagreeing on 34 pages. | `audit` three-date agreement rule |
| 29 | `llmsfull` dated the file with `new Date().toISOString()`, which is UTC. `llms-full.txt` claimed `2026-07-28` while every page in it said `07-27` — an index advertising itself as newer than its own content. | The date now comes from the newest sitemap `lastmod`, so it is content-derived and deterministic. `audit` errors if either llms file is **newer** than every page, and warns if it is older. |
| 30 | The three-date rule matched `"dateModified":"` with **no** whitespace. Every pretty-printed JSON-LD block therefore skipped the check entirely and the gate reported clean. 30 pages were carrying a second `WebPage` block frozen at `2026-07-10` against sitemap dates up to `07-25`. | Regex allows `\s*` around the colon, checks **every** occurrence, and errors when one page holds two different `dateModified` values. A scanner that cannot match is not a passing test — see rule 4. |
| 31 | Counted a page as edited because the only diff was the `Updated <date>` stamp that had just been added to it. That reasoning would have bumped nearly every URL — the exact bulk stamp rule 19 exists to stop. | Content comparison strips date stamps and boilerplate entity renames before diffing, so a page only counts as changed when its actual prose changed. |
| 32 | Every date defect above (19, 20, 21, 29, 30, 31) came from a human deciding a date. The judgement was the defect, not the typing. | `node build.js dates` derives all three date fields from git and is the only thing allowed to write them. `preflight` runs `dates --check`. |
| 33 | The first version of `dates` counted a markup-only edit as prose. Wrapping two existing words in a link on `/submarkets/carolina-forest/` turned `construction,` into `construction ,` once tags were stripped, and it wanted to age the page. | Whitespace before punctuation is collapsed before comparing. Tested both ways: a link wrap does not fire, an added sentence does. |
| 34 | The first version took **4m47s**, spawning one `git show` per commit per page. A gate that slow does not get run. | One `git log --name-only` plus one `git cat-file --batch` for the whole site. 6s. |
| 35 | Wrote a test that "passed" while mutating nothing — the sitemap entry it targeted was multi-line and the single-line replacement never matched. A no-op test looks exactly like a passing test. | Every mutation test asserts the mutation landed before reading the result. See rule 4. |
| 39 | **Wrote the HOA batch for the industry instead of the buyer.** The owner works in this industry and said he could not understand half of one page. Reading level was not the defect: the pages already scored grade 4.8 to 6.8. The defect was subject matter. One page named Fannie Mae, Freddie Mac, the Selling Guide, the NAIC, the state insurance department and the wind pool, carried ten dates, and ended with a **604 word** sources block. Another shipped **1,022 words** of recited statute under the copy. | `audit` errors on a hero sub-header over 45 words and a sources block over 90 words; warns on 3+ industry bodies named in body copy, on more than 2 explicit dates, and on a 900+ word page with fewer than 2 in-article CTAs. |
| 40 | Fixed "too complicated" twice by lowering reading level, when the reader's actual complaint was that the content was about the wrong subject. Grade level is a proxy, not the thing. A page can pass every readability score and still be unreadable because it answers a practitioner's question. | Playbook adds the buyer test: would a buyer standing in the property do anything differently because of this sentence? If not, cut it. Applies before any readability check. |
| 41 | Shipped long pages with a single call to action, in the hero. The owner read a finished page and said there were no CTAs in the article. He was right, and it turned out to be true of **45 pages** site-wide, not just the new ones. | Generator places two CTAs inside the article. `audit` warns below two on any page over 900 words. Warning not error only because the back catalogue is affected; promote once fixed. |
| 36 | Diagnosed the inline `var MAP={...}` block as dead single-page-app junk and was one step from deleting it from 73 pages to stop Google rediscovering legacy URLs. It is **load-bearing**: `.page-section{display:none}`, an earlier script strips `.active` and restores it to `#page-home`, and `#page-home` exists in exactly one file. Its `showPage(CUR)` is the only thing that makes the copy visible on **64 pages**. Deleting it would have shipped the invisible-content defect a fifth time, at the largest scale yet. | `audit` errors if a page hides `.page-section`, runs the reset, owns no `#page-home`, and has lost `showPage(CUR)`. Tested both ways. |

## Design and CTA

| # | Mistake | Now prevented by |
|---|---|---|
| 25 | Changed `object-position` on a square photo inside a square box. Cover crops nothing when the aspect ratios match, so the "fix" did nothing at all. Reframing needs the BOX aspect changed. | `audit` warns on object-position applied to a square team photo |
| 26 | Left CTA phone numbers as underlined body text next to a button. They read as prose, not as an action. Flagged twice by the owner. | `audit` warns on a `tel:` link in a CTA row that is not a `.btn` |
| 27 | Buried the strongest selling point (the AI document analysis) in a paragraph. Buyers skim; it has to be a visual block. | Manual: put a differentiator in a contrast panel, never mid-paragraph |
| 28 | Claimed a team member reviews "every agreement and addendum". Overstated a person's role. | Manual: describe a role, never promise an individual's involvement in every transaction |

## Working with the owner

| # | Mistake | Now prevented by |
|---|---|---|
| 22 | Gave a URL with no instruction on where to put it; it was pasted into PowerShell and failed. | Say where a command or link goes, and what must be running |
| 23 | Handed over localhost preview links without saying they die when the server stops. | Same |
| 24 | Ran two commands on one line, producing `productionwrangler`. | Give one command per block |
| 37 | Nearly handed over `curl -sI ...` for the owner to verify a 503. In Windows PowerShell `curl` is an **alias for `Invoke-WebRequest`**, which does not take `-sI`, so the check would have errored and the "is the site really down?" question would have gone unanswered. Real curl is at `C:\WINDOWS\system32\curl.exe`. | Always write `curl.exe` for PowerShell. Test any command in the owner's actual shell before sending it. |
| 38 | `README.md` gave the deploy command **without** `--branch production`, in two places, while `PLAYBOOK.md` had it right. Cloudflare Pages treats any other branch as a preview deployment, so following the README succeeds, prints a URL, and never updates the live site. | Both files now carry the identical command, and the README says why the flag matters. When two docs give the same command, diff them. |

---

## Standing exceptions

Current `audit` warnings that are deliberate. Do not "fix" them silently.

- **10 pages state a down-payment percentage.** Cross-referenced against the
  rule text on 2026-07-26. **Zero HIGH remaining** — the two pages that stated a
  figure beside our own lender (`/invest/strategies/dscr-loans/`,
  `/invest/condo-buildings/`) were rewritten qualitatively. The remaining ten
  are "review": a VA funding-fee schedule, an FHA/SC Housing program table, or a
  description of who is buying in the market. Reg Z 1026.1(c) applies to those
  who offer or extend credit and a brokerage is not a creditor; Reg N covers
  brokers but only bars misrepresentations, so accuracy is the defence.
  New pages must not add to this list — write financing qualitatively.
- **"0% down" is NOT a trigger term.** Official commentary to 1026.24(d)(1):
  "statements such as no downpayment or no trade-in required do not trigger the
  additional disclosures." `/buyers/va-loans/` was wrongly flagged until the
  gate was corrected. Do not strip "0% down" from VA or USDA copy.
- **`--brass` link colour measures 3.01:1 on ivory**, below AA for body text.
  Brand-level decision.
- **`--muted` body text measures 3.91:1 on ivory and 3.80:1 on ivory-2**, below
  the 4.5:1 AA threshold. This is site-wide and pre-existing, not introduced by
  any one batch: an existing page and a new one measure identically. `--muted`
  is `rgba(28,32,40,0.58)`. Raising the alpha to **0.64** clears AA on both
  backgrounds (4.69 and 4.52) and is visually near-identical. Not changed
  unilaterally because it repaints every page. Owner's call.
- **`/sell/` ships a stale duplicate JS bundle** with an old `recalcLtr`. That
  page renders no calculator, so no wrong number reaches a user.
- **Two pages have no question-shaped heading**, which is weaker for AI answers.
