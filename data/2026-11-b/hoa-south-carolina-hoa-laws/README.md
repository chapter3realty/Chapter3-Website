# Data for /hoa/south-carolina-hoa-laws/ (batch 2026-11-b)

Every number the page prints comes from these files or from a sibling file named in the ledger. Ledger: Blog-Brain `batches/2026-11-b/hoa-south-carolina-hoa-laws/facts.md`.

| File | What | Made by |
|---|---|---|
| scdca-outcomes.json | SC Consumer Affairs HOA complaints, report years 2023 to 2026 (calendar 2022 to 2025), Horry County and statewide: how each was closed (the agency's Status code), median days to close, and the recommendation choices complainants ticked. Counts only, no names. | scdca_outcomes.py (reads the four workbooks in `../../2026-10-d/hoa-special-assessments/raw/`; the 2026 workbook matched the live file by SHA-1 on 2026-11-10) |
| chart-complaint-outcomes.json | Chart rows: how 416 Horry complaints were closed | build_charts.py |
| chart-what-owners-want.json | Chart rows: what Horry complainants asked the state to change, and who they want to enforce it, each with the sibling page that owns the topic | build_charts.py |
| raw/t27c030-2026-11-10.*, t27c031-*, t27c050-*, t33c031-*, t27c001-* | SC Code chapters read live on 2026-11-10: HOA Act, Horizontal Property Act, disclosure act, Nonprofit Corporation Act, Title 27 Ch. 1 (27-1-60, the flag) | curl, text by a regex strip |
| raw/bill-3350.*, bill-3447.*, bill-366.*, bill-5204.* | The four HOA bills of the 2025-2026 session, status read 2026-11-10 | curl |
| raw/nc-47f-3-107.1.*, raw/fl-720.305.* | North Carolina and Florida fine statutes, for the comparison | curl |
| raw/scdca-hoa-ed.*, scdca-hoa-ed-laws.*, scdca-consumer-resources_consumer-complaints.*, scdca-hoa-faqs.*, scdca-hoa-cans-and-cants.*, scdca-www_consumer_sc_gov_HOA-reports.html | SC Consumer Affairs pages and PDFs: what it does and does not do, how to file, the laws it lists | curl, pdftotext |
| raw/google-suggestions-2026-11-10.txt | Google suggestions for the must-answer list | pull-suggestions.sh |

Rerun: `python3 -I scdca_outcomes.py . ../../2026-10-d/hoa-special-assessments/raw` (needs openpyxl), then `python3 -I build_charts.py .`.

Counting notes: a recommendation cell holds one or more of the form's fixed choices; each choice is counted once per complaint, so shares add to more than 100. "Dispute resolution with the HOA" and "Dispute Resolution within the HOA" are the same choice spelled two ways and are merged. Shares are of complaints (416), not of all recommendations, so they differ from the state report's own percentages.
