#!/bin/sh
# Horry County HOME Consortium pages and 2026 limits. Run: sh pull-horry.sh <outdir>
OUT=${1:-raw}; mkdir -p "$OUT"
curl -sS -L -A "Mozilla/5.0" -o "$OUT/horry-home.html" https://horrycountysc.gov/departments/community-development/grants/housing/home/
for u in https://horrycountysc.gov/media/n4kdnylf/2026-hchc-home-income-limits.pdf https://horrycountysc.gov/media/skjmdnt5/2026-hchc-home-homeownership-limits.pdf; do
  curl -sS -L -A "Mozilla/5.0" -o "$OUT/$(basename $u)" "$u"; done
curl -sS -L -A "Mozilla/5.0" -o "$OUT/habitat-horry-homeownership.html" https://habitathorry.org/what-we-do/homeownership/
curl -sS -L -A "Mozilla/5.0" -o "$OUT/habitat-horry-flyer-2026.pdf" https://habitathorry.org/wp-content/uploads/2026/06/2026-6-8-Homebuyer-Program-Flyer-1.pdf
