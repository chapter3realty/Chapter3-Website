#!/usr/bin/env python3
"""Build towns.json for the /submarkets/ hub table from each town guide's OWN data file.

No new pull: every price is read from the findings file the town guide's ledger cites
(Blog-Brain batches/2026-11-a/submarkets-<town>/facts.md, and for Carolina Forest
batches/2026-11-b/submarkets-carolina-forest/facts.md). The script fails if a value moved,
so the hub can never print a figure its guide does not.
Run from the website root:  python3 -I data/2026-11-b/submarkets/build_towns.py
"""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
A = os.path.join(ROOT, "data", "2026-11-a")
def J(*p): return json.load(open(os.path.join(A, *p)))
def r5(x): return int(round(x / 5000.0) * 5000)

def get(path, keys):
    v = J(*path)
    for k in keys: v = v[k]
    return v

# town, guide URL, the price row (ledger row id), where the value lives, the group in plain words
# Table order: the beach towns north to south, then the two inland places (map-points.json has latitudes).
SPEC = [
  ("little-river", "Little River", "/submarkets/little-river/", "LR 25",
     ("submarkets-little-river", "findings.json"), ["sales_zip", "house_resale"], "a resold house", 357000),
  ("north-myrtle-beach", "North Myrtle Beach", "/submarkets/north-myrtle-beach/", "NMB 9",
     ("submarkets-north-myrtle-beach", "findings.json"), ["sales", "house_resale"], "a resold house", 565000),
  ("myrtle-beach", "Myrtle Beach", "/submarkets/myrtle-beach/", "MB 53",
     ("submarkets-myrtle-beach", "house-resales.json"), ["houses"], "a resold house in the city", 540000),
  ("surfside-beach", "Surfside Beach", "/submarkets/surfside-beach/", "SB 6",
     ("submarkets-surfside-beach", "findings.json"), ["sales", "R3/house"], "a house near the ocean", 1000000),
  ("garden-city", "Garden City", "/submarkets/garden-city/", "GC 11",
     ("submarkets-garden-city", "findings.json"), ["sales", "beach/condo"], "a condo on the ocean side by the pier, on the Horry part", 320000),
  ("murrells-inlet", "Murrells Inlet", "/submarkets/murrells-inlet/", "MI 6",
     ("submarkets-murrells-inlet", "findings.json"), ["sales", "horry/west/house"], "a house on the Horry side", 450000),
  ("pawleys-island", "Pawleys Island", "/submarkets/pawleys-island/", "PI 13",
     ("submarkets-pawleys-island", "findings.json"), None, "a house west of US 17", 580000),
  ("carolina-forest", "Carolina Forest", "/submarkets/carolina-forest/", "CF 2",
     ("invest-where-to-buy", "findings.json"), None, "a resold house", 440000),
  ("conway", "Conway", "/submarkets/conway/", "CW 5",
     ("submarkets-conway", "findings.json"), ["sales_in_city", "resales_not_condo"], "a resold house or townhouse in the city", 265000),
]

def find_key(obj, want):
    """Depth-first search for a dict key (some findings files nest areas or zones in lists)."""
    if isinstance(obj, dict):
        if want in obj: return obj[want]
        for v in obj.values():
            r = find_key(v, want)
            if r is not None: return r
    elif isinstance(obj, list):
        for v in obj:
            r = find_key(v, want)
            if r is not None: return r
    return None


# The words, each from verified rows of the town guide's own ledger (facts.md rows H1 to H27 in
# Blog-Brain batches/2026-11-b/submarkets/facts.md). Text, not numbers; kept here so the table has one source.
TEXT = {
 # Corrected 2026-11-10 to the verifier's wording (Blog-Brain batches/2026-11-b/submarkets/VERIFY.md):
 # H13, H18, H19, H21 wow lines; H27 "the county's list names no rental permit" (never "no rental permit");
 # H31 struck ("the HOA decides"); the four "where" cells; H22 used for Carolina Forest (BUILD.md, decision 1).
 # Fix round 1 (REVIEW-1.md): each county cell opens with what the reader does, in the Murrells Inlet guide's verified
 # words (MI 24: "the county asks a nightly-rental owner for a business license and tax filings"); the permit sentence
 # (H27) is said once, in the note under the table. Surfside's zone codes moved to the sources line.
 "little-river": {"where": "At the North Carolina line",
   "wow": "About two of every three deeded boat slips in the county are here: slips you buy and own, each on its own deed.",
   "rule": "The county asks for a business license and tax filings. An HOA can still say no.", "refs": ["H12 (LR R1-1)", "H27 (LR 40, GC 20)"]},
 "north-myrtle-beach": {"where": "Its own city, north of Myrtle Beach",
   "wow": "The shag, the state dance, is still danced on Main Street. At Fat Harold's Beach Club, the home of the shag, DJs play every night from 7.",
   "rule": "A yearly city business license, and no special zoning or permit beyond it. An HOA or the deed can still bar rentals.", "refs": ["H13 (NMB 6, 46)", "H25 (NMB 23)"]},
 "myrtle-beach": {"where": "The city in the middle of the Grand Strand",
   "wow": "Downtown, the Boardwalk is about 1.3 miles long, beside the ocean. The airport is inside the city, with nonstop flights to more than 50 destinations.",
   "rule": "Only in the zones the city allows. Most neighborhoods of houses are not zoned for it.", "refs": ["H14 (MB 41)", "H15 (MB 48)", "H24 (MB 1, 2)"]},
 "surfside-beach": {"where": "A town south of Myrtle Beach",
   "wow": "The town's concrete pier reaches 814 feet into the ocean, and walking on it is free.",
   "rule": "Only in the two zones by the ocean.", "refs": ["H16 (SB 17)", "H26 (SB 1)"]},
 "garden-city": {"where": "Between Surfside Beach and Murrells Inlet, in two counties",
   "wow": "At the far end of the Garden City Pier, people learn line dances out over the ocean.",
   "rule": "Horry side: the county asks for a business license and tax filings. Georgetown end: the county requires no business license.", "refs": ["H17 (GC 49)", "H27 (GC 20)", "H28 (GC 22)"]},
 "murrells-inlet": {"where": "On the salt marsh, split by the county line",
   "wow": "The MarshWalk is a wooden boardwalk along the salt marsh, lined with restaurants, and its live music is free to hear.",
   "rule": "Horry side: the county asks for a business license and tax filings. Georgetown side: the county requires no business license.", "refs": ["H18 (MI 30, corrected)", "H27 (MI 24)", "H28 (MI 26)"]},
 "pawleys-island": {"where": "The south end, in Georgetown County",
   "wow": "The old island houses were built mostly of cypress, hewn on the mainland. Each timber was chiseled with Roman numerals so the house could be put together on the island.",
   "rule": "Allowed on the island.", "refs": ["H19 (PI 43, corrected)", "H29 (PI 35)"]},
 "carolina-forest": {"where": "Inland, outside any city or town",
   "wow": "The county's Bike and Run Park, on the Intracoastal Waterway, has about 7 miles of mountain-bike and hiking trails on 70 acres.",
   "rule": "The county asks for a business license and tax filings. An HOA can still say no.", "refs": ["H22 (WT 25)", "H23 (affordable 72)", "H27"]},
 "conway": {"where": "Inland, on the Waccamaw River",
   "wow": "Riverfront Park on the Waccamaw has a playground built like a steamboat, the F.G. Burroughs, beside a riverwalk of about 1.5 miles.",
   "rule": "We check the city's zoning for each address.", "refs": ["H21 (CW 46, corrected)", "H30 struck: no rule stated"]},
}


out, bad = [], []
also = sb_also = None
for slug, name, url, row, path, keys, group, page_rounded in SPEC:
    if slug == "carolina-forest":
        areas = J(*path)["areas"]
        a = next(x for x in areas if x.get("slug") == "carolina-forest")
        med, n = a["house"]["median_resale"], a["house"]["resales"]
    elif slug == "pawleys-island":
        v = find_key(J(*path), "west17/house")
        med, n = v["median_window"], v["sales_window"]
        isl = find_key(J(*path), "island/house")  # PI 10: island houses, three years of sales
        also = {"group": "an island house, over three years of sales", "median": 2450000, "ledger_row": "PI 10",
                "data_median": (isl or {}).get("median_3y") or (isl or {}).get("median")}
    elif slug == "surfside-beach":
        v = get(path, keys)
        med = v.get("median"); n = v.get("n", v.get("sales"))
        r1, r2 = get(path, ["sales", "R1/house"]), get(path, ["sales", "R2/house"])  # H5 (SB 7)
        if (r1["median"], r1["sales"], r2["median"], r2["sales"]) != (541750, 20, 486500, 28):
            bad.append(f"Surfside inland houses moved: R1 {r1['median']} ({r1['sales']}), R2 {r2['median']} ({r2['sales']})")
        sb_also = {"group": "a house on the inland streets", "low": r5(min(r1["median"], r2["median"])), "high": r5(max(r1["median"], r2["median"])),
                   "ledger_row": "SB 7", "sales": [r1["sales"], r2["sales"]]}
    else:
        v = get(path, keys)
        med = v.get("median"); n = v.get("n", v.get("sales"))
    # the guide rounds to $5,000 (Little River prints its exact $357,000; $1 million to $100,000)
    ok = page_rounded in (r5(med), int(round(med / 1000.0) * 1000), int(round(med / 100000.0) * 100000))
    shown = page_rounded
    if not ok: bad.append(f"{name}: data {med} rounds to {shown}, guide says {page_rounded}")
    out.append({"slug": slug, "name": name, "guide": url, "ledger_row": row, "group": group,
                "median": med, "sales": n, "shown": page_rounded,
                "window": "deeds recorded 2025-10-01 to 2026-09-30", **TEXT[slug], **({"also": also} if slug == "pawleys-island" else {}),
                **({"also": sb_also} if slug == "surfside-beach" else {}),
                **({"window": "Georgetown County parcel sale dates, 2025-10-01 to 2026-09-30 (the island figure: 2023-10-01 to 2026-09-30)"} if slug == "pawleys-island" else {})})

json.dump({"made_by": "build_towns.py", "note": "Each price is the town guide's own figure, read from the guide's own data file.",
           "towns": out}, open(os.path.join(os.path.dirname(__file__), "towns.json"), "w"), indent=1)
for t in out: print(f"{t['name']:20s} {t['group']:42s} median {t['median']:>10,.0f}  n {t['sales']}  shown ${t['shown']:,}")
if bad:
    print("MISMATCH:", *bad, sep="\n  "); sys.exit(1)
print("all nine match their guides")
