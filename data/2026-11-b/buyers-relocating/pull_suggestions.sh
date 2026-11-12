#!/bin/sh
# Google search suggestions for the relocation hub's seeds. Run: sh pull_suggestions.sh > raw/google-suggestions.txt
for q in "relocating to myrtle beach" "relocating to myrtle beach sc" "moving to myrtle beach" "moving to myrtle beach sc" "move to myrtle beach" "myrtle beach relocation" "moving to myrtle beach pros" "should i move to myrtle beach" "what to know before moving to myrtle beach" "moving to south carolina" "relocating to south carolina" "buying a house in myrtle beach from out of state" "best place to live in myrtle beach for" "living in myrtle beach" "is myrtle beach a good place to live" "moving to north myrtle beach" "moving to the grand strand"; do
  enc=$(python3 -I -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")
  printf '%s\t' "$q"
  curl -sS --max-time 10 "https://suggestqueries.google.com/complete/search?client=firefox&q=$enc" | python3 -I -c "import json,sys;print(' | '.join(json.load(sys.stdin)[1]))"
  sleep 1
done
