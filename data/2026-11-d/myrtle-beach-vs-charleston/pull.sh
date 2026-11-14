#!/bin/bash
# Pull raw public data for /buyers/relocating/myrtle-beach-vs-charleston/. Usage: bash pull.sh <this folder>
set -u
R="$1/raw"; mkdir -p "$R"
# ACS 1-year 2025, one geography per call (the API rejects lists): Charleston metro, Myrtle Beach metro, Charleston County, Horry County
# median value, median household income, median real estate taxes paid, population, median year built, median gross rent; commute (S0801)
for g in 310M700US16700 310M700US34820 050XX00US45019 050XX00US45051; do
  for t in ACSDT1Y2025.B25077 ACSDT1Y2025.B19013 ACSDT1Y2025.B25103 ACSDT1Y2025.B01003 ACSDT1Y2025.B25035 ACSDT1Y2025.B25064 ACSST1Y2025.S0801; do
    curl -sS -A "Mozilla/5.0" --max-time 60 "https://data.census.gov/api/access/data/table?id=$t&g=$g" -o "$R/$t-$g.json"; sleep 0.3; done; done
# Zillow ZHVI, metro, mid-tier all homes, smoothed seasonally adjusted
curl -sS --max-time 90 -o "$R/zhvi-metro.csv" "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
# NOAA high tide flood counts (Charleston harbor, Springmaid Pier)
curl -sS --max-time 30 -o "$R/htf-charleston-8665530.json" "https://api.tidesandcurrents.noaa.gov/dpapi/prod/webapi/htf/htf_annual.json?station=8665530"
curl -sS --max-time 30 -o "$R/htf-springmaid-8661070.json" "https://api.tidesandcurrents.noaa.gov/dpapi/prod/webapi/htf/htf_annual.json?station=8661070"
# ACS 1-year 2025 economic profile (industry shares, workers), both metros
for g in 310M700US16700 310M700US34820; do
  curl -sS -A "Mozilla/5.0" --max-time 60 "https://data.census.gov/api/access/data/table?id=ACSDP1Y2025.DP03&g=$g" -o "$R/ACSDP1Y2025.DP03-$g.json"; sleep 0.3; done
# FEMA residential flood insurance penetration by county (Charleston 45019, Horry 45051)
curl -sS --max-time 60 "https://www.fema.gov/api/open/v1/NfipResidentialPenetrationRates?\$filter=fipsCode%20eq%20%2745019%27%20or%20fipsCode%20eq%20%2745051%27" -o "$R/openfema-penetration.json"
# NOAA 1991-2020 normals: North Myrtle Beach airport USW00093718, Charleston airport USW00013880
for s in USW00093718 USW00013880; do
  curl -sS --max-time 40 "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=$s&format=json&dataTypes=ANN-TMAX-NORMAL,ANN-TMIN-NORMAL,ANN-PRCP-NORMAL,ANN-SNOW-NORMAL&includeStationName=true" -o "$R/normals-ann-$s.json"
  curl -sS --max-time 40 "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=$s&format=json&dataTypes=ANN-TMAX-AVGNDS-GRTH090,ANN-TMIN-AVGNDS-LSTH032,ANN-PRCP-AVGNDS-GE010HI&includeStationName=true" -o "$R/normals-days-$s.json"
  curl -sS --max-time 40 "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=$s&format=json&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL,MLY-PRCP-NORMAL&includeStationName=true" -o "$R/normals-mly-$s.json"; done
# SC public beach access points, DHEC 2023 inventory (ArcGIS layer hosted by USACE Charleston District user)
curl -sS --max-time 60 "https://services7.arcgis.com/wooIevDLYznutGEM/arcgis/rest/services/Beach_Access_Points_DHEC_2023/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=2000" -o "$R/beach-access-dhec-2023.json"
# OSRM drives (no traffic): MB City Hall to Charleston City Hall; Charleston City Hall to Sullivan's Island, Folly Beach, Isle of Palms
curl -sS --max-time 30 "https://router.project-osrm.org/route/v1/driving/-78.8873,33.6955;-79.9310,32.7767?overview=false" -o "$R/osrm-mbcityhall-chscityhall.json"
for d in "folly:-79.9405,32.6532" "iop:-79.7836,32.7863" "sullivans:-79.8434,32.7609"; do curl -sS --max-time 30 "https://router.project-osrm.org/route/v1/driving/-79.9310,32.7767;${d#*:}?overview=false" -o "$R/osrm-chscityhall-${d%%:*}.json"; done
# SC Code: 12-43-220 (4 percent) and 38-75-310 (wind pool coastal area)
curl -sSL -A "Mozilla/5.0" --max-time 30 "https://www.scstatehouse.gov/code/t12c043.php" -o "$R/sc-code-12-43.html"
curl -sSL -A "Mozilla/5.0" --max-time 30 "https://www.scstatehouse.gov/code/t38c075.php" -o "$R/sc-code-38-75.html"
# Census Building Permits Survey, 2025 annual by metro (CBSA)
curl -sS --max-time 30 "https://www2.census.gov/econ/bps/CBSA%20(beginning%20Jan%202024)/cbsa2025a.txt" -o "$R/bps-cbsa2025a.txt"
