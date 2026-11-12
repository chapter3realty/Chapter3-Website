#!/usr/bin/env bash
# Google search suggestions for the second rewrite of /why-chapter-3/ (2026-11-12): the tools and choosing a firm.
# Usage: bash pull-suggestions-tools.sh > ../raw/google-suggestions-tools-<date>.txt
seeds=(
"ai home search" "ai real estate search" "ai house search describe what you want" "search homes with ai"
"myrtle beach homes for sale map" "myrtle beach real estate search" "best website to search homes for sale"
"myrtle beach rental property calculator" "myrtle beach airbnb calculator" "myrtle beach real estate agent"
"myrtle beach realtor" "best realtor in myrtle beach" "why choose a real estate agent" "what makes a good real estate agent"
"real estate brokerage myrtle beach" "chapter3 realty" "chapter 3 realty reviews" "myrtle beach real estate investor agent"
"realtor myrtle beach out of state buyers" "what does a real estate agent do for a buyer"
)
for q in "${seeds[@]}"; do
  enc=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$q")
  out=$(curl -sS -m 15 "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$enc")
  echo "## $q"
  python3 -c 'import json,sys
d=json.loads(sys.argv[1])
for s in d[1]: print("- "+s)' "$out"
done
