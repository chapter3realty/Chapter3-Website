#!/bin/sh
# AirROI market pages for the Grand Strand towns, as published. Run from this folder: sh pull-airroi.sh
for m in myrtle-beach north-myrtle-beach surfside-beach garden-city-beach murrells-inlet pawleys-island little-river conway; do
  curl -sS -L -A "Mozilla/5.0 (research; chapter3realty.com)" -o raw/airroi-$m.html "https://www.airroi.com/airbnb-data/united-states/south-carolina/$m"
  printf '%s %s\n' "$m" "$(wc -c < raw/airroi-$m.html)"
  sleep 2
done
