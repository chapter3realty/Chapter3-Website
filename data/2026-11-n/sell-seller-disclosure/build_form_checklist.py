#!/usr/bin/env python3
"""A plain checklist of the SC Residential Property Condition Disclosure Statement (Effective 6/2023; Updated 6/2025) and its Addendum.
Run: python3 -I build_form_checklist.py. Input: raw/sc-disclosure-06-2025.pdf (llr.sc.gov, md5 393ba8c3af8a7a1f0f0a2802e26ecd5c, the same bytes as
data/2026-10-d/buyers-undisclosed-flooding/raw/screc-disclosure-06-2025.pdf) as text by `pdftotext -layout` (raw/sc-disclosure-06-2025.txt).
Each item carries a short phrase copied from the form ("key"); the script stops if any key is not in the form's text, so the checklist
cannot drift from the form. "plain" is our plain-words label for the page. Flags: own = the question says "during your ownership";
water = about water, flooding or the coast; describe = a lettered line (or part IX's unnumbered Yes/No), not a numbered question.
The checklist keeps the main lettered lines only (it folds 5A-B, 7A-B and 14A-D into their questions), so it gives no count of lettered lines.
Writes form-checklist.json."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
T = re.sub(r'\s+', ' ', open(os.path.join(HERE, 'raw', 'sc-disclosure-06-2025.txt'), encoding='utf-8').read())
P = [
 ('I', 'Water and sewer', [
   (1, 'Water supply', 'Problems with the water supply', 0, 1), (2, 'Water quality', 'Problems with water quality', 0, 1),
   (3, 'Water pressure', 'Problems with water pressure', 0, 1), (4, 'Sanitary sewage disposal system for any waste water', 'Problems with the sewer or septic system', 0, 0),
   ('I-A', 'Describe water supply', 'Where the water comes from: city, county, well or other', 0, 0),
   ('I-B', '☐ Septic', 'Where waste water goes: septic, sewer or other', 0, 0),
   ('I-C', 'Describe water pipes', 'What the pipes are made of (PEX, PVC, copper, polybutylene, steel)', 0, 0)]),
 ('II', 'Roof and structure', [
   (5, 'Roof systems', 'Problems with the roof, the year it was put on, and any leaks or repairs while you owned it', 1, 0),
   (6, 'Gutter systems', 'Problems with the gutters', 0, 0),
   (7, 'Foundation, slab, fireplaces, chimneys', 'Problems with the foundation, floors, walls, windows, doors, decks or other structure, the year the house was built, and repairs while you owned it', 1, 0)]),
 ('III', 'Plumbing, electrical, heating and cooling', [
   (8, 'Plumbing system (pipes, fixtures, water heater', 'Problems with the plumbing or water heater', 0, 0),
   (9, 'Electrical system (wiring, panel, fixtures', 'Problems with the wiring or electrical panel', 0, 0),
   (10, 'Appliances (range, stove, ovens', 'Problems with the appliances', 0, 0),
   (11, 'Built-in systems and fixtures (fans, irrigation, pool', 'Problems with built-in systems such as fans, irrigation, a pool or security', 0, 0),
   (12, 'Mechanical systems (pumps, garage door opener', 'Problems with pumps, the garage door opener or other equipment', 0, 0),
   (13, 'Heating system(s) (HVAC components)', 'Problems with the heating', 0, 0),
   (14, 'Cooling system(s) (HVAC components)', 'Problems with the air conditioning, and its type and age', 0, 0)]),
 ('IV', 'Termites and pests', [
   ('IV-A', 'Describe any known present wood problems caused by termites', 'Wood damage from termites, rot or fungus you know of now', 0, 0),
   ('IV-B', 'Describe any termite/pest treatment', 'Any termite treatment or termite bond, and who provides it', 0, 0),
   ('IV-C', 'Describe any known present pest infestations', 'Any pests in the house now', 0, 0)]),
 ('V', 'Rules, permits, title and water', [
   (15, 'Violations or variances of the following: zoning', 'Work done without a permit, or that breaks zoning or the neighborhood rules', 0, 0),
   (16, 'Designation as a historic building', 'Whether the house is in a historic district', 0, 0),
   (17, 'Easements (access, conservation, utility, other)', 'Easements, shared driveways, private roads, or a fence or building over the line', 0, 0),
   (18, 'Legal actions, claims, foreclosures, bankruptcies', 'Lawsuits, liens, foreclosure, bankruptcy, insurance issues or government actions that could affect the title', 0, 0),
   (19, 'Room additions or structural changes to the property during your ownership', 'Rooms added or structure changed while you owned it', 1, 0),
   (20, 'Problems caused by fire, smoke, or water', 'Fire, smoke or water damage while you owned it, including any flooding', 1, 1),
   (21, 'Drainage, soil stability, atmosphere, or underground problems', 'Drainage or soil problems', 0, 1),
   (22, 'Erosion, erosion control, or erosion control structure', 'Erosion, or a seawall, bulkhead or sandbags', 0, 1),
   (23, 'Flood hazards, wetlands, flood hazard designations, flood zones, or flood risk', 'Flood zone, wetlands or flood risk', 0, 1),
   (24, 'Whether the property is currently insured through public', 'Whether the home has flood insurance now', 0, 1),
   (25, 'Private or public flood insurance', 'Flood insurance claims while you owned it, with dates and amounts', 1, 1),
   (26, 'Repairs made to the property as a result of flood events that were NOT filed', 'Flood repairs you paid for without a claim while you owned it', 1, 1),
   (27, 'Has federal flood disaster assistance', 'Federal flood aid (FEMA, SBA or HUD) you received while you owned it', 1, 1),
   (28, 'Whether the property has been assessed for a beach nourishment project', 'A charge for beach renourishment while you owned it', 1, 1),
   ('V-A', 'Describe any green energy, recycling, sustainability or disability features', 'Solar, energy or accessibility features', 0, 0),
   ('V-B', 'Describe any Department of Motor Vehicles titled manufactured housing', 'A manufactured home with a vehicle title on the land', 0, 0)]),
 ('VI', 'Lead, mold and other hazards', [
   ('VI-A', 'Describe any known property environmental contamination problems', 'Lead paint, asbestos, radon, mold, storage tanks or other contamination you know of', 0, 0)]),
 ('VII', 'Leases and vacation rentals', [
   ('VII-A', 'Describe the rental/lease terms', 'Leases and vacation rental bookings that will still be in place at closing', 0, 0),
   ('VII-B', 'State the name and contact information for any property management company', 'The rental manager, if any', 0, 0),
   ('VII-C', 'Describe known outstanding charges owed by tenant', 'Utility bills a tenant still owes', 0, 0)]),
 ('VIII', 'Utility charges', [
   ('VIII-A', 'Describe any utility company financed or leased property', 'Equipment a utility company financed or leases on the property', 0, 0),
   ('VIII-B', "Describe known delinquent charges for real property", 'Unpaid utility bills', 0, 0)]),
 ('IX', 'HOA', [
   ('IX', 'If Yes, owner must complete the attached Residential Property Disclosure', 'Whether an HOA or condo association governs the home (if Yes, fill in the addendum)', 0, 0)]),
]
ADD = [
 (1, 'Are there owners association charges or common area expenses?', 'Association dues or shared costs'),
 (2, 'Are there any owners association or CCRBR resale or rental restrictions?', 'Rules on resale or renting'),
 (3, 'Has the owners association levied any special assessments', 'Special assessments'),
 (4, 'create guest or visitor restrictions?', 'Rules on guests'),
 (5, 'create animal restrictions?', 'Rules on pets'),
 (6, 'Does the property include assigned parking spaces', 'Assigned parking, storage or garages'),
 (7, 'Are keys, key fobs or access codes required', 'Keys, fobs or codes for shared areas'),
 (8, 'Will any membership other than owner association transfer', 'Other memberships that go with the home'),
 (9, 'Are there any known common area problems?', 'Problems in the shared areas'),
 (10, 'Coastal Zone', "Whether the state's coastal zone law applies to the home or shared buildings"),
 (11, 'Is there a transfer fee levied to transfer the property?', 'A transfer fee'),
]
missing = []
def chk(k):
    if re.sub(r'\s+', ' ', k) not in T: missing.append(k)
parts = []
for pid, name, items in P:
    out = []
    for n, key, plain, own, water in items:
        chk(key); out.append({'n': n, 'key': key, 'plain': plain, 'own': bool(own), 'water': bool(water), 'describe': isinstance(n, str)})
    parts.append({'part': pid, 'name': name, 'items': out})
for n, key, plain in ADD: chk(key)
if missing: raise SystemExit('not in the form: %r' % missing)
nums = [i['n'] for p in parts for i in p['items'] if not i['describe']]
assert nums == list(range(1, 29)), nums
res = {'form': 'SC Residential Property Condition Disclosure Statement, Effective 6/2023; Updated 6/2025',
       'source': 'https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf', 'read': '2026-11-08',
       'answers': ['Yes', 'No', 'No Representation'], 'parts': parts,
       'addendum': [{'n': n, 'key': k, 'plain': p} for n, k, p in ADD],
       'counts': {'parts': len(parts), 'numbered': len(nums),
                  'own_years_only': [i['n'] for p in parts for i in p['items'] if i['own']],
                  'water_or_coast': [i['n'] for p in parts for i in p['items'] if i['water']], 'addendum': len(ADD)}}
json.dump(res, open(os.path.join(HERE, 'form-checklist.json'), 'w'), indent=1)
print(json.dumps(res['counts']))
