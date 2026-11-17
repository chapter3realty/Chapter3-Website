#!/bin/sh
# Google search suggestions (Firefox client) for Briarcliffe Acres seeds. Run: sh pull-suggestions.sh > raw/google-suggestions.txt
for q in "briarcliffe acres" "briarcliffe acres sc" "briarcliffe acres myrtle beach" "briarcliffe acres homes for sale" "briarcliffe acres hoa" "briarcliffe acres beach" "briarcliffe acres beach access" "briarcliffe acres short term rental" "briarcliffe acres town hall" "briarcliffe acres golf cart" "briarcliffe acres taxes" "briarcliffe acres zip code" "briarcliffe acres population" "briarcliffe acres police" "briarcliffe acres flood" "briarcliffe acres real estate" "is briarcliffe acres in north myrtle beach" "briarcliffe acres vs" "briarcliffe acres a" "briarcliffe acres c" "briarcliffe acres l" "briarcliffe acres r" "briarcliffe acres w" "briarcliffe west" "briarcliffe acres lake"; do
  printf '== %s\n' "$q"
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")"; echo
done
