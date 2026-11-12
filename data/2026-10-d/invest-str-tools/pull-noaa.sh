#!/bin/sh
# NOAA CO-OPS, station 8661070 Springmaid Pier (Myrtle Beach): hourly water and air temperature, one file per year.
# Run from this folder: sh pull-noaa.sh
for y in 2021 2022 2023 2024 2025; do
  for p in water_temperature air_temperature; do
    curl -sS -A "Mozilla/5.0 (research; chapter3realty.com)" -o raw/noaa-8661070-$p-$y.csv "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=$p&station=8661070&begin_date=${y}0101&end_date=${y}1231&interval=h&units=english&time_zone=lst&format=csv&application=chapter3realty"
    printf '%s %s %s\n' $y $p "$(wc -l < raw/noaa-8661070-$p-$y.csv)"
  done
done
