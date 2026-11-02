#!/bin/sh
# VA Loan Guaranty public condo report (https://lgy.va.gov/lgyhub/condo-report), the JSON behind its search form.
# Horry and Georgetown counties, SC: every status, then approved only (the form's "approved" box).
# Run: sh pull-va-condos.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
for c in HORRY GEORGETOWN; do
  for a in false true; do
    curl -sS -A "Mozilla/5.0" -H "Accept: application/json" "https://lgy.va.gov/lgyhub/api/condos/search?stateCode=SC&county=$c&approved=$a" -o "$OUT/va-condos-$c-approved-$a.json"
    echo "$c approved=$a $(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" "$OUT/va-condos-$c-approved-$a.json")"
  done
done
