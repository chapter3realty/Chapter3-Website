#!/bin/sh
# Round 2 (2026-11-12): Google search suggestions for how the Grand Strand towns differ.
# Run from this folder: sh pull-suggestions-2.sh > raw/google-suggestions-2.txt
for q in "difference between grand strand towns" "grand strand towns differences" "myrtle beach vs north myrtle beach" "myrtle beach vs surfside beach" "garden city vs surfside beach" "murrells inlet vs pawleys island" "is garden city a town" "is murrells inlet a town" "is little river sc a town" "is carolina forest a city" "is north myrtle beach part of myrtle beach" "how long is the grand strand" "how many towns are on the grand strand" "grand strand population" "population of myrtle beach area towns" "quietest town on the grand strand" "myrtle beach in winter" "north myrtle beach in the winter" "pawleys island population" "grand strand map" "grand strand towns from north to south" "what towns are on the grand strand" "which grand strand town is best" "living on the grand strand year round"; do
  printf '== %s\n' "$q"
  curl -sS -m 20 "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$(python3 -I -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")"; echo
done
