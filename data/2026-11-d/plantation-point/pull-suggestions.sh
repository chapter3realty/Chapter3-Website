#!/bin/sh
# Google search suggestions (Firefox client) for Plantation Point seeds. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "plantation point" "plantation point myrtle beach" "plantation point myrtle beach sc" "plantation point hoa" "plantation point homes for sale" "plantation point myrtle beach homes for sale" "plantation point mb" "plantation point golf" "where is plantation point" "plantation point sc" "plantation point myrtle beach a" "plantation point myrtle beach f" "plantation point myrtle beach h" "plantation point myrtle beach l" "plantation point myrtle beach r" "plantation point myrtle beach w" "plantation point brookgreen" "landing at plantation point" "the landing myrtle beach" "plantation point myrtle beach flood" "plantation point myrtle beach rentals" "plantation point myrtle beach lots" "myrtlewood golf course homes"; do
  printf '== %s\n' "$q"
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")"; echo
done
