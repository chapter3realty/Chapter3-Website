"""Live count (total) for each strip search the page uses. Run: python3 -I check_strips.py <this dir>. Writes strips.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
def tot(q):
    for i in range(6):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/strip?" + q, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            if d.get("ok"): return d.get("total")
        except Exception: pass
        time.sleep(2 + i)
    return None
B = "type=condo&city=North+Myrtle+Beach"
S = {
 "newest": B, "dom14": B + "&domMax=14", "under75": B + "&max=75000", "under100": B + "&max=100000", "under150": B + "&max=150000", "150-300": B + "&min=150000&max=300000", "300plus": B + "&min=300000", "300-500": B+"&min=300000&max=500000", "500plus": B + "&min=500000", "1mplus": B+"&min=1000000",
 "beds1": B+"&beds=1", "beds2": B + "&beds=2", "beds3": B + "&beds=3", "beds4": B + "&beds=4",
 "oceanfront_unit": B + "&has=oceanfront_unit", "oceanfront_building": B + "&has=oceanfront_building", "oceanview_unit": B + "&has=oceanview_unit", "water_ocean": B+"&has=water_ocean",
 "oceanfront_unit_under300": B + "&has=oceanfront_unit&max=300000", "oceanfront_unit_under250": B + "&has=oceanfront_unit&max=250000", "oceanfront_unit_2bed": B + "&has=oceanfront_unit&beds=2", "oceanfront_unit_3bed": B + "&has=oceanfront_unit&beds=3",
 "oceanfront_unit_500plus": B+"&has=oceanfront_unit&min=500000",
 "hoa_water": B+"&has=hoa_includes_water_sewer", "hoa500": B + "&hoaMax=500", "hoa400": B + "&hoaMax=400", "hoa600": B+"&hoaMax=600", "hoa300": B+"&hoaMax=300",
 "lazy_river": B + "&has=lazy_river", "lazy_river_building": B+"&has=lazy_river_building", "indoor_pool": B + "&has=indoor_pool", "outdoor_pool": B+"&has=outdoor_pool", "resort_pool": B + "&has=resort_pool", "golf_community": B + "&has=golf_community", "on_golf_course": B + "&has=on_golf_course", "golf_view": B+"&has=golf_view",
 "elevator_building": B + "&has=elevator_building", "pets": B + "&has=pets_allowed", "str": B + "&has=str_allowed", "vrp": B + "&has=vacation_rental_program", "gated": B + "&has=gated", "furnished": B+"&has=furnished",
 "walk_to_beach": B+"&has=walk_to_beach", "icw_community": B+"&has=icw_community", "water_view": B+"&has=water_view", "marsh_view": B+"&has=marsh_view", "boat_slip": B+"&has=boat_slip", "community_dock": B+"&has=community_dock", "waterfront_community": B+"&has=waterfront_community",
 "penthouse": B+"&has=penthouse", "price_reduced": B+"&has=price_reduced", "new_construction": B+"&has=new_construction", "still_built": B+"&has=still_being_built", "new2022": B+"&yearMin=2022", "new2015": B+"&yearMin=2015",
 "near_barefoot_landing": B+"&near=33.7998752,-78.7424398&miles=1", "near_main_street": B+"&near=33.8188841,-78.6723736&miles=1", "near_cherry_grove_pier": B+"&near=33.8287315,-78.6326763&miles=1",
 "near_main_street_2": B+"&near=33.8188841,-78.6723736&miles=2",
 "tennis": B+"&has=tennis", "fitness": B+"&has=fitness_center", "beach_access": B+"&has=beach_access", "balcony":B+"&has=balcony", "low_rise":B+"&has=low_rise", "high_rise":B+"&has=high_rise", "ocean_view": B+"&has=ocean_view",
}
subs = ["Beach Cove", "Mar Vista Grande", "Prince Resort", "Bay Watch", "Sea Cabin", "Avista", "North Beach Towers", "Crescent Shores", "Ocean Keyes", "Tilghman", "Barefoot", "Willow Bend", "The Havens", "YACHT CLUB VILLAS", "Ironwood", "River Crossing", "Greenbriar", "Edgewater", "OCEAN BAYCLUB", "Malibu Pointe", "Carolina Keyes", "Waterway Landing", "Cherry Grove Villas", "Ocean Greens", "Waipani", "Seven Oaks", "Windy Hill Dunes", "Ocean Pier", "Chateau By The Sea", "Inlet Point", "Sea Castle", "Shorehaven", "Harbourgate", "Seashore Villas", "Beach Villas", "Laguna Keyes", "Hill Street", "Ocean Marsh", "Sea Mist", "Cottages at Ingram Dunes", "Cottages at 7th", "Grande Harbour", "Windsor", "Sands", "Bahama Sands", "NMB Golf", "Veranda"]
for s in subs: S["sub:" + s] = B + "&subdivision=" + urllib.parse.quote_plus(s)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "strips": {}}
from concurrent.futures import ThreadPoolExecutor
ks = list(S)
with ThreadPoolExecutor(4) as ex: ts = list(ex.map(lambda k: tot(S[k]), ks))
for k, t in zip(ks, ts): out["strips"][k] = {"q": S[k], "total": t}; print(k, t, flush=True)
json.dump(out, open(sys.argv[1] + "/strips.json", "w"), indent=1)
