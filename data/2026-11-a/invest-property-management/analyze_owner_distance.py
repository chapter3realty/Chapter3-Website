"""Summarise raw/owner-distance.json: for homes taxed at the 4 and 6 percent ratios, condo and other,
the share whose tax bill goes to a local address, elsewhere in SC, NC, another state, or abroad.
Local = the 21 ZIP codes of Horry County post offices plus 29585 (Pawleys Island, the south end of the Grand Strand).
Run: python3 -I analyze_owner_distance.py <datadir>. Writes owner-distance.json."""
import json, sys
D = sys.argv[1]; raw = json.load(open(D + "/raw/owner-distance.json"))
LOCAL = {"29511","29526","29527","29528","29544","29545","29566","29568","29569","29572","29575","29576","29577","29578","29579","29581","29582","29587","29588","29597","29598","29585"}
US = set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR VI GU AE AP AA".split())
out = {"read": raw["read"], "local_zips": sorted(LOCAL), "groups": {}}
for k, v in raw["q"].items():
    st = v["by_state"]; z = v["sc_by_zip"]; n = v["count"]
    local = sum(c for zz, c in z.items() if zz in LOCAL)
    sc = st.get("SC", 0); nc = st.get("NC", 0)
    other_us = sum(c for s, c in st.items() if s in US and s not in ("SC", "NC"))
    blank = sum(c for s, c in st.items() if s in ("",))
    abroad = n - sc - nc - other_us - blank
    g = {"count": n, "local": local, "sc_elsewhere": sc - local, "nc": nc, "other_states": other_us, "abroad": abroad, "blank": blank}
    g["pct"] = {x: round(100 * g[x] / n, 1) for x in ("local", "sc_elsewhere", "nc", "other_states", "abroad", "blank")}
    g["not_local"] = n - local; g["pct_not_local"] = round(100 * (n - local) / n, 1)
    g["top_states_outside_sc"] = sorted(((s, c) for s, c in st.items() if s != "SC" and s), key=lambda x: -x[1])[:8]
    out["groups"][k] = g
a = out["groups"]
t6 = {x: a["other6_condo"][x] + a["other6_house_other"][x] for x in ("count", "local", "sc_elsewhere", "nc", "other_states", "abroad", "blank", "not_local")}
t6["pct_not_local"] = round(100 * t6["not_local"] / t6["count"], 1); t6["pct_local"] = round(100 * t6["local"] / t6["count"], 1)
out["all_6pct"] = t6
t4 = {x: a["res4_condo"][x] + a["res4_house_other"][x] for x in ("count", "local")}
out["all_4pct"] = t4
json.dump(out, open(D + "/owner-distance.json", "w"), indent=1)
print(json.dumps(out, indent=1))

# Second pass: leave out mailing addresses that receive 10 or more 6 percent tax bills (raw/bulk-addresses.json):
# timeshare and resort companies, builders, large landlords and managers. What remains is closer to individual owners.
bulk = json.load(open(D + "/raw/bulk-addresses.json"))
ind = {}
for k in ("condo", "house_other"):
    g = dict(a["other6_" + k]); rows = bulk["q"][k]["groups"]
    b = {"count": 0, "local": 0, "sc_elsewhere": 0, "nc": 0, "other_states": 0, "abroad": 0}
    for street, z, s, n in rows:
        b["count"] += n
        if s == "SC" and z in LOCAL: b["local"] += n
        elif s == "SC": b["sc_elsewhere"] += n
        elif s == "NC": b["nc"] += n
        elif s in US: b["other_states"] += n
        else: b["abroad"] += n
    r = {x: g[x] - b[x] for x in b}
    r["not_local"] = r["count"] - r["local"]; r["pct_not_local"] = round(100 * r["not_local"] / r["count"], 1)
    r["pct"] = {x: round(100 * r[x] / r["count"], 1) for x in ("local", "sc_elsewhere", "nc", "other_states", "abroad")}
    r["bulk_addresses"] = len(rows); r["bulk_homes"] = b["count"]; r["bulk_local"] = b["local"]
    ind[k] = r
t = {x: ind["condo"][x] + ind["house_other"][x] for x in ("count", "local", "sc_elsewhere", "nc", "other_states", "abroad", "not_local", "bulk_homes", "bulk_addresses")}
t["pct_not_local"] = round(100 * t["not_local"] / t["count"], 1)
t["pct_out_of_state"] = round(100 * (t["nc"] + t["other_states"] + t["abroad"]) / t["count"], 1)
ind["all"] = t
out["individual_6pct"] = ind
json.dump(out, open(D + "/owner-distance.json", "w"), indent=1)
print(json.dumps(ind, indent=1))
