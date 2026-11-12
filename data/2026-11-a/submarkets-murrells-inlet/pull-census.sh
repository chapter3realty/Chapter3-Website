#!/bin/sh
# Census tables for Murrells Inlet CDP (place 4548985, all in Georgetown County), ZCTA 29576 (the Murrells Inlet ZIP, both counties),
# Georgetown County (45043) and Horry County (45051). Run from the data folder: sh pull-census.sh
A="https://data.census.gov/api/access/data/table"
for t in ACSDT5Y2024.B25002 ACSDT5Y2024.B25003 ACSDT5Y2024.B25077 ACSDT5Y2024.B25024 ACSDT5Y2024.B25035 ACSDT5Y2024.B01003 ACSDT5Y2024.B01002 ACSDT5Y2024.B25064 ACSDT5Y2024.B19013 ACSDT5Y2024.B08303 DECENNIALPL2020.P1 DECENNIALPL2020.H1 DECENNIALDHC2020.H5 DECENNIALSF12010.P1; do
  for g in 160XX00US4548985 860Z200US29576 050XX00US45043 050XX00US45051; do
    curl -sS "$A?id=$t&g=$g" -o "raw/census-$t-$g.json"; echo "$t $g $(python3 -c "import json,sys;d=json.load(open(sys.argv[1]))['response']['data'];print({k:v for k,v in zip(d[0],d[1]) if not k.endswith(('A','M'))})" raw/census-$t-$g.json 2>&1 | cut -c1-600)"
  done
done
