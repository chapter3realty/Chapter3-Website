"""Yearly property tax on a Myrtle Beach house at the recorded-sale middle ($395,000), 2026 levy.
Inside the city (4%): net 101.0 mills (facts row 64, 2026-10-b affordable-facts). Outside (4%): net 91.9 mills + $89.40 county fee (row 71/72).
6%: city 254.6 mills (2026-11-a invest-condos rows 20, 21, C7), outside 201.0 mills + $89.40. Assumes the county values the house at its price; leaves out the 65-and-older exemption."""
import json
p=395000;o={}
o["city_4"]=round(p*.04*.101,2);o["out_4"]=round(p*.04*.0919+89.40,2);o["city_6"]=round(p*.06*.2546,2);o["out_6"]=round(p*.06*.201+89.40,2)
json.dump({"rule":__doc__,"price":p,"tax":o},open("tax.json","w"),indent=1);print(o)
