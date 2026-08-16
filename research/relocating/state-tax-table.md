# State tax data table — relocating-to-Myrtle-Beach pages and cost-of-living calculator

Research date: 2026-08-16. Research only. No page copy here.
Scope: SC (destination) + NY, NC, OH, NJ, PA, MD, VA, CT, MA, MI, IL, TX, FL, GA, CA, DC.

Confidence scale: HIGH = quoted from a primary or Tax Foundation source page opened today. MEDIUM = confirmed on a reputable secondary source or paraphrased. UNVERIFIED = could not open the source; needs a human check before use.

Rules applied: every figure was opened at the source. Year of each figure stated. Publication date of each table stated. Anything not verified is marked UNVERIFIED.

Machine-readable companion: data/relocating/state-tax.json

---

## 0. Master sources (opened 2026-08-16)

### 0.1 Tax Foundation — State Individual Income Tax Rates and Brackets, 2026
- URL: https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
- Published: February 17, 2026. Authors: Janelle Fritts, Katherine Loughead. Table is "as of January 1, 2026".
- Notes quoted:
  - South Carolina: "South Carolina's FY 2026 budget, enacted in June of 2025, included a provision to temporarily reduce the state's top marginal individual income tax rate from 6.2 to 6 percent from July 1, 2025, through June 30, 2026." Footnote (qq): "South Carolina's top marginal rate is scheduled to revert to 6.2% on July 1, 2026." Footnote (vv): "State conforms to a pre-OBBBA version of the federal standard deduction, which in inflation-adjusted terms is $8,350 (single filers) and $16,700 (MFJ) for 2026." (Both superseded by H.4216, signed March 30, 2026 — see SC section.)
  - North Carolina: "North Carolina previously enacted a law to gradually reduce its individual income tax rate to a flat 3.99 percent. On January 1, 2026, the final step in that phasedown occurred, with the rate decreasing from 4.25 percent to 3.99 percent."
  - Ohio: "On January 1, 2026, the individual income tax moved to a flat rate of 2.75 percent for all nonbusiness income over $26,050. While the law reduced the overall tax rate, it tightened eligibility for certain credits and exemptions."
  - Georgia: "Building on the tax cut triggers enacted by H.B. 1015 of 2024, HB 111—enacted in April of 2025—accelerated these tax cuts, reducing the income tax rate from 5.39 percent to 5.19 percent, retroactive to January 1, 2025."
  - Footnote (a): local income taxes excluded (average effective local rates: MD 2.51%, NY 1.68%, OH 1.49%, PA 1.07%, MI 0.18%).
  - Footnote (i): "Connecticut and New York have 'tax benefit recapture,' by which many high-income taxpayers pay their top tax rate on all income, not just on amounts above the benefit threshold."

2026 rate schedules as printed (single | MFJ; std deduction single/MFJ; personal exemption; dependent exemption):

| State | Single brackets | MFJ brackets | Std ded S / MFJ | Pers. exempt S / MFJ | Dep. |
|---|---|---|---|---|---|
| SC (as printed Jan 1; superseded by H.4216 — see §1) | 0% > $0; 3% > $3,640; 6.00% > $18,230 | same as single | $8,350 / $16,700 (vv) | n.a. | $4,930 |
| NY | 3.90% > $0; 4.40% > $8,500; 5.15% > $11,700; 5.40% > $13,900; 5.90% > $80,650; 6.85% > $215,400; 9.65% > $1,077,550; 10.30% > $5,000,000; 10.90% > $25,000,000 | 3.90% > $0; 4.40% > $17,150; 5.15% > $23,600; 5.40% > $27,900; 5.90% > $161,550; 6.85% > $323,200; 9.65% > $2,155,350; 10.30% > $5,000,000; 10.90% > $25,000,000 | $8,000 / $16,050 | n.a. | $1,000 |
| NC | 3.99% > $0 | same | $12,750 / $25,500 | n.a. | n.a. |
| OH | 2.75% > $26,050 (0% below) | same | n.a. | $2,400 / $4,800 (dd: $2,150 if AGI $40k–$80k; $1,900 above $80k) | $2,400 |
| NJ | 1.40% > $0; 1.75% > $20,000; 3.50% > $35,000; 5.525% > $40,000; 6.37% > $75,000; 8.97% > $500,000; 10.75% > $1,000,000 | 1.40% > $0; 1.75% > $20,000; 2.45% > $50,000; 3.50% > $70,000; 5.525% > $80,000; 6.37% > $150,000; 8.97% > $500,000; 10.75% > $1,000,000 | n.a. | $1,000 / $2,000 | $1,500 |
| PA | 3.07% > $0 | same | n.a. | n.a. | n.a. |
| MD | 2% > $0; 3% > $1,000; 4% > $2,000; 4.75% > $3,000; 5% > $100,000; 5.25% > $125,000; 5.50% > $150,000; 5.75% > $250,000; 6.25% > $500,000; 6.50% > $1,000,000 | 2% > $0; 3% > $1,000; 4% > $2,000; 4.75% > $3,000; 5% > $150,000; 5.25% > $175,000; 5.50% > $225,000; 5.75% > $300,000; 6.25% > $600,000; 6.50% > $1,200,000 | $3,350 / $6,700 | $3,200 / $6,400 (phases out $100k–$150k S / $150k–$200k MFJ) | $3,200 |
| VA | 2% > $0; 3% > $3,000; 5% > $5,000; 5.75% > $17,000 | same | $8,750 / $17,500 | $930 / $1,860 | $930 |
| CT | 2% > $0; 4.5% > $10,000; 5.5% > $50,000; 6% > $100,000; 6.5% > $200,000; 6.9% > $250,000; 6.99% > $500,000 | 2% > $0; 4.5% > $20,000; 5.5% > $100,000; 6% > $200,000; 6.5% > $400,000; 6.9% > $500,000; 6.99% > $1,000,000 | n.a. | $15,000 / $24,000 (phases out) | $0 |
| MA | 5% > $0; 9% > $1,083,150 | same | n.a. | $4,400 / $8,800 | $1,000 |
| MI | 4.25% > $0 | same | n.a. | $5,900 / $11,800 | $5,900 |
| IL | 4.95% > $0 | same | n.a. | $2,925 / $5,850 | $2,925 |
| TX | none | none | — | — | — |
| FL | none | none | — | — | — |
| GA | 5.19% > $0 (see GA section for 2026 rate) | same | $12,000 / $24,000 | n.a. | $4,000 |
| CA | 1% > $0; 2% > $11,079; 4% > $26,264; 6% > $41,452; 8% > $57,542; 9.3% > $72,724; 10.3% > $371,479; 11.3% > $445,771; 12.3% > $742,953; 13.3% > $1,000,000 (incl. 1% mental health tax) | 1% > $0; 2% > $22,158; 4% > $52,528; 6% > $82,904; 8% > $115,084; 9.3% > $145,448; 10.3% > $742,958; 11.3% > $891,542; 12.3% > $1,000,000; 13.3% > $1,485,906 | $5,540 / $11,080 | $153 credit / $306 credit | $153 credit |
| DC | 4% > $0; 6% > $10,000; 6.5% > $40,000; 8.5% > $60,000; 9.25% > $250,000; 9.75% > $500,000; 10.75% > $1,000,000 | same | $16,100 / $32,200 | n.a. | n.a. |

Confidence: HIGH for the table (opened 2026-08-16). SC row is superseded by Act 110 (H.4216) for tax year 2026; see §1.

### 0.2 Tax Foundation — State and Local Sales Tax Rates, Midyear 2026
- URL: https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/
- Published July 6, 2026, author Abir Mandal. Rates as of July 1, 2026. Population-weighted average local rates.
- Footnotes quoted: "Three states levy mandatory, statewide, local add-on sales taxes at the state level: California (1.25%), Utah (1.25%), and Virginia (1%). We include these in their state sales tax." "Some cities in New Jersey are in 'Urban Enterprise Zones,' where qualifying sellers collect sales tax at half the statewide rate (3.3125 percent). This is reflected as a small negative adjustment to the average local rate."

| State | State rate | Avg local | Combined | Combined rank | Max local |
|---|---|---|---|---|---|
| SC | 6.00% | 1.49% | 7.49% | 19 | 3.00% |
| NY | 4.00% | 4.54% | 8.54% | 10 | 4.88% |
| NC | 4.75% | 2.35% | 7.10% | 22 | 3.50% |
| OH | 5.75% | 1.54% | 7.29% | 21 | 2.25% |
| NJ | 6.625% | -0.02% | 6.60% | 30 | 3.31% |
| PA | 6.00% | 0.34% | 6.34% | 34 | 2.00% |
| MD | 6.00% | 0.00% | 6.00% | 38 | 0.00% |
| VA | 5.30% (incl. 1% mandatory local) | 0.47% | 5.77% | 41 | 2.70% |
| CT | 6.35% | 0.00% | 6.35% | 33 | 0.00% |
| MA | 6.25% | 0.00% | 6.25% | 35 | 0.00% |
| MI | 6.00% | 0.00% | 6.00% | 38 | 0.00% |
| IL | 6.25% | 2.73% | 8.98% | 8 | 4.75% |
| TX | 6.25% | 1.95% | 8.20% | 14 | 2.00% |
| FL | 6.00% | 0.98% | 6.98% | 28 | 2.00% |
| GA | 4.00% | 3.56% | 7.56% | 18 | 5.00% |
| CA | 7.25% (incl. 1.25% mandatory local) | 1.78% | 9.03% | 7 | 5.25% |
| DC | 6.00% | 0.00% | 6.00% | (38) | 0.00% |

Confidence: HIGH (opened 2026-08-16).

### 0.3 Tax Foundation — Property Taxes by State and County, 2026
- URL: https://taxfoundation.org/data/all/state/property-taxes-by-state-county/
- Published March 16, 2026, author Janelle Fritts. Data year 2024 (ACS 5-year estimates 2020–2024). Effective rate = median real estate taxes paid / median owner-occupied home value.
- State table (effective rate on owner-occupied housing, 2024; rank of 50 states):

| State | Eff. rate 2024 | Eff. rate 2023 | Rank |
|---|---|---|---|
| NJ | 1.88% | 1.98% | 1 |
| IL | 1.88% | 1.91% | 2 |
| CT | 1.54% | 1.62% | 3 |
| TX | 1.40% | 1.47% | 7 |
| OH | 1.36% | 1.41% | 8 |
| NY | 1.30% | 1.31% | 11 |
| PA | 1.26% | 1.31% | 12 |
| MI | 1.19% | 1.23% | 14 |
| MA | 1.00% | 1.03% | 16 |
| MD | 0.92% | 0.95% | 21 |
| GA | 0.79% | 0.82% | 25 |
| FL | 0.78% | 0.80% | 27 |
| VA | 0.78% | 0.79% | 28 |
| CA | 0.70% | 0.70% | 32 |
| NC | 0.66% | 0.69% | 33 |
| DC | 0.60% | 0.60% | (listed, not ranked among the 50) |
| SC | 0.49% | 0.51% | 46 |

- County rows (median home value 2024, median property taxes paid 2024 5-yr, effective rate) pulled from the same page's county table (DataTables export, opened 2026-08-16):
  - SC: Horry County $287,700 / $944 / 0.38%; Charleston County $489,100 / $1,901 / 0.40%; Greenville County $299,000 / $1,512 / 0.51%; Richland County $242,800 / $1,637 / 0.64%; Georgetown County $289,500 / $1,190 / 0.41%.
  - NY: Nassau $684,700 / $10,000+ (ACS top-code) / 1.72%; Suffolk $578,400 / $10,000+ / 1.62%; Westchester $663,200 / $10,000+ / 1.84%; Rockland $596,900 / $10,000+ / 2.06%; Kings (Brooklyn) $905,000 / $6,382 / 0.56%; Queens $723,800 / $6,297 / 0.75%; New York (Manhattan) $1,090,500 / $10,000+ / 0.71%; Bronx $529,500 / $5,447 / 0.78%; Richmond (Staten Island) $675,500 / $6,247 / 0.88%.
  - NJ: Bergen $623,000 / $10,000+ / 1.89%; Morris $582,500 / $10,000+ / 1.84%; Monmouth $606,100 / $10,000+ / 1.53%; Middlesex $462,900 / $9,712 / 1.99%; Ocean $398,400 / $6,562 / 1.42%; Essex $524,100 / $10,000+ / 2.10%.
  - PA: Montgomery $436,700 / $5,875 / 1.29%; Bucks $445,700 / $5,826 / 1.20%; Chester $485,600 / $6,308 / 1.22%; Delaware $332,200 / $6,124 / 1.62%; Allegheny $227,600 / $3,451 / 1.47%; Philadelphia $243,100 / $2,003 / 0.85%.
  - OH: Cuyahoga $195,400 / $3,910 / 1.89%; Franklin $288,400 / $4,244 / 1.53%; Hamilton $241,900 / $3,652 / 1.51%.
  - NC: Mecklenburg $406,800 / $2,890 / 0.69%; Wake $461,300 / $3,260 / 0.69%.
  - MD: Montgomery $640,300 / $5,539 / 0.85%; Baltimore County $349,300 / $3,736 / 0.96%; Anne Arundel $467,900 / $3,957 / 0.80%; Howard $597,900 / $6,987 / 1.11%.
  - VA: Fairfax County $732,800 / $7,368 / 0.95%; Loudoun $743,800 / $6,325 / 0.80%; Prince William $530,100 / $4,999 / 0.85%; Virginia Beach city $382,500 / $3,061 / 0.78%.
  - CT (Census now uses planning regions, not counties): Western Connecticut Planning Region (Greenwich–Stamford–Danbury, most of old Fairfield County) $652,900 / $9,295 / 1.17%; Greater Bridgeport Planning Region $428,800 / $8,670 / 1.65%; Capitol Planning Region (Hartford) $323,700 / $6,454 / 1.91%; South Central (New Haven) $353,100 / $6,759 / 1.82%.
  - MA: Middlesex $727,800 / $7,501 / 1.01%; Norfolk $683,900 / $7,261 / 1.02%; Essex $619,100 / $6,430 / 1.02%; Worcester $423,700 / $5,438 / 1.25%.
  - MI: Oakland $343,600 / $4,371 / 1.25%; Wayne $178,500 / $2,904 / 1.47%; Macomb $243,900 / $3,404 / 1.23%.
  - IL: Cook $324,500 / $6,191 / 1.73%; DuPage $391,400 / $8,007 / 1.89%; Lake $345,700 / $8,923 / 2.26%.
  - TX: Harris $276,600 / $4,489 / 1.50%; Dallas $303,000 / $4,798 / 1.45%; Travis $523,000 / $7,727 / 1.31%; Collin $475,600 / $7,521 / 1.48%.
  - FL: Miami-Dade $463,000 / $3,744 / 0.81%; Palm Beach $447,300 / $3,858 / 0.82%; Broward $414,600 / $3,890 / 0.96%; Hillsborough $371,500 / $3,010 / 0.84%; Orange $390,100 / $2,967 / 0.82%.
  - GA: Fulton $458,800 / $4,033 / 0.89%; Gwinnett $380,900 / $3,617 / 0.93%; Cobb $407,200 / $2,720 / 0.69%.
  - CA: Los Angeles $834,200 / $5,675 / 0.67%; Orange $962,600 / $6,330 / 0.64%; San Diego $854,700 / $5,774 / 0.67%; Santa Clara $1,490,600 / $10,000+ / 0.68%.
  - DC: $737,100 / $4,312 / 0.60%.
- Caveat: ACS top-codes median real estate taxes at $10,000+, so Long Island / Westchester / Bergen / Morris medians are understated; the true medians are above $10,000. Confidence: HIGH for the figures as printed.

### 0.4 U.S. Census Bureau ACS 2024 1-year, table B25103 (median real estate taxes paid, owner-occupied units)
- URL: https://data.census.gov/table/ACSDT1Y2024.B25103?g=010XX00US$0400000 (data pulled 2026-08-16 through the data.census.gov API endpoint the table page itself calls)
- State median real estate taxes paid, 2024 (dollars): SC 1,337; NY 6,542; NC 2,044; OH 2,937; NJ 9,358; PA 3,214; MD 4,144; VA 2,872; CT 6,573; MA 6,080; MI 2,988; IL 5,399; TX 4,108; FL 2,993; GA 2,554; CA 5,369; DC 4,594.
- Confidence: HIGH. This is the 1-year 2024 estimate; Tax Foundation county figures above are 5-year estimates.

### 0.5 Tax Foundation — Gas Taxes by State, 2025
- URL: https://taxfoundation.org/data/all/state/gas-taxes-state/
- "Gas Taxes by State, 2025" by Adam Hoffer and Jacob Macumber-Rosin, published September 2, 2025, rates as of July 2025. Rate includes per-gallon excise plus other taxes and fees on gasoline. Federal excise: 18.4 cents per gallon.
- State totals (cents per gallon): SC 28.75; NY 24.87; NC 40.55; OH 38.50; NJ 44.95; PA 58.70; MD 46.19; VA 41.60; CT 25.00; MA 27.47; MI 48.20; IL 66.40; TX 20.00; FL 39.40; GA 33.85; CA 70.92; DC 35.30.
- Caveat: most recent Tax Foundation table found (2026 edition not yet published as of 2026-08-16). Several states index annually (NC, NJ, MD, MI, IL, CA, VA, FL, GA, DC, NY), so 2026 figures may differ by a cent or two. Confidence: HIGH for July 2025; MEDIUM as a 2026 figure.

### 0.6 Tax Foundation — Estate and Inheritance Taxes by State, 2025
- URL: https://taxfoundation.org/data/all/state/estate-inheritance-taxes/
- Loughead, Katherine, published October 28, 2025. "12 states and the District of Columbia impose estate taxes, while five states levy inheritance taxes." Maryland is the only state with both.
- Rows: CT estate exemption $13,990,000 (2025; conforms to federal, so $15,000,000 in 2026), 12%; MA $2,000,000, 0.8–16%; IL $4,000,000, 0.8–16%; MD estate $5,000,000, 0.8–16% + inheritance $1,000 exemption 0–10%; NY $7,160,000 (2025), 3.06–16%; DC $4,873,200 (2025), 11.2–16%; NJ inheritance only, $25,000 exemption, 0–16%; PA inheritance only, no exemption, 0–15%.
- "Confirmed absent from the table: South Carolina, North Carolina, Ohio, Virginia, Michigan, Texas, Florida, Georgia, and California have neither estate nor inheritance taxes."
- 2026 updates from Wealthspire "2026 Federal & State Estate and Gift Tax Cheat Sheet" (Feb 4, 2026, https://www.wealthspire.com/guides-whitepapers/federal-state-estate-gift-tax/): NY exemption $7,350,000 (2026), "subject to 'NYS cliff' for taxable estates exceeding 105% of exemption amount"; CT $15,000,000, 12%; DC $4,988,400 (2026); PA inheritance "4.5% for descendants, 12% for siblings, 15% for all others"; NJ inheritance "11-16% (depending on inheritor's relationship with decedent)" with $25,000 exemption (Class A — spouse, children, parents, grandchildren — fully exempt). Confidence: HIGH (Tax Foundation) / MEDIUM (Wealthspire 2026 numbers).

---

## 1. SOUTH CAROLINA (destination) — exhaustive

### 1.1 Income tax, tax year 2026 — H.4216 / Act 110 is law
- SC DOR page "Information about H. 4216", dated Wednesday, Apr 15, 2026, https://dor.sc.gov/news/information-about-h-4216. Quotes:
  - "Governor Henry McMaster signed H. 4216 into law on March 30, 2026."
  - "The tax rate for income less than $30,000 is 1.99%."
  - "The tax rate for income from $30,000 and above is 5.21%, minus $966."
  - "H. 4216 is effective beginning with the 2026 tax year, with returns due April 15, 2027."
  - SCIAD (South Carolina Income Adjusted Deduction): "$15,000 for taxpayers who file as single or married filing separately"; "$22,500 for taxpayers who file as head of household"; "$30,000 for taxpayers who file as married filing jointly or as a surviving spouse"; "These amounts may be reduced based on income as described in the bill."
  - "Decouples South Carolina from federal standard and itemized deductions. Federal Adjusted Gross Income (AGI) is now the starting point."
  - "Limits South Carolina's Earned Income Tax Credit (EITC) to $200."
  - Trigger: "The top Individual Income Tax rate will be further reduced if the Board of Economic Advisors (BEA) projects that revenue collections will increase by 5% or greater from the previous fiscal year," capped at $200 million of revenue reduction per year; BEA determination by February 15 each year.
- Bill page https://www.scstatehouse.gov/sess126_2025-2026/bills/4216.htm (opened 2026-08-16): House passed 3rd reading May 7, 2025 (64-47); Senate passed Feb 24, 2026 (39-5); House concurred Mar 10, 2026 (71-49); ratified Mar 25, 2026; signed Mar 30, 2026; Act No. 110. Effective clause: "This act takes effect upon approval by the Governor and first applies to tax years beginning after 2025." Rate table in Section 1: "$0–$30,000: 1.99% times the amount | $30,000 or more: 5.21% times the amount minus $966" (the $966 subtraction makes it a two-bracket schedule: 1.99% on the first $30,000, 5.21% above; 0.0521 x 30,000 − 966 = 597 = 0.0199 x 30,000). Trigger text: "top marginal income tax rate set forth in item (1) must be decreased if individual income tax revenues...are projected to increase by at least five percent...The reduction...shall...result in a reduction in individual income tax revenues...equal to two hundred million dollars".
  - SCIAD phase-out (Section 3): "reduced by a fraction whereby the numerator is the amount the taxpayer's federal adjusted gross income exceeds forty thousand dollars and the denominator is fifty-five thousand" for single; head of household begins at "sixty thousand dollars" with denominator "eighty-two thousand five hundred"; married filing jointly begins at "eighty thousand dollars" with denominator "one hundred ten thousand". "Any reduction amount which is not a multiplier of ten dollars must be rounded to the next lowest ten dollars." Arithmetic: single SCIAD is fully phased out at AGI $95,000; MFJ at AGI $190,000; HOH at $142,500.
  - The bill does NOT amend Section 12-6-1170 (retirement / age-65 deductions) or 12-6-1171 (military retirement); those deductions remain in force. Governor's office (Apr 15, 2026, https://governor.sc.gov/news/2026-04/governor-mcmaster-ceremonially-signs-income-tax-bill-law): the law "replaces South Carolina's current three-bracket individual income tax system with a simplified two-rate structure", "1.99% rate on taxable income up to $30,000 and a 5.21% rate on taxable income above $30,000, down from 6.0%", "preserving state-specific deductions", "Approximately 42.8% of South Carolina taxpayers are projected to see a reduction in their tax liability under the new structure." "Beginning in tax year 2027, if individual income tax revenues increase by at least 5% in the following fiscal year, tax rates will be automatically reduced," toward an eventual 1.99%.
- Tax year 2025 (returns filed in 2026): SC DOR Individual Income Tax page https://dor.sc.gov/tax/individual-income: "The 2025 top marginal Individual Income Tax rate is 6% on taxable income." Brackets 0% / 3% / 6% (Tax Foundation 2026 table shows 0% > $0, 3% > $3,640, 6% > $18,230 as of Jan 1, 2026 — that schedule is what H.4216 replaced). "The South Carolina dependent exemption amount for 2025 is $4,930." Tax year 2024 top rate was 6.2%. SC DOR extended all 2025 SC individual returns to October 15, 2026.
- Conformity: SC Information Letter #26-4 (Revised), Jan 30, 2026, https://dor.sc.gov/sites/dor/files/policies/IL26-4%28revised%29.pdf: "South Carolina has conformed with the Internal Revenue Code as amended through December 31, 2024." SC did not adopt the OBBBA federal standard-deduction increase, the $6,000 senior deduction, tips/overtime/car-loan-interest deductions or the $40,000 SALT cap for 2025 returns ("taxpayers will need to adjust their return"). For 2026, H.4216 replaces the federal standard deduction with the SCIAD, so the Tax Foundation footnote (vv) figure of $8,350/$16,700 is superseded.
- Local income tax: none in SC.
- Confidence: HIGH. As-of: SC DOR Apr 15, 2026; statehouse bill page opened 2026-08-16.

### 1.2 Retirement income
- SC DOR "Retirees – Lower your Individual Income Tax bill with these five tips", Nov 12, 2024, https://dor.sc.gov/tax-tips/retirees-lower-your-individual-income-tax-bill-these-five-tips:
  - Social Security: "Social Security benefits and railroad retirement taxed for federal purposes are exempt from Individual Income Tax in South Carolina."
  - Military: "All military retirement pay included as taxable income is exempt from South Carolina Individual Income Tax" (no age limit; 2022 law, Section 12-6-1171). Reserve/National Guard retirement also exempt.
  - Retirement income deduction (Section 12-6-1170(A)): up to $3,000 per year before age 65, up to $10,000 per year at 65 and after, of qualified retirement income (401(k), IRA, pensions, etc.), per taxpayer. Statute text: "An individual taxpayer who is the original owner of a qualified retirement account is allowed an annual deduction from South Carolina taxable income of not more than three thousand dollars of retirement income received." "Beginning in the year in which the taxpayer reaches age sixty-five, the taxpayer may deduct not more than ten thousand dollars of retirement income that is included in South Carolina taxable income."
  - Age-65 deduction (12-6-1170(B)): "Beginning in the tax year a resident taxpayer reaches age 65, they may claim a deduction of $15,000 against any South Carolina income." Statute: "an amount not to exceed fifteen thousand dollars reduced by any amount the taxpayer deducts pursuant to subsection (A)"; joint filers: "fifteen thousand dollars in the case when only one spouse has attained the age of sixty-five years and thirty thousand dollars when both spouses have attained such age." Must be reduced by any retirement or military deduction claimed.
  - Statute source: SC Code Title 12 Chapter 6, https://www.scstatehouse.gov/code/t12c006.php (opened 2026-08-16).
  - NOTE for copy: the brief's "$10,000 under 65" is wrong. It is $3,000 under 65 and $10,000 at 65+, plus the separate $15,000 age-65 deduction (net of the retirement deduction).
- H.4216 (2026) did not change these deductions (bill amends 12-6-510, 12-6-1140, 12-6-50, 12-6-4910, 12-6-1720, 12-6-3632 only). Confidence: HIGH.

### 1.3 Property tax
- Effective rate: 0.49% statewide, rank 46 of 50 (Tax Foundation 2026 / ACS 2024). Horry County 0.38%, median bill $944 (ACS 2020-24). Statewide median bill $1,337 (ACS 2024 1-yr).
- Assessment ratios (SC Association of Counties, "South Carolina Property Tax Rates by County 2025", February 2026 edition, https://www.sccounties.org/sites/default/files/uploads/resource-files/property-tax-rates-by-county-2025.pdf, p.2): "Residential real estate (owner-occupied) - 4.0%"; "Commercial and residential non-owner-occupied real property - 6.0%"; "Motor vehicles - 6.0%"; "All other personal property - 10.5%". "Residential owner-occupied properties that qualify for the 4% assessment rate are exempt from school property taxes, with the exception of mils imposed for school bonded indebtedness."
- Horry County Assessor guide https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/: "The owner of the property or the owner's agent must apply for the four percent assessment ratio before the first penalty date for payment of taxes for the tax year for which the owner first claims eligibility." Homestead: "Those age 65 and over, the blind, the disabled or surviving spouses may be eligible for a $50,000 deduction from the Assessor's market value appraisal for their legal residence." Reassessment cap: increases from countywide reappraisal "limited to fifteen percent within a five year period."
- SC Code 12-37-250 (https://www.scstatehouse.gov/code/t12c037.php): "The first fifty thousand dollars of the fair market value of the dwelling place of a person is exempt from county, municipal, school, and special assessment real estate property taxes when the person: (i) has been a resident of this State for at least one year and has reached the age of sixty-five years on or before December thirty-first..." SC Code 12-37-220(B)(47): "one hundred percent of the fair market value of owner-occupied residential property eligible for and receiving the special assessment ratio allowed owner-occupied residential property pursuant to Section 12-43-220(c) is exempt from all property taxes imposed for school operating purposes".
- Horry County 2025 millage (SCAC Feb 2026, p.18-19): County base total 0.0521 (52.1 mills: operations 43.90, capital planning 3.70, recreation 1.90, higher ed 0.6, HGTC 1.6, senior citizens 0.4). School: operation 109.1 mills (owner-occupied exempt), debt service 10.0 mills. Municipal: Myrtle Beach 83.4; North Myrtle Beach 45.0; Conway 98.1; Surfside Beach 43.0; Atlantic Beach 82.0; Aynor 65.8; Briarcliffe Acres 45.0; Loris 108.0. Other: Fire District 20.2 + fire apparatus 1.5 (unincorporated except Murrells Inlet); Murrells Inlet fire 28.0; Solid Waste 8.1 (unincorporated); Myrtle Beach MID 10.0. Fees: "Road Maintenance Fee ... Per Vehicle $50.00"; stormwater $89 single-family unincorporated. Value of 1 county mill $3,890,000. No local-option sales-tax property credit in Horry.
- Worked estimates from those millages (estimates only): unincorporated owner-occupied = 52.1 + 10.0 + 20.2 + 1.5 + 8.1 = 91.9 mills on 4%: a $350,000 home ≈ $350,000 x 0.04 x 0.0919 = $1,287/yr. Same home as second home / rental at 6% with school operating: 52.1 + 109.1 + 10.0 + 20.2 + 1.5 + 8.1 = 201.0 mills: $350,000 x 0.06 x 0.201 = $4,221/yr (about 3.3x). City of Myrtle Beach owner-occupied: 52.1 + 10.0 + 83.4 = 145.5 mills → $350,000 x 0.04 x 0.1455 = $2,037/yr.
- Confidence: HIGH for ratios/millage; the worked examples are arithmetic on those figures.

### 1.4 Sales tax
- State 6%; Horry County unincorporated 8% (state 6% + 1% Education Capital Improvement + 1% Transportation Tax); City of Myrtle Beach 9% (adds 1% Tourism Development); North Myrtle Beach, Conway, Surfside Beach 8%. Accommodations 9% (10% Myrtle Beach). Source: SC DOR ST-575 "South Carolina Sales Tax Rate by Municipality" (Rev. 2/5/26), https://www.dor.sc.gov/sites/dor/files/forms/ST575.pdf.
- Groceries: state rate on unprepared food is 0% (exempt since Nov 1, 2007). ST-575 column "Total Tax Rate Unprepared Foods": Unincorporated Horry 0%; Myrtle Beach 0%; North Myrtle Beach 0%; Conway 0%; Surfside Beach 0%. Horry's ECI and TT taxes do not apply to unprepared food. "To qualify as unprepared food, a food item must be able to be lawfully purchased with United States Department of Agriculture food coupons". Some other SC counties with a Local Option (LO) tax charge 1–2% on groceries (e.g., Charleston 2%), but not Horry.
- Age 85+: "An individual 85 years old or older is entitled to claim a 1% exemption from State Sales & Use Tax on purchases for their own personal use."
- Tax Foundation midyear 2026: SC state 6.00%, avg local 1.49%, combined 7.49%, rank 19. Confidence: HIGH.

### 1.5 Vehicles
- Annual property tax on vehicles: YES. Assessment ratio 6% of fair market value for private passenger cars, light trucks, motorcycles (SC Constitution Art. X §1(8)(B)(1) phase-down from 10.5% to 6% over 2002–2007; SCAC 2025 table lists "Motor vehicles - 6.0%"). Lexington County Auditor page https://lex-co.sc.gov/auditor/auditor-faqs/motor-vehicle-tax: "An amendment to the South Carolina Constitution, Article X, Section 1(8)(B)(1) reduced the assessment ratio on personal motor vehicles including motorcycles from 10.5% to 6% over six years beginning with the 2002 tax year." "This reduced assessment ratio applies only to personal automobiles, personal light trucks, and personal motorcycles"; heavier trucks 10.5%. "The vehicle's fair market value is multiplied by the assessment ratio set by law to determine the assessed value. The assessed value is then multiplied by the millage rate to determine the amount of taxes owed." "Personal property taxes on motor vehicles and recreational vehicles must be paid before your license plates can be renewed." "You have 45 days after moving to South Carolina to register your vehicle." The 4.75% figure in some sources is wrong; the phase-down ended at 6%.
- Horry County vehicle millage is the full millage (school operating is NOT exempt for vehicles): unincorporated ≈ 201.0 mills; a $30,000 car ≈ $30,000 x 0.06 x 0.201 ≈ $362/yr + $50 county road maintenance fee. Inside Myrtle Beach ≈ 254.6 mills ≈ $458/yr + $50. (Estimates from SCAC 2025 millage.)
- Infrastructure Maintenance Fee (one-time, replaces sales tax on vehicles): SC DOR Information Letter #17-10 (Revised), June 27, 2017, https://dor.sc.gov/income-tax-motor-fuel-user-fee-property-tax-south-carolina-infrastructure-and-economic-development-reform-act-0: "The infrastructure maintenance fee is remitted to SCDMV and is imposed at a rate of 5% of the gross proceeds of the sale, not to exceed $500, for a sale by a licensed SCDMV dealer or 5% of the vehicle's fair market value, not to exceed $500, for a sale by a person who is not an SCDMV licensed dealer." "Sales that are subject to the new infrastructure maintenance fee are exempt from the State and local sales and use taxes." New residents: "The infrastructure maintenance fee is also imposed when a vehicle ... was first registered in another state by the owner and is subsequently registered for the first time in South Carolina by the same owner. This infrastructure maintenance fee is $250." Active-duty military exempt from the $250 (SC Code 56-3-627(D)(2)). (SCDMV site dmv.sc.gov blocks automated fetch — 403 — so the SC DOR letter is the primary quote.)
- Registration fee for a standard passenger car: UNVERIFIED on SCDMV (site blocked). Widely reported as $40 for two years (age 64: $38; 65+: $36). Needs a human check at dmv.sc.gov.
- Confidence: HIGH for ratio and IMF; UNVERIFIED for the plate fee.

### 1.6 Estate / inheritance tax: none (Tax Foundation Oct 28, 2025). Confidence HIGH.
### 1.7 Gas tax: 28.75 cents/gal (motor fuel user fee reached 28.75¢ July 1, 2022 under Act 40 of 2017; Tax Foundation July 2025). Confidence HIGH.
### 1.8 Moving INTO SC
- Part-year residents file SC1040 with Schedule NR; SC taxes income earned while a resident plus SC-source income while a nonresident (H.4216 §5 amends 12-6-1720 so nonresidents/part-year filers prorate the SCIAD).
- SC nonresident real-estate withholding (SC Code 12-8-580; buyer withholds 7% of gain or 7% of sales price if seller is a nonresident) applies to SELLERS leaving SC, not to buyers arriving. Not relevant to an inbound buyer.
- New residents: 45 days to register vehicles (pay county vehicle tax first, then $250 IMF at SCDMV); apply for the 4% legal-residence ratio with the county assessor after closing (before the first penalty date of the first year claimed); apply for the 65+ homestead exemption after one year of SC residency.
- Confidence: HIGH (statutes/pages cited above), except SC1040 mechanics which are MEDIUM (from DOR general guidance; not re-quoted here).

## 2. NEW YORK (origin priority 1)

### 2.1 Income tax, tax year 2026
- Structure: graduated, 9 brackets. Top rate 10.90%.
- 2026 schedule (Tax Foundation "State Individual Income Tax Rates and Brackets, 2026", published Feb 17, 2026, as of Jan 1, 2026 — §0.1 above):
  - Single: 3.90% > $0; 4.40% > $8,500; 5.15% > $11,700; 5.40% > $13,900; 5.90% > $80,650; 6.85% > $215,400; 9.65% > $1,077,550; 10.30% > $5,000,000; 10.90% > $25,000,000.
  - MFJ: 3.90% > $0; 4.40% > $17,150; 5.15% > $23,600; 5.40% > $27,900; 5.90% > $161,550; 6.85% > $323,200; 9.65% > $2,155,350; 10.30% > $5,000,000; 10.90% > $25,000,000.
- Standard deduction $8,000 single / $16,050 MFJ; dependent exemption $1,000; no personal exemption. NY DTF "Standard deductions", https://www.tax.ny.gov/pit/file/standard_deductions.htm (page updated Oct 23, 2025) prints the same figures for tax year 2025: "Single (cannot be claimed as dependent) $8,000", "Married filing joint return $16,050". NY does not index the standard deduction, so 2025 and 2026 match. Confidence HIGH.
- **Scheduled changes.** The FY2026 enacted budget cuts the bottom five brackets by 0.1 percentage point in 2026 and another 0.1 point in 2027. Anchin, Block & Anchin, "New York State's 2026 Fiscal Year Budget Finally Passes", published May 19, 2025, https://www.anchin.com/articles/new-york-states-2026-fiscal-year-budget-finally-passes/: "The 0.2% reduction will be structured in two phases, with the initial tax cut of 0.1% applicable for tax year 2026 and the second tax cut of an additional 0.1% beginning in tax year 2027." Applies to the brackets that were 4%, 4.5%, 5.25%, 5.5% and 6%. So 2027 rates on those five brackets become 3.80% / 4.30% / 5.05% / 5.30% / 5.80%. The same article: "The temporary PIT high-income surcharge, originally set to expire after tax year 2027, has been extended through tax year 2032." That is the 9.65% / 10.30% / 10.90% tier. Confidence MEDIUM (law-firm summary, not the bill text); the 2026 half of it is corroborated by the Tax Foundation table, which prints exactly the 0.1-point-lower rates.
- **Tax benefit recapture.** Tax Foundation footnote (i): "Connecticut and New York have 'tax benefit recapture,' by which many high-income taxpayers pay their top tax rate on all income, not just on amounts above the benefit threshold." A high-earner's NY bill is therefore higher than a naive bracket calculation shows.
- **Local income tax on top.** NYC residents pay a separate city income tax and Yonkers residents a surcharge. Tax Foundation footnote (a) puts New York's average effective local income tax rate at 1.68%, the second highest in the country after Maryland. NYC resident rates: UNVERIFIED here (commonly cited as roughly 3.078%–3.876%); a buyer moving from the five boroughs drops this entirely on top of the state tax, so it is worth a human check before it goes in copy.
- Confidence: HIGH for the 2026 schedule and standard deduction; MEDIUM for the 2027 step and surcharge sunset; UNVERIFIED for NYC rates.

### 2.2 Retirement income
- Source: NY DTF "Information for retired persons", https://www.tax.ny.gov/pit/file/information_for_seniors.htm, page last updated October 20, 2025 (opened 2026-08-16).
- **Social Security: not taxed.** "Social security benefits that are included in federal adjusted gross income may be subtracted from your federal adjusted gross income when computing your New York adjusted gross income."
- **Pension and annuity exclusion, $20,000:** "If you were age 59½ or older for the entire tax year, you may exclude up to $20,000 of your qualified pension and annuity income from your federal adjusted gross income for purposes of determining your New York adjusted gross income." Per person, not per return: "Married taxpayers who both receive pension income are each entitled to a maximum pension and annuity income exclusion of $20,000 whether they file jointly or separately." So $40,000 on a joint return only when both spouses have their own qualifying income.
- **IRA and 401(k):** these count toward the $20,000 exclusion, they are not separately exempt. NY DTF (via Publication 36 / IT-201 instructions, tax.ny.gov, opened 2026-08-16): periodic and lump-sum payments from an IRA qualify, but not amounts derived from contributions made after retiring. Anything above $20,000 is taxed at ordinary NY rates. Confidence MEDIUM — quoted from NY DTF search-index text; the Publication 36 PDF URL 404s and needs a human re-check before this specific IRA sentence goes in copy.
- **Government pensions fully exempt, no dollar cap and no age test.** Same DTF page: pensions from New York State and local government plans (including the Teachers' Retirement Systems, police, fire and correction), federal government plans including military, and certain public authorities (MTA Police, LIRR, MABSTOA) — "you may subtract the amount of distribution that was included in your federal adjusted gross income, regardless of your age or of the form the payment(s) take." AARP New York State Tax Guide, updated March 31, 2026, https://www.aarp.org/states/new-york/state-taxes-guide/, agrees: "Military retirement pension benefits are exempt from taxation in New York."
- AARP cross-check on the exclusion: "The state offers an income tax exemption on the first $20,000 of pension and annuity income — up to $40,000 for married couples — for those 59.5 or older." No contradiction with DTF.
- **Comparison note for copy:** a NY retiree living on Social Security plus a private pension keeps the SS exemption after moving to SC (SC also exempts SS) but trades NY's $20,000 pension exclusion for SC's smaller retirement deduction ($3,000 under 65 / $10,000 at 65+) plus SC's $15,000 age-65 deduction. Whether the retiree comes out ahead on income tax alone depends on the amounts; the reliable win is the rate and the property tax, not the exclusion.
- Confidence: HIGH except the IRA sentence (MEDIUM).

### 2.3 Property tax
- Statewide effective rate on owner-occupied housing **1.30%** (2024 data; was 1.31% in 2023), rank 11 of 50. Tax Foundation "Property Taxes by State and County, 2026", published March 16, 2026 (§0.3).
- Statewide median real estate taxes paid **$6,542** (ACS 2024 1-year, table B25103, §0.4). That is 4.9x South Carolina's $1,337.
- Main origin counties (median home value / median taxes paid / effective rate, ACS 2020–2024 5-year, §0.3):
  - Nassau $684,700 / $10,000+ / **1.72%**
  - Suffolk $578,400 / $10,000+ / **1.62%**
  - Westchester $663,200 / $10,000+ / **1.84%**
  - Rockland $596,900 / $10,000+ / **2.06%**
  - Kings (Brooklyn) $905,000 / $6,382 / **0.56%**
  - Queens $723,800 / $6,297 / **0.75%**
  - New York (Manhattan) $1,090,500 / $10,000+ / **0.71%**
  - Bronx $529,500 / $5,447 / **0.78%**
  - Richmond (Staten Island) $675,500 / $6,247 / **0.88%**
- **Caveat that matters for copy:** the ACS top-codes median taxes paid at "$10,000+", so Nassau, Suffolk, Westchester and Rockland medians are understated — the true median bill in those four is above $10,000. Never print "$10,000" as the Long Island or Westchester median; print "over $10,000" or use the effective rate.
- **The boroughs are the exception, not the rule.** NYC effective rates (0.56%–0.88%) are close to South Carolina's, because NYC's Class 1 assessment caps hold assessed value far below market. A Brooklyn or Queens seller will not see a large property tax drop moving to Horry County; a Nassau, Suffolk or Westchester seller will. Do not write one sentence that covers both.
- Senior relief left behind: AARP (Mar 31, 2026) — Enhanced STAR for 65+ with income below "$110,750" (2026 threshold), and a senior exemption reducing assessed value "by as much as 50 percent" subject to local income limits. These do not travel; SC's equivalent is the $50,000 homestead exemption at 65+ after one year of residency (§1.3).
- Confidence: HIGH.

### 2.4 Sales tax
- State 4.00%, average local 4.54%, combined **8.54%**, rank 10 of 50, max local 4.88%. Tax Foundation "State and Local Sales Tax Rates, Midyear 2026", published July 6, 2026, rates as of July 1, 2026 (§0.2). NYC combined is 8.875%.
- **Groceries not taxed at the state level.** NY DTF Tax Bulletin TB-ST-283, "Food and Food Products Sold by Food Stores and Similar Establishments", dated April 8, 2019, https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/food_sold_by_food_stores.htm: "Generally, food and food products sold by food stores are exempt from sales tax." Taxable exceptions: heated food, food sold for consumption in a seating area, food arranged on a plate or platter ready to eat, sandwiches hot or cold, candy and confectionery, pet food, and carbonated beverages.
- Comparison: SC also exempts unprepared food at the state rate, and Horry County does not add a local tax on groceries (§1.4), so groceries go from exempt-with-exceptions to exempt.
- Confidence: HIGH.

### 2.5 Vehicles
- **No annual property or excise tax on vehicles.** New York registration is a weight-based fee, not a value-based tax. NY DMV "Registration fees, use taxes, and supplemental fees for passenger vehicles", https://dmv.ny.gov/registration/registration-fees-use-taxes-and-supplemental-fees-passenger-vehicles (opened 2026-08-16): "The Registration Fee Chart shows the 2 year fee for Passenger Vehicles by vehicle weight." Range $26.00 (0–1,650 lbs) to $140.00 (6,951+ lbs) for two years. The page contains no annual property or excise tax on vehicles.
- Other one-time or periodic charges on the same page: plates $25.00; "your title certificate fee of $50.00"; sales tax at purchase (state 4% plus local).
- County vehicle use tax and MCTD supplemental fee (same page): NYC residents "$30 for two years ($15 per year)" use tax plus "$50 for two years ($25 per year)" supplemental MCTD fee. Most other counties "$10 for 2 years ($5/year)" under 3,500 lbs and "$20 for 2 years ($10/year)" heavier; MCTD counties add "$50 for 2 years".
- **This is the single biggest South Carolina surprise for a New Yorker.** A New Yorker pays roughly $13–$70 a year to keep a car registered and nothing based on its value. In Horry County the same car is taxed every year at 6% of fair market value times the full millage — school operating included — plus a $50 county road maintenance fee, and the tax must be paid before the plate renews. Worked estimate from §1.5: a $30,000 car in unincorporated Horry ≈ $362/yr + $50; inside Myrtle Beach ≈ $458/yr + $50. On top of that, a car brought in from out of state pays a one-time $250 Infrastructure Maintenance Fee at first SC registration, and there is a 45-day deadline to register.
- Confidence: HIGH.

### 2.6 Estate and inheritance tax
- **Estate tax: YES.** NY DTF "Estate tax", https://www.tax.ny.gov/pit/estate/etidx.htm, page last updated December 3, 2025 (opened 2026-08-16): "The basic exclusion amount for dates of death on or after January 1, 2026, through December 31, 2026 is $7,350,000." (2025: $7,160,000.) Rates 3.06%–16% (Tax Foundation, Oct 28, 2025, §0.6).
- **The cliff.** Wealthspire "2026 Federal & State Estate and Gift Tax Cheat Sheet", Feb 4, 2026 (§0.6): NY is "subject to 'NYS cliff' for taxable estates exceeding 105% of exemption amount" — an estate above roughly $7,717,500 in 2026 loses the exclusion entirely and is taxed from the first dollar. The DTF page opened today did not restate the cliff, so treat the 105% mechanic as MEDIUM until a human confirms it against the ET-706 instructions.
- **Inheritance tax: none.** New York has no inheritance tax (Tax Foundation, Oct 28, 2025).
- **South Carolina has neither** (§1.6, Tax Foundation Oct 28, 2025). For an estate between about $7.35M and the federal exemption, this is a real difference — but do not present it as tax advice on the site.
- Confidence: HIGH for the exemption amount; MEDIUM for the cliff.

### 2.7 Gas tax
- **CONTRADICTION — flag before use.** Tax Foundation "Gas Taxes by State, 2025" (Sept 2, 2025, rates as of July 2025, §0.5) gives New York **24.87 cents/gal** total. AARP New York State Tax Guide (updated March 31, 2026) says: "In 2026, gasoline is taxed at 23.85 cents per gallon, while diesel is taxed at 22.05 cents per gallon."
- Likely cause: the two are counting different components of New York's stack (motor fuel excise + petroleum business tax + prepaid sales tax). Both are far below SC's 28.75 cents, so New York is the one origin state on this list where a mover's per-gallon state tax goes **up**, not down. Because the direction of the comparison is unusual, do not print a New York gas-tax number without a human re-check at tax.ny.gov.
- Confidence: MEDIUM at best. Use range "roughly 24–25 cents" or omit.

### 2.8 Moving OUT of New York to South Carolina — the gotcha
- **Domicile does not change just because you bought in Myrtle Beach.** NY DTF "Frequently asked questions about filing requirements, residency, and telecommuting", https://www.tax.ny.gov/pit/file/nonresident-faqs.htm, last updated October 24, 2025: "Your New York domicile does not change until you can demonstrate with clear and convincing evidence that you have abandoned your New York domicile and established a new domicile outside New York State." The same page: filing documents or registering to vote elsewhere is not enough on its own; you must move "the focus of your life to the new location."
- **The statutory residence trap is the one that catches second-home buyers.** Even after a genuine domicile change, New York still taxes you as a full-year resident if you keep "a permanent place of abode in New York State for substantially all of the taxable year" AND spend "184 days or more in New York State during the taxable year" (same DTF page). Keeping the Long Island house and spending half the year visiting family can leave a "former" New Yorker taxed by both states on the same income. Part of a day generally counts as a day.
- Part-year mechanics: the year of the move is filed on Form IT-203; per the same DTF page, you compute "tax as if you were a full year resident, then determine how much to allocate to New York by an income percentage based on your New York source income and your federal income."
- **Practical copy line:** sell or stop maintaining the New York abode, keep a day count, and expect New York to ask for proof. Point them to a CPA; do not give the test as advice on the site.
- Confidence: HIGH (quoted from NY DTF).

---

## 3. NORTH CAROLINA (origin priority 2)

### 3.1 Income tax, tax year 2026
- Structure: **flat 3.99%**, all filing statuses. Primary source: N.C.G.S. § 105-153.7(a), https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.7.html (opened 2026-08-16). Statutory table: "In 2022 4.99% / In 2023 4.75% / In 2024 4.5% / In 2025 4.25% / After 2025 3.99%."
- NCDOR "Tax Rate Schedules", https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules (opened 2026-08-16), confirms: "For Taxable Years beginning in 2025, the North Carolina individual income tax rate is 4.25% (0.0425)." "For Taxable Years after 2025, the North Carolina individual income tax rate is 3.99% (0.0399)." Cross-check: Tax Foundation 2026 table (§0.1) prints "NC 3.99% > $0" and notes "On January 1, 2026, the final step in that phasedown occurred, with the rate decreasing from 4.25 percent to 3.99 percent."
- Standard deduction, N.C.G.S. § 105-153.5(a)(1) (opened 2026-08-16): "Married, filing jointly/surviving spouse $25,500 / Head of Household 19,125 / Single 12,750 / Married, filing separately 12,750." Fixed in statute, not inflation-indexed, so 2026 = 2025. No personal exemption; NC uses a separate child deduction instead.
- **Scheduled changes.** N.C.G.S. § 105-153.7(a1) "Rate Reduction Trigger": "if total General Fund revenue in a fiscal year set out below exceeds the trigger amount indicated for that fiscal year, then the applicable tax rate for the indicated and subsequent tax years shall be equal to the greater of (i) the prior taxable year's rate decreased by one-half percentage point (0.50%) or (ii) two and forty-nine hundredths percent (2.49%)." First trigger: FY 2025-2026 revenue above **$33,042,000,000** drops the tax year 2027 rate to 3.49%. Further triggers run through FY 2032-2033 / tax year 2034, with a floor of 2.49%. Whether the 2027 cut fires is not knowable until the Office of State Controller's August accounting — **UNVERIFIED for 2027; do not print a 2027 NC rate.**
- No local income tax in NC.
- Confidence: HIGH.

### 3.2 Retirement income
- **Social Security: not taxed.** N.C.G.S. § 105-153.5(b)(3), deductions from AGI: "Benefits received under Title II of the Social Security Act and amounts received from retirement annuities or pensions paid under the provisions of the Railroad Retirement Act of 1937." AARP North Carolina State Tax Guide, updated March 18, 2026, https://www.aarp.org/states/north-carolina/state-taxes-guide/: "No, but you may pay federal taxes on a portion of your Social Security benefits."
- **Bailey settlement — the big one.** N.C.G.S. § 105-153.5(b)(5) deducts amounts from "State, local, or federal government retirement plans to the extent the amount is exempt from tax under this Part pursuant to a court order in settlement of" Bailey v. State and Emory v. State. NCDOR "Bailey Decision Concerning Federal, State and Local Retirement Benefits", https://www.ncdor.gov/taxes-forms/individual-income-tax/bailey-decision-concerning-federal-state-and-local-retirement-benefits (opened 2026-08-16): "the exclusion applies to retirement benefits received from certain defined benefit plans...if the retiree had five or more years of creditable service as of August 12, 1989." Qualifying systems: NC Teachers' and State Employees' Retirement System, NC Local Governmental Employees' Retirement System, NC Consolidated Judicial Retirement System, Federal Employees' Retirement System, US Civil Service Retirement System, and State §401(k) and §457 plans (for those, exempt "if the retiree had contributed or contracted to contribute to the plan prior to August 12, 1989"). Also: "North Carolina may not tax certain retirement benefits received by retirees (or by beneficiaries of retirees) of the state of North Carolina and its local governments or by the United States government retirees (including military)." Limit: "the exclusion does not apply to retirement benefits paid to former teachers and state employees of other states and their political subdivisions."
- **Bailey is a closed class.** Because the test is five years of creditable service as of August 12, 1989, anyone who started government service after that date does not qualify, and the group shrinks every year. Do not write "North Carolina exempts government pensions" — it exempts a specific vintage of them.
- **Military retirement:** N.C.G.S. § 105-153.5(b)(11)a deducts "Retirement pay for service in the uniformed services of the United States to a retired member" who "Served at least 20 years in the uniformed services" (or was medically retired). Separate from Bailey and open to new retirees.
- **Everything else is fully taxed at 3.99%:** private pensions, 401(k), 403(b), traditional IRA withdrawals, and annuities. NC has no general age-based retirement exclusion and no senior deduction. AARP (Mar 18, 2026): "Most retirement income is taxed as individual income."
- **Comparison for copy:** an NC retiree moving to SC picks up SC's retirement income deduction ($3,000 under 65, $10,000 at 65+ per taxpayer) and the SC $15,000 age-65 deduction, which NC has no equivalent of. A Bailey-qualified NC retiree, on the other hand, is giving up an unlimited exemption for a capped one and should run the numbers. Social Security is exempt in both states, so that piece is a wash.
- Confidence: HIGH.

### 3.3 Property tax
- Statewide effective rate **0.66%** (2024; 0.69% in 2023), rank 33 of 50. Tax Foundation, published March 16, 2026 (§0.3). AARP (Mar 18, 2026) agrees: "The effective property tax rate in North Carolina was 0.66 percent of a home's assessed value."
- Statewide median real estate taxes paid **$2,044** (ACS 2024 1-year, §0.4). SC is $1,337.
- Main origin counties (median home value / median taxes paid / effective rate, ACS 2020–2024, §0.3):
  - **Mecklenburg** (Charlotte) $406,800 / $2,890 / **0.69%**
  - **Wake** (Raleigh) $461,300 / $3,260 / **0.69%**
- **This is the weakest of the five priority comparisons.** NC is already a low-property-tax state. Horry County's 0.38% effective rate is still roughly half of Mecklenburg's or Wake's, and SC's 4% owner-occupied ratio removes school operating millage entirely, but the dollar gap is a few thousand a year, not the five figures a Long Island or Bergen County seller sees. Do not oversell it.
- NC senior relief left behind (AARP, Mar 18, 2026): homestead exclusion of "either $25,000 or 50 percent of the appraised value of the home, whichever is greater" for 65+ with income at or below $37,900. SC's equivalent is a $50,000 exemption at 65+ after one year of residency (§1.3), with no income test.
- Confidence: HIGH.

### 3.4 Sales tax
- State 4.75%, average local 2.35%, combined **7.10%**, rank 22 of 50, max local 3.50%. Tax Foundation midyear 2026, as of July 1, 2026 (§0.2).
- **Groceries: exempt from the state rate, but a 2% local tax applies.** NCDOR "Food, Non-Qualifying Food, and Prepaid Meal Plans", https://www.ncdor.gov/taxes-forms/sales-and-use-tax/food-non-qualifying-food-and-prepaid-meal-plans (opened 2026-08-16): "A 2.00% local rate of sales and use tax applies to the sales price qualifying food." The state and transit rates do not apply to qualifying food. Non-qualifying food, taxed at the full combined rate: candy, soft drinks, prepared food, dietary supplements, food from vending machines, prepaid meal plans. AARP (Mar 18, 2026) agrees: "Groceries, except for candy and soda, are exempt from state sales tax, but a 2 percent local tax is charged on them."
- **Groceries actually get cheaper on tax in Horry County.** SC exempts unprepared food at the state rate and Horry adds no local tax on groceries, so the rate goes from 2% to 0% (§1.4). Small but real, and it is one of the few line items where an NC mover clearly wins.
- General merchandise goes the other way: 7.10% average in NC vs 8% in unincorporated Horry and 9% in the City of Myrtle Beach.
- Confidence: HIGH.

### 3.5 Vehicles
- **Annual vehicle property tax: YES** — NC is one of the few origin states where the SC vehicle tax is not a surprise. NCDMV "Vehicle Property Taxes", https://www.ncdot.gov/dmv/title-registration/Pages/vehicle-property-tax.aspx (opened 2026-08-16): the "vehicle owner pays the property tax at the same time as the vehicle's registration renewal fee", the tax is "for the upcoming year, covering the same period as the vehicle registration", "North Carolina property tax law requires counties to assess the value of motor vehicles", and "You must pay both your vehicle's registration and the property tax at the same time." This is the Tag & Tax Together program; the county sets the rate and the value, NCDMV only collects.
- **Registration fee: $46.25 per year** for a regular private passenger vehicle. NCDOT press release "NCDMV Fees to Increase July 1, Per State Law", published April 2, 2024, https://www.ncdot.gov/news/press-releases/Pages/2024/2024-04-02-ncdmv-fee-increase-state-law.aspx: "For regular private passenger vehicle registrations, the annual fee will go from $38.75 to $46.25." Same page: "the DMV is required to adjust fees and rates every four years, based on the percentage change in the annual Consumer Price Index"; the last adjustment was 19.18% effective July 1, 2024, so the next is due July 1, 2028. Confidence HIGH for the amount; local/regional transportation fees are added on top in some counties and are UNVERIFIED here.
- Highway Use Tax at titling: N.C.G.S. § 105-187.3(a1), https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-187.3.html: "The tax rate is three percent (3%). The maximum tax is two thousand dollars ($2,000) for each certificate of title issued for a Class A or Class B motor vehicle that is a commercial motor vehicle...and for each certificate of title issued for a recreational vehicle." No cap on ordinary passenger cars.
- **Moving to SC:** the annual value-based tax carries over conceptually, so no shock — but the mechanics differ. In SC the tax bill comes from the county auditor and must be paid before the plate renews; the assessment ratio is fixed at 6% of fair market value by the state constitution; and a car titled in another state pays a one-time **$250 Infrastructure Maintenance Fee**, not a percentage-of-value HUT, at first SC registration (§1.5). SC gives 45 days to register.
- Confidence: HIGH.

### 3.6 Estate and inheritance tax
- **Neither.** Tax Foundation "Estate and Inheritance Taxes by State, 2025", Oct 28, 2025 (§0.6): North Carolina is confirmed absent from both tables. AARP (Mar 18, 2026): "No, there is no inheritance or estate tax in North Carolina." Same as South Carolina — no change on a move.
- Confidence: HIGH.

### 3.7 Gas tax
- **41.0 cents per gallon for calendar 2026**, plus a 0.25 cent inspection tax = **41.25 cents**. NCDOR "Motor Fuels Tax Rates", https://www.ncdor.gov/taxes-forms/motor-fuels-tax/motor-fuels-tax-rates, page dated December 19, 2025: "01/01/26 - 12/31/26: 41.0" and "01/01/25 - 12/31/25: 40.3", plus "In addition to the road tax, every gallon of motor fuel includes a .0025 cents per gallon inspection tax."
- This **supersedes** the Tax Foundation July 2025 figure of 40.55 cents in §0.5 and the AARP figure of 40.3 cents (which is the 2025 rate). Use 41.25 cents for 2026.
- SC is 28.75 cents (§1.7). A North Carolinian saves about **12.5 cents a gallon**, the largest per-gallon drop of the five priority states.
- Confidence: HIGH (NCDOR primary, 2026 rate published).

### 3.8 Moving OUT of North Carolina to South Carolina — the gotcha
- **The income tax can go UP, and that is the opposite of what people expect.** North Carolina is a flat 3.99% with a $25,500 joint standard deduction; South Carolina from 2026 is 1.99% on the first $30,000 and 5.21% above that, with a SCIAD deduction that phases out between $80,000 and $190,000 of AGI for joint filers (§1.1). Arithmetic on those two published schedules, joint filers, no dependents, no credits: at $60,000 AGI, NC ≈ $1,377 and SC ≈ $597; at $100,000 AGI they are nearly identical (NC ≈ $2,973, SC ≈ $2,965); at $120,000 AGI, NC ≈ $3,771 and SC ≈ $4,291. **Crossover is around $100,000 of joint AGI** — above that a mover from NC pays more state income tax in SC, not less. These are estimates computed here from the schedules in §1.1 and §3.1, not figures from a published table, and they ignore SC's $4,930 dependent exemption and NC's child deduction. **Have a human re-run them before any of it appears on a page, and never publish a specific dollar figure for a named household.**
- Mechanics: the year of the move is a part-year year in both states. NCDOR "Individual Income Filing Requirements" (opened 2026-08-16): a part-year resident is someone who "moved out of North Carolina and became a resident of another state during the tax year", and must file Form D-400 with Schedule PN "to determine the percentage of total income from all sources that is subject to North Carolina tax." North Carolina has no aggressive statutory-residence day-count test of the New York or New Jersey kind, so leaving NC is administratively simple compared with leaving the Northeast.
- Confidence: HIGH for the mechanics; the crossover arithmetic is an internal estimate and is flagged as such.

---

## 4. OHIO (origin priority 3)

### 4.1 Income tax, tax year 2026
- Structure: effectively **flat 2.75%** on non-business income above $26,050, same schedule for every filing status (Ohio does not vary brackets by filing status). Top rate 2.75% — the second lowest state income tax rate in the country among states that have one.
- Primary source: Ohio Revised Code § 5747.02, https://codes.ohio.gov/ohio-revised-code/section-5747.02, effective September 30, 2025, "Amended by House Bill 96 - 136th General Assembly", page "Last updated July 11, 2025" (opened 2026-08-16). Division (A)(3): "If the balance thus obtained is equal to or less than twenty-six thousand fifty dollars, no tax shall be imposed on that balance." Then:
  - "(b) For taxable years beginning in 2025: More than $26,050 but not more than $100,000 | $342.00 plus 2.75% of the amount in excess of $26,050 | More than $100,000 | $2,394.32 plus 3.125% of the amount in excess of $100,000"
  - "**(c) For taxable years beginning in 2026 and thereafter, $332.00 plus 2.75% of the amount in excess of $26,050.**"
- **Read that carefully — it is not a clean 0%-then-2.75% schedule.** The statute levies a $332 base amount plus 2.75% of the excess, so as written the schedule steps up by $332 at the $26,050 threshold rather than starting from zero. Ohio's own published table for 2025 shows the same shape ("$342 + 2.75% of excess over $26,050", tax.ohio.gov "Annual Tax Rates", https://tax.ohio.gov/individual/resources/annual-tax-rates, which as of 2026-08-16 still only publishes "brackets for 2005 through 2025"). Tax Foundation's 2026 summary (§0.1) compresses this to "2.75% > $26,050 (0% below)". **Do not build a calculator on the Tax Foundation simplification.** The statute is the controlling text and the $332 base is in it. Flag for a human: confirm against the 2026 Form IT 1040 when Ohio publishes it.
- Cross-check: Tax Foundation 2026 (Feb 17, 2026): "On January 1, 2026, the individual income tax moved to a flat rate of 2.75 percent for all nonbusiness income over $26,050. While the law reduced the overall tax rate, it tightened eligibility for certain credits and exemptions."
- **The tightening is real.** ORC § 5747.025, https://codes.ohio.gov/ohio-revised-code/section-5747.025 (opened 2026-08-16): the personal exemption for the taxpayer, spouse and each dependent applies only "provided the taxpayer's modified adjusted gross income is less than seven hundred fifty thousand dollars for taxable years beginning in 2025 or **five hundred thousand dollars for taxable years beginning in 2026** or thereafter". Base amounts in statute, indexed annually to the GDP deflator: $2,350 if MAGI ≤ $40,000; $2,100 if $40,000–$80,000; $1,850 above $80,000. Tax Foundation's 2026 indexed figures: $2,400 (single) / $4,800 (MFJ), with $2,150 if AGI $40k–$80k and $1,900 above $80k. Ohio has **no standard deduction**.
- Business income: flat 3% (ORC 5747.02(A)(4)), after the Business Income Deduction. Not relevant to most buyers; relevant to a self-employed one.
- **Local income tax is the part people forget.** Ohio municipalities levy their own income tax, and many school districts levy a separate school district income tax on top. Tax Foundation footnote (a) (§0.1) puts Ohio's average effective local income tax rate at **1.49%**, third highest in the country. Municipal rates commonly run 1%–3%. UNVERIFIED here: the exact count of Ohio school districts levying an SDIT and the rate range — tax.ohio.gov's SDIT pages render client-side and could not be scraped today. Ohio municipal income taxes generally reach wages and not pensions (ORC Chapter 718) — **UNVERIFIED, needs a human check before it goes in copy.**
- **South Carolina has no local income tax at all** (§1.1). For a working household this is the single largest income-tax swing in the Ohio comparison, and it is larger than the state-rate difference.
- Confidence: HIGH for the state schedule and exemptions; UNVERIFIED for the local detail.

### 4.2 Retirement income
- **Social Security: not taxed.** ORC § 5747.01, https://codes.ohio.gov/ohio-revised-code/section-5747.01 (opened 2026-08-16), deductions from federal AGI: "(a) Benefits under Title II of the Social Security Act and tier 1 railroad retirement" and, separately, "Railroad retirement benefits, other than tier 1 railroad retirement benefits, to the extent such amounts are exempt from state taxation under federal law". AARP Ohio State Tax Guide, updated March 17, 2026, https://www.aarp.org/states/ohio/state-taxes-guide/: "Ohio does not tax Social Security benefits."
- **Pensions, 401(k) and IRA withdrawals ARE taxable** in Ohio at 2.75%. There is no exclusion — only two small credits.
- **Retirement income credit**, ORC § 5747.055(B), https://codes.ohio.gov/ohio-revised-code/section-5747.055 (opened 2026-08-16), effective October 17, 2019 (HB 166, 133rd GA). Allowed only "for taxpayers who received retirement income during the taxable year and whose modified adjusted gross income for the taxable year, less applicable exemptions under section 5747.025 of the Revised Code, as shown on an individual or joint annual return is **less than one hundred thousand dollars**. **Only one such credit shall be allowed for each return**", per this schedule:
  - $500 or less → $0
  - Over $500 but not more than $1,500 → $25
  - Over $1,500 but not more than $3,000 → $50
  - Over $3,000 but not more than $5,000 → $80
  - Over $5,000 but not more than $8,000 → $130
  - Over $8,000 → **$200** (the maximum)
- **Senior citizen credit**, ORC § 5747.055(F): "A credit equal to fifty dollars for each return required to be filed...for taxpayers sixty-five years of age or older during the taxable year whose modified adjusted gross income, less applicable exemptions...is less than one hundred thousand dollars for that taxable year." $50 per return, not per person.
- A separate lump-sum election exists for one-time distributions (ORC 5747.055(C) and (G)); it substitutes a life-expectancy calculation for the annual credit and forfeits the annual credit in later years. Not relevant to most buyers.
- **Copy note:** Ohio's "retirement income credit" sounds generous and is not. The maximum is $200 a year, one per return, and it disappears entirely at $100,000 of modified AGI. A retiree with a $60,000 pension pays 2.75% on it and gets $200 back. In South Carolina the same retiree at 65+ deducts up to $10,000 of retirement income plus the $15,000 age-65 deduction (net of the retirement deduction) before any rate applies (§1.2). This is the clearest retiree win of the five priority states — say it plainly, without numbers for a named household.
- Confidence: HIGH (statute quoted).

### 4.3 Property tax
- Statewide effective rate **1.36%** (2024; 1.41% in 2023), **rank 8 of 50**. Tax Foundation, published March 16, 2026 (§0.3). AARP (Mar 17, 2026) agrees: "The effective property tax rate for the state is 1.36 percent."
- Statewide median real estate taxes paid **$2,937** (ACS 2024 1-year, §0.4).
- Main origin counties (median home value / median taxes paid / effective rate, ACS 2020–2024, §0.3):
  - **Cuyahoga** (Cleveland) $195,400 / $3,910 / **1.89%**
  - **Franklin** (Columbus) $288,400 / $4,244 / **1.53%**
  - **Hamilton** (Cincinnati) $241,900 / $3,652 / **1.51%**
- AARP (Mar 17, 2026) confirms the spread: "Rates range from 0.64 percent in Noble and Vinton counties to 1.89 percent in Cuyahoga County."
- **Ohio is the best property-tax story of the five priority states in rate terms.** Cuyahoga's 1.89% against Horry County's 0.38% is a **5x** difference in effective rate. But note what drives it: Ohio home values are low, so the dollar bill (~$3,900 in Cuyahoga) is far below Long Island's. An Ohio seller trading a $195,000 Cleveland house for a $400,000 Horry County house will not necessarily see the bill fall — run the actual numbers. Compare rates OR compare a same-price house; never mix the two.
- Ohio senior relief left behind (AARP, Mar 17, 2026): homestead exemption for 65+ or totally and permanently disabled "with a household adjusted gross income of $40,000 or less in 2025. The maximum reduction is $29,000." SC's is a flat $50,000 exemption at 65+ with no income test, after one year of residency (§1.3).
- Confidence: HIGH.

### 4.4 Sales tax
- State 5.75%, average local 1.54%, combined **7.29%**, rank 21 of 50, max local 2.25%. Tax Foundation midyear 2026, as of July 1, 2026 (§0.2).
- **Groceries not taxed.** ORC § 5739.02(B)(2), https://codes.ohio.gov/ohio-revised-code/section-5739.02 (opened 2026-08-16), exempts "Sales of food for human consumption off the premises where sold". AARP (Mar 17, 2026): "Exemptions include groceries, items bought with food stamps, newspapers, prescription medication and medical equipment."
- Comparison: essentially a wash on groceries (exempt in both), and general merchandise goes from 7.29% average to 8% in unincorporated Horry / 9% in the City of Myrtle Beach (§1.4). **Ohio movers pay more sales tax in Myrtle Beach, not less.** Say so.
- Confidence: HIGH.

### 4.5 Vehicles
- **No annual property or excise tax on vehicles.** Ohio charges a flat registration fee plus local permissive taxes; nothing is based on the vehicle's value.
- Ohio BMV "Documents & Fees", https://www.bmv.ohio.gov/doc-fees.aspx (opened 2026-08-16): passenger vehicle registration **"$36.00"** annual renewal, **effective 1/5/2026**. Deputy registrar service fee "$8.00" for 1 year (rising to "$24.00" for 5 years). Local permissive tax: "Permissive tax cannot exceed $30.00 per vehicle." Title fee "$18" statewide, "$23" in some counties.
- So an Ohio driver pays roughly **$44 to $74 a year** to keep a car on the road, none of it tied to what the car is worth.
- **Second-biggest SC surprise after New York.** In Horry County the same car is taxed annually at 6% of fair market value times the full millage (school operating included), the bill must be paid before the plate renews, and there is a $50 county road maintenance fee. Estimate from §1.5: a $30,000 car ≈ $362/yr unincorporated, ≈ $458/yr inside Myrtle Beach, plus $50. Plus a one-time **$250 Infrastructure Maintenance Fee** at first SC registration for a car titled in another state, within 45 days of moving.
- An Ohio household with two newer cars can expect roughly $700–$1,000 a year in SC vehicle tax it has never paid before. That can cancel a meaningful share of the property-tax saving. **Put this on the page.**
- Confidence: HIGH.

### 4.6 Estate and inheritance tax
- **Neither.** Tax Foundation, Oct 28, 2025 (§0.6): Ohio confirmed absent from both tables. AARP (Mar 17, 2026): "No, the state does not have an estate or inheritance tax." Ohio's estate tax was repealed for deaths on or after January 1, 2013 — **the repeal date is UNVERIFIED here** (not re-opened at a primary source today); the current-year answer of "neither" is HIGH confidence.
- Same as South Carolina. No change on a move.

### 4.7 Gas tax
- **38.50 cents per gallon.** Tax Foundation "Gas Taxes by State, 2025" (Sept 2, 2025, rates as of July 2025, §0.5). AARP Ohio (updated March 17, 2026) independently states "Gasoline is taxed at 38.5 cents per gallon. Diesel is taxed at 47 cents per gallon." Two sources, same number, one of them current to March 2026.
- SC is 28.75 cents (§1.7). An Ohioan saves about **9.75 cents a gallon**.
- Confidence: HIGH.

### 4.8 Moving OUT of Ohio to South Carolina — the gotcha
- **Ohio has a hard, checkable residency test, and one of its conditions catches almost everybody: you cannot hold an Ohio driver's license at any point in the year.** ORC § 5747.24(B)(1), https://codes.ohio.gov/ohio-revised-code/section-5747.24 (opened 2026-08-16), presumes an individual "not domiciled in this state for the entirety of any taxable year" only if they file a statement with the tax commissioner **and** meet all of: no more than "two hundred twelve contact periods in this state" during the year; at least one abode outside Ohio for the entire year; "did not hold a valid Ohio driver's license or identification card at any time during the taxable year"; did not receive an Ohio homestead or manufactured-home property tax reduction; and (if enrolled at an Ohio public college) was not charged in-state tuition based on an Ohio abode.
- **The statement has a deadline and real teeth.** ORC 5747.24(B)(2): the statement must be filed "On or before the fifteenth day of the tenth month following the close of the taxable year" — October 15 for a calendar-year filer — and "An individual or personal representative of an estate who knowingly makes a false statement under this division is guilty of perjury". File it and qualify, and ORC 5747.24(B)(3) makes the non-domicile presumption **"irrebuttable"**. Fail to file, and "the individual is presumed under division (C) or (D) of this section to have been domiciled in this state the entire taxable year."
- The fallback tests are worse: fewer than 213 contact periods plus any Ohio abode gets you presumed Ohio-domiciled, rebuttable only "with a preponderance of the evidence" (division (C)); 213 or more contact periods plus an Ohio abode gets you presumed Ohio-domiciled, rebuttable only "with clear and convincing evidence" (division (D)). And a "contact period" is generous to Ohio: "at least some portion, however minimal, of each of two consecutive days in this state" while away overnight from an out-of-state abode.
- **Practical copy line for an Ohio snowbird buying in Myrtle Beach:** surrender the Ohio driver's license before January 1 of the first year you intend to be a non-resident, give up any Ohio homestead reduction, keep a day count, and file the Ohio non-resident statement by October 15. Point them at a CPA; do not walk a client through the test on the site.
- Confidence: HIGH (statute quoted verbatim).

---

## 5. NEW JERSEY (origin priority 4)

### 5.1 Income tax, tax year 2026
- Structure: graduated. Top rate **10.75%** on income over $1,000,000. Single has 7 brackets, MFJ has 8.
- 2026 schedule (Tax Foundation, published Feb 17, 2026, as of Jan 1, 2026 — §0.1):
  - Single: 1.40% > $0; 1.75% > $20,000; 3.50% > $35,000; 5.525% > $40,000; 6.37% > $75,000; 8.97% > $500,000; 10.75% > $1,000,000.
  - MFJ: 1.40% > $0; 1.75% > $20,000; 2.45% > $50,000; 3.50% > $70,000; 5.525% > $80,000; 6.37% > $150,000; 8.97% > $500,000; 10.75% > $1,000,000.
- **No standard deduction.** Personal exemption $1,000 single / $2,000 MFJ; dependent exemption $1,500 (Tax Foundation 2026). New Jersey also allows an additional exemption at age 65 or older — commonly cited as $1,000 per qualifying filer — **UNVERIFIED here**, needs a human check at nj.gov before use.
- New Jersey's brackets are fixed in statute and are not inflation-indexed, so 2026 = 2025. No scheduled rate changes identified for 2026 or 2027 — **UNVERIFIED as a negative**; absence of a change was not confirmed at a primary source today.
- No local income tax in New Jersey (the only Northeast origin state on this list with none — note that when comparing against NY and PA).
- **The rates are misleading if quoted alone.** New Jersey's bottom brackets are the lowest of the five priority states; the pain is property tax, not income tax. Do not lead with "10.75% top rate" — almost no buyer is in it.
- Confidence: HIGH for the schedule; UNVERIFIED for the 65+ exemption and for the absence of scheduled changes.

### 5.2 Retirement income
- Primary source: NJ Division of Taxation "NJ Income Tax – Retirement Income", https://www.nj.gov/treasury/taxation/njit6.shtml, **Last Updated: Tuesday, 03/31/26** (opened 2026-08-16).
- **Social Security: not taxed.** Listed under "Nontaxable Retirement Income": "Social Security and Railroad Retirement benefits". AARP New Jersey State Tax Guide, updated April 6, 2026, https://www.aarp.org/states/new-jersey/state-taxes-guide/: "New Jersey does not tax Social Security benefits."
- **Military pensions: not taxed, at any age.** Same DOT page: "Military pensions and survivor's benefit payments, regardless of your age or disability status." But: "civil service pensions and annuities are taxable, even if they are based on credit for military service."
- **Everything else is taxable before the exclusion:** "Taxable pensions include all state and local government, teachers', and federal pensions, as well as employee pensions and annuities from the private sector and Keogh plans."
- **Pension Exclusion — and the income cap is a cliff, not a phase-out at the top.** NJ Division of Taxation "Retirement Income Exclusions", https://www.nj.gov/treasury/taxation/njit7.shtml, **Last Updated: Wednesday, 12/03/25** (opened 2026-08-16). Qualify if "You (and/or your spouse/civil union partner, if filing jointly) were **62 or older** or disabled as defined by Social Security guidelines on the last day of the tax year" **and** "Your total income for the entire year was **$150,000 or less**." Page states plainly: "The current income limit for a Retirement Income Exclusion is $150,000."
  - **Total income $1–$100,000** — exclude taxable pension, annuity and IRA withdrawals up to: **$100,000** married/CU filing jointly; **$75,000** single / head of household / qualifying widow(er); **$50,000** married filing separately.
  - **Total income $100,001–$125,000** — exclude a percentage of taxable pension: **50%** MFJ, **37.5%** single/HOH/QW, **25%** MFS.
  - **Total income $125,001–$150,000** — **25%** MFJ, **18.75%** single/HOH/QW, **12.5%** MFS.
  - **Total income $150,001 or more** — "Not eligible for a pension exclusion." One dollar over and the whole thing is gone.
  - Joint returns where only one spouse is 62+: "you can still claim the maximum pension exclusion. However, you can exclude only the pension, annuity, or IRA withdrawal of the qualified spouse/civil union partner."
  - The chart on that page is captioned against "the 2025 NJ-1040", so these are the tax year 2025 figures and NJ has published nothing different for 2026 as of 2026-08-16. Treat as the 2026 figures with that caveat.
- Two smaller add-ons on the same page: the **Unclaimed Pension Exclusion** (62+, total income $100,000 or less, and wage/business/partnership/S-corp income totalling "$3,000 or less"), which lets unused pension-exclusion room shelter other income; and the **Special Exclusion** for taxpayers who cannot receive Social Security or Railroad Retirement benefits ("Since most taxpayers qualify for those benefits, few taxpayers are eligible").
- **Key fact for the move:** "If you are a nonresident, your pension, annuity, and IRA income is not subject to New Jersey Income Tax." Once the domicile change is real, New Jersey has no claim on the pension at all.
- **Comparison for copy:** below $100,000 of total income, New Jersey's exclusion is far more generous than South Carolina's ($100,000 joint vs SC's $10,000-at-65 retirement deduction plus the $15,000 age-65 deduction). A New Jersey retiree under the cap who moves to SC can pay *more* state income tax on the pension. Above $150,000 of total income, New Jersey gives nothing and South Carolina's deductions are worth having. The property tax difference dwarfs both — lead with that.
- Confidence: HIGH (NJ DOT quoted directly).

### 5.3 Property tax
- Statewide effective rate **1.88%** (2024; 1.98% in 2023) — **rank 1 of 50, the highest in the country**. Tax Foundation, published March 16, 2026 (§0.3). AARP (Apr 6, 2026) agrees: "1.88 percent of assessed value."
- Statewide median real estate taxes paid **$9,358** (ACS 2024 1-year, §0.4). That is **7.0x** South Carolina's $1,337 and 9.9x Horry County's $944.
- Main origin counties (median home value / median taxes paid / effective rate, ACS 2020–2024, §0.3):
  - **Bergen** $623,000 / $10,000+ / **1.89%**
  - **Morris** $582,500 / $10,000+ / **1.84%**
  - **Essex** $524,100 / $10,000+ / **2.10%**
  - **Middlesex** $462,900 / $9,712 / **1.99%**
  - **Monmouth** $606,100 / $10,000+ / **1.53%**
  - **Ocean** $398,400 / $6,562 / **1.42%**
- ACS top-codes at "$10,000+", so Bergen, Morris, Essex and Monmouth medians are understated. AARP (Apr 6, 2026) confirms the scale: "Eight counties had median property taxes paid of more than $10,000." **Never print "$10,000" as a Bergen or Morris median — print "over $10,000".**
- **This is the strongest single comparison in the whole file.** A Bergen County seller paying above $10,000 a year moves to a $400,000 owner-occupied home in unincorporated Horry County and pays roughly $1,470 (arithmetic on §1.3: $400,000 × 4% × 91.9 mills). That is the number that sells the page. Use the effective rates — 1.89% against 0.38% — rather than a specific household's bill.
- New Jersey relief left behind (AARP, Apr 6, 2026): **Stay NJ** pays homeowners 65+ "50 percent of their property tax bill, up to a maximum bill amount of $13,000...capped at $6,500" for 2025; **Senior Freeze** for 65+ and people with disabilities requires "Total annual income...$172,475 or less"; ANCHOR also exists (AARP did not describe it). **These are large and they do not travel.** A New Jersey senior receiving Stay NJ plus Senior Freeze is not paying the headline bill, and the honest comparison must net them off. Flag this for the owner — it is the one place a naive property-tax comparison overstates the saving.
- Confidence: HIGH for the Tax Foundation and ACS figures; MEDIUM for the NJ relief program amounts (AARP only, not re-opened at nj.gov).

### 5.4 Sales tax
- State **6.625%**, average local **−0.02%**, combined **6.60%**, rank 30 of 50, max local 3.31%. Tax Foundation midyear 2026, as of July 1, 2026 (§0.2).
- The negative average local rate is real, not a typo. Tax Foundation footnote: "Some cities in New Jersey are in 'Urban Enterprise Zones,' where qualifying sellers collect sales tax at half the statewide rate (3.3125 percent). This is reflected as a small negative adjustment to the average local rate."
- **Groceries not taxed.** AARP New Jersey (updated April 6, 2026): "Exemptions include most groceries, most clothing and footwear, disposable paper products for household use, and prescription and over-the-counter medications." The controlling statute is N.J.S.A. 54:32B-8.2 — **UNVERIFIED here**, the nj.gov exemption pages 404'd today. Grocery treatment is MEDIUM confidence; state rate and combined rate are HIGH.
- **New Jersey exempts clothing entirely; South Carolina does not.** A New Jersey mover starts paying 8%–9% on clothes and shoes in Horry County. Small item, but it is the one sales-tax line where New Jersey clearly wins and the page should not pretend otherwise.
- General merchandise: 6.60% in NJ vs 8% unincorporated Horry / 9% City of Myrtle Beach. **Sales tax goes up on a move from New Jersey.**
- Confidence: HIGH for rates, MEDIUM for groceries and clothing.

### 5.5 Vehicles
- **No annual property or excise tax on vehicles.** New Jersey registration is a flat fee set by vehicle weight class and model year.
- NJ MVC "Registration and Title Fees", https://www.nj.gov/mvc/vehicles/regfees.htm (opened 2026-08-16), basic automobile registration fees: Class 7 (under 3,500 lbs, "older than 2 years") **$46.50**; Class 7 ("within 2 years") **$59.00**; Class 8 (over 3,500 lbs, "older than 2 years") **$71.50**. Older model-year classes run $35.50–$72.50.
- Zero-emission vehicle surcharge, same page: "Under New Jersey law effective July 1, 2024, zero emission vehicles (ZEVs) are subject to an annual fee in addition to the existing registration fee...Beginning July 1, 2024, the annual fee is $250. The annual fee increases $10 per year for four years thereafter."
- One-time purchase charges (AARP, Apr 6, 2026): "Vehicle purchases are subject to the state's 6.625 sales tax. In addition, the state charges a one-time 0.4 percent fee on purchases of new passenger automobiles that cost $45,000 or more."
- **South Carolina's annual vehicle tax is a genuine surprise for a New Jersey mover.** A NJ driver pays roughly $47–$72 a year regardless of what the car is worth. In Horry County the same car is taxed every year at 6% of fair market value times the full millage, school operating included, and the bill must clear before the plate renews. Estimate from §1.5: $30,000 car ≈ $362/yr unincorporated, ≈ $458/yr in Myrtle Beach, plus a $50 county road maintenance fee, plus a one-time **$250 Infrastructure Maintenance Fee** at first SC registration, within 45 days of the move.
- Confidence: HIGH.

### 5.6 Estate and inheritance tax
- **Estate tax: NONE, since 2018.** NJ Division of Taxation "Inheritance and Estate Tax", https://www.nj.gov/treasury/taxation/inheritance-estate/inheritance.shtml, Last Updated: Tuesday, 09/09/25 (opened 2026-08-16): "New Jersey Estate Tax is no longer imposed for individuals who died on or after January 1, 2018." History on the same page: exemption capped at $675,000 through December 31, 2016; $2 million for deaths in 2017; "On or after January 1, 2018, no Estate Tax will be imposed."
- **Inheritance tax: YES — and this is the one people get wrong.** New Jersey still levies a Transfer Inheritance Tax based on *who inherits*, not on estate size. NJ Division of Taxation "Inheritance Tax Beneficiary Classes", https://www.nj.gov/treasury/taxation/pdf/other_forms/inheritance/transferinheritanceclasses.pdf (opened 2026-08-16):
  - **Class A — fully exempt:** "Parent, Grandparent, Spouse, Child of a decedent (includes legally adopted child), Grandchild, great-grandchild, etc. of a decedent, Stepchild of a decedent (does not include a step-grandchild or great-step grandchild), Mutually acknowledged child, Civil union partner (after 2/19/2007), Domestic partner (after 7/10/2004)."
  - **Class C — $25,000 exemption, then 11%–16%:** "Brother or sister of a decedent, Spouse or surviving spouse of a child of a decedent, Civil union partner or surviving civil union partner (after 2/19/2007) of a child of a decedent."
  - **Class D — 15%–16%, no exemption:** "Anyone not included in Classes A, C, or E."
  - **Class E — exempt:** qualified charities, religious, educational and medical institutions, non-profits, the State of New Jersey and its subdivisions.
  - Rate/exemption figures cross-checked against Tax Foundation Oct 28, 2025 and Wealthspire Feb 4, 2026 (§0.6): NJ inheritance "11-16% (depending on inheritor's relationship with decedent)", $25,000 exemption.
- **Practical:** most buyers leave everything to a spouse and children, who are Class A and pay nothing, so New Jersey's inheritance tax is usually a non-event. Where it bites is a childless decedent leaving to siblings, nieces, nephews or friends. **South Carolina has neither tax** (§1.6), so a move removes it entirely — but this is estate-planning territory and belongs in a "talk to your attorney" line, not a claim.
- Confidence: HIGH.

### 5.7 Gas tax
- **49.1 cents per gallon, effective January 1, 2026.** NJ Department of the Treasury press release, published **December 1, 2025**, https://www.nj.gov/treasury/news/2025/12012025.shtml: "the PPGRT rate will increase on January 1, 2026 from 34.4 cents to 38.6 cents for gasoline"; "the Motor Fuels Tax, which is fixed at 10.5 cents for gasoline"; "the total tax rates that motorists will pay for gasoline and diesel fuel will be 49.1 cents and 56.1 cents, respectively." AARP New Jersey (Apr 6, 2026) independently gives "49.1 cents per gallon".
- **This supersedes the Tax Foundation July 2025 figure of 44.95 cents in §0.5.** Use 49.1 cents for 2026.
- SC is 28.75 cents (§1.7). A New Jersey driver saves about **20.4 cents a gallon** — the largest per-gallon drop of the five priority states. On 12,000 miles a year at 25 mpg that is roughly $98 a year. Real, but small next to the property tax; do not oversell it.
- Confidence: HIGH.

### 5.8 Moving OUT of New Jersey to South Carolina — the "exit tax"
- **It is not a tax. It is estimated income tax withheld at closing when the seller is already a non-resident, and it is credited back on the return.** NJ Division of Taxation Technical Bulletin **TB-57(R), "Estimated Gross Income Tax Payment Requirements on Sales of New Jersey Real Property by Nonresidents", revised June 15, 2026**, https://www.nj.gov/treasury/taxation/pdf/pubs/tb/tb57r.pdf (opened 2026-08-16): "In general, a nonresident individual, estate, or trust that sells or transfers real property in New Jersey must make an estimated Gross Income Tax payment prior to the recording of the deed as provided by N.J.S.A. 54A:8-8 through 8-10. The seller...is required to remit the payment to the Division of Taxation before or at the closing and file the estimated tax form, **whether or not they have a gain** on the sale or transfer."
- **How much.** Same bulletin: "The nonresident taxpayer will calculate the estimated tax due by multiplying the reportable gain for federal income tax purposes, if any, by a tax rate equal to the highest rate for the tax year provided in N.J.S.A. 54A:2-1. In addition, the law requires that the estimated tax payment is **not less than 2% of the seller's consideration** for the sale or transfer stated in the deed affecting the conveyance." NJ DOT "FAQs on GIT Forms Requirements", https://www.nj.gov/treasury/taxation/gitrepfaqs.shtml (opened 2026-08-16), states the rate: "the gain on the sale or transfer is multiplied by the highest Gross Income Tax rate (**10.75%** effective 8-1-2004) for the taxable year...However, the estimated tax payment must not be less than 2% of the total consideration for the sale or transfer as stated in the deed of conveyance."
- **Even with no gain:** FAQ, verbatim — "Yes. Even if the seller/grantor do not recognize a gain, they are still required to pay at least 2% of the total consideration stated in the deed on or before the time of closing." And the deed cannot be recorded without it: "The law prohibits a county recording officer from recording, or accepting for recording, any deed for the sale or transfer of real property, unless it is accompanied by the appropriate GIT/REP form...and the payment of any estimated tax due."
- **It comes back.** FAQ: the seller "may then seek a refund based on the actual consideration received for the tax year or choose to credit/forward the overpaid balance to subsequent tax years." It is a prepayment reconciled on the New Jersey non-resident return, not money lost. **Say this explicitly on any page that mentions it — the phrase "New Jersey exit tax" is all over the internet and is wrong.**
- **The ordering trap, and this is the part that matters to a brokerage.** A seller who is still a New Jersey resident at closing checks box 1 on **GIT/REP-3 (Seller's Residency Certification/Exemption)** and nothing is withheld. A seller who has already moved to South Carolina is a non-resident at closing and must file **GIT/REP-1** with the payment. There is also an exemption where the property was a principal residence and the entire federal gain is excludable — FAQ: "a taxpayer can qualify for an exemption under I.R.C. Section 121 if the real property being sold or transferred was used exclusively as a principal residence...However, if the entire gain cannot be excluded from gross income, s/he does not qualify for the exemption."
- **Copy line:** if the New Jersey home sells after the move, expect 2% of the sale price to be held back at closing and refunded later; if it sells before the move, it usually is not. Tell them to raise it with their New Jersey closing attorney early. Do not advise on sequencing — that is legal and tax advice.
- Also note New Jersey, like New York, will test a claimed domicile change. Specifics of New Jersey's residency audit standard were **not opened at a primary source today — UNVERIFIED.** Do not describe New Jersey's domicile test in copy without checking it.
- Confidence: HIGH for the withholding mechanics (TB-57(R) revised June 15, 2026 and the DOT FAQ, both quoted); UNVERIFIED for NJ residency-audit standards.

---

## 6. PENNSYLVANIA (origin priority 5)

### 6.1 Income tax, tax year 2026
- Structure: **flat 3.07%** on eight enumerated classes of income. Same for every filing status. Tax Foundation 2026 (§0.1): "PA 3.07% > $0", no standard deduction, no personal exemption, no dependent exemption. AARP Pennsylvania State Tax Guide, updated March 24, 2026, https://www.aarp.org/states/pennsylvania/state-taxes-guide/: "Pennsylvania has a flat state income tax of 3.07 percent" on net income.
- **No standard deduction and no personal exemption.** Pennsylvania instead has Tax Forgiveness (Schedule SP), a low-income credit — **UNVERIFIED here**, income limits not re-opened at a primary source today.
- Pennsylvania does not allow the federal-style pre-tax treatment of retirement contributions: PA DOR Personal Income Tax Guide, Gross Compensation chapter, https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/gross-compensation (opened 2026-08-16): "**Employee contributions to any retirement plan are always taxable as compensation.**" A Pennsylvanian has already paid 3.07% on money going into a 401(k). This matters when comparing lifetime burden, not the current-year bill.
- No scheduled rate changes identified for 2026 or 2027 — **UNVERIFIED as a negative.**
- **Local earned income tax is on top, and it is nearly universal.** AARP (Mar 24, 2026): "Most municipalities levy local income taxes," with the highest at 3.75% in Chester City and 3.74% in Philadelphia. Tax Foundation footnote (a) (§0.1) puts Pennsylvania's average effective local income tax rate at **1.07%**. So a working Pennsylvanian's real combined rate is commonly around 4%, and a Philadelphia resident's is close to 6.8%.
- **South Carolina has no local income tax** (§1.1). For a working household leaving Philadelphia, the local wage tax is the single biggest income-tax item in the whole comparison.
- Confidence: HIGH for the state rate and the absence of deductions; MEDIUM for the local rates (AARP); UNVERIFIED for Tax Forgiveness limits.

### 6.2 Retirement income — Pennsylvania taxes none of it
- **This is the one origin state where the income-tax move is clearly backwards, and the page must say so.**
- **Social Security: not taxed.** AARP (Mar 24, 2026): "Retirement income, including Social Security, is not taxed in Pennsylvania." Military retirement also exempt: "Pennsylvania does not tax military retirement pensions."
- **Pensions, 401(k), 403(b), IRA and Roth IRA distributions: not taxed, once you are retired.** PA DOR Personal Income Tax Guide, Gross Compensation chapter (opened 2026-08-16), verbatim: "**Under Pennsylvania law, payments commonly recognized as old age or retirement benefits are not subject to tax. In order to be considered exempt retirement benefits, the payments must come from an eligible Pennsylvania retirement plan and must be paid to persons retired from service after reaching a specific age or after a stated period of employment.**"
- Which plans qualify, same guide: "Generally, eligible Pennsylvania retirement plans include qualified pension plans under Section 401(a) of the Internal Revenue Code (defined benefit plans and defined contributions plans), IRAs (individual retirement accounts and annuities), Roth IRAs, Simplified Employee Pension Plans (SEPs), and Keogh plans."
- IRAs specifically: "the department will consider the distributions exempt retirement income so long as the taxpayer is not required to pay a penalty for early withdrawal. For example, if a taxpayer received a distribution from an IRA after retirement, death, disability, separation from service unforeseeable emergency or attaining the age of 59½ and a penalty is not paid, the distribution is not included in the taxpayer's compensation."
- **The exception:** "Distributions from an eligible Pennsylvania retirement plan before retirement age or years of service are taxable in the year received to the extent that the distributions exceed previously taxed contributions. Early distributions are deemed to come from previously taxed contributions first (cost recovery method)." So a 55-year-old pulling from a 401(k) does pay PA tax on the earnings portion.
- **Comparison for copy — be honest.** A retired Pennsylvanian pays **zero** state and zero local income tax on pension, 401(k) and IRA income. In South Carolina the same income lands in federal AGI and is then reduced by the SCIAD ($30,000 joint, phasing out above $80,000 of AGI), the retirement income deduction ($3,000 under 65 / $10,000 at 65+ per taxpayer) and the age-65 deduction ($15,000 per qualifying spouse, net of the retirement deduction) — see §1.1 and §1.2. For a typical retired couple the resulting South Carolina bill is small, but it is **not zero, and Pennsylvania's is**. Do not compute a figure for a named household and do not imply an income-tax saving. The Pennsylvania story is property tax, gas and inheritance tax, not income tax.
- Confidence: HIGH (PA DOR PIT Guide quoted verbatim).

### 6.3 Property tax
- Statewide effective rate **1.26%** (2024; 1.31% in 2023), rank 12 of 50. Tax Foundation, published March 16, 2026 (§0.3). AARP (Mar 24, 2026) agrees: "The effective property tax rate for Pennsylvania was 1.26 percent of a home's assessed value."
- Statewide median real estate taxes paid **$3,214** (ACS 2024 1-year, §0.4).
- Main origin counties (median home value / median taxes paid / effective rate, ACS 2020–2024, §0.3):
  - **Montgomery** $436,700 / $5,875 / **1.29%**
  - **Bucks** $445,700 / $5,826 / **1.20%**
  - **Chester** $485,600 / $6,308 / **1.22%**
  - **Delaware** $332,200 / $6,124 / **1.62%**
  - **Allegheny** (Pittsburgh) $227,600 / $3,451 / **1.47%**
  - **Philadelphia** $243,100 / $2,003 / **0.85%**
- **Montgomery and Bucks are the clean comparison:** roughly $5,800–$5,900 a year on a $440,000 house, against about $1,470 on a $400,000 owner-occupied home in unincorporated Horry County (arithmetic on §1.3). Philadelphia is the exception at 0.85% — a Philadelphia rowhouse owner will not see the same drop, though their bill is low because the house is cheap, not because the county is generous.
- Pennsylvania relief left behind (AARP, Mar 24, 2026): Property Tax/Rent Rebate for 65+, rebates "ranging from $380 to $1,000", income limit "$48,110". Modest next to New Jersey's programs; netting it off does not change the conclusion.
- Confidence: HIGH for Tax Foundation/ACS; MEDIUM for the rebate figures (AARP only).

### 6.4 Sales tax
- State 6.00%, average local 0.34%, combined **6.34%**, rank 34 of 50, max local 2.00% (Philadelphia adds 2%, Allegheny 1%). Tax Foundation midyear 2026, as of July 1, 2026 (§0.2).
- **Groceries not taxed, and neither is clothing.** AARP (Mar 24, 2026): "Sales tax exemptions include most groceries, candy and gum, most clothing, pharmaceutical drugs and residential heating fuels." Pennsylvania is one of the few states that exempts candy and gum as well. The controlling statute is 72 P.S. § 7204 — **UNVERIFIED here.**
- **Sales tax goes up on a move from Pennsylvania**, and by more than the headline: 6.34% average to 8% in unincorporated Horry / 9% in the City of Myrtle Beach, plus clothing becomes taxable. Groceries stay exempt in both.
- Confidence: HIGH for rates; MEDIUM for the exemption list.

### 6.5 Vehicles
- **No annual property or excise tax on vehicles.** Pennsylvania charges a flat annual registration fee.
- PennDOT Form **MV-70S (4-26), "Bureau of Motor Vehicles Schedule of Fees"**, https://www.pa.gov/content/dam/copapwp-pagov/en/penndot/documents/public/dvspubsforms/bmv/bmv-forms/mv-70s.pdf (opened 2026-08-16). Standard registration fees, Passenger class: **"$48.00"** one year, **"$96.00"** two year. Certificate of Title **$72.00**. "Fee for Local Use - Annual fee for non-exempt vehicles due at the time of initial registration and at the time registration is renewed" — $5 in participating counties.
- New for 2026, same form: "2026 ROAD USER CHARGE FEES" — Electric Vehicle flat fee **$250** for a 1-year registration ($500 for two years); Plug-In Hybrid **$63** for one year ($126 for two).
- A Pennsylvanian therefore pays about **$48–$53 a year** for a gasoline car, regardless of value.
- **South Carolina's annual vehicle tax is a surprise.** Estimate from §1.5: a $30,000 car ≈ $362/yr in unincorporated Horry, ≈ $458/yr inside Myrtle Beach, plus the $50 county road maintenance fee, plus a one-time **$250 Infrastructure Maintenance Fee** at first SC registration, within 45 days of the move. Two cars can mean $700–$1,000 a year that did not exist in Pennsylvania.
- Confidence: HIGH.

### 6.6 Estate and inheritance tax — the Pennsylvania one people underestimate
- **Estate tax: none.** Tax Foundation, Oct 28, 2025 (§0.6): Pennsylvania appears in the inheritance-tax table only.
- **Inheritance tax: YES, and there is no exemption threshold.** PA Department of Revenue "Inheritance Tax", https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/inheritance-tax (opened 2026-08-16), verbatim: "The rates for Pennsylvania inheritance tax are as follows: **0 percent** on transfers to a surviving spouse or to a parent from a child aged 21 or younger; **4.5 percent** on transfers to direct descendants and lineal heirs; **12 percent** on transfers to siblings; and **15 percent** on transfers to other heirs, except charitable organizations, exempt institutions and government entities exempt from tax." Also: "Property owned jointly between spouses is exempt from inheritance tax." Payment timing: "Inheritance tax payments are due upon the death of the decedent and become delinquent nine months after the individual's death. If inheritance tax is paid within three months of the decedent's death, a 5 percent discount is allowed."
- **Unlike New Jersey, Pennsylvania taxes transfers to children.** 4.5% from the first dollar, no exemption. Tax Foundation §0.6 lists PA inheritance as "no exemption, 0–15%". A Pennsylvania parent leaving a $600,000 estate to two children generates roughly $27,000 of Pennsylvania inheritance tax; the same estate in South Carolina generates none (§1.6). This is the largest single-event difference in the Pennsylvania comparison. **State it as a fact about the two states, never as planning advice.**
- Confidence: HIGH.

### 6.7 Gas tax
- **57.6 cents per gallon, effective January 1, 2026.** PA Department of Revenue "Motor Fuel Tax Rates", https://www.pa.gov/agencies/revenue/resources/tax-rates/motor-fuel-tax-rates (opened 2026-08-16): "The following rates are effective Jan. 1, 2026, and apply to tax periods through calendar year 2026" — "Liquid fuels (motor gasoline and gasohol) **$0.576/gallon**"; fuels (undyed diesel and undyed kerosene) $0.741/gallon. The 2025 table on the same page shows the identical $0.576 — the rate did not change. AARP (Mar 24, 2026) agrees: "Gasoline is taxed at 57.6 cents per gallon."
- **Minor discrepancy:** Tax Foundation (§0.5) shows 58.70 cents for July 2025, about 1.1 cents higher, because its figure adds other per-gallon taxes and fees beyond the DOR rate. Use **57.6 cents** as the Pennsylvania motor fuel tax and cite PA DOR; if you need the all-in figure, cite Tax Foundation and say so.
- SC is 28.75 cents (§1.7). A Pennsylvanian saves about **28.9 cents a gallon** — Pennsylvania has the highest gas tax of the five priority origin states and the biggest per-gallon drop.
- Confidence: HIGH.

### 6.8 Moving OUT of Pennsylvania to South Carolina — the gotcha
- **Pennsylvania's inheritance tax follows Pennsylvania real estate even after you stop being a Pennsylvanian.** PA DOR Form **REV-1737-A, "Inheritance Tax Return Nonresident Decedent"** and its instructions, https://www.pa.gov/content/dam/copapwp-pagov/en/revenue/documents/formsandpublications/formsforindividuals/inheritancetax/documents/rev-1737-a.pdf (opened 2026-08-16), quoting Section 2116(b)(2) of the Inheritance and Estate Tax Act of 1991: "**When the decedent was a nonresident, the tax shall be computed upon the value of real property and tangible personal property having its situs in this Commonwealth**, in excess of unpaid property taxes assessed on the property and any indebtedness for which it is liened, mortgaged or pledged, at the rates in effect at the transferor's death." So a buyer who moves to Myrtle Beach but keeps the Bucks County house has not escaped Pennsylvania inheritance tax on that house — the estate files a nonresident return and pays at the same 4.5% / 12% / 15% rates.
- **Second gotcha, and it runs the other way:** Pennsylvania is the only one of the five priority origin states that taxes no retirement income at all (§6.2). A retiree moving from Pennsylvania to South Carolina starts paying state income tax on a pension for the first time. It is usually a small number after South Carolina's deductions, but it is not zero, and a page that implies "you'll pay less income tax" is wrong for this state. **Say the property tax, the gas tax and the inheritance tax are the wins, and leave income tax alone.**
- Pennsylvania residency/domicile rules for the year of the move and the part-year PA-40 mechanics were **not opened at a primary source today — UNVERIFIED.** Pennsylvania has no equivalent of Ohio's contact-period statute or New York's statutory-residence test that surfaced in this research, but that absence was not confirmed.
- Confidence: HIGH for the nonresident inheritance-tax rule and the retirement-income point; UNVERIFIED for PA residency mechanics.

---

## 7. SECONDARY ORIGIN STATES

**Read this header before using anything below it.** Sections 1–6 (SC and the five priority origins) were built by opening statutes, departments of revenue and DMV fee schedules directly. Sections 7.1–7.10 are shallower: the income brackets, sales tax, property tax, gas tax and estate/inheritance figures come from the Tax Foundation tables in §0, which were opened today, but the **retirement, vehicle and gotcha items lean on the AARP state tax guides** (all updated March–April 2026) with a primary source opened only where noted. Confidence is **MEDIUM unless a line says otherwise**. Do not put a retirement or vehicle figure from this section on a page without opening the state's own source first.

---

### 7.1 MARYLAND
- **Income tax:** graduated, 2%–6.50%. Full 2026 schedule in §0.1. Std deduction $3,350 / $6,700; personal exemption $3,200 / $6,400, phasing out $100k–$150k single and $150k–$200k MFJ. AARP Maryland State Tax Guide, updated **April 2, 2026**, https://www.aarp.org/states/maryland/state-taxes-guide/: "2 percent to 6.5 percent."
- **Local income tax is the highest in the country.** Every county and Baltimore City levies one; AARP: "All municipalities charge wage taxes; rates vary by jurisdiction." Tax Foundation footnote (a), §0.1: Maryland's average effective local income tax rate is **2.51%**, first in the nation. A Marylander's real rate is roughly 7%–9%. **South Carolina has none.** This is the largest single item in the Maryland comparison.
- **Retirement:** Social Security not taxed. AARP: pension exclusion "Up to $41,200 for residents 65+ (2025 tax year), no income limit." Military: subtract up to $12,500 under 55, $20,000 at 55+. **UNVERIFIED at Maryland Comptroller — the $41,200 is indexed annually and the 2026 figure was not opened.**
- **Property tax:** 0.92% effective (rank 21), median bill **$4,144**. Counties (§0.3): Montgomery 0.85% / $5,539; Howard 1.11% / $6,987; Baltimore County 0.96% / $3,736; Anne Arundel 0.80% / $3,957.
- **Sales tax:** 6.00% state, **0.00% local**, combined 6.00% (rank 38). Groceries exempt (AARP).
- **Vehicles: no annual property tax.** One-time excise on purchase, AARP: "6.5 percent on auto purchases based on the vehicle's book value." Annual registration fee UNVERIFIED. **SC's annual vehicle tax is a surprise for a Marylander.**
- **Estate AND inheritance tax — Maryland is the only state with both** (Tax Foundation, Oct 28, 2025, §0.6): estate exemption **$5,000,000**, rates 0.8%–16%; inheritance tax with a $1,000 exemption, 0%–10%. AARP: inheritance "10 percent" on property to non-qualified heirs. Direct lineal heirs are exempt from the inheritance tax.
- **Gas tax:** 46.19 cents (Tax Foundation, July 2025); AARP (Apr 2, 2026) says 46 cents. Consistent. SC 28.75 — saving about **17.4 cents/gal**.
- **Gotcha:** the county income tax is what actually falls away, not the state rate, and Maryland is the only origin state that will charge both an estate tax at $5M and an inheritance tax on non-lineal heirs. Maryland residency/domicile audit standards: **UNVERIFIED.**

### 7.2 VIRGINIA
- **Income tax:** graduated, 2% / 3% / 5% / 5.75%, top rate hitting at just **$17,000** of taxable income (§0.1). Std deduction $8,750 / $17,500; personal exemption $930 / $1,860. AARP Virginia State Tax Guide, updated **April 1, 2026**, https://www.aarp.org/states/virginia/state-tax-guide/: "a progressive tax with four brackets, ranging from 2 percent on income $3,000 and under to 5.75 percent on anything over $17,000 plus $720." Effectively a flat 5.75% for anyone with real income.
- No local income tax.
- **Retirement:** Social Security not taxed — AARP: "No, the state does not tax Social Security income." Age deduction "of up to $12,000" at 65+, phasing out "by $1 for every $1 that federal adjusted gross income exceeds $50,000 for single taxpayers or $75,000 for married taxpayers"; plus "an exemption of $800 for residents who are 65 and older." Military retirement: "$40,000 subtraction." Pensions, 401(k) and IRA withdrawals are otherwise fully taxed.
- **Property tax:** 0.78% effective (rank 28), median bill **$2,872**. Counties (§0.3): Fairfax 0.95% / $7,368; Loudoun 0.80% / $6,325; Prince William 0.85% / $4,999; Virginia Beach city 0.78% / $3,061.
- **Sales tax:** 5.30% state (includes a 1% mandatory local component), 0.47% average local, combined **5.77%** (rank 41) — the lowest of any origin state here. Groceries: the state rate was removed; a **1% local tax on food remains**. UNVERIFIED at Virginia Tax.
- **Vehicles: YES, an annual value-based tax.** AARP: vehicles face "a sales tax of 4.15 percent of a vehicle's gross purchase price" plus "an annual personal property tax at the city and county level" based on vehicle value. **This is the famous Virginia car tax, and it means South Carolina's annual vehicle tax is NOT a surprise for a Virginian.** Do not use the vehicle-tax-surprise framing for Virginia — say instead that the mechanism is familiar and point them at the 45-day registration deadline and the one-time $250 IMF (§1.5).
- **Estate and inheritance tax: neither.** AARP: "No, the state does not have an inheritance or estate tax." Tax Foundation confirms Virginia absent from both (§0.6).
- **Gas tax — CONTRADICTION, do not publish a figure.** Tax Foundation (July 2025, §0.5) gives **41.60 cents**; AARP (April 1, 2026) gives **31.7 cents**. The gap is about 10 cents and is too large to be rounding — the two are almost certainly counting Virginia's regional transportation fuels taxes differently. Needs a human check at tax.virginia.gov before any number appears in copy.
- **Gotcha:** Virginia's top 5.75% bracket starts at $17,000, so the headline "Virginia is 5.75%, South Carolina is 5.21%" understates how close the two are once South Carolina's 1.99% first bracket and the SCIAD are applied. The real Virginia wins on a move are small; the vehicle tax is a wash; the sales tax goes UP (5.77% to 8%–9%).

### 7.3 CONNECTICUT
- **Income tax:** graduated, 2%–**6.99%**, 7 brackets (§0.1). No standard deduction; personal exemption $15,000 / $24,000, phasing out. AARP Connecticut State Tax Guide, updated **March 17, 2026**, https://www.aarp.org/states/connecticut/state-tax-guide/: "seven tax brackets and a top marginal rate of 6.99 percent."
- **Tax benefit recapture**, same as New York. Tax Foundation footnote (i), §0.1: "Connecticut and New York have 'tax benefit recapture,' by which many high-income taxpayers pay their top tax rate on all income, not just on amounts above the benefit threshold."
- **Retirement — generous, but on AGI cliffs.** AARP (Mar 17, 2026): Social Security is fully exempt below **$75,000 AGI single / $100,000 MFJ**; above that, deduct up to 25% of benefits. Pension and annuity income gets "a 100 percent deduction" below the same $75,000 / $100,000 thresholds, phasing out entirely at **$100,000 / $150,000**. Connecticut General Assembly OLR and CT DRS material found in search (2026 IP-2026-7, opened only in summary form — **MEDIUM**) adds that the IRA-distribution deduction phases in at 50% for 2024, 75% for 2025 and **100% beginning in 2026**, and that railroad retirement and military retirement pay get a 100% deduction.
- **Under the AGI thresholds, Connecticut taxes retirement income at zero and South Carolina does not.** Over them, Connecticut is worse. Say which side of the line before claiming anything.
- **Property tax:** **1.54%** effective, **rank 3 of 50**, median bill **$6,573**. Census now uses planning regions, not counties (§0.3): Western Connecticut Planning Region (Greenwich–Stamford–Danbury) 1.17% / $9,295; Greater Bridgeport 1.65% / $8,670; Capitol Region (Hartford) 1.91% / $6,454; South Central (New Haven) 1.82% / $6,759.
- **Sales tax:** 6.35% state, **0.00% local**, combined 6.35% (rank 33). Groceries and prescription medications exempt (AARP). Vehicles taxed at purchase at 6.35%, "7.75 percent for vehicles with a sales price over $50,000."
- **Vehicles: Connecticut towns levy an annual municipal motor vehicle property tax.** AARP did not mention it and no primary source was opened today — **UNVERIFIED, but almost certainly true**, and it matters because it would mean South Carolina's vehicle tax is familiar rather than surprising to a Connecticut mover. **Check this before writing either framing.**
- **Estate tax: yes, and the exemption is now very high.** AARP: for 2025 deaths "the Connecticut estate tax exemption amount is $13.99 million," flat 12%. Connecticut conforms to the federal exemption, so §0.6 (Wealthspire, Feb 4, 2026) puts 2026 at **$15,000,000**. No inheritance tax. Practically, Connecticut's estate tax reaches almost nobody now.
- **Gas tax:** 25.00 cents (Tax Foundation, July 2025); AARP (Mar 17, 2026): "Gasohol is $0.25 per gallon." Consistent. **Connecticut is below South Carolina's 28.75 cents** — like New York, gas tax goes UP on this move. Do not list it as a saving.
- **Gotcha:** the AGI cliffs. A Connecticut retiree at $99,000 of AGI pays no state tax on Social Security or pension; at $101,000 the pension deduction starts unwinding and the Social Security exemption is already gone. Combined with tax benefit recapture at the top, Connecticut's effective rates jump in steps. That, plus 1.54% property tax, is the story.

### 7.4 MASSACHUSETTS
- **Income tax:** 5.00% flat, plus a **4% surtax on income above $1,083,150** (2025 threshold, indexed) — the "millionaires tax". §0.1. No standard deduction; personal exemption $4,400 / $8,800. AARP Massachusetts State Tax Guide, updated **April 1, 2026**, https://www.aarp.org/states/massachusetts/state-taxes-guide/: "5 percent flat income tax for most residents, plus a 4 percent surtax on any income exceeding $1,083,150 in 2025." Short-term capital gains taxed at 8.5%.
- No local income tax.
- **Retirement:** Social Security not taxed — AARP: "Massachusetts does not tax Social Security benefits." Military pensions "are excluded from Massachusetts's gross income and aren't taxed by the state." Private pensions, 401(k) and IRA withdrawals are taxed at 5%; Massachusetts and US government contributory pensions are generally exempt — **UNVERIFIED, AARP did not address it.**
- **Property tax:** 1.00% effective (rank 16), median bill **$6,080** — the third-highest median bill in this file after New Jersey and Connecticut, because Massachusetts home values are high even though the rate is moderate. Counties (§0.3): Middlesex 1.01% / $7,501; Norfolk 1.02% / $7,261; Essex 1.02% / $6,430; Worcester 1.25% / $5,438. Senior circuit breaker credit, 2025 maximum $2,820 (AARP).
- **Sales tax:** 6.25% state, **0.00% local**, combined 6.25% (rank 35). Groceries exempt and "clothing less than $175 per item" exempt (AARP).
- **Vehicles: YES, an annual motor vehicle excise.** AARP: "An annual excise tax of '$25 per $1,000 of the vehicle's value' applies" — 2.5% of a statutory depreciated value, billed by the city or town. **So South Carolina's annual vehicle tax is not a surprise for a Massachusetts mover, and at 2.5% the Massachusetts rate is higher than Horry County's roughly 1.2% effective rate on a car (6% ratio x ~201 mills).** A Massachusetts mover's vehicle tax likely goes DOWN. Verify the Massachusetts valuation schedule before quantifying.
- **Estate tax: YES, and the threshold is one of the lowest in the country — $2,000,000.** AARP: taxable above $2 million, rates 0.8%–16%, with "a $99,600 credit...for estates of residents who died on or after January 1, 2023." Tax Foundation §0.6 confirms $2,000,000 / 0.8–16%. No inheritance tax. **A Massachusetts couple with a $900,000 house and $1.2M in retirement accounts is already over the line.** South Carolina has no estate tax at all (§1.6) — for Massachusetts this is a genuinely large difference and probably the single strongest non-property-tax argument in the file. Note: Massachusetts may still tax Massachusetts real estate in a non-resident's estate — **UNVERIFIED**, same pattern as Pennsylvania's inheritance tax (§6.8). Check before writing it.
- **Gas tax:** 27.47 cents (Tax Foundation, July 2025); AARP (Apr 1, 2026): "Gasoline and diesel are both taxed at 24 cents per gallon." The ~2.5 cent gap is the underground storage tank fee that Tax Foundation includes. Either figure is **below South Carolina's 28.75** — gas tax goes up on this move too. Do not list it as a saving.
- **Gotcha:** the $2M estate tax threshold, and the fact that gas and vehicle taxes both favour Massachusetts. The honest Massachusetts pitch is property tax dollars, income tax rate, and the estate tax — not the small stuff.

### 7.5 MICHIGAN
- **Income tax:** 4.25% flat (§0.1). No standard deduction; personal exemption **$5,900 / $11,800** and $5,900 per dependent — the most generous exemption of any origin state here. AARP Michigan State Tax Guide, updated **March 13, 2026**, https://www.aarp.org/states/michigan/state-taxes-guide/: "4.25 percent flat tax, with a personal exemption of $5,800 for each taxpayer and dependent." (AARP's $5,800 is the 2025 figure; Tax Foundation's 2026 table gives $5,900. Use $5,900 for 2026.)
- **City income taxes:** 24 Michigan cities levy one (Detroit is the largest). Tax Foundation footnote (a): Michigan's average effective local income tax rate is **0.18%**, low because most residents live outside those cities.
- **Retirement — in the middle of a multi-year restoration and the tiers are messy.** Social Security not taxed. AARP (Mar 13, 2026): "For those born before 1946, there's a 75% subtraction on eligible retirement income. Those born 1946-1952 can deduct up to $20,000 (single) or $40,000 (joint filing)." Michigan's 2023 law phases the pre-2012 pension deduction back in through tax year 2026, so **the 2026 tier structure is UNVERIFIED and AARP's description may be a prior-year snapshot. Do not publish Michigan retirement figures without opening michigan.gov/treasury.**
- **Property tax:** 1.19% effective (rank 14), median bill **$2,988**. Counties (§0.3): Oakland 1.25% / $4,371; Wayne 1.47% / $2,904; Macomb 1.23% / $3,404. AARP gives the county range as 0.66%–1.76%.
- **Sales tax:** 6.00% state, **0.00% local**, combined 6.00% (rank 38). Groceries exempt (AARP).
- **Vehicles: no annual property tax, but Michigan's registration fee is itself value-based**, calculated from the vehicle's original MSRP rather than a flat amount — **UNVERIFIED here**, AARP gave no registration detail. Check before framing South Carolina's vehicle tax as a surprise for a Michigander.
- **Estate and inheritance tax: neither.** AARP: "Michigan has no inheritance tax for deaths after September 30, 1993." Tax Foundation confirms Michigan absent from both (§0.6).
- **Gas tax — CONTRADICTION.** Tax Foundation (July 2025) gives **48.20 cents**; AARP (March 13, 2026) gives **52.4 cents**. Michigan indexes its motor fuel tax annually *and* applies sales tax to fuel, so both can be defensible depending on what is counted. Roughly 20–24 cents above South Carolina's 28.75 either way, but **do not publish a specific Michigan figure without a primary source.**
- **Gotcha:** the retirement-income tiers are the moving part and they turn on the taxpayer's birth year, not their age today. Nothing about Michigan's tax code makes leaving hard.

### 7.6 ILLINOIS
- **Income tax:** 4.95% flat (§0.1). No standard deduction; personal exemption $2,925 / $5,850. AARP Illinois State Tax Guide, updated **March 16, 2026**, https://www.aarp.org/states/illinois/state-taxes-guide/: "4.95 percent flat tax."
- **Retirement income is NOT taxed at all — Illinois is the second Pennsylvania on this list.** Illinois Department of Revenue (tax.illinois.gov, Publication 120 "Retirement Income" and the IL-1040 subtraction guidance, opened in search-index form 2026-08-16 — **MEDIUM, the PDF itself was not opened**): Illinois does not tax the federally taxed portion of qualified employee benefit plans including 401(k) plans, IRAs, self-employed retirement plans, or a traditional IRA converted to a Roth. Social Security is likewise subtracted. AARP: "Illinois does not tax Social Security benefits."
- **So an Illinois retiree pays zero state income tax on pension, 401(k) and IRA income, and starts paying in South Carolina.** Same honesty rule as Pennsylvania (§6.2): do not claim an income-tax saving for an Illinois mover.
- **Property tax: 1.88% effective — rank 2 of 50, essentially tied with New Jersey.** Median bill **$5,399**. Counties (§0.3): **Lake 2.26% / $8,923**; DuPage 1.89% / $8,007; Cook 1.73% / $6,191. Lake County's 2.26% is the highest effective rate on any county in this file. Senior programs (AARP): Assessment Freeze Homestead Exemption at 65+ with income at or below $65,000 rising to $75,000 by 2026, and a Senior Citizens Homestead Exemption worth up to $8,000 of EAV in the Cook County area, $5,000 elsewhere.
- **Sales tax:** 6.25% state, 2.73% average local, combined **8.98%** — rank 8, and **higher than unincorporated Horry County's 8%**, though below the City of Myrtle Beach's 9%. AARP gives "8.96 percent". Groceries: exempt from the state rate, but AARP notes "local municipalities may impose a 1 percent sales tax on groceries."
- **Vehicles: no annual property tax.** Illinois registration is a flat annual fee (commonly cited around $151 for a passenger car) — **UNVERIFIED.** South Carolina's annual vehicle tax is a surprise for an Illinoisan.
- **Estate tax: YES, $4,000,000 exemption**, 0.8%–16% (Tax Foundation §0.6; AARP: "unless the estate's gross value exceeds $4 million"). No inheritance tax. Second-lowest estate tax threshold in this file after Massachusetts.
- **Gas tax — LARGE CONTRADICTION, do not publish.** Tax Foundation (July 2025, §0.5) gives **66.40 cents**; AARP (March 16, 2026) gives **48.3 cents**. That is an 18-cent gap. Tax Foundation's figure includes the state sales tax applied to motor fuel and local motor fuel taxes; AARP's looks like the motor fuel tax alone. Both are well above South Carolina's 28.75, but **the specific number must be re-derived from a primary source.**
- **Gotcha:** property tax at 1.88% is the headline win and it is a real one, but it is offset by the fact that Illinois charges no income tax on retirement income and South Carolina does. For a retired Illinois couple the two move in opposite directions — run both.

### 7.7 GEORGIA
- **Income tax:** flat. Tax Foundation's 2026 table (§0.1) prints **5.19%** and notes: "HB 111—enacted in April of 2025—accelerated these tax cuts, reducing the income tax rate from 5.39 percent to 5.19 percent, retroactive to January 1, 2025." AARP Georgia State Tax Guide, updated **March 12, 2026**, https://www.aarp.org/states/georgia/state-taxes-guide/: "Income tax: 5.19 percent flat tax in 2025." **Georgia's law schedules further 0.10-point annual reductions toward 4.99% subject to revenue triggers, so the 2026 rate may be 5.09%. UNVERIFIED — do not publish a 2026 Georgia rate without checking dor.georgia.gov.**
- Std deduction $12,000 / $24,000; dependent exemption $4,000 (§0.1). No local income tax.
- **Retirement:** Social Security not taxed — AARP: "No. Georgia does not tax Social Security benefits." Georgia Department of Revenue "Retirement Income Exclusion", https://dor.georgia.gov/retirement-income-exclusion (opened 2026-08-16): "Taxpayers who are 62 or older, or permanently and totally disabled regardless of age, may be eligible for a retirement income adjustment." Qualifying income includes "Income from pensions and annuities, Interest income, Dividend income, Net income from rental property, Capital gains income, Income from royalties, Up to $5,000 of earned income." And: "For married couples filing joint returns with both members receiving retirement income, the maximum adjustment for that year may be up to twice the individual exclusion amount. Retirement income exceeding the maximum adjustable amount will be taxed at the normal rate." **The dollar amounts are not on that page — DOR points to Form IT-511. The commonly cited figures are $35,000 for ages 62–64 and $65,000 for 65+, per taxpayer; these are UNVERIFIED here.** Military retirement, per DOR: "$17,500 of military retirement income can be excluded for taxpayers under 62 years of age and an additional $17,500 can be excluded for taxpayers with more than $17,500 of earned income in Georgia."
- **Property tax:** 0.79% effective (rank 25), median bill **$2,554**. Counties (§0.3): Fulton 0.89% / $4,033; Gwinnett 0.93% / $3,617; Cobb 0.69% / $2,720.
- **Sales tax:** 4.00% state, **3.56%** average local, combined **7.56%** (rank 18), max local 5.00%. Groceries exempt from the state rate but local taxes apply — AARP: "Food, prescription medication, lottery tickets and other items are exempt from statewide sales tax but may be subject to local sales taxes."
- **Vehicles: mostly no annual property tax.** Georgia replaced the annual ad valorem tax with a one-time **Title Ad Valorem Tax (TAVT)** at purchase — AARP: "The Title Ad Valorem Tax when a vehicle is purchased is 7 percent." Vehicles still on the pre-2013 system pay an annual ad valorem tax. **So for most Georgians, South Carolina's annual vehicle tax IS new.**
- **Estate and inheritance tax: neither.** AARP: "Georgia has no inheritance or estate tax." Tax Foundation confirms (§0.6).
- **Gas tax:** AARP (March 12, 2026): "Gasoline and diesel fuels are taxed at 33 and 37 cents per gallon, respectively, as of Jan. 1, 2026." Tax Foundation (July 2025) gives 33.85. Consistent. SC 28.75 — saving about **4.3 cents/gal**, the smallest of any origin state.
- **Gotcha: Georgia is South Carolina's closest peer and the honest answer is that very little changes.** Income tax rate is similar, property tax is a bit higher in Georgia, sales tax is a bit lower in Georgia, neither has an estate tax, and Georgia's retirement exclusion at 65+ is more generous than South Carolina's. The two real differences are South Carolina's annual vehicle tax (new for most Georgians) and Horry County's 0.38% property tax against Fulton's 0.89%. **Do not build a "big tax savings" page for Georgia buyers — it will not survive scrutiny.**

### 7.8 FLORIDA
- **Income tax: NONE** (§0.1). South Carolina's is new.
- **Property tax:** 0.78% effective (rank 27), median bill **$2,993**. Counties (§0.3): Broward 0.96% / $3,890; Miami-Dade 0.81% / $3,744; Palm Beach 0.82% / $3,858; Hillsborough 0.84% / $3,010; Orange 0.82% / $2,967.
- **Sales tax:** 6.00% state, 0.98% average local, combined **6.98%** (rank 28). Groceries exempt — **UNVERIFIED here.**
- **Vehicles:** no annual value-based property tax; Florida charges a large one-time initial registration fee plus annual weight-based fees — **UNVERIFIED, no AARP Florida guide was retrieved today.**
- **Estate and inheritance tax: neither** (Tax Foundation §0.6). Same as South Carolina.
- **Gas tax:** 39.40 cents (Tax Foundation, July 2025). SC 28.75 — saving about 10.7 cents/gal.
- **Gotcha, and it is the whole story: Florida to South Carolina is a tax INCREASE in almost every dimension.** The mover picks up a state income tax where there was none, picks up an annual vehicle property tax, and pays a higher sales tax (6.98% to 8%–9%). They also lose Florida's homestead exemption, the Save Our Homes 3%-a-year assessed value cap and its portability, which for a long-tenured Florida owner can be worth more than the headline rate difference. Property tax effective rate does fall (0.78% to 0.38% in Horry), and there is no estate tax on either side. **Never run a "save on taxes" angle at a Florida buyer.** The Florida page should be about the coast, the price per square foot and the pace of life, not tax.

### 7.9 TEXAS
- **Income tax: NONE** (§0.1). South Carolina's is new.
- **Property tax: 1.40% effective — rank 7 of 50**, median bill **$4,108**. Counties (§0.3): Harris 1.50% / $4,489; Collin 1.48% / $7,521; Dallas 1.45% / $4,798; Travis 1.31% / $7,727.
- **Sales tax:** 6.25% state, 1.95% average local, combined **8.20%** (rank 14) — above unincorporated Horry County's 8% is a wash, below Myrtle Beach's 9%. Groceries exempt — **UNVERIFIED here.**
- **Vehicles:** no annual value-based property tax on personal vehicles; registration is a flat state fee plus county fees — **UNVERIFIED.** South Carolina's annual vehicle tax is new for a Texan.
- **Estate and inheritance tax: neither** (Tax Foundation §0.6).
- **Gas tax: 20.00 cents** (Tax Foundation, July 2025) — the **lowest** of any state in this file. SC 28.75, so a Texan's gas tax goes UP by about 8.75 cents/gal.
- **Gotcha:** Texas trades no income tax for the seventh-highest property tax in the country. South Carolina does the reverse: a real income tax and the 46th-lowest property tax. Whether a Texan comes out ahead depends entirely on the ratio of their income to their home value. A retired Texan with modest income and an expensive house wins; a high-earning Texan with a modest house loses. **This is the one comparison in the file that genuinely needs a calculator rather than a claim.**

### 7.10 CALIFORNIA
- **Income tax:** graduated, 1%–**13.3%** including the 1% mental health services tax — the highest top rate in the country. Full 2026 schedule in §0.1. Std deduction $5,540 / $11,080; exemptions are credits ($153 / $306). No local income tax.
- **Retirement:** California does not tax Social Security. Pensions, 401(k) and IRA withdrawals are fully taxed at ordinary rates, and California adds its own **2.5% state penalty on early distributions** on top of the federal 10% — **UNVERIFIED here**, no California source was opened today.
- **Property tax:** 0.70% effective (rank 32), median bill **$5,369**. Counties (§0.3): Orange 0.64% / $6,330; Santa Clara 0.68% / $10,000+; Los Angeles 0.67% / $5,675; San Diego 0.67% / $5,774. The low rate is Proposition 13 — a 1% base rate plus voter-approved additions, with assessed value capped at 2% growth a year until the property sells. **Long-tenured California owners pay far less than 0.70% of market value; recent buyers pay close to the full 1%+.** Never quote California's effective rate at a specific owner without asking when they bought.
- **Sales tax:** 7.25% state (includes a 1.25% mandatory local component), 1.78% average local, combined **9.03%** — **rank 7, and higher than the City of Myrtle Beach's 9%.** Sales tax is the one line that clearly falls. Groceries exempt — UNVERIFIED here.
- **Vehicles: no county property tax, but the annual registration bill includes a Vehicle License Fee of about 0.65% of the vehicle's depreciated value**, which functions as an annual value-based tax — **UNVERIFIED here.** If confirmed, South Carolina's vehicle tax is a familiar mechanism at a somewhat higher effective rate for a Californian.
- **Estate and inheritance tax: neither** (Tax Foundation §0.6). Same as South Carolina.
- **Gas tax: 70.92 cents** (Tax Foundation, July 2025) — the **highest** in the country. SC 28.75, so a Californian saves about **42 cents a gallon**, by far the largest per-gallon drop in this file.
- **Gotcha:** two things. First, Proposition 13 means the California property tax comparison depends on purchase date, not on the published rate — a 1995 buyer in Orange County may be paying under 0.2% of market value and will see their property tax **rise** in Horry County despite the lower rate. Second, the Franchise Tax Board is aggressive on residency and applies a facts-and-circumstances "closest connections" test rather than a day count — **UNVERIFIED here**, but flag it for anyone selling California real estate or holding California-source income after the move.

---

## 8. Open items for a human

1. **New York, Virginia, Michigan and Illinois gas taxes all show source-to-source contradictions** (§2.7, §7.2, §7.5, §7.6). Do not publish a per-gallon figure for those four until one primary source is opened for each.
2. **New York City resident income tax rates** are not verified (§2.1). They matter — a borough seller drops both a state and a city tax.
3. **South Carolina's standard vehicle plate fee** is still UNVERIFIED (§1.5); dmv.sc.gov blocks automated fetch and needs a manual look.
4. **Ohio's $332 base amount** in ORC 5747.02(A)(3)(c) (§4.1) does not match the "0% then 2.75%" shorthand every secondary source uses. Confirm against the 2026 Form IT 1040 before any Ohio calculator ships.
5. **Georgia's 2026 income tax rate** may be 5.09% rather than 5.19% if the statutory trigger fired (§7.7).
6. **Connecticut, Michigan and California annual vehicle taxes** (§7.3, §7.5, §7.10) — each would flip the "South Carolina's car tax will surprise you" framing for that state. Verify before writing either version.
7. **New Jersey's property tax relief programs** (Stay NJ, Senior Freeze, ANCHOR) must be netted off before claiming a property tax saving for a New Jersey senior (§5.3).
8. **The NC/SC income tax crossover at roughly $100,000 of joint AGI** (§3.8) is internal arithmetic, not a published figure. Re-run it before it informs any page.
9. **Massachusetts and Connecticut estate tax on real property of a non-resident decedent** — Pennsylvania's rule is confirmed (§6.8); the other two are unchecked and would matter to anyone keeping the old house.
10. **Nothing in section 7 has the verification depth of sections 1–6.** If a secondary-state page gets built, that state needs its own primary-source pass first.

---

*End of research file. Sections 0–1 written in a prior session; sections 2–8 written 2026-08-16.*
