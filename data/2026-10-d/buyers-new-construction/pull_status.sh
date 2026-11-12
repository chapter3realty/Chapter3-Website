#!/bin/sh
# Counts of new-construction houses for sale by build status (CRM filters quick_move_in = "New, never occupied", still_being_built). Usage: sh pull_status.sh <this dir>
OUT="$1/raw/listings-status-totals.txt"; date -u +%Y-%m-%dT%H:%MZ > "$OUT"
for q in "type=house&has=new_construction" "type=house&has=new_construction,quick_move_in" "type=house&has=new_construction,still_being_built" "type=house&has=new_construction&not=quick_move_in,still_being_built"; do
  echo "$q $(curl -sS -m 30 "https://chapter3realty.com/homes/api/map?$q" | python3 -c 'import json,sys;print(json.load(sys.stdin)["total"])')" >> "$OUT"
done
