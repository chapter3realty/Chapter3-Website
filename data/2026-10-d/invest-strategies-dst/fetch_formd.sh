#!/bin/sh
# Download the four SEC Form D quarterly data sets used by formd_dst.py (about 14 MB zipped; not kept in the repo).
# Usage: sh fetch_formd.sh <out-dir>; then python3 -I formd_dst.py <out-dir> > formd_dst_summary.json
set -e
OUT=${1:-formd-raw}; mkdir -p "$OUT"; cd "$OUT"
UA="Chapter3Realty research bot"
for p in datastandardsinnovation/data/form-d-data-sets/2026q3_d datastandardsinnovation/data/form-d-data-sets/2026q2_d \
         structureddata/data/form-d-data-sets/2026q1_d structureddata/data/form-d-data-sets/2025q4_d; do
  f=$(basename $p); curl -s -A "$UA" -o $f.zip "https://www.sec.gov/files/$p.zip"; mkdir -p $f; unzip -o -q $f.zip -d $f; sleep 1
done
