#!/bin/sh
# Google search suggestions for the market reports hub. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "myrtle beach market report" "myrtle beach real estate market report" "myrtle beach housing market" "myrtle beach housing market 2026" "myrtle beach real estate market" "myrtle beach median home price" "myrtle beach condo market" "myrtle beach home prices" "myrtle beach home prices 2026" "horry county housing market" "horry county real estate market" "grand strand real estate market" "myrtle beach days on market" "myrtle beach months of supply" "myrtle beach housing inventory" "ccar market report" "myrtle beach condo prices" "north myrtle beach housing market" "is myrtle beach housing market crashing" "myrtle beach real estate market forecast"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
