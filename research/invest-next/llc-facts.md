# Holding a South Carolina rental in an LLC: verified facts

Every fact below was read at the primary source on 2026-09-06 with WebFetch, or downloaded with
curl and read (scstatehouse.gov chapters; PDFs parsed with pypdf), unless the entry says
otherwise. Quotes are verbatim. Re-open every source before reuse (non-negotiable 8). Facts only;
no page copy. Sources that could not be opened, or that do not say the thing, are under "Not
verified". Nothing here is a conclusion about a named building, HOA or builder.

Site constraints: entries marked [LOAN FACT] are loan-related. The Fannie Mae entries (section 7)
are for the sources line only; body copy never names Fannie Mae or Freddie Mac and never states a
rate, a payment or a down-payment percentage. Section 8 percentages are tax withholding rates.

## 1. Forming the LLC: fee, online filing, annual report

Source: https://businessfilings.sc.gov/BusinessFiling/Home/DownloadForms?pdfCategoryId=1,
"Downloadable Paper Forms - Business Entities Online - S.C. Secretary of State". Undated. Read
2026-09-06 (curl).
- The paper filing fee is $110. Quote: "Articles of Organization §33-44-202 and §33-44-203" ...
  "This form is used to organize the LLC under the laws of South Carolina." ... "$110.00". No LLC
  annual report form is listed; the "CL-1" ($25.00) sits under "Corporation - Domestic".

Source: https://businessfilings.sc.gov/BusinessFiling/Home/DownloadDocument/0225df5c-f6fb-4309-8b7e-713e2e820598,
an SOS system receipt for an approved online LLC filing (entity name withheld). Read 2026-09-06.
- Online filing adds $15. Quote: "ARTICLES OF ORGANIZATION" - $110.00; "Electronic Records
  Access" - $15.00; "Total Cost" - $125.00. No SOS page states the $15 in prose (Not verified).
  The SOS page https://sos.sc.gov/online-filings/business-entities/file-and-search-online (read
  2026-09-06) says only: "Users may file organizing documents and may file documents for
  existing entities using this system."

Source: https://www.scstatehouse.gov/code/t33c044.php, SECTION 33-44-202. Read 2026-09-06 (curl).
- Quote (a): "One or more persons may organize a limited liability company, consisting of one or
  more members, by delivering articles of organization to the office of the Secretary of State
  for filing." Quote (b): "Unless a delayed effective date is specified, the existence of a
  limited liability company begins when the articles of organization are filed."
- A grep of the whole chapter for "annual report" returns nothing; the LLC Act imposes none. The
  SOS FAQ (https://sos.sc.gov/faqs-about-business-entities, read 2026-09-06 by curl) has no LLC
  annual-report entry; its only one is "Business corporations must submit the names of directors
  on Annual Reports filed with the Department of Revenue."

Source: https://dor.sc.gov/tax-index/business-income-taxes/corporate/corporate-faqs, "Corporate
FAQs | SCDOR". Undated. Read 2026-09-06 (WebFetch, then curl to confirm the text).
- Quote: "The following organizations, companies, and associations are not subject to the annual
  report or the License Fee: A Limited Liability Company (LLC) not taxed as a corporation".
- The exception. Quote: "An LLC taxed as a corporation must complete the CL-1, Initial Annual
  Report of Corporations, and submit it to the SCDOR within 60 days of commencing business in
  South Carolina or using a portion of capital in South Carolina."

## 2. Registered office and agent

Source: https://www.scstatehouse.gov/code/t33c044.php, SECTION 33-44-108 "Designated office and
agent for service of process". HISTORY: 1996 Act No. 343. Read 2026-09-06 (curl).
- Quote (a): a limited liability company "shall designate and continuously maintain in this
  State: (1) an office, which need not be a place of business in this State; and (2) an agent
  and street address of the agent for service of process on the company."
- Quote (b): "An agent must be an individual resident of this State, a domestic corporation,
  another limited liability company, or a foreign corporation or foreign company authorized to
  do business in this State."
- SOS form F0006 "ARTICLES OF ORGANIZATION Limited Liability Company – Domestic" ("Form Revised
  by South Carolina Secretary of State, August 2016"), read 2026-09-06 (curl, pypdf), item 3
  asks for the agent's name, signature and "the street address in South Carolina for this
  initial agent for service of process".

## 3. Deed recording fee when an owner deeds a property to their own LLC

Source: https://www.scstatehouse.gov/code/t12c024.php, SECTIONS 12-24-10, -20, -30, -40. 12-24-40
HISTORY ends "2014 Act No. 259 (S.437), SECTION 4.B, eff June 9, 2014." Read 2026-09-06 (curl).
- The fee. Quote (12-24-10(A)): "The fee is one dollar eighty-five cents for each five hundred
  dollars, or fractional part of five hundred dollars, of the realty's value as determined by
  Section 12-24-30."
- Who owes it. Quote (12-24-20(A)): "the fee imposed by this chapter is the liability of the
  grantor, or the joint and several liability of the grantors, but the grantee is secondarily
  liable for the payment of the fee."
- Value between an entity and its owner is market value, whatever was paid. Quote (12-24-30(A)):
  "in the case of realty transferred between a corporation, a partnership, or other entity and
  its stockholder, partner, or owner" ... "'value' means the realty's fair market value." So a
  $0 deed to your own LLC is not exempt under 12-24-40(1) (value "equal to or less than one
  hundred dollars").
- The entity exemption, exact text. Quote (12-24-40(8)): exempt are deeds "transferring realty to
  a corporation, a partnership, or a trust as a stockholder, partner, or trust beneficiary of the
  entity or so as to become a stockholder, partner, or trust beneficiary of the entity" ... "as
  long as no consideration is paid for the transfer other than stock in the corporation, interest
  in the partnership, beneficiary interest in the trust, or the increase in value in the stock or
  interest held by the grantor."
- Coming back out is taxed. Same item: "the transfer of realty from a corporation, a partnership,
  or a trust to a stockholder, partner, or trust beneficiary of the entity is subject to the fee".
- Item (8) never says "limited liability company" (the only LLC mention in 12-24-40 is item (15),
  electric transmission assets). LLCs reach item (8) through 12-2-25, next.

Source: https://www.scstatehouse.gov/code/t12c002.php, SECTION 12-2-25. Read 2026-09-06 (curl).
- Quote (A)(1): "'partnership' includes a limited liability company taxed for South Carolina
  income tax purposes as a partnership". Quote (A)(3): "'corporation' includes a limited
  liability company or professional or other association taxed for South Carolina income tax
  purposes as a corporation".
- Quote (B)(1), "For South Carolina tax purposes": "a single-member limited liability company,
  which is not taxed for South Carolina income tax purposes as a corporation, is not regarded as
  an entity separate from its owner".

Source: https://dor.sc.gov/sites/dor/files/Documents/Policy%20Manuals/Deed%20Recording%20Fee%20Manual%202024.pdf,
"South Carolina Deed Recording Fee Manual", SCDOR, January 2024, 70 pages (incorporated in "S.C.
Revenue Ruling #24-1"). Question 23, "LIMITED LIABILITY COMPANY (LLC) DEEDS". Read 2026-09-06
(curl, pypdf).
- Single-member, disregarded: no fee either way. Quote: "Deeds that transfer realty to the SMLLC
  from its single member" ... "are not subject to the deed recording fee if the SMLLC is ignored
  for all tax purposes under the provisions of Code Section 12-2-25(B)."
- LLC taxed as a partnership: deeds to and from it "are treated in the same manner under the deed
  recording fee as deeds that transfer realty to and from a partnership." LLC taxed as a
  corporation: "in the same manner under the deed recording fee as deeds that transfer realty to
  and from a corporation."
- Partnership rule (Question 19): exempt is "a transfer from a partner to the partnership if no
  consideration is paid for the transfer other than additional interest in the partnership or an
  increase in value in the partner's interest in the partnership (12-24-40(8))". Where all the
  partners already own the realty: "the conveyance is not subject to the deed recording fee, so
  long as each partner's percentage of interest in the realty (prior to the conveyance) is the
  same as his/her percentage of interest in the partnership."

Source: https://dor.sc.gov/tax-index/deed-recording-fee, "Deed Recording Fee" (SCDOR), undated,
read 2026-09-06: "$1.85 on realty value of $100-$500" ... "$1.85 for each $500 increments
afterwards" ... "The state portion is $1.30" ... "The county portion is $.55". No exemptions.

## 4. Property tax reassessment on the deed to the LLC (assessable transfer of interest)

Source: https://www.scstatehouse.gov/code/t12c037.php, SECTIONS 12-37-3150 (HISTORY ends "2012
Act No. 179, SECTION 4, eff May 25, 2012.") and 12-37-3140. Read 2026-09-06 (curl).
- A deed is on the list. Quote (3150(A)): "an assessable transfer of interest in real property
  includes, but is not limited to, the following: (1) a conveyance by deed;". Recording does not
  matter: it "occurs at the time of execution of the instruments directly resulting in the
  transfer of interest and without regard as to whether or not the applicable instruments are
  recorded".
- The single-member exception. Quote (3150(B)(11)), an assessable transfer "does not include" ...
  "a transfer to a single member limited liability company, not taxed separately as a
  corporation, by its single member" and the reverse, "as provided in Section 12-2-25(B)(1)".
- The multi-member route. Quote (B)(1): not included are "transfers not subject to federal income
  tax in the following circumstances:" ... "(c) 351 (Transfer to a Corporation Controlled by
  Transferor);" ... "(f) 721 (Nonrecognition of Gain or Loss on a Contribution to a
  Partnership)". Whether a contribution is tax-free under 721 is a CPA question.
- Selling the LLC later triggers it. Quote (A)(8): assessable "if the ownership interest conveyed
  is more than fifty percent of the corporation, partnership, sole proprietorship, limited
  liability company, limited liability partnership, or other legal entity". The entity "shall
  notify the applicable property tax assessor on a form provided by the Department of Revenue
  not more than forty-five days after a conveyance"; penalty "not less than one hundred nor
  more than one thousand dollars as determined by the assessor".
- What a reassessment does (3140). Value resets to that for "December thirty-first of the year in
  which an assessable transfer of interest has occurred"; the 15% cap does not apply "when an
  assessable transfer of interest occurred in the year that the transfer value is first subject
  to tax"; the new value is "first subject to property tax in the following tax year".

## 5. The 4% legal residence ratio and a home titled in an LLC

Source: https://www.scstatehouse.gov/code/t12c043.php, SECTION 12-43-220(c). HISTORY: last
amended 2021 Act No. 56. Read 2026-09-06 (curl).
- Owner-occupant test. Quote (c)(1): the legal residence "when owned totally or in part in fee or
  by life estate and occupied by the owner of the interest" ... "are taxed on an assessment equal
  to four percent of the fair market value of the property". Quote: "a residence does not qualify
  as a legal residence unless the residence is determined to be the domicile of the
  owner-applicant."
- A rental is out whoever owns it. Quote (c)(1): "If this property has located on it any rented
  mobile homes or residences which are rented or any business for profit, this four percent
  value does not apply to those businesses or rental properties."
- Trusts are named in (c)(1); LLCs are not. Quote: "If residential real property is held in trust
  and the income beneficiary of the trust occupies the property as a residence, then the
  assessment ratio allowed by this item applies if the trustee certifies to the assessor".
- The only LLC text is inside the fractional-interest rule, (c)(2)(8), which prorates the ratio
  when the applicant "has an ownership interest in the residence that is less than fifty percent
  ownership in fee simple". (8)(iii): "This subitem (8) does not apply to property held
  exclusively by:" ... "(D) a limited liability company if the person claiming the special four
  percent assessment ratio transferred the subject property to the limited liability company"
  ... "and the only members of the limited liability company are the person and the person's
  parents, spouse, children, grandchildren, or siblings". A carve-out from proration only.

Source: https://www.sccourts.org/media/opinions/HTMLFiles/SC/27032.htm, CFRE, LLC v. Greenville
County Assessor, S.C. Supreme Court Opinion No. 27032, filed August 29, 2011, "AFFIRMED IN PART,
REVERSED IN PART, AND REMANDED". Read 2026-09-06 (WebFetch, then curl).
- Holding. Quote: "That section disregards the corporate form for single-member limited liability
  companies that are not taxed as corporations, thereby merging the existence of the company and
  its member for all tax purposes." Quote: "if that member is a natural person who meets all the
  criteria imposed by section 12-43-220 with respect to property titled in the company's name,
  then the company is entitled to this lower ratio." Quote: "Because it is undisputed that Ray
  herself meets all the requirements of section 12-43-220 with respect to CFRE's property, CFRE
  is entitled to the legal residence ratio."
- The court reversed an ALC ruling that had relied on "two Attorney General's Opinions stating
  these companies cannot receive the four percent ratio". Multi-member LLCs were not before it.

Source: https://www.horrycountysc.gov/media/v5ajislx/legalres-instructionspdf.pdf, "INSTRUCTIONS
FOR 4% LEGAL RESIDENCE APPLICATION", Horry County Assessor, undated, read 2026-09-06 (curl,
pypdf). The county form anticipates single-member LLC owners. Quote: "Additional documentation
must be provided where applicable" ... "copies of: trusts, bond for title, operating agreement
for single member LLC's, etc." The checklist
(https://www.horrycountysc.gov/media/oy0hxkmu/spa-required-docs-4252023.pdf, read 2026-09-06)
lists "IF APPLICABLE": "Recorded Certificate of Trust or Full Trust, Land Sales Contract, LLC
Operating Agreement".

## 6. Due-on-sale: the federal list of protected transfers [LOAN FACT]

Source: https://www.law.cornell.edu/uscode/text/12/1701j-3, 12 U.S.C. 1701j-3 "Preemption of
due-on-sale prohibitions" (Pub. L. 97-320, title III, § 341, Oct. 15, 1982). Read 2026-09-06.
Heading and edition confirmed at
https://www.govinfo.gov/content/pkg/USCODE-2023-title12/html/USCODE-2023-title12-chap13-sec1701j-3.htm
(2023 Edition), read 2026-09-06.
- Scope (d): "With respect to a real property loan secured by a lien on residential real property
  containing less than five dwelling units" ... "a lender may not exercise its option pursuant
  to a due-on-sale clause upon—".
- The nine items, verbatim: "(1) the creation of a lien or other encumbrance subordinate to the
  lender's security instrument which does not relate to a transfer of rights of occupancy in the
  property;" "(2) the creation of a purchase money security interest for household appliances;"
  "(3) a transfer by devise, descent, or operation of law on the death of a joint tenant or
  tenant by the entirety;" "(4) the granting of a leasehold interest of three years or less not
  containing an option to purchase;" "(5) a transfer to a relative resulting from the death of a
  borrower;" "(6) a transfer where the spouse or children of the borrower become an owner of the
  property;" "(7) a transfer resulting from a decree of a dissolution of marriage, legal
  separation agreement, or from an incidental property settlement agreement, by which the spouse
  of the borrower becomes an owner of the property;" "(8) a transfer into an inter vivos trust in
  which the borrower is and remains a beneficiary and which does not relate to a transfer of
  rights of occupancy in the property; or" "(9) any other transfer or disposition described in
  regulations prescribed by the Federal Home Loan Bank Board."
- No item names a limited liability company, a corporation or a partnership. The regulation item
  (9) points to, 12 CFR 191.5 (https://www.law.cornell.edu/cfr/text/12/191.5, read 2026-09-06 by
  curl; ecfr.gov redirected to an unblock page), is narrower: it covers "any loan on the security
  of a home occupied or to be occupied by the borrower" and its trust item requires that "the
  borrower is and remains the beneficiary and occupant of the property". No entity there either.

## 7. Conventional loans: who may borrow; moving title after closing [LOAN FACT, sources line only]

Source: https://selling-guide.fanniemae.com/sel/b2-2-01/general-borrower-eligibility-requirements,
Selling Guide B2-2-01 "General Borrower Eligibility Requirements", 09/03/2025. Read 2026-09-06.
- Quote: "Fannie Mae purchases or securitizes mortgages made to borrowers who are natural persons
  and have reached the age at which the mortgage note can be enforced in the jurisdiction where
  the property is located." Quote: "Exceptions to the requirement that borrowers be natural
  persons are: inter vivos revocable trusts, HomeStyle Renovation mortgages, and land trusts in
  those states where the beneficiary is an individual." An LLC is not among the exceptions.

Source: https://servicing-guide.fanniemae.com/svc/d1-4.1-02/allowable-exemptions-due-type-transfer,
Servicing Guide D1-4.1-02 "Allowable Exemptions Due to the Type of Transfer", 08/13/2025. Read
2026-09-06.
- The LLC exemption, three conditions: a transfer to "a limited liability company (LLC), provided
  that the mortgage loan was purchased or securitized by Fannie Mae on or after June 1, 2016";
  "the LLC is controlled by the original borrower or the original borrower owns a majority
  interest in the LLC"; and "if the transfer results in a permitted change of occupancy type to
  an investment property, such change does not violate the security instrument (for example, the
  12 month occupancy requirement for a principal residence)".
- The way back: "The servicer must notify the borrower that a property transferred to an LLC must
  be transferred back to a natural person in order to qualify for a refinance loan and to meet
  Fannie Mae's Selling Guide underwriting requirements." One investor's rule; it says nothing
  about a loan another investor or a portfolio lender holds.

Source: https://selling-guide.fanniemae.com/sel/b2-1.3-03/cash-out-refinance-transactions,
Selling Guide B2-1.3-03 "Cash-Out Refinance Transactions", 12/10/2025. Read 2026-09-06.
- Quote: "If the property was owned prior to closing by a limited liability corporation (LLC)
  that is majority-owned or controlled by the borrower(s)" ... "the time it was held by the LLC
  may be counted towards meeting the borrower's six-month ownership requirement." Quote: "In
  order to close the refinance transaction, ownership must be transferred out of the LLC and into
  the name of the individual borrower(s)."

## 8. Nonresident seller withholding when the property is sold later

Source: https://www.scstatehouse.gov/code/t12c008.php, SECTION 12-8-580. HISTORY ends "2024 Act
No. 215 (S.577), SECTION 4, eff July 2, 2024." Read 2026-09-06 (curl).
- With an affidavit of gain. Quote (A)(1)(a): the buyer shall withhold "a percentage equal to the
  maximum individual tax rate of the gain recognized on the sale by a nonresident individual,
  partnership, trust, or estate and five percent for a nonresident corporation or other
  nonresident entity". Without one, the same percentages apply to the amount realized (A)(1)(b);
  cap (A)(1)(c): "the entire net proceeds payable to the nonresident seller".
- The 7% is gone. "Effect of Amendment": "2024 Act No. 215, SECTION 4, in (A)(1), in (a) and (b),
  substituted 'a percentage equal to the maximum individual tax rate' for 'seven percent'."
- How an LLC is classed: 12-8-580 never says "limited liability company". Through 12-2-25
  (section 3) an LLC taxed as a partnership is a "partnership" (individual-rate group), one taxed
  as a corporation is a "corporation" (five percent group), and a disregarded single-member LLC
  is its owner. No SCDOR document opened today says this in one sentence (Not verified).
- Who is on the hook (D)(2): "The buyer is liable for the collection and payment of an amount due
  pursuant to this section." A "closing attorney is not liable for the collection".

Source: https://dor.sc.gov/sites/dor/files/forms/I290.pdf, form I-290 "NONRESIDENT REAL ESTATE
WITHHOLDING" (Rev. 7/17/23). Read 2026-09-06 (curl, pypdf).
- Line 2: "Is the seller a corporation?" ... "If YES, multiply line 1 by 5%. If NO, multiply line
  1 by South Carolina's top marginal Individual Income Tax rate for the tax year of the sale."
- Entity sellers: "If the seller is a Partnership, S Corporation, Estate, or Trust, the buyer must
  issue one I-290 to the entity, reporting the total amount of withholding (using the FEIN)."
  "The entity will then allocate the tax withheld to each partner, shareholder, or beneficiary in
  proportion to their percentage of ownership in the property sold." Due: "Return and payment are
  due by the 15th day of the month following the month of the sale."

Source: https://dor.sc.gov/tax/individual-income, "Individual Income Tax | SCDOR". Read
2026-09-06 (WebFetch, then curl to confirm).
- The "maximum individual tax rate" the statute points to. Quote: "The 2025 top marginal
  Individual Income Tax rate is 6% on taxable income." For 2026 the structure changed. Quote:
  "The tax year 2026 tax rate for income from $30,000 and above is 5.21%, minus $966." Quote:
  "Review Information Letter #26-20 for complete details." The posted 12-6-510 still shows the
  2022 Act phase-down and a 2025 schedule at "6.0%"; it does not yet carry the 2026 change.

Source: https://dor.sc.gov/tax/withholding, "Withholding" (SCDOR), read 2026-09-06: withholding
applies to "Net proceeds going to nonresident sellers of real estate and associated tangible
personal property located in South Carolina" and to "Rental payments made to nonresidents who
own five or more residential units or one or more commercial properties in South Carolina".

## 9. Insurance

- SC Department of Insurance guide "Choosing, Purchasing, and Maintaining Homeowner's Insurance",
  https://doi.sc.gov/DocumentCenter/View/2470/All-You-Ever-Wanted-To-Know-About-South-Carolina-Homeowners-Insurance,
  undated, read 2026-09-06 (curl, pypdf). Quote: "Insuring the building is the responsibility of
  the landlord or the owner of the property."
- https://www.progressive.com/answers/landlord-insurance/, read 2026-09-06. Quote: "Sometimes
  referred to as landlord insurance, a dwelling fire policy is a type of homeowners insurance for
  a property that you own and rent to tenants." https://www.travelers.com/landlord-insurance,
  read 2026-09-06: the policy covers "rental properties containing one to four units".
- None of the eight insurance pages opened (four DOI pages including doi.sc.gov/954, two
  Travelers, State Farm, Progressive) says anything about naming an LLC as the insured.

## 10. Federal and state income tax treatment

Source: https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies,
"Single member limited liability companies | Internal Revenue Service", 27-Jul-2026. Read
2026-09-06.
- Quote: "For income tax purposes, an LLC with only one member is treated as an entity disregarded
  as separate from its owner, unless it files Form 8832 and affirmatively elects to be treated as
  a corporation." The owner reports on one of "Form 1040 or 1040-SR Schedule C, Profit or Loss
  from Business (Sole Proprietorship)", "Form 1040 or 1040-SR Schedule E, Supplemental Income or
  Loss", "Form 1040 or 1040-SR Schedule F, Profit or Loss from Farming".

Source: https://www.irs.gov/businesses/small-businesses-self-employed/tips-on-rental-real-estate-income-deductions-and-recordkeeping,
"Tips on rental real estate income, deductions and recordkeeping", 04-Apr-2026. Read 2026-09-06.
Quote: "If you rent real estate such as buildings, rooms or apartments, you normally report your
rental income and expenses on Form 1040 or 1040-SR, Schedule E, Part I." Multi-member default,
https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc
(29-May-2026, read 2026-09-06): "a domestic LLC with at least two members is classified as a
partnership for federal income tax purposes unless it files Form 8832".

Source: SCDOR Corporate FAQs (section 1). Quote: "A single member LLC not taxed as a corporation
for Income Tax purposes is not regarded as an entity separate from its owner." Quote: "An LLC has
the option to file as a corporation (SC1120), partnership (SC1065), or individual (SC1040 with
Schedule C, E, or F)." SC Revenue Ruling #98-11 (signed May 6, 1998),
https://dor.sc.gov/income-tax-single-member-limited-liability-company, read 2026-09-06: "all
transfers between the LLC and its member are ignored and exempt from the deed recording fee" when
the single-member LLC is disregarded; its income "is reported on the single member's Form SC1040".

## 11. Member liability under the SC LLC Act

Source: https://www.scstatehouse.gov/code/t33c044.php, SECTION 33-44-303 "Liability of members
and managers". HISTORY: 1996 Act No. 343. Read 2026-09-06 (curl).
- Quote (a): "the debts, obligations, and liabilities of a limited liability company, whether
  arising in contract, tort, or otherwise, are solely the debts, obligations, and liabilities of
  the company." Quote: "A member or manager is not personally liable for a debt, obligation, or
  liability of the company solely by reason of being or acting as a member or manager."
- Opt-in liability (c): members are liable "if: (1) a provision to that effect is contained in the
  articles of organization; and (2) a member so liable has consented in writing". SOS form F0006
  item 7: "Check this box only if one or more of the members of the company are to be liable for
  its debts and obligations under Section 33-44-303(c)."
- The statute says "solely by reason of". It does not address a personal guaranty, a member's own
  negligence, or a court piercing the entity; no primary source opened today covers those.

## Consistency with pages already live

- /invest/strategies/dscr-loans/ and /invest/str-vs-ltr/ say a DSCR loan "can close in an LLC".
  Sections 6 and 7 cover conventional, natural-person loans, so nothing here contradicts that.
  The DSCR page's "same taxpayer" line for a single-owner LLC matches section 10.

## Not verified

- The $15 "Electronic Records Access" charge: seen only on a system receipt, never in prose on
  sos.sc.gov or businessfilings.sc.gov. Vendor pages say $125 online; do not cite them.
- The 2026 rate act: the SCDOR page cites "Information Letter #26-20"; a search snippet says "Act
  110". Neither was opened. Cite the SCDOR page, not the act.
- Whether an LLC taxed as a partnership withholds at the individual rate or the 5% entity rate
  under 12-8-580: follows from 12-2-25(A)(1) plus the statute's word "partnership", but no SCDOR
  document says it outright. SC Revenue Ruling #09-13
  (https://dor.sc.gov/resources-site/lawandpolicy/Advisory%20Opinions/RR09-13.pdf, read
  2026-09-06, pypdf) still says "7%" and is silent on LLCs.
- Naming an LLC as the insured on a landlord policy: no DOI or carrier page opened says anything.
  The DOI "Types of Rental Insurance" page (doi.sc.gov/568) is about rental cars.
- Multi-member LLCs and the 4% ratio: CFRE covers a single-member LLC only; no source found.

## What will go stale

- SOS fees (undated pages; form last revised August 2016). Re-open the DownloadForms page.
- The withholding percentage tracks the top individual rate each year: 6% for 2025, "5.21%" for
  2026 per SCDOR. I-290 is Rev. 7/17/23; RR #09-13 still says 7%. Re-open
  dor.sc.gov/tax/individual-income before any publish.
- Fannie Mae sections carry dates (09/03/2025, 08/13/2025, 12/10/2025) and change often.
- The Deed Recording Fee Manual is January 2024 (RR #24-1); a new edition supersedes Question 23.
- 12-37-3150 (last amended 2012) and 12-43-220(c) (2021) can change any session; bills naming
  single-member LLCs in 12-43-220 have been filed before (CFRE mentions two).

## Questions only the brokerage can answer

- BrickWood in practice: for a conventional loan, whether they tell borrowers a post-closing deed
  to the borrower's own LLC is acceptable, what notice they want, and whether any loan they
  originated was ever called after an LLC transfer. Which DSCR programs close in the LLC's name,
  whether a personal guaranty is always required, and what LLC documents the underwriter asks
  for (articles, operating agreement, certificate of existence).
- Whether the closing attorneys Chapter3 works with draft the deed into the LLC, what they charge,
  whether they file the exempt-transfer affidavit citing 12-24-40(8) or 12-2-25(B), and whether
  they have seen Horry or Georgetown County reassess after a deed to a single-member LLC.
- How those attorneys treat an LLC seller with out-of-state members on the I-290: as a
  partnership at the individual rate, or as an "other nonresident entity" at 5%.
- What clients actually do: share of investor buyers who hold in an LLC; single- versus
  multi-member; formed before contract, at closing, or after; own registered agent or a paid
  service; several properties in one LLC or one each.
- Which carriers have written a landlord (DP-3) policy with the client's LLC as named insured on
  a Grand Strand rental, and whether the member was added as an additional insured.
- Whether the Horry County Assessor has accepted a 4% application on a client's single-member
  LLC-owned home since CFRE, and what documents it asked for.
