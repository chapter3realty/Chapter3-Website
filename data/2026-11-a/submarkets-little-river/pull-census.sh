#!/bin/sh
# Census tables for Little River CDP (1600000US4542010) and peers: Garden City CDP 4528455, North Myrtle Beach city 4551280,
# Murrells Inlet CDP 4548985, Carolina Forest CDP 4511833, Conway city 4516405, Horry County 0500000US45051.
# One geography per call. Run from the data folder: sh pull-census.sh
A="https://data.census.gov/api/access/data/table"
for t in ACSDT5Y2024.B25004 ACSDT5Y2024.B25002 ACSDT5Y2024.B25003 ACSDT5Y2024.B25024 ACSDT5Y2024.B25035 ACSDT5Y2024.B25077 ACSDT5Y2024.B25064 ACSDT5Y2024.B25034 DECENNIALPL2020.P1 DECENNIALSF12010.P1 DECENNIALPL2020.H1 DECENNIALDHC2020.H5; do
  for g in 160XX00US4542010 160XX00US4528455 160XX00US4551280 160XX00US4548985 160XX00US4511833 160XX00US4516405 050XX00US45051; do
    f="raw/census-$t-$g.json"; [ -s "$f" ] || curl -sS -m 120 "$A?id=$t&g=$g" -o "$f"
  done
done
