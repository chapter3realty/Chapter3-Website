"""HUD FY2027 Small Area Fair Market Rents, Myrtle Beach metro rows. Run: python3 -I pull_hud.py <datadir> <scratch xlsx path>
Download first (browser user agent): curl -A "Mozilla/5.0 ... Chrome/120" -o <xlsx> https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_safmrs.xlsx
Writes raw/safmr-2027-metro34820.json (every ZIP row of HUD area METRO34820M34820)."""
import sys, json, os, openpyxl
D, X = sys.argv[1], sys.argv[2]
ws = openpyxl.load_workbook(X, read_only=True).active; it = ws.iter_rows(values_only=True); h = [str(c).replace("\n", " ") for c in next(it)]
rows = [dict(zip(h, r)) for r in it if r[1] == "METRO34820M34820"]
json.dump({"source": "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_safmrs.xlsx", "rows": rows}, open(os.path.join(D, "raw", "safmr-2027-metro34820.json"), "w"), indent=0)
print(len(rows), [ (r["ZIP Code"], r["SAFMR 3BR"]) for r in rows if r["ZIP Code"] in ("29566", "29582", "29568", "29579", "29526", "29576", "29575", "29577")])
