#!/bin/sh
# Copied from data/2026-11-a/buyers-va-loans/. HUD FHA condominium approval search (entp.hud.gov condo lookup), Horry County SC, project search.
# Status A = approved, X = all statuses. Needs the session cookie and referer from the form page.
# Run: sh pull-hud-condos.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"; CJ=$(mktemp)
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
F=https://entp.hud.gov/idapp/html/condlook.cfm
curl -sS -c $CJ -b $CJ -A "$UA" -o /dev/null $F
for st in A X; do
curl -sS -c $CJ -b $CJ -L -A "$UA" -e $F -o "$OUT/hud-condos-horry-$st.html" "https://entp.hud.gov/idapp/html/condo1.cfm" \
  --data "fapproval_method=NEW&fsorted_by=condo_name&fstate=SC&fcounty=HORRY&fcondo_id=&fcondo_name=&fcity=&fzip=&fstatus_code=$st&fsearch_type=P&fbegin_mo=&fbegin_dy=&fbegin_yr=&fend_mo=&fend_dy=&fend_yr=&came_from=oth&in_fhac=true"
echo "$st $(grep -o '[0-9]* records were selected' "$OUT/hud-condos-horry-$st.html")"
done
rm -f $CJ
