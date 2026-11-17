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
B = "type=condo&city=Murrells+Inlet"
S = {}
for k,v in {"newest":"","dom14":"&domMax=14","dom30":"&domMax=30","under150":"&max=150000","under200":"&max=200000","200-300":"&min=200000&max=300000","150-300":"&min=150000&max=300000","300plus":"&min=300000","300-500":"&min=300000&max=500000","500plus":"&min=500000","under250":"&max=250000","beds1":"&beds=1","beds2":"&beds=2","beds3":"&beds=3","beds4":"&beds=4","beds3_under300":"&beds=3&max=300000",
 "oceanfront_unit":"&has=oceanfront_unit","oceanfront_building":"&has=oceanfront_building","oceanview_unit":"&has=oceanview_unit","water_ocean":"&has=water_ocean","water_view":"&has=water_view","marsh_view":"&has=marsh_view","waterfront_community":"&has=waterfront_community","icw_community":"&has=icw_community","boat_slip":"&has=boat_slip","community_dock":"&has=community_dock","private_dock":"&has=private_dock","on_water":"&waterfront=1",
 "hoa500":"&hoaMax=500","hoa450":"&hoaMax=450","hoa400":"&hoaMax=400","hoa350":"&hoaMax=350","hoa_water":"&has=hoa_includes_water_sewer",
 "golf_community":"&has=golf_community","on_golf_course":"&has=on_golf_course","golf_view":"&has=golf_view","indoor_pool":"&has=indoor_pool","outdoor_pool":"&has=outdoor_pool","resort_pool":"&has=resort_pool","lazy_river":"&has=lazy_river","pets":"&has=pets_allowed","str":"&has=str_allowed","vrp":"&has=vacation_rental_program","gated":"&has=gated","furnished":"&has=furnished","walk_to_beach":"&has=walk_to_beach","elevator":"&has=elevator_building","low_rise":"&has=low_rise","tennis":"&has=tennis","fitness":"&has=fitness_center","price_reduced":"&has=price_reduced","one_level":"&has=one_level","first_floor":"&has=first_floor","end_unit":"&has=end_unit","garage":"&has=garage","new2015":"&yearMin=2015","new2005":"&yearMin=2005","new2000":"&yearMin=2000","new_construction":"&has=new_construction",
 "near_marshwalk":"&near=33.55789,-79.03186&miles=1","near_marshwalk_2":"&near=33.55789,-79.03186&miles=2","near_gc_pier":"&near=33.57608,-78.9974&miles=1","near_gc_pier_2":"&near=33.57608,-78.9974&miles=2","near_intl":"&near=33.60062,-79.04166&miles=2","near_intl_3":"&near=33.60062,-79.04166&miles=3"}.items(): S[k]=B+v
subs=["Bally Castle","Marcliffe","Marcliffe at Blackmoor","Cypress Grove","International Club","Park West","Sweetwater","Jasmine Lake","Tupelo Bay","Indian Wells","Surfmaster","Riverwood","Wyngate","Royal Garden","Blue Heron","Garden Sands","Winchester","Horizon East","Waters Edge","Sunnyside Village","Sea Watch","Sandy Shores","Sea Oaks","Marsh Walk","Inlet Pointe","Duneside","Moss Creek","Kelly Court","Cambridge","Sea Mystique","Marlin Quay","Governors Landing","Turning Stone","Sterling Pointe"]
for s in subs: S["sub:" + s] = B + "&subdivision=" + urllib.parse.quote_plus(s)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "strips": {}}
from concurrent.futures import ThreadPoolExecutor
ks = list(S)
with ThreadPoolExecutor(2) as ex: ts = list(ex.map(lambda k: tot(S[k]), ks))
for k, t in zip(ks, ts): out["strips"][k] = {"q": S[k], "total": t}; print(k, t, flush=True)
json.dump(out, open(sys.argv[1] + "/strips.json", "w"), indent=1)
