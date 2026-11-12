#!/usr/bin/env bash
# Google search suggestions for the /why-chapter-3/ must-answer list.
# Usage: bash pull-suggestions.sh > ../raw/google-suggestions-<date>.txt
seeds=(
"why chapter3 realty" "chapter 3 realty" "chapter 3 realty myrtle beach" "chapter iii realty"
"myrtle beach real estate agent" "myrtle beach real estate agency" "best real estate agent myrtle beach"
"how to choose a real estate agent for buying" "questions to ask a real estate agent before hiring them"
"questions to ask a real estate agent when buying a condo" "what does a buyers agent do"
"what does a buyers agent do in south carolina" "do i need a buyers agent" "how does a buyers agent get paid"
"buyer agency agreement south carolina" "south carolina real estate license lookup" "how to check if a realtor is licensed"
"broker in charge south carolina" "what to check before buying a condo" "what to check before making an offer on a house"
"what to check before buying a house" "due diligence before buying a condo" "how to research a property before buying"
"how to find out if a house has flooded" "how to check if a condo is in litigation" "how to check building permits for a property"
"myrtle beach building permits search" "horry county permit search" "myrtle beach investor friendly realtor"
"realtor for investors myrtle beach" "real estate agent for out of state buyers"
)
for q in "${seeds[@]}"; do
  enc=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")
  out=$(curl -sS -m 15 "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$enc")
  echo "## $q"
  python3 -c 'import json,sys
d=json.loads(sys.argv[1])
for s in d[1]: print("- "+s)' "$out"
done
