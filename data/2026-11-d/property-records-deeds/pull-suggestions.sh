#!/bin/sh
# Google search suggestions for the deed and land-records cluster. Usage: sh pull-suggestions.sh <out.txt>
out=$1; : > "$out"
while IFS= read -r q; do
  [ -z "$q" ] && continue
  enc=$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$q")
  echo "## $q" >> "$out"
  curl -sS -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&q=$enc" | python3 -I -c 'import sys,json;[print(x) for x in json.load(sys.stdin)[1]]' >> "$out"
  sleep 1
done <<'Q'
horry county land records
horry county register of deeds
horry county deed search
horry county deeds
horry county deed
horry county plat
horry county plats
horry county lien search
horry county liens
horry county mortgage records
horry county satisfaction of mortgage
horry county easement
horry county property fraud alert
horry county recording fees
horry county register of deeds search
horry county register of deeds phone
horry county register of deeds fees
horry county land records search by name
horry county deed search by name
how to find a deed in horry county
how to get a copy of my deed horry county
acclaimweb horry county
horry county acclaim
are horry county land records free
georgetown county deed search
georgetown county register of deeds
georgetown county land records
georgetown county sc deeds
pawleys island deed search
myrtle beach deed search
myrtle beach property deeds
south carolina deed search
how to read a deed in south carolina
sc deed stamps calculator
how to look up a deed in sc
who owns this property horry county
horry county property owner search by name
how to find out who owns a property in horry county
Q
