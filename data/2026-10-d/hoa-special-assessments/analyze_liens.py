"""Count association liens recorded in Horry County, by year, from the monthly AcclaimWeb pulls (pull_liens.py).
Horry County's Register of Deeds files every association lien for unpaid assessments under the document type
CONDO LIEN (064), whether the association runs a condo building or a neighborhood of houses.
One document can carry several index rows (one per name on it), so documents are counted once, by book and page.
Filer type, from the association's name (DirectName):
  condo   - the name contains REGIME, HPR, HORIZONTAL, CONDO, CO-OWNER, COOWNER or COUNCIL OF (the legal forms of a
            condo in South Carolina)
  other   - every other filer (homeowners and property owners associations, and names that do not say)
Usage: RAW=<dir with liens-*.json> python3 -I analyze_liens.py <this dir>. Writes liens-by-year.json (counts only, no names)."""
import sys, os, json, re, glob, collections
d = sys.argv[1] if len(sys.argv) > 1 else "."
RAW = os.environ.get("RAW", os.path.join(d, "raw-private"))
CONDO = re.compile(r"REGIME|\bHPR\b|HORIZONTAL|CONDO|CO-?OWNER|COUNCIL OF", re.I)
def load(kind):
    docs = {}
    for f in sorted(glob.glob(os.path.join(RAW, f"liens-{kind}-[0-9]*.json"))):
        for r in json.load(open(f))["Data"]:
            key = r.get("BookPage") or r.get("TransactionId")
            x = docs.setdefault(key, {"date": r["RecordDate"], "filers": set(), "owners": set()})
            x["filers"].add((r.get("DirectName") or "").strip())
            x["owners"].add((r.get("IndirectName") or "").strip())
    return docs
liens, sats = load("condo-lien"), load("condo-lien-satisfaction")
# Bulk filers: timeshare companies and resorts, a water utility and trustees file hundreds of liens against
# timeshare weeks or accounts, not against an owner's home. associations_filing_any_count counts every filer that recorded at least one lien that year,
# leaving out only the name-matched timeshare companies, the utility and trustees. A filer is "bulk" in a year when its name matches
# BULK_NAME, or when it recorded BULK_MIN or more liens that year. The page counts only the other filers.
BULK_NAME = re.compile(r"WYNDHAM|MARRIOTT|HILTON GRAND|BLUEGREEN|VISTANA|WESTGATE|DIAMOND RESORTS|HOLIDAY INN CLUB|VACATION|TIMESHARE|INTERVAL|WATER AND SEWER|\bTR(USTEE)?\b", re.I)
BULK_MIN = 25
per_year_filer = collections.defaultdict(collections.Counter)
for x in liens.values():
    for n in x["filers"]: per_year_filer[x["date"][:4]][n] += 1
def bulk(y, n): return bool(BULK_NAME.search(n)) or per_year_filer[y][n] >= BULK_MIN
by = collections.defaultdict(lambda: {"all": 0, "bulk": 0, "liens": 0, "liens_condo_named": 0, "filers": set(), "condo_filers": set(), "bulk_filers": set(), "satisfactions": 0})
for x in liens.values():
    y = x["date"][:4]; b = by[y]; b["all"] += 1
    names = [n for n in x["filers"] if n]
    if any(bulk(y, n) for n in names):
        b["bulk"] += 1; b["bulk_filers"].update(n for n in names if bulk(y, n)); continue
    b["liens"] += 1
    if any(CONDO.search(n) for n in names): b["liens_condo_named"] += 1
    b["filers"].update(names); b["condo_filers"].update(n for n in names if CONDO.search(n))
named_only = collections.defaultdict(set)
for x in liens.values():
    for n in x["filers"]:
        if n and not BULK_NAME.search(n): named_only[x["date"][:4]].add(n)
for x in sats.values():
    by[x["date"][:4]]["satisfactions"] += 1
mfile = os.path.join(d, "raw", "liens-months.json")
months = json.load(open(mfile))["months"] if os.path.exists(mfile) else []
covered = collections.Counter(m["month"][:4] for m in months)
out = {"source": "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType (document types CONDO LIEN (064) and CONDO LIEN SATISFACTION (036))",
       "method": __doc__ + "\nBulk rule: name matches " + BULK_NAME.pattern + ", or " + str(BULK_MIN) + "+ liens by that filer in that year.",
       "documents": {"condo_lien": len(liens), "condo_lien_satisfaction": len(sats)}, "years": {}}
for y in sorted(by):
    b = by[y]
    out["years"][y] = {"months_covered": covered.get(y), "all_lien_documents": b["all"], "bulk_filer_documents": b["bulk"], "bulk_filers": len(b["bulk_filers"]),
                       "liens": b["liens"], "liens_condo_named": b["liens_condo_named"], "associations_filing": len(b["filers"]),
                       "condo_named_associations_filing": len(b["condo_filers"]),
                       "associations_filing_any_count": len(named_only[y]), "satisfactions_all_filers": b["satisfactions"]}
    print(y, out["years"][y])
json.dump(out, open(os.path.join(d, "liens-by-year.json"), "w"), indent=1)
