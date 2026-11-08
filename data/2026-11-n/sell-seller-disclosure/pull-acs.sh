#!/bin/sh
# Census ACS table B25034 (year structure built) via the data.census.gov access endpoint. Usage: sh pull-acs.sh <this dir>
curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25034&g=040XX00US45\$1600000" -o "$1/raw/acs5-2024-B25034-sc-places.json"
curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25034&g=050XX00US45051" -o "$1/raw/acs5-2024-B25034-horry.json"
curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSDT1Y2025.B25034&g=050XX00US45051" -o "$1/raw/acs1-2025-B25034-horry.json"
curl -sS -A "Mozilla/5.0" "https://api.census.gov/data/2024/acs/acs5/groups/B25034.json" -o "$1/raw/acs5-2024-B25034-vars.json"
