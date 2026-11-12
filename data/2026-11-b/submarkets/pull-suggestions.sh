#!/bin/sh
# Google search suggestions for the /submarkets/ hub. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "grand strand towns" "grand strand towns list" "towns on the grand strand" "towns near myrtle beach" "myrtle beach area towns" "grand strand area guide" "myrtle beach area guide" "grand strand real estate" "grand strand home prices" "myrtle beach area home prices by town" "grand strand short term rental rules" "where can you airbnb in myrtle beach" "airbnb rules myrtle beach area" "which grand strand towns allow short term rentals" "grand strand beaches list" "south of myrtle beach towns" "north of myrtle beach towns" "myrtle beach submarkets" "grand strand neighborhoods" "best beach town grand strand" "grand strand towns to live" "cheapest beach town grand strand"; do
  printf '== %s\n' "$q"
  curl -sS -m 20 -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
