"""Yearly property tax on a Little River condo outside the City of North Myrtle Beach, 2026 levy, at 4 and 6 percent, at three prices.
Levy from batches/2026-11-a/submarkets-little-river/facts.md rows 5 and 6 (VERIFIED there): 4 percent net 91.9 mills; 6 percent 201.0 mills; county fee $89.40 (some new-home bills show $0).
Assumes the county values the condo at its price; leaves out the 65-and-older exemption. Writes tax.json."""
import json
o={}
for p in (150000,190000,250000):
    o[p]={"four":round(p*.04*.0919+89.40,2),"six":round(p*.06*.201+89.40,2)}
json.dump({"rule":__doc__,"tax":o},open("tax.json","w"),indent=1); print(o)
