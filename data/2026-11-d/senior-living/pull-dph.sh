#!/bin/bash
# Pulls SC DPH licensed facilities (CRCF/assisted living, nursing homes, adult day care,
# hospice facilities) for Horry and Georgetown counties from the layer behind
# DPH's "Find a Facility" map (dph.sc.gov/public/data-maps-reports/find-health-facility).
# Personal fields (emails, administrator phone) are not requested.
set -e
cd "$(dirname "$0")/raw"
B=https://services5.arcgis.com/G4BLIH7rTQoIjCFv/arcgis/rest/services/Health_Facilities/FeatureServer/0/query
F="PERMIT_TYPE,PERMIT_TYPE_DETAIL_DESC,LICENSE_NBR,LICENSE_EXPIRES,LF_NAME,LF_STREET_ADDR1,LF_STREET_CITY,LF_STREET_ZIP,LF_STREET_COUNTY,NBR_LICENSED,CRC_NBR_TOTAL_BEDS,CRC_ALZHEIMER_UNIT,CRC_ALZHEIMER_CARE,NH_NBR_NH_BEDS,NH_ALZHEIMER_UNIT,NH_ALZHEIMER_CARE,ADC_NBR_PARTICIPANTS,CMSCERT_IND,Evacuation_Zone,X,Y,Conglomerate"
curl -sS --max-time 60 -G "$B" \
  --data-urlencode "where=LF_STREET_COUNTY IN ('Horry','Georgetown') AND PERMIT_TYPE IN ('HLRESIDENTIALCARE','HLNURSINGCARE','HLADULTDAYCARE','HLHOSPICEFACILITY')" \
  --data-urlencode "outFields=$F" --data-urlencode "returnGeometry=false" \
  --data-urlencode "resultRecordCount=2000" --data-urlencode "f=json" > dph-facilities-horry-georgetown.json
# Statewide CRCF beds, for the state comparison
curl -sS --max-time 60 -G "$B" \
  --data-urlencode "where=PERMIT_TYPE='HLRESIDENTIALCARE'" \
  --data-urlencode "outFields=LF_STREET_COUNTY,CRC_NBR_TOTAL_BEDS,NBR_LICENSED,CRC_ALZHEIMER_UNIT" --data-urlencode "returnGeometry=false" \
  --data-urlencode "resultRecordCount=3000" --data-urlencode "f=json" > dph-crcf-statewide.json
curl -sS --max-time 60 "https://services5.arcgis.com/G4BLIH7rTQoIjCFv/arcgis/rest/services/Health_Facilities/FeatureServer/0?f=json" > dph-layer-meta.json
