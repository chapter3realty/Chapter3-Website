"""Live count (total) for each strip search the page uses. Run: python3 -I check_strips.py <this dir>. Writes strips2.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
def tot(q):
    for i in range(6):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/strip?" + q, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            if d.get("ok"): return d.get("total")
        except Exception: pass
        time.sleep(2 + i)
    return None
B = "type=condo&city=Myrtle+Beach"
S = {
 "newest": B, "oceanfront_unit": B + "&has=oceanfront_unit", "oceanfront_building": B + "&has=oceanfront_building", "oceanview_unit": B + "&has=oceanview_unit",
 "oceanfront_unit_under200": B + "&has=oceanfront_unit&max=200000", "oceanfront_unit_2bed": B + "&has=oceanfront_unit&beds=2", "oceanfront_unit_3bed": B + "&has=oceanfront_unit&beds=3",
 "oceanfront_building_hoa700": B + "&has=oceanfront_building&hoaMax=700",
 "lazy_river": B + "&has=lazy_river", "indoor_pool": B + "&has=indoor_pool", "resort_pool": B + "&has=resort_pool", "golf_community": B + "&has=golf_community", "on_golf_course": B + "&has=on_golf_course",
 "elevator_building": B + "&has=elevator_building", "pets": B + "&has=pets_allowed", "str": B + "&has=str_allowed", "vrp": B + "&has=vacation_rental_program", "gated": B + "&has=gated",
 "hoa_water": B + "&has=hoa_includes_water_sewer&hoaMax=600", "walk_to_beach": B + "&has=walk_to_beach", "inside_city": B + "&has=inside_city_limits", "furnished": B + "&has=furnished",
 "price_reduced": B + "&has=price_reduced", "penthouse": B + "&has=penthouse", "corner": B + "&has=corner_unit", "newcon": B + "&has=new_construction", "still_built": B + "&has=still_being_built", "marsh_icw": B + "&has=icw_community",
 "near_marketcommon": B + "&near=33.6713,-78.9214&miles=1", "boardwalk": B + "&near=33.6896,-78.8800&miles=1", "beds2": B + "&beds=2", "beds3": B + "&beds=3", "beds4": B + "&beds=4",
 "under150": B + "&max=150000", "150-300": B + "&min=150000&max=300000", "300plus": B + "&min=300000", "under100": B + "&max=100000", "under75": B + "&max=75000", "500plus": B + "&min=500000",
 "hoa500": B + "&hoaMax=500", "hoa400": B + "&hoaMax=400", "hoa300": B + "&hoaMax=300", "dom14": B + "&domMax=14", "new2022": B + "&yearMin=2022",
}
subs = ["Grande Dunes", "Market Common", "Kingston Plantation", "Ocean Creek II", "Wave Rider Resort", "Yachtsman Resort South Tower", "Covenant Towers", "Tides", "Sand Dunes Resort", "Margate Tower", "Dunes Village"]
_old = ["Landmark Resort", "Coral Beach", "Caravelle Resort", "Sea Mist Resort", "Monterey Bay Suites Resort", "Compass Cove Pinnacle Oceanfront Tower", "PALACE, THE", "Bay View Resort", "Grande Cayman Resort (formerly Long Bay Resort)", "Beach Colony", "Dunes Village Resort", "OCEAN FOREST VILLAS", "Holiday Sands", "Maisons Sur-Mer", "Carolinian Beach Resort", "Paradise Resort", "Patricia Grand I", "Grand Atlantic", "Mar Vista Grande", "Grande Shores", "Bluewater Resort - Hi rise", "Magnolia Place", "Magnolia Pointe", "Magnolia North", "RIVER OAKS CONDOS", "SAND DUNES PHII", "Kingston Plantation - South Hampton", "Royale Palms", "OCEAN REEF RESORT NORTH TOWER", "Margaritaville Vacation Residences Myrtle Beach", "Sands Ocean", "SANDS OCEAN", "Forest Dunes", "Carolina Winds", "Dunes Pointe", "MB Resort I - 16J", "Savannah Shores - MB Arcadian", "Landmark Resort Phase II", "Ocean Creek I", "Kingston Plantation", "Grande Dunes"]
for s in subs: S["sub:" + s] = B + "&subdivision=" + urllib.parse.quote_plus(s)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "strips": {}}
for k, q in S.items(): out["strips"][k] = {"q": q, "total": tot(q)}; print(k, out["strips"][k]["total"], flush=True)
json.dump(out, open(sys.argv[1] + "/strips2.json", "w"), indent=1)
