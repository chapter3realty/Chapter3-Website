"""Who never filed for the 4 percent rate? Horry County houses bought in 2024-2025 (and, for comparison, 2018-2019),
owned by a person (not a company), whose tax bill is mailed to the house itself, split by assessment class.
Assessment class = AssessedProp / TaxableProp: about 0.04 = legal residence (4%), about 0.06 = all other (6%).
"Mailed to the house" = the owner mailing house number and street name (suffix, direction and spacing ignored) match the county address point, and the mailing state is SC with a 295xx ZIP.
Houses only: land use 101, not a condo (no 'HPR' in the legal description), building value > 0, one address point.
Input: PRIVATE/parcels-<period>.json, PRIVATE/addresses-<period>.json (pull_parcels.py). Output: parcels-findings.json (counts and medians only).
Run: PRIVATE=<dir> python3 -I analyze_parcels.py <datadir>"""
import json, os, re, sys, statistics as st, collections, datetime
D = sys.argv[1]; P = os.environ["PRIVATE"]
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|BANK|ASSOCIATION|FUND|REIT|TRUST|TRUSTEE|TRUSTEES|TR|REVOCABLE|ESTATE|HOMES|BUILDERS?|CHURCH|AUTHORITY|COUNTY|CITY|STATE)\b")
SUF = {"STREET": "ST", "ROAD": "RD", "DRIVE": "DR", "AVENUE": "AVE", "AV": "AVE", "LANE": "LN", "COURT": "CT", "CIRCLE": "CIR", "BOULEVARD": "BLVD", "PLACE": "PL",
       "TRAIL": "TRL", "HIGHWAY": "HWY", "PARKWAY": "PKWY", "TERRACE": "TER", "WAY": "WAY", "LOOP": "LOOP", "POINT": "PT", "COVE": "CV", "NORTH": "N", "SOUTH": "S", "EAST": "E", "WEST": "W"}
def norm(s):
    s = re.sub(r"[^A-Z0-9 ]", " ", (s or "").upper())
    s = re.sub(r"\b(UNIT|APT|STE|SUITE|BLDG|#)\b.*$", "", s)
    return [SUF.get(t, t) for t in s.split()]
ORD = {"FIRST": "1ST", "SECOND": "2ND", "THIRD": "3RD", "FOURTH": "4TH", "FIFTH": "5TH", "SIXTH": "6TH", "SEVENTH": "7TH", "EIGHTH": "8TH", "NINTH": "9TH", "TENTH": "10TH",
       "ELEVENTH": "11TH", "TWELFTH": "12TH", "THIRTEENTH": "13TH", "FOURTEENTH": "14TH", "FIFTEENTH": "15TH", "SIXTEENTH": "16TH", "SEVENTEENTH": "17TH", "EIGHTEENTH": "18TH", "NINETEENTH": "19TH", "TWENTIETH": "20TH"}
DROP = {"N", "S", "E", "W", "ST", "RD", "DR", "AVE", "LN", "CT", "CIR", "BLVD", "PL", "TRL", "HWY", "PKWY", "PKY", "TER", "WAY", "LOOP", "LP", "PT", "CV", "RUN", "BND", "XING", "SQ"}
def key(num, name):
    num = re.match(r"\d+", str(num).strip()); num = num.group(0) if num else ""
    toks = [ORD.get(t, t) for t in norm(name)]
    toks = [t for t in toks if t not in DROP] or toks
    return (num, "".join(toks))
def cls(r):
    a, t = r.get("AssessedProp") or 0, r.get("TaxableProp") or 0
    if t <= 0 or a <= 0: return None
    x = a / t
    return "4%" if x < 0.05 else "6%"
out = {"method": __doc__.strip().splitlines()[0:5], "periods": {}}
for period in ("2024-2025", "2018-2019"):
    rows = json.load(open(os.path.join(P, "parcels-%s.json" % period)))["rows"]
    addrs = collections.defaultdict(list)
    for a in json.load(open(os.path.join(P, "addresses-%s.json" % period))): addrs[int(a["PIN"])].append(a)
    gaps = []; c = collections.Counter(); vals = collections.defaultdict(list); dist = collections.Counter()
    for r in rows:
        if r.get("LandUseCode") != "101" or "HPR" in (r.get("LegalDescr") or "") or not r.get("PIN"): continue
        c["houses"] += 1
        k = cls(r)
        if not k: c["no_value"] += 1; continue
        if COMPANY.search(r.get("OwnerName") or ""): c["company_or_trust"] += 1; continue
        c["person"] += 1
        A = addrs.get(int(r["PIN"]), [])
        if len(A) != 1: c["person_not_one_address"] += 1; continue
        a = A[0]
        own = norm(r.get("OwnerStreet"))
        if not own or not own[0].isdigit():
            c["person_po_box_or_no_number"] += 1; mailed = False
        else:
            mailed = key(own[0], " ".join(own[1:])) == key(a.get("StreetNum"), a.get("STREETNAME")) and (r.get("OwnerState") or "").strip() == "SC" and str(r.get("OwnerZip") or "")[:3] == "295"
        c["person_one_address"] += 1
        g = "mailed_to_house" if mailed else "mailed_elsewhere"
        c[g] += 1; c[g + "_" + k] += 1
        yr = str(datetime.datetime.utcfromtimestamp(r["SaleDate"] / 1000).year)
        c[yr + "_" + g] += 1; c[yr + "_" + g + "_" + k] += 1
        if g == "mailed_to_house" and k == "6%" and r.get("TaxDistrict") == "100":
            T = r["TaxableProp"]; gap = T * 0.06 * 201.0 / 1000 - T * 0.04 * 91.9 / 1000
            gaps.append(gap)
        vals[g + "_" + k].append(r["TaxableProp"])
        if g == "mailed_to_house" and k == "6%": dist[r.get("TaxDistrict")] += 1
    res = dict(c)
    for g in ("mailed_to_house", "mailed_elsewhere"):
        n = c[g]; s6 = c[g + "_6%"]
        res[g + "_share_6pct"] = round(s6 / n, 4) if n else None
    for yr in sorted({k.split("_")[0] for k in c if k[:2] in ("20",)}):
        n = c[yr + "_mailed_to_house"]; res[yr + "_mailed_to_house_share_6pct"] = round(c[yr + "_mailed_to_house_6%"] / n, 4) if n else None
    res["district100_mailed_to_house_6pct"] = {"n": len(gaps), "median_yearly_gap": round(st.median(gaps)) if gaps else None, "sum_yearly_gap": round(sum(gaps)),
        "rule": "gap = TaxableProp x 0.06 x 201.0/1000 - TaxableProp x 0.04 x 91.9/1000 (2026 district 100 millage, school operating 109.1 exempt at 4%)"}
    res["median_taxable"] = {k: round(st.median(v)) for k, v in vals.items()}
    res["mailed_to_house_6pct_by_tax_district_top"] = dist.most_common(12)
    out["periods"][period] = res
json.dump(out, open(os.path.join(D, "parcels-findings.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
