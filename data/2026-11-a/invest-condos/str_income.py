"""str_income.py: what a nightly rental takes in, for /invest/condos/ (fix round 1, 2026-11-03).

Reads two files already in the website repo and writes str-income.json. Run from this folder:
  python3 -I str_income.py .
Inputs:
  ../submarkets-myrtle-beach/raw/airroi-myrtle-beach.txt  AirROI Myrtle Beach market page, text copy
      (https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach, "12 months to
      September 2026", page updated October 1, 2026; ledger rows 30 and 31 of the Myrtle Beach page)
  ../../str-market.json  "management": the owner's observed management ranges (2026-08-15)
"""
import json, re, sys, os
out = sys.argv[1] if len(sys.argv) > 1 else "."
here = os.path.dirname(os.path.abspath(__file__))
raw = open(os.path.join(here, "..", "submarkets-myrtle-beach", "raw", "airroi-myrtle-beach.txt"), encoding="utf8").read()
t = re.sub(r"&\]:[^>]*>", " | ", raw)
t = re.sub(r"\s+", " ", t)
num = lambda s: int(s.replace("$", "").replace(",", "").replace("−", "").replace("-", ""))

# What each home size earns: listings, median, average, nightly rate, occupancy.
sizes = {}
for label in ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms"]:
    m = re.search(re.escape(label) + r" \| ([\d,]+) \| (\$[\d,]+) \| (\$[\d,]+) \| (\$[\d,]+) \| (\d+)%", t)
    assert m, label
    sizes[label] = {"listings": num(m.group(1)), "median_year": num(m.group(2)), "average_year": num(m.group(3)),
                    "nightly_rate": num(m.group(4)), "occupancy_pct": int(m.group(5))}

# The profit table: an average and a top-quarter listing.
def pair(label):
    m = re.search(re.escape(label) + r"[^$]*?([−-]?\$[\d,]+) ([−-]?\$[\d,]+)", t)
    assert m, label
    return num(m.group(1)), num(m.group(2))
gross = pair("Gross bookings")
running = pair("Total running costs About 25% of bookings, plus cleaning paid for by the cleaning fee")
m = re.search(r"Left for housing costs, then profit (\$[\d,]+) about \$[\d,]+ a month (\$[\d,]+)", t)
assert m, "left"
left = (num(m.group(1)), num(m.group(2)))
assert gross[0] - running[0] == left[0] and gross[1] - running[1] == left[1], "profit table does not add up"
period = re.search(r"12 months to (\w+ \d{4})", t).group(1)

mk = json.load(open(os.path.join(here, "..", "..", "str-market.json"), encoding="utf8"))["management"]
res = {
    "source": "AirROI, Myrtle Beach market page (text copy in data/2026-11-a/submarkets-myrtle-beach/raw/airroi-myrtle-beach.txt)",
    "source_url": "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach",
    "period": "12 months to " + period,
    "note": "Annual figures count every active listing, including those open only part of the year. The top-quarter listing earns at the 75th percentile of monthly revenue, over a full year. Running costs: Airbnb's fee, cleaning paid by the cleaning fee, utilities, supplies, repairs, a short-term rental policy and the permit; no manager.",
    "by_size": sizes,
    "average_listing": {"gross": gross[0], "running_costs": running[0], "left_for_housing_costs": left[0]},
    "top_quarter_listing": {"gross": gross[1], "running_costs": running[1], "left_for_housing_costs": left[1]},
    "management": {k: mk[k] for k in ["fullServiceLow", "fullServiceHigh", "fullServiceBase", "fullServiceIncludes", "basicLow", "basicHigh", "basicIncludes", "observedOn", "_note"]},
}
json.dump(res, open(os.path.join(out, "str-income.json"), "w"), indent=1)
print(json.dumps(res, indent=1)[:1500])
