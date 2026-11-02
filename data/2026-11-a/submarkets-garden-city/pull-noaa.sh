#!/bin/sh
# NOAA CO-OPS records for Springmaid Pier, Myrtle Beach (station 8661070). Run from the data folder: sh pull-noaa.sh
B=https://api.tidesandcurrents.noaa.gov
curl -sS "$B/dpapi/prod/webapi/product/sealvltrends.json?station=8661070&affil=US" -o raw/noaa-sltrend-8661070.json
curl -sS "$B/dpapi/prod/webapi/htf/htf_annual.json?station=8661070" -o raw/noaa-htf-annual-8661070.json
curl -sS "$B/dpapi/prod/webapi/htf/htf_met_year_annual_outlook.json?station=8661070" -o raw/noaa-htf-outlook-8661070.json
curl -sS "$B/mdapi/prod/webapi/stations/8661070.json?expand=details,floodlevels,datums" -o raw/noaa-station-8661070.json
curl -sS "$B/dpapi/prod/webapi/product/sealvltrends.json?station=8661070&affil=US" > /dev/null
