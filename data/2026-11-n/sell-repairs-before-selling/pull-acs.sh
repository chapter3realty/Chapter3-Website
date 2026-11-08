#!/bin/sh
# Census ACS 2025 1-year (latest), year structure built: B25034 (all housing units), B25035 (median year built),
# B25036 (tenure by year built). Horry County, Georgetown County, South Carolina, United States.
# Same data.census.gov access endpoint as data/2026-11-n/sell-seller-disclosure/pull-acs.sh. Usage: sh pull-acs.sh <this dir>
for t in B25034 B25035 B25036; do
  for g in horry:050XX00US45051 georgetown:050XX00US45043 sc:0400000US45 us:0100000US; do
    n=${g%%:*}; id=${g#*:}
    curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSDT1Y2025.$t&g=$id" -o "$1/raw/acs1-2025-$t-$n.json"
    sleep 1
  done
done
curl -sS -A "Mozilla/5.0" "https://api.census.gov/data/2024/acs/acs1/groups/B25034.json" -o "$1/raw/acs1-2024-B25034-vars.json"   # labels (same in 2025)
curl -sS -A "Mozilla/5.0" "https://api.census.gov/data/2024/acs/acs1/groups/B25036.json" -o "$1/raw/acs1-2024-B25036-vars.json"
