#!/bin/sh
# Zillow Research metro files, raw (not smoothed, not seasonally adjusted), all homes (single-family and condo).
# Keeps the header, the United States row and the Myrtle Beach, SC metro row (Myrtle Beach-Conway-North Myrtle Beach).
# Run from this data folder: sh pull-zillow.sh
Z=https://files.zillowstatic.com/research/public_csvs
for p in invt_fs/Metro_invt_fs_uc_sfrcondo_month new_listings/Metro_new_listings_uc_sfrcondo_month med_doz_pending/Metro_med_doz_pending_uc_sfrcondo_month mean_doz_pending/Metro_mean_doz_pending_uc_sfrcondo_month median_sale_to_list/Metro_median_sale_to_list_uc_sfrcondo_month pct_sold_above_list/Metro_pct_sold_above_list_uc_sfrcondo_month perc_listings_price_cut/Metro_perc_listings_price_cut_uc_sfrcondo_month mean_days_to_close/Metro_mean_days_to_close_uc_sfrcondo_month new_pending/Metro_new_pending_uc_sfrcondo_month; do
  n=$(basename $p)
  curl -sS "$Z/$p.csv" | python3 -I -c "import csv,sys;r=csv.reader(sys.stdin);w=csv.writer(sys.stdout);[w.writerow(x) for i,x in enumerate(r) if i==0 or x[2] in ('Myrtle Beach, SC','United States')]" > raw/zillow-$n.csv
done
