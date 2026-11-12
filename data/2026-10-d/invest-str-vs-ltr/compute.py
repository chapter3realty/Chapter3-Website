"""Nightly against yearly, for the same kinds of home, from the raw files in raw/.
Every number on /invest/str-vs-ltr/ comes from findings.json, which this script writes. Nothing is typed.

Inputs (raw/):
  airroi-<market>.html      AirROI market pages read 2026-11-01 (12 months to September 2026)
  FY27_FMRs.xlsx            HUD FY2027 Fair Market Rents (Myrtle Beach-North Myrtle Beach-Conway HUD Metro FMR Area)
  horry-tax-levy-2026.pdf   Horry County certified 2026 levy (mills read by hand into LEVY below, with the line names)
  bls-ces-myrtle-beach-msa.tsv  BLS CES, Myrtle Beach-Conway-North Myrtle Beach MSA, not seasonally adjusted
  census-hvs-tab1_state05_2026_rvr.xlsx  Census HVS rental vacancy by state
  listings-rental-flags.json  pull_listings.py output (CRM active listings, aggregate)

Method, stated once (the ledger repeats it):
  * Nightly "kept" = AirROI's own line "Left for housing costs, then profit" for the market's average and
    top-quarter listing, self-run. For a home size, AirROI's market ratio kept/gross is applied to that size's
    median and average gross (arithmetic of ours, labelled).
  * Yearly "kept" = 12 x HUD FMR for the bedroom count, minus the same utilities dollar line AirROI charges the
    nightly listing in that market (FMR is rent plus utilities, 24 CFR 888.113), minus one month's rent empty
    (a labelled assumption; the 2026 South Carolina rental vacancy rate is printed beside it).
  * Costs that are the same either way (property tax at 6 percent, HOA fee, the loan) are left out of the
    comparison and shown once for the worked condo.
  * Break-even nights = (yearly kept + nightly fixed costs) / (ADR x (1 - AirROI's per-booking cost shares)).
Run: python3 -I compute.py <dir with raw/>  -> writes findings.json beside raw/."""
import json, re, sys, html, os, csv
base = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
raw = os.path.join(base, "raw")

def text(path):
    s = open(path, encoding="utf-8", errors="ignore").read()
    s = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(re.sub(r"\s+", " ", s))
    return re.sub(r'&\]:border-b-0[^">]*">', "|", s)

def money(s):
    return int(s.replace("$", "").replace(",", "").replace("−", "").replace("-", ""))

def airroi(slug):
    t = text(os.path.join(raw, f"airroi-{slug}.html"))
    out = {"slug": slug}
    m = re.search(r"brought in \$([\d,]+) over the 12 months through (\w+ \d{4})", t)
    out["avg_annual_gross"], out["period_to"] = money(m.group(1)), m.group(2)
    out["occupancy_pct"] = float(re.search(r"Occupancy rate ([\d.]+)%", t).group(1))
    out["adr"] = money(re.search(r"Avg\. daily rate \(ADR\) (\$[\d,]+)", t).group(1))
    out["active_listings"] = money(re.search(r"Active Airbnb listings ([\d,]+)", t).group(1))
    pl = re.search(r"Gross bookings (\$[\d,]+) (\$[\d,]+) Running costs", t)
    out["pl_gross"] = [money(pl.group(1)), money(pl.group(2))]
    nb = re.search(r"Nightly bookings (\$[\d,]+) (\$[\d,]+)", t)
    out["pl_nightly"] = [money(nb.group(1)), money(nb.group(2))]
    cl = re.search(r"Cleaning fees guests pay (\d+)% of [\w ]+? bookings (\$[\d,]+) (\$[\d,]+)", t)
    out["pl_cleaning"] = [money(cl.group(2)), money(cl.group(3))]
    out["cleaning_share_pct"] = int(cl.group(1))
    fee = re.search(r"Airbnb's fee About (\d+)%: 15\.5% for the (\d+)% of", t)
    out["airbnb_fee_share_pct"], out["simplified_pricing_share_pct"] = int(fee.group(1)), int(fee.group(2))
    ut = re.search(r"Utilities and internet About (\d+)% of bookings −(\$[\d,]+) −(\$[\d,]+)", t)
    out["utilities_pct"], out["pl_utilities"] = int(ut.group(1)), [money(ut.group(2)), money(ut.group(3))]
    sp = re.search(r"Guest supplies .*? about (\d+)% −(\$[\d,]+) −(\$[\d,]+)", t)
    out["supplies_pct"] = int(sp.group(1))
    rp = re.search(r"Repairs and upkeep .*? about (\d+)% −(\$[\d,]+) −(\$[\d,]+)", t)
    out["repairs_pct"] = int(rp.group(1))
    ins = re.search(r"Short-term rental insurance .*? −(\$[\d,]+) −(\$[\d,]+)", t)
    per = re.search(r"Permit and registration .*? −(\$[\d,]+) −(\$[\d,]+)", t)
    out["fixed_costs"] = money(ins.group(1)) + money(per.group(1))
    tc = re.search(r"Total running costs .*? −(\$[\d,]+) −(\$[\d,]+)", t)
    out["pl_running_costs"] = [money(tc.group(1)), money(tc.group(2))]
    lf = re.search(r"Left for housing costs, then profit (\$[\d,]+) about (\$[\d,]+) a month (\$[\d,]+) about (\$[\d,]+) a month", t)
    out["pl_kept"] = [money(lf.group(1)), money(lf.group(3))]
    sizes = {}
    for m in re.finditer(r"\|(Studio|1 bedroom|2 bedrooms|3 bedrooms|4 bedrooms|5\+ bedrooms) \|([\d,]+) \|(\$[\d,]+) \|(\$[\d,]+) \|(\$[\d,]+) \|(\d+)%", t):
        sizes[m.group(1)] = {"listings": money(m.group(2)), "median_gross": money(m.group(3)), "avg_gross": money(m.group(4)),
                             "adr": money(m.group(5)), "occupancy_pct": int(m.group(6))}
    out["sizes"] = sizes
    months = {}
    for m in re.finditer(r"\|(January|February|March|April|May|June|July|August|September|October|November|December) \|[A-Za-z ]+season \|(\$[\d,]+)", t):
        months.setdefault(m.group(1), money(m.group(2)))
    out["month_avg_gross"] = months
    med = re.search(r"Typical properties \(median\) earn about (\$[\d,]+) a month", t)
    out["median_month_gross_active"] = money(med.group(1)) if med else None
    occ = re.search(r"Strong performers \(top 25%\) fill (\d+)% or more", t)
    out["top_quarter_occ_pct"] = int(occ.group(1)) if occ else None
    occm = re.search(r"Typical properties \(median\) fill about (\d+)% of open nights", t)
    out["median_occ_pct"] = int(occm.group(1)) if occm else None
    st = re.search(r"booking lasts ([\d.]+) nights .*? Listings took about (\d+) bookings each over the year", t)
    out["avg_stay_nights"], out["bookings_per_listing_year"] = float(st.group(1)), int(st.group(2))
    bb = {}
    i = t.find("Days a year Myrtle Beach listings are booked or blocked Days a year") if slug == "myrtle-beach" else -1
    if i < 0:
        i = t.find("are booked or blocked Days a year")
    seg = t[i:i + 400] if i >= 0 else ""
    for m in re.finditer(r"\|(271-366|181-270|91-180|31-90|1-30) days \|([\d.]+)% \|([\d,]+)", seg):
        bb[m.group(1)] = {"share_pct": float(m.group(2)), "listings": money(m.group(3))}
    out["booked_or_blocked_days"] = bb
    return out

def fmr():
    import openpyxl
    ws = openpyxl.load_workbook(os.path.join(raw, "FY27_FMRs.xlsx"), read_only=True).active
    rows = ws.iter_rows(values_only=True); h = next(rows)
    for r in rows:
        if r[3] == "Horry County" and r[0] == "SC":
            d = dict(zip(h, r))
            return {"area": d["hud_area_name"], "0": d["fmr_0"], "1": d["fmr_1"], "2": d["fmr_2"], "3": d["fmr_3"], "4": d["fmr_4"]}

def bls():
    out = {}
    for line in open(os.path.join(raw, "bls-ces-myrtle-beach-msa.tsv")):
        p = line.split()
        if not p or not p[0].startswith("SMU"):
            continue
        out.setdefault(p[0], {})[f"{p[1]}-{p[2]}"] = float(p[3])
    return out

def vacancy():
    import openpyxl
    ws = openpyxl.load_workbook(os.path.join(raw, "census-hvs-tab1_state05_2026_rvr.xlsx"), read_only=True).active
    for r in ws.iter_rows(values_only=True):
        if r and r[0] and str(r[0]).startswith("South Carolina"):
            return {"2026Q1": r[1], "2026Q1_moe": r[2], "2026Q2": r[3], "2026Q2_moe": r[4], "2026Q3": r[5], "2026Q3_moe": r[6]}

# Mills, read from the certified 2026 levy (raw/horry-tax-levy-2026.pdf):
# "TOTAL COUNTY AND SCHOOL PURPOSES ....171.2", "MYRTLE BEACH ....83.4", "CONWAY ....101.3",
# "COUNTY FIRE DISTRICT ....20.2", "COUNTY FIRE APPARATUS REPLACEMENT ....1.5", "WASTE MANAGEMENT ....8.1".
LEVY = {"myrtle_beach_city": 171.2 + 83.4, "conway_city": 171.2 + 101.3, "unincorporated": 171.2 + 20.2 + 1.5 + 8.1}

R = lambda x, n=10: int(round(x / n) * n)

def yearly(fmr_month, utilities):
    gross = 12 * fmr_month
    return {"fmr_month": fmr_month, "gross": gross, "utilities": utilities, "one_month_empty": fmr_month,
            "kept": gross - utilities - fmr_month}

def per_night_kept(a, adr):
    share = (a["airbnb_fee_share_pct"] + a["utilities_pct"] + a["supplies_pct"] + a["repairs_pct"]) / 100
    return adr * (1 - share), share

res = {"airroi": {}, "fmr": fmr(), "levy_mills_6pct": LEVY, "bls": {}, "vacancy_sc": vacancy(), "cases": {}}
for slug in ["myrtle-beach", "conway", "north-myrtle-beach"]:
    res["airroi"][slug] = airroi(slug)
F = res["fmr"]

def case(name, slug, size_key, beds, note):
    a = res["airroi"][slug]
    ratio = a["pl_kept"][0] / a["pl_gross"][0]
    s = a["sizes"].get(size_key)
    y = yearly(F[str(beds)], a["pl_utilities"][0])
    pnk, share = per_night_kept(a, s["adr"] if s else a["adr"])
    be_nights = (y["kept"] + a["fixed_costs"]) / pnk
    out = {
        "note": note, "market": slug, "size": size_key, "beds": beds,
        "market_kept_over_gross": round(ratio, 3),
        "nightly": {
            "size_median_gross": s["median_gross"] if s else None,
            "size_avg_gross": s["avg_gross"] if s else None,
            "size_median_kept": R(s["median_gross"] * ratio, 100) if s else None,
            "size_avg_kept": R(s["avg_gross"] * ratio, 100) if s else None,
            "size_adr": s["adr"] if s else None, "size_occ_pct": s["occupancy_pct"] if s else None,
            "size_listings": s["listings"] if s else None,
            "market_avg_gross": a["pl_gross"][0], "market_avg_kept": a["pl_kept"][0],
            "market_top_quarter_gross": a["pl_gross"][1], "market_top_quarter_kept": a["pl_kept"][1],
        },
        "yearly": y,
        "break_even": {"per_booked_night_kept": round(pnk, 2), "per_booking_cost_share": share,
                       "fixed_costs": a["fixed_costs"], "nights": round(be_nights), "share_of_year_pct": round(100 * be_nights / 365)},
    }
    out["gap_median_minus_yearly"] = (out["nightly"]["size_median_kept"] or 0) - y["kept"]
    out["gap_avg_minus_yearly"] = (out["nightly"]["size_avg_kept"] or 0) - y["kept"]
    out["gap_topq_minus_yearly"] = a["pl_kept"][1] - y["kept"]
    return out

res["cases"]["mb_2br_condo"] = case("mb_2br_condo", "myrtle-beach", "2 bedrooms", 2,
    "Myrtle Beach market (81% of AirROI listings are apartments/condos); two bedrooms is the most common size there (36.6% of entire homes).")
res["cases"]["conway_3br_house"] = case("conway_3br_house", "conway", "3 bedrooms", 3, "Conway market, 106 listings; 23 have three bedrooms.")
res["cases"]["nmb_4br_house"] = case("nmb_4br_house", "north-myrtle-beach", "4 bedrooms", 4, "North Myrtle Beach market; four bedrooms, 644 listings.")

# Full-service management, the owner's observed range (data/str-market.json "management": 40 to 60 percent of
# "gross profit"); applied here to nightly bookings (owner question 1 asks which base is right).
mb = res["airroi"]["myrtle-beach"]
res["mb_full_service"] = {}
for pct in (40, 50, 60):
    res["mb_full_service"][pct] = {
        "average_kept": mb["pl_kept"][0] - round(mb["pl_nightly"][0] * pct / 100),
        "top_quarter_kept": mb["pl_kept"][1] - round(mb["pl_nightly"][1] * pct / 100)}
mbcase = res["cases"]["mb_2br_condo"]
pnk = mbcase["break_even"]["per_booked_night_kept"]
for pct in (40, 60):
    per = mbcase["nightly"]["size_adr"] * pct / 100
    n = (mbcase["yearly"]["kept"] + mb["fixed_costs"]) / (pnk - per)
    res["mb_full_service"][f"break_even_nights_{pct}"] = round(n)
    res["mb_full_service"][f"break_even_share_{pct}"] = round(100 * n / 365)

# Month by month, the average Myrtle Beach listing kept vs a two-bedroom lease kept (both self-run).
ratio = mb["pl_kept"][0] / mb["pl_gross"][0]
order = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
lease_m = mbcase["yearly"]["kept"] / 12
res["mb_months"] = [{"month": m, "nightly_gross": mb["month_avg_gross"][m], "nightly_kept": R(mb["month_avg_gross"][m] * ratio),
                     "lease_kept": R(lease_m), "lease_gross": F["2"]} for m in order]
res["mb_months_below_lease"] = [r["month"] for r in res["mb_months"] if r["nightly_kept"] < r["lease_kept"]]
res["mb_summer_share_pct"] = round(100 * sum(mb["month_avg_gross"][m] for m in ("June", "July", "August")) / sum(mb["month_avg_gross"].values()))

# Work: check-outs a year.
stay = mb["avg_stay_nights"]  # AirROI: "The average Myrtle Beach booking lasts 4.7 nights"
bb = mb["booked_or_blocked_days"]
res["mb_booked_or_blocked_90_or_fewer_pct"] = round(bb["1-30"]["share_pct"] + bb["31-90"]["share_pct"], 1)
res["mb_booked_or_blocked_181_plus_pct"] = round(bb["181-270"]["share_pct"] + bb["271-366"]["share_pct"], 1)
res["checkouts"] = {"avg_stay_nights": stay, "average_listing_bookings_year": mb["bookings_per_listing_year"],
    "break_even": round(mbcase["break_even"]["nights"] / stay),
    "median_occ_full_year": round(365 * mb["median_occ_pct"] / 100 / stay),
    "top_quarter_full_year": round(365 * mb["top_quarter_occ_pct"] / 100 / stay)}

# Taxes on the worked condo: the same either way.
flags_path = os.path.join(raw, "listings-rental-flags.json")
if os.path.exists(flags_path):
    L = json.load(open(flags_path))
    res["listings"] = {k: {"total": v["total"], **v["flags"]} for k, v in L["segments"].items()}
    ex = L.get("examples", {})
    res["listing_examples"] = {k: {kk: vv for kk, vv in v.items() if not kk.endswith("cdf")} for k, v in ex.items()}
    c = ex.get("2br_oceanfront_condo_mb_city_str_allowed")
    mid = None
    if c and c.get("price_median"):
        mid = c["price_median"]
    elif c and c.get("price_median_band") and c["price_median_band"][1]:
        mid = sum(c["price_median_band"]) / 2
    if mid:
        res["mb_condo_tax_6pct"] = {"price_used": mid, "mills": LEVY["myrtle_beach_city"],
                                    "tax": round(mid * 0.06 * LEVY["myrtle_beach_city"] / 1000)}

b = bls()
tn, lh, eh = b.get("SMU45348200000000001", {}), b.get("SMU45348207000000001", {}), b.get("SMU45348206500000001", {})
res["bls"] = {"total_nonfarm_thousands": {k: tn[k] for k in sorted(tn) if k.startswith("2025") or k.startswith("2026")},
              "leisure_hospitality_thousands": {k: lh[k] for k in sorted(lh) if k.startswith("2025") or k.startswith("2026")},
              "education_health_thousands": {k: eh[k] for k in sorted(eh) if k.startswith("2025") or k.startswith("2026")}}
jan, jul = tn.get("2026-M01"), tn.get("2026-M07")
res["bls"]["jan_2026_total"], res["bls"]["jul_2026_total"] = jan, jul
res["bls"]["jan_2026_not_leisure"] = round(jan - lh.get("2026-M01"), 1)
res["bls"]["leisure_jan_to_jul_2026"] = [lh.get("2026-M01"), lh.get("2026-M07")]

json.dump(res, open(os.path.join(base, "findings.json"), "w"), indent=1)
for k, v in res["cases"].items():
    print(k, json.dumps({"nightly": v["nightly"], "yearly": v["yearly"], "break_even": v["break_even"],
                         "gaps": [v["gap_median_minus_yearly"], v["gap_avg_minus_yearly"], v["gap_topq_minus_yearly"]]}))
print("full service", res["mb_full_service"])
print("months below lease", res["mb_months_below_lease"], "summer share", res["mb_summer_share_pct"])
print("checkouts", res["checkouts"]); print("bls", res["bls"]["jan_2026_total"], res["bls"]["jul_2026_total"], res["bls"]["jan_2026_not_leisure"], res["bls"]["leisure_jan_to_jul_2026"])
print("vacancy", res["vacancy_sc"]); print("tax", res.get("mb_condo_tax_6pct"))
