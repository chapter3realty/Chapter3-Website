#!/bin/sh
# Google search suggestions for /invest/condotel-financing/. Run: sh pull-suggestions.sh > raw/google-suggestions-<date>.txt
for q in "condotel financing" "condotel loans" "condotel" "condotel myrtle beach" "myrtle beach condotel" "condo hotel financing" "condotel mortgage" "condotel loan requirements" "condotel down payment" "condotel lenders" "can you get a mortgage on a condotel" "can you finance a condotel" "condotel fha" "condotel va loan" "condotel vs condo" "condotel vs timeshare" "is a condotel a good investment" "condotel dscr" "condotel loan rates" "what is a condotel" "condotel meaning" "myrtle beach condo hotel" "myrtle beach condo financing" "myrtle beach oceanfront condo financing" "myrtle beach condo loan" "can you get a mortgage on a myrtle beach condo" "fannie mae condotel" "condotel second home" "condotel pros and cons" "condo hotel mortgage" "condotel lenders south carolina" "condotel financing south carolina" "how to finance a condotel" "why are condotels hard to finance" "condotel rental program"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
  sleep 0.4
done
