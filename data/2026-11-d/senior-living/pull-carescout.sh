#!/bin/bash
# CareScout (formerly Genworth) Cost of Care Survey: the same JSON the public page
# https://www.carescout.com/cost-of-care loads when a reader picks a place. robots.txt
# disallows /api/* at the root, not /cost-of-care/api/. One request per place.
set -e
cd "$(dirname "$0")/raw"
get(){ curl -sS --max-time 30 -A "Mozilla/5.0" -X POST -H "Content-Type: application/json" -d "{\"path\":\"$1\"}" https://www.carescout.com/cost-of-care/api/cost-of-care -o "$2"; }
get "/state/SC/msaName/Myrtle Beach/" carescout-myrtle-beach-area.json
get "/state/SC/" carescout-sc.json
get "/state/SC/msas/" carescout-sc-msas.json
get "/national/" carescout-national.json
