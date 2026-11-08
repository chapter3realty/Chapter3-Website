#!/bin/sh
# NOAA NCEI 1991-2020 annual climate normals: cooling and heating degree days, mean temperature, days at or above 90 F.
# North Myrtle Beach airport (USW00093718, the Grand Strand's normals station), with Columbus, Ohio (USW00014821) and
# New York Central Park (USW00094728) for comparison. Usage: sh pull-noaa.sh <this dir>
curl -sS -A "Mozilla/5.0" "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=USW00093718,USW00014821,USW00094728&format=json&dataTypes=ANN-CLDD-NORMAL,ANN-HTDD-NORMAL,ANN-TAVG-NORMAL,ANN-TMAX-AVGNDS-GRTH090,JJA-TAVG-NORMAL&includeStationName=true" -o "$1/raw/noaa-normals.json"
