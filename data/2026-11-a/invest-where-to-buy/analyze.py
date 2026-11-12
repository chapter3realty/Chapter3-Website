"""Eleven Grand Strand areas for a rental investor, from public records and the CRM's listings in aggregate.
Run: RAW=<scratch raw> SALES=<Horry deed file> python3 -I analyze.py <datadir>. Writes findings.json and areas.geojson.

Inputs
- RAW/horry-homes.json  (fetch_parcels.py)  every Horry home parcel with a building: land use, class (4 or 6 percent), owner state
- RAW/horry-points.json (fetch_points.py)   a centre point for each of those parcels
- RAW/horry-sfha.json   (fetch_flood.py)    Horry County FEMA special flood hazard areas (zones A, AE, AO, VE)
- RAW/gt-homes.json, RAW/gt-flood.geojson  (fetch_georgetown.py)  Georgetown County parcels and FEMA zones, Waccamaw Neck
- RAW/listings.json     (pull_listings.py)  CRM active listings: all, str_allowed, rentals_allowed (no addresses)
- SALES  Horry County deeds recorded 2025-10-01 to 2026-09-30, data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json
- raw/places.json, raw/zctas.json, raw/counties.json (fetch_areas.py); raw/acs/*.json (pull_acs.sh); hud-safmr-fy2027.json; ../../str-market.json

Area rules (each area is one polygon; a home is in an area when its parcel centroid is inside):
  Myrtle Beach, North Myrtle Beach, Surfside Beach, Conway: the city or town limits (Census TIGERweb incorporated places).
  Garden City, Murrells Inlet, Carolina Forest, Socastee, Little River: the Census designated place (CDP), both counties where it spans both.
  Longs: ZIP code area 29568, outside North Myrtle Beach city limits.  Pawleys Island and Litchfield: ZIP code area 29585 (all Georgetown County).
Kinds. Horry: condo = land use 107 or an HPR (horizontal property regime) legal description; house = land use 100, 101, 102, 110 or 126 and
not HPR; townhouse or villa = 108, 109 or 135 (not HPR). Georgetown: house = land use ending 100, 101 or 500; condo = ending 450, 451, 453 or 455.
6 percent = Horry AssessedProp >= 0.05 x TaxableProp; Georgetown land use code not starting with Q (Q = legal residence).
Sales. Horry: every kept deed (price $10,000 or more, one residential parcel with a building); builder sales flagged; resale = not builder.
Georgetown: the parcel's last recorded sale, dated 2025-10-01 to 2026-09-30, $10,000 or more (no builder flag in the county table).
"""
import json, os, sys, statistics, collections
from shapely.geometry import shape, Point, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; RAW = os.environ["RAW"]; SALES = os.environ["SALES"]
J = lambda p: json.load(open(p))
def rings_to_poly(rings):
    polys = [Polygon(r) for r in rings if len(r) >= 4]
    out = None
    # ESRI rings: outer rings clockwise, holes counter-clockwise; build by symmetric difference
    for p in polys:
        p = p.buffer(0); out = p if out is None else out.symmetric_difference(p)
    return out
places = {p["name"]: rings_to_poly(p["rings"]) for p in J(os.path.join(D, "raw/places.json"))["places"]}
zctas = {z["zcta"]: rings_to_poly(z["rings"]) for z in J(os.path.join(D, "raw/zctas.json"))["zctas"]}
cty = {c["name"]: rings_to_poly(c["rings"]) for c in J(os.path.join(D, "raw/counties.json"))["counties"]}
AREAS = [
  ("myrtle-beach", "Myrtle Beach", places["Myrtle Beach city"]),
  ("north-myrtle-beach", "North Myrtle Beach", places["North Myrtle Beach city"]),
  ("surfside-beach", "Surfside Beach", places["Surfside Beach town"]),
  ("garden-city", "Garden City", places["Garden City CDP"]),
  ("murrells-inlet", "Murrells Inlet", places["Murrells Inlet CDP"]),
  ("pawleys-litchfield", "Pawleys Island and Litchfield", zctas["29585"]),
  ("carolina-forest", "Carolina Forest", places["Carolina Forest CDP"]),
  ("socastee", "Socastee", places["Socastee CDP"]),
  ("conway", "Conway", places["Conway city"]),
  ("little-river", "Little River", places["Little River CDP"]),
  ("longs", "Longs", zctas["29568"].difference(places["North Myrtle Beach city"])),
]
POLY = [a[2] for a in AREAS]; tree = STRtree(POLY)
def area_of(x, y):
    if not x: return None
    pt = Point(x, y)
    for i in tree.query(pt, predicate="within"): return AREAS[i][0]
    return None
GT = cty["Georgetown County"]
def med(v): return round(statistics.median(v)) if v else None
def q(v, k):
    if len(v) < 4: return None
    return round(statistics.quantiles(v, n=4)[k])

# --- Horry parcels ---
H = J(os.path.join(RAW, "horry-homes.json")); cols = H["cols"]
HP = J(os.path.join(RAW, "horry-points.json"))   # fetch_points.py: PIN -> [lon, lat]
HOUSE = {"100", "101", "102", "110", "126"}
sf = J(os.path.join(RAW, "horry-sfha.json"))["features"]
sfp = [rings_to_poly(f["rings"]) for f in sf]; sfz = [f["a"]["FLD_ZONE"] for f in sf]; sft = STRtree(sfp)
def hzone(x, y):
    pt = Point(x, y); z = [sfz[i] for i in sft.query(pt, predicate="within")]
    if not z: return None
    return "VE" if any(s.startswith("V") for s in z) else "A"
stock = collections.defaultdict(lambda: collections.Counter())
pinkind = {}; pinpt = {}
for r in H["rows"]:
    pin, lu, td, ap, tp, mp, st, sd, hpr, x, y = r
    x, y = HP.get(str(pin), (None, None))
    kind = "condo" if (lu == "107" or hpr) else ("house" if lu in HOUSE else ("townhouse" if lu in ("108", "109", "135") else "other"))
    pinkind[str(pin).zfill(11)] = kind; pinpt[str(pin).zfill(11)] = (x, y)
    a = area_of(x, y)
    if not a or not tp: continue
    six = ap >= 0.05 * tp
    z = hzone(x, y)
    for k in (kind, "all"):
        c = stock[a + "|" + k]; c["homes"] += 1; c["six"] += six; c["out_of_state"] += (st or "SC").strip().upper() not in ("SC", "")
        c["sfha"] += z is not None; c["ve"] += z == "VE"; c["horry"] += 1
        c["td_" + str(td)] += 1
# --- Georgetown parcels ---
G = J(os.path.join(RAW, "gt-homes.json"))
gfl = [(shape(f["geometry"]), f["properties"]) for f in J(os.path.join(RAW, "gt-flood.geojson"))["features"] if f.get("geometry") and f["properties"].get("SFHA_TF") == "T"]
gtree = STRtree([g for g, _ in gfl])
import datetime
def gdate(ms): return datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).date().isoformat() if ms else None
gsales = collections.defaultdict(list)
for tms, lu, st, sd, sp, legal, x, y in G["rows"]:
    lu = lu or ""
    kind = "house" if lu[1:] in ("100", "101", "500") else ("condo" if lu[1:] in ("450", "451", "453", "455") else None)
    if not kind: continue
    pt = Point(x, y)
    if not GT.contains(pt): continue
    a = area_of(x, y)
    if not a: continue
    hits = [gfl[i][1]["FLD_ZONE"] for i in gtree.query(pt, predicate="within")]
    z = None if not hits else ("VE" if any((h or "").startswith("V") for h in hits) else "A")
    for k in (kind, "all"):
        c = stock[a + "|" + k]; c["homes"] += 1; c["six"] += lu[:1] != "Q"; c["out_of_state"] += st not in ("SC", "")
        c["sfha"] += z is not None; c["ve"] += z == "VE"; c["georgetown"] += 1
    d = gdate(sd)
    if d and "2025-10-01" <= d <= "2026-09-30" and (sp or 0) >= 10000:
        gsales[a + "|" + kind].append(sp)
# --- Horry deeds ---
S = J(SALES)["sales"]; hs = collections.defaultdict(list); hb = collections.Counter(); hsix = collections.Counter()
for s in S:
    k = "condo" if s["condo"] else pinkind.get(s["pin"], "other")
    x, y = (s.get("lon"), s.get("lat")) if s.get("lon") else pinpt.get(s["pin"], (None, None))
    a = area_of(x, y)
    if not a: continue
    if s["builder"]: hb[a + "|" + k] += 1; continue
    hs[a + "|" + k].append(s["cons"])
# --- listings ---
LS = J(os.path.join(RAW, "listings.json"))
lst = collections.defaultdict(lambda: {"n": 0, "str": 0, "rent": 0, "prices": []})
strset = set(LS["sets"]["str_allowed"]); rentset = set(LS["sets"]["rentals_allowed"])
for mls, h in LS["sets"]["all"].items():
    a = area_of(h["lng"], h["lat"])
    if not a: continue
    k = h["type"]
    for kk in (k, "all"):
        L = lst[a + "|" + kk]; L["n"] += 1; L["str"] += mls in strset; L["rent"] += mls in rentset
        if h["price"]: L["prices"].append(h["price"])
# --- rents, ACS, tax, nightly ---
SAF = J(os.path.join(D, "hud-safmr-fy2027.json"))["zips"]
def acs(table, geo):
    r = J(os.path.join(D, f"raw/acs/ACSDT5Y2024.{table}-{geo}.json"))["response"]["data"]; return dict(zip(r[0], r[1]))
GEO = {"myrtle-beach": "1600000US4549075", "north-myrtle-beach": "1600000US4551280", "surfside-beach": "1600000US4570585", "garden-city": "1600000US4528455",
       "murrells-inlet": "1600000US4548985", "pawleys-litchfield": "860Z200US29585", "carolina-forest": "1600000US4511833", "socastee": "1600000US4567390",
       "conway": "1600000US4516405", "little-river": "1600000US4542010", "longs": "860Z200US29568"}
# 2026 mills on a 6 percent home in the area's usual tax district (Horry 2026 levy; Georgetown County tax calculator, district 41 and 4)
MILLS = {"myrtle-beach": 254.6, "north-myrtle-beach": 221.2, "surfside-beach": 214.2, "garden-city": 207.3, "murrells-inlet": 252.0, "pawleys-litchfield": 237.1,
         "carolina-forest": 201.0, "socastee": 201.0, "conway": 272.5, "little-river": 201.0, "longs": 201.0}
NIGHT = {"myrtle-beach": "myrtle-beach", "north-myrtle-beach": "north-myrtle-beach", "surfside-beach": "surfside-beach", "garden-city": "garden-city",
         "murrells-inlet": "murrells-inlet", "pawleys-litchfield": "pawleys-island", "conway": "conway", "little-river": "little-river"}
STRM = {m["slug"]: m for m in J(os.path.join(D, "../../str-market.json"))["markets"]}
out = {"made": "analyze.py", "areas": []}
for slug, name, poly in AREAS:
    zips = collections.Counter(s["zip"] for s in S if s.get("zip") and area_of(*((s.get("lon"), s.get("lat")) if s.get("lon") else pinpt.get(s["pin"], (None, None)))) == slug)
    mainzip = {"pawleys-litchfield": "29585", "longs": "29568", "murrells-inlet": "29576"}.get(slug) or (str(zips.most_common(1)[0][0]) if zips else None)
    row = {"slug": slug, "name": name, "sq_mi": round(poly.area * (69.0 * 69.0 * 0.836), 1), "main_zip": mainzip, "zips": zips.most_common(4)}
    for k in ("house", "condo", "townhouse", "all"):
        c = stock.get(slug + "|" + k, collections.Counter())
        sales = hs.get(slug + "|" + k, []) + gsales.get(slug + "|" + k, [])
        L = lst.get(slug + "|" + k, {"n": 0, "str": 0, "rent": 0, "prices": []})
        row[k] = {"homes": c["homes"], "pct_6pct": round(100 * c["six"] / c["homes"], 1) if c["homes"] else None,
                  "pct_owner_out_of_state": round(100 * c["out_of_state"] / c["homes"], 1) if c["homes"] else None,
                  "pct_high_risk_flood": round(100 * c["sfha"] / c["homes"], 1) if c["homes"] else None,
                  "pct_ve": round(100 * c["ve"] / c["homes"], 1) if c["homes"] else None,
                  "horry_homes": c["horry"], "georgetown_homes": c["georgetown"],
                  "top_tax_districts": [(t[3:], n) for t, n in collections.Counter({t: n for t, n in c.items() if t.startswith("td_")}).most_common(3)],
                  "resales": len(sales), "median_resale": med(sales), "p25": q(sales, 0), "p75": q(sales, 2),
                  "horry_resales": len(hs.get(slug + "|" + k, [])), "georgetown_sales": len(gsales.get(slug + "|" + k, [])), "builder_sales_horry": hb.get(slug + "|" + k, 0),
                  "listings": L["n"], "listings_str_allowed": L["str"], "pct_listings_str": round(100 * L["str"] / L["n"], 1) if L["n"] else None,
                  "listings_rentals_allowed": L["rent"], "median_ask": med(L["prices"])}
    rent = SAF.get(mainzip, {}) if mainzip else {}
    row["hud_safmr_fy2027"] = rent
    a1, a2 = acs("B25064", GEO[slug]), acs("B25003", GEO[slug])
    row["acs_2024_5yr"] = {"median_gross_rent": int(a1["B25064_001E"]), "moe": int(a1["B25064_001M"]), "occupied": int(a2["B25003_001E"]), "renter": int(a2["B25003_003E"]),
                           "pct_renter": round(100 * int(a2["B25003_003E"]) / int(a2["B25003_001E"]), 1), "geo": GEO[slug], "name": a1["NAME"]}
    row["mills_6pct"] = MILLS[slug]
    mh = row["house"]["median_resale"]; mc = row["condo"]["median_resale"]
    row["tax_6pct_median_house"] = round(mh * 0.06 * MILLS[slug] / 1000) if mh else None
    row["tax_6pct_median_condo"] = round(mc * 0.06 * MILLS[slug] / 1000) if mc else None
    if mh and rent.get("3"): row["gross_yield_house_3br_pct"] = round(100 * rent["3"] * 12 / mh, 1)
    if mh and rent.get("3"): row["rent_minus_tax_house_pct"] = round(100 * (rent["3"] * 12 - row["tax_6pct_median_house"]) / mh, 1)
    m = STRM.get(NIGHT.get(slug, ""))
    row["nightly_airroi"] = {k: m.get(k) for k in ("revenue", "occupancy", "adr", "listings", "median", "peakMonth", "peakRevenue", "lowMonth", "lowRevenue")} if m else None
    out["areas"].append(row)
    print(slug, row["house"]["homes"], row["house"]["median_resale"], row["condo"]["median_resale"], row["all"]["pct_6pct"], row["all"]["pct_high_risk_flood"], row["house"]["pct_listings_str"], row.get("gross_yield_house_3br_pct"), flush=True)
RULE = {"myrtle-beach": "zones", "north-myrtle-beach": "citywide", "surfside-beach": "two districts", "garden-city": "covenants decide",
        "murrells-inlet": "resort districts", "pawleys-litchfield": "allowed", "carolina-forest": "covenants decide", "socastee": "covenants decide",
        "conway": "three downtown districts", "little-river": "covenants decide", "longs": "covenants decide"}
chart = []
for a in out["areas"]:
    chart.append({"slug": a["slug"], "name": a["name"], "nightly_rule": RULE[a["slug"]], "house_median_sale": a["house"]["median_resale"], "house_sales": a["house"]["resales"],
                  "condo_median_sale": a["condo"]["median_resale"], "condo_sales": a["condo"]["resales"], "hud_3br": a["hud_safmr_fy2027"].get("3"), "hud_2br": a["hud_safmr_fy2027"].get("2"),
                  "rent_year_pct_of_house": a.get("gross_yield_house_3br_pct"), "tax_6pct_median_house": a["tax_6pct_median_house"], "mills_6pct": a["mills_6pct"],
                  "tax_per_100k_6pct": round(100000 * 0.06 * a["mills_6pct"] / 1000), "pct_homes_6pct": a["all"]["pct_6pct"], "pct_bill_out_of_state": a["all"]["pct_owner_out_of_state"],
                  "pct_high_risk_flood": a["all"]["pct_high_risk_flood"], "house_listings": a["house"]["listings"], "house_listings_str": a["house"]["listings_str_allowed"],
                  "condo_listings": a["condo"]["listings"], "condo_listings_str": a["condo"]["listings_str_allowed"],
                  "nightly_avg_revenue": (a["nightly_airroi"] or {}).get("revenue"), "nightly_peak_low": [(a["nightly_airroi"] or {}).get(k) for k in ("peakMonth", "peakRevenue", "lowMonth", "lowRevenue")]})
json.dump({"made": "analyze.py", "note": "One row per area for the scorecard table and its charts. Sources and definitions: analyze.py header and the ledger.", "rows": chart}, open(os.path.join(D, "chart-scorecard.json"), "w"), indent=1)
out["str_market_file"] = {"retrieved": J(os.path.join(D, "../../str-market.json"))["retrieved"], "vendor": "AirROI"}
out["listings_pulled"] = LS["pulled"]; out["listing_api_totals"] = LS["api_totals"]; out["listing_truncated"] = len(LS["truncated"])
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"slug": s, "name": n}, "geometry": mapping(p.simplify(0.0008))} for s, n, p in AREAS] +
           [{"type": "Feature", "properties": {"slug": "county-line", "name": "Horry and Georgetown county line"}, "geometry": mapping(cty["Horry County"].boundary.intersection(cty["Georgetown County"].buffer(0.002)).simplify(0.0005))}]},
          open(os.path.join(D, "areas.geojson"), "w"))
