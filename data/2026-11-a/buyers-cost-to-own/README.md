# Data: /buyers/cost-to-own/ (batch 2026-11-a)

Every number on the page comes from `examples.json`, which `build_examples.py` builds from the files below. Run lines are in each script's header. Big public downloads stay outside the repo (scratch `private/`); each is named with its URL.

| File | Made by | From |
|---|---|---|
| raw/google-suggestions.txt | pull-suggestions.sh | Google search suggestions |
| pums-2024-1yr.json, pums-2024-1yr-rest-of-sc.json | analyze_pums.py | Census ACS PUMS 2024 1-year, SC housing file (csv_hsc.zip) |
| pums-moe.json | pums_moe.py | same, replicate weights |
| raw/tract-to-puma-sc.txt, raw/tigerweb-puma-names.json, raw/PUMS_Data_Dictionary_2024.txt | download | Census |
| ahs-2023-maintenance.json | analyze_ahs.py | Census AHS 2023 national PUF, household.csv |
| ahs-2023-replacements.json | analyze_ahs_jobs.py | same, project.csv + household.csv |
| flood-by-area.json | analyze_flood.py | OpenFEMA NfipPolicies v3 (the /buyers/common-mistakes/ pull) |
| hoa-by-area.json | pull_hoa.py (first version; build_examples.py corrects its $0 fault from the file's own no-fee counts) | the site's public map API, counted in aggregate; no listing saved |
| hoa-horry.json | pull_hoa.py (fixed: tests $0 first; adds the 15 Horry ZIPs together), run 2026-11-02 | the site's public map API; only its horry block is kept |
| photos.json | by hand, checked by tools/photos.js | USGS 2011 oblique aerial, frame 2011_0824_180158d (record holds the provenance) |
| examples.json | build_examples.py | all of the above, plus data/2026-10-d/sell-home-value/findings.json and the 2026 levies |
