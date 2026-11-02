"""Homes, owners, last deeds, flood zones and the state beach setback line for the Pawleys Island area,
from Georgetown County GIS open data pulled by fetch_county.py and fetch_buildings.py.

Run: RAW=<dir> python3 -I analyze.py <out dir>   (writes findings.json; no names, addresses or parcel numbers)

Definitions (stated in the ledger):
- Zones. island = the parcel's inside point is in the Town of Pawleys Island polygon (county Boundaries layer 1).
  Mainland zones split by US 17 (county road "OCEAN HWY"): east_marsh = east of US 17, south of 33.447 N (the north tip of
  the town) and not DeBordieu; litchfield = east of US 17, 33.447 N to 33.505 N; west17 = west of US 17, 33.38 N to 33.505 N;
  debordieu = legal description names DEBORDIEU.
- Island parts by where the causeways land: north (north of 33.4340 N), middle (33.4245 to 33.4340 N), south.
- House = county land-use code ending 100, 101 or 500 with a 2024 county building footprint inside the parcel.
- Legal residence (taxed at 4 percent) = land-use code starting with Q (our reading; see ledger: 83 percent of Q parcels
  mail the bill to the property itself, 7 percent of N parcels).
- Oceanfront = parcel touches the state's 2018 beachfront setback line or baseline (county Nature layers 6 and 7),
  or lies seaward of the setback line. Marsh side = parcel within 20 m of an estuarine wetland (NWI code E...).
- Past the setback line = the house (the largest 2024 footprint in the parcel) crosses the setback line or lies on its ocean side; touches the baseline = at least 20 square metres of it lie within 1.5 m of the baseline. (See the comment at sea_bld.)
- A market sale = a last recorded deed of $10,000 or more. Nominal transfer = last deed under $1,000.
"""
import json, os, sys, statistics, collections, datetime
from shapely.geometry import shape, Point
from shapely.ops import unary_union, nearest_points
from shapely.strtree import STRtree

RAW = os.environ["RAW"]; OUT = sys.argv[1] if len(sys.argv) > 1 else "."
L = lambda n: json.load(open(os.path.join(RAW, n)))["features"]
town = [shape(f["geometry"]) for f in L("munis.geojson") if "PAWLEYS" in f["properties"]["Name"]][0]
roads = L("roads.geojson")
us17 = unary_union([shape(f["geometry"]) for f in roads if f["properties"]["St_Full"] == "OCEAN HWY"])
setback = unary_union([shape(f["geometry"]) for f in L("ocrm-setback.geojson") if f["geometry"]])
baseline = unary_union([shape(f["geometry"]) for f in L("ocrm-baseline.geojson") if f["geometry"]])
estuarine = unary_union([shape(f["geometry"]).buffer(0) for f in L("wetlands.geojson")
                         if f["geometry"] and (f["properties"].get("ATTRIBUTE") or "").startswith("E")])
flood = [(shape(f["geometry"]).buffer(0), f["properties"]) for f in L("flood.geojson") if f["geometry"]]
ftree = STRtree([g for g, _ in flood])
BAND = baseline.buffer(7.5 / 111000.0)          # the strip from the baseline back to about the setback line, both sides of the baseline
BASEBAND = baseline.buffer(1.5 / 111000.0)      # the baseline itself, give or take 1.5 m
M = 1 / 111000.0  # metres to degrees (rough, latitude 33)
ASOF = datetime.date(2026, 11, 2)
WIN = (datetime.date(2025, 10, 1), datetime.date(2026, 9, 30))


def east_of_17(pt):
    a, b = nearest_points(us17, pt)
    # direction of the road near a: take a short piece of the road around the nearest point
    d = us17.project(a); p1 = us17.interpolate(max(d - 30 * M, 0)); p2 = us17.interpolate(d + 30 * M)
    cross = (p2.x - p1.x) * (pt.y - p1.y) - (p2.y - p1.y) * (pt.x - p1.x)
    # US 17 runs roughly north-east; points to the right of the travel direction (cross < 0) when p1->p2 heads north are east
    north = p2.y > p1.y
    return (cross < 0) if north else (cross > 0)


ENDS = [Point(c) for l in getattr(setback, "geoms", [setback]) for c in (l.coords[0], l.coords[-1])]


def seaward(pt):
    """True if pt is on the ocean side of the setback line (ocean side = the side the baseline is on).
    A point whose nearest setback point is a line end (an inlet) is not tested."""
    a, _ = nearest_points(setback, pt)
    if min(a.distance(e) for e in ENDS) < 1 * M: return False
    b, _ = nearest_points(baseline, a)
    vx, vy = b.x - a.x, b.y - a.y; wx, wy = pt.x - a.x, pt.y - a.y
    return vx * wx + vy * wy > 0 and pt.distance(setback) < 300 * M


def zone_of(pt, legal):
    if town.contains(pt): return "island"
    if "DEBORDIEU" in (legal or "").upper(): return "debordieu"
    if not (33.38 <= pt.y <= 33.505): return None
    if east_of_17(pt):
        return "east_marsh" if pt.y < 33.447 else "litchfield"
    return "west17"


def part_of(pt):
    return "north" if pt.y > 33.4340 else ("middle" if pt.y > 33.4245 else "south")


def flood_zone(g):
    pt = g.representative_point(); best = None
    for i in ftree.query(pt, predicate="within"):
        z = flood[i][1]["FLD_ZONE"]
        if z == "X" and "0.2" in (flood[i][1]["ZONE_SUBTY"] or ""): z = "X shaded"
        rank = {"VE": 0, "AE": 1, "AO": 2, "A": 3, "X shaded": 4, "X": 5}.get(z, 6)
        if best is None or rank < best[0]: best = (rank, z, flood[i][1].get("STATIC_BFE"))
    return (best[1], best[2]) if best else ("none", None)


parcels = [f for f in L("parcels.geojson") if f["geometry"]]
pg = [shape(f["geometry"]).buffer(0) for f in parcels]
bld = L("bld2024-all.geojson")
bpts = [shape(b["geometry"]).representative_point() for b in bld]
btree = STRtree(pg)
has_bld = collections.defaultdict(list)
for j, pt in enumerate(bpts):
    for i in btree.query(pt, predicate="within"): has_bld[i].append(j)

homes = []
for i, f in enumerate(parcels):
    p = f["properties"]; code = p["LandUseCode"] or ""
    g = pg[i]; pt = g.representative_point()
    z = zone_of(pt, p["LegalDescription"])
    if z is None: continue
    kind = None
    if code[1:] in ("100", "101", "500") and has_bld[i]: kind = "house"
    elif code[1:] in ("450", "451", "453", "455") and any(w in (p["LegalDescription"] or "").upper() for w in ("UNIT", "APT", "VILLA", "#")): kind = "condo"
    elif code[1:] in ("400", "000") and not has_bld[i] and code[0] in "NQ": kind = "lot"
    if not kind: continue
    sd = datetime.datetime.fromtimestamp(p["SaleDate"] / 1000, datetime.UTC).date() if p["SaleDate"] else None
    ocean = g.intersects(setback.buffer(2 * M)) or g.intersects(baseline.buffer(2 * M)) or seaward(pt)
    marsh = (not ocean) and g.distance(estuarine) < 20 * M
    fz, bfe = flood_zone(g)
    # the house = the largest 2024 footprint in the parcel (walkways and decks are separate, smaller footprints)
    main = shape(bld[max(has_bld[i], key=lambda j: shape(bld[j]["geometry"]).area)]["geometry"]) if has_bld[i] else None
    # past the setback line = at least 20 square metres (about 215 sq ft) of the house lies within 7.5 m (the measured gap
    # between the two lines on the island, about 23 ft) of the baseline, or the house's inside point is seaward of the
    # setback line. A dune walkway or stair attached to the outline covers far less than 20 square metres.
    sea_bld = bool(main) and ocean and (main.intersection(BAND).area * 111000 ** 2 * 0.8355 >= 20 or seaward(main.representative_point()))
    over_base = bool(main) and ocean and main.intersection(BASEBAND).area * 111000 ** 2 * 0.8355 >= 20
    homes.append({"zone": z, "part": part_of(pt) if z == "island" else None, "kind": kind,
                  "lr": code[:1] == "Q", "state": (p["State"] or "").strip().upper(),
                  "sale_date": sd.isoformat() if sd else None, "price": p["SalePrice"],
                  "acres": p["TotalLandArea"], "ocean": bool(ocean), "marsh": bool(marsh),
                  "flood": fz, "bfe": bfe, "seaward_bld": bool(sea_bld), "over_baseline": bool(over_base),
                  "city": (p["City"] or "").strip().upper()})


def q(v, x):
    v = sorted(v); return v[int(round((len(v) - 1) * x))] if v else None


def summ(rows):
    n = len(rows)
    if not n: return {"homes": 0}
    dates = [datetime.date.fromisoformat(r["sale_date"]) for r in rows if r["sale_date"]]
    years = [(ASOF - d).days / 365.25 for d in dates]
    market5 = sum(1 for r in rows if r["sale_date"] and r["price"] and r["price"] >= 10000 and r["sale_date"] >= "2021-11-01")
    any5 = sum(1 for r in rows if r["sale_date"] and r["sale_date"] >= "2021-11-01")
    nominal = sum(1 for r in rows if r["sale_date"] and (r["price"] or 0) < 1000)
    sales = sorted(r["price"] for r in rows if r["sale_date"] and WIN[0].isoformat() <= r["sale_date"] <= WIN[1].isoformat() and (r["price"] or 0) >= 10000)
    sales3 = sorted(r["price"] for r in rows if r["sale_date"] and "2023-10-01" <= r["sale_date"] <= WIN[1].isoformat() and (r["price"] or 0) >= 10000)
    dec = collections.Counter((d.year // 10) * 10 for d in dates)
    st = collections.Counter(r["state"] for r in rows)
    fl = collections.Counter(r["flood"] for r in rows)
    return {"homes": n, "legal_residence": sum(r["lr"] for r in rows), "pct_legal_residence": round(100 * sum(r["lr"] for r in rows) / n, 1),
            "bill_outside_sc": sum(1 for r in rows if r["state"] and r["state"] != "SC"),
            "pct_bill_outside_sc": round(100 * sum(1 for r in rows if r["state"] and r["state"] != "SC") / n, 1),
            "top_states": st.most_common(8),
            "last_deed_median_years_ago": round(statistics.median(years), 1) if years else None,
            "last_deed_before_2000": sum(1 for d in dates if d.year < 2000), "pct_last_deed_before_2000": round(100 * sum(1 for d in dates if d.year < 2000) / n, 1),
            "last_deed_by_decade": sorted(dec.items()),
            "market_sale_last5y": market5, "pct_market_sale_last5y": round(100 * market5 / n, 1),
            "any_deed_last5y": any5, "pct_any_deed_last5y": round(100 * any5 / n, 1),
            "last_deed_nominal": nominal, "pct_last_deed_nominal": round(100 * nominal / n, 1),
            "sales_window": len(sales), "median_window": q(sales, .5), "p25_window": q(sales, .25), "p75_window": q(sales, .75),
            "min_window": sales[0] if sales else None, "max_window": sales[-1] if sales else None,
            "sales_3y": len(sales3), "median_3y": q(sales3, .5), "p25_3y": q(sales3, .25), "p75_3y": q(sales3, .75),
            "flood": dict(fl), "pct_VE": round(100 * fl.get("VE", 0) / n, 1), "pct_AE": round(100 * fl.get("AE", 0) / n, 1),
            "pct_special_flood_hazard": round(100 * sum(fl.get(z, 0) for z in ("VE", "AE", "A", "AO")) / n, 1),
            "oceanfront": sum(r["ocean"] for r in rows), "marsh_side": sum(r["marsh"] for r in rows),
            "building_past_setback_line": sum(r["seaward_bld"] for r in rows),
            "building_touches_baseline": sum(r["over_baseline"] for r in rows),
            "bill_sc_city_top": [[c, n] for c, n in collections.Counter(r["city"] for r in rows if r["state"] == "SC").most_common(8) if n >= 5]}


out = {"asof": ASOF.isoformat(), "window": [WIN[0].isoformat(), WIN[1].isoformat()], "groups": {}}
groups = collections.defaultdict(list)
for h in homes:
    groups[f"{h['zone']}/{h['kind']}"].append(h)
    if h["zone"] == "island":
        groups[f"island/{h['part']}/{h['kind']}"].append(h)
        if h["kind"] == "house":
            groups["island/oceanfront/house" if h["ocean"] else ("island/marsh/house" if h["marsh"] else "island/between/house")].append(h)
    if h["kind"] == "house" and h["ocean"] and h["zone"] != "island":
        groups[f"{h['zone']}/oceanfront/house"].append(h)
for k in sorted(groups): out["groups"][k] = summ(groups[k])
bfe = collections.Counter((h["flood"], h["bfe"]) for h in homes if h["zone"] == "island" and h["kind"] == "house")
out["island_house_bfe"] = sorted([[a, b, c] for (a, b), c in bfe.items()], key=lambda x: (str(x[0]), str(x[1])))
# island length along its main roads, and building counts 2017 vs 2024 inside the town
spine = unary_union([shape(f["geometry"]) for f in roads if f["properties"]["St_Full"] in ("MYRTLE AVE", "SPRINGS AVE", "ATLANTIC AVE")]).intersection(town)
out["island_main_road_miles"] = round(spine.length * 111000 * 0.8355 / 1609.34, 2)  # cos(33.43) for the east-west part is ignored below
lat_span = town.bounds[3] - town.bounds[1]
out["town_lat_span_miles"] = round(lat_span * 69.0, 2)
b17 = L("bld2017-all.geojson")
out["buildings_in_town"] = {"2017": sum(1 for b in b17 if town.contains(shape(b["geometry"]).representative_point())),
                            "2024": sum(1 for pt in bpts if town.contains(pt)),
                            "2024_status": dict(collections.Counter(b["properties"].get("status") for b, pt in zip(bld, bpts) if town.contains(pt)))}
json.dump(out, open(os.path.join(OUT, "findings.json"), "w"), indent=1)
for k, v in out["groups"].items():
    if v.get("homes", 0) >= 3:
        print(k, {x: v[x] for x in ("homes", "pct_legal_residence", "pct_bill_outside_sc", "last_deed_median_years_ago", "pct_market_sale_last5y", "pct_last_deed_nominal", "sales_window", "median_window", "sales_3y", "median_3y", "pct_VE", "pct_special_flood_hazard", "oceanfront", "building_past_setback_line", "building_touches_baseline")})
print(out["buildings_in_town"], out["island_main_road_miles"], out["town_lat_span_miles"])
