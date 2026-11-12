"""Writes raw/deeds-slim.json from raw/deeds.json: every deed with book/page, record date, price, parcel and memo.
Party names are kept only when they match the builder or developer pattern (companies); a person's name is replaced by "".
The full file can be rebuilt with pull_deeds.py; it is not kept. Usage: python3 -I slim_deeds.py <this dir>"""
import json, sys, os, re
D = sys.argv[1]
R = json.load(open(os.path.join(D, "raw", "deeds.json")))
CO = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|DRB GROUP|DREAM FINDERS|RS PARKER HOMES|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|OCEAN PALMS BUILDERS|SANDS BUILDING|BRADLEY JONES|INFINITY CUSTOM|ALMOND QUALITY|CMH HOMES|AMERI BUILT|MUNGO|CPG INC|STANLEY MARTIN|CHESAPEAKE HOMES|ADAMS HOMES|ASHTON WOODS|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT|DELINQUENT TAX|SHERIFF|MASTER IN EQUITY")
keep = lambda n: n if n and CO.search(n) else ""
R["deeds"] = [{"BookPage": d["BookPage"], "RecordDate": d["RecordDate"], "Consideration": d["Consideration"], "ParcelNumber": d["ParcelNumber"],
               "Comments": d["Comments"], "DirectName": keep(d["DirectName"]), "IndirectName": keep(d["IndirectName"])} for d in R["deeds"]]
R["note"] = "Party names kept only for builders, developers and tax-sale or court parties; other names blanked."
json.dump(R, open(os.path.join(D, "raw", "deeds-slim.json"), "w"))
