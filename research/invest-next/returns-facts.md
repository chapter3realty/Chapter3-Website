# What return should a Myrtle Beach rental make: verified facts

Researcher notes, not page copy. Every number gives the source opened, a
verbatim quote where the source is prose, the URL and the read date. Anything
not opened is marked NOT VERIFIED. No conclusions about any named building,
HOA or builder.

Read dates: all web sources were opened on 2026-09-08 UTC, which is the evening
of 2026-09-07 US Eastern. Written for the page "What return should a Myrtle
Beach rental make?" (cap rate, cash-on-cash, coverage ratio, dealbreakers,
hover map of nine submarkets).

Data folder: `research/invest-next/data/`. The raw Zillow CSVs (about 235 MB)
are gitignored there by an existing `.gitignore`; the extracted rows, the two
scripts, the tables and `submarkets.json` are the tracked outputs. Files named
`hold-*` in that folder belong to another session (the hold-period page) and
were not touched.

Tool notes. zillow.com/research/data/ returns 403 to curl with a browser user
agent and to WebFetch; the CSV files on files.zillowstatic.com download
without any header trick. api.census.gov now redirects every keyless query to
a "Missing Key" page. huduser.gov opens with a browser user agent. gtcountysc.gov
pages open with curl; its CivicPlus "Archive" pages render no titles, so the
millage PDFs there could not be identified. visiolending.com, kiavi.com/rental-loans,
businesswire.com and mediaassets.cbre.com return 403 to both tools;
kiavi.com's guide page opens with curl.

---

## 1. What the site already carries

### 1a. The nine submarket pages (chapter3realty/submarkets/*/index.html), read 2026-09-08

What each page shows for short-term rental, in order: (i) a bar chart titled
"Typical short-term rental occupancy by month" with 12 monthly percentages,
(ii) the same 12 values again in a table titled "Typical short-term rental
occupancy by month (illustrative)", so 24 printed percentages but 12 distinct
values, (iii) three tiles (average annual revenue, occupancy, average nightly
rate), (iv) one sentence with the top-tenth and median monthly gross, ending
"AirROI, data through 2026-08-08."

The monthly curves are unsourced. Every page prints under the chart:
"Illustrative seasonal pattern for Grand Strand short-term rentals. Actual
occupancy varies by building, corridor, and management. Ask for live revenue
history on any specific unit." Their origin is commit `2a07286` ("Replaced
identical Grand Strand seasonal curve with per-submarket curves + honest
'illustrative model' labels"). They are a model, not vendor data, and they
overstate summer: AirROI's June occupancy for Myrtle Beach is 48.8 percent
(section 1b) while the page's June bar reads 84 percent. Treat the 12-value
series as NOT VERIFIED; the JSON carries it only so the page builder knows
what is currently published.

The tile numbers come from one file, `data/str-market.json` ("ONE source of
truth for every page that shows these numbers"), vendor AirROI, `retrieved
2026-08-15`, `dataAsOf 2026-08-08`, note: "Trailing twelve months. Revenue is
the average per active listing, not a median. Occupancy is booked nights over
all calendar nights." Every value in the table below was re-opened on the
AirROI page on 2026-09-08 and matched (section 1b).

| Submarket | Illustrative occupancy Jan..Dec (page, unsourced) | Avg annual revenue | Occupancy | ADR | Top tenth / month | Median listing / month | Price medians stated on the page (source the page cites) |
|---|---|---|---|---|---|---|---|
| Myrtle Beach | 19,22,39,52,69,84,90,85,63,51,29,21 | $20,946 | 33.2% | $253 | $6,043 | $2,115 | "Zillow put the city home-value index near $315,000 in early 2026, down about 3 percent year over year. Single-family homes commonly run in the $330,000s to high $380,000s. The ZIP codes range from about $275,000 in 29577 to about $354,000 in 29579." No Zillow link on the page. |
| North Myrtle Beach | 23,29,42,59,66,81,88,79,61,56,33,23 | $28,667 | 32.2% | $374 | $8,753 | $2,729 | "Median sale prices were roughly $399,000 to $415,000 in early 2026 per Redfin and Zillow"; "two-bedroom condos ... around a $268,000 median"; SF "well into the $600,000s". Neither source linked. |
| Surfside Beach | 18,23,37,52,67,85,91,83,59,47,27,21 | $35,482 | 34.2% | $415 | $11,379 | $3,221 | "Redfin, for example, reported around $530,000 in early 2026" (blended); "the typical home-value index is closer to the $347,000 to $360,000 range"; detached SF "into the $800,000s". Neither source linked. |
| Garden City | 17,20,33,48,68,84,90,82,58,42,24,16 | $33,942 | 36.2% | $372 | $9,411 | $2,916 | "Oceanfront and ocean-view condos ... low $200,000s to about $400,000"; raised beach houses "$600,000s past $1 million"; "Horry County oceanfront and resort condos were reported around a $238,825 median in early 2026". No price source linked. |
| Murrells Inlet | 30,32,41,52,63,74,79,75,60,53,37,31 | $38,356 | 37.7% | $406 | $10,063 | $3,047 | "from the mid $330,000s to about $445,000 depending on the source"; "Redfin reported a median near $360,000 in early 2026". Links https://www.redfin.com/city/24397/SC/Murrells-Inlet/housing-market. |
| Pawleys Island | 27,30,42,55,62,74,80,72,58,54,38,30 | $27,953 | 33.4% | $392 | $7,499 | $2,528 | "Zillow's home-value index was near $514,000 in mid-2026, up about 5 percent year over year"; "median list price in the mid $500,000s". Links https://www.zillow.com/home-values/35932/pawleys-island-sc/. |
| Little River | 24,28,38,50,58,68,78,74,54,53,36,28 | $12,243 | 30.3% | $202 | $4,106 | $1,505 | "Redfin reported a median near $292,000 for the three months ending May 2026, down about 8 percent"; "Zillow's home-value index was near $321,000". Links https://www.redfin.com/city/23919/SC/Little-River/housing-market. |
| Conway | 34,35,40,44,48,52,54,53,46,44,38,34 | $21,285 | 34.7% | $245 | $5,347 | $1,808 | "Redfin reported a median near $280,000 for the three months ending May 2026, down about 4.5 percent"; "Other trackers put the median around $300,000 to $320,000". Links https://www.redfin.com/city/4264/SC/Conway/housing-market. |
| Carolina Forest | none | none | none | none | none | none | "Redfin's Carolina Forest page showed a median sale price of $418,000, up 7.7 percent"; "SC Realtors data for ZIP 29579 showed a $464,710 single-family median in December 2025, up from $426,500"; condos "near $215,500". Sources block lists Census Reporter, Horry County Schools, SC Association of Counties, SC DOI, FEMA; Redfin and SC Realtors are not linked. |

Carolina Forest, verbatim: "The vacation-rental data vendors publish a market
report for every coastal Grand Strand town. They do not publish one for
Carolina Forest, because there is no nightly-rental market here to measure."
`str-market.json` records "AirROI returns 404 for Carolina Forest ... Do not
invent a row for it".

Nightly rate: the only nightly figure on any page is the AirROI "average
nightly rate" tile above. Myrtle Beach also says "the median list price and
median nightly rate vary enormously by building and corridor" with no number.

The page-stated price medians (Redfin, SC Realtors, Zillow early/mid-2026) were
NOT re-opened here. The page builder should use the Zillow file values in
section 2, which are dated and reproducible, rather than carry these forward.

### 1b. AirROI, re-opened 2026-09-08 (rule 8: re-open every source)

All eight pages say "Updated: 2026-08-08" and cover "August 2025 – July
2026". Values matched `str-market.json` and the pages on every tile. New
facts the site does not yet use, per market:

- Myrtle Beach: "8,583 active listings"; YoY revenue "-10.7%"; peak June
  "$4,878" revenue, "48.8%" occupancy; low January "$1,466", "23.5%".
  https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach
- Murrells Inlet: "461 active listings"; YoY "-0.1%"; June "$7,420"; January
  "$2,366"; occupancy by tier: top 10% "73%+", top 25% "56%", median "around
  36%", bottom 25% "19%"; ADR by tier $788+ / $455 / $275 / $198.
  https://www.airroi.com/airbnb-data/united-states/south-carolina/murrells-inlet
- Surfside Beach: "538 active listings"; YoY "-10.1%"; occupancy by tier 72%+
  / 52% / "around 30%" / 16%; ADR by tier $798+ / $520 / $305 / $209; peak
  June, lowest December (no monthly occupancy shown).
  https://www.airroi.com/airbnb-data/united-states/south-carolina/surfside-beach
- Garden City Beach: "395" listings; YoY "-11.1%"; June "$6,480", "48.9%",
  ADR "$426"; January "$2,701", "27.6%", ADR "$314"; tiers 76%+ / 57% / 33% /
  17%. https://www.airroi.com/airbnb-data/united-states/south-carolina/garden-city-beach
- North Myrtle Beach: "4,406 active listings"; YoY "-5.4%"; peak season
  (June, August, July) "$6,040" a month, "42.1%" occupancy, "$446" ADR; low
  season (January, February, December) "$2,349", "24.3%", "$313"; tiers 69%+
  / 49% / 28% / 14%. https://www.airroi.com/airbnb-data/united-states/south-carolina/north-myrtle-beach
- Pawleys Island: "428 active listings"; YoY "9.9%"; June "$5,457", "46.3%",
  "$440"; January "$2,105", "24.5%", "$343"; tiers 72%+ / 52% / 30% / 16%.
  https://www.airroi.com/airbnb-data/united-states/south-carolina/pawleys-island
- Conway: "106" listings; YoY "9.2%"; June "$3,337", "47.6%", "$247"; January
  "$1,606", "28.0%", "$216"; tiers 70%+ / 53% / 33% / 17%; "Average length of
  stay: 4.1 nights"; "Average cleaning fee: $129".
  https://www.airroi.com/airbnb-data/united-states/south-carolina/conway
- Little River: "171" listings; YoY "1.8%"; June "$2,759", "41.5%", "$242";
  January "$1,513", "25.3%", "$179"; tiers 67%+ / 44% / 25% / 13%.
  https://www.airroi.com/airbnb-data/united-states/south-carolina/little-river

NOT VERIFIED: whether AirROI "revenue" is before or after platform fees,
cleaning fees and accommodations taxes. The pages do not say. Treat it as
gross booking revenue and say so on the page.

### 1c. Figures already established on other pages (not re-derived)

Fair market rent, /invest/rent-prices/ (read 2026-09-08): "The federal fair
market rent for Horry County, fiscal year 2027, is $1,258 for one bedroom,
$1,504 for two, $1,823 for three and $1,981 for four. Utilities are
included. Forty out of 100 standard homes rent at or below it, so most rent
for more. The metro's typical asking rent across all home types was about
$1,714 in July 2026." Table adds studio "$1,155". Trend: "from about $1,695 in
September 2025 to about $1,714 in July 2026, about one percent." Sources line:
"HUD, fair market rents FY2027, HUD, how fair market rents are defined, Zillow
research data, observed rent index. Read September 7, 2026." Links:
https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx and
https://www.huduser.gov/portal/datasets/fmr.html.
Cheap confirmation, because the file is small: FY27_FMRs.xlsx downloaded
2026-09-08 (HTTP 200, 375,708 bytes, Last-Modified 2026-08-26). Row "Horry
County", "Myrtle Beach-North Myrtle Beach-Conway, SC HUD Metro FMR Area":
fmr_0 1155, fmr_1 1258, fmr_2 1504, fmr_3 1823, fmr_4 1981. Matches. Row
"Georgetown County, SC" (non-metro, hud_area_code NCNTY45043N45043): fmr_0
842, fmr_1 885, fmr_2 1158, fmr_3 1380, fmr_4 1936. **Pawleys Island is in
Georgetown County, so its three-bedroom FMR is $1,380, not $1,823.** The
Georgetown portions of Murrells Inlet and Garden City are also $1,380.

Insurance, /invest/landlord-insurance/ (read 2026-09-08): "A landlord policy
on a Myrtle Beach house costs about $1,700 to $4,400 a year. That is 15 to 25
percent more than the homeowner policy on the same house, which costs about
$1,500 to $3,500 here. In Chapter3's files the difference has been 15 to 20
percent." Flood: "Federal flood insurance adds a $250 yearly surcharge on a
rental" and "In Chapter3's files that multiple has been about three." Tax
multiple on the same page: "about three times the legal-residence bill in the
unincorporated county. Inside the city of Myrtle Beach it is about four
times." Short-term rental insurance, /invest/airbnb-income/: "short-term-rental
insurance at roughly two to three times a standard homeowner policy"
(unsourced on the page).

Property tax, /buyers/property-taxes/ (read 2026-09-08): "Legal residences are
also fully exempt from the school operating tax, the single biggest line on a
Horry County bill at 109.1 mills for 2025. Six percent properties pay all of
it. Stack the two rules and the real gap is not 1.5 times. It is roughly 3.3
times in unincorporated Horry County and about 4.3 times inside the city of
Myrtle Beach." Table, "Real numbers for a $400,000 house, tax year 2025": City
of Myrtle Beach "about $1,430" at 4% and "about $6,110" at 6%; Unincorporated
Horry County "about $1,470" and "about $4,820". The calculator's embedded
millage (tax year 2025 certified, per the page), as the option values, used
in section 5: City of Myrtle Beach 254.6 (of which city 83.4); North Myrtle
Beach 216.2; Surfside Beach 214.2; Conway 269.3; Murrells Inlet / Garden City
207.3; Unincorporated Horry (Carolina Forest, Socastee, Little River) 201.0.
The 6% branch is `price x 0.06 x mills / 1000`. Disclaimer on the page: "It
excludes small special districts, the $89 unincorporated stormwater fee, and
any millage changes after 2025." The calculator has no Georgetown County
option; Pawleys Island is handled in section 5 from the county's own
calculator.

Other figures on the site that touch this page (all unsourced on their pages,
read 2026-09-08):
- /invest/strategies/dscr-loans/: "This clears the range most lenders want on
  a purchase, 1.10 to 1.25 or better." "Our preferred lender starts writing
  DSCR loans at 0.75." "only 75 percent of a short-term estimate counts toward
  the ratio." "Expect 15 to 25 percent down on most Grand Strand DSCR loans,
  from the current BrickWood Mortgage investor programs." (The brief said the
  site cites 1.25 to 1.5; it does not. The live figure is 1.10 to 1.25.)
- /invest/long-term-rental/: "Investor lenders typically look for 1.20 or
  higher."; "Use 5 to 8 percent for a long-term rental as a planning number";
  "Long-term management typically runs 8 to 10 percent of collected rent plus
  a leasing fee."; **"As of mid-2026, Grand Strand long-term rentals commonly
  pencil out in the 5 to 7 percent cap range."** Section 5 does not support
  that sentence; flag it for the owner.
- /invest/rent-prices/: "Management | ... National companies publish 10 and
  15 percent plans."
- /invest/str-vs-ltr/: STR "all-in expense ratios ... commonly land between 45
  and 60 percent of gross before debt service"; LTR "Taxes, insurance,
  maintenance, and management typically absorb 35 to 45 percent of collected
  rent". /invest/airbnb-income/ says instead "expenses consume 55 to 65
  percent of gross on a professionally managed unit" and "Management: 20 to 30
  percent for a full-service offsite manager, 10 to 15 for booking-only
  services, and 35 to 45 percent on an onsite condotel rental desk." Two pages,
  two ranges (45-60 and 55-65). `str-market.json` also carries the owner's
  observed management ranges: "fullServiceLow 40, fullServiceHigh 60 ...
  basicLow 12.62, basicHigh 17.45" of gross profit, "stated by Devin Day
  2026-08-15. Not vendor-published."
- /invest/ hub tile: "+10.5%  Year-over-year  Price growth across the Grand
  Strand". Unsourced; replaced by section 3.

---

## 2. Zillow ZIP and city rent index (ZORI) and home value index (ZHVI)

Files, downloaded 2026-09-08 02:49 UTC with curl from files.zillowstatic.com
(HTTP 200; server Last-Modified "Sun, 16 Aug 2026"; last data column
`2026-07-31` in every file):
- https://files.zillowstatic.com/research/public_csvs/zori/Zip_zori_uc_sfrcondomfr_sm_month.csv (9,916,175 bytes)
- https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv (123,065,811 bytes)
- https://files.zillowstatic.com/research/public_csvs/zori/City_zori_uc_sfrcondomfr_sm_month.csv (4,803,345 bytes)
- https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv (93,567,045 bytes)
- https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv (4,459,358 bytes)

The listing page https://www.zillow.com/research/data/ returned 403 (curl with
a browser user agent, and WebFetch), so the file names were taken from the
brief's naming convention and confirmed by the 200 responses and headers
above. ZORI series name means "smoothed, all homes (single-family, condo,
multifamily)", ZHVI means "all homes, mid-tier (33rd to 67th percentile),
smoothed, seasonally adjusted"; Zillow's methodology text was NOT VERIFIED
because the page would not open. Extracted rows are saved as
`data/grand-strand-{zip_zori,zip_zhvi,city_zori,city_zhvi,metro_zhvi}-rows.csv`;
`data/zillow-extract-summary.json` holds the values below;
`data/extract-zillow.js` regenerates all of it.

### 2a. ZIP level, data month 2026-07-31, prior 2025-07-31

| ZIP | Zillow City / County | Submarket mapping | ZORI Jul 2026 | ZORI Jul 2025 | ZORI YoY | ZHVI Jul 2026 | ZHVI Jul 2025 | ZHVI YoY |
|---|---|---|---|---|---|---|---|---|
| 29566 | Little River / Horry | Little River | $1,502 | $1,562 | -3.84% | $323,004 | $325,129 | -0.65% |
| 29582 | North Myrtle Beach / Horry | North Myrtle Beach | $1,627 | $1,477 | +10.19% | $400,143 | $399,588 | +0.14% |
| 29572 | Myrtle Beach / Horry | Myrtle Beach (north end, Grande Dunes area) | $1,595 | $1,534 | +4.01% | $319,482 | $321,908 | -0.75% |
| 29577 | Myrtle Beach / Horry | Myrtle Beach (city core) | $1,680 | $1,655 | +1.52% | $279,713 | $281,868 | -0.76% |
| 29579 | Myrtle Beach / Horry | Carolina Forest | $1,736 | $1,747 | -0.66% | $359,496 | $359,557 | -0.02% |
| 29588 | Myrtle Beach / Horry | Myrtle Beach (Socastee side) | $1,682 | $1,668 | +0.88% | $324,770 | $323,666 | +0.34% |
| 29575 | Surfside Beach / Horry | Surfside Beach | $1,607 | $1,566 | +2.57% | $360,243 | $355,292 | +1.39% |
| 29576 | Murrells Inlet / Horry (Zillow's label) | Murrells Inlet and Garden City (one ZIP covers both) | $1,943 | $1,918 | +1.28% | $401,110 | $400,732 | +0.09% |
| 29585 | Pawleys Island / Georgetown | Pawleys Island | $1,926 | no data | n/a | $550,277 | $549,510 | +0.14% |
| 29526 | Conway / Horry | Conway | $1,892 | $1,854 | +2.08% | $302,222 | $303,140 | -0.30% |
| 29527 | Conway / Horry | Conway (west) | no ZORI row | | | $263,160 | $262,823 | +0.13% |
| 29568 | Longs / Horry | Longs (not one of the nine) | $1,835 | $1,728 | +6.21% | $291,590 | $298,202 | -2.22% |

Notes. ZIP 29585 has ZORI values in only two months of the whole series
(July 2026 is the latest), so no year-over-year figure exists. ZIP 29527 has
no row in the ZORI file. Zillow assigns 29576 to Horry County; the Census
places Murrells Inlet CDP in Georgetown County (where-to-buy-facts.md section
1). Longer ZHVI history for section 5 context: 29579 three years ago
$372,446, five years $292,230, ten years $212,073; 29577 $301,726 / $222,532
/ $162,498; 29582 $417,449 / $308,892 / $219,657; 29585 $512,170 / $398,183
/ $290,070 (all in `zillow-extract-summary.json`).

### 2b. City level, same months

| City (Zillow, SC) | County (Zillow) | ZORI Jul 2026 | ZORI Jul 2025 | YoY | ZHVI Jul 2026 | ZHVI Jul 2025 | YoY |
|---|---|---|---|---|---|---|---|
| Myrtle Beach | Horry | $1,697 | $1,700 | -0.20% | $324,532 | $324,613 | -0.03% |
| North Myrtle Beach | Horry | $1,673 | $1,492 | +12.14% | $398,524 | $398,587 | -0.02% |
| Surfside Beach | Horry | $1,607 | $1,565 | +2.65% | $361,707 | $356,503 | +1.46% |
| Murrells Inlet | Georgetown | $1,948 | $1,922 | +1.35% | $401,332 | $400,667 | +0.17% |
| Pawleys Island | Georgetown | $1,926 | no data | n/a | $548,832 | $548,071 | +0.14% |
| Little River | Horry | $1,503 | $1,566 | -4.02% | $324,412 | $326,536 | -0.65% |
| Conway | Horry | $1,890 | $1,870 | +1.07% | $289,610 | $290,069 | -0.16% |
| Longs | Horry | no ZORI row | | | $286,326 | $292,527 | -2.12% |

No city row exists in either file for Garden City, Carolina Forest, Socastee
or Litchfield Beach (searched all South Carolina rows). Use the ZIP rows for
those.

---

## 3. Metro ZHVI: replaces the "+10.5%" tile

Metro file row: RegionID 394898, SizeRank 117, RegionName "Myrtle Beach, SC",
RegionType msa (Zillow's short name; the ZIP rows carry the full metro name
"Myrtle Beach-Conway-North Myrtle Beach, SC-NC"). Latest month 2026-07-31.

| Window | From (month, value) | To (Jul 2026) | Total change | Annualized |
|---|---|---|---|---|
| 1 year | Jul 2025, $341,411 | $342,010 | +0.18% | +0.18% |
| 3 years | Jul 2023, $347,807 | $342,010 | -1.67% | -0.56% per year |
| 5 years | Jul 2021, $270,892 | $342,010 | +26.25% | +4.77% per year |
| 10 years | Jul 2016, $189,486 | $342,010 | +80.49% | +6.08% per year |

United States row, same file, for comparison: $371,774 in Jul 2026; 1 year
+0.99%; 3 years +4.67% (+1.53% per year); 5 years +21.50% (+3.97% per year);
10 years +78.31% (+5.95% per year).

Annualized = (end / start)^(1/years) - 1. Math in `data/extract-zillow.js`
and the summary JSON. The "+10.5%" tile on /invest/ has no source and no
window that matches any of these; the owner said on 2026-09-07 "10.5 may have
been older numbers ... 10.5 is some areas not every one of them now". No ZIP
in section 2 shows more than +1.39% over the last year.

---

## 4. Benchmarks

### 4a. What coverage ratio DSCR lenders require

Two lenders' own product pages with numbers, plus three more for range. None
states 1.5; the common published floor for standard pricing is 1.00 to 1.25,
and several lenders now fund below 1.00.

- Griffin Funding, https://griffinfunding.com/dscr-loans/, read 2026-09-08,
  page says "Last updated August 2026". "DSCR equals monthly rent divided by
  PITIA, which is principal, interest, taxes, insurance, and HOA." "No minimum
  ratio. Below 1.0 funded with reserves; no-ratio program available." "Griffin
  Funding has no minimum DSCR requirement." Down payment: "As low as 15% with
  740+ credit, and 20% is typical." Credit: "620+ minimum."
- Newfi, https://newfi.com/dscr-loan-requirements/, read 2026-09-08 (page
  timestamps June 22, 2026 and August 31, 2026). "DSCR = Gross Monthly Rent ÷
  Monthly PITIA". "Minimum DSCR as Low as 0.75 for Qualified Borrowers".
  "Cash-out transactions require a DSCR of at least 1.00". "LTV: Up to 80% on
  Purchase, Rate & Term, or Cash-Out". "Credit Scores as Low as 640".
- LendingOne, https://lendingone.com/insight/a-guide-to-dscr-loans-for-real-estate-investors/,
  read 2026-09-08, published September 19, 2025. "Most programs target a DSCR
  of 1.10-1.25 for standard pricing." "Many programs target a DSCR of
  ≥1.10-1.20, depending on the credit". "Purchases typically require a 20-25%
  down payment, resulting in a 75–80% LTV". Formula given there: "DSCR = Net
  Operating Income (NOI) / Total Debt Service (TDS)".
- NASB (North American Savings Bank), https://www.nasb.com/blog/detail/what-are-the-requirements-for-a-dscr-loan,
  read 2026-09-08, dated October 9, 2023, by Matt Allen, Vice President,
  Portfolio Lending. "Lenders typically require a DSCR of at least 1.1x,
  meaning the property's rental income must be at least 10% higher than the
  mortgage payment." "Typically, a down payment of 20-25% of the purchase
  price is required."
- Kiavi, https://www.kiavi.com/the-complete-guide-to-dscr-rental-property-loans,
  opened with curl 2026-09-08. 'Lenders often consider a "good" DSCR to be
  1.25 or higher because it indicates the property generates 25% more income
  than its debt obligations'.
- Angel Oak Mortgage Solutions, https://angeloakms.com/programs/investor-cash-flow/,
  read 2026-09-08. "Debt Service Coverage Ratio is calculated by dividing
  gross rental income by the property's total monthly debt obligation." "85%
  Max LTV (Minimum 720 FICO)". "DSCR < 1.0 and No DSCR options available".

Two definitions are in use and the page must pick one and say so: lenders
(Griffin, Newfi, Angel Oak) divide gross rent by the full payment with taxes,
insurance and dues (PITIA); the site's DSCR page ("the rent the home collects,
divided by the loan payment it must cover") matches that. The NOI-based
version (LendingOne's formula, and the site's long-term-rental page:
"net operating income divided by annual debt service") gives a lower number
for the same house. Section 5 shows both.

NOT VERIFIED: Visio Lending and Kiavi product pages (403 both tools); Lima One
(URL not found). BrickWood's own written guideline was not opened; its 0.75
floor and 15 to 25 percent down are the owner's statements already on the
DSCR page.

### 4b. A published cap-rate benchmark for single-family rentals

Primary: Arbor Realty Trust with Chandan Economics, "Single-Family Rental
Investment Trends Report", quarterly.
- Q1 2026 report, https://arbor.com/research/reports/single-family-rental-investment-trends-report-q1-2026/,
  read 2026-09-08, dated March 2026: "SFR cap rates continued to trend upward
  in the fourth quarter of 2025, rising 19 basis points (bps) to 7.3%". "Since
  falling to a low of 5.4% in the fourth quarter of 2021, cap rates have
  expanded by 194 bps". Spread to the 10-year Treasury "widened to 317 bps in
  the fourth quarter". "occupancy rates across all SFR property types averaged
  94.0% in the fourth quarter of 2025". "rents were up 2.6% year-over-year in
  January 2026".
- Q4 2025 report, https://arbor.com/research/reports/single-family-rental-investment-trends-report-q4-2025/,
  read 2026-09-08, dated December 2025: "SFR cap rates trended upward again in
  the third quarter of 2025, rising six bps to reach 7.1%". "Since bottoming at
  5.4% in late 2021, cap rates have increased in 13 of the past 15 quarters,
  climbing a total of 177 bps." Data sources named on the page: Chandan
  Economics (cap rates), U.S. Census Bureau (occupancy), Zillow Observed Rent
  Index (rent growth).
- Q2 2026 (06/12/2026) and Q3 2026 (09/07/2026) report pages,
  https://arbor.com/research/reports/single-family-rental-investment-trends-report-q2-2026/
  and .../-q3-2026/, read 2026-09-08: "Single-family rental (SFR) cap rates
  rose for a 10th consecutive quarter and have expanded by more than two
  percentage points since 2021." "All 50 of the largest markets in the U.S.
  recorded positive year-over-year rent growth in April 2026." The numeric
  Q1 2026 cap rate is inside the PDF, not on the page: NOT VERIFIED; "more
  than two percentage points" above 5.4 puts it above 7.4 percent.

What this benchmark is: a national, model-based figure for institutional
quality single-family rentals, net operating income over price. It is not
the Grand Strand. Section 5 shows local caps of about 1 to 2.5 percent on a
conservative build and 3 to 5 percent on a lean one, so the page should use
7.3 percent as "what the national investor sector earns", not as a local
target.

Other primary sources tried:
- CBRE U.S. Cap Rate Survey H1 2026, https://www.cbre.com/insights/reports/us-cap-rate-survey-h1-2026,
  read 2026-09-08, published August 12, 2026: "The CRS generates key insights
  from 3,600 cap rate estimates across more than 50 U.S. markets." "More than
  200 CBRE real estate professionals completed the H1 2026 CRS during late
  June." "Infill multifamily is overall the most bearish subtype." No
  residential cap-rate number in the page text; the H2 2025 PDF returned 403.
- ATTOM 2026 Single-Family Rental Market Report,
  https://www.attomdata.com/news/market-trends/single-family-rental/2026-single-family-rental-market-report/,
  read 2026-09-08, released March 5, 2026: "The report examined single-family
  rental returns in the 416 counties with sufficient rental and home sales
  price data to analyze." Uses three-bedroom rents and median sale prices.
  No South Carolina county in the text; Mobile County, AL "13.6 percent" is
  the only Southeast yield quoted. Horry County yield: NOT VERIFIED.
- American Homes 4 Rent Q2 2026 release (8-K exhibit 99.1),
  https://www.sec.gov/Archives/edgar/data/0001562401/000156240126000043/amh0630268kexhibit991.htm,
  read 2026-09-08, dated July 30, 2026: no cap rate or yield stated; "Same-Home
  Average Occupied Days Percentage of 96.0% in the second quarter of 2026".
  Search summaries attribute "cap rates in the 4% area" on 1,300 dispositions
  to the earnings call; the transcript was not opened: NOT VERIFIED.
- Invitation Homes Q2 2026 release: businesswire.com and morningstar.com both
  403. NOT VERIFIED.

### 4c. A cash-on-cash convention

None with a real source. Two searches returned only blogs and glossaries
(AirROI glossary, LoopNet, Landlord Studio, PropertyMetrics, Griffin Funding
blog, Wikipedia); the "8 to 12 percent" figure they repeat cites no survey.
CBRE, Arbor, ATTOM and the REIT filings publish cap rates and yields, not
cash-on-cash. Recommendation: the page derives its thresholds from the local
numbers in section 5 and says that no published standard exists. Constraint
that decides the format: non-negotiable 3 bans any interest rate or payment
amount in page copy, so cash-on-cash on the page has to be a formula with the
reader's own payment, or the payment ceilings in table 5c, never a computed
percentage that embeds a rate.

### 4d. Vacancy and maintenance allowance, sourced

- Fannie Mae Selling Guide B3-3.8-02, Rental Income from the Subject Property
  (09/02/2026), https://selling-guide.fanniemae.com/sel/b3-3.8-02/rental-income-subject-property,
  read 2026-09-08: "multiply monthly gross rent by 75% for the net rental
  income amount". That 25 percent haircut is the conventional lender allowance
  for vacancy and upkeep. (The section was renumbered from B3-3.1-08 on
  2026-09-02; the older URL now redirects to B3-3.8-01, which no longer holds
  the sentence.) Site rule: never name the agency in page copy; write "your
  lender counts 75 percent of the rent".
- Rental vacancy, U.S. Census Bureau Housing Vacancy Survey via FRED. South
  Carolina, annual, series SCRVAC, https://fred.stlouisfed.org/series/SCRVAC,
  read 2026-09-08 (updated March 24, 2026): 2025 9.8 percent, 2024 10.6, 2023
  10.3, 2022 7.8. United States, quarterly, series RRVRUSQ156N,
  https://fred.stlouisfed.org/series/RRVRUSQ156N, read 2026-09-08 (updated
  July 28, 2026): Q2 2026 7.3 percent; Q1 2026 7.3; Q4 2025 7.2; Q3 2025 7.1;
  Q2 2025 7.0. "The rental vacancy rate is the proportion of the rental
  inventory that is vacant for rent." No metro or county figure: the Census
  API now requires a key and the HVS metro table covers the 75 largest metros
  only (Myrtle Beach is not one). HUD's Comprehensive Housing Market Analysis
  for Myrtle Beach exists only in a 2016 edition
  (https://www.huduser.gov/portal/publications/pdf/MyrtleBeachSC-comp-16.pdf,
  not opened).

---

## 5. Local cap-rate range, with the math

Every input below is labelled. Full output: `data/returns-tables.md`; script:
`data/compute-returns.js`; per-submarket JSON: `data/submarkets.json`.

Assumptions (A1 to A8):
- A1 Price: Zillow ZIP ZHVI, July 2026 (section 2a), for the ZIP mapped to
  the submarket. It is the typical mid-tier home including condos, not a
  three-bedroom-house median. Myrtle Beach uses 29577 (city core; 29572 and
  29588 are higher, 29579 is Carolina Forest). Garden City and Murrells Inlet
  share 29576.
- A2 Gross rent, two cases: (i) FY2027 three-bedroom fair market rent,
  $1,823 in Horry County and $1,380 in Georgetown County (section 1c); (ii)
  the ZIP ZORI for July 2026 (section 2a), which is a typical asking rent
  across all home types, not a three-bedroom figure.
- A3 Vacancy and maintenance: 25 percent of gross in the base case (the 75
  percent lender factor, section 4d); 10 percent in the lean case (about the
  state rental vacancy rate alone, section 4d).
- A4 Management: 10 percent of gross in the base case (site: "National
  companies publish 10 and 15 percent plans"; "8 to 10 percent of collected
  rent plus a leasing fee"); 0 in the lean case (self-managed).
- A5 Property tax: price x 6% x mills / 1000 with the site calculator's 2025
  certified millage by district (section 1c). Pawleys Island: Georgetown
  County District 4 at 233.9 mills plus $96 of storm water and household fees
  (5b). The $89 Horry unincorporated stormwater fee is excluded, as on the
  site calculator.
- A6 Insurance: landlord policy $3,050 in the base case (midpoint of the
  site's $1,700 to $4,400), $1,700 in the lean case. No flood or separate
  wind policy; both are address-specific.
- A7 Association dues: $0 (a detached house outside an HOA). Any dues come
  straight off NOI; $75 a month would cut every base-case cap below by about
  0.25 points at these prices.
- A8 Cap rate = NOI / price. No loan, no closing costs, no rent growth.

### 5a. Long-term rental, three-bedroom house (base = A3 25%, A4 10%, A6 $3,050; lean = 10%, 0%, $1,700)

| Submarket | ZIP | ZHVI Jul 2026 | Rent used | Gross/yr | Vac+maint | Mgmt | Tax (6%) | Insurance | NOI base | Cap base | NOI lean | Cap lean |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Little River | 29566 | $323,004 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $3,895 | $3,050 | $7,274 | 2.25% | $14,093 | 4.36% |
| Little River | 29566 | $323,004 | ZIP ZORI Jul 2026 $1,502 | $18,022 | $4,505 | $1,802 | $3,895 | $3,050 | $4,769 | 1.48% | $10,624 | 3.29% |
| North Myrtle Beach | 29582 | $400,143 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $5,191 | $3,050 | $5,979 | 1.49% | $12,798 | 3.20% |
| North Myrtle Beach | 29582 | $400,143 | ZIP ZORI Jul 2026 $1,627 | $19,526 | $4,882 | $1,953 | $5,191 | $3,050 | $4,451 | 1.11% | $10,683 | 2.67% |
| Myrtle Beach | 29577 | $279,713 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,273 | $3,050 | $6,897 | 2.47% | $13,716 | 4.90% |
| Myrtle Beach | 29577 | $279,713 | ZIP ZORI Jul 2026 $1,680 | $20,159 | $5,040 | $2,016 | $4,273 | $3,050 | $5,781 | 2.07% | $12,171 | 4.35% |
| Carolina Forest | 29579 | $359,496 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,336 | $3,050 | $6,834 | 1.90% | $13,653 | 3.80% |
| Carolina Forest | 29579 | $359,496 | ZIP ZORI Jul 2026 $1,736 | $20,827 | $5,207 | $2,083 | $4,336 | $3,050 | $6,152 | 1.71% | $12,709 | 3.54% |
| Surfside Beach | 29575 | $360,243 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,630 | $3,050 | $6,540 | 1.82% | $13,359 | 3.71% |
| Surfside Beach | 29575 | $360,243 | ZIP ZORI Jul 2026 $1,607 | $19,278 | $4,820 | $1,928 | $4,630 | $3,050 | $4,851 | 1.35% | $11,020 | 3.06% |
| Garden City | 29576 | $401,110 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,989 | $3,050 | $6,180 | 1.54% | $12,999 | 3.24% |
| Garden City | 29576 | $401,110 | ZIP ZORI Jul 2026 $1,943 | $23,314 | $5,828 | $2,331 | $4,989 | $3,050 | $7,115 | 1.77% | $14,293 | 3.56% |
| Murrells Inlet | 29576 | $401,110 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,989 | $3,050 | $6,180 | 1.54% | $12,999 | 3.24% |
| Murrells Inlet | 29576 | $401,110 | ZIP ZORI Jul 2026 $1,943 | $23,314 | $5,828 | $2,331 | $4,989 | $3,050 | $7,115 | 1.77% | $14,293 | 3.56% |
| Pawleys Island | 29585 | $550,277 | FMR 3BR FY2027 $1,380 | $16,560 | $4,140 | $1,656 | $7,819 | $3,050 | -$105 | -0.02% | $5,385 | 0.98% |
| Pawleys Island | 29585 | $550,277 | ZIP ZORI Jul 2026 $1,926 | $23,112 | $5,778 | $2,311 | $7,819 | $3,050 | $4,154 | 0.75% | $11,282 | 2.05% |
| Conway | 29526 | $302,222 | FMR 3BR FY2027 $1,823 | $21,876 | $5,469 | $2,188 | $4,883 | $3,050 | $6,286 | 2.08% | $13,105 | 4.34% |
| Conway | 29526 | $302,222 | ZIP ZORI Jul 2026 $1,892 | $22,705 | $5,676 | $2,271 | $4,883 | $3,050 | $6,825 | 2.26% | $13,851 | 4.58% |

Worked example, Myrtle Beach 29577, FMR case, base: gross 1,823 x 12 =
21,876; vacancy and maintenance 25% = 5,469; management 10% = 2,188; tax
279,713 x 0.06 x 254.6 / 1000 = 4,273; insurance 3,050; NOI = 21,876 - 5,469
- 2,188 - 4,273 - 3,050 = 6,897; cap = 6,897 / 279,713 = 2.47%.

Reading: the base case lands between 1.1 and 2.5 percent everywhere in Horry
County and near zero on Pawleys Island; the lean case between 2.7 and 4.9
percent. Even the lean case never reaches the site's "5 to 7 percent" claim or
the national 7.3 percent. The 6 percent tax line alone is 1.2 to 1.6 points
of cap rate in Horry County (tax / price = 0.06 x mills / 1000). The cheapest
ZIPs by price (29577, 29526, 29566) carry the highest caps.

### 5b. Pawleys Island tax inputs (Georgetown County)

- Georgetown County Property Tax Calculator, https://gtcountysc.gov/385/Property-Tax-Calculator,
  opened with curl 2026-09-08. Its script computes `marketValue x ratio x
  millage` plus fees, with, for the 6 percent (non-residence) branch: District
  1, 2, 3 (West of Waccamaw River) .2533; District 4 (East of Waccamaw
  River/Pawleys Island) .2339; District 42 (East of Waccamaw River/Pawleys
  Island) .2339; District 41 (Murrells Inlet/Garden City) .2488; District 5
  (City of Georgetown) .3472; District 6 (Town of Andrews) .3587. Fees: storm
  water 52 plus household 44 = $96 in Districts 1 to 4 and 41; $44 in 5, 6
  and 42. Disclaimer: "This Tax Estimate is calculated using the CURRENT
  MILLAGE with a Fair Market Estimated Value that you have provided." No tax
  year is printed: NOT VERIFIED which year .2339 belongs to.
- Georgetown County Tax Information, https://www.gtcountysc.gov/434/Tax-Information,
  read 2026-09-08, worked example for District 4: "30000 (Appraised Value) X
  .06 (Assessment Ratio) = 1800 (Assessed Value) 1800 (Assessed Value) X
  .2335 (Mill rate is 233.5) = $420.30". Undated; 233.5 versus the
  calculator's 233.9.
- Pawleys Island at $550,277: 550,277 x 0.06 x 233.9 / 1000 = $7,723 plus $96
  = $7,819 a year at 6 percent. Georgetown's 4 percent branch for District 4
  is .1139, so the same house as a legal residence would be 550,277 x 0.04 x
  113.9 / 1000 = $2,507 plus $96: the rental pays about 3.1 times the
  residence bill there, in line with the site's "about three times" for the
  unincorporated county.

### 5c. Coverage ratio without a rate: payment ceilings

Because the page may not print a rate or a payment (non-negotiable 3), the
useful form is the largest monthly payment the rent supports at each ratio.
Lender definition: gross monthly rent / PITIA. NOI definition: base-case NOI
/ 12 / 1.20.

| Submarket | Rent used | Max PITIA/mo at 1.00 | at 1.10 | at 1.25 | NOI base /mo | Max debt service/mo at NOI-based 1.20 |
|---|---|---|---|---|---|---|
| Little River | FMR $1,823 | $1,823 | $1,657 | $1,458 | $606 | $505 |
| Little River | ZORI $1,502 | $1,502 | $1,365 | $1,201 | $397 | $331 |
| North Myrtle Beach | FMR $1,823 | $1,823 | $1,657 | $1,458 | $498 | $415 |
| North Myrtle Beach | ZORI $1,627 | $1,627 | $1,479 | $1,302 | $371 | $309 |
| Myrtle Beach | FMR $1,823 | $1,823 | $1,657 | $1,458 | $575 | $479 |
| Myrtle Beach | ZORI $1,680 | $1,680 | $1,527 | $1,344 | $482 | $401 |
| Carolina Forest | FMR $1,823 | $1,823 | $1,657 | $1,458 | $569 | $475 |
| Carolina Forest | ZORI $1,736 | $1,736 | $1,578 | $1,388 | $513 | $427 |
| Surfside Beach | FMR $1,823 | $1,823 | $1,657 | $1,458 | $545 | $454 |
| Surfside Beach | ZORI $1,607 | $1,607 | $1,460 | $1,285 | $404 | $337 |
| Garden City | FMR $1,823 | $1,823 | $1,657 | $1,458 | $515 | $429 |
| Garden City | ZORI $1,943 | $1,943 | $1,766 | $1,554 | $593 | $494 |
| Murrells Inlet | FMR $1,823 | $1,823 | $1,657 | $1,458 | $515 | $429 |
| Murrells Inlet | ZORI $1,943 | $1,943 | $1,766 | $1,554 | $593 | $494 |
| Pawleys Island | FMR $1,380 | $1,380 | $1,255 | $1,104 | -$9 | -$7 |
| Pawleys Island | ZORI $1,926 | $1,926 | $1,751 | $1,541 | $346 | $288 |
| Conway | FMR $1,823 | $1,823 | $1,657 | $1,458 | $524 | $437 |
| Conway | ZORI $1,892 | $1,892 | $1,720 | $1,514 | $569 | $474 |

Note the gap between the two definitions: on the lender's definition the
whole PITIA (taxes and insurance included) must fit under $1,458 to $1,554 a
month at 1.25; on the NOI definition only $300 to $500 a month of principal
and interest fits at 1.20. The page should show the lender definition,
because that is what decides the loan, and state that taxes and insurance sit
inside the payment.

### 5d. Short-term rental, using the submarket pages' AirROI figures

Inputs: AirROI average annual revenue per active listing and the median
listing's monthly gross x 12 (section 1a, data through 2026-08-08); price =
ZIP ZHVI as in A1; expenses as the site's two published all-in ratios, 45
percent (str-vs-ltr low end) and 65 percent (airbnb-income high end) of gross
before debt service. Those ratios are meant to include management, cleaning,
utilities, platform fees, the 6 percent tax and insurance; they are the site's
figures, not vendor data. AirROI revenue is treated as gross booking revenue
(1b, NOT VERIFIED). Occupancy is the AirROI annual figure, not the
illustrative curve.

| Submarket | ZHVI Jul 2026 | AirROI avg revenue | NOI at 45% exp | Cap | NOI at 65% exp | Cap | Median listing x12 | Cap at 45% / 65% |
|---|---|---|---|---|---|---|---|---|
| Little River | $323,004 | $12,243 | $6,734 | 2.08% | $4,285 | 1.33% | $18,060 | 3.08% / 1.96% |
| North Myrtle Beach | $400,143 | $28,667 | $15,767 | 3.94% | $10,033 | 2.51% | $32,748 | 4.50% / 2.86% |
| Myrtle Beach | $279,713 | $20,946 | $11,520 | 4.12% | $7,331 | 2.62% | $25,380 | 4.99% / 3.18% |
| Carolina Forest | $359,496 | no AirROI market (404) | | | | | | |
| Surfside Beach | $360,243 | $35,482 | $19,515 | 5.42% | $12,419 | 3.45% | $38,652 | 5.90% / 3.76% |
| Garden City | $401,110 | $33,942 | $18,668 | 4.65% | $11,880 | 2.96% | $34,992 | 4.80% / 3.05% |
| Murrells Inlet | $401,110 | $38,356 | $21,096 | 5.26% | $13,425 | 3.35% | $36,564 | 5.01% / 3.19% |
| Pawleys Island | $550,277 | $27,953 | $15,374 | 2.79% | $9,784 | 1.78% | $30,336 | 3.03% / 1.93% |
| Conway | $302,222 | $21,285 | $11,707 | 3.87% | $7,450 | 2.46% | $21,696 | 3.95% / 2.51% |

Caveat that belongs on the page: the AirROI averages are per listing across
every unit type, mostly condos in Myrtle Beach and North Myrtle Beach, while
the price is a mid-tier home value, so this table compares a market's typical
listing revenue with a market's typical home price, not one house with its
own revenue. It shows the ordering (Surfside, Murrells Inlet, Garden City
above; Little River, Pawleys below) and the range (about 1.3 to 5.4 percent),
not a quote. Revenue fell year over year in five of eight markets (1b).

### 5e. Dealbreaker thresholds the data supports (owner: "you decide when its a deal breaker using stats")

Proposals, each traceable to a number above; the page builder labels them as
Chapter3's screening rules, not industry standards.
1. Coverage below 1.00 on gross rent / PITIA. The rent does not pay the
   loan; lenders that fund it charge for it (Newfi to 0.75, Griffin "funded
   with reserves", BrickWood to 0.75 per the site). Standard pricing sits at
   1.10 to 1.25 (LendingOne, NASB, Kiavi). Table 5c gives the payment ceiling
   per submarket.
2. Base-case NOI at or below zero. Pawleys Island at the county fair market
   rent is the live example (-$105). A house that loses money before the loan
   only works as an appreciation bet.
3. Base-case cap below 2 percent when the three-year metro price change is
   negative (-1.67 percent, section 3). At that point nearly the entire return
   is appreciation that the last three years did not deliver. That flags
   North Myrtle Beach, Surfside, Garden City, Murrells Inlet and Pawleys at
   the FMR rent, and Carolina Forest at 1.90.
4. Short-term rental that does not beat the same house long-term. Little
   River is the example: STR average revenue $12,243 nets $4,285 to $6,734
   against $7,274 long-term base NOI.
5. A short-term projection built on the illustrative summer curve. AirROI's
   measured June occupancy is 41.5 to 48.9 percent across the eight markets;
   the page curves show 52 to 91 percent. Any pro forma above about 50
   percent in June is above the market's best month.

---

## 6. `data/submarkets.json`

One object per submarket (nine), plus `meta` with the assumptions and the
metro ZHVI rows. Keys: `slug`, `name`, `zip`, `ltr_rent_zip` (ZIP ZORI July
2026), `ltr_rent_zip_yoy_pct`, `ltr_rent_zip_prior`, `ltr_rent_date`
(2026-07-31), `ltr_rent_city`, `ltr_rent_city_yoy_pct`,
`ltr_rent_fmr_3br_fy2027` (1823 Horry, 1380 Georgetown), `ltr_rent_fmr_area`,
`zhvi`, `zhvi_yoy`, `zhvi_prior_year`, `zhvi_date`, `zhvi_3y`, `zhvi_5y`,
`zhvi_10y`, `zhvi_city`, `zhvi_city_yoy`, `median_price` (= ZIP ZHVI, with
`median_price_basis`), `page_stated_medians` and its cited source,
`str_occupancy` (the 12 illustrative page values, null for Carolina Forest,
with `str_occupancy_note` saying they are unsourced and printed twice),
`str_annual_occupancy_airroi_pct`, `str_peak_low_month_occupancy_airroi`,
`str_adr_airroi`, `str_avg_annual_revenue_airroi`,
`str_monthly_revenue_median`, `str_monthly_revenue_top10`,
`str_revenue_yoy_pct`, `str_active_listings`, `str_data_through`,
`property_tax_mills_6pct`, `property_tax_mills_source`,
`property_tax_extra_fees`, `ltr_math` (base and lean rows for both rent
cases), `str_math`, and `sources` (URLs). Regenerate with
`node data/extract-zillow.js` then `node data/compute-returns.js`.

Deviation from the brief: `str_occupancy` holds 12 values, not 24. No page
carries 24 months; each page prints one 12-month illustrative series twice.
The JSON says so rather than padding.

---

## Could not verify

- Zillow's research data listing page and its ZORI/ZHVI methodology text (403
  to curl and WebFetch). File URLs confirmed only by successful download.
- ZORI year-over-year for ZIP 29585 and city Pawleys Island (only the latest
  month exists in the file); any ZORI row for ZIP 29527; any city-level row
  for Garden City, Carolina Forest, Socastee or Litchfield Beach.
- The 12-month occupancy curves on the nine submarket pages. Unsourced,
  labelled illustrative, and contradicted by AirROI's June and January
  occupancy.
- The price medians attributed on the submarket pages to Redfin, SC Realtors
  and Zillow for early and mid 2026: not re-opened here; superseded by the
  Zillow file values in section 2.
- Whether AirROI revenue is net of platform fees, cleaning fees and
  accommodations taxes.
- Which tax year the Georgetown County calculator's .2339 (District 4)
  millage belongs to, and the discrepancy with the 233.5 example on the
  county's Tax Information page. The county's millage PDF archive pages
  render no titles.
- A county- or metro-level rental vacancy rate (Census API now needs a key;
  HVS covers 75 metros; HUD's Myrtle Beach CHMA is 2016). State and national
  figures used instead.
- A residential cap-rate number from CBRE (none in the accessible H1 2026
  text; the H2 2025 PDF is 403), the numeric Q1 2026 SFR cap rate in Arbor's
  Q2 and Q3 2026 reports (inside the PDF), ATTOM's Horry County gross yield,
  Invitation Homes' acquisition cap rates (403), AMH's "4% area" disposition
  cap rates (transcript not opened).
- Any published cash-on-cash convention with a primary source. None found.
- Visio Lending and Kiavi product-page guidelines (403); Lima One (URL not
  found); BrickWood's written DSCR guideline.
- The site's short-term insurance multiple ("two to three times a standard
  homeowner policy") and both STR expense ratios (45 to 60 and 55 to 65
  percent): site figures, no source on their pages.
- HOA dues for a three-bedroom house in any submarket: assumption $0, no
  source.
- The current 10-year Treasury yield behind Arbor's 317 bps spread: not
  opened; do not print a derived yield on the page.
