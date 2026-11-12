#!/bin/sh
# Saves the primary-source pages the ledger quotes. Run: sh pull-sources.sh <this dir>/raw
OUT="$1"; UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
get() { curl -sS -L -A "$UA" -o "$OUT/$1" "$2" -w "$1 %{http_code} %{size_download}\n"; }
get irs-early-distributions.html "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions"
get irs-p590b.html "https://www.irs.gov/publications/p590b"
get va-purchase-loans.html "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/"
get hud-4000-1-update18.pdf "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf"
get hud-4000-1-update18-glossary.pdf "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18-Glossary.pdf"
get sc-12-43.html "https://www.scstatehouse.gov/code/t12c043.php"
get sc-12-37.html "https://www.scstatehouse.gov/code/t12c037.php"
get sc-40-57.html "https://www.scstatehouse.gov/code/t40c057.php"
get horry-assessor.html "https://www.horrycountysc.gov/departments/assessor/"
get floodsmart-buy.html "https://www.floodsmart.gov/get-insured/buy-a-policy"
for t in B25119 B25064 B25003 B25077; do
  get "acs1-2024-$t.json" "https://data.census.gov/api/access/data/table?id=ACSDT1Y2024.$t&g=050XX00US45051"
done
get usc-42-4012a.html "https://www.law.cornell.edu/uscode/text/42/4012a"
get horry-real-property-tax.html "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/"
get horry-tax-levy-2026.pdf "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf"
# HUD FHA and Fannie/Freddie loan limits, CY2026, Horry County (the form needs a session cookie and a referer)
CJ="$OUT/.hud-cookies"; curl -sS -A "$UA" -c "$CJ" -b "$CJ" -o /dev/null "https://entp.hud.gov/idapp/html/hicostlook.cfm"
for t in FHA FF; do
  curl -sS -A "$UA" -c "$CJ" -b "$CJ" -e "https://entp.hud.gov/idapp/html/hicostlook.cfm" -o "$OUT/hud-limits-$t.html" "https://entp.hud.gov/idapp/html/hicost1.cfm" \
    --data "sorted=county_name&state=SC&county_name=HORRY&county=&msa_name=&msa_code=&limit_type=$t&limit_year=CY2026&last_upd_m=&last_upd_d=&last_upd_y=&in_fha=No" -w "hud-limits-$t %{http_code}\n"
done; rm -f "$CJ"
# Text copies used for quoting: pdftotext -layout for the PDFs; HTML pages read as text.
