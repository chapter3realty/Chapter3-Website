#!/bin/sh
# Google search suggestions for the page's topic. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "duplex for sale myrtle beach" "duplex myrtle beach" "fourplex for sale myrtle beach" "triplex for sale myrtle beach" "multi family homes for sale myrtle beach" "multifamily myrtle beach" "duplex north myrtle beach" "duplex surfside beach sc" "duplex conway sc" "duplex for sale cherry grove" "how to buy a duplex" "buying a duplex" "is a duplex a good investment" "fha duplex" "fha loan duplex" "fha 4 unit" "fha self sufficiency test" "house hacking" "house hacking duplex" "va loan duplex" "conventional loan duplex 5 down" "duplex rent" "duplex vs single family" "duplex insurance" "duplex property tax sc" "can i airbnb my duplex" "duplex vs condo investment" "how much does a duplex cost" "duplex down payment" "fourplex investment" "small multifamily investing" "duplex for sale horry county"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
