"""The one data file the page reads (page-data.json), for /buyers/retirees/ (batch 2026-11-a).

It takes the researcher's files (communities.json, parcels-findings.json, zones-findings.json, drives.json,
examples.json) and applies the verifier's corrections of 2026-11-02 (Blog-Brain batches/2026-11-a/buyers-retirees/
VERIFY.md, "Every correction"), so the page never prints a value the verifier changed. Each correction names its
ledger row. The listing counts come from a re-pull on build day (pull_listings.py into a scratch folder, then
copied here as listings-counts-build.json, plus one query for all one-level houses under $400,000).

Run: python3 -I build_page_data.py <datadir>. Writes page-data.json."""
import sys, json, os
D = sys.argv[1]
J = lambda n: json.load(open(os.path.join(D, n)))
com, par, zon, drv, ex = J("communities.json"), J("parcels-findings.json"), J("zones-findings.json"), J("drives.json"), J("examples.json")
lst = J("listings-counts-build.json")

# Rows 25 (corrected): share of homes taxed at the 4 percent legal residence rate.
#   Grande Dunes: the set left out PARCEL 2-C (58 homes, 55 at 4 percent), which the Grande Dunes ledger ties to C-1
#   and C-2. With it: 746 of 871. Myrtle Trace: two misspelled parcels added: 447 of 515. NMB and Seasons as pulled.
FULL_TIME = {
    "Del Webb at Grande Dunes": (par["Del Webb at Grande Dunes"]["at_4pct"] + 55, par["Del Webb at Grande Dunes"]["homes_with_building"] + 58),
    "Myrtle Trace": (447, 515),
    "Del Webb North Myrtle Beach": (par["Del Webb North Myrtle Beach"]["at_4pct"], par["Del Webb North Myrtle Beach"]["homes_with_building"]),
    "Seasons at Prince Creek West": (par["Seasons at Prince Creek West"]["at_4pct"], par["Seasons at Prince Creek West"]["homes_with_building"]),
}
assert FULL_TIME["Del Webb at Grande Dunes"] == (746, 871), FULL_TIME["Del Webb at Grande Dunes"]

# Row 35 (corrected): NMB to McLeod Health Seacoast is "about 10 minutes", the NMB page's verified value (NMB row 64);
# the North Strand ER is about 5 minutes (NMB row 104). The other three round to their sibling pages' values.
HOSPITAL = {
    "Del Webb at Grande Dunes": {"name": "Grand Strand Medical Center", "minutes": 6, "kind": "hospital"},
    "Del Webb North Myrtle Beach": {"name": "McLeod Health Seacoast", "minutes": 10, "kind": "hospital",
                                    "er": {"name": "Grand Strand Health's North Strand ER", "minutes": 5, "lat": 33.823215, "lon": -78.68749}},
    "Myrtle Trace": {"name": "Conway Medical Center", "minutes": 3, "kind": "hospital"},
    "Seasons at Prince Creek West": {"name": "Tidelands Waccamaw Community Hospital", "minutes": 8, "kind": "hospital"},
}
for c, hsp in HOSPITAL.items():
    d = next(x for x in drv["drives"] if x["from"] == c and x["to"] == hsp["name"])
    assert abs(d["minutes"] - hsp["minutes"]) <= 2.5, (c, d["minutes"])

# Row 46 (corrected): homes for sale in each community, placed on the county's parcels by the verifier.
# Myrtle Trace 7 (the MLS name also returns other neighborhoods); Grande Dunes about 25; Seasons 4; NMB 2.
FOR_SALE = {"Del Webb at Grande Dunes": "about 25", "Myrtle Trace": "7", "Seasons at Prince Creek West": "4", "Del Webb North Myrtle Beach": "2"}

GEO = {c: {"lon": zon[c]["point"][0], "lat": zon[c]["point"][1]} for c in zon}
out = {"communities": []}
for c in com["communities"]:
    n = c["name"]
    at, of = FULL_TIME[n]
    z = zon[n]["home_parcels_by_scemd_zone"]
    out["communities"].append({
        "name": n, "url": c["url"], "where": c["where"], "fee": c["fee"], "built": c["built"], "guests": c["guests"],
        "full_time": at, "homes_checked": of, "full_time_share": round(at / of, 3),
        "evacuation_zone": "none" if list(z) == ["none"] else "/".join(sorted(z)), "zone_homes": sum(z.values()),
        "hospital": HOSPITAL[n], "for_sale": FOR_SALE[n], **GEO[n],
    })
# Row 27 (verified): single-family houses in the county record (land use 101).
out["county_full_time_share_houses"] = com["county_full_time_share"]["houses"]

# Row 45 (corrected): one-level houses for sale. Totals by one query (the price bands share their edges).
rows = {r["label"]: r["total"] for r in lst["rows"]}
out["one_level"] = {"total": rows["houses on one level"], "under_400k": lst["under_400k_one_query"]["total"],
                    "towns": [{"town": t, "total": rows[f"one level in {t}"], "under_400k": rows[f"one level in {t} under 400000"]}
                              for t in ["Conway", "Myrtle Beach", "Longs", "Little River", "North Myrtle Beach", "Murrells Inlet", "Surfside Beach"]],
                    "pulled": lst["pulled"]}

# Rows 11 to 13 and 23: carried from examples.json unchanged (verified by re-run).
out["examples"] = ex
json.dump(out, open(os.path.join(D, "page-data.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k != "examples"}, indent=1))
