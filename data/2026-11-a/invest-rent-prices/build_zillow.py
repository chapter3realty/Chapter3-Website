"""Zillow research data (https://www.zillow.com/research/data/; files at files.zillowstatic.com/research/public_csvs/),
Myrtle Beach metro (RegionID 394898) and the Horry County ZIPs Zillow covers. Run: python3 -I build_zillow.py <datadir>.
Reads raw/zillow/*.csv (each the header plus the metro row and the Horry and Georgetown County ZIP rows of the full file), writes zillow.json.
ZORI: Zillow Observed Rent Index, typical asking rent of listed rentals (the middle of the market, 35th to 65th percentile),
  smoothed (sm) and smoothed and seasonally adjusted (sm_sa). sfrcondomfr = all homes; sfr = single-family houses; mfr = apartments.
ZHVI: Zillow Home Value Index, typical home value (35th to 65th percentile), smoothed and seasonally adjusted.
Seasonality: for each calendar month, the average of (sm / sm_sa - 1) over every year with both values."""
import csv, json, os, sys
D = sys.argv[1]; Z = os.path.join(D, "raw", "zillow")
def series(fname, key, val):
    with open(os.path.join(Z, fname), newline="") as f:
        for r in csv.DictReader(f):
            if r.get(key) == val:
                return {k: round(float(v), 1) for k, v in r.items() if k[:2] == "20" and v not in ("", None)}
    return None
M = "394898"
out = {"source": "Zillow research data, https://www.zillow.com/research/data/", "metro": "Myrtle Beach, SC (Zillow RegionID 394898)", "series": {}}
for name, f in [("zori_all_sm", "Metro_zori_uc_sfrcondomfr_sm_month.csv"), ("zori_all_sm_sa", "Metro_zori_uc_sfrcondomfr_sm_sa_month.csv"),
                ("zori_house_sm", "Metro_zori_uc_sfr_sm_month.csv"), ("zori_apartment_sm", "Metro_zori_uc_mfr_sm_month.csv"),
                ("zhvi_all_mid", "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"), ("zhvi_house_mid", "Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv")]:
    out["series"][name] = series(f, "RegionID", M)
S = out["series"]
last = max(S["zori_all_sm"]); out["latest_month"] = last
def at(name, m): return S[name].get(m)
def pct(a, b): return round(100 * (b / a - 1), 1)
y1 = str(int(last[:4]) - 1) + last[4:]
if y1 not in S["zori_all_sm"]: y1 = [m for m in S["zori_all_sm"] if m.startswith(str(int(last[:4]) - 1) + last[4:7])][0]
out["latest"] = {k: at(k, last) for k in S}
out["change_12m_pct"] = {k: pct(at(k, y1), at(k, last)) for k in S if at(k, y1)}
# Peak of the house rent index, and change since then
for k in ("zori_house_sm", "zori_all_sm"):
    pk = max(S[k], key=lambda m: S[k][m]); out.setdefault("peak", {})[k] = {"month": pk, "value": S[k][pk], "change_since_pct": pct(S[k][pk], at(k, last))}
# Rent against value since each start month (same months in both series)
def growth(start):
    return {k: pct(at(k, start), at(k, last)) for k in ("zori_house_sm", "zori_all_sm", "zhvi_house_mid", "zhvi_all_mid") if at(k, start)}
out["growth_since"] = {s: growth(s) for s in [m for m in S["zori_house_sm"] if m[5:7] == last[5:7]]}
# Yearly rent as a share of the typical house value (gross yield), each September
out["house_rent_x12_over_value_pct"] = {m[:4]: round(100 * 12 * S["zori_house_sm"][m] / S["zhvi_house_mid"][m], 2) for m in S["zori_house_sm"] if m[5:7] == last[5:7] and m in S["zhvi_house_mid"]}
# Seasonality
sm, sa = S["zori_all_sm"], S["zori_all_sm_sa"]
by = {}
for m in sm:
    if m in sa: by.setdefault(m[5:7], []).append(sm[m] / sa[m] - 1)
out["seasonal_pct_by_month"] = {mm: round(100 * sum(v) / len(v), 2) for mm, v in sorted(by.items())}
out["seasonal_years"] = sorted({m[:4] for m in sm if m in sa})
# ZIPs
zips = {}
with open(os.path.join(Z, "Zip_zori_uc_sfrcondomfr_sm_month.csv"), newline="") as f:
    for r in csv.DictReader(f):
        if r["CountyName"] in ("Horry County", "Georgetown County") and r["State"] == "SC":
            s = {k: float(v) for k, v in r.items() if k[:2] == "20" and v}
            if last in s:
                zips[r["RegionName"]] = {"city": r["City"], "county": r["CountyName"], "latest": round(s[last]), "first_month": min(s),
                                         "change_12m_pct": pct(s[y1], s[last]) if y1 in s else None}
out["zips_all_homes"] = dict(sorted(zips.items()))
json.dump(out, open(os.path.join(D, "zillow.json"), "w"), indent=1)
print("latest", last, out["latest"]); print("12m", out["change_12m_pct"]); print("peak", out["peak"])
for s in ("2015-09-30", "2019-09-30", "2021-09-30", "2022-09-30"):
    print("since", s, out["growth_since"].get(s))
print("yield", out["house_rent_x12_over_value_pct"]); print("seasonal", out["seasonal_pct_by_month"], out["seasonal_years"])
print(json.dumps(out["zips_all_homes"], indent=0))
