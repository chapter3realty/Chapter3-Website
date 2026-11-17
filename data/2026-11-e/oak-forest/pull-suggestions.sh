#!/bin/sh
# Google search suggestions (Firefox client) for Oak Forest seeds. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "oak forest" "oak forest myrtle beach" "oak forest myrtle beach sc" "oak forest homes for sale" "oak forest homes for sale myrtle beach" "oak forest hoa" "oak forest myrtle beach hoa" "oak forest myrtle beach flood" "oak forest myrtle beach a" "oak forest myrtle beach s" "oak forest sc" "oak forest 29577" "oak forest temperance drive" "oak forest subdivision myrtle beach" "oak forest myrtle beach reviews" "oak forest myrtle beach rentals" "oak forest burgess" "oak forest socastee" "homes for sale temperance dr myrtle beach"; do
  printf '== %s\n' "$q"
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")"; echo
done
