"""Batch 2026-11-b, /buyers/waterfront-homes/. Chart data, read from data files only (no typed numbers).
chart-prices.json  what a house (or condo) on each kind of water resold for at the middle, Horry County deeds,
                   recorded 2025-10-01 to 2026-09-30, with the count. Sources by row:
                     oceanfront house, oceanfront condo, lake or pond, no water: deeds-findings.json (this folder)
                     Intracoastal Waterway, Waccamaw River: from-2026-11-a/findings.json (ledger 2026-11-a rows 20, 22)
                     Cherry Grove channels: ../../2026-11-a/submarkets-north-myrtle-beach/findings.json (NMB ledger row 14)
                     Garden City salt marsh: ../../2026-11-a/submarkets-garden-city/findings.json (Garden City ledger row 13)
chart-dock.json    asking price per square foot, houses for sale on tidal water or a river, with and without a dock
                   (listings-findings.json on_the_water)
chart-flood.json   houses on each water: how many lots reach FEMA's high-risk zone and its VE wave zone (deeds-findings.json stock_flood)
Run: python3 -I build_charts.py"""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(H, *p)))
D = J("deeds-findings.json"); L = J("listings-findings.json"); A = J("from-2026-11-a", "findings.json")
N = J("..", "..", "2026-11-a", "submarkets-north-myrtle-beach", "findings.json")
G = J("..", "..", "2026-11-a", "submarkets-garden-city", "findings.json")
k = D["kinds"]; ag = A["sales"]["groups"]
# A verifier's correction that no data file carries: Garden City ledger row 13 (CORRECTED, 2026-11-03). The marsh flag also
# caught inland ponds; on salt marsh and tidal creeks only it is about 258 houses, 13 sales, $1,237,000 (also typed in
# specs/garden-city.js MARSH). The check stops the build if the file it replaces changes.
GCM = G["sales"]["middle/on_water/house"]
assert (GCM["sales"], GCM["median"]) == (14, 1168500.0), "Garden City marsh figures changed: recheck the row 13 correction"
GC_MARSH = {"n": 13, "median": 1237000.0, "houses": 258}
rows = [
    {"kind": "Oceanfront house", "median": k["ocean"]["resale"]["median"], "n": k["ocean"]["resale"]["n"], "what": "houses in the first row on the beach, resales", "src": "deeds-findings.json kinds.ocean.resale"},
    {"kind": "House on the Intracoastal Waterway", "median": ag["Intracoastal Waterway"]["on_water"]["median"], "n": ag["Intracoastal Waterway"]["on_water"]["n"], "what": "all house sales, 3 by a builder", "src": "from-2026-11-a/findings.json sales.groups.Intracoastal Waterway.on_water"},
    {"kind": "House on the salt marsh (Garden City)", "median": GC_MARSH["median"], "n": GC_MARSH["n"], "what": "houses between Waccamaw Drive and Business 17 on the salt marsh or a tidal creek", "src": "Garden City ledger row 13, verifier's corrected figures (replaces findings.json sales['middle/on_water/house'])"},
    {"kind": "House on the Cherry Grove channels", "median": N["sales"]["house_resale_channel"]["median"], "n": N["sales"]["house_resale_channel"]["n"], "what": "resales", "src": "submarkets-north-myrtle-beach/findings.json sales.house_resale_channel"},
    {"kind": "House on the Waccamaw River", "median": ag["Waccamaw River"]["on_water"]["median"], "n": ag["Waccamaw River"]["on_water"]["n"], "what": "all house sales, 2 by a builder", "src": "from-2026-11-a/findings.json sales.groups.Waccamaw River.on_water"},
    {"kind": "House on a lake or pond", "median": k["lake"]["resale"]["median"], "n": k["lake"]["resale"]["n"], "what": "resales; lakes and ponds the USGS maps", "src": "deeds-findings.json kinds.lake.resale"},
    {"kind": "House on no water", "median": k["none"]["resale"]["median"], "n": k["none"]["resale"]["n"], "what": "resales, for comparison", "src": "deeds-findings.json kinds.none.resale", "reference": True},
    {"kind": "Condo in an oceanfront building", "median": k["ocean_condo"]["resale"]["median"], "n": k["ocean_condo"]["resale"]["n"], "what": "resales", "src": "deeds-findings.json kinds.ocean_condo.resale"},
]
json.dump({"title_draft": "The ocean costs the most, a lake the least", "unit": "dollars, middle resale price", "window": D["deeds"], "rows": rows}, open(os.path.join(H, "chart-prices.json"), "w"), indent=1)
o = L["on_the_water"]
json.dump({"title_draft": "Houses with a dock ask more per square foot", "pulled": L["pulled"],
           "rows": [{"group": "With a dock", "per_sqft": o["tidal_or_river_with_dock"]["median_per_sqft"], "n": o["tidal_or_river_with_dock"]["n"], "median_ask": o["tidal_or_river_with_dock"]["median_ask"]},
                    {"group": "No dock listed", "per_sqft": o["tidal_or_river_no_dock"]["median_per_sqft"], "n": o["tidal_or_river_no_dock"]["n"], "median_ask": o["tidal_or_river_no_dock"]["median_ask"]}],
           "what": "houses for sale whose listing is marked waterfront and names the Intracoastal Waterway, a marsh, creek, canal or river (not the ocean, not a lake)"},
          open(os.path.join(H, "chart-dock.json"), "w"), indent=1)
sf = D["stock_flood"]
names = {"ocean": "Oceanfront houses", "channels": "Cherry Grove channels", "river": "Waccamaw River", "icw": "Intracoastal Waterway"}
json.dump({"title_draft": "On the waterway, many lots sit outside the high-risk flood zone",
           "rows": [{"water": names[x], "houses": sf[x]["houses"], "lot_reaches_high_risk": sf[x]["lot_reaches_high_risk"], "lot_reaches_VE": sf[x]["lot_reaches_VE"],
                     "middle_of_lot_outside_high_risk": sf[x]["zone_at_middle_of_lot"]["X"]} for x in ("ocean", "channels", "river", "icw")],
           "lake_sold": {"houses_sold": k["lake"]["all"]["n"], "zone_at_middle_of_lot": k["lake"]["zone"]}},
          open(os.path.join(H, "chart-flood.json"), "w"), indent=1)
for r in rows: print(r["kind"], r["median"], r["n"])
