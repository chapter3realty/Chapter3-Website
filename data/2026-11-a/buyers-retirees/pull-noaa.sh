#!/bin/sh
# NOAA NCEI U.S. Climate Normals 1991-2020 (monthly and annual/seasonal) for the stations near Myrtle Beach.
# Run: sh pull-noaa.sh <datadir>
D=${1:-.}
for s in USW00093718 USC00381997 USC00386153; do
  curl -sS -m 120 "https://www.ncei.noaa.gov/data/normals-monthly/1991-2020/access/$s.csv" -o "$D/raw/noaa-monthly-$s.csv"
  curl -sS -m 120 "https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/$s.csv" -o "$D/raw/noaa-annual-$s.csv"
done
