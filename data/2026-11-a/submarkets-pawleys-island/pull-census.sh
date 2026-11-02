#!/bin/sh
# Census tables: Pawleys Island town (place 4555015), Litchfield Beach CDP (4541830), DeBordieu Colony CDP (4518810),
# ZIP code area 29585 (ZCTA), Georgetown County (45043). Run from the data folder: sh pull-census.sh
A="https://data.census.gov/api/access/data/table"
for t in DECENNIALPL2020.P1 DECENNIALPL2020.H1 DECENNIALDHC2020.H5 DECENNIALDHC2020.P13 DECENNIALDHC2020.H12 DECENNIALSF12010.P1 DECENNIALSF12010.H1 DECENNIALSF12010.H5; do
  for g in 160XX00US4555015 160XX00US4541830 160XX00US4518810 860XX00US29585 050XX00US45043; do
    curl -sS -m 60 "$A?id=$t&g=$g" -o "raw/census-$t-$g.json"
    echo "$t $g $(python3 -c "import json,sys;d=json.load(open(sys.argv[1]))['response']['data'];print({k:v for k,v in zip(d[0],d[1]) if not k.endswith(('A','M','NA'))})" raw/census-$t-$g.json 2>&1 | cut -c1-500)"
  done
done
