"""What Horry County's associations call themselves: the name label of every association that recorded a lien
for unpaid assessments, from the Register of Deeds index (AcclaimWeb, document type CONDO LIEN (064)).
Input: the monthly index pulls made by data/2026-10-d/hoa-special-assessments/pull_liens.py (RAW dir; they carry
owners' names, so they stay out of the repo). Output: counts only, no names, except the list of label words.
Bulk filers (timeshare companies, a utility, trustees, or 25+ liens by one filer in a year) are left out, the same
rule as hoa-special-assessments/analyze_liens.py, so "2025" matches that page's 540 associations_filing; "2025_any_count" leaves out only the name-matched bulk
filers and matches its 548 associations_filing_any_count (the number the sibling page prints).
The index cuts names at 40 letters, so a label at the end of a long name can be lost ("cut").
Label, first match wins, in this order:
  condo   REGIME, HPR, HORIZONTAL, CONDO, CO-OWNER, COUNCIL OF   (the legal forms of a condo in South Carolina)
  poa     PROPERTY OWNER(S), POA, P O A
  hoa     HOMEOWNER(S), HOME OWNER(S), HOA, H O A
  community  COMMUNITY ASSOC, MASTER, OWNERS ASSOC, RESIDENTS, ASSOCIATION, ASSN, ASSOC (any other association name)
  other   anything else (often a name cut before its label)
master is counted on its own too: any name with MASTER. condo_word_and_poa_or_hoa_word: a condo word and a POA or HOA word
in the same name. ends_inc_corporation: names with INC, INCORPORATED or CORP.
Usage: RAW=<dir> python3 -I classify_names.py <this dir>. Writes association-names.json."""
import sys, os, json, re, glob, collections
d = sys.argv[1] if len(sys.argv) > 1 else "."
RAW = os.environ["RAW"]
BULK_NAME = re.compile(r"WYNDHAM|MARRIOTT|HILTON GRAND|BLUEGREEN|VISTANA|WESTGATE|DIAMOND RESORTS|HOLIDAY INN CLUB|VACATION|TIMESHARE|INTERVAL|WATER AND SEWER|\bTR(USTEE)?\b", re.I)
BULK_MIN = 25
LABELS = [("condo", re.compile(r"REGIME|\bHPR\b|HORIZONTAL|CONDO|CO-?OWNER|COUNCIL OF", re.I)),
          ("poa", re.compile(r"PROPERTY OWNER|\bPOA\b|\bP O A\b", re.I)),
          ("hoa", re.compile(r"HOMEOWNER|HOME OWNER|\bHOA\b|\bH O A\b", re.I)),
          ("community", re.compile(r"COMMUNITY ASSOC|MASTER|OWNERS ASSOC|RESIDENTS|ASSOCIATION|\bASSN\b|\bASSOC\b", re.I))]
MASTER = re.compile(r"\bMASTER\b", re.I)
def label(n):
    for k, rx in LABELS:
        if rx.search(n): return k
    return "other"
docs = {}
for f in sorted(glob.glob(os.path.join(RAW, "liens-condo-lien-[0-9]*.json"))):
    for r in json.load(open(f))["Data"]:
        key = r.get("BookPage") or r.get("TransactionId")
        x = docs.setdefault(key, {"date": r["RecordDate"], "filers": set()})
        x["filers"].add((r.get("DirectName") or "").strip())
per = collections.defaultdict(collections.Counter)
for x in docs.values():
    for n in x["filers"]:
        if n: per[x["date"][:4]][n] += 1
def bulk(y, n): return bool(BULK_NAME.search(n)) or per[y][n] >= BULK_MIN
def tally(years, name_only=False):
    names, lien_docs = set(), collections.Counter()
    for x in docs.values():
        y = x["date"][:4]
        if y not in years: continue
        ns = [n for n in x["filers"] if n]
        if not ns or any((BULK_NAME.search(n) if name_only else bulk(y, n)) for n in ns): continue
        names.update(ns)
        lien_docs[label(sorted(ns)[0])] += 1
    c = collections.Counter(label(n) for n in names)
    return {"associations": len(names), "by_label": dict(c), "share_pct": {k: round(100 * v / len(names), 1) for k, v in c.items()},
            "master_named": sum(1 for n in names if MASTER.search(n)),
            "condo_word_and_poa_or_hoa_word": sum(1 for n in names if LABELS[0][1].search(n) and (LABELS[1][1].search(n) or LABELS[2][1].search(n))),
            "ends_inc_corporation": sum(1 for n in names if re.search(r"\bINC\b|INCORPORATED|\bCORP", n, re.I)), "lien_documents_by_label": dict(lien_docs)}
out = {"source": "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType (CONDO LIEN (064))", "method": __doc__,
       "2025": tally({"2025"}),
       "2025_any_count": tally({"2025"}, name_only=True), "2021_to_2025": tally({str(y) for y in range(2021, 2026)})}
print(json.dumps(out["2025"], indent=1)); print(json.dumps(out["2025_any_count"], indent=1)); print(json.dumps(out["2021_to_2025"], indent=1))
json.dump(out, open(os.path.join(d, "association-names.json"), "w"), indent=1)
