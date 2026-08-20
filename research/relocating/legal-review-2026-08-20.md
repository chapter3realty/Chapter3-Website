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

## Verdicts at a glance

| Page | Verdict | Blockers | Fixes | Considers |
|---|---|---|---|---|
| cost-of-living | CONCERNS | 1 | 6 | 2 |
| pros-and-cons | CONCERNS | 2 | 6 | 4 |
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
APR and repayment-terms disclosure under 12 C.F.R. 1026.24(c)–(d).

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

**Verdict: CONCERNS.** One blocker, six fixes, two considers. No fair housing
problem. The whole risk on this page is tax content: it is the most
prescriptive tax page of the five and the only tax-heavy page with no
"check with a professional" pointer anywhere in it.

### 1.1 BLOCKER — Detailed tax guidance with no professional-referral framing, ending in an offer to compute a specific consumer's tax bill

Rule 5 (unlicensed practice).

The page states income tax brackets, retirement deduction amounts and age
thresholds, works a property tax example, and computes vehicle tax:

> "South Carolina charges 1.99 percent on your first $30,000 of taxable income and 5.21 percent above that."

> "Other retirement income gets a deduction of up to $3,000 before you turn 65 and up to $10,000 after, plus a separate deduction of up to $15,000 at 65 against any income."

> "On a $350,000 house in the unincorporated county that is roughly $1,300 a year as a main home against roughly $4,200 as a second home."

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

### 1.2 FIX — Tax rates stated with no tax year

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

### 1.3 FIX — "In the middle of this year" and "today's prices"

Rule 8.

> "In the middle of this year South Carolina ran about 45 cents a gallon below the national average, about 60 cents below Ohio and about 50 cents below New York."

"this year" is unanchored the moment the calendar turns. AAA is credited in the
sources line, which is good, but the comparison needs a date on it.

Rewrite: "In mid-2026 South Carolina ran about 45 cents a gallon below the
national average..."

### 1.4 FIX — Utility demand charge stated as universal, unattributed, undated

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

### 1.5 FIX — Customer's real utility bills quoted to the cent with no date

Rule 8.

> "These are real bills from a customer in a 1,400 square foot two-story house, not an area average. Power runs about $119.89 and water about $51.42."

The labelling is honest and the "not an area average" caveat is exactly right.
The problem is the tense. Two figures given to the cent, in the present tense,
with no month, will be read as current indefinitely.

Rewrite: "These are real bills from a customer in a 1,400 square foot two-story
house, not an area average. In [month, year] power was $119.89 and water
$51.42."

### 1.6 FIX — "Zillow, latest month" hides a vintage the code already knows

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

### 1.7 CONSIDER — "We work out the tax, the insurance and the payment"

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

### 1.8 CONSIDER — Calculator output stated as a flat fact

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
