"""Yearly property tax on a house at the county's middle sale price (findings-deeds.json houses.median), tax year 2026 millage from the ledger rows it names. Arithmetic only. Usage: python3 -I tax.py > tax.json
Unincorporated Horry County: 91.9 mills for a legal residence (4 percent), 201.0 mills at 6 percent, plus an $89.40 stormwater fee (Conway ledger rows SIB 10 and 17; sell-net-proceeds ledger row 26).
City of Myrtle Beach: 254.6 mills at 6 percent; the legal residence pays 254.6 less the school operating levy 109.1 less 53.4 percent of the city 83.4 = 101.0 mills at 4 percent; no county fee (Myrtle Beach condos ledger rows 14 and 15)."""
import json
P=json.load(open("findings-deeds.json"))["houses"]["median"]
city4=254.6-109.1-0.534*83.4
r={"price":P,
 "unincorporated_4pct":round(P*.04*.0919+89.40),"unincorporated_6pct":round(P*.06*.201+89.40),
 "myrtle_beach_city_4pct":round(P*.04*city4/1000),"myrtle_beach_city_6pct":round(P*.06*.2546),"city_mills_4pct":round(city4,1)}
print(json.dumps(r,indent=1))
