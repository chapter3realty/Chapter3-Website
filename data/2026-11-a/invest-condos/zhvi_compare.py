"""Zillow Home Value Index (ZHVI, middle tier, smoothed, seasonally adjusted), Myrtle Beach metro:
condos and co-ops against single-family homes. Run: python3 -I zhvi_compare.py <dir>. Reads raw/zhvi-metro-*-mb.csv,
writes zhvi-compare.json (yearly series for the chart and the derived findings)."""
import csv, json, sys
d = sys.argv[1] if len(sys.argv) > 1 else "."
def load(kind, region="Myrtle Beach, SC"):
    rows = list(csv.reader(open(f"{d}/raw/zhvi-metro-{kind}_tier_0.33_0.67-mb.csv")))
    head = rows[0]; r = [x for x in rows[1:] if x[2] == region][0]
    return {head[i][:7]: float(r[i]) for i in range(5, len(head)) if r[i]}
out = {"source": "Zillow Research, ZHVI, Metro, mid tier (33rd to 67th percentile), smoothed, seasonally adjusted, https://www.zillow.com/research/data/ (files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_<kind>_tier_0.33_0.67_sm_sa_month.csv)", "region": "Myrtle Beach, SC metro (Zillow RegionID 394898)"}
S = {k: load(k) for k in ["condo", "sfr", "sfrcondo"]}
US = {k: load(k, "United States") for k in ["condo", "sfr"]}
months = sorted(set(S["condo"]) & set(S["sfr"]))
first, last = months[0], months[-1]
out["first_month"], out["last_month"] = first, last
f = {}
for k in ["condo", "sfr"]:
    s = S[k]
    pre = [m for m in months if m <= "2010-12"]
    peak = max(pre, key=lambda m: s[m]); post = [m for m in months if m > peak and m <= "2016-12"]
    trough = min(post, key=lambda m: s[m])
    rec = next((m for m in months if m > trough and s[m] >= s[peak]), None)
    f[k] = {"first": round(s[first]), "last": round(s[last]), "peak_month": peak, "peak": round(s[peak]),
            "trough_month": trough, "trough": round(s[trough]), "fall_pct": round(100 * (s[trough] / s[peak] - 1), 1),
            "recovered_month": rec, "years_peak_to_recovery": round((int(rec[:4]) * 12 + int(rec[5:]) - int(peak[:4]) * 12 - int(peak[5:])) / 12, 1) if rec else None,
            "change_first_to_last_pct": round(100 * (s[last] / s[first] - 1), 1),
            "change_from_2006_peak_pct": round(100 * (s[last] / s[peak] - 1), 1)}
    for y in ["2019-12", "2021-12"]:
        f[k][f"change_since_{y}_pct"] = round(100 * (s[last] / s[y] - 1), 1)
    ly = f"{int(last[:4]) - 1}{last[4:]}"
    f[k]["change_last_12_months_pct"] = round(100 * (s[last] / s[ly] - 1), 1)
    recent = [m for m in months if m >= "2021-01"]
    rp = max(recent, key=lambda m: s[m]); f[k]["recent_peak_month"] = rp; f[k]["recent_peak"] = round(s[rp])
    f[k]["change_from_recent_peak_pct"] = round(100 * (s[last] / s[rp] - 1), 1)
    u = US[k]; f[k]["us_change_last_12_months_pct"] = round(100 * (u[last] / u[ly] - 1), 1)
    f[k]["us_change_since_2019-12_pct"] = round(100 * (u[last] / u["2019-12"] - 1), 1)
out["findings"] = f
out["condo_as_share_of_house_value"] = {m: round(S["condo"][m] / S["sfr"][m], 3) for m in [first, f["condo"]["peak_month"], f["condo"]["trough_month"], "2019-12", last]}
out["chart_yearly_december"] = [{"year": int(m[:4]), "condo": round(S["condo"][m]), "house": round(S["sfr"][m])} for m in months if m.endswith("-12")] + [{"year": last, "condo": round(S["condo"][last]), "house": round(S["sfr"][last])}]
out["note"] = "ZHVI is a modelled typical value of homes in the middle third, not a sale price. Condo series = Zillow 'Condo/Co-op'; house series = 'Single-Family Homes'."
json.dump(out, open(f"{d}/zhvi-compare.json", "w"), indent=1)
print(json.dumps({k: out[k] for k in ["first_month", "last_month", "findings", "condo_as_share_of_house_value"]}, indent=1))
