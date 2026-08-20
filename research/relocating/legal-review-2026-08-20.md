# Legal and compliance review: five relocating pages

Reviewed 2026-08-20. Review only, no files changed.

Scope: visible body text inside `<main>` on each page, scripts and styles
stripped. Shared header and footer chrome excluded, except where a footer
disclosure resolves a question raised by the body copy.

Pages:

- `chapter3realty/buyers/relocating/cost-of-living/index.html`
- `chapter3realty/buyers/relocating/pros-and-cons/index.html`
- `chapter3realty/buyers/relocating/moving-checklist/index.html`
- `chapter3realty/buyers/relocating/schools/index.html`
- `chapter3realty/buyers/relocating/from-new-york/index.html`

## Read this first: the files were being edited during the review

`cost-of-living` and `pros-and-cons` were both modified while this review was
in progress. `cost-of-living` changed 41 seconds before I re-checked it.
`pros-and-cons` was substantially rewritten: roughly half the page is new copy.

I therefore froze a snapshot at **2026-08-20 17:43:01 -0400** and every finding
below is against that snapshot. MD5 of each reviewed file:

| Page | MD5 at snapshot |
|---|---|
| cost-of-living | `b8aeb9ed74c9ac1647d6721f7167b73a` |
| from-new-york | `19bf7ba74206b465ab3d56b4f8dd7f27` |
| moving-checklist | `cc650964f812e77a7a7d293322df887f` |
| pros-and-cons | `d9b7d9ced7e19912f8ce871f980c5b7f` |
| schools | `616aa1d97f01f95a8a1bcf023988dd11` |

If any of those hashes no longer match, that page has moved on from what I
read. Re-check the findings for that page before acting on them.

**The pages kept moving after the snapshot, and most findings have already been
acted on. See CHECKPOINT 2 at the end of this report for what is actually still
open.** All four blockers below are resolved or substantially resolved as of
17:53:04. Sections 4 and 5 (`schools`, `from-new-york`) were never touched and
stand exactly as written.

Two things follow from the concurrent edit, and both matter:

1. **Today's rewrite of `pros-and-cons` removed four real fair housing
   problems.** The version I first read described the people who live near the
   beach ("Many people near the beach are seasonal", "It reads as a place where
   people are unfriendly", "a large share of the people you meet are here for a
   season, working a summer job"), and told buyers to "live outside the city of
   Myrtle Beach proper, where a higher share of your neighbors are year-round."
   That last sentence was explicit geographic steering justified by population
   composition. All of it is gone. That was the right call.

2. **The rewrite introduced two new problems that are as serious as the ones it
   removed**, and dropped two protective lines that were doing real work. See
   findings 2.1, 2.2 and 2.4. The page also currently ships duplicate Healthcare
   and Bugs sections (finding 2.7), so it appears the edit is unfinished.

## Verdicts at a glance

| Page | Verdict | Blockers | Fixes | Considers |
|---|---|---|---|---|
| cost-of-living | CONCERNS | 1 | 5 | 2 |
| pros-and-cons | CONCERNS | 2 | 5 | 4 |
| moving-checklist | CONCERNS | 1 | 4 | 3 |
| schools | CONCERNS (minor) | 0 | 4 | 3 |
| from-new-york | CONCERNS (minor) | 0 | 4 | 3 |

## Three findings that apply to all five pages

**Regulation Z: clean.** I scanned the raw HTML of all five pages, including
inline and bundled script, for a stated down payment amount or percentage, a
number of payments, a period of repayment, a payment amount, or a finance
charge amount. There are none in any body copy. Every `Apr` match in the
source is the month April. The two `down payment` matches per page are a link
label in the shared nav mega-menu and a string in the JSON-LD block, both
outside `<main>`. The only financing sentence anywhere in the five pages is
qualitative and compliant: "an offer backed by a strong pre-approval matters
if you are financing" (`from-new-york`). Nothing on these pages triggers the
APR and repayment-terms disclosure under 12 C.F.R. 1026.24(c)-(d).

Note that dollar figures on these pages are government taxes and fees, utility
deposits, rents and cash sale prices. None of those are credit terms and none
of them pull in Reg Z.

**TCPA consent string: byte-identical on all five.** MD5 of the consent
sentence is `824ec440b98f44064f102c12c6ef63cd` on every page. The locked string
is intact.

**RESPA affiliated-business disclosure: satisfied.** No page references
BrickWood Mortgage in body copy, and the footer carries the AfBA disclosure
site-wide. See the note under cost-of-living finding 7 for the one place the
body copy edges toward a lender service.

---

## 1. cost-of-living/index.html

**Verdict: CONCERNS.** One blocker, five fixes, two considers. No fair housing
problem. The whole risk on this page is tax content: it is the most
prescriptive tax page of the five and the only tax-heavy page with no
"check with a professional" pointer anywhere in it.

### 1.1 BLOCKER - Detailed tax guidance with no professional-referral framing, ending in an offer to compute a specific consumer's tax bill

Rule 5 (unlicensed practice).

The page states income tax brackets, retirement deduction amounts and age
thresholds, works a property tax example, and computes vehicle tax:

> "South Carolina charges 1.99 percent on your first $30,000 of taxable income and 5.21 percent above that."

> "Other retirement income gets a deduction of up to $3,000 before you turn 65 and up to $10,000 after. At 65 there is also a deduction of up to $15,000 against any income, but it is reduced by whatever retirement deduction you already took, so the two do not stack. A couple where both are 65 can claim up to $30,000."

> "On a $350,000 house in the unincorporated county that is roughly $1,300 a year as a main home against roughly $4,200 as a second home."

Note that today's edit made this worse rather than better. The retirement
deduction passage was expanded a few minutes before the snapshot, and the added
sentences ("so the two do not stack", "A couple where both are 65 can claim up
to $30,000") are the most advice-like on the page: that is a filing position
applied to a household's facts. The addition is accurate, and accuracy is not
the issue. The issue is that the page now teaches a taxpayer how to compute a
deduction and never tells them to have it checked.

Then it converts that into an individualised offer:

> "Want the tax bill on a real address, at your ownership status?"

Individually each sentence is descriptive general information and defensible.
The combination is not. The page reads as a tax service: it teaches the rules,
applies them to a worked example, then offers to apply them to the reader's own
facts, and at no point tells the reader to confirm any of it with a tax
professional or the county. `from-new-york` handles the same material correctly
and repeatedly ("We are not tax advisers and this is the point to bring in
one"). This page has no equivalent.

The sources line does say "Prices and rates change," which is not the same
thing and does not cure it.

Suggested fix: add the same disclaimer `from-new-york` uses, placed at the top
of the Taxes section rather than the bottom of the page, and reframe the CTA to
an estimate rather than a bill:

> "The figures below are general information, not tax advice. Rates and deductions change and your own situation decides the answer, so confirm anything you plan around with a tax professional or the Horry County Auditor."

> CTA: "Want an estimate of the property tax on a real address, at your ownership status?"

### 1.2 FIX - Tax rates stated with no tax year

Rule 8 (accuracy-shaped risk).

> "South Carolina charges 1.99 percent on your first $30,000 of taxable income and 5.21 percent above that."

South Carolina's top marginal rate has stepped down annually for several years.
Writing the rate as a timeless present-tense fact means the sentence becomes
false without anyone touching the page. `from-new-york` gets this right and
says "Rates are the 2026 tax year."

Rewrite: "For the 2026 tax year South Carolina charges 1.99 percent on your
first $30,000 of taxable income and 5.21 percent above that."

Same treatment needed for "Sales tax is 8 percent in the county and 9 percent
inside Myrtle Beach" and for the vehicle tax and registration figures.

### 1.3 FIX - "In the middle of this year" and "today's prices"

Rule 8.

> "In the middle of this year South Carolina ran about 45 cents a gallon below the national average, about 60 cents below Ohio and about 50 cents below New York."

"this year" is unanchored the moment the calendar turns. AAA is credited in the
sources line, which is good, but the comparison needs a date on it.

Rewrite: "In mid-2026 South Carolina ran about 45 cents a gallon below the
national average..."

### 1.4 FIX - Utility demand charge stated as universal, unattributed, undated

Rules 6 and 8.

> "Your power company charges you two ways."

> "The company calls that window Peak Hours. It runs 3pm to 6pm from April to October, and 6am to 9am from November to March."

> "That second charge is $8 to $12 for each kilowatt in that one hour."

This is a specific tariff claim presented as universal to every reader. It is
not attributed to a published rate schedule and carries no date. The
`moving-checklist` page attributes the same claim to two named utilities
(Santee Cooper and Horry Electric Cooperative), so the two pages are
inconsistent about who this applies to, and this page's version implies it
applies to everyone.

Rewrite: name the two utilities as `moving-checklist` does, link each one's
published residential rate schedule, and date the figures. See also
moving-checklist finding 3.4, which flags whether "both utilities" is accurate
at all.

### 1.5 FIX - Customer's real utility bills quoted to the cent with no date

Rule 8.

> "These are real bills from a customer in a 1,400 square foot two-story house, not an area average. Power runs about $119.89 and water about $51.42."

The labelling is honest and the "not an area average" caveat is exactly right.
The problem is the tense. Two figures given to the cent, in the present tense,
with no month, will be read as current indefinitely.

Rewrite: "These are real bills from a customer in a 1,400 square foot two-story
house, not an area average. In [month, year] power was $119.89 and water
$51.42."

### 1.6 FIX - "Zillow, latest month" hides a vintage the code already knows

Rule 7 (third-party data and attribution).

The visible attribution is:

> "Home values and rents: Zillow, latest month. Other prices: US Bureau of Economic Analysis."

The calculator bundle at `chapter3realty/assets/col.4533523687.js` carries a
meta block that is never rendered to the page:

```
"meta":{"rppVintage":"2024","zillowLatestMonth":"2026-07-31","generated":"2026-08-20", ...}
```

Two problems. "latest month" is meaningless to a reader and the bundle knows
the answer is July 2026. More significantly, **the BEA regional price parity
data is the 2024 vintage** and the page never says so. A reader seeing
"US Bureau of Economic Analysis" next to prose written in the present tense
will assume current-year figures. The full source string exists in the file,
but only as a source-code comment:

```
Sources: U.S. Bureau of Economic Analysis, Regional Price Parities (MARPP, SARPP), released February 2026; Zillow Research, ZHVI (all homes, smoothed, seasonally adjusted) and ZORI, metro level.
```

That comment is the attribution the page should be showing. Render it, or a
short version of it, from the meta block so it updates itself on rebuild:

> "Home values and rents: Zillow Research (ZHVI and ZORI), July 2026. Other prices: US Bureau of Economic Analysis regional price parities, 2024 vintage, released February 2026. Averages for a whole metro area, not a quote for one home. Taxes are not included."

### 1.7 CONSIDER - "We work out the tax, the insurance and the payment"

Rule 5.

> "Send a price range and the city you are leaving. We work out the tax, the insurance and the payment on real listings."

Appears twice on the page. Chapter3 is a brokerage, not a tax adviser, an
insurance agent or a lender. Estimating property tax and carrying costs on a
listing is ordinary brokerage work, so this is not a violation. But "the
payment," authored by a licensed MLO who works for the affiliated lender, is
the one word that reads as a lender service on a brokerage page. The footer
AfBA disclosure covers the relationship, so this is a wording question rather
than a disclosure gap.

Suggested: "We work out the property tax, an insurance estimate and the
carrying cost on real listings." Leave the loan side to the lender.

### 1.8 CONSIDER - Calculator output stated as a flat fact

Rule 4 (unsubstantiated claims).

> "Someone earning $70,000 in Los Angeles needs about $43,000 here to live the same way."

This is a BEA regional price parity ratio, and the sources line credits BEA.
Written this way it reads as a promise about the reader's standard of living
rather than the output of a price index. Attribute it inline: "On the federal
price index, someone earning $70,000 in Los Angeles would need about $43,000
here for the same purchasing power."

### Clean on this page

No fair housing issue: the page describes property, prices, taxes, utilities
and geography, and never describes who lives anywhere. No crime or safety
characterisation. No named-entity verdicts. No Reg Z trigger terms. The
"Not every move saves you money on a house... Cleveland runs about $254,000 and
Pittsburgh about $232,000, so both are cheaper than here" passage is a genuine
against-interest disclosure and is good practice.

---

## 2. pros-and-cons/index.html

**Verdict: CONCERNS.** Two blockers, five fixes, four considers. Reviewed
against the post-rewrite snapshot. The fair housing cluster that existed
earlier today is gone; what replaced it has a narrower but still real steering
problem, plus a new storm-risk claim that is the most exposed sentence across
all five pages.

### 2.1 BLOCKER - Directs the buyer to an area by who lives there, and offers to profile streets on request

Rule 1 (fair housing, steering) and 24 C.F.R. 100.70(a) and (c)(1).

> "If you are moving here to settle in and you want neighbors who are around all year, look further from the oceanfront and ask how many homes on the street are rentals."

> "We can tell you the rental mix on any street you are considering."

> "Ask us the rental mix on a street before you fall for a house."

Three separate problems, escalating:

1. The first sentence tells a buyer to prefer one geography over another
   ("look further from the oceanfront") and gives the composition of the
   resident population as the reason ("neighbors who are around all year").
   That is the same structure as the sentence the rewrite removed today, in a
   softer form. Directing a buyer toward or away from an area on the basis of
   who lives there is steering whether or not the stated characteristic is
   itself protected.
2. The second sentence offers the brokerage as the source of
   occupant-composition information, street by street, on request.
3. The third makes that offer a call to action.

Owner-versus-renter status and seasonal occupancy are not protected classes
under 42 U.S.C. 3604 or SC Code 31-21-40, so this is not a violation on its
face. The exposure is that a brokerage which will characterise the residents of
any given street on request has built exactly the mechanism a fair housing
tester probes, and short-term-rental occupancy on this coast correlates with
national origin through the seasonal workforce. The question a regulator asks
is not what the agent said about occupancy, it is what else came out of the
same conversation.

The mitigation already in the copy is genuine and should be kept: "Neither is
better. They suit different plans."

Suggested rewrite. Keep the market fact, delete the directive and the profiling
offer, and point the buyer at records they can read themselves:

> "The Grand Strand is really two housing markets sitting next to each other. Some streets near the beach are mostly short-term rentals, busy in summer and quiet in January. Others are ordinary neighborhoods. Neither is better; they suit different plans.
>
> Rental activity is a matter of public record rather than opinion. Short-term rental permits are filed with the municipality, and an HOA's rental cap and minimum lease term are written into its covenants. Ask us for the covenants and the permit records on any address and read them yourself. Our short-term rental rules page covers where rentals are allowed."

That gives the buyer more than the current copy does, and it moves the
brokerage from characterising a street to handing over documents.

### 2.2 BLOCKER - Unsubstantiated storm-durability claim, in a section that answers a risk question with reassurance

Rule 4 (unsubstantiated claims), and material-misrepresentation exposure under
SC licensing law.

> "Newer homes on this coast are built to a code written for hurricane wind, and they generally come through storms intact."

Surrounding framing:

> "Do hurricanes destroy houses in Myrtle Beach?" answered "Not in the way people picture it."

> FAQ: "Do hurricanes destroy houses in Myrtle Beach?" answered "Not usually."

The code-compliance half is a fact. "They generally come through storms intact"
is a prediction about how a class of property will perform in a future
catastrophe, published by the brokerage selling that property, with nothing
behind it. No dataset in the sources line supports it. A buyer who relies on it
and then takes a loss has a written statement from the brokerage to point at.

This is new. The version of this section that existed earlier today was headed
"The real risk" and contained no durability claim; it said "Piers get destroyed
with some regularity" and warned "do not treat distance from the ocean as
safety, and do not treat a Zone X designation as proof." The rewrite removed
the Zone X warning and added a reassurance. On a coastal market that is the
wrong direction.

Suggested rewrite:

> "Homes built to the current coastal wind code are engineered for higher wind loads than older stock, which is part of why insurers price them differently. That is a construction standard, not a guarantee for any particular storm or any particular house. What decides the risk is the address: the year it was built, when the roof was last replaced, its flood zone, and whether it has flooded before. A Zone X designation is not proof that it has not."

And change the FAQ answer so a direct question about catastrophe risk is not
answered with "Not usually."

### 2.3 FIX - "For most people who move here, yes."

Rule 4. Appears twice, in the opening answer and again in the FAQ. It is a
claim about the satisfaction of a population, with no survey behind it,
published by the party that profits from the answer. The pre-rewrite version
opened "It depends what you want from a place," which was compliant and read as
more honest.

Rewrite: restore the conditional. "It depends what you want from a place. Your
housing money goes further, the winters are mild, and you are near the water.
What you give up is walkability, higher pay, and some big city services."

### 2.4 FIX - Healthcare is now graded, and the line refusing to grade it was deleted

Rule 4, and Rule 6 in spirit.

> "Better covered than most areas this size, and expanding."

A comparative quality judgment about the region's hospitals, unsourced. The
sources line credits bed counts to "each health system," which supports the
counts but not the comparison.

The rewrite also deleted the FAQ entry that read "Is healthcare good in Myrtle
Beach?" answered "We will not grade it, but here are the facts." That was the
single best compliance sentence on the page and it is worth restoring verbatim.
The schools page uses the same device and it is what keeps that page clean.

Rewrite: open with the counts, not the verdict, and restore the FAQ answer.

### 2.5 FIX - Assessment ratio described as a tax rate, plus an unsourced superlative

Rules 4 and 8.

> "A main home is taxed on 4 percent of its value, one of the lowest rates in the country"

Two defects in one bullet. The 4 percent is South Carolina's assessment ratio,
not a tax rate, so as written the sentence is inaccurate on its own terms: a
reader will take it to mean the annual bill is 4 percent of value, which is
roughly ten times the truth. And "one of the lowest rates in the country" is a
superlative with no source attached.

Rewrite: "A main home is assessed at 4 percent of its value instead of 6, and
is exempt from the school operating tax, which puts South Carolina's effective
owner-occupied property tax among the lowest in the country." Attribute the
ranking in the sources line.

### 2.6 FIX - Golf cart rules omit the daylight restriction and contradict the moving-checklist page

Rule 5 (legal information), internal consistency.

This page:

> "A cart needs a state permit, the driver needs a license and insurance, and it can only run on roads posted 35 mph or less, within four miles of the address on the permit."

`moving-checklist` states the same rule with a limit this page leaves out:

> "a permitted cart may run in daylight, on roads posted 35 mph or less, within four miles of the address on the permit (or of the gate, in a gated community)"

Two pages on the same site state the same legal restriction differently, and
the version here omits a limit a reader could be cited for breaking. Make this
page match `moving-checklist`, or cut the detail here and link across.

### 2.7 FIX - The page currently renders duplicate Healthcare and Bugs sections

Not a legal finding, but it affects what is live. The snapshot contains both the
rewritten Healthcare and Bugs blocks and the previous versions of both, so the
page displays each subject twice with different wording. The stale copy also
still carries an undated claim about a named hospital project:

> "McLeod Health's 48-bed hospital in Carolina Forest, which has been admitting patients in phases and is slated to finish this year"

"this year" ages the moment the calendar turns and is a dated assertion about a
named health system's project. Whoever is mid-edit should delete the duplicate
blocks and put a year on the completion date.

### 2.8 CONSIDER - "Traffic is light compared with any large metro"

Rule 4. "any" is an absolute that one counterexample defeats. "most large
metros" costs nothing and is defensible.

### 2.9 CONSIDER - Client and outcome claims with no substantiation

Rule 4.

> "several of our clients say the off season is the reason they stayed"

> "Business owners who move down repeatedly find they have to cut their rates."

> "Plenty of people make the trade happily, because the lower cost of living absorbs it."

Testimonial and outcome claims carrying quantifiers ("several", "repeatedly",
"plenty") that imply data. FTC endorsement principles and SC advertising rules
both expect testimonial claims to be genuine and representative. Either drop the
quantifiers and write them as observations, or attribute them.

### 2.10 CONSIDER - Traffic count with no year

Rules 7 and 8.

> "the busiest road in the county carries about 82,000 vehicles a day averaged across the year"

SCDOT is credited in the sources line, which is correct, but a traffic count is
a specific annual figure and should carry its year. Note the rewrite also
deleted a good line from the previous version: "The state does not publish a
summer-versus-winter split for these, so treat anyone quoting you a precise
seasonal multiplier with suspicion, including us." Worth restoring.

### 2.11 CONSIDER - Hospital project dates need an as-of

Rules 6 and 8.

> "a 59-bed Grand Strand Health hospital on the US-17 Bypass expected in late 2027, and a 36-bed Tidelands hospital with MUSC at the SC-31 and SC-707 interchange expected in 2028"

Attributed to the health systems in the sources line, which is the right
handling for named-entity claims. Construction timelines slip, so add "as
announced as of [date]" and these stop being assertions the site owns.

### Clean on this page

No crime or safety-from-crime characterisation anywhere. Named hospitals carry
bed counts, trauma designations and locations, all attributable to the health
systems, and no verdict is published about any of them, which is the correct
handling under Rule 6. No Reg Z trigger terms. The opening disclosure ("We sell
real estate here, so read this knowing that") is good practice and should stay.

---

## 3. moving-checklist/index.html

**Verdict: CONCERNS.** One blocker, four fixes, three considers. No fair
housing problem and no Reg Z problem. This is the most procedural page of the
five and most of it is exactly right. The risk is concentrated in one CTA and
in undated commercial figures quoted for named companies.

### 3.1 BLOCKER - The closing CTA promises a tax-filing outcome the brokerage cannot perform or guarantee

Rule 5 (unlicensed practice) and Rule 4 (guaranteed outcome).

> "Tell us where you are coming from and when. We line up the closing, the residence application, and the property tax status so nothing is filed late."

Two problems in one sentence. A brokerage is not a tax preparer, and "we line
up ... the residence application, and the property tax status" describes the
brokerage handling a county tax filing on the client's behalf. Then "so nothing
is filed late" promises the outcome. If a client misses the 31 May legal
residence deadline and pays the 6 percent rate for a year, this sentence is
what they will point at, and the difference on a $350,000 house is roughly
$2,900 a year by the page's own arithmetic.

The page has no "confirm with a professional" pointer anywhere, which makes
this worse: the whole page is filing instructions and the CTA offers to do the
filing.

Suggested rewrite:

> "Tell us where you are coming from and when. We will map your closing date against the 45-day registration window and the 31 May residence application deadline so you can see what falls due when. The filings are yours to make; the county Auditor and a tax professional can confirm your own situation."

### 3.2 FIX - "both utilities add a demand charge to a residential account" needs verifying and sourcing

Rules 6, 7 and 8.

> "One thing to know before your first bill lands: both utilities add a demand charge to a residential account, which means part of what you pay is set by your single highest hour of use rather than your monthly total."

This is an absolute claim about the published tariffs of two named companies,
Santee Cooper and Horry Electric Cooperative, with no link to either rate
schedule and no date. If either applies a residential demand charge only on an
optional or specific rate schedule rather than to every residential account,
the sentence is a false statement about a named utility. It is not defamatory,
because there is no moral verdict in it, but it is the kind of specific factual
assertion about a named business that should not be published on a bare
assertion.

This one needs checking against the current tariffs rather than rewording. If
it holds, link both rate schedules and date the figures. If it applies only to
certain rate schedules, say which.

Related: `cost-of-living` makes the same claim in a universal form ("Your power
company charges you two ways") without naming either utility, and puts a dollar
figure on it ("$8 to $12 for each kilowatt in that one hour") that this page
does not carry. The two pages should be reconciled and both should cite the
tariff.

### 3.3 FIX - Named companies' prices and deposits quoted with no as-of date

Rules 7 and 8.

> "Santee Cooper sets its deposit from the two highest consecutive bills at that address, with a floor of $100, and refunds it after 13 months of on-time payments; a prepaid option costs $70 up front and skips the deposit and credit check entirely."

> "Horry Electric charges $35 in one-time fees to open an account, a $5 membership, a $10 application and a $20 connection"

> "HTC is a member-owned fiber cooperative covering much of the county, with published starting prices around $50 for 500 Mbps and about $75 for a gig."

> "North Myrtle Beach charges a meter deposit, $180 for the common three-quarter-inch meter, plus a $50 service charge."

> "Given that beach access parking runs $3 an hour or $15 for the day in season"

All present tense, all specific to the dollar, none dated. These are commercial
terms of named companies and municipalities that change without notice.

The sources line does carry a strong hedge and it materially reduces the
exposure: "Fees, deadlines and utility deposits change. Every figure here was
read at the source; confirm the current one before you rely on any of it." That
is good practice and should stay. It would be better still with a read-date
attached, so a reader can tell whether "read at the source" means last month or
last year: "Every figure here was read at the source in [month, year]."

### 3.4 FIX - Characterising a named competitor's pricing practice

Rules 6 and 7.

> "Spectrum is the incumbent cable provider and advertises lower first-year promotional rates that step up afterward."

Accurate and neutrally worded, and describing a promotional structure is not
trade libel. But it is an unsourced characterisation of a named company's
pricing conduct sitting next to a favourable description of a competitor ("HTC
is a member-owned fiber cooperative"). Attribute it to the published rate card
or state it flatly without the implied contrast: "Spectrum is the incumbent
cable provider. Its advertised rates are first-year promotional rates; check
the standard rate that follows."

### 3.5 FIX - Relative time references

Rule 8.

> "so a retiree who moves this year applies for it next year, at the county Auditor"

"this year" and "next year" are relative to a reading date the page does not
control. Rewrite to the rule rather than the calendar: "the exemption requires
one full year as a South Carolina legal resident as of 31 December, so someone
who moves during a year applies in the following one."

### 3.6 CONSIDER - Legal penalties and restrictions stated without a source

Rule 5.

> "North Myrtle Beach allows carts sunrise to sunset on 35 mph roads and lets them cross, but not drive along, Ocean Boulevard, 27th Avenue South, Highway 17, and Sea Mountain Highway; the fine is $100 and up to 30 days."

> "Every passenger under 12 must be belted."

These are municipal ordinance and state statute provisions, including a
criminal penalty, presented as settled fact. The content is general legal
information rather than advice, which is the right register for a brokerage,
but a stated fine and jail exposure should link the ordinance. Add the links
and a "confirm with the town, these change" line.

### 3.7 CONSIDER - "a code the city actually enforces"

Rule 6, minor.

> "Carts go out no earlier than 6 p.m. the night before and come in by 11 p.m. on collection day, and that is a code the city actually enforces."

A characterisation of a named municipality's enforcement behaviour. Harmless in
substance and probably true, but it is an assertion about a government body's
conduct that the page cannot support. "That one is enforced" or simply stating
the ordinance is enough.

### 3.8 CONSIDER - Documentation list references marital and disability status

Rule 1, cleared.

> "If married: your spouse's license and registration will be needed for the property tax application later, even if the house is in one name."

> "South Carolina exempts the first $50,000 of a legal residence's value for owners who are 65 or older, totally and permanently disabled, or legally blind."

Both flagged and both cleared. These describe statutory eligibility criteria
and a county form's document requirements, addressed to the reader. Neither
describes who lives in an area, and neither expresses a preference. This is the
distinction the owner drew correctly: describing the requirement is fine,
describing the neighbourhood's residents is not. No change needed.

### Clean on this page

No description of who lives anywhere. No crime or safety characterisation. No
school ratings. No Reg Z trigger terms: every dollar figure is a government fee,
a utility deposit or a municipal charge. The "Third-party DMV sites still say
90, which is out of date" correction names no competitor and is useful. The
sources line is the best of the five.

---

## 4. schools/index.html

**Verdict: CONCERNS (minor).** No blockers, four fixes, three considers.

**On the specific question asked - does this page give facts and official links
and rate nothing? Yes.** The page does what it claims. It refuses to rank, it
refuses to repeat the state's own rating, it explains why, and it sends the
reader to the district and to the state report card. Three passages do this
explicitly:

> "So we do not rank schools, repeat ratings, or tell you which zone to want."

> "We deliberately do not reprint any school's rating here, including the state's. Repeating a rating in our voice adopts it, and that is the line between giving you information and steering you."

> "No. Fair housing law treats an agent's opinions about schools as a form of steering, and we will not give you a different answer than we would give anyone else."

That last clause is the strongest sentence on the site from a fair housing
standpoint, because consistent treatment regardless of who is asking is the
actual test. The passage at "the useful move is to decide first what you
actually need. Class sizes, a specific special education service, a language, a
music or arts program, a sport, distance from the house, bus eligibility, and
start times ... none of them are on a rating scale" is a genuinely good answer
to a question agents usually get wrong.

Two places slip, and both are about racial history and geography rather than
ratings.

### 4.1 FIX - Desegregation-order framing needs the editorial removed and the BIC's sign-off

Rule 1 (fair housing) and Rule 6.

> "Georgetown County is different in kind, not degree. Its attendance zones were set under a 1970 federal court order and a later consent decree with the Department of Justice, and the district describes them as inflexible."

The underlying facts are public record, accurate, and genuinely useful: they
explain why transfers are hard in that district, which is exactly what a
relocating buyer needs to know. The problem is the packaging. "Different in
kind, not degree" is an editorial judgment the facts do not require, and a
1970 desegregation order is a race-based fact about a named district. In a
brokerage's marketing content, a passage that tells buyers one district's zones
descend from a desegregation case is the kind of thing that reads very
differently to a regulator than it does to the author.

The fix is to keep the operative fact and drop the framing:

> "Georgetown County's attendance zones are governed by a longstanding federal court order, and the district describes them as inflexible. Transfers are limited to the categories written into district policy and the application window closes in the spring. Ask the district rather than assuming."

That preserves everything a buyer can act on. A licensed broker should sign off
on whether the court-order reference stays at all.

### 4.2 FIX - The magnet-location contrast between two named sub-areas

Rule 1 (fair housing).

> "The district operates five magnet programs from kindergarten through twelfth grade, all in the Carvers Bay area in the western part of the county rather than on the Waccamaw Neck."

Where the programs are is a fact a buyer needs, because it determines the drive.
"Rather than on the Waccamaw Neck" adds nothing the location does not already
convey, and it sets up a contrast between two named parts of Georgetown County
that differ sharply in demographic composition. Placed one paragraph after a
desegregation-order reference, the pairing is the pattern a fair housing tester
would flag.

Rewrite, keeping the useful part:

> "The district operates five magnet programs from kindergarten through twelfth grade, all located in the Carvers Bay area in the western part of the county. Any student living in the district may apply, there is no cost, transportation is provided on request, and seats are assigned by a random computerized process among timely applications. If you are buying on the Waccamaw Neck, check the drive before you apply."

The last sentence gives the buyer the practical consequence without the
demographic contrast.

### 4.3 FIX - "Yes, and recently" and an undated rezoning

Rule 8.

> "Do school attendance zones change in Horry County?" answered "Yes, and recently."

> "When two elementary schools opened in Carolina Forest, the board redrew the lines for three existing elementary schools and published the list of affected subdivisions by name."

The rezoning is described twice with no year attached, and the FAQ answer turns
that into "recently," which decays into a false claim on its own. Put the year
on the rezoning in both places and delete "and recently."

### 4.4 FIX - "the most recent published year" and absolute policy statements

Rules 7 and 8.

> "with tuition set annually from the average per-pupil tax revenue; the figure for the most recent published year was $6,713"

Name the year. A dollar figure attributed to an unnamed "most recent published
year" cannot be checked and cannot be aged out.

> "refuses transfers into schools at or above capacity" and "with no exceptions for siblings or hardship"

Absolute statements about a named district's policy. If the district grants any
exception, the site has published a false statement about it. Attribute both to
the district's published transfer policy and date the reference.

### 4.5 CONSIDER - "Courts have treated an agent's opinions about schools as evidence of that"

Rule 5, minor.

A legal proposition asserted flatly by a non-law firm. The substance is
defensible and the sentence is self-protective rather than harmful, but a
brokerage stating what "courts have treated" is stating law. "Fair housing
enforcement treats an agent's opinions about schools as evidence of steering"
says the same thing without claiming to summarise case law, or cite HUD.

### 4.6 CONSIDER - "one of the faster-growing counties in the country"

Rule 4. A ranking claim with no source inline and none in the sources line,
which lists only district and state education sources. Attribute to Census
population estimates or cut it; the point of the paragraph is that zones move,
and the growth claim is not needed to make it.

### 4.7 CONSIDER - School choice scholarship program

Rules 5 and 8, cleared with a note.

> "South Carolina also runs a scholarship program that puts state funds in an account families can spend on approved education expenses. It has income limits, a participant cap, and a per-student cap, and its rules have changed more than once, so read the current terms on the state's school choice page before counting on it."

This is handled well. It states no dollar amounts, flags that the rules have
changed repeatedly, and sends the reader to the state. Given this program's
litigation history that is the right level of caution. No change needed. Worth
keeping an eye on, since a rule change is likely and the page will need
re-reading rather than rewriting.

### Clean on this page

No school ratings, rankings, comparisons or repeated third-party scores. No
description of who attends any school or lives in any zone. No crime or safety
characterisation. No Reg Z trigger terms. The in-state tuition section is
correctly framed as general information ending in "ask the school's residency
officer," which is the model the tax sections on the other pages should copy.
The sources line correctly warns that everything on the page changes annually.

---

## 5. from-new-york/index.html

**Verdict: CONCERNS (minor).** No blockers, four fixes, three considers.

This page carries the heaviest tax content of the five and handles it the best.
It says "We are not tax advisers and this is the point to bring in one," tells
the reader to "talk to a tax professional" twice more, dates its figures
("Rates are the 2026 tax year", "Typical home value, July 2026"), and lists
real sources. The against-interest passages are genuine and unusual:

> "If you are selling in Brooklyn, Queens, Staten Island or the Bronx, be careful, because the arithmetic is different. ... You will still gain on the purchase price, but do not expect a big drop in property tax."

> "The federal survey stops counting at $10,000, so the published medians for those counties are floors rather than actual figures"

That second one is a correct and sophisticated caveat about top-coded survey
data, and it is the kind of thing that makes the rest of the page credible.

**On targeting: a page aimed at buyers relocating from a named US state is
lawful.** National origin under 42 U.S.C. 3604 means country of origin, not US
region, and relocation-market content organised by origin state is ordinary
practice. Nothing about the existence of this page is a fair housing problem.

### 5.1 FIX - Characterising people by where they come from, and the destination's residents

Rule 1 (fair housing), the "describe property, not people" line.

> "People arriving from the Northeast tend to expect the pace and the directness they are used to, and it takes a season to recalibrate. Transactions here move differently, neighbors talk to you, and the summer is genuinely busy in a way winter is not."

Two separate slips. "People arriving from the Northeast tend to expect the pace
and the directness they are used to" is a generalisation about a group of
people defined by origin. US region is not a protected class, so this is not a
violation, but it is the same defect the `pros-and-cons` rewrite just removed:
describing people rather than property. "Neighbors talk to you" characterises
the residents of the destination area as friendlier, which is the mirror image
of the "It reads as a place where people are unfriendly" sentence that was
deleted from `pros-and-cons` today for good reason.

Rewrite to the transaction, which is what a buyer can act on:

> "One thing worth knowing from working with New York buyers. Transactions here move on a different timetable than they do in the Northeast: inventory turns more slowly, and the summer season shapes when sellers list and when they close. None of that shows up in a tax table, and it changes how you should plan your search."

### 5.2 FIX - "currently" on a tax fact

Rule 8. The exact word the brief flags, and it is doing load-bearing work.

> "If you retired from a New York school district, a police or fire department, a municipality or the state, that pension is currently taxed by New York at zero."

Rewrite: "For the 2026 tax year, New York taxes that pension at zero." The page
already establishes the 2026 vintage in the comparison table, so this is a
one-word change that makes the claim age honestly.

### 5.3 FIX - The disclaimer sits too late in the page

Rule 5.

"We are not tax advisers and this is the point to bring in one" appears in the
private-pension paragraph, well down the page. Everything above it - the full
comparison table, the property tax analysis by county, the assessment-ratio
explanation - carries no such pointer, and the strongest version of the
disclaimer is in the sources line at the very bottom. A reader who reads the
property tax section and leaves never sees either.

Move a one-line version to the top, immediately under the comparison table:
"These are general figures, not tax advice. Rates change and your own situation
decides the answer; confirm anything you plan around with a tax professional."
Keep the existing later mentions.

### 5.4 FIX - Outcome claims stated as settled

Rule 4.

> "In practice that means a Nassau or Suffolk sale often clears a Grand Strand purchase outright, which is why so many buyers here pay cash"

"Often clears ... outright" is hedged and defensible. "Which is why so many
buyers here pay cash" is an unsourced market claim asserting both a fact about
local cash share and a causal explanation for it. Either cite the cash-share
figure or cut the clause.

> "A household earning $95,000 in the New York metro keeps the same standard of living here on about $79,000."

This is a regional price parity ratio, credited to BEA in the sources line, but
written as a flat promise about the reader's standard of living. Attribute it
inline: "On the federal price index, a household earning $95,000 in the New York
metro would need about $79,000 here for the same purchasing power." Same fix as
cost-of-living finding 1.8.

### 5.5 CONSIDER - "Everyone" and "nobody"

Rule 4.

> "Everyone arrives believing the tax move is all upside. For one group it is not, and nobody tells them until they file."

Rhetorical absolutes that cannot be true and are not needed; the paragraph's
actual point is strong enough without them. "Most people arrive expecting the
tax move to be all upside. For one group it is not."

### 5.6 CONSIDER - "It is the line that most often turns a monthly estimate ... into one that does not"

Rule 4. A superlative causal claim about why estimates come in low, with nothing
behind it. "It is a common reason" says the same thing defensibly.

### 5.7 CONSIDER - RPP vintage not surfaced

Rule 7. The page says "Rates are the 2026 tax year. Property figures are the
most recent federal survey data," which is careful and correct. But the
percentage comparisons in the housing section ("about 17 percent below the New
York metro area", "housing about 44 percent below") come from BEA regional price
parities whose current vintage is 2024, and a reader seeing "2026 tax year" in
the same neighbourhood will assume everything is 2026. Name the RPP vintage.
See cost-of-living finding 1.6, where the same data powers the calculator and
the vintage is recorded in the code but never shown.

### Clean on this page

The only financing sentence is qualitative and Reg Z compliant. No description
of who lives in any area beyond finding 5.1. No crime or safety
characterisation. No school references. No named-entity verdicts. Attribution is
the best of the five pages, and dating figures the way this page does
("Typical home value, July 2026") is the standard the other four should be held
to.

---

# BLOCKERS

Four items. These are the ones that should change before this content stays
live. Everything else in this report is a fix or a judgment call.

### B1. `pros-and-cons` - steering by resident composition, plus an offer to profile any street

> "If you are moving here to settle in and you want neighbors who are around all year, look further from the oceanfront and ask how many homes on the street are rentals."
>
> "We can tell you the rental mix on any street you are considering."

Finding 2.1. Directs a buyer toward one geography over another on the basis of
who occupies it, then offers the brokerage as the source of street-by-street
occupancy information. Occupancy status is not itself a protected class, so this
is not a violation on its face; the exposure is that it builds the mechanism a
fair housing tester probes, and it is the same defect, in softer form, as the
sentence today's rewrite correctly deleted.

This one is not only a copy change. If the brokerage will in fact answer "what
is the rental mix on this street" by phone, rewriting the sentence does not fix
the practice. See the note to the BIC below.

### B2. `pros-and-cons` - unsubstantiated storm-durability claim

> "Newer homes on this coast are built to a code written for hurricane wind, and they generally come through storms intact."

Finding 2.2. A prediction about how a class of property will perform in a future
catastrophe, published by the brokerage selling that property, with no support
in the sources line. Introduced by today's rewrite, which simultaneously removed
the previous version's warning not to "treat a Zone X designation as proof." On
a coastal market this is the single sentence across all five pages most likely
to be quoted back after a loss.

### B3. `cost-of-living` - tax instruction plus an individualised offer, with no professional-referral framing anywhere on the page

Finding 1.1. The page states income tax brackets, explains how two retirement
deductions interact and what a couple can claim, works a property tax example
and computes vehicle tax, then asks "Want the tax bill on a real address, at
your ownership status?" No sentence anywhere on the page tells the reader to
confirm any of it with a tax professional or the county. `from-new-york` handles
the identical material correctly and shows what this page is missing.

The retirement-deduction passage was expanded minutes before the snapshot,
making the page more advice-like, not less.

### B4. `moving-checklist` - CTA promising a tax-filing outcome

> "We line up the closing, the residence application, and the property tax status so nothing is filed late."

Finding 3.1. Describes the brokerage handling a county tax filing and then
guarantees the result. By the page's own arithmetic, a missed 31 May deadline
costs a client roughly $2,900 a year on a $350,000 house. As with B3, the page
carries no "confirm with a professional" pointer at all.

## What is already clean, and should not be disturbed

Worth recording, because three of these are unusual and it would be easy to
break them while fixing the above.

- **Regulation Z: no trigger terms on any of the five pages**, verified against
  raw HTML including bundled script. The only financing sentence anywhere is
  qualitative. Financing is being kept qualitative exactly as intended.
- **The TCPA consent string is byte-identical on all five pages**
  (`824ec440b98f44064f102c12c6ef63cd`).
- **The schools page rates nothing**, refuses to repeat even the state's own
  rating, and explains why. It answers the brief's question in the affirmative.
- **No page characterises crime or safety-from-crime anywhere.**
- **No page publishes a verdict about a named building, HOA or builder.** Named
  hospitals carry bed counts and designations attributable to the health
  systems, with no quality judgment except the one flagged at 2.4.
- The RESPA affiliated-business disclosure is present site-wide in the footer
  and no page references BrickWood in body copy.

---

# NOTE FOR THE BROKER-IN-CHARGE

Timmy - six items that need a licensed decision rather than a copy edit.

**1. The rental-mix service, not just the sentence.** B1 rewrites easily. The
harder question is what the office actually does when a buyer calls and asks who
lives on a street. The page currently advertises that as a service. If agents
answer that question, the wording on the page is the least of it; if they do
not, the page should not offer it. This needs a written office policy on what
gets answered and what gets handed over as a document instead. My suggested
rewrite moves the page to handing over covenants and permit records, which is
defensible and is genuinely more useful to a buyer, but only if it matches
practice.

**2. Georgetown County's desegregation history.** Findings 4.1 and 4.2. The
schools page tells buyers that Georgetown's attendance zones descend from a 1970
federal court order and a DOJ consent decree, and one paragraph later notes the
magnet programs are in Carvers Bay "rather than on the Waccamaw Neck." Every
underlying fact is true and public, and the transfer restriction is real
information a relocating buyer needs. I am not comfortable calling how much of
that context belongs in brokerage marketing. That is your call and it should be
your call, not the copywriter's.

**3. The hurricane durability claim.** B2 is a representation about property
risk on a coastal market, which is licensing territory as much as advertising
territory. Note also that today's rewrite shifted this page's overall posture on
storms from warning to reassurance: it deleted "do not treat distance from the
ocean as safety, and do not treat a Zone X designation as proof" and added
"Not usually" as an answer to whether hurricanes destroy houses here. Whether
that shift was intended is worth confirming with whoever made the edit.

**4. Two utility claims that need verifying, not rewording.** Finding 3.2. The
site asserts that Santee Cooper and Horry Electric both apply a residential
demand charge to every residential account, and `cost-of-living` puts "$8 to $12
for each kilowatt in that one hour" on it. Neither page cites a tariff. If that
is only true of certain rate schedules, the site is publishing a false statement
about two named utilities. Someone needs to read the current rate schedules.
I could not verify this from the repo and did not guess.

**5. A house standard for tax content.** Three of these five pages now carry
substantial tax material, and they handle it three different ways: `from-new-york`
disclaims properly and repeatedly, `cost-of-living` not at all, `moving-checklist`
not at all and then offers to do the filing. Worth setting one standard: where
the disclaimer sits, and what an agent may compute for a client versus what
goes to their CPA. Then apply it to all tax content on the site rather than
page by page.

**6. Devin's MLO byline on brokerage pages.** All five pages are bylined
"Operations Officer & licensed MLO, NMLS 2721275," which is correct and required
on financing content. On `cost-of-living` it sits above an offer to "work out
the tax, the insurance and the payment" (finding 1.7). None of that trips Reg Z
and the footer AfBA disclosure covers the BrickWood relationship, so there is no
disclosure gap. It is a question of which hat is being worn on a page with no
financing content, and you may want a consistent rule.

## One process note

The files moved while I was reading them. `cost-of-living` changed 41 seconds
before I re-checked it and `pros-and-cons` was rewritten mid-review, which is
why this report is pinned to a hashed snapshot taken at 17:43:01. As of that
snapshot `pros-and-cons` renders its Healthcare and Bugs sections twice, once in
the new wording and once in the old, so that edit appears unfinished (finding
2.7). Whoever is working on it should know a review baseline exists, and the
hashes at the top of this report will tell you whether a page has moved on from
what I read.

---

# CHECKPOINT 2: state as of 17:53:04

The pages kept changing while this report was being written, and most of the
findings above have already been acted on. This section records what I verified
against the files at **2026-08-20 17:53:04 -0400**, so the report describes
something that exists rather than a state that has passed.

| Page | MD5 at checkpoint 2 | Moved since snapshot? |
|---|---|---|
| cost-of-living | `c87fd153bb06cc15104eef2533cb063b` | yes |
| from-new-york | `19bf7ba74206b465ab3d56b4f8dd7f27` | no |
| moving-checklist | `09d4be2bd8f84c713167d91a732a7093` | yes |
| pros-and-cons | `e7bb358f5325ea74b6308e8c1b238509` | yes |
| schools | `616aa1d97f01f95a8a1bcf023988dd11` | no |

`schools` and `from-new-york` are untouched, so every finding in sections 4 and
5 stands exactly as written.

## All four blockers are resolved or substantially resolved

**B1, steering by resident composition - RESOLVED.** The directive and the
street-profiling offer are both gone. The section now reads:

> "Neither is better. They suit different plans. ... Rental activity is a matter of public record rather than opinion. Short-term rental permits are filed with the municipality, and an association's rental cap and minimum lease term are written into its covenants. Ask us for the covenants and the permit records on any address and read them yourself."

CTA changed from "Ask us the rental mix on a street" to "We will pull the
covenants and permit records on any address you are considering." That moves the
brokerage from characterising a street to handing over documents, which is the
right answer. **The office-policy question in BIC note 1 still stands**: the page
now promises covenants and permit records, so that is what should be delivered.

**B2, storm-durability claim - SUBSTANTIALLY RESOLVED.** "They generally come
through storms intact" is gone, replaced with the construction-standard framing
and the restored Zone X warning. The FAQ answer now opens "Hurricanes reach this
coast and they do damage property" instead of "Not usually."

One remnant. The body section still answers its own header this way:

> "Do hurricanes destroy houses in Myrtle Beach?" answered "Not in the way people picture it."

The unsupportable claim is gone, so this is no longer a blocker, but the section
still opens by minimising. Downgraded to FIX: open with the fact and let it
carry the point, as the FAQ answer now does.

**B3, tax guidance without professional framing - RESOLVED.** The Taxes section
now opens:

> "This is general information, not tax advice. Rates and deductions change, and your own situation decides the answer. Confirm anything you plan around with a tax professional or the Horry County Auditor."

and the CTA changed from "Want the tax bill on a real address" to "Want an
estimate of the property tax on a real address, at your ownership status?"

**B4, CTA promising a filing outcome - RESOLVED.** Now reads:

> "We will map your closing date against the 45-day registration window and the May 31 residence application deadline so you can see what falls due when. The filings are yours to make, and the county Auditor or a tax professional can confirm your own situation."

A matching disclaimer was also added to the 4 percent section of that page.

## Other findings resolved since the snapshot

- **1.2** - now "For the 2026 tax year, South Carolina charges 1.99 percent..."
- **1.3** - now "In August 2026 South Carolina ran about 45 cents a gallon
  below the national average," with "Prices move weekly, so check the current
  state averages before you rely on the gap" added.
- **1.5** - the customer bills line now reads "in a 1,400 square foot two-story
  house in 2026."
- **2.3** - "It depends what you want from a place" restored in both the opening
  answer and the FAQ.
- **2.4 and 2.7** - resolved by deletion. The Healthcare section and its
  duplicate have both been removed from the page, along with the duplicated Bugs
  block. The page is 89 lines of visible text, down from 110. Nothing is graded
  and nothing renders twice.
- **3.2** - now attributed, named and dated: "On their published 2026 residential
  schedules, both Santee Cooper and Horry Electric Cooperative bill a demand
  charge as well as the power you use." **BIC note 4 still stands.** Dating the
  claim is not the same as verifying it; someone still needs to read the two
  2026 schedules and confirm the charge applies to all residential accounts
  rather than to particular rate schedules. I could not verify this from the
  repo.

## Still open at checkpoint 2

Everything in sections 4 and 5 (`schools`, `from-new-york`), plus:

| Finding | Page | Item |
|---|---|---|
| 1.6 | cost-of-living | FIX. Still "Home values and rents: Zillow, latest month." The bundle records `zillowLatestMonth: 2026-07-31` and `rppVintage: 2024`, and neither reaches the page. The BEA vintage being invisible is the substantive half. |
| 1.7 | cost-of-living | CONSIDER. "We work out the tax, the insurance and the payment on real listings" is unchanged. |
| 1.8 | cost-of-living | CONSIDER. Calculator output still stated flatly. |
| 2.1 remnant | pros-and-cons | FIX, downgraded from BLOCKER. "Not in the way people picture it." |
| 2.5 | pros-and-cons | FIX. "A main home is taxed on 4 percent of its value, one of the lowest rates in the country" is unchanged. The assessment-ratio-as-tax-rate error is the part that matters: as written it overstates the bill by roughly ten times. |
| 2.6 | pros-and-cons | FIX. Golf cart rules still omit the daylight restriction and still contradict `moving-checklist`. |
| 2.8-2.11 | pros-and-cons | CONSIDER, all unchanged. |
| 3.3 | moving-checklist | FIX. Named companies' prices and deposits still undated. |
| 3.4-3.7 | moving-checklist | FIX and CONSIDER, unchanged. |
| 3.5 | moving-checklist | FIX. "applies for it next year" unchanged. |

Of these, **2.5 is the one I would do next**. It is the only remaining item that
is factually wrong rather than merely undated or unsourced, and a reader who
takes "taxed on 4 percent of its value" literally will compute a tax bill about
ten times the real one.

## A note on reviewing a moving target

Three of the five pages changed twice during a review that took under an hour,
and one of those changes introduced two problems as serious as the four it
fixed (findings 2.1 and 2.2, both since resolved). That is not an argument
against the editing, which has been in the right direction throughout. It is an
argument for running `node build.js preflight` and a fair housing read on the
final state before anything ships, rather than treating this report as clearance.
Nothing here clears a page that has changed since 17:53:04.
