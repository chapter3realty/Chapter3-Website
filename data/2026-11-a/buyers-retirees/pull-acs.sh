#!/bin/sh
# Census ACS via the data.census.gov access endpoint (api.census.gov needs a key).
# Horry County SC = 050XX00US45051, U.S. = 010XX00US. S0101 age and sex; B07001 movers by age (1-year).
# Run: sh pull-acs.sh <datadir>
D=${1:-.}
for t in ACSST1Y2024.S0101 ACSST1Y2019.S0101 ACSDT1Y2024.B07001 ACSDT1Y2019.B07001; do
  curl -sS -m 180 -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=$t&g=050XX00US45051" -o "$D/raw/acs-$t.json"; echo "$t $(wc -c < "$D/raw/acs-$t.json")"
done
curl -sS -m 180 -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSST1Y2024.S0101&g=010XX00US" -o "$D/raw/acs-ACSST1Y2024.S0101-us.json"
curl -sS -m 180 -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSST1Y2024.S0101&g=040XX00US45" -o "$D/raw/acs-ACSST1Y2024.S0101-sc.json"
