#!/bin/sh
# HOA fee of new-construction houses for sale, counted in aggregate (fixer, review round 1). The CRM map API's hoa=0 is
# "no HOA fee" and hoaMax=N is "HOA fee up to N dollars a month" (idx-lib/filters.js labels it "Up to $N a month"; hoaMax
# includes the houses with no fee). Whole MLS feed, not cut to Horry County. Usage: sh pull_hoa.sh <this dir>
OUT="$1/raw/listings-hoa-totals.txt"; date -u +%Y-%m-%dT%H:%MZ > "$OUT"
for q in "type=house&has=new_construction" "type=house&has=new_construction&hoa=0" "type=house&has=new_construction&hoaMax=50" "type=house&has=new_construction&hoaMax=100" "type=house&has=new_construction&hoaMax=150" "type=house&has=new_construction&hoaMax=200" "type=house&has=new_construction&hoaMax=300"; do
  echo "$q $(curl -sS -m 30 "https://chapter3realty.com/homes/api/map?$q" | python3 -c 'import json,sys;print(json.load(sys.stdin)["total"])')" >> "$OUT"
done
cat "$OUT"
