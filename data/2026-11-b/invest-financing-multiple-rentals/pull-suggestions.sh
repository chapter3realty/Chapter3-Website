#!/bin/sh
# Google search suggestions, 2026-11-10, for the rebuilt question. Run: sh pull-suggestions.sh > raw/google-suggestions-2026-11-10.txt
for q in "how to finance a second rental property" "how do you finance a second rental" "financing a second rental property" "financing a second investment property" "how to buy a second rental property with equity" "using equity to buy second rental property" "heloc on rental property" "heloc on investment property" "heloc on primary residence to buy rental property" "cash out refinance investment property" "cash out refinance rental property to buy another" "how many rental properties can you finance" "fannie mae reserves multiple financed properties" "reserves for second investment property" "second rental property myrtle beach" "buying a second rental property in south carolina" "can i buy a second rental property" "should i pay off my first rental or buy another"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
