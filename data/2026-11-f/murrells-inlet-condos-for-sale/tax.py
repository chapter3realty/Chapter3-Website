"""Yearly property tax on a condo in the Murrells Inlet area, at 6 and 4 percent, by side of the county line. Rows 15 to 17 of batches/2026-11-a/submarkets-murrells-inlet/facts.md (VERIFIED).
Horry side (tax district 610; Garden City too): 4%: price x 0.04 x 0.0982 + 89.40 fees. 6%: price x 0.06 x 0.2073 + 89.40.
Georgetown side (district 41, the county's calculator, tax year not stated): 4%: price x 0.04 x 0.1289 + 96. 6%: price x 0.06 x 0.2520 + 96 (ledger row 17's method).
Before credits and the 15 percent cap. Run from inside this dir. Writes tax.json."""
import json
P=(200000,250000,350000)
out={"horry":{p:{"four":round(p*.04*.0982+89.4,2),"six":round(p*.06*.2073+89.4,2)} for p in P},"georgetown":{p:{"four":round(p*.04*.1289+96,2),"six":round(p*.06*.2520+96,2)} for p in P}}
json.dump({"rule":__doc__,"tax":out},open("tax.json","w"),indent=1); print(json.dumps(out))
