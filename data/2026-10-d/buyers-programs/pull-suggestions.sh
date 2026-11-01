#!/bin/sh
# Google search suggestions for the page's topic. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "sc housing down payment assistance" "down payment assistance myrtle beach" "down payment assistance horry county" "first time home buyer programs sc" "sc housing income limits" "south carolina down payment assistance" "sc housing" "palmetto home advantage" "first time home buyer myrtle beach" "sc housing dpa " "sc housing homebuyer program " "does sc housing" "sc housing forgivable" "horry county first time home buyer" "myrtle beach housing assistance" "sc first time home buyer requirements" "sc housing credit score" "palmetto heroes 2027"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
