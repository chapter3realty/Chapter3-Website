"""Public prices for a pool and gym, read from the saved city pages (raw/), so no price is typed by hand.
- raw/nmb-afc-membership.html: North Myrtle Beach Aquatic & Fitness Center, https://afc.nmb.us/174/Membership
  (read 2026-11-04; "Effective as of September 1, 2026"). Annual membership, paid in full, and the joining fee.
- raw/mb-rec-memberships.html: City of Myrtle Beach recreation center memberships (Pepper Geddings Recreation
  Center, Crabtree Memorial Gymnasium, Mary C. Canty Recreation Center),
  https://cityofmyrtlebeach.com/departments/recreation_center_memberships.php (read 2026-11-04). First table = annual.
- raw/mb-pepper-geddings.html: the Pepper Geddings Recreation Center page (25-yard pool, weight room).
Run: python3 -I extract_prices.py <this dir>. Writes prices.json."""
import re, html, json, os, sys
d = sys.argv[1]
def text(f):
    s = open(os.path.join(d, "raw", f), errors="ignore").read()
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S | re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))
out = {"made": "extract_prices.py", "nmb_aquatic_fitness": {"url": "https://afc.nmb.us/174/Membership"}, "myrtle_beach_rec": {"url": "https://cityofmyrtlebeach.com/departments/recreation_center_memberships.php"}}
t = text("nmb-afc-membership.html")
out["nmb_aquatic_fitness"]["effective"] = re.search(r"Effective as of ([A-Z][a-z]+ \d{1,2}, \d{4})", t).group(1)
for label, key in (("Individual Description One adult person age 24 and up", "individual"), ("Couple Description Married couple residing at the same address. ", "couple"),
                   ("Senior Individual Description One-person age 62 or older", "senior_individual")):
    i = t.index(label); seg = t[i:i + 400]
    out["nmb_aquatic_fitness"][key] = {"joining_fee": int(re.search(r"Joining Fee: \$(\d+)", seg).group(1)),
                                        "annual_paid_in_full": int(re.search(r"Paid in Full: \$(\d+)", seg).group(1))}
s = open(os.path.join(d, "raw", "mb-rec-memberships.html"), errors="ignore").read()
tables = re.findall(r"<table.*?</table>", s, re.S)
rows = [[html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<t[dh].*?</t[dh]>", tr, re.S)] for tr in re.findall(r"<tr.*?</tr>", tables[0], re.S)]
assert "ANNUAL MEMBERSHIP" in re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s.split(tables[0])[0][-3000:]))).upper()
out["myrtle_beach_rec"]["annual"] = {r[0]: {"city_resident": int(r[1].strip("$")), "non_city_resident": int(r[2].strip("$"))} for r in rows if r and r[0] and r[1].startswith("$")}
pg = text("mb-pepper-geddings.html")
out["myrtle_beach_rec"]["pepper_geddings_has"] = [x for x in ("25-Yard Swimming Pool", "Weight Room") if x in pg]
json.dump(out, open(os.path.join(d, "prices.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
