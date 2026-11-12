#!/bin/sh
# Census ACS 2020-2024 5-year via the data.census.gov access endpoint (api.census.gov needs a key). One geography per call.
# B25064 median gross rent; B25003 tenure (renter-occupied = _003). Places 1600000US45xxxxx, ZCTAs 860Z200US<zip>, counties 0500000US45051/45043.
# Run: sh pull_acs.sh (writes raw/acs/<table>-<geo>.json)
mkdir -p raw/acs
for g in 1600000US4549075 1600000US4551280 1600000US4570585 1600000US4516405 1600000US4528455 1600000US4548985 1600000US4511833 1600000US4567390 1600000US4542010 1600000US4555015 1600000US4541830 860Z200US29568 860Z200US29585 0500000US45051 0500000US45043; do
  for t in ACSDT5Y2024.B25064 ACSDT5Y2024.B25003; do
    curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=$t&g=$g" -o "raw/acs/$t-$g.json"; echo "$t $g $(wc -c < raw/acs/$t-$g.json)"
  done
done
