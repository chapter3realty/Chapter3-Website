#!/bin/sh
# Google search suggestions for the seeds below. Output: one "seed<TAB>suggestion" line each.
for q in "hoa fees by neighborhood" "hoa fees myrtle beach" "average hoa fees myrtle beach" "hoa fees north myrtle beach" "hoa fees carolina forest" "hoa fees murrells inlet" "hoa fees conway sc" "hoa fees pawleys island" "hoa fees surfside beach" "hoa fees little river sc" "hoa fees longs sc" "how much are hoa fees in myrtle beach" "neighborhoods with low hoa fees myrtle beach" "what does hoa cover myrtle beach" "hoa fees for townhomes myrtle beach" "hoa fees in" "myrtle beach neighborhoods hoa"; do
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(printf %s "$q" | sed 's/ /+/g')" | python3 -I -c "import json,sys;q,s=json.load(sys.stdin)[:2];[print(q+'\t'+x) for x in s]"
  sleep 1
done
