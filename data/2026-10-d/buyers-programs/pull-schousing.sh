#!/bin/sh
# Pulls SC Housing homebuyer program pages into raw/. Run: sh pull-schousing.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
B=https://www.schousing.sc.gov
for p in homebuyers homebuyers/programs-homebuyers/sc-housing-homebuyer-program homebuyers/programs-homebuyers/housing-choice-voucher-homeownership-program homebuyers/programs-homebuyers/county-first-initiative homebuyers/programs-homebuyers/families-disabilities-homebuyer-program homebuyers/programs-homebuyers/palmetto-home-advantage homebuyers/made-it-home homebuyers/find-lender; do
  f="$OUT/schousing-$(echo $p | tr '/' '_').html"
  curl -sS -L -A "Mozilla/5.0" -o "$f" "$B/$p"; echo "$p $(wc -c < "$f")"
done
# PDFs: limits sheet, program handouts
for u in "https://schousing.sc.gov/sites/schousing/files/Documents/Homebuyers/2026-2027%20(LENDER)SC%20Housing%20Homebuyer%20Home%20Price%20and%20Income%20Limits%20(06.01.2026).pdf" "https://schousing.sc.gov/sites/schousing/files/Documents/Homebuyers/Marketing%20Fliers/HomeownershipProgramHandout(10.01.2025).pdf" ; do
  f="$OUT/$(basename "$u" | sed 's/%20/_/g;s/[()]//g')"; curl -sS -L -A "Mozilla/5.0" -o "$f" "$u"; echo "$f $(wc -c < "$f")"
done
for u in "https://schousing.sc.gov/sites/schousing/files/Documents/Homebuyers/Training-Material/COMBINED%20TRAINING%2003.2026.pdf"; do
  f="$OUT/$(basename "$u" | sed 's/%20/_/g;s/[()]//g')"; curl -sS -L -A "Mozilla/5.0" -o "$f" "$u"; echo "$f $(wc -c < "$f")"
done
for p in news/sc-housings-palmetto-heroes-program-closes-26-registering-272-home-loans news/sc-housing-launch-2026-palmetto-heroes-program-10000-down-payment-assistance-public-servants homebuyers/programs-homebuyers; do
  f="$OUT/schousing-$(echo $p | tr '/' '_' | cut -c1-80).html"; curl -sS -L -A "Mozilla/5.0" -o "$f" "https://www.schousing.sc.gov/$p"; echo "$p $(wc -c < "$f")"
done
curl -sS -L -A "Mozilla/5.0" "https://www.schousing.sc.gov/homebuyers/find-lender?county=166" -o "$OUT/schousing-find-lender-horry.html"  # Horry = 166
# The training PDF (7 MB) is not kept here; its text is raw/COMBINED_TRAINING_03.2026.txt (pdftotext -layout). PHAHandout and SF-095 URLs returned 404 on 2026-11-01.
