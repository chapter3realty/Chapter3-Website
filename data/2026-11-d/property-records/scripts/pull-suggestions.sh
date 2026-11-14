#!/bin/sh
# Google search suggestions for the property records hub. Usage: pull-suggestions.sh <out_dir>
OUT="$1"
for q in "horry county property records" "horry county property lookup" "horry county property search" "horry county property search by" "horry county property records search" "horry county property owner" "myrtle beach property records" "who owns this property horry county" "horry county property records free" "horry county property information" "property records myrtle beach sc" "horry county address lookup" "horry county flood zone by address" "horry county zoning by address" "is my address in myrtle beach city limits" "horry county evacuation zone by address" "pawleys island property records" "georgetown county sc property records" "horry county public records" "horry county property"; do
  f=$(echo "$q" | tr ' ' '_'); curl -sS --max-time 20 -G 'https://suggestqueries.google.com/complete/search' --data-urlencode client=firefox --data-urlencode "q=$q" -o "$OUT/$f.json"; sleep 1
done
