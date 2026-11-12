"""Pull the HUD Capital Needs Assessment e-Tool "Estimated Useful Life" (Family column) for the parts of a condo
building that most often come due as one big bill. Source: https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf
(kept as raw/hud-eul-cna-etool.pdf, text by `pdftotext -layout` in raw/hud-eul-cna-etool.txt).
Run: python3 -I eul_subset.py <this dir>. Writes eul-subset.json."""
import sys, os, re, json
d = sys.argv[1] if len(sys.argv) > 1 else "."
WANT = {"3.3.2.4.5": "Exterior paint", "3.3.2.4.1": "Caulking and sealing", "3.3.4.2.3": "Flat roof, rubber membrane",
        "3.3.4.2.4": "Flat roof, TPO or vinyl membrane", "3.3.4.1.1": "Shingle roof", "3.5.1.6": "Elevator machinery",
        "3.5.1.9": "Hydraulic elevator piston", "3.3.3.1.5": "EIFS (foam and stucco-look) walls", "3.3.3.2.3": "Aluminum windows",
        "3.3.2.7.8": "Concrete or steel balconies", "3.3.2.7.12": "Metal railings", "3.2.7.8": "Pool pumps and equipment",
        "3.2.4.1": "Asphalt parking lot"}
rows = []
for line in open(os.path.join(d, "raw", "hud-eul-cna-etool.txt"), encoding="utf8", errors="replace"):
    m = re.match(r"\s*(\d+(?:\.\d+){2,4})\s+(.+?)\s{2,}(\d+)\s+(\d+)\s*$", line)
    if m and m.group(1) in WANT:
        rows.append({"hud_code": m.group(1), "hud_name": m.group(2).strip(), "plain": WANT[m.group(1)], "years_family": int(m.group(3)), "years_elderly": int(m.group(4))})
missing = set(WANT) - {r["hud_code"] for r in rows}
if missing: raise SystemExit("not found: " + ", ".join(sorted(missing)))
rows.sort(key=lambda r: r["years_family"])
json.dump({"source": "https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf", "column": "Family", "rows": rows}, open(os.path.join(d, "eul-subset.json"), "w"), indent=1)
for r in rows: print(r["years_family"], r["plain"], "|", r["hud_name"])
