"""Verifier's re-run of analyze.py with three corrections (batch 2026-11-n verifier, 2026-11-08). Writes findings-verified.json.
1. H & H Constructors of Fayetteville LLC is a Dream Finders Homes subsidiary (DFH 10-K FY2025: "Myrtle Beach, South Carolina markets
   with our acquisition of the homebuilding business of H&H Constructors of Fayetteville, LLC"), and its Horry County communities
   (Rivertown Landing, Spring Oaks) are sold as Dream Finders Homes on dreamfindershomes.com. Its deeds count under Dream Finders Homes.
2. The memo filter also drops "RERECORD" (two deeds slipped past "RE-RECORD").
3. The owner-sold median is also given for parcels the county shows with a building (MarketImprv > 0), so lot and land sales
   by people do not pull it down. Builder sales are not filtered this way: most new homes are still on the roll as land only.
Usage: python3 -I verify_corrections.py <this dir> [<scratch pins json>]"""
import sys, os, json
D = sys.argv[1]
src = open(os.path.join(D, "analyze.py")).read()
for a, b in [('"H&H Homes", "H & H Constructors of Fayetteville LLC"', '"Dream Finders Homes", "H & H Constructors of Fayetteville LLC"'),
             ('MEMO = re.compile(r"CORRECT|RE-RECORD|', 'MEMO = re.compile(r"CORRECT|RE-?RECORD|'),
             ('os.path.join(D, "findings.json")', 'os.path.join(D, "findings-verified.json")'),
             ('"other_median_price_seller_a_person": st.median([d["Consideration"] for d in k if not d["bl"] and not d["DirectName"]]),',
              '"other_median_price_seller_a_person": st.median([d["Consideration"] for d in k if not d["bl"] and not d["DirectName"]]),\n'
              '       "other_median_price_seller_a_person_building_on_roll": st.median([d["Consideration"] for d in k if not d["bl"] and not d["DirectName"] and (P[d["ParcelNumber"]]["MarketImprv"] or 0) > 0]),\n'
              '       "other_sales_seller_a_person_building_on_roll": len([1 for d in k if not d["bl"] and not d["DirectName"] and (P[d["ParcelNumber"]]["MarketImprv"] or 0) > 0]),\n'
              '       "kept_sales_no_building_on_roll_seller_not_a_builder": len([1 for d in k if not d["bl"] and (P[d["ParcelNumber"]]["MarketImprv"] or 0) == 0]),')]:
    if a not in src: raise SystemExit("patch point missing: " + a[:60])
    src = src.replace(a, b)
sys.argv = [os.path.join(D, "analyze.py")] + sys.argv[1:]
exec(compile(src, "analyze.py (verifier patch)", "exec"))
