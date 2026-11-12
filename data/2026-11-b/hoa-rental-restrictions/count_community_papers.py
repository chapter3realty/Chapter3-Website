"""Recorded papers for named Grand Strand communities, 2012-01 to 2026-10, from the Horry County Register of Deeds index
(the same monthly pulls as count_rental_papers.py). A row belongs to a community when a party name matches its pattern.
Kinds: amendment to the declaration or master deed (description has AMEND or RESTATE and DECLARATION, COVENANT, CHARTER,
MASTER DEED or RESTRICTION, and not BYLAW); supplement (SUPPLEMENT, no AMEND); rules and policies (RULE, REGULATION,
POLIC, GUIDELINE, FINE). Counts only, with book and page so each can be opened.
Usage: RAW=<dir> python3 -I count_community_papers.py <outdir>"""
import sys, os, re, json, glob, collections
out = sys.argv[1]; RAW = os.environ["RAW"]
C = {"The Farm at Carolina Forest": r"FARM AT CAROLINA FOREST", "Waterbridge": r"\bWATERBRIDGE\b", "Berkshire Forest": r"BERKSHIRE FOREST",
     "Del Webb at Grande Dunes": r"DEL WEBB (AT|MYRTLE BEACH AT) GRANDE DUNES", "Del Webb North Myrtle Beach": r"DEL WEBB NORTH MYRTLE|CHESTNUT GREENS",
     "Seasons at Prince Creek West": r"SEASONS AT PRINCE CREEK", "Myrtle Trace": r"^MYRTLE TRACE( HOMEOWNERS ASSOCIATION( INC)?)?$|MYRTLE TRACE \|",
     "Plantation Lakes": r"PLANTATION LAKES", "Avalon at Carolina Forest": r"AVALON (AT|@) CAROLINA FOREST"}
def kind(c):
    c = c.upper()
    if re.search(r"BY ?-?LAW", c): return None
    if re.search(r"AMEND|RESTATE", c) and re.search(r"DECLARATION|COVENANT|CHARTER|MASTER DEED|RESTRICTION", c): return "amendment"
    if re.search(r"RULE|REGULATION|POLIC|GUIDELINE|FINE|HANDBOOK|STANDARDS", c): return "rules and policies"
    if re.search(r"SUPPLEMENT", c): return "supplement"
    return None
res = {k: collections.Counter() for k in C}; rows = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(RAW, "*.json"))):
    for r in json.load(open(f))["Data"]:
        names = [(r.get("DirectName") or "").strip(), (r.get("IndirectName") or "").strip()]
        c = (r.get("Comments") or "").strip(); k = kind(c)
        if not k: continue
        for name, pat in C.items():
            if any(re.search(pat, n) for n in names):
                if name == "Myrtle Trace" and any(re.search(r"MYRTLE TRACE (SOUTH|GRANDE)", n) for n in names): continue
                res[name][k] += 1; rows[name].append({"recorded": r["RecordDate"], "kind": k, "description": c, "book_page": r["BookPage"]})
for n in rows: rows[n].sort(key=lambda x: x["recorded"])
json.dump({"source": "Horry County Register of Deeds index (AcclaimWeb), RESTRICTIONS (082) and AMENDMENT DEED BOOK (069), 2012-01 to 2026-10, pulled 2026-11-04",
           "method": __doc__.split("Usage")[0].strip(), "counts": {k: dict(v) for k, v in res.items()}, "rows": rows},
          open(os.path.join(out, "community-papers.json"), "w"), indent=1)
for k, v in res.items(): print(k, dict(v), (rows[k][0]["recorded"] if rows[k] else ""), (rows[k][-1]["recorded"] if rows[k] else ""))
