# How long to hold a Myrtle Beach rental before selling: verified facts

For the page "How long should you hold a Myrtle Beach rental before selling?" Every fact below was
read at the source named on 2026-09-07 (file timestamps show 2026-09-08 UTC), by curl download or
WebFetch, and the text extracted and read. Quotes are verbatim. Anything not read at a primary
source is under "Could not verify". Figures carried from other site pages were re-checked where a
primary source exists (rule 8): the rent page's $1,714 and the FY2027 fair market rents both
re-verified. Facts and computed tables only; no page copy.

Data files (all under research/invest-next/data/, named hold-*):

| File | What it is |
|---|---|
| hold-zhvi-metro-myrtle-beach.csv | Metro ZHVI monthly series 2001-11 to 2026-07, 297 rows |
| hold-zhvi-city-grand-strand.csv | City ZHVI rows, 12 SC places |
| hold-zhvi-zip-grand-strand.csv | Zip ZHVI rows, 13 Grand Strand zips |
| hold-zori-grand-strand.csv | Zillow rent index rows, metro + 6 cities + 12 zips |
| hold-rent-to-price-by-zip.csv | ZHVI, ZORI, HUD small-area FMR and computed yields by zip |
| hold-rolling-windows.csv | Metro rolling n-year outcomes and the share clearing each cost threshold |
| hold-breakeven-model.csv | Break-even hold by appreciation, buyer type and commission assumption |
| hold-amortization-share.csv | Principal repaid by year on a 30-year loan, low and high (no rates) |
| hold-cash-model.csv | All-cash 10-year tables, two yield cases, two appreciation cases |
| hold-sell-one-buy-two.csv | Trade-down cases on real areas |
| hold-keep-vs-trade-10yr.csv | 10-year keep vs. sell-and-buy-two table |

The raw Zillow downloads (Metro 4.4 MB, City 93.6 MB, Zip 123.1 MB, Neighborhood 102.9 MB, and the
four ZORI files) were deleted after extraction; the folder's .gitignore (written by the other worker)
excludes `*_month.csv` anyway. Re-download from the URLs in section 1. SHA-256 of the files read:
Metro ZHVI 9d8c9d0c…80c5e, City ZHVI 85779336…8341b, Zip ZHVI 50dce14c…c967719, Neighborhood ZHVI
7062bb5b…fadda1.

**Reconcile with the other worker's files in the same folder** (`returns-tables.md`,
`zillow-extract-summary.json`, `submarkets.json`, written 2026-09-08 02:50-03:00 UTC for the
"what return should a rental make" page). Same Zillow release, same July 2026 values. Different cost
assumptions: that file uses 25 percent vacancy and maintenance, per-town millage, $3,050 insurance,
and the Georgetown County FMR ($1,380) for Pawleys Island; this file uses the site's stated planning
numbers (section 4). Its yields are lower than the ones here. The owner's instruction (batch 5,
answer 10): one number, one source, two pages pointing at it. The hold page should carry the
appreciation-by-area table (section 1) and link to the returns page for yields, not restate them.

---

## 1. Appreciation history: Zillow Home Value Index

### Source

Files downloaded with curl from `https://files.zillowstatic.com/research/public_csvs/zhvi/` on
2026-09-07: `Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv` (HTTP 200, 4,459,358 bytes,
server Last-Modified `Sun, 16 Aug 2026 18:55:31 GMT`), `City_…` (93,567,045 bytes, Last-Modified
2026-08-16 18:54:06 GMT), `Zip_…` (123,065,811 bytes, 18:59:06 GMT), `Neighborhood_…`
(102,938,446 bytes, 18:57:12 GMT). The public index page `https://www.zillow.com/research/data/`
returned HTTP 403 to every fetch, so the index definition is in "Could not verify". What the file
name says: all homes (single-family, condo and co-op), middle tier (33rd to 67th percentile),
smoothed, seasonally adjusted, monthly, dollars. **Last data column: 2026-07-31.** State the data
date on the page as July 2026.

Metro row: RegionID 394898, SizeRank 117, RegionName "Myrtle Beach, SC", RegionType msa. The City
file labels the same metro "Myrtle Beach-Conway-North Myrtle Beach, SC-NC". The metro series starts
2001-11-30 ($145,052); 297 monthly values.

### Metro: change to July 2026 ($342,010)

| Period | From (July) | To (July 2026) | Total change | Annualized |
|---|---|---|---|---|
| 1 year | 2025: $341,411 | $342,010 | +0.2% | +0.18% |
| 3 years | 2023: $347,807 | $342,010 | -1.7% | -0.56% |
| 5 years | 2021: $270,892 | $342,010 | +26.3% | +4.77% |
| 10 years | 2016: $189,486 | $342,010 | +80.5% | +6.08% |
| 15 years | 2011: $160,235 | $342,010 | +113.4% | +5.18% |
| 20 years | 2006: $232,980 | $342,010 | +46.8% | +1.94% |

Annualized = (end/start)^(1/years) - 1. The 20-year line starts one year before the 2007 peak, which
is why it is the lowest; it is the honest "bought at the top" figure.

### Metro: every rolling n-year window, 2001-11 to 2026-07

Overlapping monthly windows. One bust (2007-2011) sits inside most of them, so a "share" is a
history count, not a probability.

| Hold | Windows | Worst total change (start to end) | Median | Best | Share ending below start |
|---|---|---|---|---|---|
| 1 year | 285 | -15.3% (2008-09 to 2009-09) | +3.7% | +27.4% (2021-06 to 2022-06) | 27% |
| 2 years | 273 | -22.2% (2007-11 to 2009-11) | +8.4% | +50.5% | 26% |
| **3 years** | 261 | **-29.0% (2008-03 to 2011-03)** | +13.6% | +57.8% (2003-10 to 2006-10) | 27% |
| 4 years | 249 | -33.3% (2007-07 to 2011-07) | +17.9% | +66.0% | 24% |
| 5 years | 237 | -34.0% (2006-11 to 2011-11) | +24.0% | +75.1% (2017-08 to 2022-08) | 25% |
| 7 years | 213 | -28.9% (2006-10 to 2013-10) | +29.6% | +88.7% | 29% |
| 10 years | 177 | -20.5% (2006-10 to 2016-10) | +12.5% | +112.5% (2012-08 to 2022-08) | 25% |
| 12 years | 153 | -12.2% | +21.7% | | 21% |
| 15 years | 117 | +14.2% (2006-04 to 2021-04) | +38.1% | +113.4% (2011-07 to 2026-07) | 0% |

**Worst 3-year window: -29.0 percent, March 2008 to March 2011.** Worst window of any length:
-34.0 percent over the five years November 2006 to November 2011.

### The 2007-2011 fall, for the risk section

- Peak: **March 2007, $242,124.** Trough: **November 2011, $159,453.** Fall **-34.1 percent** over
  **56 months.**
- The index first regained the March 2007 level in **December 2020 ($242,548): 165 months, 13 years
  and 9 months**, after the peak. A buyer at the top who sold before December 2020 sold below the
  purchase price, before any selling cost.
- Every 15-year window in the series ended above its start (117 of 117). The lowest 15-year result
  was +14.2 percent (April 2006 to April 2021), which is below the round-trip cost threshold for a
  financed buyer at the site's example commission (section 4: +10.5 percent) only by a small
  margin: 14.2 clears it.

### Since 2020

- Post-2020 peak: **May 2024, $352,722.** July 2026 is **3.0 percent below** that peak.
- July 2021 to July 2022: +26.7 percent in twelve months ($270,892 to $343,238), the fastest
  12-month rise in the series (the single best 12-month window, June 2021 to June 2022, is +27.4%).

### Metro ZHVI, July of each year

| Year | ZHVI | Year | ZHVI | Year | ZHVI |
|---|---|---|---|---|---|
| 2002 | 144,873 | 2011 | 160,235 | 2020 | 228,373 |
| 2003 | 150,043 | 2012 | 162,678 | 2021 | 270,892 |
| 2004 | 161,711 | 2013 | 168,188 | 2022 | 343,238 |
| 2005 | 190,105 | 2014 | 176,841 | 2023 | 347,807 |
| 2006 | 232,980 | 2015 | 182,869 | 2024 | 351,649 |
| 2007 | 240,322 | 2016 | 189,486 | 2025 | 341,411 |
| 2008 | 224,747 | 2017 | 196,983 | 2026 | 342,010 |
| 2009 | 190,807 | 2018 | 207,690 | | |
| 2010 | 176,876 | 2019 | 219,464 | | |

### By city (City ZHVI file, July 2026)

Zillow's City file has no row for Garden City, Carolina Forest or Socastee (checked the City and
Neighborhood files; the Neighborhood file's only Grand Strand row is "Forestbrook"). Zip rows stand
in for them below. Zillow places Murrells Inlet and Pawleys Island in Georgetown County and the
"Georgetown, SC" metro, not the Myrtle Beach metro. Annualized in brackets.

| City | ZHVI Jul 2026 | 1 year | 3 years | 5 years | 10 years | Series starts |
|---|---|---|---|---|---|---|
| Myrtle Beach | $324,532 | -0.0% | -4.0% (-1.34%/yr) | +25.4% (+4.63%/yr) | +72.6% (+5.61%/yr) | 2001-11 |
| North Myrtle Beach | $398,524 | -0.0% | -4.5% (-1.53%/yr) | +29.1% (+5.25%/yr) | +82.2% (+6.18%/yr) | 2001-11 |
| Conway | $289,610 | -0.2% | -0.4% (-0.13%/yr) | +27.7% (+5.01%/yr) | +85.1% (+6.35%/yr) | 2002-05 |
| Surfside Beach | $361,707 | +1.5% | -1.0% (-0.33%/yr) | +30.3% (+5.43%/yr) | +92.4% (+6.76%/yr) | 2002-04 |
| Murrells Inlet | $401,332 | +0.2% | +0.7% (+0.23%/yr) | +30.1% (+5.41%/yr) | +80.4% (+6.08%/yr) | 2002-04 |
| Pawleys Island | $548,832 | +0.1% | +7.4% (+2.41%/yr) | +38.1% (+6.67%/yr) | +89.6% (+6.61%/yr) | 2012-05 |
| Little River | $324,412 | -0.7% | -5.0% (-1.68%/yr) | +23.4% (+4.30%/yr) | +76.5% (+5.84%/yr) | 2002-03 |
| Loris | $253,642 | +1.3% | +2.7% (+0.90%/yr) | +32.4% (+5.78%/yr) | +102.4% (+7.30%/yr) | 2001-11 |
| Longs | $286,326 | -2.1% | -5.3% (-1.82%/yr) | +23.7% (+4.35%/yr) | +70.6% (+5.49%/yr) | 2002-04 |
| Briarcliffe Acres | $393,157 | -3.1% | -3.8% | +24.1% (+4.41%/yr) | +82.6% (+6.21%/yr) | 2001-11 |
| Atlantic Beach | $291,934 | -2.2% | -8.4% | +13.2% (+2.52%/yr) | +46.5% (+3.89%/yr) | 2006-01 |
| Georgetown (city) | $250,130 | -1.1% | +4.5% | +22.5% (+4.15%/yr) | +77.1% (+5.88%/yr) | 2012-05 |

### By zip (Zip ZHVI file, July 2026), including the Garden City and Carolina Forest stand-ins

| Zip | Area (Zillow "City" label, plus what the zip covers) | ZHVI | 1 year | 3 years | 5 years | 10 years |
|---|---|---|---|---|---|---|
| 29579 | Myrtle Beach: Carolina Forest and the 501 corridor | $359,496 | -0.0% | -3.5% (-1.17%/yr) | +23.0% (+4.23%/yr) | +69.5% (+5.42%/yr) |
| 29576 | Murrells Inlet, including Garden City Beach | $401,110 | +0.1% | +0.6% (+0.19%/yr) | +30.0% (+5.39%/yr) | +80.3% (+6.07%/yr) |
| 29577 | Myrtle Beach, city core | $279,713 | -0.8% | -7.3% (-2.49%/yr) | +25.7% (+4.68%/yr) | +72.1% (+5.58%/yr) |
| 29572 | Myrtle Beach, north end | $319,482 | -0.8% | -6.9% (-2.37%/yr) | +28.0% (+5.06%/yr) | +73.6% (+5.67%/yr) |
| 29588 | Myrtle Beach: Socastee, Burgess | $324,770 | +0.3% | -1.9% (-0.65%/yr) | +26.1% (+4.75%/yr) | +79.3% (+6.02%/yr) |
| 29582 | North Myrtle Beach | $400,143 | +0.1% | -4.1% (-1.40%/yr) | +29.5% (+5.31%/yr) | +82.2% (+6.18%/yr) |
| 29575 | Surfside Beach | $360,243 | +1.4% | -0.6% (-0.21%/yr) | +31.3% (+5.59%/yr) | +94.8% (+6.90%/yr) |
| 29566 | Little River | $323,004 | -0.7% | -5.0% (-1.71%/yr) | +23.6% (+4.33%/yr) | +77.6% (+5.91%/yr) |
| 29568 | Longs | $291,590 | -2.2% | -5.7% (-1.95%/yr) | +22.6% (+4.16%/yr) | +68.9% (+5.38%/yr) |
| 29526 | Conway | $302,222 | -0.3% | +0.1% (+0.04%/yr) | +28.1% (+5.07%/yr) | +81.9% (+6.17%/yr) |
| 29527 | Conway, west | $263,160 | +0.1% | -0.6% (-0.22%/yr) | +29.5% (+5.31%/yr) | +94.6% (+6.89%/yr) |
| 29569 | Loris | $254,720 | +1.2% | +2.7% (+0.90%/yr) | +32.4% (+5.77%/yr) | +102.4% (+7.30%/yr) |
| 29585 | Pawleys Island | $550,277 | +0.1% | +7.4% (+2.42%/yr) | +38.2% (+6.68%/yr) | +89.7% (+6.61%/yr) |

**The hub's "+10.5% Year-over-year, Price growth across the Grand Strand" tile
(`/invest/index.html` line 146) does not match any area in this release.** One-year changes run
from -3.1 percent (Briarcliffe Acres) to +1.5 percent (Surfside Beach). Owner answer 10 (batch 5)
already asks for it to be replaced with a sourced, dated by-area figure; the tables above are that
figure. The nearest true statement is the five-year or ten-year annualized rate.

### Rents by area, for the models in section 4

Zillow Observed Rent Index (typical asking rent, all home types, smoothed, not seasonally adjusted),
file `Zip_zori_uc_sfrcondomfr_sm_month.csv` and `City_…` and `Metro_…`, downloaded 2026-09-07,
Last-Modified 2026-08-16 18:59 GMT, last column 2026-07-31. Metro "Myrtle Beach, SC" July 2026:
**$1,714.42** (July 2025: $1,687.58; September 2025: $1,694.53). That matches the rent page's
"about $1,714 in July 2026" and "about $1,695 in September 2025". HUD small-area fair market rents,
FY2026, file `https://www.huduser.gov/portal/datasets/fmr/fmr2026/fy2026_safmrs.xlsx` (FY2027
small-area file returned 404). HUD FY2027 metro FMRs, `…/fmr2027/FY27_FMRs.xlsx`, Horry County /
"Myrtle Beach-North Myrtle Beach-Conway, SC HUD Metro FMR Area": $1,155 / $1,258 / $1,504 /
$1,823 / $1,981 for 0 to 4 bedrooms, which matches the rent page exactly; Georgetown County FY2027:
$842 / $885 / $1,158 / $1,380 / $1,936.

| Zip | ZORI Jul 2026 (Jul 2025) | HUD SAFMR FY2026, 3 bedrooms | Gross rent to price (ZORI × 12 / ZHVI) |
|---|---|---|---|
| 29526 Conway | $1,892 ($1,854) | $1,600 | 7.5% |
| 29527 Conway west | none | $1,600 | |
| 29566 Little River | $1,502 ($1,562) | $1,960 | 5.6% |
| 29568 Longs | $1,835 ($1,728) | $1,980 | 7.6% |
| 29569 Loris | none | $1,600 | |
| 29572 Myrtle Beach north | $1,595 ($1,534) | $1,770 | 6.0% |
| 29575 Surfside Beach | $1,607 ($1,566) | $1,970 | 5.4% |
| 29576 Murrells Inlet / Garden City | $1,943 ($1,918) | $2,060 | 5.8% |
| 29577 Myrtle Beach core | $1,680 ($1,655) | $1,750 | 7.2% |
| 29579 Carolina Forest | $1,736 ($1,747) | $2,130 | 5.8% |
| 29582 North Myrtle Beach | $1,627 ($1,477) | $1,910 | 4.9% |
| 29585 Pawleys Island | $1,926 (none) | $1,890 | 4.2% |
| 29588 Socastee / Burgess | $1,682 ($1,668) | $1,870 | 6.2% |

City ZORI rows exist only from 2023-2024 and July 2026 is blank for every city except the metro;
zip rows are the usable ones.

---

## 2. Hold rules by strategy

### 2a. Flip: no minimum, but the tax turns on one year and on intent

Source: IRS Topic no. 409, Capital gains and losses, https://www.irs.gov/taxtopics/tc409, "Page
Last Reviewed or Updated: 25-Feb-2026". Read 2026-09-07.

- Quote: "Generally, if you hold the asset for more than one year before you dispose of it, your
  capital gain or loss is long-term. If you hold it one year or less, your capital gain or loss is
  short-term."
- Quote: "To determine how long you held the asset, you generally count from the day after the day
  you acquired the asset up to and including the day you disposed of the asset."
- Quote: "Note: Net short-term capital gains are subject to taxation as ordinary income at
  graduated tax rates."
- Quote: "The portion of any unrecaptured section 1250 gain from selling section 1250 real property
  is taxed at a maximum 25% rate."

Source: IRS Publication 544 (2025), Sales and Other Dispositions of Assets, "For use in preparing
2025 Returns", https://www.irs.gov/publications/p544. Downloaded with curl, read 2026-09-07.

- Quote: "Property held mainly for sale to customers. Stock in trade, inventory, and other
  properties you hold mainly for sale to customers in your trade or business are not capital
  assets."
- Quote: "For 2025, the maximum tax rates for individuals are 0%, 15%, 20%, 25%, and 28%."
- Pub 544 does not say "flip" or "dealer" in a sentence about houses. The chain is: property held
  mainly for sale to customers is not a capital asset, so its gain is not capital gain, so the
  capital gain rates do not apply.

Source: 26 U.S.C. 1221(a)(1), https://www.law.cornell.edu/uscode/text/26/1221. Read 2026-09-07.
Quote: the term capital asset "does not include (1) stock in trade of the taxpayer or other
property of a kind which would properly be included in the inventory of the taxpayer if on hand at
the close of the taxable year, or property held by the taxpayer primarily for sale to customers in
the ordinary course of his trade or business".

Source: 26 U.S.C. 1222, https://www.law.cornell.edu/uscode/text/26/1222. Read 2026-09-07.
Quote: "(1) Short-term capital gain The term 'short-term capital gain' means gain from the sale or
exchange of a capital asset held for not more than 1 year". Quote: "(3) Long-term capital gain The
term 'long-term capital gain' means gain from the sale or exchange of a capital asset held for more
than 1 year".

Source: IRS Publication 550 (2025), Investment Income and Expenses, "For use in preparing 2025
Returns", https://www.irs.gov/publications/p550. Downloaded with curl, read 2026-09-07. Quote:
"Real property bought. To figure how long you have held real property bought under an
unconditional contract, begin counting on the day after you received title to it or on the day
after you took possession of it and assumed the burdens and privileges of ownership, whichever
happened first."

Site consistency: `/invest/strategies/fix-and-flip/` already says "A flip is inventory, not
investment property, so it does not qualify for a 1031 exchange." and "Pay the tax." Nothing on the
site states a flip holding period. Nothing above contradicts it.

### 2b. BRRRR: the cash-out refinance waiting period

Source: Fannie Mae Selling Guide B2-1.3-03, Cash-Out Refinance Transactions,
https://selling-guide.fanniemae.com/sel/b2-1.3-03/cash-out-refinance-transactions. Downloaded with
curl, read 2026-09-07. The page carries no "last updated" line; its related-announcements list ends
with "Announcement SEL-2025-10 December 10, 2025" and "Announcement SEL-2025-08 October 08, 2025".
This Guide governs loans sold to Fannie Mae. DSCR loans are not sold to Fannie Mae; their lenders set
their own rules (next source).

- Ownership, quote: "At least one borrower must have been on title to the subject property for at
  least six months prior to the disbursement date of the new loan, unless one of the following
  exceptions apply:" Exceptions listed: inheritance or legal award ("There is no waiting period if
  the lender documents that the borrower acquired the property through an inheritance or was
  legally awarded the property (divorce, separation, or dissolution of a domestic partnership)."),
  the delayed financing exception, time held by an LLC "majority-owned or controlled by the
  borrower(s)", and time held by an inter vivos revocable trust.
- A second clock, on the loan being paid off, quote: "If an existing first mortgage is being paid
  off through the transaction, it must be at least 12 months old at the time of refinance, as
  measured by the note date of the existing loan to the note date of the new loan." Quote: "The
  above ownership policy applies in addition to the requirement that an existing first mortgage
  being paid off through the refinance is at least 12 months old."
- Quote: "Properties that were listed for sale must have been taken off the market on or before the
  disbursement date of the new mortgage loan."
- Delayed financing, quote: "Borrowers who purchased the subject property within the past six
  months (measured from the date on which the property was purchased to the disbursement date of
  the new mortgage loan) are eligible for a cash-out refinance if all of the following requirements
  are met." Requirements include, quote: "The original purchase transaction was an arms-length
  transaction." Quote: "The original purchase transaction is documented by a settlement statement,
  which confirms that no mortgage financing was used to obtain the subject property." Quote: "The
  new loan amount can be no more than the actual documented amount of the borrower's initial
  investment in purchasing the property plus the financing of closing costs, prepaid fees, and
  points on the new mortgage loan (subject to the maximum LTV, CLTV, and HCLTV ratios for the
  cash-out transaction based on the current appraised value)." Quote: "Note: Funds received as
  gifts and used to purchase the property may not be reimbursed with proceeds of the new mortgage
  loan."

Source: Easy Street Capital, "DSCR Loan Cash-Out Refinance Guide",
https://easystreetcap.com/dscr-loan-cash-out-refinance-guide/, page dated August 7, 2025, read
2026-09-07 with WebFetch. The company describes itself as a lender offering DSCR loans.

- Quote: "Easy Street Capital has no minimum seasoning period for cash-out refinance DSCR loans."
- Quote: "For loans with a seasoning period between 0 and 3 months, Easy Street Capital will provide
  cash-out refinance DSCR loans." Quote: "You must use the lower of the third-party appraised value
  and your cost basis (purchase price plus documented renovation costs)."
- Quote: "Cash-Out Refinance DSCR Loans with seasoning between 3-6 months will be limited to 70%
  LTV."
- Quote: "For cash-out refinance DSCR loans with six months or greater seasoning, Easy Street
  Capital has no seasoning restrictions."

Site consistency: `/invest/strategies/brrrr/` says "Many also require seasoning, meaning the lender
makes you wait a few months before using the new value. Our lending partner skips seasoning for
BRRRR investors here" and "Most lenders cap the cash-out at 75 to 80 percent of the new appraised
value." The sources above agree with "many lenders require seasoning" and "some do not". Two
cautions for the hold page: (1) the "70% LTV" and "75 to 80 percent" figures are loan-size
percentages; the hold page is not one of the four down-payment-percentage pages, so say "a smaller
loan" rather than a percentage; (2) the Fannie Mae rule is the conforming-loan rule, so name it as
"a conventional lender will usually require" and the DSCR rule as "many rental-loan lenders".

### 2c. Long-term rental: recapture at sale, and the 1031 "held for investment" standard

**Recapture.** Source: 26 U.S.C. 1(h)(1)(E), https://www.law.cornell.edu/uscode/text/26/1. Read
2026-09-07. Quote: "(E) 25 percent of the excess (if any) of (i) the unrecaptured section 1250
gain (or, if less, the net capital gain (determined without regard to paragraph (11))), over (ii)
the excess (if any) of (I) the sum of the amount on which tax is determined under subparagraph (A)
plus the net capital gain, over (II) taxable income". 1(h)(6)(A), quote: "The term 'unrecaptured
section 1250 gain' means the excess (if any) of (i) the amount of long-term capital gain (not
otherwise treated as ordinary income) which would be treated as ordinary income if section
1250(b)(1) included all depreciation and the applicable percentage under section 1250(a) were 100
percent". Pub 544, quote: "Unrecaptured section 1250 gain. Generally, this is the part of any
long-term capital gain on section 1250 property (real property) that is due to depreciation."
Topic 409 quote in 2a: "taxed at a maximum 25% rate."

Pub 527 (2025), Residential Rental Property, https://www.irs.gov/publications/p527, read
2026-09-07, Table 2-1: "Residential rental property (buildings or structures) and structural
components such as furnaces, waterpipes, venting, etc. 27.5 years".

**1031: no holding period in the statute or the publication.** Source: 26 U.S.C. 1031,
https://www.law.cornell.edu/uscode/text/26/1031. Read 2026-09-07, whole section.

- 1031(a)(1), quote: "No gain or loss shall be recognized on the exchange of real property held for
  productive use in a trade or business or for investment if such real property is exchanged
  solely for real property of like kind which is to be held either for productive use in a trade
  or business or for investment."
- 1031(a)(2), quote: "This subsection shall not apply to any exchange of real property held
  primarily for sale."
- 1031(a)(3)(A) and (B): identification "on or before the day which is 45 days after the date on
  which the taxpayer transfers the property relinquished", receipt by the earlier of "the day
  which is 180 days after the date on which the taxpayer transfers the property relinquished" or
  "the due date (determined with regard to extension) for the transferor's return".
- The section contains no minimum ownership period before or after an exchange. The words "held
  for" carry the test.

Source: Pub 544 (2025), like-kind chapter, read 2026-09-07. Quote: "In a like-kind exchange, both
the real property you give up and the real property you receive must be held by you for investment
or for productive use in your trade or business. Buildings, land, and rental property are examples
of property that may qualify. The rules for like-kind exchanges do not apply to exchanges of the
following property. Real property used for personal purposes, such as your home. Real property held
primarily for sale." Quote: "A dwelling unit (home, apartment, condominium, or similar property)
may, for purposes of a like-kind exchange, qualify as property held for productive use in a trade or
business or for investment purposes if certain requirements are met. See Revenue Procedure 2008-16".

Source: IRS, "Like-kind exchanges - Real estate tax tips",
https://www.irs.gov/businesses/small-businesses-self-employed/like-kind-exchanges-real-estate-tax-tips,
"Page Last Reviewed or Updated: 01-May-2026". Read 2026-09-07. Quote: "An exchange of real property
held primarily for sale still does not qualify as a like-kind exchange."

**The only IRS time test, a safe harbor for a unit with personal use.** Source: Rev. Proc. 2008-16,
Internal Revenue Bulletin 2008-10, March 10, 2008, https://www.irs.gov/irb/2008-10_IRB. Downloaded
with curl, read 2026-09-07. Summary line, quote: "This procedure provides a safe harbor under which
the Service will not challenge whether a property that is rented to others but also occasionally
used by the owners for personal purposes qualifies as property that may be exchanged in a
like-kind exchange under section 1031 of the Code." Relinquished property, quote: "(a) The dwelling
unit is owned by the taxpayer for at least 24 months immediately before the exchange (the
'qualifying use period'); and (b) Within the qualifying use period, in each of the two 12-month
periods immediately preceding the exchange, (i) The taxpayer rents the dwelling unit to another
person or persons at a fair rental for 14 days or more, and (ii) The period of the taxpayer's
personal use of the dwelling unit does not exceed the greater of 14 days or 10 percent of the number
of days during the 12-month period that the dwelling unit is rented at a fair rental." The
replacement property has the mirror rule: "owned by the taxpayer for at least 24 months immediately
after the exchange". A safe harbor is a set of facts the IRS will not challenge; a property outside
it is judged on its facts.

Site consistency, `/invest/strategies/1031-exchange/` (read 2026-09-07): states 45 and 180 days,
the three identification rules, the return-due-date cutoff, disaster-only extensions, the reverse
exchange, and "Residential rental buildings depreciate over 27.5 years". It states no holding
period, so nothing above contradicts it. Its story of the New York client who "sells it and trades
the money up" when "a property has used up its depreciation" is the site's example of a hold
decided by depreciation, and the hold page can point to it. The site's FAQ says "the IRS excludes
property held for sale from 1031 treatment", which matches 1031(a)(2).

`/sell/capital-gains/` says "the IRS taxes that part back at up to 25 percent" and
`/invest/rental-depreciation/` says "Depreciation taken on the building comes back at sale as gain
taxed at up to 25 percent" and "At sale the recapture is figured as if you had taken it every
year." Both match the sources. The depreciation page's land example is a 20 percent land share
(record shows land $50,000, building $200,000); section 4 uses the same 20 percent.

### 2d. Living in it first: the section 121 exclusion, and the rule for a former rental

Source: 26 U.S.C. 121, https://www.law.cornell.edu/uscode/text/26/121. Read 2026-09-07.

- (a), quote: "Gross income shall not include gain from the sale or exchange of property if, during
  the 5-year period ending on the date of the sale or exchange, such property has been owned and
  used by the taxpayer as the taxpayer's principal residence for periods aggregating 2 years or
  more."
- (b)(1), quote: "The amount of gain excluded from gross income under subsection (a) with respect
  to any sale or exchange shall not exceed $250,000." (b)(2)(A): $500,000 on a joint return.
- (b)(5)(A), quote: "Subsection (a) shall not apply to so much of the gain from the sale or
  exchange of property as is allocated to periods of nonqualified use." (B): allocated "based on
  the ratio which (i) the aggregate periods of nonqualified use during the period such property
  was owned by the taxpayer, bears to (ii) the period such property was owned by the taxpayer."
- (b)(5)(C)(i), quote: "The term 'period of nonqualified use' means any period (other than the
  portion of any period preceding January 1, 2009) during which the property is not used as the
  principal residence of the taxpayer or the taxpayer's spouse or former spouse."
- (b)(5)(C)(ii)(I), the exception that matters for a home rented after the owner moves out, quote:
  the term does not include "any portion of the 5-year period described in subsection (a) which is
  after the last date that such property is used as the principal residence of the taxpayer or the
  taxpayer's spouse".
- (d)(6), quote: "Subsection (a) shall not apply to so much of the gain from the sale of any
  property as does not exceed the portion of the depreciation adjustments (as defined in section
  1250(b)(3)) attributable to periods after May 6, 1997, in respect of such property."

Source: IRS Publication 523 (2025), Selling Your Home, "For use in preparing 2025 Returns",
https://www.irs.gov/publications/p523. Downloaded with curl, read 2026-09-07.

- Quote: "If you owned the home and used it as your residence for at least 24 months of the
  previous 5 years, you meet the residence requirement. The 24 months of residence can fall
  anywhere within the 5-year period, and it doesn't have to be a single block of time."
- Quote: "Gain from the sale or exchange of your main home isn't excludable from income if it is
  allocable to periods of nonqualified use. Nonqualified use means any period after 2008 when
  neither you nor your spouse (or former spouse) used the property as your main home, with certain
  exceptions." Quote: "A period of nonqualified use does not include: Any portion of the 5-year
  period ending on the date of the sale or exchange after the last date you or your spouse (or
  former spouse) used the property as your main home".
- Quote: "you can't exclude the part of your gain equal to any depreciation allowed or allowable as
  a deduction for periods after May 6, 1997."

Source: IRS Topic no. 701, Sale of your home, https://www.irs.gov/taxtopics/tc701, "Page Last
Reviewed or Updated: 08-Jun-2026". Read 2026-09-07. Quote: "If you and your spouse owned the home
and used it as a residence for at least 24 months (2 years) of the previous 5 years, you meet the
use test." Quote: "Generally, you're not eligible for the exclusion if you excluded the gain from
the sale of another home during the two-year period prior to the sale of your home."

What the two sequences do, from the sources:
1. Live in it 2 years, then rent it, sell within 3 years of moving out: the rental years are inside
   the 5-year window and after the last residential use, so they are **not** nonqualified use
   (121(b)(5)(C)(ii)(I)). The exclusion applies to the whole gain except the depreciation taken
   while it was rented (121(d)(6)). Rent it past the 3-year mark and the 2-of-5 test itself fails.
2. Rent it first (after 2008), then move in for 2 years, then sell: the rental years before the
   move-in are nonqualified use, and that share of the gain (rental years divided by total years
   owned) is taxed. Depreciation is taxed on top.

**Site defect to fix.** `/sell/rental-property/` (read 2026-09-07) says: "If you lived in it and
then rented it, the years it was a rental after 2008 are nonqualified use." That is the wrong
sequence. Under 121(b)(5)(C)(ii)(I) and Pub 523, rental years after the last residential use and
inside the 5-year window are excluded from nonqualified use; it is rental years **before** the
residential use that count. `/sell/capital-gains/` ("The window keeps working for up to three years
after you move away") is right. Do not copy the rental-property sentence onto the hold page.

---

## 3. Transaction costs that decide the break-even hold

### The deed recording fee (statute)

Source: S.C. Code Title 12, Chapter 24, https://www.scstatehouse.gov/code/t12c024.php. Downloaded
with curl, read 2026-09-07.

- 12-24-10(A), quote: "a recording fee is imposed for the privilege of recording a deed in which
  land and improvements on the land, tenements, or other realty is transferred to another person.
  The fee is one dollar eighty-five cents for each five hundred dollars, or fractional part of five
  hundred dollars, of the realty's value as determined by Section 12-24-30." HISTORY: "1996 Act No.
  458, Part II, SECTION 57A; 2006 Act No. 323, SECTION 1, eff June 2, 2006; 2008 Act No. 292,
  SECTION 1, eff June 11, 2008."
- 12-24-20(A), who pays, quote: "the fee imposed by this chapter is the liability of the grantor,
  or the joint and several liability of the grantors, but the grantee is secondarily liable for the
  payment of the fee."
- 12-24-30(A), value, quote: "'value' means the consideration paid or to be paid in money or money's
  worth for the realty". (B): "A deduction from value is allowed for the amount of any lien or
  encumbrance existing on the land, tenement, or realty before the transfer and remaining on the
  land, tenement, or realty after the transfer."
- 12-24-90(A), the split, quote: "(1) a state fee equal to one dollar thirty cents for each five
  hundred dollars, or fractional part of five hundred dollars, of the realty's value; and (2) a
  county fee equal to fifty-five cents for each five hundred dollars, or fractional part of five
  hundred dollars, of the realty's value."
- 12-24-40, exemptions, item (1): deeds "transferring realty in which the value of the realty, as
  defined in Section 12-24-30, is equal to or less than one hundred dollars"; (4): transfers with no
  gain or loss under IRC 1041; (8): transfers into an entity for stock, partnership interest or
  trust interest only.

Computed: $1.85 per $500 is 0.37 percent. On $342,010 (metro ZHVI) the fee is 685 units × $1.85 =
$1,267.25. On $300,000: $1,110 (matches the net-proceeds page). On $400,000: $1,480 (matches the
closing-costs page).

### Figures already established on the site (read 2026-09-07)

`/sell/net-proceeds/`:
- "Selling a South Carolina home has six main costs. The agent commission. Deed stamps, a state and
  county transfer fee of 1.85 dollars per 500 dollars of the price. The closing attorney's fee,
  because South Carolina requires an attorney to conduct closings. An owner's title policy. Any HOA
  transfer or estoppel fees. Whatever repairs or credits you agree to during the deal."
- Commission handling, verbatim, FAQ "Is the commission always 6 percent?": "No. Commissions are
  negotiable and vary by brokerage and by listing. The calculator on this page uses an editable
  example so you can model any rate." Calculator defaults in the HTML: price 350000, payoff 175000,
  `nsComm` value **6**, "Attorney, title & closing" `nsFees` value **1500**, HOA transfer 300.
- "Estimates for planning. Commission varies by listing."

`/buyers/closing-costs/`:
- "Buyers in South Carolina typically pay 2 to 5 percent of the price in closing costs and
  prepaids." "Sellers pay the commission they negotiated, the deed recording fee of $1.85 per $500 of
  price, deed preparation, their mortgage payoff, and any HOA document or transfer fees the contract
  assigns them."
- "Residential closing fees typically run $600 to $1,200, and the buyer customarily chooses and pays
  the closing attorney." "A typical schedule prices an owner's policy near $330 plus $2.10 per $1,000
  above $100,000, roughly $750 on a $300,000 purchase and $960 at $400,000". "Horry County's own
  recording charges are flat under its predictable-fee schedule: $15 for a deed, $25 for a
  mortgage." CL-100: "typically costs about $75 to $150".
- Seller-side calculator default `cc-comm` value **5.9**. Insurance default `cc-ins` **2,500**.

`/invest/index.html`: "Closing costs Roughly 2 to 3 percent". `/sell/capital-gains/` worked example
uses "6 percent selling costs" and calls it "a constructed example, not a client."

**Commission rule for the page:** the site states no commission figure as a fact. It states that
commissions are negotiable, and its two calculators carry editable examples of 6 and 5.9. The
model below is run at the site's two examples and at zero, so the page can say "at the example
rate in our net proceeds calculator" without asserting a rate.

### Computed buying costs used in section 4

- Financed buyer: 3 percent of price = **$10,260** on $342,010 (inside the site's 2 to 5 percent
  incl. prepaids; top of the hub's 2 to 3 percent).
- Cash buyer, from the site's line items: attorney $900 (midpoint of $600 to $1,200) + owner's title
  $838 ($330 + $2.10 × 242.01) + CL-100 $112.50 (midpoint) + deed recording $15 = **$1,866, 0.55
  percent** of price. No lender's policy, no loan fees, no escrow deposit.
- Selling costs: commission at the example rate × sale price + deed stamps ($1.85 per $500 of the
  sale price) + $1,500 (net-proceeds calculator default for attorney, title and closing).

---

## 4. Break-even models

### 4.1 Formula

Let P = price, b = buying costs as a share of P, c = commission share, d = deed stamps ($1.85 per
$500 of the sale price, 0.37 percent), F = fixed seller closing costs ($1,500), g = annual
appreciation, n = years held. Sale value V = P(1+g)^n. Net from sale = V(1 − c − d) − F.

Break-even without a loan: V(1 − c − d) − F ≥ P(1 + b). Solving for the price rise needed:
**(1+g)^n ≥ (1 + b + F/P) / (1 − c − d)**, so n = ln[(1 + b + F/P)/(1 − c − d)] / ln(1+g).

Break-even with a loan: add the principal repaid by year n, because the payoff at sale is smaller
by that amount. Principal repaid on a fully amortizing 30-year loan of L after m months at monthly
rate r is L × [(1+r)^m − 1] / [(1+r)^360 − 1]. The rate is not stated anywhere in this file (site
rule); the model runs the whole span of 30-year fixed rates seen since 2006 and reports the low and
high result. Loan size in the model: 75 percent of price (the DSCR page's 15 to 25 percent down).
**The hold page may not state that percentage** (build.js DOWN_PAYMENT_OK_PAGES); write "a typical
investor loan". Cash flow after the loan payment is assumed to be zero (rent covers the loan and
the costs and nothing more), so no payment amount is needed; a page sentence can say so.

Inputs: P = $342,010 (metro ZHVI, July 2026). Buying costs: financed 3 percent; cash $1,866.
Selling: commission 6.0 percent (net-proceeds example) or 5.9 percent (closing-costs example) or
none; stamps 0.37 percent; F = $1,500. Appreciation: 0, 3, 5 percent, and the metro's own 20-, 15-
and 10-year annualized rates (1.94, 5.18, 6.08 percent).

### 4.2 Price rise needed to get the money back (no loan, no cash flow)

| Buyer | Commission | Total price rise needed |
|---|---|---|
| Financed (3% buying costs) | 6.0% | **+10.5%** |
| Financed | 5.9% | +10.4% |
| Financed | none | +3.8% |
| Cash (0.55% buying costs) | 6.0% | **+7.9%** |
| Cash | 5.9% | +7.7% |
| Cash | none | +1.4% |

### 4.3 Years to break even

"never" means not within 50 years. The "with paydown" column is the range across the rate span
(fastest amortization to slowest).

| Appreciation a year | Buyer | Commission | No loan paydown | With paydown, 75% loan |
|---|---|---|---|---|
| 0% | financed | 6.0% | never | 5.5 to 10.5 |
| 0% | financed | 5.9% | never | 5.4 to 10.4 |
| 0% | financed | none | never | 2.2 to 5.2 |
| 0% | cash | 6.0% | never | no loan |
| 0% | cash | none | never | no loan |
| 3% | financed | 6.0% | 3.4 | 2.2 to 2.8 |
| 3% | financed | none | 1.3 | 0.8 to 1.1 |
| 3% | cash | 6.0% | 2.6 | no loan |
| 3% | cash | none | 0.5 | no loan |
| 5% | financed | 6.0% | 2.1 | 1.6 to 1.8 |
| 5% | financed | none | 0.8 | 0.6 to 0.8 |
| 5% | cash | 6.0% | 1.6 | no loan |
| 5% | cash | none | 0.3 | no loan |
| 1.94% (metro, 20-year actual) | financed | 6.0% | 5.2 | 2.8 to 3.8 |
| 1.94% | cash | 6.0% | 4.0 | no loan |
| 5.18% (metro, 15-year actual) | financed | 6.0% | 2.0 | 1.5 to 1.8 |
| 5.18% | cash | 6.0% | 1.5 | no loan |
| 6.08% (metro, 10-year actual) | financed | 6.0% | 1.8 | 1.3 to 1.6 |
| 6.08% | cash | 6.0% | 1.3 | no loan |

The 5.9 percent rows differ from the 6.0 rows by at most 0.1 year; the CSV has all of them.

### 4.4 Principal repaid on a 30-year loan (no rates stated)

Low and high across the span of 30-year fixed rates seen since 2006. On a $256,508 loan (75 percent
of $342,010) multiply the per-$100,000 figure by 2.565.

| Years | Share of the loan repaid | Per $100,000 borrowed |
|---|---|---|
| 1 | 0.8% to 2.3% | $835 to $2,267 |
| 2 | 1.7% to 4.6% | $1,740 to $4,592 |
| 3 | 2.7% to 7.0% | $2,720 to $6,975 |
| 5 | 4.9% to 11.9% | $4,930 to $11,925 |
| 7 | 7.5% to 17.1% | $7,523 to $17,127 |
| 10 | 12.3% to 25.4% | $12,275 to $25,435 |
| 15 | 23.2% to 40.7% | $23,218 to $40,743 |
| 20 | 39.5% to 58.1% | $39,522 to $58,086 |

A higher rate repays less principal early. Full table to 30 years in hold-amortization-share.csv.

### 4.5 History against the cost thresholds (metro ZHVI rolling windows)

Share of all n-year windows since November 2001 whose price change reached the threshold in 4.2.
Overlapping windows, one bust, so a count, not a forecast.

| Hold | Any gain | ≥ +3.8% (financed, no commission) | ≥ +7.9% (cash, 6%) | ≥ +10.5% (financed, 6%) |
|---|---|---|---|---|
| 1 year | 73% | 49% | 21% | 19% |
| 2 years | 74% | 68% | 55% | 37% |
| 3 years | 73% | 71% | 68% | 67% |
| 4 years | 76% | 73% | 71% | 69% |
| 5 years | 75% | 72% | 70% | 68% |
| 6 years | 74% | 71% | 68% | 67% |
| 7 years | 71% | 69% | 65% | 63% |
| 8 years | 71% | 68% | 62% | 60% |
| 10 years | 75% | 72% | 69% | 64% |
| 12 years | 79% | 75% | 73% | 71% |
| 15 years | 100% | 100% | 100% | 100% |

Reading: in this market's history the selling costs, not the market, decided the first two years;
from year three on, the windows that failed are almost all the ones that started in 2005-2008.

### 4.6 All-cash investor: reinvesting cash flow for 10 years

Assumptions, every one from the site or from section 1:
- One house bought for cash at P = $342,010 plus $1,866 buying costs.
- Rent: HUD FY2027 fair market rent, 3 bedrooms, $1,823 a month (rent page). Sensitivity: Zillow
  metro asking rent $1,714 (rent page).
- Costs: property tax at the 6 percent ratio, unincorporated Horry County, $4,820 per $400,000
  (property-tax page, tax year 2025), so 1.205 percent of value = $4,121; landlord insurance $2,500
  (closing-costs calculator default; landlord-insurance page range $1,700 to $4,400); management 10
  percent of rent (long-term-rental page: "8 to 10 percent of collected rent plus a leasing fee",
  leasing fee not modeled); vacancy and maintenance 8 percent (long-term-rental page: "Use 5 to 8
  percent for a long-term rental as a planning number"). No HOA.
- Result: gross $21,876; costs $10,559 (48 percent of rent); **net operating income $11,317, 3.31
  percent of price** (3.29 percent of price plus buying costs). At $1,714 rent: NOI $10,245, 3.00
  percent.
- The long-term-rental page says "As of mid-2026, Grand Strand long-term rentals commonly pencil
  out in the 5 to 7 percent cap range." That range is not reachable at the metro-typical price with
  the metro rent and the site's own cost inputs; it needs a cheaper house or a higher rent-to-price
  than the medians (the zip yields in 4.7 run 1.7 to 4.6 percent before any loan). Case B below runs
  the site's midpoint, 6 percent, so the page can show both.
- Rents, costs and prices all grow at g (0 percent, then 3 percent), so the yield stays constant.
  Pre-tax. Cash flow is saved; a second house is bought the year saved cash reaches that year's
  price plus buying costs.

Case A, site cost inputs, yield 3.31 percent:

| Year | Price | Houses | NOI, g = 0% | Cash saved | Equity (value + cash) | vs start | NOI, g = 3% | Cash saved | Equity | vs start |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 342,010 / 352,271 | 1 | 11,317 | 11,317 | 353,328 | +2.7% | 11,657 | 11,657 | 363,927 | +5.8% |
| 2 | | 1 | 11,317 | 22,634 | 364,645 | +6.0% | 12,006 | 23,663 | 386,502 | +12.4% |
| 3 | | 1 | 11,317 | 33,951 | 375,962 | +9.3% | 12,366 | 36,029 | 409,753 | +19.2% |
| 4 | | 1 | 11,317 | 45,268 | 387,279 | +12.6% | 12,737 | 48,767 | 433,703 | +26.1% |
| 5 | | 1 | 11,317 | 56,585 | 398,596 | +15.9% | 13,120 | 61,887 | 458,370 | +33.3% |
| 6 | | 1 | 11,317 | 67,903 | 409,913 | +19.2% | 13,513 | 75,400 | 483,778 | +40.7% |
| 7 | | 1 | 11,317 | 79,220 | 421,230 | +22.5% | 13,919 | 89,318 | 509,948 | +48.3% |
| 8 | | 1 | 11,317 | 90,537 | 432,547 | +25.8% | 14,336 | 103,654 | 536,903 | +56.1% |
| 9 | | 1 | 11,317 | 101,854 | 443,864 | +29.1% | 14,766 | 118,421 | 564,667 | +64.2% |
| 10 | 342,010 / 459,633 | 1 | 11,317 | 113,171 | 455,181 | +32.4% | 15,209 | 133,630 | 593,263 | +72.5% |

Case B, the site's stated 6 percent cap midpoint (NOI $20,521 in year 1):

| Year | Houses | NOI, g = 0% | Cash saved | Equity | vs start | NOI, g = 3% | Cash saved | Equity | vs start |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 20,521 | 20,521 | 362,531 | +5.4% | 21,136 | 21,136 | 373,407 | +8.6% |
| 2 | 1 | 20,521 | 41,041 | 383,052 | +11.4% | 21,770 | 42,907 | 405,746 | +18.0% |
| 3 | 1 | 20,521 | 61,562 | 403,572 | +17.4% | 22,423 | 65,330 | 439,054 | +27.7% |
| 4 | 1 | 20,521 | 82,083 | 424,093 | +23.3% | 23,096 | 88,426 | 473,362 | +37.7% |
| 5 | 1 | 20,521 | 102,603 | 444,614 | +29.3% | 23,789 | 112,215 | 508,699 | +47.9% |
| 6 | 1 | 20,521 | 123,124 | 465,134 | +35.3% | 24,503 | 136,718 | 545,096 | +58.5% |
| 7 | 1 | 20,521 | 143,644 | 485,655 | +41.2% | 25,238 | 161,956 | 582,585 | +69.4% |
| 8 | 1 | 20,521 | 164,165 | 506,176 | +47.2% | 25,995 | 187,951 | 621,199 | +80.6% |
| 9 | 1 | 20,521 | 184,686 | 526,696 | +53.2% | 26,775 | 214,725 | 660,971 | +92.2% |
| 10 | 1 | 20,521 | 205,206 | 547,217 | +59.1% | 27,578 | 242,303 | 701,937 | +104.1% |

Finding: **one metro-typical house does not fund a second one from cash flow inside ten years in
any of the four runs.** At 3.31 percent it takes about 30 years of saved cash flow at flat prices
(342,010 / 11,317); at 6 percent about 17 years. Growth for an all-cash owner comes from the price
and the saved rent, not from house count.

### 4.7 Selling one house to buy two

**Same-price houses: selling never helps.** To own two $342,010 houses, the keep route needs
$343,876 of new cash (one house plus buying costs). The sell route nets $318,723 from the sale (6
percent commission, stamps, $1,500) and needs $369,030 of new cash for two houses. The sale route
needs **$25,154 more cash**, which is exactly the selling costs ($23,288) plus the buying costs on
the replacement ($1,866). Without a loan there is no reason to sell a house to buy two of the same
kind.

**A real trade-down: one expensive low-yield house for two cheaper higher-yield houses.** Inputs
from section 1 and the site's cost lines (tax 1.205 percent of value, insurance $2,500, 18 percent
of rent for management, vacancy and maintenance; rents are HUD FY2026 small-area FMRs, 3 bedrooms,
by zip). Sold through a 1031 so no tax is due at the trade (section 2c).

| House sold (value) | Bought | Net from sale | Cost of the two, incl. buying costs | Cash gap | NOI before | NOI after | Gain a year | Transaction costs | Payback |
|---|---|---|---|---|---|---|---|---|---|
| Pawleys Island 29585 ($550,277; NOI 1.72%) | 2 × Loris 29569 ($254,720) | $513,723 | $512,805 | +$918 left over | $9,467 | $20,349 | $10,882 | $39,918 | **3.7 years** |
| Pawleys Island 29585 | 2 × Conway west 29527 ($263,160) | $513,723 | $529,721 | $15,998 needed | $9,467 | $20,146 | $10,679 | $39,954 | 3.7 years |
| Murrells Inlet / Garden City 29576 ($401,110; 3.23%) | 2 × Loris | $374,058 | $512,805 | $138,747 needed | $12,937 | $20,349 | $7,412 | $30,417 | 4.1 years |
| North Myrtle Beach 29582 ($400,143; 2.87%) | 2 × Loris | $373,153 | $512,805 | $139,652 needed | $11,473 | $20,349 | $8,877 | $30,355 | 3.4 years |

Only the Pawleys Island sale funds two houses without new cash. Ten-year table for that trade,
cash flow saved, pre-tax, rents and prices growing at g (Pawleys and Loris grew 6.6 and 7.3 percent
a year over the last ten years, so equal growth is a fair simplification):

| Year | Keep: value | Keep: cash saved | Keep: total | Trade: value of two | Trade: cash saved | Trade: total | Trade minus keep |
|---|---|---|---|---|---|---|---|
| g = 0% | | | | | | | |
| 1 | 550,277 | 9,467 | 559,744 | 509,440 | 21,267 | 530,708 | -29,036 |
| 2 | 550,277 | 18,934 | 569,210 | 509,440 | 41,617 | 551,057 | -18,153 |
| 3 | 550,277 | 28,400 | 578,677 | 509,440 | 61,966 | 571,406 | -7,271 |
| 4 | 550,277 | 37,867 | 588,144 | 509,440 | 82,315 | 591,755 | +3,612 |
| 5 | 550,277 | 47,334 | 597,611 | 509,440 | 102,664 | 612,105 | +14,494 |
| 7 | 550,277 | 66,267 | 616,544 | 509,440 | 143,363 | 652,803 | +36,259 |
| 10 | 550,277 | 94,668 | 644,944 | 509,440 | 204,411 | 713,851 | +68,907 |
| g = 3% | | | | | | | |
| 1 | 566,785 | 9,826 | 576,611 | 524,723 | 22,028 | 546,751 | -29,859 |
| 3 | 601,302 | 30,598 | 631,900 | 556,679 | 66,621 | 623,300 | -8,600 |
| 4 | 619,341 | 41,566 | 660,908 | 573,379 | 90,152 | 663,531 | +2,623 |
| 5 | 637,922 | 52,939 | 690,861 | 590,581 | 114,538 | 705,119 | +14,258 |
| 7 | 676,771 | 76,946 | 753,717 | 626,547 | 165,983 | 792,530 | +38,814 |
| 10 | 739,526 | 116,301 | 855,827 | 684,645 | 250,237 | 934,882 | +79,055 |

The trade is behind for three years (the $39,918 of costs) and ahead from year four. Full table in
hold-keep-vs-trade-10yr.csv. Simplifications to state on the page: one county's tax rate applied to
both (Pawleys is Georgetown County); HUD's 3-bedroom rent used for both (Pawleys rents in the zip
data are close to the HUD figure: ZORI $1,926); management and repairs double with two houses and
are modeled as a share of rent.

**If it is not a 1031.** Recapture illustration on the $342,010 metro house, 20 percent land share
(the depreciation page's example ratio): building $273,608, $9,949 a year over 27.5 years, $99,494
after ten years, taxed at up to 25 percent = **up to $24,873** at sale, before tax on any price gain
and before the state's share. On the Pawleys trade that tax would sit on top of the $39,918 and
push the payback past year five.

---

## 5. Published research on holding periods

1. Cheng, Ping; Lin, Zhenguo; Liu, Yingchun. "Illiquidity, transaction cost, and optimal holding
   period for real estate: Theory and application." Journal of Housing Economics, vol. 19, no. 2,
   June 2010, pp. 109-118. Abstract read at https://ideas.repec.org/a/eee/jhouse/v19y2010i2p109-118.html
   on 2026-09-07 (ScienceDirect returned 403). From the abstract: "the optimal holding period is
   affected by both systematic and non-systematic factors"; higher illiquidity and transaction
   costs lengthen the optimal holding period, higher return volatility shortens it; and
   incorporating illiquidity "real estate risk is significantly higher than the conventional risk
   estimate." No single number.
2. Collett, David; Lizieri, Colin; Ward, Charles. "Timing and the Holding Periods of Institutional
   Real Estate." Real Estate Economics, vol. 31, no. 2, June 2003, pp. 205-222. Published abstract
   read at https://ideas.repec.org/a/bla/reesec/v31y2003i2p205-222.html on 2026-09-07, quote:
   "Literature on investors' holding periods for securities suggests that high transaction costs
   are associated with longer holding periods. Return volatility, by contrast, is associated with
   shorter holding periods." The working-paper version (University of Reading, March 2000,
   https://centaur.reading.ac.uk/27215/1/0300.pdf, read 2026-09-07), UK Investment Property
   Databank 1981-1994, quote: "The baseline hazard function reveals that the median holding period
   varies between eight and twelve years." Quote: "small offices have the shortest average holding
   period (10 years) followed by industrial units (11 years). The other sectors have median holding
   periods of around 12 years". Commercial property, UK institutions, not houses.
3. Barthélémy, Fabrice; Prigent, Jean-Luc. "Real Estate Portfolio Management: Optimization under
   Risk Aversion." Thema Working Paper 2011-12, Université de Cergy-Pontoise, June 2011,
   https://thema.u-cergy.fr/IMG/documents/2011-12.pdf, read 2026-09-07. Its literature review is
   the only place the small-residential number was read: quote: "Brown and Geurts (2005) deal with
   small residential investment. Through a sample of apartment buildings of between 5 and 20 units
   over the period 1970-1990 in the city of San Diego, they find empirically how long an investor
   must own an apartment building. The average holding period is around five years." Quote: "It
   means that investors sell property sooner when values rise faster than rent." Quote: "Gau and
   Wang (1994) or Fisher and Young (2000) show that, for the US, the holding durations depend
   mainly on tax laws." Footnote on Collett et al., quote: "Using the database of properties
   provided by IPD in the UK over an 18-year period, their empirical analysis shows that the median
   holding period is about seven years." (The published 2003 paper's own number; the 2000 working
   paper read here says eight to twelve.)
4. Amédée-Manesme, Charles-Olivier; Barthélémy, Fabrice; Prigent, Jean-Luc. "Real estate
   investment: Market volatility and optimal holding period under risk aversion." Economic
   Modelling, vol. 58, 2016, pp. 543-555. Abstract read at
   https://ideas.repec.org/a/eee/ecmode/v58y2016icp543-555.html on 2026-09-07: "the determination
   of the optimal time to sell a diversified real estate portfolio"; "the introduction of risk
   aversion allows to better account for the real estate market volatility". No single number.
5. National Association of Realtors, "Top 10 Takeaways from NAR's 2025 Profile of Home Buyers and
   Sellers", Jessica Lautz, November 3, 2025,
   https://www.nar.realtor/blogs/economists-outlook/top-10-takeaways-from-nars-2025-profile-of-home-buyers-and-sellers,
   read 2026-09-07 with WebFetch. Quote: "Home sellers have now owned their home for a median of 11
   years before selling. This is an all-time high." Owner-occupied homes, not rentals; the article
   attributes it to "the lock-in effect of low-interest-rate mortgages".

Summary for the page: no published study gives an optimal holding period for a single rental house.
The theory papers agree on direction: higher transaction costs and illiquidity lengthen the right
hold, higher price volatility shortens it. The empirical numbers are about five years for small San
Diego apartment buildings (1970-1990), seven to twelve years for UK institutional commercial
property, and eleven years for US home sellers in 2025.

---

## Could not verify

- **Zillow's own definition of ZHVI** (the "typical value for homes in the 35th to 65th percentile
  range", smoothed, seasonally adjusted wording). zillow.com/research/data/ and the methodology
  page returned HTTP 403 to curl and WebFetch; web.archive.org is blocked. The file name carries
  "tier_0.33_0.67_sm_sa". Describe the index from the file name only, or cite Zillow without the
  percentile sentence.
- Which counties Zillow's "Myrtle Beach, SC" metro (RegionID 394898) includes. The City file's
  label is "Myrtle Beach-Conway-North Myrtle Beach, SC-NC", so it may include Brunswick County, NC.
- A Zillow value for **Garden City** or **Carolina Forest** as places. Neither is in the City or
  Neighborhood file. Zip 29576 (Murrells Inlet plus Garden City Beach) and zip 29579 (Carolina
  Forest and the surrounding 501 corridor) are stand-ins and must be labeled as zips.
- Brown and Geurts (2005), Gau and Wang (1994), Fisher and Young (2000): not opened. Their findings
  are quoted only as summarized by Barthélémy and Prigent (2011). The published Collett et al.
  (2003) "about seven years" figure likewise comes from that paper's footnote and a search
  summary, not from the journal text; the March 2000 working paper read here says eight to twelve.
- Any DSCR lender's seasoning rule other than Easy Street Capital's. A search result attributed a
  90-day rule to Kiavi, but the kiavi.com page tried returned 404 and no Kiavi page was read.
- A Fannie Mae "last updated" date for B2-1.3-03; the page shows only its related announcements
  (latest SEL-2025-10, December 10, 2025).
- Self-employment tax on flip income. Not researched at a primary source; do not state it.
- The site's "5 to 7 percent cap range" (long-term-rental page). Not reproducible from the metro
  ZHVI, the metro rents and the site's own cost inputs (3.0 to 3.3 percent), nor from any zip's ZHVI
  with its HUD or Zillow rent (1.7 to 4.6 percent before a loan). It may describe what investors
  actually buy (below-median houses, above-median rent to price) but no primary source for it was
  found. The hold page should not restate a cap range; link to the returns page.
- Property tax by location in the models. The unincorporated-Horry figure ($4,820 per $400,000) was
  applied to every zip, including Pawleys Island in Georgetown County and the city-of-Myrtle-Beach
  zips, where the site's own calculator uses higher millage ($6,110 per $400,000 in the city).
- HUD FY2027 small-area FMRs (404). FY2026 small-area rents were used by zip; FY2027 metro FMRs were
  read and match the rent page.
- The span of 30-year fixed rates used for the amortization envelope was not checked against
  Freddie Mac's survey; the rates cannot appear on the page in any case, and the envelope
  (2.5 to 8 percent, step 0.25) is wide enough to contain every monthly average since 2006.
- Leasing fees, turnover costs, capital items (roof, HVAC), income tax on the cash flow and the
  state's tax on the gain are not in the models. The site's capital-gains page has the state layer.

## What will go stale

- Zillow refreshes ZHVI and ZORI monthly, around the middle of the month (these files were
  modified 2026-08-16). Re-download before publishing; the August 2026 release lands about
  2026-09-16 and changes every number in section 1.
- HUD FY2028 FMRs and small-area FMRs, late 2027.
- IRS Pubs 523, 527, 544, 550 are the 2025 editions; 2026 editions appear early 2027. Topic 409
  (25-Feb-2026), Topic 701 (08-Jun-2026) and the like-kind tips page (01-May-2026) carry review
  dates.
- Fannie Mae Selling Guide B2-1.3-03: re-open before publishing; the six-month title rule changed
  in the past through announcements listed on the page.
- Easy Street Capital's seasoning tiers (page dated August 7, 2025).
- NAR's Profile is annual (November).
- The site's own figures used as inputs: net-proceeds and closing-costs calculator defaults, the
  $4,820 / $6,110 tax examples (tax year 2025 millage), the $1,700 to $4,400 insurance range.

## Questions only the brokerage can answer

- What hold Tim or the agents actually tell investors, and one real, attributable example of a sale
  timed to depreciation running out (the 1031 page's New York client is the closest published one).
- Whether the brokerage has seen the delayed-financing exception used here, and how long its
  lending partner's no-seasoning refinance really takes from purchase to cash back.
- A real commission the page may cite as an example, if the owner wants one stated; the site
  currently states none as a fact.
