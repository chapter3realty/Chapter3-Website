#!/bin/sh
# Census tables for Conway city (place 4516405) and Horry County (45051), one geography per call. Run from the data folder: sh pull-census.sh
A="https://data.census.gov/api/access/data/table"
for t in ACSDT5Y2024.B25064 ACSDT5Y2024.B25003 ACSDT5Y2024.B25077 ACSDT5Y2024.B25024 ACSDT5Y2024.B25035 ACSDT5Y2024.B01003 DECENNIALPL2020.P1 DECENNIALSF12010.P1 ACSDT5Y2024.B25063; do
  for g in 160XX00US4516405 050XX00US45051; do
    curl -sS "$A?id=$t&g=$g" -o "raw/census-$t-$g.json"; echo "$t $g $(python3 -c "import json,sys;d=json.load(open(sys.argv[1]))['response']['data'];print(dict(zip(d[0],d[1])) if len(d[0])<14 else len(d[0]))" raw/census-$t-$g.json 2>&1 | cut -c1-400)"
  done
done
