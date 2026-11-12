#!/bin/sh
# Census ACS 2020-2024 5-year via the data.census.gov access endpoint (api.census.gov needs a key). One geography per call.
# B25034 year structure built; B25035 median year built (every housing unit: houses, condos, mobile homes).
# Places 1600000US45xxxxx, ZCTAs 860Z200US<zip>. Run from the data folder: sh pull_acs.sh (writes raw/acs/<table>-<geo>.json)
mkdir -p raw/acs
for g in 1600000US4549075 1600000US4551280 1600000US4570585 1600000US4516405 1600000US4528455 1600000US4548985 1600000US4511833 1600000US4567390 1600000US4542010 1600000US4542730 1600000US4503430 860Z200US29568 860Z200US29585 860Z200US29569 860Z200US29511 0500000US45051; do
  for t in ACSDT5Y2024.B25034 ACSDT5Y2024.B25035; do
    curl -sS -A "Mozilla/5.0" "https://data.census.gov/api/access/data/table?id=$t&g=$g" -o "raw/acs/$t-$g.json"; echo "$t $g $(wc -c < raw/acs/$t-$g.json)"
  done
done
