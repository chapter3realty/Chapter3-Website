#!/bin/sh
# Google search suggestions for dated market-report searches (the July 2026 report, June 2026 data).
# Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "myrtle beach housing market june" "myrtle beach housing market july" "myrtle beach real estate market june 2026" "myrtle beach housing market summer 2026" "myrtle beach market update july" "myrtle beach condo market 2026" "myrtle beach condo prices 2026" "myrtle beach condo market crash" "myrtle beach home sales" "myrtle beach home sales 2026" "myrtle beach housing inventory 2026" "myrtle beach building permits" "horry county building permits" "myrtle beach overbuilt" "is myrtle beach overbuilt" "myrtle beach real estate market mid 2026" "grand strand housing market"; do
  printf '== %s\n' "$q"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
