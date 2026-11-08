"""Chart-ready file for /sell/best-time-to-sell/. Reads findings.json and zillow-months.json, writes chart-months.json.
Usage: python3 -I build_charts.py <datadir>"""
import sys, os, json
D = sys.argv[1]
F = json.load(open(os.path.join(D, "findings.json")))["summary"]; Z = json.load(open(os.path.join(D, "zillow-months.json")))
M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
rows = []
for i, name in enumerate(M, 1):
    k = str(i)
    rows.append({"month": name,
        "closings_share_pct": F["resale_all"]["typical_month"][k]["avg_share_of_year_pct"],
        "closings_5yr": F["resale_all"]["pooled_5yr_by_month"][k]["n"],
        "price_vs_nearby_months_pct": F["resale_all"]["centred_13mo"][k]["avg_pct"],
        "house_price_vs_nearby_months_pct": F["resale_house"]["centred_13mo"][k]["avg_pct"],
        "condo_price_vs_nearby_months_pct": F["resale_condo"]["centred_13mo"][k]["avg_pct"],
        "house_closings_share_pct": F["resale_house"]["typical_month"][k]["avg_share_of_year_pct"],
        "condo_closings_share_pct": F["resale_condo"]["typical_month"][k]["avg_share_of_year_pct"],
        "out_of_state_buyer_pct": F["out_of_state_by_month"]["by_month"][k]["pct"],
        "days_to_contract_median": Z["med_doz_pending"]["avg_by_month"][k],
        "new_listings": round(Z["new_listings"]["avg_by_month"][k]),
        "new_contracts": round(Z["new_pending"]["avg_by_month"][k]),
        "days_contract_to_close_mean": Z["mean_days_to_close"]["avg_by_month"][k],
        "sale_to_list_pct": round(100 * Z["median_sale_to_list"]["avg_by_month"][k], 2),
        "share_price_cut_pct": round(100 * Z["perc_listings_price_cut"]["avg_by_month"][k], 1)})
json.dump({"meta": {"made": "build_charts.py", "closings": "Horry County deeds, resales, full years 2021-2025 (findings.json)", "listings": "Zillow Research metro files, Myrtle Beach, SC, 2018-2025 without 2020-2021 (zillow-months.json)"}, "months": rows}, open(os.path.join(D, "chart-months.json"), "w"), indent=1)
for r in rows: print(r)
