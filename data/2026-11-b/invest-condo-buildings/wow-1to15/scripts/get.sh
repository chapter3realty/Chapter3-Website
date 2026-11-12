#!/bin/bash
# get.sh <url> : one plain request; saves to raw/<host+path>.html and txt/
cd "$(dirname "$0")/.."
u="$1"; f=$(echo "$u" | sed -E 's#https?://(www\.)?##; s#[/?=&]+#_#g; s#_$##')
c=$(curl -sL -g --max-time 30 -A 'research-script/1.0' -o "raw/$f.html" -w '%{http_code}' "$u")
python3 -I scripts/totext.py txt "raw/$f.html"
echo "$c $(wc -l < txt/$f.txt) lines $u -> $f"
