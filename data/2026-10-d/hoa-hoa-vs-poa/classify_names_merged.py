"""The verifier's count for /hoa/hoa-vs-poa/ ledger row 18 (VERIFY.md, correction 9): the same 2025 lien filers as
classify_names.py, with the spellings of one association's name merged (the rule of
hoa-special-assessments' dedupe_filers.py) and the misspellings HOMEOWERS, PROPRETY OWNER and PROPERTY OW put in
their bucket. A merged group takes the first label any of its spellings has, in the order condo, POA, HOA, another
association word, none. Counts only, no names. Usage: RAW=<dir> python3 -I classify_names_merged.py <this dir>.
Writes association-names-merged.json."""
import json, os, re, collections, sys
HERE = sys.argv[1]
src = open(os.path.join(HERE, "classify_names.py")).read().split("out = {")[0]
exec(src)
L2 = [("condo", LABELS[0][1]),
      ("poa", re.compile(r"PROPERTY OWNER|PROPRETY OWNER|PROPERTY OW\b|\bPOA\b|\bP O A\b", re.I)),
      ("hoa", re.compile(r"HOMEOWNER|HOMEOWER|HOME OWNER|\bHOA\b|\bH O A\b", re.I)), LABELS[3]]
def lab2(n):
    for k, rx in L2:
        if rx.search(n): return k
    return "other"
def norm(n):
    n = n.upper().replace("&", " AND ").replace("@", " AT "); n = re.sub(r"[^A-Z0-9 ]", " ", n)
    n = re.sub(r"\b(INC|INCORPORATED|THE|OF|AT|LLC|CORP|CORPORATION|CO|ASSOC|ASSN|ASSOCIATION|ASSOCIATIONS|HOMEOWNERS|HOMEOWNER|HOME|OWNERS|OWNER|PROPERTY|POA|HOA|COA|NFP|NONPROFIT|HPR|HORIZONTAL|REGIME|COUNCIL|CO OWNERS|COOWNERS)\b", " ", n)
    return re.sub(r"\s+", "", n)
names = set()
for x in docs.values():
    if x["date"][:4] != "2025": continue
    ns = [n for n in x["filers"] if n]
    if not ns or any(BULK_NAME.search(n) for n in ns): continue
    names.update(ns)
g = collections.defaultdict(set)
for n in names: g[norm(n)].add(n)
c = collections.Counter()
for v in g.values():
    ls = {lab2(n) for n in v}
    for L in ["condo", "poa", "hoa", "community", "other"]:
        if L in ls: c[L] += 1; break
tot = len(g)
inc = sum(1 for v in g.values() if any(re.search(r"\bINC\b|INCORPORATED|\bCORP", n) for n in v))
master = sum(1 for v in g.values() if any(MASTER.search(n) for n in v))
mixed = sum(1 for v in g.values() if any(LABELS[0][1].search(n) and (L2[1][1].search(n) or L2[2][1].search(n)) for n in v))
out = {"source": "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType (CONDO LIEN (064))",
       "method": __doc__, "year": 2025, "associations": tot, "by_label": dict(c),
       "share_pct": {k: round(100 * v / tot, 1) for k, v in c.items()},
       "inc_or_corp_in_a_spelling": inc, "master_named": master, "condo_word_and_poa_or_hoa_word": mixed}
json.dump(out, open(os.path.join(HERE, "association-names-merged.json"), "w"), indent=1)
print(json.dumps({k: out[k] for k in out if k not in ("method",)}))
