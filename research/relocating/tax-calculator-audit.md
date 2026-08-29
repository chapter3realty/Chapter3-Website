# Tax calculator: what is modelled, what is not, and which way it leans

Owner instruction, 2026-08-29: "make sure the numbers for taxes on all of our
states are showing real numbers that don't over or under exaggerate."

The rule this file enforces: **a simplification that makes our saving look
BIGGER is a defect and gets fixed. A simplification that makes it look SMALLER
is acceptable, and gets disclosed on the page.** Both kinds are listed here.

| State | Modelled | Not modelled | Which way it leans |
|---|---|---|---|
| New York | Brackets, standard deduction, $20,000 pension exclusion at 65, federal and military pensions exempt, NYC resident schedule, Yonkers 16.75% surcharge | The supplemental tax that phases out the lower brackets above $107,650 | Understates New York. Against us. |
| New Jersey | Brackets, $1,000 exemptions, **$1,000 age 65 exemption (added 2026-08-29)**, pension exclusion with the 100k/125k/150k cliffs, military exempt | Tax forgiveness style credits; property tax deduction/credit | Understates New Jersey slightly. Against us. |
| Pennsylvania | 3.07% flat, no retirement income taxed, local earned income tax at 1% when answered yes | **Tax Forgiveness (Schedule SP)**, a low-income credit | OVERSTATES Pennsylvania for a low-income household. In our favour, so it is named on the page. Narrow eligibility. |
| Ohio | Zero band to $26,050 then 2.75%, $2,400/$4,800 exemptions, retirement credit to $200, $50 senior credit, uniformed services pay exempt, city tax at 2% when answered yes | Exemption phase-down to $2,150/$1,900 at higher income; school district income taxes | Understates Ohio. Against us. |
| Maryland | Brackets, standard deduction at the cap, $3,200/$6,400 exemptions, pension exclusion to $41,200 per person reduced by Social Security, military subtraction, county tax at the 2.51% average | Exemption phase-out from $100k; the standard deduction is really 15% of income between a floor and that cap | Understates Maryland. Against us. |
| Virginia | Brackets, standard deduction, exemptions, $12,000 age deduction with the $1-for-$1 phase-out, $800 age exemption, $40,000 military subtraction | Locality car tax (deliberately out of the whole tool) | Neutral. |
| North Carolina | 3.99% flat, standard deduction, Social Security exempt, military exempt at 20 years | Bailey settlement pensions, a closed class | Slightly overstates North Carolina for a Bailey retiree. In our favour but the class is closed and shrinking; named here, not on the page. |
| Connecticut | Brackets, exemption **with the Table A phase-out**, **Table C 2% add-back**, Social Security threshold, pension and IRA phase-out, military exempt | Table D tax recapture above $105k single / $210k joint | Understates Connecticut. Against us. |
| Massachusetts | 5% flat plus the 4% surtax, $4,400/$8,800 exemptions, Social Security exempt, military exempt | **Senior circuit breaker credit**, worth up to about $2,590 for a low-income owner 65+ | OVERSTATES Massachusetts for that household. In our favour, so it is named on the page. |
| South Carolina (our side) | Brackets, standard deduction, retirement deduction $3,000/$10,000, age 65 deduction $15,000 net of it, military exempt, Horry unincorporated millage with Act 388 and the homestead exemption | City of Myrtle Beach millage, which is slightly LOWER than unincorporated after the TDF credit | Overstates our own property tax a little. Against us, which is the right direction. |

## Fixed in this pass
- New Jersey's $1,000 age 65 exemption was missing, which inflated New Jersey's
  bill and therefore our saving. Verified at the NJ Division of Taxation
  exemptions page and added, with a test.
- Connecticut's exemption phase-out and 2% add-back were added the day before
  (local-facts H2b) for the same reason in reverse: we had been understating
  Connecticut.

## Never do
- Never quote a mortgage payment, rate, or down payment in this tool. Reg Z.
  "You borrow less" is a statement about the loan size and is safe; a payment
  figure is not.
- Never say insurance is cheaper here. Our own coastal insurance page prices
  Myrtle Beach zip codes above $5,000 a year on a standardised $300,000 house,
  the highest in South Carolina. The calculator says insurance is its own
  question and links there.

## Gas and groceries claims, added 2026-08-29

Owner asked for "plus lower gas and groceries and insurance" on the savings
line. Two of the three are published, per state, only where the data supports
it. Insurance is NOT, for the reason in the Never do section above.

- GAS: state gas tax from state-tax.json. South Carolina 28.75 cents. Claimed
  only where the other state is at least 3 cents higher: NJ 49.1, PA 57.6,
  MD 46.19, NC 41.25, OH 38.5, FL 39.4. NOT claimed for CT (25), MA (27.47) or
  TX (20), which all tax gas LESS than we do, and not for NY or VA, whose
  figures are unverified in our data.
- GROCERIES: BEA regional price parity for goods, col-places.json. Myrtle
  Beach 96.339. Claimed only where the state is at least 1.5 points higher:
  NY 107.3, NJ 107.1, MD 102.5, VA 100.4, PA 99.4, MA 98.8, FL 98.1, TX 98.1.
  NOT claimed for OH (93.7, cheaper there), NC (96.6, three tenths of a point
  apart) or CT (97.3, one point apart).
- Both flags are recomputed from those two files by test-tax.js, so the claim
  on the page cannot drift from the data behind it.
- Net effect on the state pages: Connecticut gets neither clause, Ohio and
  North Carolina get gas only, New York, Virginia, Massachusetts and Texas get
  groceries only, and New Jersey, Pennsylvania, Maryland and Florida get both.
