"""Findings for /invest/airbnb-income/ (batch 2026-11-b).

Run from anywhere:  python3 -I analyze.py <website-root>
Reads, never writes, the site's files:
  data/str-market.json                                  the site's one source for short-term rental figures
  data/2026-10-d/invest-str-tools/raw/airroi-parsed.json the same AirROI update (October 1, 2026; 12 months to
                                                        September 2026), parsed by str-tools' parse_airroi.py;
                                                        holds what str-market.json does not: size, month, cost lines
  data/2026-10-d/invest-str-tools/findings.json         the worked condos on /invest/str-tools/ (our listing counts)
Stops if the two AirROI files disagree on any figure they share. Writes findings.json beside this script.
"""
import json, os, sys

WEB = sys.argv[1] if len(sys.argv) > 1 else "."
HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: json.load(open(os.path.join(WEB, p)))
STR = rd("data/str-market.json")
P = rd("data/2026-10-d/invest-str-tools/raw/airroi-parsed.json")
F = rd("data/2026-10-d/invest-str-tools/findings.json")

def must(ok, what):
    if not ok:
        raise SystemExit("analyze.py: " + what)

must(STR["retrieved"] >= "2026-11-03" and STR["dataAsOf"] == "2026-10-01", "str-market.json is not the 2026-11-03 refresh")
SLUG = {"garden-city": "garden-city-beach"}
ORDER = ["north-myrtle-beach", "myrtle-beach", "surfside-beach", "garden-city", "murrells-inlet", "pawleys-island", "little-river", "conway"]
M = {m["slug"]: m for m in STR["markets"]}
must(sorted(M) == sorted(ORDER), "str-market.json towns changed")

towns = []
for s in ORDER:
    m, p = M[s], P[SLUG.get(s, s)]
    must(p["updated"] == "October 1, 2026" and p["period"] == "September 2026", f"{s}: AirROI read is not the October 1, 2026 update")
    for a, b in [("revenue", "revenue"), ("occupancy", "occupancy_pct"), ("adr", "adr"), ("listings", "listings"), ("revpar", "revpar")]:
        must(m[a] == p[b], f"{s}: {a} {m[a]} in str-market.json, {p[b]} in airroi-parsed.json")
    for t in ["top10", "top25", "median", "bottom25"]:
        must(m[t] == p["tiers_month"][t], f"{s}: {t} disagrees")
    cal = p["calendar_month_revenue"]
    must(m["peakMonth"] == max(cal, key=cal.get) and m["peakRevenue"] == cal[m["peakMonth"]], f"{s}: peak month disagrees")
    must(m["lowMonth"] == min(cal, key=cal.get) and m["lowRevenue"] == cal[m["lowMonth"]], f"{s}: low month disagrees")
    bs = p["by_size"]
    big = [bs[k] for k in ("4", "5+") if k in bs]
    towns.append({
        "slug": s, "name": m["name"], "page": m["page"],
        "gross_avg": m["revenue"], "listings": m["listings"], "occupancy_pct": m["occupancy"], "adr": m["adr"],
        "month_median": m["median"], "month_bottom25": m["bottom25"], "month_top25": m["top25"], "month_top10": m["top10"],
        "condo_pct": p["condo_pct"], "house_pct": p["house_pct"],
        "by_size": {k: bs[k] for k in ("1", "2", "3", "4", "5+") if k in bs},
        "two_bed_median_below_avg_pct": round(100 * (1 - bs["2"]["median"] / bs["2"]["average"])),
        "top_quarter_gross": p["pnl"]["gross"][1],
        "kept_after_running_avg": p["left_year_avg"],
        "kept_cents_per_dollar": round(100 - p["pnl"]["cleaning_share_pct"] - p["pnl"]["airbnb_fee"]["pct"] - 10),
        "summer_share_pct": p["top3_share_pct"],
        "july": cal["July"], "january": cal["January"], "july_over_january": round(cal["July"] / cal["January"], 1),
        "months": [{"month": k, "gross": v} for k, v in cal.items()],
        "lead_days": p["lead_days"], "cleaning_fee_median": p["cleaning_fee_median"],
        "small": m["listings"] < 200,
    })
T = {t["slug"]: t for t in towns}

# Size: the same size, town by town. Range of the two-, three- and four-bedroom averages over the eight towns.
def rng(size, exclude=()):
    v = [t["by_size"][size]["average"] for t in towns if size in t["by_size"] and t["slug"] not in exclude]
    return [min(v), max(v)]
size = {
    "two_bed_avg_range_excl_little_river": rng("2", ("little-river",)),
    "three_bed_avg_range_excl_little_river": rng("3", ("little-river",)),
    "four_bed_avg_range": rng("4"),
    "all_size_avg_range": [min(t["gross_avg"] for t in towns), max(t["gross_avg"] for t in towns)],
    "mi_over_mb_all_sizes": round(T["murrells-inlet"]["gross_avg"] / T["myrtle-beach"]["gross_avg"], 2),
    "mi_over_mb_two_bed": round(T["murrells-inlet"]["by_size"]["2"]["average"] / T["myrtle-beach"]["by_size"]["2"]["average"], 2),
}

# The worked example: the same arithmetic as /invest/str-tools/ (specs/str-tools.js RUN_SRC), on its two cases.
def run(rate, nights, clean, runc, mgr, fee, tax, ins, util=False):
    cl = clean / 100
    gross = rate * nights / (1 - cl)
    c = {"gross": gross, "cleaner": gross * cl, "airbnb": gross * (runc - 10) / 100, "utilities": 0 if util else gross * 0.05,
         "supplies_repairs": gross * 0.05, "manager": rate * nights * mgr / 100}
    c["before_bills"] = c["gross"] - c["cleaner"] - c["airbnb"] - c["utilities"] - c["supplies_repairs"] - c["manager"]
    c["hoa"] = fee * 12; c["tax"] = tax; c["ins_permit"] = ins
    c["bills"] = c["hoa"] + c["tax"] + c["ins_permit"]; c["kept"] = c["before_bills"] - c["bills"]
    per = rate * (1 - cl - (runc - (5 if util else 0)) / 100) / (1 - cl) - rate * mgr / 100
    c["nights_to_pay_bills"] = round(c["bills"] / per) if per > 0 else None
    return {k: (round(v) if isinstance(v, float) else v) for k, v in c.items()}

FT = F["towns"]
def case(key, ex, mills, mgr=0):
    a, e = FT[key], F["examples"][ex]
    nights = round(a["two_bed"]["average"] * (1 - a["cleaning_share_pct"] / 100) / a["two_bed"]["adr"])
    tax = round(e["price_median"] * 0.06 * mills / 1000)
    r = run(a["two_bed"]["adr"], nights, a["cleaning_share_pct"], a["running_cost_pct_of_gross"], mgr, e["hoa_used"], tax, a["insurance_line"] + a["permit_line"])
    r.update({"town": key, "price_median": round(e["price_median"]), "hoa_month": e["hoa_used"], "rate": a["two_bed"]["adr"], "nights": nights,
              "for_sale_n": e["for_sale_n"], "manager_pct": mgr})
    return r
mb = case("myrtle-beach", "mb_city_oceanfront_condo_2br", 254.6)
gc = case("garden-city-beach", "garden_city_condo_2br", 207.3)
gc_mgr = case("garden-city-beach", "garden_city_condo_2br", 207.3, mgr=15)
# Checks against what /invest/str-tools/ prints today (its spec's must() lines and its live text).
must(mb["tax"] == 4995 and mb["bills"] == 20085 and mb["nights"] == 87 and mb["rate"] == 252 and mb["nights_to_pay_bills"] == 110, "MB case differs from str-tools")
must(abs(mb["kept"] - -4272) < 100, "MB case: about $4,200 short")
must(gc["nights"] == 95 and gc["nights_to_pay_bills"] == 66 and 5000 <= gc["kept"] <= 5200 and gc["gross"] in range(26700, 26900), "GC case differs from str-tools ($26,800 in, $5,100 kept)")
must(gc_mgr["kept"] < 2000 and gc_mgr["nights_to_pay_bills"] == 83, "GC with manager: under $2,000, about 83 nights")

mbp = P["myrtle-beach"]["pnl"]
market_pnl = {"gross": mbp["gross"], "nightly": mbp["nightly"], "cleaning": mbp["cleaning"], "airbnb_fee": [mbp["airbnb_fee"]["avg"], mbp["airbnb_fee"]["top25"]],
              "utilities": [mbp["utilities"]["avg"], mbp["utilities"]["top25"]], "supplies": [mbp["supplies"]["avg"], mbp["supplies"]["top25"]],
              "repairs": [mbp["repairs"]["avg"], mbp["repairs"]["top25"]], "insurance": mbp["insurance"], "permit": mbp["permit"],
              "kept": [P["myrtle-beach"]["left_year_avg"], None]}
kept_top = mbp["gross"][1] - mbp["cleaning"][1] - mbp["airbnb_fee"]["top25"] - mbp["utilities"]["top25"] - mbp["supplies"]["top25"] - mbp["repairs"]["top25"] - mbp["insurance"] - mbp["permit"]
market_pnl["kept"][1] = kept_top
must(abs(kept_top - 27700) < 100, "top-quarter kept differs from str-vs-ltr's $27,700")

# Basic manager on the average listing's bookings, at the published local range (property-management row 7: 10 to 25 percent).
mgr_pub = {"low_pct": 10, "high_pct": 25, "on_avg_listing": [round(T["myrtle-beach"]["gross_avg"] * 0.10), round(T["myrtle-beach"]["gross_avg"] * 0.25)]}

out = {"_source": "analyze.py over data/str-market.json (2026-11-03 refresh, AirROI October 1, 2026 update, 12 months to September 2026) and the same update in data/2026-10-d/invest-str-tools/raw/airroi-parsed.json; worked cases with /invest/str-tools/ arithmetic",
       "towns": towns, "size": size, "worked": {"myrtle_beach_oceanfront_2br": mb, "garden_city_2br": gc, "garden_city_2br_manager15": gc_mgr},
       "myrtle_beach_pnl_avg_and_top_quarter": market_pnl, "manager_published": mgr_pub}
json.dump(out, open(os.path.join(HERE, "findings.json"), "w"), indent=1)
print("ok", len(towns), "towns; MB case kept", mb["kept"], "GC kept", gc["kept"], "GC+mgr", gc_mgr["kept"], "top-quarter kept", kept_top)
print("size", size)
for t in towns:
    b = t["by_size"]
    print(f'{t["name"]:20} all {t["gross_avg"]:>6} n {t["listings"]:>5} | 2br {b["2"]["average"]:>6} (mid {b["2"]["median"]:>6}, n {b["2"]["listings"]}) | 3br {b["3"]["average"]:>6} | 4br {b.get("4",{}).get("average","-")} | house {t["house_pct"]}% | Jul/Jan {t["july_over_january"]} summer {t["summer_share_pct"]}% | mid-month {t["month_median"]} top25 {t["month_top25"]} | topQ {t["top_quarter_gross"]}')

# A proposed addition to data/str-market.json, so the size rows and the months come from the one file (for the lead;
# this script does not touch str-market.json). Same AirROI update, checked above against every shared field.
add = {"_for": "data/str-market.json: add to each markets[] entry (lead's decision). Same AirROI update as the file (October 1, 2026).",
       "markets": {t["slug"]: {"bySize": {k: {"listings": v["listings"], "median": v["median"], "average": v["average"], "adr": v["adr"], "occupancy": v["occupancy_pct"]} for k, v in t["by_size"].items()},
                               "months": {r["month"]: r["gross"] for r in t["months"]}, "summerShare": t["summer_share_pct"],
                               "topQuarterGross": t["top_quarter_gross"], "condoPct": t["condo_pct"], "housePct": t["house_pct"]} for t in towns}}
json.dump(add, open(os.path.join(HERE, "str-market-add.json"), "w"), indent=1)
