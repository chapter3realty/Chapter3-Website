#!/bin/sh
# Census tables for the Town of Surfside Beach (place 4570585) and Horry County (45051), one geography per call. Run from the data folder: sh pull-census.sh
A="https://data.census.gov/api/access/data/table"
for t in DECENNIALPL2020.P1 DECENNIALPL2020.H1 DECENNIALDHC2020.H5 DECENNIALSF12010.P1 ACSDT5Y2024.B25003 ACSDT5Y2024.B25004 ACSDT5Y2024.B25024 ACSDT5Y2024.B25035 ACSDT5Y2024.B01002 ACSDT5Y2024.B25077; do
  for g in 160XX00US4570585 050XX00US45051; do
    curl -sS "$A?id=$t&g=$g" -o "raw/census-$t-$g.json"; echo "$t $g $(python3 -c "import json,sys;d=json.load(open(sys.argv[1]))['response']['data'];print({k:v for k,v in zip(d[0],d[1]) if not k.endswith(('A','M'))})" raw/census-$t-$g.json 2>&1 | cut -c1-600)"
  done
done
