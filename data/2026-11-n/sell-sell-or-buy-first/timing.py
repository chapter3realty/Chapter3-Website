"""How long a sale takes in the Myrtle Beach area today: Zillow's median days to pending (listing to contract) and mean days
to close (contract to closing), last 12 months, from the raw metro files already pulled for /sell/best-time-to-sell/.
Usage: python3 -I timing.py <this dir> <best-time-to-sell data dir>   -> timing.json"""
import csv, json, os, sys, statistics
D, B = sys.argv[1], sys.argv[2]
def row(measure, region):
    f = os.path.join(B, "raw", f"zillow-Metro_{measure}_uc_sfrcondo_month.csv")
    r = list(csv.reader(open(f)))
    h = r[0]; x = [z for z in r[1:] if z[2] == region][0]
    return {h[i]: float(x[i]) for i in range(5, len(h)) if x[i]}
out = {"meta": {"made": "timing.py", "source": "Zillow Research metro files (raw, not smoothed), med_doz_pending and mean_days_to_close, sfrcondo, files in data/2026-11-n/sell-best-time-to-sell/raw/; region 'Myrtle Beach, SC' (RegionID 394898) and 'United States'"}}
for reg in ("Myrtle Beach, SC", "United States"):
    o = {}
    for m in ("med_doz_pending", "mean_days_to_close"):
        s = row(m, reg); k = sorted(s)[-12:]
        o[m] = {"months": [k[0], k[-1]], "avg_last_12": round(statistics.mean(s[z] for z in k), 1), "min_last_12": min(s[z] for z in k), "max_last_12": max(s[z] for z in k), "latest": [k[-1], s[k[-1]]]}
    o["listing_to_closing_days_last_12"] = round(o["med_doz_pending"]["avg_last_12"] + o["mean_days_to_close"]["avg_last_12"], 1)
    out[reg] = o
json.dump(out, open(os.path.join(D, "timing.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
