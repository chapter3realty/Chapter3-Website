#!/bin/sh
# Google suggestions (Firefox client) for Riverwalk seeds. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "riverwalk condos" "riverwalk condos myrtle beach" "riverwalk myrtle beach" "riverwalk at arrowhead" "riverwalk myrtle beach sc" "riverwalk condos for sale" "riverwalk condos myrtle beach for sale" "riverwalk condos hoa" "riverwalk condos hoa fees" "riverwalk condos myrtle beach hoa" "riverwalk townhomes myrtle beach" "riverwalk myrtle beach rentals" "riverwalk condos myrtle beach rentals" "riverwalk condos for rent myrtle beach" "riverwalk condos flood" "riverwalk myrtle beach flood zone" "riverwalk condos myrtle beach airbnb" "riverwalk myrtle beach pool" "riverwalk condos arrowhead" "arrowhead country club myrtle beach" "arrowhead country club condos" "riverwalk condos a" "riverwalk condos c" "riverwalk condos m" "riverwalk condos s" "riverwalk condos w" "riverwalk apartments myrtle beach"; do
  printf '== %s\n' "$q"
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")"; echo
done
