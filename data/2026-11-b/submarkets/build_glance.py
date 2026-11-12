"""Round 2 (2026-11-12): the one-glance comparison of the nine places, from public data only.
Reads, all saved under raw/:
  census/DECENNIALPL2020.P1.json   2020 Census P.L. 94-171, P1_001N people (all SC places)
  census/DECENNIALPL2020.H1.json   2020 Census P.L. 94-171, H1_001N housing units, H1_002N occupied
  census/DECENNIALDHC2020.H5.json  2020 Census DHC, H5_006N vacant "for seasonal, recreational, or occasional use"
  web/gaz_place_45.txt             2020 Census Gazetteer, places in SC: LSAD (25 city, 43 town, 57 CDP), land area
and beach-by-town.json and coast-length.json (made by beach_by_town.py and coast_length.py).
Writes glance.json. Fails if a place is missing or a share moves off the figure in facts.md.
Fetched with: https://data.census.gov/api/access/data/table?id=<table>&g=040XX00US45$1600000 (2026-11-12)
and https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_gaz_place_45.txt
Run from this folder: python3 -I build_glance.py"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "raw")
def table(f):
    d = json.load(open(os.path.join(R, "census", f)))["response"]["data"]; h = d[0]
    return {r[h.index("GEO_ID")][-7:]: dict(zip(h, r)) for r in d[1:]}
p1, h1, h5 = table("DECENNIALPL2020.P1.json"), table("DECENNIALPL2020.H1.json"), table("DECENNIALDHC2020.H5.json")
gaz = {}
for line in open(os.path.join(R, "web", "gaz_place_45.txt")):
    c = [x.strip() for x in line.split("\t")]
    if c[0] == "SC": gaz[c[1]] = {"name": c[3], "lsad": c[4], "land_sqmi": float(c[8])}
KIND = {"25": "city", "43": "town", "57": "Census designated place (not a town; the county governs it)"}
# The Census place that stands for each guide, and how the guide's own area differs from it.
PLACES = [
    ("little-river", "4542010", "Census's Little River CDP. The guide counts the Little River ZIP outside North Myrtle Beach."),
    ("north-myrtle-beach", "4551280", "The city."),
    ("myrtle-beach", "4549075", "The city."),
    ("surfside-beach", "4570585", "The town."),
    ("garden-city", "4528455", "Census's Garden City CDP: the Horry part only (VERIFY D5). The guide covers both sides of the county line."),
    ("murrells-inlet", "4548985", "Census's Murrells Inlet CDP (the Georgetown County side; the guide also covers the Horry side)."),
    ("pawleys-island", "4555015", "The town: the island only. The mainland and Litchfield are county land."),
    ("carolina-forest", "4511833", "Census's Carolina Forest CDP, first drawn for 2020."),
    ("conway", "4516405", "The city."),
]
EXTRA = [("litchfield-beach", "4541830"), ("atlantic-beach", "4503205"), ("briarcliffe-acres", "4508830"), ("socastee", "4567390")]
beach = json.load(open(os.path.join(H, "beach-by-town.json")))["places"]
coast = json.load(open(os.path.join(H, "coast-length.json")))
NAME_IN_GEO = {"little-river": "Little River", "north-myrtle-beach": "North Myrtle Beach", "myrtle-beach": "Myrtle Beach", "surfside-beach": "Surfside Beach",
               "garden-city": "Garden City", "murrells-inlet": "Murrells Inlet", "pawleys-island": "Pawleys Island", "carolina-forest": "Carolina Forest", "conway": "Conway",
               "litchfield-beach": "Litchfield Beach", "atlantic-beach": "Atlantic Beach", "briarcliffe-acres": "Briarcliffe Acres", "socastee": "Socastee"}
def row(slug, g, note=None):
    if g not in p1 or g not in h1 or g not in h5 or g not in gaz: sys.exit(f"missing Census place {g} ({slug})")
    people, units, occ, seas = int(p1[g]["P1_001N"]), int(h1[g]["H1_001N"]), int(h1[g]["H1_002N"]), int(h5[g]["H5_006N"])
    return {"slug": slug, "geoid": g, "census_name": gaz[g]["name"], "kind": KIND[gaz[g]["lsad"]], "people_2020": people, "homes_2020": units,
            "lived_in_2020": occ, "seasonal_2020": seas, "seasonal_pct": round(100 * seas / units, 1), "seasonal_in_10": round(10 * seas / units),
            "homes_per_100_people": round(100 * units / people), "land_sqmi": gaz[g]["land_sqmi"],
            "ocean_beach_miles": beach.get(NAME_IN_GEO[slug]), "note": note}
out = {"made_by": "build_glance.py", "census_day": "2020-04-01",
       "towns": [row(s, g, n) for s, g, n in PLACES], "others": [row(s, g) for s, g in EXTRA],
       "coast": {"nc_line_to_pawleys_south_end_miles": coast["to"]["pawleys_island_town_south_end"]["shore_miles"],
                 "nc_line_to_near_winyah_bay_miles": coast["to"]["near_winyah_bay_33.20"]["shore_miles"],
                 "beach_outside_any_town_or_cdp_miles": json.load(open(os.path.join(H, "beach-by-town.json")))["outside_any_place_miles"]}}
# Checks against facts.md rows D2 to D4 (fail loudly if a source file changes).
T = {t["slug"]: t for t in out["towns"]}
EXPECT = {"little-river": 19.1, "north-myrtle-beach": 48.4, "myrtle-beach": 16.2, "surfside-beach": 41.6, "garden-city": 39.5,
          "murrells-inlet": 13.6, "pawleys-island": 68.7, "carolina-forest": 4.6, "conway": 1.7}
for s, v in EXPECT.items():
    if T[s]["seasonal_pct"] != v: sys.exit(f"{s} seasonal share {T[s]['seasonal_pct']} != {v} (facts.md D3)")
json.dump(out, open(os.path.join(H, "glance.json"), "w"), indent=1)
print("glance.json: nine towns and four others; checks pass")
