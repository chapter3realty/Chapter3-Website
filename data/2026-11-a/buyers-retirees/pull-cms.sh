#!/bin/sh
# CMS Care Compare, Hospital General Information (dataset xubh-q36u): hospitals in Horry and Georgetown counties, SC.
# Run: sh pull-cms.sh <datadir>. Writes raw/cms-hospitals-<county>.json and raw/cms-hospitals-meta.json.
D=${1:-.}
for c in HORRY GEORGETOWN; do
  curl -sS -g "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?conditions[0][property]=state&conditions[0][value]=SC&conditions[0][operator]==&conditions[1][property]=countyparish&conditions[1][value]=$c&conditions[1][operator]==&limit=100" > "$D/raw/cms-hospitals-$c.json"
done
curl -sS "https://data.cms.gov/provider-data/api/1/metastore/schemas/dataset/items/xubh-q36u" > "$D/raw/cms-hospitals-meta.json"
