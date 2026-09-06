# Cash to close on a Horry County rental, beyond the down payment: verified facts

Researcher notes, not page copy. Every fact was checked against the source named. "read 2026-09-06" means the page was opened that day. Quotes are verbatim. Anything I could not open, or that the source does not literally say, is under "Not verified" in each section.

Tool notes: scstatehouse.gov (code pages and the regulations PDF), sccourts.org, eCFR (renderer API), govinfo.gov, CFPB pages and PDF, Horry County pages and PDFs, the Municode API for the county ordinance, and SC DOR pages were downloaded with curl and read from saved text. The Freddie Mac Guide app returns only a script shell to both the fetcher and curl; the City of Myrtle Beach rate PDF needed a referer header; Municode for the City returned 403; the Clemson CL-100 form URL redirects to the department landing page. Those are listed as not opened.

Flags for the writer. [FLAT] a fixed dollar charge. [PCT-PRICE] a percentage of price or value (not a loan figure, but still a number). [PCT-LOAN] a percentage of a loan balance or months of a loan payment; never convert these to a payment amount or a rate on any page. [PCT-GROSS] a percentage of rental gross receipts.

---

## 1. Deed recording fee (transfer tax): who pays, how much

**1.1** [PCT-PRICE] SC charges $1.85 per $500 of the realty's value to record a deed (0.37 percent).
- Source: SC Code 12-24-10(A), https://www.scstatehouse.gov/code/t12c024.php
- Quote: "The fee is one dollar eighty-five cents for each five hundred dollars, or fractional part of five hundred dollars, of the realty's value as determined by Section 12-24-30."
- read 2026-09-06

**1.2** The fee is the seller's (grantor's) liability by statute; the buyer is secondarily liable.
- Source: SC Code 12-24-20(A), same URL
- Quote: "the fee imposed by this chapter is the liability of the grantor, or the joint and several liability of the grantors, but the grantee is secondarily liable for the payment of the fee."
- read 2026-09-06

**1.3** Exception: on a master-in-equity (foreclosure) deed, a deed from a government body, or a deed from a tax-exempt retirement plan, the buyer pays.
- Source: SC Code 12-24-20(B), same URL
- Quote: "the fee imposed by this chapter is the liability of the grantee, or the joint and several liability of the grantees, and not the grantor."
- read 2026-09-06

**1.4** 12-24-40 is the exemption list (deeds of $100 or less, to government, partitions, certain family and entity transfers). It does not shift liability. 12-24-30(B) deducts a lien the buyer assumes from "value".
- Source: SC Code 12-24-40 and 12-24-30, same URL
- Quote: "Exempted from the fee imposed by this chapter are deeds: (1) transferring realty in which the value of the realty, as defined in Section 12-24-30, is equal to or less than one hundred dollars;"
- read 2026-09-06

**1.5** [PCT-PRICE] SC DOR states the same rate; its page does not say who is liable.
- Source: https://dor.sc.gov/tax-index/deed-recording-fee
- Quote: "$1.85 on realty value of $100-$500" and "$1.85 for each $500 increments afterwards."
- read 2026-09-06

**1.6** [FLAT] Separate flat filing fees: $15 to record a deed, $25 to record a mortgage. Horry County's Register of Deeds schedule shows those figures (flat fees since August 1, 2019).
- Source: SC Code 8-21-310(A)(1) and (A)(2)(a), https://www.scstatehouse.gov/code/t08c021.php ; Horry ROD schedule https://www.horrycountysc.gov/media/uevkqtt4/price.pdf (linked from https://www.horrycountysc.gov/departments/register-of-deeds/)
- Quote (statute): "(1) fifteen dollars for a deed to real estate; and (2) twenty-five dollars for the following documents: (a) a mortgage;"
- Quote (county): "DEED - NON-TIMESHARE DEED #001 8-21-310-(A) $15.00 PER DOCUMENT" and "MORTGAGE MORTGAGE #002 8-21-310-(A) $25.00 PER DOCUMENT"
- read 2026-09-06

Not verified: whether local contracts ever shift the deed recording fee to the buyer (brokerage question).

---

## 2. Title insurance: owner's policy optional, lender's policy required

**2.1** SC title insurers file premium schedules with the state; schedules are public and must be available in every office. Rates "may not be inadequate, excessive, or unfairly discriminatory" (38-75-970(A)).
- Source: SC Code 38-75-980(A) and 38-75-990(A), https://www.scstatehouse.gov/code/t38c075.php
- Quote: "A title insurer shall file with the director or his designee the premium rate schedules it proposes to use in this State."
- Quote: "Each title insurer and title agent shall print and make available to the public schedules of its currently effective premiums and charges."
- read 2026-09-06

**2.2** The lender's policy is usually required for a mortgage and protects only the lender.
- Source: CFPB, https://www.consumerfinance.gov/ask-cfpb/what-is-lenders-title-insurance-en-163/
- Quote: "Lender's title insurance is usually required to get a mortgage loan."
- Quote: "Lender's title insurance only protects the lender against problems with the title."
- read 2026-09-06

**2.3** The owner's policy is the buyer's choice; buying both from one provider usually costs less.
- Source: CFPB, https://www.consumerfinance.gov/ask-cfpb/what-is-owners-title-insurance-en-164/
- Quote: "You may want to buy an owner's title insurance policy, which can help protect your financial investment in the home."
- Quote: "the total cost is usually lower if you use the same provider for both the lender's policy and the owner's policy, compared to buying them separately."
- read 2026-09-06

**2.4** The federal Closing Disclosure form labels the owner's policy "optional"; the lender's policy, title search and settlement agent fee are services the borrower can shop for.
- Source: CFPB sample Closing Disclosure (form H-25), https://files.consumerfinance.gov/f/201311_cfpb_kbyo_closing-disclosure.pdf
- Quote: "07 Title – Owner's Title Insurance (optional)"
- Quote: "04 Title – Lender's Title Insurance", "05 Title – Settlement Agent Fee", "06 Title – Title Search" (under "C. Services Borrower Did Shop For")
- read 2026-09-06 (dollar figures on the sample are illustrative, not SC)

Not verified: no SC Department of Insurance consumer page on owner's versus lender's policies was found. No SC statute says the owner's policy is optional or the lender's required; that comes from the lender and the CFPB pages. Who pays each premium in SC is contractual. [PCT-PRICE] Premiums are priced per unit of coverage; do not state a rate per $1,000. I did not open any insurer's rate manual.

---

## 3. The closing attorney's role

**3.1** The SC Supreme Court lists four steps of a residential closing that are the practice of law (title search, document preparation, closing, recording) and added disbursement of loan funds in 2006.
- Source: Doe Law Firm v. Richardson, SC Supreme Court Op. No. 26214, https://www.sccourts.org/media/opinions/HTMLFiles/SC/26214.htm
- Quote: "the Court identified four steps in a residential real estate closing that involve the practice of law:"
- Quote: "The title search and preparation of title documents for the lender and subsequent preparation of related documents is the practice of law which must be performed or supervised by an attorney."
- Quote: "Real estate closings and mortgage loan closings should be conducted only under an attorney's supervision."
- Quote: "The recording of documents is the 'final phase' of the real estate loan process and must be done under the supervision of an attorney."
- Quote: "we hold that the disbursement of the funds must be supervised by an attorney."
- read 2026-09-06

**3.2** One attorney may represent both lender and borrower with disclosure and consent.
- Source: same opinion
- Quote: "The supervising attorney may represent both the lender and the borrower after full disclosure and with each party's consent."
- read 2026-09-06

Not verified: any fee range. [FLAT] The attorney fee is a flat charge; no primary source states an amount. The SC Bar has no public consumer page on closings that I could find (search results were lawyer-facing ethics opinions, not opened). The 1987 Buyers Service and 2003 Doe v. McMaster holdings are quoted only as restated in the 2006 opinion (see out-of-state-facts.md section 1 for the 2003 opinion).

---

## 4. Reserves after closing

**4.1** [PCT-LOAN] Reserves are liquid assets left after closing, measured in months of the full monthly payment (principal, interest, taxes, insurance, association dues).
- Source: Fannie Mae Selling Guide B3-4.1-01, Minimum Reserve Requirements (page shows effective date 08/07/2024), https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements
- Quote: "Liquid financial reserves are those liquid or near liquid assets that are available to a borrower after the mortgage closes."
- Quote: "Reserves are measured by the number of months of the qualifying payment amount for the subject mortgage (based on PITIA) that a borrower could pay using their financial assets."
- read 2026-09-06

**4.2** [PCT-LOAN] Second home: two months. Investment property: six months. One-unit principal residence: none.
- Source: same page
- Quote: "Two months' reserves for a second home transaction."
- Quote: "Six months' reserves for the following:" then the list items "two- to four-unit principal residence transaction," and "investment property transaction, and"
- Quote: "There is no minimum reserve requirement for one-unit principal residence transactions."
- read 2026-09-06

**4.3** [PCT-LOAN] A borrower with other financed properties must also hold reserves equal to a percentage of the unpaid balances on those properties.
- Source: same page, "Calculation of Reserves for Multiple Financed Properties"
- Quote: "additional reserves must be calculated and documented for financed properties other than the subject property and the borrower's principal residence."
- Quote: "2% of the aggregate UPB if the borrower has one to four financed properties," / "4% of the aggregate UPB if the borrower has five to six financed properties, or" / "6% of the aggregate UPB if the borrower has seven to ten financed properties (DU only)."
- read 2026-09-06

**4.4** [PCT-LOAN] Freddie Mac: above six financed properties, eight months of payment on each additional financed second home or investment property; cap of ten properties.
- Source: Freddie Mac Bulletin 2018-10 (June 27, 2018), https://guide.freddiemac.com/ci/okcsFattach/get/1002024_7
- Quote: "we are increasing the maximum number of financed properties permitted to 10"
- Quote: "The Seller must verify reserves of eight months of the monthly payment (as described in Section 5501.2(a)) on each additional second home and/or 1- to 4-unit Investment Property that is financed"
- read 2026-09-06

**4.5** Freddie Mac's underwriter adds reserves for each other financed second home or investment property and requires a 720 score above six properties.
- Source: Freddie Mac, Loan Product Advisor Feedback Message Updates, posted March 4, 2026, https://sf.freddiemac.com/docs/pdf/lpa-feedback-messages-reserves-indicator-score.pdf
- Quote: "month's reserves based on " + <Total Financed Properties Count> + " total financed properties, for each other second home and/or investment property that is financed, and on which the borrower is obligated."
- Quote: "Indicator Score must be 720 or greater when each borrower individually and all borrowers collectively are obligated on more than six 1-to-4-unit financed properties"
- read 2026-09-06

Not verified: Freddie Mac Guide Section 5501.2 itself (https://guide.freddiemac.com/app/guide/section/5501.2 returned only "Guide Home" to the fetcher and a 9 KB script shell to curl). Freddie's base months for a second home and an investment property are not verified from a primary page; third-party paraphrases exist but are not primary. The Fannie Mae figures in 4.2 are the only verified base numbers.

---

## 5. Prepaid items and the initial escrow deposit

**5.1** Prepaids are interest to month-end and, commonly, the first year of homeowner's insurance; the escrow deposit opens the escrow account; cash to close is the wire amount.
- Source: CFPB Closing Disclosure explainer, https://www.consumerfinance.gov/owning-a-home/closing-disclosure/
- Quote (Prepaids): "This category includes interest on your loan between the time you close and the end of that month. It's also common to pay your first year's homeowner's insurance premium in advance at closing."
- Quote (Initial Escrow Payment at Closing): "This payment will establish an initial balance in your escrow account."
- Quote (Cash to Close): "Actual amount you will have to pay at closing. You will typically need a cashier's check or wire transfer for this amount."
- Quote (Total Closing Costs): "Total upfront costs associated with your loan and real estate transaction, excluding your down payment."
- read 2026-09-06

**5.2** The form's Prepaids section has four lines (insurance premium, mortgage insurance, prepaid interest, property taxes); the escrow section repeats insurance and taxes as monthly amounts times months. "Other" carries HOA, inspection and warranty lines.
- Source: CFPB sample Closing Disclosure, URL in 2.4
- Quote: "F. Prepaids" / "01 Homeowner's Insurance Premium ( 12 mo.)" / "03 Prepaid Interest ( $17.44 per day from 4/15/13 to 5/1/13 )" / "04 Property Taxes ( 6 mo.)"
- Quote: "G. Initial Escrow Payment at Closing" / "01 Homeowner's Insurance $100.83 per month for 2 mo." / "03 Property Taxes $105.30 per month for 2 mo." / "08 Aggregate Adjustment"
- Quote: "H. Other" / "01 HOA Capital Contribution" / "02 HOA Processing Fee" / "03 Home Inspection Fee" / "04 Home Warranty Fee"
- read 2026-09-06 (sample figures, not SC)

**5.3** Federal escrow rules let the servicer collect at closing the taxes and insurance accrued since last paid, plus a cushion of up to one-sixth of a year's disbursements.
- Source: 12 CFR 1024.17(c)(1)(i) and (c)(5), https://www.ecfr.gov/current/title-12/chapter-X/part-1024/section-1024.17 (read through the eCFR renderer API)
- Quote: "an amount sufficient to pay the charges respecting the mortgaged property, such as taxes and insurance, which are attributable to the period from the date such payment(s) were last paid until the initial payment date."
- Quote: "The cushion must be no greater than one-sixth (1/6) of the estimated total annual disbursements from the escrow account."
- read 2026-09-06

Not verified: whether lenders require escrow on investment-property loans (lender decision; no primary page). [PCT-LOAN] Prepaid interest is per-day interest; never state a per-day figure or a rate.

---

## 6. Property tax at closing in Horry County

**6.1** Bills go out October 1 to the owner of record; payment is due January 15; penalties accrue January 16, February 2 and March 17; not receiving the bill is no defence.
- Source: Horry County, Real Property Tax, https://www.horrycountysc.gov/tax-payer-services/real-property-tax/ ; Guide to Assessment, https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/
- Quote: "Real Property tax notices are mailed to the owner of record October 1st of the given tax year. Payment is due in full on or before January 15th of the following year."
- Quote: "If payment is postmarked after January 15th penalties accrue on the following dates: January 16, February 2 and March 17."
- Quote: "Failure to receive bill does not exempt the account from penalty."
- Quote (Guide): "Tax bills are prepared in September-October by the County Auditor and mailed by the County Treasurer in October."
- read 2026-09-06

**6.2** The due window and the penalty steps (3, 7, 5 percent) are statutory. A new owner whose bill went to the prior owner gets the penalty waived.
- Source: SC Code 12-45-70(A) and 12-45-180(A), (B), https://www.scstatehouse.gov/code/t12c045.php
- Quote: "All taxes are due and payable between the thirtieth day of September and the fifteenth day of January after their assessment in each year."
- Quote: "the county auditor shall add a penalty of three percent" ... "an additional penalty of seven percent" ... "an additional penalty of five percent"
- Quote (B): "If title to real property is transferred during a tax year and the records of the county indicate that the tax notice was mailed or otherwise forwarded to the prior owner ... the treasurer shall waive any penalties"
- read 2026-09-06

**6.3** The owner on December 31 is liable for the following year's tax. Closings split the year by contract, not by statute.
- Source: SC Code 12-37-610(A), https://www.scstatehouse.gov/code/t12c037.php
- Quote: "Each person is liable to pay taxes and assessments on the real property that, as of December thirty-first of the year preceding the tax year, he owns in fee, for life, or as trustee"
- read 2026-09-06

**6.4** [PCT-PRICE] A rental is assessed at 6 percent of market value; only an owner-occupied legal residence gets 4 percent.
- Source: SC Code 12-43-220(e), https://www.scstatehouse.gov/code/t12c043.php
- Quote: "All other real property not herein provided for shall be taxed on an assessment equal to six percent of the fair market value of such property."
- Source: Horry County FAQs, https://www.horrycountysc.gov/tax-payer-services/faqs/
- Quote: "All real property is assessed at a four percent (owner occupied primary residence) four or six percent (farm) or a six percent (all other) rate."
- Source: Horry County news, https://www.horrycountysc.gov/news/articles/applications-for-legal-residence-property-tax-exemption-due-may-31/
- Quote: "South Carolina law provides the 4% assessment ratio on primary residential properties. The alternative is 6%. This exemption only applies to primary residences, not second/vacation homes."
- Source: Guide to Assessment (URL in 6.1), definition of legal residence
- Quote: "It shall not include a residence maintained principally for vacation or recreational purposes."
- read 2026-09-06

**6.5** The taxable value resets after a sale (assessable transfer of interest).
- Source: SC Code 12-37-3140(A)(1)(b), URL in 6.3
- Quote: "December thirty-first of the year in which an assessable transfer of interest has occurred;"
- read 2026-09-06 (the invest-tax research files cover ATI in depth; re-check there before use)

Not verified: any county statement on proration at closing. The Treasurer, Real Property Tax, FAQ and Guide to Assessment pages say nothing about proration or who pays at a sale. Proration comes from the sale contract, not opened.

---

## 7. HOA charges at closing

**7.1** The SC Homeowners Association Act (Title 27, Chapter 30) covers recording of governing documents, budget notice, document access and magistrate jurisdiction. It has no provision on estoppel or statement fees, transfer fees or capital contributions.
- Source: SC Code 27-30-130(A)(1), https://www.scstatehouse.gov/code/t27c030.php
- Quote: "in order to be enforceable, a homeowners association's governing documents must be recorded in the clerk of court's, Register of Mesne Conveyance (RMC), or register of deeds office in the county where the property is located."
- Check: "fee", "estoppel", "transfer fee", "capital contribution" and "resale" appear nowhere in the chapter.
- read 2026-09-06

**7.2** Condominiums: a buyer is jointly liable with the seller for unpaid assessments, can request a statement that caps that liability, and unpaid assessments are paid from the sale price.
- Source: SC Code 27-31-220 and 27-31-200 (Horizontal Property Act), https://www.scstatehouse.gov/code/t27c031.php
- Quote: "shall be jointly and severally liable with the seller for the amounts owing by the latter under SECTION 27-31-190 up to the time of the conveyance"
- Quote: "shall issue to any purchaser, upon his request, a statement of such amounts due by the seller and the purchaser's liability under this section shall be limited to the amount as set forth in the statement."
- Quote (27-31-200): "all unpaid assessments against a co-owner for his pro rata share in the expenses to which SECTION 27-31-190 refers shall first be paid out of the sales price or by the acquirer"
- read 2026-09-06

**7.3** [FLAT] The federal Closing Disclosure carries lines for an HOA capital contribution and an HOA processing fee (quoted in 5.2).

Not verified: any SC statute setting, capping or requiring an HOA statement fee, transfer fee or capital contribution. None in Chapters 30 or 31 of Title 27 as read today; 27-31-220 requires the statement but sets no fee. Amounts come from each community's recorded covenants.

---

## 8. CL-100 wood infestation report, home inspection, survey

**8.1** A wood infestation report for a sale or mortgage must come from a licensed structural pest control applicator, on the state form the licensee supplies.
- Source: SC Regulation 27-1085(K)(1) and (K)(2) (Clemson University regulations under the Pesticide Control Act), https://www.scstatehouse.gov/coderegs/Chapter%2027.pdf
- Quote: "issued for the purpose of describing the apparent absence of wood-destroying organisms from a building or structure in connection with a sale or mortgage of real property must be issued by an individual currently licensed in Category 7A"
- Quote: "The inspection must be reported on the most current Official South Carolina Wood Infestation Report Form as published by the Department. The form for this report shall be furnished by the licensee."
- read 2026-09-06

**8.2** The inspection covers accessible areas, probing, crawlspace moisture readings, insect and fungus findings below the first floor. The report is not a warranty and obliges no repair.
- Source: SC Regulation 27-1085(K)(3) and (K)(6), same PDF
- Quote: "A visual inspection of all accessible portions of the interior and exterior of the structure, including crawlspaces, utility areas, and attics."
- Quote: "Representative wood moisture-content readings around the interior perimeter of the crawlspace and in the accessible portions of the center of the crawlspace."
- Quote: "The Wood Infestation Report is not a warranty against future infestation, nor does it place any obligation for the correction of reported damage or infestation upon the applicator or business issuing the report."
- read 2026-09-06

**8.3** Issuing the report is regulated structural pest control; the regulator is Clemson's Department of Pesticide Regulation.
- Source: SC Regulation 27-1085(D)(4), same PDF; Clemson DPR, https://www.clemson.edu/public/regulatory/pesticide-regulation/index.html
- Quote: "Making an inspection for or issuing the Official South Carolina Wood Infestation Report, which must be issued by a licensed applicator as detailed below, is a structural pest control activity."
- Quote: "The Department of Pesticide Regulation is the state's lead agency charged with regulating the distribution, sale and use of pesticides in South Carolina."
- read 2026-09-06

**8.4** [FLAT] Pest inspection, survey and home inspection each have a line on the federal Closing Disclosure.
- Source: CFPB sample Closing Disclosure, URL in 2.4
- Quote: "01 Pest Inspection Fee" and "02 Survey Fee" (under "C. Services Borrower Did Shop For"); "03 Home Inspection Fee" (under "H. Other")
- read 2026-09-06 (sample figures, not SC)

Not verified: who orders and pays for the CL-100 (the regulation does not say; the contract does). The name "CL-100" does not appear in the regulation text, which says "Official South Carolina Wood Infestation Report Form". The Clemson form URL (https://www.clemson.edu/public/regulatory/pesticide-regulation/forms/wood-infestation-report.pdf) redirects to the department landing page. No SC statute requires a survey. No fee amounts.

---

## 9. Flood insurance premium at closing

**9.1** [FLAT] Flood coverage bought for a loan starts at closing, with no 30-day wait, if the premium is presented at or before closing.
- Source: 44 CFR 61.11(b), https://www.ecfr.gov/current/title-44/chapter-I/subchapter-B/part-61/section-61.11 (eCFR renderer API; same text at https://www.govinfo.gov/content/pkg/CFR-2024-title44-vol1/xml/CFR-2024-title44-vol1-sec61-11.xml)
- Quote: "the coverage ... shall be effective as of the time of the loan closing, provided ... the presentment of payment of premium is made at or prior to the loan closing."
- read 2026-09-06

**9.2** FEMA's consumer pages say the same in plain words.
- Source: FloodSmart, https://www.floodsmart.gov/get-insured/buy-a-policy ; FEMA FAQ, https://www.fema.gov/faq/waiting-period-activating-flood-policy
- Quote: "Your flood insurance coverage will go into effect 30 days after your date of purchase."
- Quote: "There is no wait if you buy flood insurance while making, increasing, extending or renewing a mortgage."
- Quote (FAQ): "Typically, there's a 30-day waiting period from date of purchase before your policy goes into effect."
- read 2026-09-06

**9.3** A federally regulated lender cannot close a loan on a building in a special flood hazard area without flood insurance in place.
- Source: 12 CFR 22.3(a), https://www.ecfr.gov/current/title-12/chapter-I/part-22/section-22.3 (eCFR renderer API)
- Quote: "shall not make, increase, extend, or renew any designated loan unless the building or mobile home and any personal property securing the loan is covered by flood insurance for the term of the loan."
- read 2026-09-06

Not verified: the NFIP rule that a premium paid from closing funds may reach the insurer up to 30 days after closing; it appears in paraphrases of a FEMA bulletin (https://www.fema.gov/pdf/nfip/w_10063.pdf) that I did not open. No premium amounts anywhere.

---

## 10. Short-term rental start-up: licences and fees

**10.1** [FLAT] SC DOR Retail License: $50, non-refundable, does not expire. Accommodations Tax License: also $50. Neither is the county business licence.
- Source: SC DOR, Licensing (Retail License), https://dor.sc.gov/businesses/apply-business-tax-account/licensing-retail-license
- Quote: "You must pay a non-refundable fee for each license listed below. These licenses do not expire, but you must update your license if your business location changes."
- Quote: "Retail License($50 non-refundable fee)" and "Accommodations Tax License($50 non-refundable fee)"
- Quote: "A Retail License is not the same as a business license, which is issued by the county where you conduct business, if required by that county."
- read 2026-09-06

**10.2** An owner who books directly needs the Retail License; an owner who rents only through a manager or booking platform does not.
- Source: SC DOR, Accommodations, https://dor.sc.gov/tax/accommodations
- Quote: "If you are directly booking short-term rentals, you must have a Retail License to file and pay Accommodations Tax."
- Quote: "No, if you rent your property exclusively through a property management or online travel company...they are responsible for remitting the tax."
- read 2026-09-06

**10.3** Horry County (unincorporated areas): every business needs an annual licence; the year runs May 1 to April 30. Two rental exemptions: a short-term rental managed by a licensed company, and a single property with no local accommodations tax.
- Source: Horry County Code 12.5-91 and 12.5-100(e), read via the Municode API, Supp. 88 (codified through Ord. 37-2026), https://library.municode.com/sc/horry_county/codes/code_of_ordinances?nodeId=COOR_CH12.5LIBURE_ARTIVBULI ; application form https://www.horrycountysc.gov/media/kgfjs4rs/bl-new-app-61225.pdf
- Quote (12.5-91): "Every person engaged in any calling, business, occupation or profession ... within the unincorporated areas of the county, is required to pay an annual license tax and obtain a business license as herein provided."
- Quote (12.5-100(e)): "Persons deriving rental income from real property, which is subject to accommodations taxes, and that would otherwise be subject to this article are hereby exempted if the rental property is managed by a properly licensed company in the county."
- Quote (12.5-100(e)): "A business license shall not be required of persons receiving rental income from only one (1) real property, when such income is not subject to local accommodations taxes."
- Quote (form): "The business license year will be from May 1st to April 30th."
- read 2026-09-06

**10.4** [FLAT] plus [PCT-GROSS] Rental real estate (NAICS sector 53) is county rate class 6: $55 minimum on the first $50,000 of gross income, then $1.37 per $1,000; doubled for nonresidents.
- Source: Horry County Code 12.5-114 and 12.5-113, same Municode URL; 2024 rate schedule, https://www.horrycountysc.gov/media/gjnntcw1/2024-rate-schedule.pdf
- Quote (12.5-114 table row, sic): "53 REAL ESTATE AND RETAIL AND LEASING 6"
- Quote (12.5-113): "6 $55.00 $1.37"
- Quote (schedule): "all minimum fees and rates shall be multiplied by 200 percent for nonresidents and itinerants having no fixed principal place of business within the County."
- Quote (schedule, class 6 row): "6 $55.00 $110.00 $1.37 $2.74"
- read 2026-09-06 (schedule: "Rates subject to change pending future amended Horry County Council Ordinance")

**10.5** City of Myrtle Beach: every rental property needs a city licence; fees are on gross receipts; year June 1 to May 31.
- Source: City of Myrtle Beach Business License FAQs, https://www.cityofmyrtlebeach.com/careers/business/business_faq.php
- Quote: "The ordinance requires a business license for ALL rental properties which include short-term, long-term, residential and commercial."
- Quote: "Fees are calculated using the gross receipts of your business."
- Quote: "The Business License year starts June 1 and ends on May 31."
- read 2026-09-06

**10.6** [FLAT] plus [PCT-GROSS] City rate table: in-city classes 1 to 7 charge $95 to $155 on the first $2,000 of gross receipts, then $2.50 to $3.10 per $1,000; out-of-city rates are double.
- Source: City of Myrtle Beach rate table, "Effective: Business License Year Starting 1/1/2023", https://cms6.revize.com/revize/myrtlebeachsc/BLRates.pdf (opened with curl and a city referer; a direct fetch returns 403)
- Quote: "IN CITY 2,000" ... "1 1 95.00 2.5000" ... "7 7 155.00 3.1000"
- Quote: "OUT OF CITY" ... "201 1 190.00 5.0000" ... "207 7 310.00 6.2000"
- read 2026-09-06

Not verified: which city rate class a dwelling rental falls in (Municode for the City returned 403; the rate table has no NAICS 53 row). North Myrtle Beach, Surfside Beach and other towns: not researched. County hospitality fee and local accommodations tax registration: no fee amounts researched here (see accommodations-tax-facts.md in invest-tax).

---

## 11. Earnest money: where it is held, when it is deposited

**11.1** The broker-in-charge must keep a trust account for other people's funds; it must be an insured SC bank account titled "trust" or "escrow", with no commingling.
- Source: SC Code 40-57-135(A)(7) and 40-57-136(A)(3), (B)(3), https://www.scstatehouse.gov/code/t40c057.php
- Quote (135): "establish and maintain control of and responsibility for an active trust account when in possession of trust funds belonging to others resulting from a real estate transaction"
- Quote (136): "A trust account maintained by a broker-in-charge or property manager-in-charge must be a demand deposit account located in an insured financial institution authorized to conduct business in South Carolina."
- read 2026-09-06

**11.2** Deposit timing: cash within 48 hours of receipt; a check within 48 hours of written acceptance of the offer (weekends and bank holidays excluded). Note: this is 40-57-136, not 135.
- Source: SC Code 40-57-136(D)(1)(a), same URL
- Quote: "Trust funds received by a broker-in-charge in a real estate sales or exchange transaction must be deposited as follows in a separate real estate trust account:"
- Quote: "(i) cash or certified funds must be deposited within forty-eight hours of receipt, excluding Saturday, Sunday, and bank holidays; and"
- Quote: "(ii) checks must be deposited within forty-eight hours after written acceptance of an offer by the parties to the transaction, excluding Saturday, Sunday, and bank holidays."
- read 2026-09-06

**11.3** The money stays in trust until closing or termination and is paid out as the contract directs.
- Source: SC Code 40-57-136(D)(1)(b), same URL
- Quote: "shall remain in the trust account until consummation or termination of the transaction, at which time the undisputed trust funds must be disbursed in accordance with the contract which directs the broker-in-charge to hold the trust funds"
- read 2026-09-06

Not verified: any statute setting an earnest money amount or a buyer's delivery deadline; SC law regulates the broker's handling, not the amount. [FLAT] Earnest money is credited to the buyer at closing (contractual; no primary page quoted).

---

## What will go stale

- Horry County business licence rate schedule: dated January 1, 2024 and marked "subject to change". Municode read was Supp. 88 (through Ord. 37-2026). SC Code 6-1-400(G) makes every jurisdiction re-adopt the standardized class schedule by December 31 of each odd year, so the class 6 mapping can change.
- City of Myrtle Beach rate table: effective January 1, 2023; re-check yearly.
- Fannie Mae B3-4.1-01: page dated 08/07/2024. Freddie Mac bulletins change the financed-property and reserve rules; the 2018-10 figures may be superseded.
- 12 CFR 1024.17, 44 CFR 61.11, 12 CFR 22.3: read on eCFR "current"; re-open before each publish.
- Horry County tax pages use January 15, 2025 as an example year; the statutory dates (12-45-70, 12-45-180) do not move.
- SC DOR fees ($50) and the accommodations tax structure: annual re-check.
- Horry ROD fee schedule: flat fees since August 1, 2019 under 8-21-310.

## Questions only the brokerage can answer

- The closing attorney fee range Tim Nash sees on Grand Strand closings, and what the title search and settlement fee lines typically add.
- Title premium quotes seen in practice, and whether buyers here usually take the owner's policy.
- Who pays the deed recording fee and the CL-100 by local custom, and the contract form used for proration of taxes and HOA dues.
- Typical earnest money deposits on rental purchases here, and how many days the local contract gives the buyer to deliver it.
- Which lenders they close with, and what those lenders require in reserves for a second home versus a rental in practice (BrickWood Mortgage: any mention requires the RESPA AfBA disclosure on the page).
- Whether those lenders escrow taxes and insurance on investment property loans.
- HOA capital contributions, transfer fees and statement fees actually charged in named communities (observable dated facts only; no conclusions about a named HOA).
- Typical CL-100, home inspection and survey invoices, and whether lenders here ask for a survey.
- Flood premium ranges their buyers see, by zone.
- Furnishing and start-up budgets their short-term rental clients spend.
- Which city rate class the City of Myrtle Beach assigns to dwelling rentals, and the licence rules in North Myrtle Beach and Surfside Beach.
