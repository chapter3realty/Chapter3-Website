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
| 42 | Said real estate and financing were "under one roof" in 17 places, including the site-wide footer and four meta/schema descriptions. The owner called it illegal: Chapter3 does not own BrickWood, so it asserts a company that does not exist. Removing the prose in three pages during the July ownership fix missed it because that pass grepped "common ownership", not the claim restated as a metaphor. | `audit` roof gate, scoped to a roof word in the same sentence as a lender or agent word so the literal duplex roof on `/invest/strategies/small-multifamily/` still passes |
| 43 | `/buyers/relocating/from-massachusetts/` shipped the same estate-tax question and answer **six times**, in the FAQPage schema and printed six times down the visible page. Three checks ran over it and none could see it: the schema-visibility rule only asks whether each question appears on the page, and six copies of a visible question pass it six times; `assemble-page`'s FAQ-to-FAQPage sync passed because both sides were equally wrong; and the near-duplicate check is cross-page, not within-page. Found only by listing every FAQ question in the cluster side by side while answering an unrelated question. | `audit` errors when one FAQPage repeats a question **or** an answer. Answers are compared too, because a copy-paste that edits the question and leaves the answer is the same defect. Positive-controlled: fired 6/6 on the live page, silent after the fix. |
| 44 | The near-duplicate checker stripped `<script>` but **not** `<style>`, so every CSS property name, value and class name counted as body words. Because every page inline-styles the same chrome and the tax calculator adds a large identical `<style>` block to ten pages, thousands of shingles were identical by construction. It reported the from-state pages at **49-57%** overlap when their real prose overlaps **38%** at worst. That inflated number was about to drive a real decision on how many state pages to build. | `<style>` is stripped alongside `<script>`. Sanity-checked both ways per rule 4: a page given another page's body verbatim reports 100%, two unrelated pages stay silent, and the corrected figure matches an independent rendered-text measurement. |

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
| 45 | Asked the owner to approve raising `--muted` from 0.58 to 0.64 for AA, he approved, and the change was one edit from shipping. The premise was stale: a commit on 2026-08-15 ("darken the muted grey for older readers") had already raised it to **0.78**, which measures 7.29:1 on ivory and 6.97:1 on ivory-2. Applying the approved 0.64 would have LOWERED contrast below what is live, with an approval attached. The standing-exception note was written before the fix and never retired. | Measure the rendered value before acting on any recorded defect, however authoritative the note (rules 3 and 4). Retire a standing exception the moment its fix ships. |
| 46 | The site shipped for weeks in an AI register the owner had to ban device by device: pseudo-clefts ("What the leftover money does is your call"), idioms ("seals it", "in your pocket", "the last word"), personified numbers ("prices sit", "Florida sent", "taxes move against the mover"), indirect price verbs ("runs about $342,000" — 73 instances on 16 pages), contrast framing, anaphora ("what to expect ×4" in a hero I wrote **during** the ban round). Each fix round removed instances; nothing stopped new ones. | The full taxonomy is now in PLAYBOOK A11 and **errors** in `audit` (`AI_TELL_PHRASES` + `AI_TELL_REGEX`, positive-controlled). When the owner bans a phrasing, the ban goes into build.js in the same commit as the fix. A style rule that lives only in prose does not hold. |
| 47 | An earlier fix was applied to the **built page** of a spec-generated page (`/buyers/relocating/schools/`, pros-and-cons, getting-around). Reassembling all specs from `data/relocating/pages/*.js` silently resurrected the banned text; only the audit gates caught it, and one un-gated fix (moving-checklist) had to be forensically ruled out from the transcript. | On any page generated from a spec, fix the **spec**, never the built HTML. Before a bulk reassembly, `git status` the built pages and confirm every uncommitted built-page change also exists in its spec. |
| 48 | The first sweep for indirect price verbs greped with fixed-width context (`grep -o ".\{60\}runs about..."`), which silently skips matches with less than 60 preceding characters and merges adjacent hits. The "complete" list missed 15 instances; the audit gate found them after the fix was declared done. | A scanner used to build a fix list must be the same scanner that gates the defect (rule 4). Use the audit itself, or `re.finditer` with variable context, never fixed-width grep, to enumerate instances. |
| 49 | The search modal was unusable on a phone and had been since launch. `.idx-head` was `position:sticky;top:0` and `.idx-foot` was `position:sticky;bottom:0`; on a 390x844 screen the head (215px) and foot (543px, mostly the TCPA consent block) filled the 776px panel, leaving about 18px of scrollable space for every filter. Every control was in the DOM and measured `visible`, so a DOM-presence check passed. Only a rendered screenshot showed the defect. | Two sticky edges inside a scrolling panel are a mobile trap: measure `panel.scrollHeight` against the space actually left between them, not just element visibility. The rebuilt modal has no sticky footer. |
| 50 | Four state pages said South Carolina gives a retiree "up to $10,000 of retirement income PLUS an age deduction of up to $15,000 per person". The two do not stack: SC Code 12-6-1170(B) reduces the $15,000 age deduction by whatever is claimed under (A), so the combined cap is $15,000 per person. The tax engine implemented it correctly, so the calculator and the prose beside it disagreed for weeks. | When prose describes what a calculator does, check the prose against the engine's output, not against the other pages. Same-topic sentences on other pages are the likeliest place a wrong claim is copied from. |
| 51 | `/buyers/coastal-insurance/` said comparison sites put Myrtle Beach "above $5,000 a year, the highest in South Carolina". Re-checked at the source: one survey puts Myrtle Beach at $4,472 with Charleston at $5,293 (higher), another at $5,341 with Charleston lower. "The highest" was not supported and "above $5,000" was one survey's number stated as fact. | A superlative needs two sources that agree, or it becomes "among the highest". Range the figure when surveys disagree. |
| 52 | Published a preview artifact of the homepage with the search modal forced open on load, to show off a rebuild. The owner opened it, saw his homepage covered by a panel, and reasonably concluded the change had broken the site. The rebuild was reverted on his instruction. | A preview shows the page as a visitor gets it. Never auto-trigger an overlay, modal or popup in a preview; if a component needs showing, screenshot it or build a separate page that is only that component. |
| 53 | "Reg Z to zero" was not zero. Four pages still stated down-payment percentages in forms the adjacency gate could not see: "10% minimum down payment" (a word between the number and "down"), "The down payment. Plan on 20 to 25 percent" (a label, with a tag between), "FHA allows 3.5 percent" (the percentage before the phrase), and a client story ("about 5 percent of the price available for her down payment"). All shipped through the 2026-08-30 sweep. | `TRIGGER_DOWN_NEAR` errors on a nonzero percentage within the same sentence as "down payment", either order, matched on tag-stripped text (the first version scanned markup and a `</strong>` killed the window - caught only because the positive control replayed the exact case that shipped). Closing-cost ranges and seller-concession caps are exempt: they are not 1026.24(d)(1) triggers and both false-positived. |
| 54 | "We price it deal by deal" shipped five times on the DSCR page: Chapter 3, in first person, pricing a loan. The lending-voice gate listed finance/lend/originate/underwrite but not price. | LEND_VOICE now errors on "we price it/the/your + loan/deal/rate", scoped so CMA and listing pricing stay legal. Fixed as "BrickWood Mortgage prices it deal by deal"; the page carries the AfBA disclosure that naming BrickWood requires. |
| 55 | The hero sub-headers were not written as headlines. 22 relocation pages ran on one template ("what taxes to expect, what to expect on... and what to expect..."), 51 subs ran 31 to 67 words, 37 carried no number or place, 16 spoke as "we", and the strategies hub sub was an empty contrast ("minutes, not weeks"). Every one passed the 45-word cap, the only sub rule that existed. | `SUBHEAD` gate: 8 to 30 words, a page keyword, a concrete anchor, no question, no "we", no ", not X", no repeated three-word phrase, not the H1. Both hero markups are measured (ivory `.detail-sub` and the navy inline paragraph). PLAYBOOK A14. 90 subs rewritten. |
| 56 | The register drifted the way the public complaints about this model say it does, and no gate measured sentence shape: 626 instances on 95 pages (185 sentences over 40 words, 106 "actually", 72 sentences opening with And/So, 64 parenthetical asides of five or more words, 52 "here is how/what" teasers, plus the smaller families). Readability grade and the mannerism list both passed them. | `PUNCH` gate on every `<p>`/`<li>` in `<main>`: sentence cap 40 words and page mean 20, asides, And/So openers, the hedge/intensifier list, the summarizer and teaser list, buzzwords; may/might counted. Legal blocks exempt. PLAYBOOK A15. Every instance rewritten at source. |
| 57 | The first teaser regex matched "here is a" anywhere, so "a typical first deal here is a single-family home" and "daily life here are the flood elevation" were flagged as teasers. Caught by reading the hit list before trusting it (rule 4), not by the gate. | The teaser pattern requires sentence position: start of sentence, or after a comma, colon, or "so/and/but". Calibrate a new scanner on the full corpus and read the hits before enforcing it. |
| 58 | The keyword check fell back to the H1 on pages without Article keywords, and the homepage H1 is a brand line ("every chapter starts at home"), so the gate demanded "starts" in the homepage sub. | Fallback order is Article keywords, then the title's first segment (the topic), then the H1. A gate that derives a requirement from a slogan is measuring the wrong thing. |
| 59 | The header showed two navy phone boxes side by side on desktop. The partial carried a desktop link and a mobile link with different classes, and the CSS that hid one at each width had been lost in a stylesheet refactor; nothing measured the header after that. | The header now has one phone link, bold text with no box, and the Playwright header check in scratchpad measures exactly one visible phone link at 390 and 1280 pixels. Any chrome change is measured at both widths before stitch is trusted. |
| 60 | The six investor strategy pages explained each strategy well and said almost nothing about why an investor would use Chapter3 for it in this market: zero to three such sentences per page. A national brand could have published them. | `LOCAL EDGE` errors on a strategy page with fewer than four sentences pairing a Chapter3 token with a local one; `SALESY` errors on the desperate forms so the fix stays informational. PLAYBOOK A16. |
| 61 | The Reg Z down-payment ban was written as a sitewide rule and applied to investor pages Regulation Z never reached. Weeks of investor copy said "a substantial down payment" where it could have said the number, which is the fact the reader came for. | Reg Z governs consumer credit; 1026.3(a)(1) plus commentary 3(a)-4.i put non-owner-occupied rental credit outside it. `DOWN_PAYMENT_OK_PAGES` allows the percentage on four business-purpose pages and requires the lender to be named; everything owner-occupied still errors. The 14-day personal-use line in the same commentary is why the allowlist is four pages and not the whole `/invest/` tree. |
| 62 | "Confirm which case you are buying" shipped on the BRRRR page and "we will tell you which case you are in" on the Florida page. The owner read both as machine-written, and they are: the sentence names no thing to check and no consequence. | `AI_TELL_REGEX` errors on "confirm which", "determine which" and "which case you are". The fix has one shape: name the thing, name who checks it, name what a bad answer costs. |
| 63 | Two paragraphs on `/invest/strategies/fix-and-flip/` sat inside the navy example box with `color:var(--muted)` and rendered navy-on-navy at 1.00:1. The real-deal story and the who-buys paragraph were invisible on the live site, and the box rendered 829px tall on desktop with 589px of empty navy under the last row. The owner reported it as a UI complaint about a long empty box, not as missing text, because he could not see the text at all. Fifth time invisible text has shipped. | The navy box now closes after the grid. A nesting-aware gate walks the tag stream in `<main>`, tracks the nearest **inline** painted background, and errors on dark text over a dark ground or ivory over ivory. It stays silent when the ground comes from a CSS class, because there it cannot know; a browser contrast sweep covers that case. Positive-controlled three ways: dark-on-navy fires, ivory-on-ivory fires, ivory-on-navy stays silent. |
| 64 | "Cash wins the houses that speed decides" and "the sale is where most of the profit is made or lost" shipped on the flip page, with nine more of the same shape across BRRRR, guides, invest and capital-gains. The owner: "it is against your rules to talk like this... delete it from the face of the website and NEVER let me see it ever again." He is right; the rule was already written and I broke it. | Six `AI_TELL_REGEX` patterns now error on the family: "made or lost", "X is where the Y is made", "X wins the Y that Z", "speed/cash/price decides", "decides who", "decides the outcome". All eleven instances rewritten to name who does what. |
| 65 | The first version of the aphorism gate banned `decides? whether` outright and fired on 13 pages. Reading them showed most were literal and correct: "the recorded HOA rules decide whether you can rent" names who holds the authority, and "you decide whether the dues are worth it" has a person deciding. A gate that fires on good copy teaches people to ignore gates. | Narrowed to the cleft the owner actually objected to, `is what decides` and `what decides whether`, which left three real hits. PLAYBOOK rule 4 again: run a new pattern over the corpus and read the hits before adopting it, not after. |

---

## Standing exceptions

Current `audit` warnings that are deliberate. Do not "fix" them silently.

- **The ten down-payment pages were rewritten qualitatively on 2026-08-30**
  per the owner's decision, and the audit now ERRORS on any stated down-payment
  percentage, lending rate, loan-payment amount, first-person lending voice,
  "in-house" beside a lending word, or em dash in body copy. All gates
  positive-controlled. The old standing exception is gone; do not restore a
  figure.
- **"0% down" is NOT a trigger term.** Official commentary to 1026.24(d)(1):
  "statements such as no downpayment or no trade-in required do not trigger the
  additional disclosures." `/buyers/va-loans/` was wrongly flagged until the
  gate was corrected. Do not strip "0% down" from VA or USDA copy.
- **`--brass` link colour measures 3.01:1 on ivory**, below AA for body text.
  Brand-level decision.
- ~~`/sell/` ships a stale duplicate JS bundle~~ Fixed 2026-08-30: the divergent pair is merged (the divergent function was dead code in both), and the real finding behind it was a launch-day double maps-loader throwing a SyntaxError on all eight original submarket pages, also fixed.
  page renders no calculator, so no wrong number reaches a user.
- ~~Two pages have no question-shaped heading~~ Stale: the audit reports zero such pages as of 2026-08-30. Retired.

## 66. Five pages passed every gate and the owner could not read them (2026-09-05)

**What happened.** The five investor tax pages cleared the punch rule, the
aphorism rule, the figurative list and the sub-header rule. The owner spent an
hour on the first one and understood nothing. His examples were exact: "which
line of the map", "the gap opens", "catches almost nobody", and a paragraph
that took four clauses to say "if the platform takes the payment, the platform
pays the tax".

**Why the gates missed it.** They matched instances, not the class. A18 banned
six aphorism shapes; the copy used metaphors instead. The sentence caps were
set for a general reader and the tax pages sat inside them at a mean of 19.
And no rule required the page to define its subject before elaborating.

**What stops it.** PLAYBOOK A22: `REGISTER_REGEX` names phrase types and errors
on all of them; strict sentence caps on every page from that date; question
headings with the first one defining the subject. And the standing lesson:
when the owner says a page is unreadable, the gates are wrong, not the owner.

## 67. A correct sentence was "fixed" into a wrong one from a search summary (2026-09-05)

**What happened.** `/invest/str-rules/` said Pawleys Island has no business
licence. A web search summary, citing a third-party listing site, said
Georgetown County requires one for stays under 30 days. That claim was
published on the new accommodations tax page and used to "correct" the rules
page. The owner challenged it. The county's own FAQ says the county requires
no business licence in unincorporated areas. The original sentence was right.

**Why it happened.** Non-negotiable 8 was skipped for one fact. The search tool
returns a summary that reads like a source; it is not one. The county FAQ was
one click away.

**What stops it.** A fact that changes an existing sentence gets the same
treatment as a new fact: open the primary source, quote it into the research
file, then edit. A summary that cites a listing aggregator is not a source.

## 68. Hedge sections passed the register gate (2026-09-05, same day as 66)

**What happened.** The rewritten short-term rental page carried a section
titled "What will this page not tell you?", a hero sub-header made of three
undefined terms, and lines like "That is a fact about the tests. It is not a
verdict on you." Every one passed the new register gate. The owner read it and
stopped reading.

**Why.** The gate matched the phrase families he had named. It did not match
the families he had not yet seen: a whole section whose purpose is to
disclaim, two steps named in one sentence, "not a verdict", "no web page can".
And no gate can catch a term used before it is defined.

**What stops it.** Those families are in `REGISTER_REGEX` now. A section
heading that says what the page will not do is a build error. And the rule
that cannot be a regex is written where every session reads it: define active
and passive, define a rental pool, define every term of art in its own
sentence before it is used. If the reader has to already know it, the page
has failed.

## 69. A count-up animation rewrote "Instant" to "8" (2026-09-05)

**What happened.** The homepage declutter replaced the four-number stat row
with eight word badges. The second badge said "Instant". The homepage effects
script keyed a count-up to `.why-stat:nth-child(2) .stat-kpi` with a target
of 8, left over from the old row. On scroll it wrote "8" over "Instant". The
change was browser-verified for colour and contrast at load, before the
animation ran. The owner opened the page and said the UI was bad.

**Why it happened.** Rule 1 was applied to colour and not to text. A check at
load does not see what a scroll-triggered script does after load. And the
hook chose its target by position, so a content edit that kept the class
names changed what it hit.

**What stops it.** `build.js audit` errors when a count-up definition in a
page's own scripts or its loaded bundles targets a `.stat-kpi` whose visible
text is not the animation's final value. Positive-controlled both ways. The
homepage effects script is deleted; the page is static. PLAYBOOK A29a: a page
with scroll-triggered script is measured after a full scroll, not at load.

## 70. The preview builder dropped every head style block (2026-09-05)

**What happened.** The preview builder (now `tools/mkpreview.js`) kept the
page `<body>` and the shared CSS and threw away every `<style>` block in the
page head. Article pages lost only the dropdown nav and the search modal
styling, so the modal's form printed at the foot of every tax preview. The
homepage keeps its carousel, chooser cards, ticker and search modal styles in
those blocks, so its preview showed five reviews stacked in the hero,
unstyled cards, the search form at the foot of the page and no team photos.
The owner judged three homepage versions through that preview in one day and
rejected all three. The third was already the original design.

**Why it happened.** The builder was checked on article pages, where the
damage is small, and never on the homepage. No rendered preview was opened
before its link went out. Rule 1 applies to a preview as much as to a page.

**What stops it.** The builder keeps every head style block, inlines local
images, and throws if a head style block does not reach the output. It is in
the repo. Before any preview link goes out: render the preview file in the
browser and compare its height and section list with the page's own render.
A preview that differs from the page is not sent.

## 71. A half-deleted component painted black bands on 108 pages (2026-09-05)

**What happened.** The owner asked twice to delete the market ticker, the
scrolling strip of statistics under the header. He also asked why the five tax
pages had "a dark black gradient border". Both were the same object. A CSS
cleanup at some earlier point had removed the ticker's base rules but left
`.c3-ticker::before` and `.c3-ticker::after`: two 100px overlays, `top:0`
`bottom:0`, filled `linear-gradient(90deg, var(--navy), transparent)`. With no
base rule the ticker no longer clipped to one line, so it grew to 82px and
wrapped across three lines, and its two edge fades painted as black gradient
bands down both sides of the hero. On the navy homepage they were invisible.
On the 108 ivory article pages they were the border he was looking at.

**Why it happened.** Nobody opened the top of an article page in a browser
after that CSS cleanup. The ticker was chrome, so it was never the subject of
a review, and every page-level check ran on the article body below it. The
markup carried `style="display:none"`, which reads as switched off in the
source; the bundle set `display:block` at run time. Reading the HTML said the
thing was off. The rendered page said otherwise. Rule 1.

**What stops it.** The ticker is gone: markup from all 108 pages, the six CSS
rules, the `@keyframes`, the print-hide selector, the bundle section, and the
inline copy of that section in six older pages. `build.js check` now carries a
DELETED list and errors if any of its tokens reappears in a page or an asset,
so a copy-paste from an old page cannot bring it back. Positive-controlled on
markup and on CSS, restored byte-identical both times.

**A scanner tried and withdrawn.** The general form of this defect is an
orphaned overlay: a `::before` or `::after` rule whose base class has no rule
left. Implemented and run against the stylesheet, it flagged five legitimate
modifier classes (`.chooser-seller`, `.chooser-investor`, `.chooser-buyer`,
`.invest-type-card-str`, `.invest-type-card-ltr`), all of which take their
base styling from a companion class. Not shipped. PLAYBOOK A21 and rule 4.

## 72. A browser test sent a real lead to the CRM (2026-09-05)

**What happened.** The form test for `/invest/run-the-numbers/` stubbed
`window.c3SendForm` in an init script, before the page loaded. The page then
defined its own `c3SendForm` and overwrote the stub, so the "consent checked"
step ran the real sender and posted to `app.chapter3realty.com/api/forms/lead`.
The captured payload was `null`, which is how it was noticed. One test lead
(name "Test Person", address "123 Ocean Blvd, Myrtle Beach", email
test@example.com, plan "Short-term rental", page run-the-numbers) may be in the
CRM from about 23:35 UTC. The owner was told to delete it.

**Why the existing rule did not stop it.** PLAYBOOK A33 says stub `c3SendForm`.
It did not say when. An init-script stub is overwritten by any page that
defines the function inline, which is every page with a form.

**What stops it recurring.** The harness (`verify-forms.js`) now does two
things, and both are required: it blocks the CRM route at the network layer
(`context.route('**/api/forms/**')` fulfilled locally) so nothing can leave the
browser whatever the page defines, and it installs the stub *after* `load`.
It also counts requests to `/api/forms/` and prints the count; a non-zero
count is a failed test. A33 now says so.

**Found on the way.** Seven existing lead forms let a visitor submit with an
email only and no consent box, showed "Thanks", and sent nothing, because the
shared sender refuses a lead without consent and the CRM refuses it too. Fixed
on all seven (the box is now required to send) and verified in the browser on
three of them with the route blocked.


## 73. Five new pages named the owner and said "sets" (2026-09-06)

**What happened.** The five batch-3 pages carried the Operations Officer's
name 24 times in their copy ("Devin Day, licensed MLO, NMLS 2721275, reviewed
this section", "in Devin Day's files", "Devin Day's example") and the verb
"sets" 24 times ("the calendar sets the lease", "the judgment sets the
compliance date", "state law sets no maximum deposit"). He read the combined
preview and asked for both to go, and for both to be hard-coded away.

**Why the existing rule did not stop it.** No rule existed for either. A17
says the NMLS number is shown on financing content, and it had been read as
"show the name with it". "Sets" is not a metaphor, an idiom or a
personification in the sense of REGISTER_REGEX, so A22 let it through.

**What stops it recurring.** `build.js` errors on the name in the main copy
of the five pages (`NO_OWNER_NAME_PAGES`) and of every page whose
`datePublished` is 2026-09-07 or later, and errors on "sets" and "set by"
(`SETS_REGEX`, "sets of" is a noun and passes) on the same pages; the older
pages get a warning for "sets" until they are swept, so the backlog does not
fail (MISTAKES 65). `tools/mkpage.js` throws on either before it writes a
file and accepts only `author: "tim"`. The three `llms.txt` entries that
named him were rewritten. PLAYBOOK A20a and A22a. The eight batch-1 and
batch-2 pages still name him and still say "sets"; that sweep waits for his
instruction, because the rule as given was "the pages we are making now".


## 74. The site called Chapter3's Operations Officer its licensed mortgage loan originator, with his NMLS number, on 117 pages (2026-09-07)

**What happened.** His NMLS number and the words "licensed MLO" or "licensed
mortgage loan originator" were on 117 of 118 pages: in the Person schema on
every page, in the byline of 87 pages, in the author box of 22 relocation
pages, on the About page and the homepage team card, and in eight body
sentences. The five batch-3 pages had just been changed to say "Reviewed by
Chapter3's licensed mortgage loan originator, NMLS 2721275", which tied the
licence to the brokerage and made it worse. He read it: "Dont mention my NMLS
or say im a licensed loan originator with Chapter3 ever that's illegal just
state the fact and if you need to get credibility say according to a loan
officer at our preferred lender."

**Why the existing rule did not stop it.** PLAYBOOK A17 required the opposite.
It said financing content "shows Devin Day, licensed MLO, NMLS 2721275 visibly",
and the gates enforced visibility. The rule was written from the licence fact
without asking whether a brokerage may display it. Chapter3 is not a lender.

**What stops it recurring.** Every instance is gone: the schema description on
117 pages, the bylines, the author boxes, the team cards, the eight sentences,
two llms.txt entries. `build.js` errors sitewide on the number anywhere in a
file, schema included, on the title-case schema phrase, and on any sentence
that puts him or Chapter3 next to "MLO", "loan originator", "loan officer" or
"NMLS". `tools/mkpage.js` refuses to generate a page that carries any of it.
A17 is rewritten. A loan fact stands on its own; when it needs a source it
says "according to a loan officer at our preferred lender".

## 75. A page said a law "does not do that for you" (2026-09-07)

**What happened.** The student-rentals page said "The state's landlord and
tenant law does not do that for you." He read it: "a law never does anything
for you why are we personifying a law? its against the rules."

**Why the existing rule did not stop it.** REGISTER_REGEX bans named
personifications ("catches") but had no shape for a law, a lease or a rule as
the subject of "does that for you", "cares", "wants" or "expects".

**What stops it recurring.** Two REGISTER_REGEX entries, sitewide errors,
sanity-checked first: they match the flagged sentence and nothing else on the
site, and they do not match "the law requires". PLAYBOOK A22b.


## 76. A deploy from a downloaded folder shipped nothing and looked like success (2026-09-07)

**What happened.** The owner ran the deploy from
`C:\Users\DevinDay\Downloads\chapter3site20260905`, a copy of the site
downloaded two days earlier, not from his clone. Wrangler reported "Uploaded 0
files (148 already uploaded)" and "Deployment complete", which reads like
success. Nothing shipped. Twelve investor pages were still 404 on the live
site, the sitemap still listed 105 URLs against 118 in the repo, and the NMLS
number and "licensed mortgage loan originator" were still on the About page
after the sitewide removal. Zero files uploaded because every file in that
folder was byte-identical to what Cloudflare already held.

**Why the existing rule did not stop it.** PLAYBOOK A27 says preflight must
exit 0, and it did: preflight ran inside the stale folder and checked the
stale pages against the stale git data. A39 says commit before deploying, and
the commits existed, on the branch, in a different folder. Nothing tied the
folder wrangler uploads to the branch the work is on. A40 says verify live
after a deploy, which would have caught it, but only after the fact.

**What stops it recurring.** `node build.js preflight` now ends with a deploy
source check, and `node build.js source` runs it alone. Outside a git clone it
fails: a downloaded copy has no `.git`, which is the exact shape of this
failure. Inside the clone it prints the page count, the commit and the branch,
so the deployer compares that commit with the branch before uploading.
Positive control: the clone prints its commit. Negative control: a folder with
build.js and two pages and no `.git` exits 1. PLAYBOOK A39a.

## 77. "The house needs to carry its payment", "a loan officer maps the loan" (2026-09-07)

**What happened.** The financing page said "The refinanced house needs to
carry its new payment from its own rent", "both houses must carry their own
payments", and, three times, "a loan officer at our preferred lender maps the
loan". Four other batch-4 pages had "carries a premium", "flood carries a
surcharge", "the analyzer carries both", "kill more deals", "a ceiling", "a
gap", "reach your rent". He read them: "All of this carry new loan and stuff is
bullshit metaphors replace all of that in all 5 pages with more literal talking
... if you say maps out anywhere in these 5 pages delete them."

**Why the existing rule did not stop it.** A22 bans phrase families by shape
(personification, idiom, aside, hedge) and A22a bans "sets". "Carry" and "map"
are ordinary verbs with a literal sense, so no regex had them, and the writer
did not read the page for figurative verbs before shipping it to the branch.

**What stops it recurring.** `MAPS_REGEX` and `CARRY_REGEX` in `build.js`,
sanity-checked both ways: they match "maps the loan", "Map the next loan",
"carry its new payment", "carrying costs" and "Carries a premium", and not "a
map of the county", "the STR map", "carry the boxes" or "carries out the sale".
"Maps" is an error everywhere; "carry" is an error on every page built from
2026-09-07 and a warning on the 13 older pages until they are swept. `mkpage`
refuses to generate either. PLAYBOOK A22c adds the reading pass for the verbs
no regex has.

## 78. A title that offered financing, and a loan-rule page nobody asked for (2026-09-07)

**What happened.** The financing page's title became "Finance Multiple Rental
Properties in Myrtle Beach | Chapter3" and its H1 "How do you finance more
than one rental property?", with a hero sub about the ten-financed-property
limit and reserves, and a section on growing with FHA loans. He read it: "FUCK
NO we are NOT a lending company we are a real estate brokerage NEVER talk in
away that makes it sound like we can finance a house ... thats all loan
company shit that we have NOTHING to do with." The same round: "All of our
headers need to be local specific."

**Why the existing rule did not stop it.** LEND_VOICE bans Chapter3 as the
actor ("we finance", "our loans") in copy. An imperative headline ("Finance
Multiple Rental Properties") names no actor, so it passed, and it reads as an
offer anyway. Nothing checked that a headline names the place.

**What stops it recurring.** `LEND_HEADLINE` (sitewide error on the title,
H1, hero sub and every CTA label) and `HEADLINE_PLACE` (error on pages built
from 2026-09-07, warning elsewhere) in `build.js`, both with positive and
negative controls; `mkpage` refuses both. PLAYBOOK A17b and A22d. The page
itself was rebuilt around what a brokerage knows: the mistakes on a second
rental, one client's story, and equity for the next one, with the loan rule
as one short section halfway down.

## 79. The deploy script asked for the clone, and there was no clone (2026-09-07)

**What happened.** `deploy.ps1` looked for the clone in six likely folders,
found none, and asked the owner to paste the path. He pasted a whole command,
`cd "$env:USERPROFILE\Chapter3-Website"`, which is not a path, so `Join-Path`
threw. The script then carried on with `$clone` empty: `Set-Location $null`
failed, the working directory stayed `C:\Users\DevinDay`, and `git remote
get-url origin` answered from there. **His home folder is itself a git repo,
for `chapter3realty/loanofficer.ai`**, so the script reported the wrong-project
error for a folder it had never chosen. He then typed the four commands by
hand in the same place: `git reset --hard FETCH_HEAD` failed, `node build.js`
failed, and wrangler failed with `ENOENT ... C:\Users\DevinDay\chapter3realty`.
Nothing shipped and nothing broke.

**The real finding underneath it.** There is no Chapter3-Website clone on that
computer. Every previous deploy ran from a downloaded copy of the site, which
is MISTAKES 76.

**Why the existing rule did not stop it.** A39a and the deploy-source gate
catch a downloaded folder once `build.js` runs in it. Nothing covered the case
where no clone exists at all, and nothing stopped the script continuing after
its own lookup failed.

**What stops it recurring.** `deploy.ps1` now: fails immediately when no clone
is chosen, instead of continuing with an empty path; accepts a pasted path even
when it arrives as a whole command with quotes or `$env:` in it; searches the
drive when the usual folders miss; and, when there really is no clone, offers
to `git clone` one to `C:\c3` and continues from there. Every git command runs
inside the verified clone, never in the folder PowerShell happened to open in.
That last point matters on this machine specifically, because the home folder
answers git commands for a different project.

## 80. The hand-computed case used the unrounded rent (2026-09-08)

**What happened.** The returns calculator's fourth verification case expected
$4,450 of rent left after costs to read "$4,451", because the figure was copied
from the research table, which was computed on the unrounded Zillow rent
($1,627.20). The page's input is the rounded $1,627. The tool was right; the
expected value was wrong. The browser harness caught it on the first run.

**What stops it recurring.** A29b now reads: hand-compute from the exact
inputs the tool receives, on paper, in the header comment of the verify script.
A research table is a source for the inputs, not for the expected output.

## 81. The hero sub carried none of the page's keywords (2026-09-08)

**What happened.** The hold page's sub said "a financed buyer" and "the price"
and never "hold" or "rental". The construction page's sub said "licensed" where
the H1 said "being built". The audit's keyword gate stopped both; each cost a
regeneration.

**What stops it recurring.** Write the sub last, after the H1, and put the
H1's topic word in it. `mkpage.js` checks length and the question mark; the
keyword check runs only in `build.js audit`, so run the audit before the
harness, not after.

## 82. `element.click()` on an SVG group (2026-09-08)

**What happened.** The returns map's keyboard handler called `g.click()` on an
SVG `<g>` so Enter would pin the tooltip. `SVGElement` has no `click()` in
Chromium; Enter threw a page error that `node --check` and the audit could not
see. `tools/verify-returns-calc.js` saw it in the console and in the failed
"Enter pins the tooltip" check.

**What stops it recurring.** Dispatch a `MouseEvent("click")` on SVG nodes.
The rule is A29b's: run the page in the browser and read the console before
believing any script.

## 83. Two hub grids scrolled sideways at 320px, on the live site (2026-09-08)

**What happened.** The harness reported `overflow: true` on `/invest/` at
320px after the tile edit. The committed page did the same, so it was live:
two card grids used `minmax(300px,1fr)` and `minmax(320px,1fr)`, wider than
the column at that width, so the cards ran 4 and 24 pixels off the right edge
and the whole page scrolled sideways on a phone.

**What stops it recurring.** `minmax(min(300px,100%),1fr)`, and the same on
every grid the harness flags. A32 already says check 320px; the hub had been
checked only through its own pages' previews. Run the harness on every page an
edit touches, including a hub, not only the new pages.

## 84. I divided the rent by the price of houses nobody rents (2026-09-09)

**What happened.** The returns page computed every cap rate against Zillow's
headline value for the ZIP, which is the middle third of *all* homes in it:
$401,110 in Murrells Inlet, $360,243 in Surfside. Those figures include
oceanfront houses and second homes that are not rentals. Divided into a
$1,823 county benchmark rent, they produced 2.3 to 3.6 percent and made the
Grand Strand look like one of the worst rental markets in the country against
a 7.3 percent national benchmark. The owner caught it in one line: "a $401,110
typical home I dont think this is the typical price for an investment property
here which may be lowering our Cap rate."

**The fix.** Zillow publishes a bottom-tier file for the same ZIPs
(`Zip_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv`). The cheaper third is
$263,914 in Murrells Inlet and $160,703 in the Myrtle Beach city core. With
the owner's 10 percent vacancy allowance the same rent returns 4.2 to 7.5
percent with a manager and 5.1 to 8.8 percent without one. Nothing about the
market changed; only the price the rent was divided by.

**The rule.** A ratio's top and bottom must describe the same population. The
rent was the rent of a modest three-bedroom rental. The price has to be the
price of a modest three-bedroom rental, not the price of every house on the
beach. Before publishing any yield, name the population on both sides of the
divide and check they match. The same test caught a second error the same day:
short-term revenue is the average of every *listing* in a market, mostly beach
properties, so that one divides by the typical home value and not by the
cheaper third. Two ratios on one page can need two different price bases, and
the page has to say which and why.

## 85. I "corrected" a true claim off the back of that error (2026-09-09)

**What happened.** On 2026-09-08 the long-term rental page said Grand Strand
rentals "commonly pencil out in the 5 to 7 percent cap range". I could not
reproduce it from my own numbers, wrote it up as unsourced, replaced it with
"1.1 to 2.3 percent with a manager", and logged it as a site defect fixed. The
claim was right. My arithmetic was wrong, for the reason in 84. I overwrote
correct brokerage knowledge with a flawed derivation and recorded the
brokerage as the one who had been careless.

**Why the existing rules did not stop it.** Non-negotiable 8 says re-open every
source before trusting a number. It says nothing about what to do when the
site's own claim and my computation disagree, and I defaulted to trusting the
computation because I could see its inputs.

**What stops it recurring.** When a figure the brokerage has published from
experience disagrees with a figure I derive, the derivation is the suspect
first, not the claim. Show the owner both, with the inputs, and ask, before
editing the page. A number that has survived on a live site written by people
who sell in that market every week is evidence. Mine is one spreadsheet.


## 86. The short answer answered a question nobody asked (2026-09-10)

**What happened.** The returns page opened with "Two numbers, and the price you
buy at decides both", then gave two ranges, then appreciation, then a sentence
saying "those are all-cash returns, before any loan. With a loan the rent has
to cover the payment too, and our line is a 1.25 coverage ratio." Five ideas in
five sentences, one of which was false: appreciation had just been named, and
appreciation is not a cash return. The owner read it and said so.

**Why the existing rules did not stop it.** The register gates measure sentence
length, banned phrases and heading shape. Every sentence here was short and
clean. Nothing measured whether the summary was a summary. The loan sentence
was there because the fact is true, not because a reader asking "what does a
rental return here" needed it in the first paragraph.

**What stops it recurring.** The short answer holds the answer and nothing
else. Name what the thing costs, what it returns, and what it appreciates.
Every qualifier that is not needed to keep those three numbers honest belongs
in a section below. If a sentence in the short answer would still be true on a
different page, it is not part of the answer. Test the block by reading only
it: a reader who stops there has to leave with the numbers, not with a caveat.
