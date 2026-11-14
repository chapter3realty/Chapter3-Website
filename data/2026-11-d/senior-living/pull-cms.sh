#!/bin/bash
# CMS Care Compare, nursing homes provider information (dataset 4pq5-n9py), Horry and Georgetown, SC.
set -e
cd "$(dirname "$0")/raw"
for c in Horry Georgetown; do
curl -sS --max-time 60 -G "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0" \
  --data-urlencode "conditions[0][property]=state" --data-urlencode "conditions[0][value]=SC" \
  --data-urlencode "conditions[1][property]=countyparish" --data-urlencode "conditions[1][value]=$c" \
  --data-urlencode "limit=200" > cms-nh-$c.json
done
