"""Chart rows for /sell/sell-or-buy-first/, read from moves.json and timing.json (never typed).
Usage: python3 -I build_charts.py <this dir>   -> chart-moves.json"""
import json, os, sys
D = sys.argv[1]
m = json.load(open(os.path.join(D, "moves.json")))["lives_there"]; t = json.load(open(os.path.join(D, "timing.json")))
def pct(a, b): return round(100 * a / b, 1)
o = m["order"]; n = m["n"]
week = o.get("same_day", 0) + o.get("within_a_week", 0)
out = {"meta": {"made": "build_charts.py", "from": ["moves.json lives_there", "timing.json"],
                "group": "Horry County owners who sold a home (deeds recorded 2021-07 to 2025-10) and, within a year before or after, bought the Horry County home they still own and live in (4 percent assessment)"},
       "n": n,
       "three_ways": [
           {"key": "same_week", "label": "Sold and bought within a week", "n": week, "pct": pct(week, n), "same_day_n": o.get("same_day", 0), "same_day_pct": pct(o.get("same_day", 0), n)},
           {"key": "bought_first", "label": "Bought first", "n": o["bought_first"], "pct": pct(o["bought_first"], n), "median_days_both_owned": m["bought_first_days"]["median"]},
           {"key": "sold_first", "label": "Sold first", "n": o["sold_first"], "pct": pct(o["sold_first"], n), "median_days_between": m["sold_first_days"]["median"]}],
       "gap_bands": {"bought_first": m["bought_first_days"]["bands"], "sold_first": m["sold_first_days"]["bands"]},
       "by_direction": {k: {"n": v["n"], "same_week_pct": pct(v["same_day"] + v["within_a_week"], v["n"]), "bought_first_pct": pct(v["bought_first"], v["n"]), "sold_first_pct": pct(v["sold_first"], v["n"])} for k, v in m["by_direction"].items()},
       "new_home_from_builder": {"n": m["bought_new_from_builder"]["n"], **{k + "_pct": pct(m["bought_new_from_builder"][k], m["bought_new_from_builder"]["n"]) for k in ("bought_first", "sold_first")},
                                 "same_week_pct": pct(m["bought_new_from_builder"]["same_day"] + m["bought_new_from_builder"]["within_a_week"], m["bought_new_from_builder"]["n"])},
       "by_sale_year": {y: {"n": v["n"], "same_week_pct": pct(v["same_day"] + v["within_a_week"], v["n"]), "bought_first_pct": pct(v["bought_first"], v["n"]), "sold_first_pct": pct(v["sold_first"], v["n"])} for y, v in m["by_sale_year"].items()},
       "timing_myrtle_beach_last_12": {"listing_to_contract_median_days_avg": t["Myrtle Beach, SC"]["med_doz_pending"]["avg_last_12"], "contract_to_closing_mean_days_avg": t["Myrtle Beach, SC"]["mean_days_to_close"]["avg_last_12"],
                                       "listing_to_closing_days": t["Myrtle Beach, SC"]["listing_to_closing_days_last_12"], "us_listing_to_closing_days": t["United States"]["listing_to_closing_days_last_12"]}}
json.dump(out, open(os.path.join(D, "chart-moves.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
