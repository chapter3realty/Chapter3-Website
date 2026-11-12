#!/bin/sh
# Census ACS 1-year 2024, table B25034 (year structure built), Horry County SC (050XX00US45051),
# via the data.census.gov access endpoint (api.census.gov now needs a key). Usage: sh pull-acs.sh <this dir>
curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=ACSDT1Y2024.B25034&g=050XX00US45051" -o "$1/raw/acs-ACSDT1Y2024.B25034.json"
