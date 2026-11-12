"""Rows for the page's two tables, from the ledger rows named in each entry (Blog-Brain batches/2026-11-b/hoa-rental-restrictions/facts.md).
Run: python3 -I build_tables.py <datadir>. Writes table-named-rules.json and table-amend-votes.json.
Each entry names its ledger row and its source file so the builder prints only verified rows."""
import json, sys, os
D = sys.argv[1]
CAM = "https://www.coastalassociationmanagement.com/Site/FileDownload/Index/"
rules = [
  {"place": "Del Webb at Grande Dunes", "kind": "55+ houses and villas", "town": "Myrtle Beach", "rule": "12-month minimum, one lease a year; tenant must meet the 55+ rule for club cards", "night": "no", "season": "no", "year": "yes", "row": [30, 31], "src": "declaration Sec. 2.19; rules 2019", "slug": None},
  {"place": "Seasons at Prince Creek West", "kind": "55+ houses", "town": "Murrells Inlet area", "rule": "One-year minimum; lease states the 55+ purpose", "night": "no", "season": "no", "year": "yes", "row": [33], "src": "charter replica, Art. 10 Sec. 27", "slug": "prince-creek-55"},
  {"place": "Myrtle Trace", "kind": "55+ houses", "town": "Conway", "rule": "A tenant 55 or older must live there full time", "night": "not stated", "season": "not stated", "year": "yes, with the age rule", "row": [35], "src": "owner/tenant agreement, 2021", "slug": None},
  {"place": "The Farm at Carolina Forest", "kind": "houses", "town": "Carolina Forest", "rule": "Renting allowed; no board rule may ban it; board may set up to a 6-month minimum; no cap on rented homes", "night": "not stated", "season": "check", "year": "yes", "row": [37, 38], "src": "declaration Sec. 4.2(vii); rules 2011; minutes May 2026", "slug": "the-farm"},
  {"place": "Robber's Roost at North Myrtle Beach", "kind": "houses", "town": "North Myrtle Beach", "rule": "No lease under one year", "night": "no", "season": "no", "year": "yes", "row": [61], "src": CAM + "3496"},
  {"place": "Surf Estates", "kind": "houses", "town": "Little River Township", "rule": "No weekly or short-term rental; short-term is any use under one year", "night": "no", "season": "no", "year": "yes", "row": [44], "src": CAM + "2429"},
  {"place": "Waterfall", "kind": "houses", "town": "(verifier to confirm)", "rule": "One-year minimum, whole home; Airbnb and VRBO prohibited", "night": "no", "season": "no", "year": "yes", "row": [43], "src": CAM + "2646"},
  {"place": "Sugarloaf", "kind": "houses", "town": "Longs", "rule": "Six-month minimum unless the board approves; no nightly or vacation rental", "night": "no", "season": "6 months or more", "year": "yes", "row": [45], "src": CAM + "3642"},
  {"place": "Bellasera on the Waterway", "kind": "houses", "town": "(verifier to confirm)", "rule": "Six-month minimum, whole home, no hotel use", "night": "no", "season": "6 months or more", "year": "yes", "row": [46], "src": CAM + "3444"},
  {"place": "Coquina Harbour", "kind": "condos on a boat harbor", "town": "Little River", "rule": "12-month minimum lease", "night": "no", "season": "no", "year": "yes", "row": [40, 41], "src": CAM + "3130"},
  {"place": "Intercoastal Village Resort", "kind": "condos", "town": "Little River", "rule": "No lease under one year; $100 a month fine, doubling, for a lease not on file", "night": "no", "season": "no", "year": "yes", "row": [42], "src": CAM + "4463"},
  {"place": "Villa Firenze at Grande Dunes", "kind": "condos", "town": "Myrtle Beach", "rule": "One year, or 6 months with the board's written consent", "night": "no", "season": "6 months with consent", "year": "yes", "row": [47], "src": CAM + "773"},
  {"place": "The Atrium", "kind": "condos on North Ocean Boulevard", "town": "Myrtle Beach", "rule": "Owners voted in 1997: no lease of 30 days or less", "night": "no", "season": "yes, over 30 days", "year": "yes", "row": [48], "src": CAM + "2399"},
  {"place": "North Beach Plantation", "kind": "oceanfront resort", "town": "North Myrtle Beach", "rule": "Master declaration: 'any form of rental'; every guest registers and gets a door fob", "night": "yes", "season": "yes", "year": "yes", "row": [52, 53], "src": CAM + "5456; 5446"},
  {"place": "Sand Dunes Oceanfront Tower", "kind": "oceanfront condos", "town": "Myrtle Beach", "rule": "Units for 'permanent or transient residential use'", "night": "yes", "season": "yes", "year": "yes", "row": [55], "src": CAM + "2357", "slug": "sand-dunes-resort"},
]
votes = [
  {"place": "The Atrium", "vote": "66% of units and of common interest, and first-mortgage holders on 66%", "row": 49, "src": CAM + "2400"},
  {"place": "A Place at the Beach II (Cherry Grove)", "vote": "members owning 75% of the building's value", "row": 50, "src": CAM + "2740"},
  {"place": "Surf Estates", "vote": "owners of 75% of the lots, not counting the developer's; developer consent while it owns a lot", "row": 50, "src": CAM + "2429"},
  {"place": "The Exchange at North Beach Plantation", "vote": "67% of the total vote", "row": 50, "src": CAM + "5446"},
  {"place": "Crescent Shores", "vote": "two-thirds of units and of common interest, and lien holders on two-thirds", "row": 50, "src": CAM + "2409"},
  {"place": "Yacht Club Villas", "vote": "two-thirds of units and of common interest, and lien holders on two-thirds", "row": 50, "src": CAM + "886"},
]
json.dump({"note": "Print only rows the ledger marks verified. 'night', 'season', 'year': whether the posted or recorded rule allows a nightly, a seasonal (1 to 6 months) or a yearly lease.", "rules": rules}, open(os.path.join(D, "table-named-rules.json"), "w"), indent=1)
json.dump({"note": "The vote each document requires to amend itself (ledger rows 49, 50).", "votes": votes}, open(os.path.join(D, "table-amend-votes.json"), "w"), indent=1)
print(len(rules), "rules;", len(votes), "votes")
