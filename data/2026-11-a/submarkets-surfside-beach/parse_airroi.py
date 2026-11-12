"""Parse the AirROI Surfside Beach page (raw/airroi-surfside-beach.html, curl 2026-11-03) into airroi.json:
headline figures, the monthly table for October 2025 to September 2026, and the calendar-month average over two years.
Run: python3 -I parse_airroi.py <datadir>"""
import re, html, json, sys, os
D = sys.argv[1]
t = open(os.path.join(D, "raw/airroi-surfside-beach.html"), errors="ignore").read()
s = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S); s = re.sub(r"<[^>]+>", " ", s); s = html.unescape(s); s = re.sub(r"\s+", " ", s)
s = re.sub(r"&\]:[^>]*>", " ", s); s = re.sub(r"\s+", " ", s)
num = lambda x: float(x.replace("$", "").replace(",", "").replace("%", ""))
months = {}
for m in re.finditer(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20\d\d)\W+(\$[\d,]+)\W+([\d.]+%)\W+(\$[\d,]+)\W+(\$[\d,]+)", s):
    months[m.group(1)] = {"revenue": num(m.group(2)), "occupancy": num(m.group(3)), "adr": num(m.group(4)), "revpar": num(m.group(5))}
cal = {}
for m in re.finditer(r"(January|February|March|April|May|June|July|August|September|October|November|December)\W+(Low|Shoulder|High) season\W+(\$[\d,]+)", s):
    cal[m.group(1)] = {"season": m.group(2), "revenue": num(m.group(3))}
head = {k: re.search(p, s).group(1) for k, p in {"revenue": r"Avg\. annual revenue (\$[\d,]+)", "occupancy": r"Occupancy rate ([\d.]+%)", "adr": r"Avg\. daily rate \(ADR\) (\$[\d,]+)",
        "listings": r"Active Airbnb listings (\d+)", "period": r"(12 months to \w+ \d{4})", "median_month": r"median\) earn about (\$[\d,]+) a month", "top25_month": r"top 25%\) earn (\$[\d,]+)", "bottom25_month": r"bottom 25%\) earn (\$[\d,]+)",
        "updated": r"Updated (\w+ \d+, \d{4})", "permit_share": r"Listings showing a permit (\d+%)"}.items()}
json.dump({"source": "https://www.airroi.com/airbnb-data/united-states/south-carolina/surfside-beach", "read": "2026-11-03", "headline": head, "months": months, "calendar_avg_2yr": cal}, open(os.path.join(D, "airroi.json"), "w"), indent=1)
print(head); print(months); print(cal)
