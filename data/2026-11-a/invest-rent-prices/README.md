# Data for /invest/rent-prices/ (batch 2026-11-a)

Every number on the page comes from `findings.json`, which `build_findings.py` builds from the files below. Ledger: Blog-Brain `batches/2026-11-a/invest-rent-prices/facts.md`. No listing, address, owner or lease of any one home is kept.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number and chart row | build_findings.py |
| acs.json | Census ACS 2020-2024 5-year: B25031 rent by bedrooms, B25064 median gross rent, B25058 median contract rent, B25003 tenure, B25032 tenure by units in structure, B25063, B25070, B25004; Grand Strand ZCTAs, 4 cities, 8 census-designated places, Horry County, metro, SC, US. Also 1-year B25064 and B25031 for Horry and the metro, 2012-2024 | pull_acs.py (data.census.gov access endpoint; responses in raw/acs/) |
| pums-2024-5yr.json | Census ACS PUMS 2020-2024 5-year, SC housing file, PUMAs 02701 and 02702: lease rent (RNTP) and gross rent (GRNTP) by kind of home, bedrooms and when the renter moved in, 2024 dollars, replicate-weight margins | analyze_pums.py (input psam_h45.csv from csv_hsc.zip, kept outside the repo, 72 MB) |
| zillow.json | Zillow research data: ZORI (all homes, houses, apartments; smoothed, and smoothed and seasonally adjusted) and ZHVI mid-tier, Myrtle Beach metro; ZORI all homes by Horry and Georgetown ZIP | build_zillow.py (raw/zillow/: the header, the metro row and the Horry and Georgetown ZIP rows of each CSV from files.zillowstatic.com/research/public_csvs/zori/ and /zhvi/; full files kept outside the repo) |
| fmr-history.json | HUD fair market rents for Horry County, FY1983-FY2027 | build_fmr.py (raw/hud/FMR_All_1983_2027-horry.csv: the header and Horry County row of https://www.huduser.gov/portal/datasets/FMR/FMR_All_1983_2027.csv) |
| raw/popest/co-est2025-alldata-sc.csv | Census Vintage 2025 county population estimates, SC rows of https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/counties/totals/co-est2025-alldata.csv | download |
| raw/law/ | SC Code chapters 27-39 and 27-40, text copies | curl scstatehouse.gov |
| raw/hud/fmr.txt | HUD FMR page text (40th percentile definition) | curl huduser.gov |
| raw/PUMS_Data_Dictionary_2024.txt | Census PUMS data dictionary | copy of the cost-to-own download |
| raw/google-suggestions.txt | Google search suggestions, 40 queries | pull-suggestions.sh |

To rerun: `python3 -I pull_acs.py .` (about 10 minutes; reuses raw/acs/), `python3 -I analyze_pums.py <psam_h45.csv> pums-2024-5yr.json`, `python3 -I build_zillow.py .`, `python3 -I build_fmr.py .`, then `python3 -I build_findings.py .`.
