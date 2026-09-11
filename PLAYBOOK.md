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

→ *Verify:* `audit` errors on a hero sub-header over 30 words or phrased as a question, and a sources
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

**A11e. Client stories: real, attributed, confidential.** A story goes on
the site only if it happened. Attribute it to the person and period it belongs
to: Tim&rsquo;s deals from before Chapter3 existed are *Tim* stories, never
"we" or "Chapter3" stories, because the firm cannot have experience predating
its formation and licensing rules treat implying otherwise as misleading
advertising. Anonymize every client. Never publish what a client asked to keep
quiet, even flatteringly: confidentiality survives the closing, and a story
about how discreet we are is not discreet. Every specific outcome carries the
standard line ("his numbers, not a promise"). An invented illustration is
allowed only when labeled as an example ("a typical deal looks like this"),
never dressed as a specific client. And no blanket "stories may be
illustrative" disclaimer anywhere on the site: it taxes every true story and
reads as a confession. Google does not penalize honest attribution; it
penalizes fake specificity.

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

**A14. The hero sub-header is the second headline. Every page has one, and
the gate measures it.** (Owner, 2026-09-01: "all of our subheaders need to be
keyword and attention grabbing... hard code the solution so we always do it.")
What the subheadline guidance agrees on, stripped of the fluff, is what the
`SUBHEAD` block in `build.js` enforces on the rendered text of the sub,
whichever markup the hero uses:

1. **8 to 30 words.** Two lines at most. A 45-word sub is a paragraph nobody
   reads (the old cap was 45; 51 pages sat between 31 and 67 words).
2. **The topic word is in it.** One significant token from the page's Article
   `keywords` (first phrase), or the title, or the H1. "Cost", "closing",
   "hurricanes", "1031": the word a searcher typed. Generic tokens (Myrtle,
   Beach, Grand Strand, home, guide, real estate) do not count.
3. **A concrete anchor.** A number, a dollar figure, a percentage, or a place
   name. Specific beats clever; "$6,573 to $1,337" is the hook.
4. **Written to the reader.** No "we", "our", "us". The sub says what the reader
   gets, with "you" where it is natural. The brand name is allowed.
5. **Not a question, no exclamation mark.** The fact is the hook.
6. **No ", not X" contrast** ("minutes, not weeks"). Say the specific thing.
7. **No repeated three-word phrase.** The 22 relocation subs all ran on one
   "what to expect... what to expect" template; a template is not a sentence.
8. **Does not restate the H1.** It adds the benefit or the proof.

H2s get light rules in the same block: 2 to 16 words, no generic label
("Overview", "Details", "Summary"), and at least one H2 outside the FAQ carries a
page keyword or a place name.

Sources read for this rule set: Nielsen Norman Group on scanning behavior and
front-loading; Copyblogger and CXL on subheadline structure (one specific
benefit or proof, a number, reader-facing, at most two lines); Google's
heading guidance (the topic in the heading text). And the owner's own review
notes, which is where every rule here came from first.

**A15. Punchy sentences, measured.** (Owner, 2026-09-01: "hard code sentences
being punchy and snappy and valuable... research what people are saying you
are doing wrong when it comes to writing and hard code the solution.") The
complaints about this model's register, taken from PCWorld's ranked list of AI
writing habits, Wikipedia's "Signs of AI writing" project page, Reddit threads
on r/writing and r/ClaudeAI, and the owner's reviews, agree on a short list.
The `PUNCH` block in `build.js` errors on each of them in every `<p>` and
`<li>` inside `<main>` (the TCPA consent, the AfBA disclosure, the calculator
disclaimer and the sources lists are exempt):

1. **No sentence over 40 words**, and a page mean under 20. Split at the clause.
   Keep every fact. (186 sentences were over 40 when the gate landed.)
2. **No parenthetical aside of five or more words.** An aside is its own
   sentence or a comma clause. "(HOA)" and "(2016)" stay legal. This was the
   single most-named tell.
3. **No sentence opening with "And" or "So".** Join it to the sentence before,
   or start with the subject.
4. **No hedging or intensifying adverb**: actually, very, really, truly,
   genuinely, quite, somewhat, fairly, a bit, basically, essentially, clearly,
   obviously. "actually" appeared 106 times on 66 pages and deleted cleanly
   every time. "rather than" and "would rather" stay legal.
5. **No commentary adverb or summarizer**: importantly, notably, interestingly,
   in other words, put simply, in short, in practice, ultimately, at the end of
   the day, the bottom line, the lesson, the takeaway, in conclusion, that said,
   it is important to, keep in mind, "in plain English" (never describe the
   writing).
6. **No teaser frame**: "here is how/what/the", "which is why" (split it), "the
   whole story/deal/picture", "real money/story/question", "one thing", "worth
   knowing", "the good news", "the catch is", "think of it as", "imagine".
7. **No time contrast** ("months, not years"): give the actual time.
8. **Wordiness and buzzwords**: when it comes to, in terms of, in order to, the
   reality of, a wide range of, plays a role, in today's, landscape, robust,
   seamless, journey, unpack, nuance, deep dive, sweet spot.
9. **may/might more than four times on a page** is a warning: say what the
   rule requires or what happens.

The fix is almost always deletion. "How you actually live" is "how you live".
A 50-word sentence is two sentences. An aside is the next sentence. When a
hedge carried a real quantity ("very high", "somewhat higher"), give the number
that is already on the page or state the plain comparison.

**A16. Investor strategy pages say why Chapter3, here, casually and often.**
(Owner, 2026-09-02: "all of the investor strategy pages should be focused on
why we are the best brokerage to help them in Myrtle Beach and the Grand
Strand, otherwise we just compete with national brands. Not too salesy and
desperate; informational, and frequently drop casually why we are the
greatest.") The `LOCAL EDGE` block in `build.js` counts sentences under
`/invest/strategies/` that pair a Chapter3 token (Chapter3, our agents, our
lending partner, Tim, Devin, we) with a local token (Myrtle Beach, Grand
Strand, Horry, here, local, Coastal Carolinas) and errors under four. The
reasons are specific and true, never adjectives: three generations selling in
this market, agents who own rentals here, the relationships that surface
properties before they list, the lending partner that has priced Grand Strand
rehabs, our own sales tracking with the numbers, the team that has run 1031
deadlines before, the three-properties test. Woven into the sections where
they belong, never a sales block. `SALESY` errors sitewide on the desperate
forms: call today, act now, don't wait, trust us, world-class, unmatched,
award-winning, the only brokerage, number one brokerage, industry-leading.

**A17. Down-payment percentages: where they are legal, and where they are not.**
(Owner, 2026-09-02: "can we mention down payments, if we do what does Reg Z
require, because I would like to use exact down payment percentages and then
say that info is from BrickWood Mortgage.") Regulation Z governs *consumer*
credit. 12 CFR 1026.3(a)(1) exempts credit extended primarily for a business
purpose, and official commentary 3(a)-4.i deems credit to acquire, improve or
maintain rental property that is **not owner-occupied** to be business purpose,
whatever the unit count. The trigger-term rule in 1026.24(d)(1), the one that
pulls in APR and repayment disclosures, therefore does not reach an investor
loan on a house the buyer will not live in.

The same commentary draws the line this market crosses constantly: if the owner
expects to occupy the property **more than 14 days** in the coming year it is
not non-owner-occupied, and the exemption is gone. A beach condo the buyer uses
for a month each summer is consumer credit. So:

- **Allowed**, gated to exactly these pages in `build.js`
  (`DOWN_PAYMENT_OK_PAGES`): `/invest/strategies/dscr-loans/`,
  `/invest/strategies/brrrr/`, `/invest/strategies/fix-and-flip/`,
  `/invest/non-warrantable-condos/`. The page must also name the lender the
  figure came from, which the gate checks. The RESPA AfBA disclosure already
  ships in the footer partial on every page.
- **Banned everywhere else**, unchanged: every `/buyers/` page, second homes,
  the condotel page where personal use is normal, and house hacking on
  `/invest/strategies/small-multifamily/`, which is owner-occupied by
  definition and therefore consumer credit.
- **Still banned everywhere with no exception: interest rates and payment
  amounts.** Those go stale, and a stale number in an advertisement is a
  different problem from a trigger term.

State it as a range, attribute it ("Figures from BrickWood Mortgage"), and keep
the wording qualitative anywhere the buyer might live in the property.

**A18. No aphorisms.** (Owner, 2026-09-02, on "Cash wins the houses that speed
decides": "there is too much of this... we speak plain and concise and literal,
no other way of speaking at all.") The shape is a short epigram with an
abstract subject and no actor: *X wins the Y that Z decides*, *the sale is
where the profit is made or lost*, *discipline decides the outcome*. It sounds
like insight and tells the reader nothing they can act on. Six patterns in
`AI_TELL_REGEX` error on it. The replacement always names the actor and the
consequence: not "speed decides who gets the house" but "the buyer who can
close soonest usually gets the house".

**A19. Every article page cites at least two primary sources, in the body.**
Measured 2026-09-03: 19 article pages carried no external source link at all,
including `/invest/strategies/brrrr/` and `/invest/strategies/dscr-loans/`, two
of the most commercially important pages here. The rule is at least two links
to external primary sources inside `<main>`, plus a sources line. Hubs are
exempt, defined as under 900 words of body text, because a hub is nav furniture
pointing away. The Princeton GEO study (Aggarwal et al., KDD 2024, arXiv
2311.09735) measured citation lift from inline source attribution, with the
largest gains going to pages that rank lower, which describes most of this
site. `build.js` warns as A19. **A link is not a source:** it must support a
specific claim on the page. A decorative link to a homepage supports nothing
and is worse than none, because it teaches the reader the page cites things
when it does not. Re-open every source before linking it (non-negotiable 8).

**A20. Every article page carries one attributed sentence from a named person.**
Measured 2026-09-03: 98 of 100 pages had none. The rule is at least one
sentence where Tim Nash or Devin Day does or says something specific. A byline
does not count. A schema block does not count. "Tim Nash says he walks the
crawlspace before he lets a client bid" counts. This is the one tactic a
national brand structurally cannot copy, because they do not have a broker with
30 years on this beach. `build.js` warns as A20. **Never write a quote for a
named person and ship it.** Owner instruction, 2026-09-03: draft it, send it to
him, wait. A fabricated quote attributed to a licensed broker is a compliance
problem, not a style problem.

**A21. Two rules proposed on 2026-09-03 and withdrawn, with the evidence.**
Recorded so nobody proposes them again off the same bad measurement. *A
statistics-density floor* of ten figures per 1,000 words was withdrawn: the
scanner counted only dollar amounts, percentages and comma-grouped numbers, so
it read `/invest/strategies/dscr-loans/` at 5.5 per 1,000 when counting any
number gives 38.7, and it could not tell a thin page from one whose figures
live in a calculator. A sourced figure is what matters and A19 already requires
it. *A zero-tolerance hedge ban* was withdrawn: the scanner reported 152
hedges, but 115 were the word "rather" inside "X rather than Y", which is
precise contrastive prose, and 24 more were "it depends", which is the honest
and legally correct answer to questions like what HOA fees cover. Thirteen were
real. Banning the list would have pushed the site toward false certainty on
exactly the pages where certainty is a compliance risk. One genuine defect was
fixed: "can often times benefit" on `/invest/strategies/dst/`. The lesson is
MISTAKES 4 and 65 again: sanity-check a proposed rule against the copy it would
fire on **before** writing the gate.

**A22. The literal register (owner, 2026-09-05).** He read
`/invest/accommodations-tax/` for over an hour, understood none of it, and said
so at length. The page had passed every gate. Three things were wrong at once,
and each now has a rule.

*Phrases.* Even after A18, the copy carried spatial metaphors ("which line of
the map your property sits on", "the gap opens on the local lines"),
personification ("one exemption catches almost nobody"), idioms ("on paper",
"the trap on that table") and editorial asides ("the operative word", "worth
stating"). `REGISTER_REGEX` errors on every one and names the type, so the
writer learns the class. "Catch" is banned outright. New families go in the
same list with a type label.

*Length.* The sitewide caps (40 max, 20 mean) let a page pass that a smart
reader could not follow. Pages in `STRICT_REGISTER_PAGES`, and every page whose
`datePublished` is 2026-09-05 or later, get 28 max, 16 mean, warning at 22.
The sitewide caps did not move, so the backlog does not fail (MISTAKES 65).

*Context.* The page elaborated on a tax before saying what it was a tax on,
which rentals owed it, or what triggered it. "The page is assuming I know."
On a strict page the first section heading must be a question that defines
the subject, and at least 60 percent of section headings must be questions.
Elsewhere the build warns below 50 percent. FAQ, sources and CTA headings
(which end in a period) are not counted.

*His own wording, which is the target register:* "If Airbnb or VRBO take the
payment, they are responsible for the taxes. If you take the payment, you are
responsible for the taxes." Thirteen words, then eleven. Write like that.

**A11e, amended 2026-09-01.** Attribution wording: a story is told about "an
agent at Chapter3" or "one of our agents", or the named person when the page
already names them, never "Chapter3 did" or "we did" as if the company were the
actor. Owner decision, same day: the quiet-sale condo story is published on the
strategies hub in anonymized, deliberately vague form (no state, no business,
no building type, no unit count) at the owner's instruction, which overrides the
confidentiality hold recorded in owner-answers. The rule above still applies to
the next story.

**A20a. His name is in the byline and nowhere else in page copy (owner,
2026-09-06 and 2026-09-07).** On 2026-09-06 he asked for his name to come off
the five batch-3 pages; the sentences that named him also carried his NMLS
number, which is the part that was illegal (A17). On 2026-09-07 he asked for
the byline back: "change the Author to by Devin Day and reviewed by Tim Nash
like all the other pages we have". So the byline names him, as author or as
reviewer, with the title Operations Officer and nothing after it. Body copy
does not name him; a story from his files is "in Chapter3's files" or "in
Chapter3's experience". `build.js` errors on the name in the main copy of the
five batch-3 pages and of every page published from 2026-09-07, byline
excluded; `tools/mkpage.js` does the same before it writes a file. The A20
attributed sentence on those pages comes from Tim Nash or does not exist;
never invent one.

**A22a. Nothing "sets" anything (owner, 2026-09-06).** "the lease never sets
anything condition doesnt set anything nothing sets anything hard code it
away." Write what depends on what: "depending on the lease", "the rent depends
on this number", "the judgment states the compliance date", "state law has no
maximum deposit". `SETS_REGEX` matches "sets" and "set by"; "sets of" is a
noun and passes. It errors on the same pages as A20a and warns on the older
pages, about 45 of which match today and fail nothing until they are swept
(MISTAKES 65: a new rule does not fail the backlog).

**A22b. A law does nothing for anyone (owner, 2026-09-07).** "a law never does
anything for you why are we personifying a law? its against the rules." A law,
a statute, an ordinance, a lease, a contract, a judgment or a deed does not do
things for people, and it does not care, want, expect, think or watch. Write
what it requires, allows or says. Two REGISTER_REGEX entries error on those
shapes sitewide; "the law requires" and "the lease allows" pass. Sanity-checked
against the site before it went in: one hit, the sentence he flagged.

**A22c. Nothing "carries" a loan, a payment or a cost, and nothing "maps" a
loan or a plan (owner, 2026-09-07: "all of this carry new loan and stuff is
bullshit metaphors").** Say who pays what: "the rent on the new house must pay
its payment", not "the house needs to carry its payment". "Carrying costs" is
the same metaphor. `build.js` errors on both families on every page built from
2026-09-07 and warns on the 13 older pages that still use them; `mkpage`
refuses to generate either. The same instruction covers every figurative verb:
before a page ships, read it once for a house that "sits", a standard that is a
"ceiling", a rule that "covers", a gap, a line, a door. Replace each with the
literal action.

**A22d. Every headline names the place (owner, 2026-09-07: "All of our
headers need to be local specific we cant compete nationally with these
national sounding headlines").** The H1 of every page names Myrtle Beach,
Horry County, the Grand Strand or a town on it. `build.js` errors on a page
built from 2026-09-07 whose H1 names no place and warns on older pages;
`mkpage` refuses to generate one.

**A22e. One number, one source, and every page that repeats it points at it
(owner, batch 5 answer 10, 2026-09-08: "10.5 may have been older numbers ...
10.5 is some areas not every one of them now").** When two pages need the same
figure, one page owns it and computes it from the data file at build time; the
other links. The returns page owns the yields (built from
`research/invest-next/data/submarkets.json`); the hold page owns the price
history (`data/hold-*.csv`) and takes the yields it needs from that same JSON.
The hub's "+10.5% year-over-year" tile was a number with no source that no area
matched; it is now four dated tiles, each linking to the page that owns its
figure. Never carry a yield, a rent or a growth rate into copy by hand from
another page or a research table: require the file.

**A17b. No headline offers financing (owner, 2026-09-07: "we are NOT a lending
company we are a real estate brokerage NEVER talk in away that makes it sound
like we can finance a house").** A title, H1, hero sub or CTA label never
starts with "Finance", "Financing", "Refinance" or "Get a loan", and never
says "finance your", "finance the next" or "we finance". The page can be about
loans; the headline cannot read as an offer of one. `build.js` errors sitewide
(`LEND_HEADLINE`); `mkpage` refuses.

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

**A17. NMLS: never (owner, 2026-09-07).** The Operations Officer's NMLS number
is never written anywhere on the site, visible or in schema, and neither he nor
Chapter3 is ever called a licensed mortgage loan originator, MLO or loan
officer. Chapter3 is a brokerage, not a lender, and the claim is illegal. His
words: "Dont mention my NMLS or say im a licensed loan originator with Chapter3
ever that's illegal just state the fact and if you need to get credibility say
according to a loan officer at our preferred lender." So a loan fact stands on
its own, and when it needs a source it says "according to a loan officer at our
preferred lender"; the AfBA disclosure in the footer covers that reference on
every page. `build.js` errors sitewide on the number and on the claim, schema
included; `tools/mkpage.js` refuses to generate a page carrying either. Until
2026-09-07 this rule said the opposite and 117 pages carried the claim
(MISTAKES 74).

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

**A29a. Measured after the scripts run, not at load (2026-09-05).** A
scroll-triggered count-up rewrote the badge "Instant" to "8"; the page had
been measured at load, for colour, and passed (MISTAKES 69). For any page
that loads `s.940d034594.js` or carries its own effects script: scroll the
whole page in the browser, wait, then re-read every text node and compare it
to the source. That bundle also adds `.sr` (opacity 0 until scrolled into
view) to `.section-h2`, `.chooser-card`, `.why-stat` and `.accordion-item`,
so a capture taken at the top of the page shows those elements missing. No
script may write visible text by element position; `build.js audit` errors
when a count-up target's text differs from the animation's final value. The
homepage carries no decorative script at all.

**A29b. A calculator is verified against hand-computed cases, in the browser
(2026-09-07).** Work three cases by hand before writing the tool, then drive
the page's inputs with Playwright and compare every output to the hand
figures (`tools/verify-s8calc.js` is the pattern; run it after any change to
that spec). Every inline `oninput`/`onchange` handler must call a top-level
`function NAME(){}` declared on the page or in a loaded bundle; a function
assigned inside an IIFE fails `build.js audit`, and would fail in the browser
too. Then look at every chart once, clipped to the tool's box: a label that
overlaps a bar is invisible to every DOM check.

**A22f. Name the population on both sides of a ratio (2026-09-09).** Before
publishing a yield, a rate or a share, say in one sentence what the top
describes and what the bottom describes, and check they are the same set of
things. A rent for a modest rental over the price of every home in the ZIP is
not a cap rate for anything (MISTAKES 84). Where two ratios on the same page
need different bases, use different bases and tell the reader which and why:
the returns page divides long-term rent by the cheaper third of homes and
short-term revenue by the typical home, because the average short-term listing
is a beach property, not the cheapest house in the area.

**A22g. The brokerage's own number outranks my derivation (2026-09-09).** When
a figure already published from the owner's or an agent's experience disagrees
with one I compute, assume my computation is wrong until proven otherwise. Put
both in front of him with the inputs; never quietly replace the published one
and never log it as a defect fixed (MISTAKES 85).

**A22h. A threshold is a target, never "our line" (owner, 2026-09-10).** He
struck "our line" from the returns page. Say "our target is 1.25", or name the
number and say what happens above it and below it. `build.js` REGISTER_REGEX
errors on `\bour lines?\b` over every page. The word boundary is the whole
design: "the sponsor's 24-hour line" is a phone line and stays legal, and the
scanner was tested on that case and on "Our line is 1.25" before it shipped
(rule 4).

**A22i. The short answer carries the answer and nothing else (owner, 2026-09-10,
widened 2026-09-11).** Three facts at most: what the thing costs, what it
returns, what it appreciates. No opener, no framing sentence, no caveat that
belongs in a section. A qualifier earns its place there only if the numbers are
wrong without it. "After costs" stays; "before any loan" moves down
(MISTAKES 86).

On 2026-09-11 he applied the same test to every page, not just the returns
page: "take this lesson when it comes to making a simple short answer in the
other pages too." So the short answer is short paragraphs, not one block. It
answers the question a reader came with, including the one behind it. On the
hold page that question was not "how long", it was "should I sell at all", and
the answer is no unless you need the money or it does better elsewhere, because
an owner can borrow against a house without selling it. The last paragraph
gives the reader a reason to read on. `shortAnswer` in a spec takes an array of
strings and each becomes its own paragraph.

**A22j. Appreciation is the only word for it (owner, 2026-09-11).** Never "price
rise", "price change", "price growth", "rise in value" or "value growth". A
property gaining value is appreciation, in body copy, in a chart label, in a
table header and in the meta description. `build.js` REGISTER_REGEX errors on
the noun phrases; the verb stays legal, so "the builder raises prices near the
end of a build-out" still passes. The scanner was run against a planted
"price growth" on a live page and against that build-out sentence before it
shipped (rule 4).

**A29c. A chart is built from the data file, then looked at (2026-09-08).** A
chart on a spec page is an SVG string built at generation time from the same
JSON or CSV the prose uses, never from typed values. After generating, clip
every `main svg[role="img"]` to a PNG (`scratchpad/shots.js` pattern:
document coordinates, `fullPage: true`) and look at each once. The first
render of the returns page had two label collisions the DOM checks could not
see: the "2 percent screen" label over the last row, and a negative bar's label
running into its row label. Every chart in batch 5 was looked at before
publishing.

**A29d. Measure the control, not the box around it (2026-09-11).** A field
check compares `scrollWidth` with `clientWidth` on the `input` or `select`
itself. A wrapper that fits can hold an input crushed to zero width, and that
shipped: two boxes on the returns calculator measured 0px at 320px and the
wrapper check passed (MISTAKES 88). Sweep every width from 320 to 1440 with
values longer than the defaults, because a box sized for a four-digit default
clips a five-digit entry. Media queries go last in a page-local style block:
same specificity as the base rules, so source order decides.

**A29e. A placeholder is a hint, never a label (2026-09-11).** A name that has
to stay on screen is an element inside the field, not the `placeholder`
attribute, which disappears on the first keystroke. A DOM check reads the
attribute in both states and cannot tell the difference, so look at the
screenshot with the fields filled in (MISTAKES 87).

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

**A33. Forms.** Exercise every validation path with the CRM route blocked at
the network layer (`context.route('**/api/forms/**')`) AND `c3SendForm` stubbed
*after* the page loads, never in an init script: every form page defines its
own `c3SendForm` inline and overwrites an early stub (MISTAKES 72, a real test
lead reached the CRM). Count requests to `/api/forms/`; any is a failed test.
Confirm the error text, the success state, and that nothing submits when
validation fails.

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

**A39a. Deploy from the clone, and check the commit (owner, 2026-09-07).** A
deploy sends whatever folder wrangler is pointed at. A downloaded copy of the
site passes every gate in `build.js`, because the gates read that folder's own
pages and its own git data, and then uploads nothing: "Uploaded 0 files"
with a deployment URL, which reads like success. `preflight` now ends with
`deploySource()` and fails outside a clone; `node build.js source` runs it
alone. Read the commit it prints and compare it with the branch before
uploading. Zero files uploaded is not success, it means the folder is already
live, byte for byte. MISTAKES 76.

**A40. After deploy, verify live:** the URL returns 200, the canonical is right,
and the rendered page matches what you built.

**A41. A monthly data page (2026-09-08).** `/invest/what-is-being-built/` is
generated from `research/invest-next/data/pipeline-latest.json`. Each month:
`node tools/permits.js` (refreshes the county development layer, the county
permit map and FRED; a feed that fails keeps its old values and its old read
date), `node tools/mkpage.js specs/what-is-being-built.js`, `node build.js
dates`, `node build.js preflight`, commit. The page prints each feed's read
date. The county permit map stopped updating on 2025-09-22, so the page says
the map is stale rather than reading zero permits as no building. The airport
block is updated by hand from the airport's own tables. The fixed facts
(hospitals, I-73, roads) come from `research/invest-next/construction-pipeline-facts.md`;
re-open a source before changing a date or a budget, and never write "under
construction" for the interstate (it has no contract).

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
Devin Day NMLS 2721275 · Timothy Nash, BIC, SC licence 43182,
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
