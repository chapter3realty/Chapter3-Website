"""Thirteen Grand Strand places for a mover choosing where to live: detached houses only, from public records and the
CRM's houses for sale counted in aggregate. Reuses the polygons, parcel pulls, flood layers and deed file of
/invest/where-to-buy/ (data/2026-11-a/invest-where-to-buy/analyze.py), so its 11 areas give the same house figures.
Adds Loris (ZIP code area 29569) and Aynor (ZIP code area 29511), lot size, legal-residence share of houses,
houses for sale by what a mover asks for, and the yearly cost of the middle house as the owner's home.

Run: RAW=<where-to-buy scratch raw> RAW2=<this page's scratch raw> python3 -I analyze.py <this data dir>
Inputs
- RAW/horry-homes.json, RAW/horry-points.json, RAW/horry-sfha.json, RAW/gt-homes.json, RAW/gt-flood.geojson (where-to-buy pulls, 2026-11-02)
- RAW2/horry-house-acreage.json (fetch_acreage.py), RAW2/gt-area.json (fetch_gt_area.py), RAW2/house-features.json (pull_features.py)
- ../invest-where-to-buy/raw/places.json, zctas.json, counties.json (Census TIGERweb)
- ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (Horry deeds recorded 2025-10-01 to 2026-09-30)
- ../buyers-cost-to-own/hoa-by-area.json, hoa-extra.json (CRM HOA fee by ZIP); ../buyers-cost-to-own/examples.json (insurance, upkeep)
- raw/acs/*.json (pull_acs.sh)
House = Horry land use 100, 101, 102, 110 or 126 and not a horizontal property regime; Georgetown land use ending 100, 101 or 500.
Lot: Horry Acreage field (the county's), or the parcel shape area / 43,560 when Acreage is 0 or empty; Georgetown Shape__Area / 43,560
(its TotalLandArea field reads 1.0 on most lots).
"""
import json, os, sys, statistics, collections, datetime
from shapely.geometry import shape, Point, Polygon
from shapely.strtree import STRtree
D = sys.argv[1]; RAW = os.environ["RAW"]; RAW2 = os.environ["RAW2"]
J = lambda p: json.load(open(p))
WTB = os.path.join(D, "../invest-where-to-buy")
def rings_to_poly(rings):
    out = None
    for r in rings:
        if len(r) < 4: continue
        p = Polygon(r).buffer(0); out = p if out is None else out.symmetric_difference(p)
    return out
places = {p["name"]: rings_to_poly(p["rings"]) for p in J(os.path.join(WTB, "raw/places.json"))["places"]}
zctas = {z["zcta"]: rings_to_poly(z["rings"]) for z in J(os.path.join(WTB, "raw/zctas.json"))["zctas"]}
cty = {c["name"]: rings_to_poly(c["rings"]) for c in J(os.path.join(WTB, "raw/counties.json"))["counties"]}
# north to south
AREAS = [
  ("loris", "Loris", zctas["29569"]),
  ("aynor", "Aynor", zctas["29511"]),
  ("longs", "Longs", zctas["29568"].difference(places["North Myrtle Beach city"])),
  ("little-river", "Little River", places["Little River CDP"]),
  ("conway", "Conway", places["Conway city"]),
  ("north-myrtle-beach", "North Myrtle Beach", places["North Myrtle Beach city"]),
  ("carolina-forest", "Carolina Forest", places["Carolina Forest CDP"]),
  ("myrtle-beach", "Myrtle Beach", places["Myrtle Beach city"]),
  ("socastee", "Socastee", places["Socastee CDP"]),
  ("surfside-beach", "Surfside Beach", places["Surfside Beach town"]),
  ("garden-city", "Garden City", places["Garden City CDP"]),
  ("murrells-inlet", "Murrells Inlet", places["Murrells Inlet CDP"]),
  ("pawleys-litchfield", "Pawleys Island and Litchfield", zctas["29585"]),
]
tree = STRtree([a[2] for a in AREAS])
def area_of(x, y):
    if not x: return None
    for i in tree.query(Point(x, y), predicate="within"): return AREAS[i][0]
    return None
GT = cty["Georgetown County"]
def med(v): return round(statistics.median(v)) if v else None
def qt(v, k): return round(statistics.quantiles(v, n=4)[k]) if len(v) >= 4 else None
HOUSE = {"100", "101", "102", "110", "126"}
# --- Horry ---
H = J(os.path.join(RAW, "horry-homes.json")); HP = J(os.path.join(RAW, "horry-points.json"))
sf = J(os.path.join(RAW, "horry-sfha.json"))["features"]
sfp = [rings_to_poly(f["rings"]) for f in sf]; sft = STRtree(sfp)
def in_sfha(x, y): return len(sft.query(Point(x, y), predicate="within")) > 0
AC = {str(r[0]).zfill(11): r for r in J(os.path.join(RAW2, "horry-house-acreage.json"))["rows"]}
st = collections.defaultdict(collections.Counter); lots = collections.defaultdict(list); pinkind = {}; pinpt = {}; dists = collections.defaultdict(collections.Counter)
for r in H["rows"]:
    pin, lu, td, ap, tp, mp, ostate, sd, hpr, _, _ = r
    p11 = str(pin).zfill(11); x, y = HP.get(str(pin), (None, None))
    kind = "condo" if (lu == "107" or hpr) else ("house" if lu in HOUSE else "other")
    pinkind[p11] = kind; pinpt[p11] = (x, y)
    if kind != "house": continue
    a = area_of(x, y)
    if not a or not tp: continue
    c = st[a]; c["houses"] += 1; c["legal_res"] += ap < 0.05 * tp; c["sfha"] += in_sfha(x, y); c["horry"] += 1
    dists[a][str(td)] += 1
    ac = AC.get(p11)
    if ac:
        acres = ac[2] if ac[2] else (ac[3] / 43560 if ac[3] else None)
        if acres: lots[a].append(acres)
# --- Georgetown ---
G = J(os.path.join(RAW, "gt-homes.json")); GA = {r[0]: (r[3] / 43560 if r[3] else None) for r in J(os.path.join(RAW2, "gt-area.json"))["rows"]}   # Shape__Area, sq ft
gfl = [shape(f["geometry"]) for f in J(os.path.join(RAW, "gt-flood.geojson"))["features"] if f.get("geometry") and f["properties"].get("SFHA_TF") == "T"]
gtree = STRtree(gfl)
gsales = collections.defaultdict(list)
for tms, lu, ostate, sd, sp, legal, x, y in G["rows"]:
    lu = lu or ""
    if lu[1:] not in ("100", "101", "500"): continue
    pt = Point(x, y)
    if not GT.contains(pt): continue
    a = area_of(x, y)
    if not a: continue
    c = st[a]; c["houses"] += 1; c["legal_res"] += lu[:1] == "Q"; c["sfha"] += len(gtree.query(pt, predicate="within")) > 0; c["georgetown"] += 1
    if GA.get(tms): lots[a].append(GA[tms])
    d = datetime.datetime.fromtimestamp(sd / 1000, datetime.timezone.utc).date().isoformat() if sd else None
    if d and "2025-10-01" <= d <= "2026-09-30" and (sp or 0) >= 10000: gsales[a].append(sp)
# --- Horry deeds ---
hs = collections.defaultdict(list); hb = collections.Counter()
for s in J(os.path.join(D, "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"]:
    k = "condo" if s["condo"] else pinkind.get(s["pin"], "other")
    if k != "house": continue
    x, y = (s.get("lon"), s.get("lat")) if s.get("lon") else pinpt.get(s["pin"], (None, None))
    a = area_of(x, y)
    if not a: continue
    if s["builder"]: hb[a] += 1; continue
    hs[a].append(s["cons"])
# --- houses for sale, by what a mover asks for ---
FP = os.path.join(RAW2, "house-features.json")
F = J(FP) if os.path.exists(FP) else {"sets": {"all": {}}, "pulled": None, "api_totals": {}, "truncated": []}
feat = collections.defaultdict(collections.Counter); askp = collections.defaultdict(list)
for name, pins in F["sets"].items():
    for mls, (price, lat, lng) in pins.items():
        a = area_of(lng, lat)
        if not a: continue
        feat[a][name] += 1
        if name == "all" and price: askp[a].append(price)
# --- HOA by ZIP, ACS year built ---
hoa = J(os.path.join(D, "../buyers-cost-to-own/hoa-by-area.json"))["areas"]
for z, v in J(os.path.join(D, "hoa-extra.json"))["areas"].items(): hoa[z] = v
for z, a in hoa.items():   # the cost-to-own correction: a $0 median prints as $0
    r = a.get("house")
    if r and "no_hoa" in r and r["no_hoa"] >= r["listings"] * .5: r["median"] = 0
def acs(geo):
    out = {}
    for t in ("B25034", "B25035"):
        r = J(os.path.join(D, f"raw/acs/ACSDT5Y2024.{t}-{geo}.json"))["response"]["data"]; out.update(dict(zip(r[0], r[1])))
    tot = int(out["B25034_001E"]); since2010 = int(out["B25034_002E"]) + int(out["B25034_003E"]); pre1980 = sum(int(out[f"B25034_{i:03d}E"]) for i in range(7, 12))
    return {"name": out["NAME"], "geo": geo, "units": tot, "median_year_built": int(out["B25035_001E"]), "pct_built_2010_or_later": round(100 * since2010 / tot, 1), "pct_built_before_1980": round(100 * pre1980 / tot, 1)}
GEO = {"myrtle-beach": "1600000US4549075", "north-myrtle-beach": "1600000US4551280", "surfside-beach": "1600000US4570585", "garden-city": "1600000US4528455",
       "murrells-inlet": "1600000US4548985", "pawleys-litchfield": "860Z200US29585", "carolina-forest": "1600000US4511833", "socastee": "1600000US4567390",
       "conway": "1600000US4516405", "little-river": "1600000US4542010", "longs": "860Z200US29568", "loris": "860Z200US29569", "aynor": "860Z200US29511"}
ZIP = {"myrtle-beach": "29577", "north-myrtle-beach": "29582", "surfside-beach": "29575", "garden-city": "29576", "murrells-inlet": "29576", "pawleys-litchfield": "29585",
       "carolina-forest": "29579", "socastee": "29588", "conway": "29526", "little-river": "29566", "longs": "29568", "loris": "29569", "aynor": "29511"}
# Tax as the owner's home (4 percent), the site's model (/buyers/cost-to-own/ build_examples.py): Horry 4% x (levy - 109.1 school
# operating mills), less the Myrtle Beach credit (53.4% of its 83.4 mills); Georgetown 4% x the calculator's legal-residence millage.
# Flat fee on the bill: Horry unincorporated stormwater $89.40; Surfside Beach $82.00; Georgetown stormwater + household $96 (district 4 and 41).
TAX = {"myrtle-beach": ("h", 254.6, 83.4, 0.0), "north-myrtle-beach": ("h", 221.2, 0, 0.0), "surfside-beach": ("h", 214.2, 0, 82.0), "conway": ("h", 272.5, 0, 0.0),
       "garden-city": ("h", 207.3, 0, 89.40), "carolina-forest": ("h", 201.0, 0, 89.40), "socastee": ("h", 201.0, 0, 89.40), "little-river": ("h", 201.0, 0, 89.40),
       "longs": ("h", 201.0, 0, 89.40), "loris": ("h", 201.0, 0, 89.40), "aynor": ("h", 201.0, 0, 89.40),
       "murrells-inlet": ("g", 128.9, 0, 96.0), "pawleys-litchfield": ("g", 114.0, 0, 96.0)}
def tax4(v, slug):
    c, levy, city, fee = TAX[slug]
    t = v * 0.04 * levy / 1000 if c == "g" else v * 0.04 * (levy - 109.1) / 1000 - v * 0.04 * city / 1000 * 0.534
    return round(t), fee
ex = J(os.path.join(D, "../buyers-cost-to-own/examples.json"))
INS = ex["houses"][0]["insurance"]; UPKEEP = ex["houses"][0]["upkeep"]
out = {"made": "analyze.py", "insurance_yearly_middle": INS, "upkeep_yearly": UPKEEP, "listings_pulled": F["pulled"], "listing_api_totals": F["api_totals"], "listing_truncated": len(F["truncated"]), "areas": []}
for slug, name, poly in AREAS:
    c = st[slug]; sales = hs[slug] + gsales[slug]; L = lots[slug]; f = feat[slug]
    m = med(sales); t, fee = tax4(m, slug) if m else (None, None)
    z = ZIP[slug]; hz = hoa.get(z, {}).get("house", {})
    hoa_y = (hz.get("median") or 0) * 12 if hz.get("listings", 0) >= 20 else None
    row = {"slug": slug, "name": name, "sq_mi": round(poly.area * (69.0 * 69.0 * 0.836), 1),
           "houses": c["houses"], "horry_houses": c["horry"], "georgetown_houses": c["georgetown"],
           "pct_legal_residence": round(100 * c["legal_res"] / c["houses"], 1) if c["houses"] else None,
           "pct_high_risk_flood": round(100 * c["sfha"] / c["houses"], 1) if c["houses"] else None,
           "top_tax_districts": dists[slug].most_common(4),
           "sales": len(sales), "horry_resales": len(hs[slug]), "georgetown_sales": len(gsales[slug]), "builder_sales_horry": hb[slug],
           "median_sale": m, "p25": qt(sales, 0), "p75": qt(sales, 2),
           "lots": len(L), "median_lot_acres": round(statistics.median(L), 2) if L else None, "pct_lot_half_acre_plus": round(100 * sum(a >= 0.5 for a in L) / len(L), 1) if L else None,
           "pct_lot_acre_plus": round(100 * sum(a >= 1 for a in L) / len(L), 1) if L else None,
           "for_sale": dict(f), "median_ask": med(askp[slug]),
           "pct_for_sale": {k: round(100 * v / f["all"], 1) for k, v in f.items() if f["all"]},
           "acs": acs(GEO[slug]), "hoa_zip": z, "hoa_house": hz,
           "tax_legal_residence_median_house": t, "fee_on_bill": fee, "hoa_yearly_middle": hoa_y}
    if m and hoa_y is not None:
        row["yearly_besides_mortgage"] = {"tax": t, "fee": fee, "insurance": INS, "hoa": hoa_y, "upkeep": UPKEEP, "total": round(t + fee + INS + hoa_y + UPKEEP)}
    out["areas"].append(row)
    print(f"{slug:20} houses {c['houses']:6} sales {len(sales):4} med {m} lot {row['median_lot_acres']} 1ac {row['pct_lot_acre_plus']} lr {row['pct_legal_residence']} fl {row['pct_high_risk_flood']} sale {f['all']} beach {f['beach_1mi']} nohoa {f['no_hoa']} new {f['new_construction']} acre {f['acre_lot']} rv {f['rv_boat_parking']} tot {row.get('yearly_besides_mortgage',{}).get('total')} td {dists[slug].most_common(2)}", flush=True)
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
# --- one row per place for the page's table, charts and filter (north to south), joined with drives-houses.json ---
from shapely.geometry import mapping
DV = os.path.join(D, "drives-houses.json")
dv = J(DV)["areas"] if os.path.exists(DV) else {}
GOV = {"loris": "ZIP 29569: the City of Loris and the county around it", "aynor": "ZIP 29511: the Town of Aynor and the county around it",
       "longs": "unincorporated Horry County", "little-river": "unincorporated Horry County", "conway": "City of Conway",
       "north-myrtle-beach": "City of North Myrtle Beach", "carolina-forest": "unincorporated Horry County", "myrtle-beach": "City of Myrtle Beach",
       "socastee": "unincorporated Horry County", "surfside-beach": "Town of Surfside Beach", "garden-city": "unincorporated Horry County",
       "murrells-inlet": "unincorporated Georgetown County", "pawleys-litchfield": "Town of Pawleys Island (the island) and unincorporated Georgetown County"}
rows = []
for a in out["areas"]:
    s = a["slug"]; b = a["builder_sales_horry"]; r = a["horry_resales"]; f = a["for_sale"]; v = dv.get(s, {})
    rows.append({"slug": s, "name": a["name"], "governed_by": GOV[s], "houses": a["houses"], "median_sale": a["median_sale"], "sales": a["sales"],
                 "p25": a["p25"], "p75": a["p75"], "builder_share_pct": round(100 * b / (b + r), 1) if a["horry_houses"] and (b + r) else None,
                 "yearly_besides_mortgage": a.get("yearly_besides_mortgage", {}).get("total"), "tax_legal_residence": a["tax_legal_residence_median_house"],
                 "median_lot_acres": a["median_lot_acres"], "pct_lot_acre_plus": a["pct_lot_acre_plus"], "pct_legal_residence": a["pct_legal_residence"],
                 "pct_high_risk_flood": a["pct_high_risk_flood"], "median_year_built_all_homes": a["acs"]["median_year_built"],
                 "pct_homes_built_2010_on": a["acs"]["pct_built_2010_or_later"], "hoa_middle_month": a["hoa_house"].get("median"),
                 "minutes_beach": (v.get("beach") or {}).get("median"), "minutes_hospital": (v.get("hospital") or {}).get("median"),
                 "minutes_airport": (v.get("airport") or {}).get("median"), "minutes_mall": (v.get("mall") or {}).get("median"),
                 "for_sale": f.get("all", 0), "for_sale_beach_1mi": f.get("beach_1mi", 0), "for_sale_no_hoa": f.get("no_hoa", 0),
                 "for_sale_new": f.get("new_construction", 0), "for_sale_acre": f.get("acre_lot", 0), "for_sale_rv_boat": f.get("rv_boat_parking", 0),
                 "for_sale_waterfront": f.get("waterfront", 0), "for_sale_one_level": f.get("one_level", 0), "median_ask": a["median_ask"]})
json.dump({"made": "analyze.py", "note": "One row per place, north to south. Detached houses only. Sources and definitions: analyze.py header, drives_houses.py header and the ledger (Blog-Brain batches/2026-11-a/buyers-relocating-which-town/facts.md).", "rows": rows}, open(os.path.join(D, "chart-towns.json"), "w"), indent=1)
json.dump({"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"slug": s, "name": n, "n": i + 1}, "geometry": mapping(p.simplify(0.0008))} for i, (s, n, p) in enumerate(AREAS)]},
          open(os.path.join(D, "areas.geojson"), "w"))
