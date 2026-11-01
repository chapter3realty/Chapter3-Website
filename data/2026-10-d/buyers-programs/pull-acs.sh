#!/bin/sh
# Census ACS via the data.census.gov access endpoint (api.census.gov needs a key).
# Horry County SC = 050XX00US45051. B19001 household income distribution, B19013 median household income,
# B25118 tenure by household income, B11016 household size. Run: sh pull-acs.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
for t in ACSDT1Y2024.B19001 ACSDT1Y2024.B19013 ACSDT1Y2024.B25118 ACSDT5Y2024.B19001 ACSDT5Y2024.B19013 ACSDT5Y2024.B25118; do
  curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=$t&g=050XX00US45051" -o "$OUT/acs-$t.json"; echo "$t $(wc -c < "$OUT/acs-$t.json")"
done
