"""Count association papers recorded at the Horry County Register of Deeds, from the index rows pulled by pull_recorded.py.
A RESTRICTIONS (082) row counts as an association paper when a party name is an association (ASSOC, REGIME, HPR,
HORIZONTAL, COUNCIL OF CO-OWNERS, CONDO, OWNERS, POA, HOA, COMMUNITY, MASTER, CLUB) or the index description names an
association paper (rules, regulations, bylaws, declaration, policy, guidelines, fines, amendment, supplement).
Stormwater maintenance agreements, county and housing-program covenants and plain lot covenants filed by a person or
a business with no association paper word are left out. Each kept row gets one kind from its description:
rules and policies, bylaws, amendment, declaration. AMENDMENT DEED BOOK (069) rows are counted when the description
says MASTER DEED or DECLARATION (an amendment to a condo master deed or an HOA declaration).
Usage: RAW=<dir with the monthly pulls> python3 -I analyze_recorded.py <outdir>
Writes <outdir>/recorded-by-year.json (counts only, no names)."""
import sys, os, re, json, glob, collections
out = sys.argv[1]; RAW = os.environ["RAW"]
ASSOC = re.compile(r"ASSOC|REGIME|\bHPR\b|HORIZONTAL|COUNCIL OF CO|CONDO|OWNERS|\bPOA\b|\bHOA\b|COMMUNITY|MASTER|\bCLUB\b", re.I)
PAPER = re.compile(r"RULE|REGULATION|BY ?-?LAW|DECLARATION|POLIC|GUIDELINE|FINE|AMEND|SUPPLEMENT|HOA ACT|COLLECTION|ARCHITECTURAL|DESIGN REVIEW", re.I)
EXCL = re.compile(r"STORMWATER|AGREEMENT AS TO RESTRICTIVE|AGREEMENT AS TO RESTRICTIVE CONVENANT|LAND USE RESTRICTIVE|OWNER OCCUPIED HOUSING|DEED RESTRICTION AGREEMENT|RESTRICTIVE USE COVENANT|CONSERVATION", re.I)
def kind(c):
    c = c.upper()
    if re.search(r"AMEND|RESTATE", c): return "amendment"
    if re.search(r"BY ?-?LAW", c): return "bylaws"
    if re.search(r"RULE|REGULATION|POLIC|GUIDELINE|FINE|HOA ACT|COLLECTION|ARCHITECTURAL|DESIGN REVIEW", c): return "rules and policies"
    return "declaration"
years = collections.defaultdict(lambda: collections.Counter()); months = collections.Counter(); jan = collections.Counter()
last12 = collections.Counter(); assoc12 = set(); words12 = collections.Counter()
WORDS = {"rent or lease": r"RENT|LEAS", "short-term": r"SHORT ?-?TERM", "pet": r"\bPETS?\b", "parking": r"PARKING", "fine": r"\bFINES?\b", "collection or delinquency": r"COLLECTION|DELINQUEN", "architectural": r"ARCHITECT|DESIGN"}; excluded = collections.Counter(); dm = collections.Counter()
for f in sorted(glob.glob(os.path.join(RAW, "restrictions-*.json"))):
    ym = f[-12:-5]; y, m = int(ym[:4]), int(ym[5:])
    for r in json.load(open(f))["Data"]:
        c = (r.get("Comments") or "").strip(); names = (r.get("DirectName") or "") + " | " + (r.get("IndirectName") or "")
        if EXCL.search(c): excluded["excluded by description"] += 1; continue
        if not (ASSOC.search(names) or PAPER.search(c)): excluded["no association name or paper word"] += 1; continue
        k = kind(c); years[y][k] += 1; years[y]["all"] += 1; months[ym] += 1
        if m == 1: jan[y] += 1
        if "2025-11" <= ym <= "2026-10":
            last12[k] += 1; last12["all"] += 1
            for w, rx in WORDS.items():
                if re.search(rx, c.upper()): words12[w] += 1
            if ASSOC.search(r.get("DirectName") or ""): assoc12.add(re.sub(r"[^A-Z0-9]", "", (r.get("DirectName") or "").upper()))
for f in sorted(glob.glob(os.path.join(RAW, "amendment-deed-book-*.json"))):
    ym = f[-12:-5]; y = int(ym[:4])
    for r in json.load(open(f))["Data"]:
        c = (r.get("Comments") or "").upper()
        if re.search(r"MASTER DEED|DECLARATION", c):
            dm[y] += 1
            if "2025-11" <= ym <= "2026-10": last12["amendment (amendment deed book)"] += 1
res = {"source": "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType (RESTRICTIONS 082; AMENDMENT DEED BOOK 069)",
       "method": __doc__.split("Usage")[0].strip(),
       "by_year": {y: dict(years[y]) for y in sorted(years)},
       "january_by_year": {y: jan[y] for y in sorted(years)},
       "january_share_pct": {y: round(100 * jan[y] / years[y]["all"], 1) for y in sorted(years) if years[y]["all"]},
       "amendment_deed_book_master_deed_or_declaration_by_year": {y: dm[y] for y in sorted(dm)},
       "last_12_months_2025-11_to_2026-10": dict(last12),
       "distinct_association_filers_last_12_months": len(assoc12),
       "description_words_last_12_months (index description only; most descriptions name no subject)": dict(words12),
       "excluded_rows": dict(excluded),
       "by_month": dict(sorted(months.items()))}
json.dump(res, open(os.path.join(out, "recorded-by-year.json"), "w"), indent=1)
for y in sorted(years): print(y, dict(years[y]), "jan", jan[y], "dm", dm[y])
print("last12", dict(last12), "filers", len(assoc12), "words", dict(words12)); print("excluded", dict(excluded))
