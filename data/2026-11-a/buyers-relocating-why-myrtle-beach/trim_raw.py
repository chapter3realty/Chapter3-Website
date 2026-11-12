"""Cut the large public downloads in raw/ down to the rows the page uses, so the data folder stays small.
The scripts read the trimmed files the same way. Full files: re-download from the URLs in README.md.
Run once after downloading: python3 -I trim_raw.py <this dir>."""
import csv, sys, os, glob
D = sys.argv[1]; R = os.path.join(D, "raw")
def trim(path, keep):
    rows = list(csv.reader(open(path, encoding="latin-1")))
    hdr = rows[0]; kept = [hdr] + [r for r in rows[1:] if keep(dict(zip(hdr, r)))]
    w = csv.writer(open(path, "w", newline="", encoding="latin-1")); w.writerows(kept); print(path, len(rows) - 1, "->", len(kept) - 1)
for f in glob.glob(os.path.join(R, "countyinflow*.csv")):
    trim(f, lambda r: r["y2_statefips"].zfill(2) == "45" and r["y2_countyfips"].zfill(3) == "051")
for f in glob.glob(os.path.join(R, "countyoutflow*.csv")):
    trim(f, lambda r: r["y1_statefips"].zfill(2) == "45" and r["y1_countyfips"].zfill(3) == "051")
trim(os.path.join(R, "co-est2025-alldata.csv"), lambda r: r["STATE"] == "45" and r["COUNTY"] == "051")
trim(os.path.join(R, "cbsa-est2025-alldata.csv"), lambda r: r["LSAD"] == "Metropolitan Statistical Area")
want = {"45051", "36103", "37019", "37119", "37183", "34029", "36071", "36059", "37047", "36027", "04013", "24005", "09110", "37051", "34025", "42003", "51059", "09003"}
trim(os.path.join(R, "zhvi-county.csv"), lambda r: (r["StateCodeFIPS"].zfill(2) + r["MunicipalCodeFIPS"].zfill(3)) in want)
for f in glob.glob(os.path.join(R, "qcew-*.csv")):
    trim(f, lambda r: r["own_code"] in ("0", "5") and r["industry_code"] == "10")
