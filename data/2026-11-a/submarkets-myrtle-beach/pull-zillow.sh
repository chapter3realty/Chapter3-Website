#!/bin/sh
# Zillow Research ZHVI, city files (smoothed, seasonally adjusted, middle tier): all homes, condos and single-family.
# Keeps the header and the South Carolina rows for Myrtle Beach, North Myrtle Beach, Conway and Surfside Beach.
# Run from the data folder: sh pull-zillow.sh
Z=https://files.zillowstatic.com/research/public_csvs/zhvi
for k in sfrcondo condo sfr; do
  curl -sS "$Z/City_zhvi_uc_${k}_tier_0.33_0.67_sm_sa_month.csv" | awk -F, 'NR==1 || ($6=="SC" && ($3=="Myrtle Beach" || $3=="North Myrtle Beach" || $3=="Conway" || $3=="Surfside Beach"))' > raw/zillow-zhvi-city-$k.csv
done
