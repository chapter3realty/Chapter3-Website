"""Count association papers about renting recorded at the Horry County Register of Deeds, 2012-01 to 2026-10.
Reads the monthly index pulls made by data/2026-11-a/hoa-documents/pull_recorded.py (RESTRICTIONS 082 and
AMENDMENT DEED BOOK 069; the RAW files carry party names and stay out of the repo).
A row counts when (1) it is an association paper by the hoa-documents rule (an association party name, or a paper
word in the description, and not a stormwater, housing-program or conservation covenant), and (2) its index
description names renting: RENT, LEAS, TENANT, SHORT TERM, TRANSIENT, AIRBNB, OCCUPAN.
Commercial lease papers are dropped: MORTGAGE, ASSIGNMENT OF (LEASES|RENTS), MEMORANDUM OF LEASE, LEASE AMENDMENT
AGREEMENT, GROUND LEASE, RENTAL HOUSING. The index description is a clerk's short title; most papers name no subject,
so every count is a floor ("at least").
Usage: RAW=<dir> python3 -I count_rental_papers.py <outdir>
Writes <outdir>/rental-papers.json (counts by year and kind; association names only, which are public filers)."""
import sys, os, re, json, glob, collections
out = sys.argv[1]; RAW = os.environ["RAW"]
ASSOC = re.compile(r"ASSOC|REGIME|\bHPR\b|HORIZONTAL|COUNCIL OF CO|CONDO|OWNERS|\bPOA\b|\bHOA\b|COMMUNITY|MASTER|\bCLUB\b", re.I)
PAPER = re.compile(r"RULE|REGULATION|BY ?-?LAW|DECLARATION|POLIC|GUIDELINE|FINE|AMEND|SUPPLEMENT|HOA ACT|COLLECTION|ARCHITECTURAL|DESIGN REVIEW|MASTER DEED", re.I)
EXCL = re.compile(r"STORMWATER|AGREEMENT AS TO RESTRICTIVE|LAND USE RESTRICTIVE|OWNER OCCUPIED HOUSING|DEED RESTRICTION AGREEMENT|RESTRICTIVE USE COVENANT|CONSERVATION", re.I)
RENT = re.compile(r"\bRENT|RENTAL|RENTES|RENTERS|\bLEAS|TENANT|SHORT ?-?TERM|TRANSIENT|AIRBNB|OCCUPAN", re.I)
COMM = re.compile(r"MORTGAGE|ASSIGNMENT OF (LEASES|RENTS)|MEMORANDUM OF (GROUND )?LEASE|LEASE AMENDMENT AGREEMENT|GROUND LEASE|RENTAL HOUSING|SUBLEASE|OPTION|ANTENNA|SECURITY AGREEMENT", re.I)
def kind(c):
    c = c.upper()
    if re.search(r"AMEND|RESTATE|MASTER DEED", c) and not re.search(r"^RULES", c): return "amendment to the declaration or master deed"
    return "rules or policy"
def subject(c):
    c = c.upper()
    if re.search(r"SHORT ?-?TERM|TRANSIENT|AIRBNB", c): return "short-term"
    if re.search(r"LEAS", c): return "leasing"
    if re.search(r"RENT|TENANT", c): return "rental or renters"
    return "occupancy"
by_year = collections.defaultdict(collections.Counter); rows = []
for pat, dtype in (("restrictions-*.json", "RESTRICTIONS (082)"), ("amendment-deed-book-*.json", "AMENDMENT DEED BOOK (069)")):
    for f in sorted(glob.glob(os.path.join(RAW, pat))):
        for r in json.load(open(f))["Data"]:
            c = (r.get("Comments") or "").strip(); dn = r.get("DirectName") or ""; ind = r.get("IndirectName") or ""
            if EXCL.search(c) or COMM.search(c) or not RENT.search(c): continue
            if not (ASSOC.search(dn + " | " + ind) or PAPER.search(c)): continue
            if dtype.startswith("AMENDMENT") and not re.search(r"MASTER DEED|DECLARATION|COVENANT|RESTRICTION|BY ?-?LAW|RULE", c, re.I): continue
            y = r["RecordDate"][:4]; k = kind(c)
            by_year[y]["all"] += 1; by_year[y][k] += 1; by_year[y][subject(c)] += 1
            filer = dn if ASSOC.search(dn) else (ind if ASSOC.search(ind) else "(not an association name)")
            rows.append({"recorded": r["RecordDate"], "doc_type": dtype, "association": filer, "description": c,
                         "book_page": r["BookPage"], "kind": k, "subject": subject(c),
                         "open": "https://acclaimweb.horrycounty.org/AcclaimWeb/details/JumpToBookPage/1/" + r["BookPage"].replace("/", "/")})
rows.sort(key=lambda x: x["recorded"])
last12 = [x for x in rows if "2025/11" <= x["recorded"][:7] <= "2026/10"]
res = {"source": "Horry County Register of Deeds index (AcclaimWeb), doc types RESTRICTIONS (082) and AMENDMENT DEED BOOK (069), pulled 2026-11-04 by data/2026-11-a/hoa-documents/pull_recorded.py",
       "method": __doc__.split("Usage")[0].strip(),
       "by_year": {y: dict(by_year[y]) for y in sorted(by_year)},
       "total_2012_to_2026_10": len(rows), "last_12_months_2025_11_to_2026_10": len(last12),
       "distinct_associations": len({x["association"] for x in rows}),
       "rows": rows}
json.dump(res, open(os.path.join(out, "rental-papers.json"), "w"), indent=1)
for y in sorted(by_year): print(y, dict(by_year[y]))
print("total", len(rows), "last12", len(last12), "assocs", res["distinct_associations"])
