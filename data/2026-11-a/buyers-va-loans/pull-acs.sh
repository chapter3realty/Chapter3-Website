#!/bin/sh
# Census ACS via the data.census.gov access endpoint (api.census.gov needs a key). One geography per call.
# Horry County SC = 050XX00US45051, Georgetown 050XX00US45043, South Carolina 0400000US45, United States 0100000US.
# B21001 sex by age by veteran status (civilians 18+); B25034 year structure built (all housing units).
# Run: sh pull-acs.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
for t in ACSDT1Y2024.B21001 ACSDT1Y2024.B25034; do
  for g in 050XX00US45051 050XX00US45043 0400000US45 0100000US; do
    curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=$t&g=$g" -o "$OUT/acs-$t-$g.json"; echo "$t $g $(wc -c < "$OUT/acs-$t-$g.json")"
  done
done
