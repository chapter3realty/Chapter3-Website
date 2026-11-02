#!/bin/sh
# BLS QCEW, Horry County (45051), every industry, by quarter with monthly employment. Run from the data folder: sh pull-qcew.sh
for y in 2024 2025; do for q in 1 2 3 4; do
  curl -sS -A "Mozilla/5.0" "https://data.bls.gov/cew/data/api/$y/$q/area/45051.csv" -o raw/qcew-45051-$y-q$q.csv
done; done
curl -sS -A "Mozilla/5.0" "https://data.bls.gov/cew/data/api/2026/1/area/45051.csv" -o raw/qcew-45051-2026-q1.csv
