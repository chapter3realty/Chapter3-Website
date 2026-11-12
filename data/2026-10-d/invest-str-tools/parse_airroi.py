"""Read the AirROI market pages in raw/ (as published, 12 months to September 2026) into raw/airroi-parsed.json.
Every value is a regex match on the page text, so a changed page fails loudly instead of guessing.
Run: python3 -I parse_airroi.py <this folder>"""
import re, sys, os, json, html
root = sys.argv[1]
TOWNS = ["myrtle-beach", "north-myrtle-beach", "surfside-beach", "garden-city-beach", "murrells-inlet", "pawleys-island", "little-river", "conway"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
def text(p):
    s = open(p, encoding="utf-8", errors="replace").read()
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", s)); t = re.sub(r"\s+", " ", t)
    return re.sub(r"&\]:border-b-0[^>]*?\">", "", t)
def money(x): return int(x.replace("$", "").replace(",", "").replace("+", ""))
def one(pat, t, f=lambda m: m.group(1)):
    m = re.search(pat, t)
    if not m: raise SystemExit("no match: " + pat)
    return f(m)
out = {}
for town in TOWNS:
    t = text(os.path.join(root, "raw", f"airroi-{town}.html"))
    r = {"url": f"https://www.airroi.com/airbnb-data/united-states/south-carolina/{town}"}
    r["period"] = one(r"over the 12 months through (\w+ \d{4})", t)
    r["updated"] = one(r"Updated (\w+ \d+, \d{4})", t)
    r["revenue"] = money(one(r"Avg\. annual revenue (\$[\d,]+)", t))
    r["revenue_change_pct"] = float(one(r"Avg\. annual revenue \$[\d,]+ ([+−-][\d.]+)% on the year before", t).replace("−", "-"))
    r["occupancy_pct"] = float(one(r"Occupancy rate ([\d.]+)%", t))
    r["adr"] = money(one(r"Avg\. daily rate \(ADR\) (\$[\d,]+)", t))
    r["revpar"] = money(one(r"RevPAR (\$[\d,]+) Revenue per open night", t))
    r["listings"] = money(one(r"Active Airbnb listings ([\d,]+)", t))
    r["lead_days"] = int(one(r"Avg\. booking lead time (\d+) days", t))
    r["peak_month"] = one(r"Peak revenue month (\w+)", t); r["low_month"] = one(r"Lowest revenue month (\w+)", t)
    m = re.search(r"From a year earlier, [^.]*\.", t)
    r["yoy_sentence"] = m.group(0) if m else None
    r["top3_share_pct"] = int(one(r"The three strongest months bring in (\d+)% of a full year", t))
    r["multiple_sentence"] = one(r"(in \w+ , usually the best month, the average listing earns about [\w.]+ times as much as in \w+ , usually the slowest)", t)
    cal = re.search(r"by calendar month Month Season Revenue per listing (.*?) Average monthly Airbnb revenue", t).group(1)
    r["calendar_month_revenue"] = {mo: money(re.search(mo + r" (?:Low|High|Shoulder|Peak)[\w ]*? season (\$[\d,]+)", cal).group(1)) for mo in MONTHS}
    r["calendar_month_season"] = {mo: re.search(mo + r" ((?:Low|High|Shoulder|Peak)[\w ]*? season)", cal).group(1) for mo in MONTHS}
    r["seasons_sentence"] = one(r"(has (?:one|two) high seasons?, [^.]*\.)", t)
    rows = re.findall(r"(Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug) (20\d\d) (\$[\d,]+) ([\d.]+)% (\$[\d,]+) (\$[\d,]+) (\d+) days ([\d.]+) nights", t)
    r["last12_months"] = [{"month": f"{a} {b}", "revenue": money(c), "occupancy_pct": float(d), "adr": money(e)} for a, b, c, d, e, f_, g, h in rows][:12]
    r["tiers_month"] = {
        "top10": money(one(r"Best-in-class properties \(top 10%\) earn (\$[\d,]+)\+ a month", t)),
        "top25": money(one(r"Strong performers \(top 25%\) earn (\$[\d,]+) or more, roughly", t)),
        "median": money(one(r"Typical properties \(median\) earn about (\$[\d,]+) a month", t)),
        "bottom25": money(one(r"Entry-level properties \(bottom 25%\) earn (\$[\d,]+) or less, about [^.]*? of the median\. These are monthly figures", t)),
    }
    pl = re.search(r"Nightly bookings (\$[\d,]+) (\$[\d,]+) Cleaning fees guests pay (\d+)% of [\w .]+? bookings (\$[\d,]+) (\$[\d,]+) Gross bookings (\$[\d,]+) (\$[\d,]+)", t)
    r["pnl"] = {"nightly": [money(pl.group(1)), money(pl.group(2))], "cleaning_share_pct": int(pl.group(3)), "cleaning": [money(pl.group(4)), money(pl.group(5))], "gross": [money(pl.group(6)), money(pl.group(7))]}
    for key, pat in [("airbnb_fee", r"Airbnb's fee About (\d+)%[^−]*?−(\$[\d,]+) −(\$[\d,]+)"), ("utilities", r"Utilities and internet About (\d+)% of bookings −(\$[\d,]+) −(\$[\d,]+)"),
                     ("supplies", r"Guest supplies [^−]*?about (\d+)% −(\$[\d,]+) −(\$[\d,]+)"), ("repairs", r"Repairs and upkeep [^−]*?about (\d+)% −(\$[\d,]+) −(\$[\d,]+)")]:
        m = re.search(pat, t); r["pnl"][key] = {"pct": int(m.group(1)), "avg": money(m.group(2)), "top25": money(m.group(3))}
    r["pnl"]["insurance"] = money(one(r"Short-term rental insurance [^−]*?−(\$[\d,]+)", t))
    r["pnl"]["permit"] = money(one(r"Permit and registration [^−]*?−(\$[\d,]+)", t))
    r["left_month_avg"] = money(one(r"about (\$[\d,]+) a month of that is left after running costs", t))
    r["left_month_top25"] = money(one(r"A listing in the top quarter leaves about (\$[\d,]+) a month", t))
    r["left_year_avg"] = money(one(r"(\$[\d,]+) a year \(about \$[\d,]+ a month\) is left before the mortgage", t))
    sizes = {}
    for b, lab in [("1", "1 bedroom"), ("2", "2 bedrooms"), ("3", "3 bedrooms"), ("4", "4 bedrooms"), ("5+", "5\\+ bedrooms")]:
        m = re.search(r"Occupancy (?:.*? )?" + lab + r" (\d+) (\$[\d,]+) (\$[\d,]+) (\$[\d,]+) (\d+)%", t) or re.search(lab + r" ([\d,]+) (\$[\d,]+) (\$[\d,]+) (\$[\d,]+) (\d+)%", t)
        if m: sizes[b] = {"listings": money(m.group(1)), "median": money(m.group(2)), "average": money(m.group(3)), "adr": money(m.group(4)), "occupancy_pct": int(m.group(5))}
    r["by_size"] = sizes
    bb = re.search(r"Days a year [\w .]+? listings are booked or blocked Days a year Share of listings Listings (.*?) What Is the Average", t).group(1)
    r["booked_or_blocked"] = {k: float(v) for k, v in re.findall(r"(\d+-\d+ days) ([\d.]+)%", bb)}
    od = re.search(r"Days a year [\w .]+? listings are open to guests Days a year Share of listings Listings (.*?) Days a year", t).group(1)
    r["open_days"] = {k: float(v) for k, v in re.findall(r"(\d+-\d+ days) ([\d.]+)%", od)}
    r["avg_stay_nights"] = float(one(r"booking lasts ([\d.]+) nights", t))
    r["bookings_per_listing"] = int(one(r"Listings took about (\d+) bookings each", t))
    r["cleaning_fee_median"] = money(one(r"Median cleaning fee (\$[\d,]+)", t))
    r["cleaning_fee_avg"] = money(one(r"Average cleaning fee (\$[\d,]+)", t))
    r["professional_mgmt_pct"] = float(one(r"Professional management ([\d.]+)%", t))
    r["house_pct"] = float(re.search(r"House ([\d.]+)% [\d,]+", t).group(1)) if re.search(r"House ([\d.]+)% [\d,]+", t) else None
    r["condo_pct"] = float(re.search(r"Apartment/Condo ([\d.]+)% [\d,]+", t).group(1)) if re.search(r"Apartment/Condo ([\d.]+)% [\d,]+", t) else None
    r["permit_shown_pct"] = one(r"Listings showing a permit (\d+%)", t)
    m = re.search(r"(Guests book [\w .]+? stays \d+ days ahead[^.]*\.(?: [^.]*?furthest[^.]*\.)?)", t); r["lead_sentence"] = m.group(1) if m else None
    out[town] = r
    print(town, r["revenue"], r["revenue_change_pct"], r["listings"], r["occupancy_pct"], r["adr"], r["top3_share_pct"], r["yoy_sentence"], sizes.get("2"), sizes.get("3"), flush=True)
json.dump(out, open(os.path.join(root, "raw", "airroi-parsed.json"), "w"), indent=1)
