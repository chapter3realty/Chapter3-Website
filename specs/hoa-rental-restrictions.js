/* /hoa/rental-restrictions/ - can an HOA or a condo association ban or limit renting in Myrtle Beach: the South Carolina
 * law in four lines, the city and the papers as two gates, the rental rules of 15 named Grand Strand communities from
 * their own posted or recorded papers, how a rule changes after you buy (a real 1998 amendment and the votes other
 * papers require), Airbnb versus a yearly lease in the listing counts, what renters do to a condo loan, the rules written
 * only for renters, and how we find out for one home before an offer.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec, and it replaces the page at the same URL.
 * Plan: Blog-Brain batches/2026-11-b/hoa-rental-restrictions/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows,
 * and CORRECTED rows (4, 18, 26, 41, 52, 55, 56, 57, 58, 59) only in the verifier's wording (VERIFY.md). Struck wording:
 * batches/2026-11-b/facts/hoa-rental-restrictions-struck.json. Sibling rows used: invest-condo-buildings row 38 (Sand Dunes'
 * water park and lazy river), named by this ledger's row 55.
 * Data, never typed: data/2026-11-b/hoa-rental-restrictions/ (pull-2026-11-10/findings.json for the listing counts,
 * table-named-rules.json for the places, their ledger rows and their documents, table-amend-votes.json for the votes,
 * community-papers.json for the amendment counts). Corrected values the files do not hold (the verifier's towns, row 56's
 * Berkshire Forest count) are typed with the row number beside each and a check that fails if the file moves.
 * Kept from the live page: the two sets of rules (now a small table), the forms a rule takes (now real local rules), the
 * offer to read the rules before an offer, the FAQ questions on renting and on a rule added after you buy.
 * Cut from the live page: the home-office story (not in stories.json), "the city permit you were counting on is worthless",
 * "quietly ends", "waiting periods", the pets-and-porches paragraph, "Plenty of our clients specifically want ...",
 * "Verified July 2026". City and county rental law stays on /invest/str-rules/: one table and a link here.
 * Design, as /invest/condotel-financing/ and /submarkets/garden-city/: the italic line at about half the H1's size, one card
 * style for the chart and the offers, plain tables and lists under thin rules, one block width of 720 px, an offer after
 * about every second section tied to what it answered.
 * Owner, 2026-11-10: each place this page sells leads with a true, sourced wow; strip titles are bold and personal; every
 * request button links to /contact/ and the site opens the short pop-up. Places with no verified wow are not sold: their
 * rules sit in one plain table, each linked to its own document.
 * Homes: strips for seven places (sand-dunes-resort, the-farm and prince-creek-55 exist in Blog-Brain
 * batches/2026-10-b/data/idx-places.json; north-beach-plantation, coquina-harbour, del-webb-grande-dunes, myrtle-trace and
 * the no-HOA nightly houses are new). Each needs this URL in its pages, and this URL's feed needs withStrips: true. Both
 * are for the lead (BUILD.md); until then each strip shows its offer.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/hoa/rental-restrictions/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "hoa-rental-restrictions");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("pull-2026-11-10/findings.json"), NR = read("table-named-rules.json").rules;
const AV = read("table-amend-votes.json").votes, CP = read("community-papers.json").counts;
const must = (ok, msg) => { if (!ok) throw new Error(`hoa-rental-restrictions.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const NB = " ";

/* ---------------------------------------------------------------------------- */
/* The listing counts (rows 1 to 5, 9), each checked against its row.             */

const PULLED = new Date(F.pulled);
must(!isNaN(PULLED), "findings.json pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const T = F.by_type;
const HH = T.house_with_hoa_fee, HN = T.house_no_hoa_fee, TH = T.townhouse_with_hoa_fee, CO = T.condo_all;
must(HH.listings === 2140 && HH.nightly === 92 && HN.listings === 795 && HN.nightly === 251, "row 2 moved");
must(TH.listings === 283 && TH.nightly === 68, "row 3 moved");
must(CO.listings === 2704 && CO.nightly === 1936, "row 1 moved");
const CONDO_TEN = Math.round(CO.nightly / CO.listings * 10);
must(CONDO_TEN === 7, "row 1: no longer about 7 in 10");
/* Row 4, CORRECTED: "27 of 119 (fewer than 1 in 4)"; "86 (about 6 in 10)". */
const NMB = F.by_area.north_myrtle_beach;
must(NMB.house_with_hoa_fee.listings === 119 && NMB.house_with_hoa_fee.nightly === 27 && NMB.house_no_hoa_fee.listings === 135 && NMB.house_no_hoa_fee.nightly === 86, "row 4 moved");
must(NMB.house_with_hoa_fee.nightly / NMB.house_with_hoa_fee.listings < 0.25 && Math.round(NMB.house_no_hoa_fee.nightly / NMB.house_no_hoa_fee.listings * 10) === 6, "row 4 shares moved");
/* Row 5: every Carolina Forest house for sale has an HOA fee, and 1 says nightly rentals are allowed. */
const CF = F.by_area.carolina_forest;
must(CF.house_with_hoa_fee.listings === 297 && CF.house_with_hoa_fee.nightly === 1 && CF.house_no_hoa_fee.listings === 0, "row 5 moved");

/* The chart (rows 2, 3): one message in its title. The condo bar is left out (/invest/condos/ owns that share). */
const shareText = (k, n) => { const p = k / n; return p < 0.1 ? `about ${Math.round(p * 100)} in 100` : p > 0.22 && p < 0.28 ? "about 1 in 4" : `about ${Math.round(p * 10)} in 10`; };
must(shareText(HH.nightly, HH.listings) === "about 4 in 100" && shareText(TH.nightly, TH.listings) === "about 1 in 4" && shareText(HN.nightly, HN.listings) === "about 3 in 10", "rows 2 and 3: the shares in words moved");
const pct = (r) => Math.round(r.nightly / r.listings * 1000) / 10;
const NIGHT_CHART = G.bars([
  { name: "Houses with an HOA fee", value: pct(HH), valueText: shareText(HH.nightly, HH.listings) },
  { name: "Townhouses with an HOA fee", value: pct(TH), valueText: shareText(TH.nightly, TH.listings) },
  { name: "Houses with no HOA fee", value: pct(HN), valueText: shareText(HN.nightly, HN.listings) },
], {
  caption: "Few houses with an HOA fee say nightly rentals are allowed",
  nameLabel: "Kind of home for sale", valueLabel: "Say nightly rentals are allowed", max: 40, compact: true,
  note: `Homes for sale in Horry County, our count of the rental flags on each listing on ${PULL_DAY}. It covers ${n0(HH.listings)} houses with an HOA fee, ${n0(TH.listings)} townhouses and ${n0(HN.listings)} houses with no fee. A listing that does not say so may have a ban, a limit or a blank field.`,
});

/* ---------------------------------------------------------------------------- */
/* Photos (records in data/2026-11-b/hoa-rental-restrictions/photos.json, copied from the pages that first showed them;
   both public domain, looked at full size again for this page). The harbour aerial shows Coquina Harbour's slips, beside
   its entry. The towers aerial shows oceanfront condo towers, beside the sentence on condos; it is also the share image. */
const PHOTOS = read("photos.json").photos;
const TOWERS = PH.findPhoto(PHOTOS, "myrtle-beach-oceanfront-towers-2011");
const HARBOUR = PHOTOS.find((r) => r.file.endsWith("/little-river-harbours-from-above-1200w.webp"));
must(HARBOUR, "no record for the harbour aerial");
const photo = (rec, caption) => PH.heroPhoto(rec, { alt: rec.alt, caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
/* The harbour aerial has labels burned in, one in the bottom-right corner where the credit sits, and US 17 at the top. It
   keeps its 4:3 frame at every width (a 16:9 cut would crop the US 17 label), and its credit goes under the photo, in small
   grey type above the caption, so no words sit on the labels at any width (review round 1). */
const HARBOUR_PHOTO = (() => {
  const raw = photo(HARBOUR, "Coquina Harbour and Lightkeepers Village share one marina basin between US 17 and the Intracoastal Waterway in Little River.");
  const cr = (raw.match(/<span class="c3ph-cr">[\s\S]*?<\/span>/) || [])[0];
  must(cr, "harbour photo has no credit overlay");
  const under = cr.replace('<span class="c3ph-cr">', '<span class="c3ph-cr" style="position:static;display:block;background:none;color:var(--muted);text-align:left;white-space:normal;padding:.4rem 0 0">')
    .replace("<a ", '<a style="color:inherit;text-decoration-color:rgba(28,32,40,.3)" ');
  const out = raw.replace(cr, "").replace(/(<img [^>]*little-river-harbours[^>]*?)( width=)/, '$1 style="aspect-ratio:4/3"$2').replace("</div><figcaption>", "</div>" + under + "<figcaption>");
  must(/style="aspect-ratio:4\/3"/.test(out) && out.includes(under) && !/<div class="c3ph-f">[^]*c3ph-cr[^]*<\/div><span/.test(out.replace(under, "")), "harbour photo frame or credit not moved");
  return out;
})();
const TOWERS_PHOTO = photo(TOWERS, "Oceanfront condo towers in Myrtle Beach, seen from a plane over the ocean.");
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS = PH.creditsList([{ photo: HARBOUR, caption: "Coquina Harbour from above" }, { photo: TOWERS, caption: "Oceanfront towers in Myrtle Beach" }]).replace(CREDITS_NOTE, "");
must(!CREDITS.includes("resized these photos"), "credits note not removed");

/* ---------------------------------------------------------------------------- */
/* The places (table-named-rules.json): each with its ledger rows and its document. */

const place = (name) => { const r = NR.find((x) => x.place === name); must(r, `table-named-rules.json has no ${name}`); return r; };
const docOf = (name) => { const s = place(name).src; const m = s && s.match(/https:\/\/\S+?(?=;|$)/); return m ? m[0] : null; };
/* The towns the verifier confirmed (VERIFY.md rows 43 to 46); the file still holds the researcher's guesses. */
must(place("Waterfall").town === "(verifier to confirm)" && place("Bellasera on the Waterway").town === "(verifier to confirm)", "table-named-rules.json towns changed; re-read VERIFY.md");
must(place("Surf Estates").town === "Little River Township" && place("Sugarloaf").town === "Longs", "table-named-rules.json towns changed; re-read VERIFY.md");
const CAM = (id) => `https://www.coastalassociationmanagement.com/Site/FileDownload/Index/${id}`;
must(docOf("North Beach Plantation") === CAM(5456) && docOf("Sand Dunes Oceanfront Tower") === CAM(2357) && docOf("Coquina Harbour") === CAM(3130), "document links moved");

/* The documents read by the verifier for the sold places (rows 30, 33, 35, 37, 38, 39, 32, 53; CB row 38). */
const DW_RULES = "https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3083089";
const SEASONS = "https://www.seasons55.com/editor_upload/File/Community%20Management/Policies%20%26%20Rules/communitycharter2.pdf";
const MT_FORM = "https://myrtletracesc.org/wp-content/uploads/Guidelines/Owner_Tenant_Agreement.pdf";
const FARM_RULES = "https://www.farmatcarolinaforest.com/uploads/documents_page/NEW%20Rules%20%26%20Regulations.pdf";
const FARM_MIN = "https://www.farmatcarolinaforest.com/uploads/documents_page/May%20signed%20minutes.pdf";
const SCDNR = "https://www.dnr.sc.gov/news/2025/Jun/jun10-lewisoceanbay.php";
const PULTE = "https://www.pultegroupinc.com/investor-relations/news/news-details/2017/Del-Webb-Expands-Into-Myrtle-Beach-With-New-55-Community-at-Grande-Dunes/default.aspx";
const NBR = "https://www.northbeachrentals.com/";
const SANDS = "https://www.sandsresorts.com/sand-dunes-resort/";
const FSR = "https://www.fsresidential.com/south-carolina/news-events/press-releases/firstservice-residential-welcomes-five-grand-stran/";

/* One numbered entry per place this page sells: its wow first, then the rule, then what the rule means for a plan, then
   its homes strip (the offer pill until the strip fills). */
const entry = (n, id, head, body, slug, name, stripHead, offerPlace, offerLabel) =>
  `<div class="rr-b" id="${id}"><h3 class="rr-bh"><span class="rr-n">${n}</span><span>${head}</span></h3>${body}</div>`
  + G.homes(slug, name, G.offer(offerPlace, { label: offerLabel }), stripHead);
const SOLD = [
  entry(1, "north-beach-plantation", "North Beach Plantation, North Myrtle Beach: rent it any way you like",
    h.p(`Its resort towers stand on a 7.5-acre island between the Atlantic Ocean and Whitepoint Swash. Around them are ${h.ext(NBR, "2.5 acres of pools")}, spas, a lazy river and a swim-up pool bar.`)
    + h.p(`The ${h.ext(docOf("North Beach Plantation"), "master declaration")} says its residential-use rule "shall not prohibit or restrict any form of rental". The Exchange lets an owner rent by the day, week, month or year.`)
    + h.p(`Rental guests must register. In the Exchange, the single-family homes and the Villas, a guest not staying with the owner registers with the on-site access company. The unit's front door must have that company's lock and fob system.`),
    "north-beach-plantation", "North Beach Plantation", "North Beach Plantation: an island resort you can rent your way",
    "North Beach Plantation", "Send me homes in North Beach Plantation"),
  entry(2, "sand-dunes", "Sand Dunes Oceanfront Tower, Myrtle Beach: papers that allow short stays",
    h.p(`Sand Dunes Resort has ${h.ext(SANDS, "a water park with slides")} and a large lazy river on the oceanfront. Our ${h.a("/invest/condo-buildings/#sand-dunes-resort", "oceanfront condo building guide")} has its fees and prices.`)
    + h.p(`The tower's ${h.ext(docOf("Sand Dunes Oceanfront Tower"), "master deed")} allows "permanent or transient residential use". It also says nothing in it limits an owner's right to rent or lease a unit.`)
    + h.p("Transient means short stays. The city's zoning says whether a stay by the night is legal in a unit, so we check it for that unit before you offer."),
    "sand-dunes-resort", "Sand Dunes", "Sand Dunes condos for sale, with a lazy river on the oceanfront",
    "Sand Dunes", "Get the Sand Dunes condos for sale"),
  entry(3, "the-farm", "The Farm at Carolina Forest: renting is allowed, and no board rule can ban it",
    h.p(`The state land along The Farm's north side holds habitat for the wild Venus flytrap. ${h.ext(SCDNR, "South Carolina's largest wild population")} of the plant is centered in the Lewis Ocean Bay Heritage Preserve.`)
    + h.p(`The declaration says no board rule may prohibit leasing, though the board may require a minimum lease of up to six months. Its ${h.ext(FARM_RULES, "rules")} require every lease in writing. The owner sends the manager a copy and the tenants' names and phone numbers within 10 days.`)
    + h.p(`The board's ${h.ext(FARM_MIN, "minutes")} say the builder's documents include no limit on the share of homes that may be rented. More on the neighborhood is in our ${h.a("/submarkets/carolina-forest/the-farm/", "guide to The Farm")}.`),
    "the-farm", "The Farm at Carolina Forest", "The Farm homes, where the board can't ban renting",
    "The Farm", "Have us read The Farm's rules for one home"),
  entry(4, "coquina-harbour", "Coquina Harbour, Little River: a condo on a boat basin, with 12-month leases",
    h.p("Coquina Harbour's condos line a marina basin off the Intracoastal Waterway in Little River. The county lists 78 boat-slip parcels in the harbor's marina, each its own parcel, about 100 to 500 feet from the condo buildings.")
    + HARBOUR_PHOTO
    + h.p(`The ${h.ext(docOf("Coquina Harbour"), "association's rules")} require a lease of at least 12 months. A copy of each lease goes to the management company.`)
    + h.p("It fits a buyer who wants a harbor home and a tenant by the year. It does not fit a plan to rent it by the week."),
    "coquina-harbour", "Coquina Harbour", "Coquina Harbour condos on a boat basin off the waterway",
    "Coquina Harbour", "Have us find a condo in Coquina Harbour"),
  entry(5, "del-webb-grande-dunes", "Del Webb at Grande Dunes, Myrtle Beach: a year's lease, once a year",
    h.p(`At Del Webb at Grande Dunes, every owner pays a required fee for the Grande Dunes Ocean Club, the beach club, and the association bills it with its own dues. ${h.ext(PULTE, "Pulte said in 2017")} it was the only Del Webb in the country to include beach club access in its base HOA dues.`)
    + h.p(`The recorded declaration requires a lease of at least 12 months, one time a year, unless the association's rules say otherwise. The ${h.ext(DW_RULES, "posted rules")} add that the whole home is leased, in writing, with notice to the manager within 10 days.`)
    + h.p(`This is a 55+ community. An owner may not lease to anyone under 55 who will live in the home without the board's written approval. Life there is in our ${h.a("/buyers/55-plus-communities/del-webb-grande-dunes/", "Del Webb at Grande Dunes guide")}.`),
    "del-webb-grande-dunes", "Del Webb at Grande Dunes", "Del Webb homes with the beach club in the dues",
    "Del Webb at Grande Dunes", "Ask us about homes in Del Webb at Grande Dunes"),
  entry(6, "seasons-at-prince-creek-west", "Seasons at Prince Creek West, Murrells Inlet area: a one-year lease",
    h.p(`The Murrells Inlet MarshWalk is about 10 minutes away by car, and so is the beach in Garden City. At home, the ${h.ext(FSR, "management company lists")} indoor and outdoor pools, tennis and bocce.`)
    + h.p(`The association's ${h.ext(SEASONS, "posted copy of its charter")} says no lease may be shorter than one year. Every lease is in writing and says the homes are for people 55 or older.`),
    "prince-creek-55", "Seasons at Prince Creek West", "Seasons at Prince Creek West homes, 10 minutes from the MarshWalk",
    "Seasons at Prince Creek West", "Send me Seasons at Prince Creek West homes"),
  entry(7, "myrtle-trace", "Myrtle Trace, Conway: a tenant 55 or older who lives there full time",
    h.p(`Myrtle Trace has fifteen ponds. They sit on 42 acres of common land the HOA owns, with ${h.a("/hoa/benefits/", "the clubhouse and the pool")}.`)
    + h.p(`Its ${h.ext(MT_FORM, "owner and tenant agreement")} says at least one person on the lease must be 55 or older and live in the home full time. If no one on the lease meets that rule, the lease ends and the tenants leave within 30 days.`)
    + h.p(`The rule fits a tenant who lives there, not a vacation guest. Our ${h.a("/buyers/55-plus-communities/myrtle-trace/", "Myrtle Trace guide")} covers the rest.`),
    "myrtle-trace", "Myrtle Trace", "Myrtle Trace homes among fifteen ponds",
    "Myrtle Trace", "Get the Myrtle Trace homes for sale"),
].join("");
must(["North Beach Plantation", "Sand Dunes Oceanfront Tower", "The Farm at Carolina Forest", "Coquina Harbour", "Del Webb at Grande Dunes", "Seasons at Prince Creek West", "Myrtle Trace"].every((p) => place(p)), "a sold place left the table");

/* The other eight: no verified wow, so they are not sold. One plain table, most open first, each place linked to its own
   document. "Homes" is the verifier's town (rows 43 to 46: Waterfall no town; Sugarloaf near Longs; Bellasera and Surf
   Estates inside North Myrtle Beach) and kind (row 46: homes, not only houses). */
const MORE = [
  ["The Atrium", "Condos on North Ocean Boulevard, Myrtle Beach", "No lease of 30 days or less, since a 1998 amendment (below)", CAM(2399)],
  ["Sugarloaf", "Houses near Longs", "At least 6 months, unless the board approves. No nightly or vacation rental", CAM(3642)],
  ["Bellasera on the Waterway", "Homes in North Myrtle Beach", "At least 6 months, for the whole home. No hotel use", CAM(3444)],
  ["Villa Firenze at Grande Dunes", "Condos in Myrtle Beach", "At least 1 year, or 6 months with the board's written consent", CAM(773)],
  ["Intercoastal Village Resort", "Condos in Little River", "At least 1 year. An owner who does not file the lease is fined $100 a month, then $200, then $400", CAM(4463)],
  ["Robber's Roost", "Houses in North Myrtle Beach", "No lease under 1 year", CAM(3496)],
  ["Surf Estates", "Houses in North Myrtle Beach", "No weekly or short-term rental, and short-term means under 1 year", CAM(2429)],
  ["Waterfall", "Houses", "At least 1 year, for the whole home. Airbnb and VRBO are prohibited", CAM(2646)],
];
for (const [p, , , u] of MORE) must(place(p.startsWith("Robber") ? "Robber's Roost at North Myrtle Beach" : p).src.includes(u), `${p}: the document link moved`);
const PLACES_N = SOLD.match(/class="rr-b"/g).length + MORE.length;
must(PLACES_N === 15, "the page says 15 communities");
/* Communities above whose papers bar stays of a month or less: Coquina Harbour, Del Webb, Seasons and all eight but none of
   the first three (rows 30, 33, 40, 42 to 48, 61). Myrtle Trace's rule names who lives there, not a lease term (row 35). */
const NO_NIGHTLY = 3 + MORE.length;
must(NO_NIGHTLY === 11, "the Airbnb section says 11");

/* ---------------------------------------------------------------------------- */
/* Rule changes (rows 48 to 50, 56).                                              */

/* Row 50: each vote in plain words, checked against the file's own words. */
const VOTE_WORDS = {
  "The Atrium": ["Condos, Myrtle Beach", "Owners of 66 percent of the units and of the common areas, and the lenders holding first mortgages on 66 percent of the units", /66%.*66%/],
  "A Place at the Beach II (Cherry Grove)": ["Condos, Cherry Grove", "Owners of 75 percent of the building's value", /75%/],
  "Surf Estates": ["Houses, North Myrtle Beach", "Owners of 75 percent of the lots, not counting the developer's, and the developer's written consent while it still owns a lot", /75%.*developer consent/],
  "The Exchange at North Beach Plantation": ["Condos, North Myrtle Beach", "67 percent of the total vote", /67%/],
  "Crescent Shores": ["Condos, North Myrtle Beach", "Owners of two-thirds of the units and of the common areas, and the lenders holding liens on two-thirds", /two-thirds.*two-thirds/],
  "Yacht Club Villas": ["Condos, North Myrtle Beach", "Owners of two-thirds of the units and of the common areas, and the lenders holding liens on two-thirds", /two-thirds.*two-thirds/],
};
must(AV.length === 6 && AV.every((v) => VOTE_WORDS[v.place] && VOTE_WORDS[v.place][2].test(v.vote)), "table-amend-votes.json moved");
/* The Atrium is told in the text above the table. Crescent Shores and Yacht Club Villas require the same vote: one row. */
must(VOTE_WORDS["Crescent Shores"][1] === VOTE_WORDS["Yacht Club Villas"][1], "the two North Myrtle Beach condo votes differ now");
const vsrc = (p) => AV.find((v) => v.place === p).src;
const VOTE_ROWS = AV.filter((v) => !["The Atrium", "Yacht Club Villas"].includes(v.place)).map((v) => v.place === "Crescent Shores"
  ? [`${h.ext(vsrc("Crescent Shores"), "Crescent Shores")} and ${h.ext(vsrc("Yacht Club Villas"), "Yacht Club Villas")}`, VOTE_WORDS[v.place][0], VOTE_WORDS[v.place][1]]
  : [h.ext(v.src, v.place.replace(" (Cherry Grove)", "")), VOTE_WORDS[v.place][0], VOTE_WORDS[v.place][1]]);
must(VOTE_ROWS.length === 4, "four vote rows, five communities");
/* Row 56, CORRECTED: The Farm's 13 filings are its sixth to fifteenth amendments; Berkshire Forest has 7 amendments to its
   main declaration (the file counts 10 with a cost-sharing covenant and two side declarations). */
must(CP["The Farm at Carolina Forest"].amendment === 13 && CP["Berkshire Forest"].amendment === 10, "row 56: community-papers.json moved");
const FARM_AMENDS = 15 - 6 + 1, BERK_AMENDS = 7;                                    // row 56, CORRECTED

/* ---------------------------------------------------------------------------- */
/* Links (each opened by the researcher and again by the verifier).               */

const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T12_36 = "https://www.scstatehouse.gov/code/t12c036.php";
const OP5362 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/5362.pdf";
const OP5525 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/5525.pdf";
const OP5312 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/5312.pdf";
const FL718 = "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0718/Sections/0718.110.html";
const FL720 = "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/0720.306.html";
const HUD = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const ADDENDUM = "https://www.llr.sc.gov/re/RECPDF/Residential%20Property%20Condition%20Disclosure%20Statement%20Addendum.pdf";
const CAMDOCS = "https://www.coastalassociationmanagement.com/Site/GoverningDoc";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const ZONING = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const NMBSTR = "https://www.nmb.us/833/Short-term-Rentals";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---------------------------------------------------------------------------- */
/* Page styles. One card style (the glass chart and offer boxes); tables and lists sit on the page under thin rules. As
   /invest/condotel-financing/. */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .rr-tw,${S} .rr-plain,${S} .rr-b,${S} .rr-steps,${S} .c3-offer{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}${S} .c3-gchart .v{font-weight:600}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .rr-tab0 th,${S} .rr-tab0 td{width:auto!important}@media (max-width:599px){${S} .rr-tab0{font-size:1rem!important}${S} .rr-tab0 thead th{font-size:.875rem!important}}`
  /* tables: plain, under thin rules; on a phone each row folds to its name, then each cell under a small label */
  + `${S} .rr-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .rr-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .rr-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .rr-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .rr-tw tbody th{text-align:left;font-weight:600;padding:.75rem .9rem .75rem 0;border-bottom:${RULE};line-height:1.4;vertical-align:top;width:30%}`
  + `${S} .rr-tw td{padding:.75rem .8rem .75rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.5;color:var(--muted)}`
  + `${S} .rr-tw td.k{font-weight:700;color:var(--navy)}${S} .rr-tw td .l{display:none}${S} .rr-tw a{color:var(--navy)}`
  + `@media (max-width:599px){${S} .rr-tab,${S} .rr-tab tbody,${S} .rr-tab caption{display:block;width:100%}`
  + `${S} .rr-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .rr-tab tr{display:block;padding:.8rem 0;border-bottom:${RULE}}`
  + `${S} .rr-tab th,${S} .rr-tab td{display:block;border:0!important;padding:0!important;width:auto!important}`
  + `${S} .rr-tab tbody th{padding-bottom:.25rem!important}${S} .rr-tab td{padding-top:.2rem!important}${S} .rr-tab td .l{display:block;font-size:.875rem;color:var(--muted);font-weight:400}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .rr-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .rr-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .rr-plain li:last-child{border-bottom:${RULE}}${S} .rr-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the places: a numbered headline, short paragraphs, then the strip or its pill, with room before the next */
  + `${S} .rr-b{margin:2.2rem 0 0;padding-top:1.4rem;border-top:${RULE}}`
  + `${S} .rr-bh{display:flex;align-items:baseline;gap:.65rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:0 0 .7rem;line-height:1.3}`
  + `${S} .rr-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:rgba(196,120,58,.16);color:${INK};font-family:var(--sans);font-weight:700;font-size:.95rem;position:relative;top:-.12rem}`
  + `${S} .rr-b+.hx-strip:not(:empty){margin-top:1.1rem}${S} .rr-b+.hx-strip+.hx-fallback .c3-offer{margin:.4rem 0 .6rem}`
  + `${S} .rr-after{margin-top:2.2rem;padding-top:1.4rem;border-top:${RULE};max-width:720px}`
  + `${S} .rr-after>h3{margin-top:0!important}`
  /* the steps: numbered, bold lead-in */
  + `${S} .rr-steps{list-style:none;counter-reset:rr;margin:1.1rem 0 1.4rem;padding:0}${S} .rr-steps li{counter-increment:rr;position:relative;margin:0;padding:.85rem 0 .85rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .rr-steps li:last-child{border-bottom:${RULE}}${S} .rr-steps li::before{content:counter(rr);position:absolute;left:0;top:.85rem;width:1.75rem;height:1.75rem;border-radius:50%;background:rgba(196,120,58,.16);color:${INK};font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center}`
  + `${S} .rr-steps b{color:var(--navy)}`
  + `${S} .rr-note{font-family:var(--sans);font-size:.95rem;line-height:1.6;color:var(--muted);max-width:720px;margin:.2rem 0 1.2rem}`
  /* Work-arounds copied from /invest/condotel-financing/: the feed's search row at 320 px, the header phone at 1000 to
     1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);max-width:720px;box-sizing:border-box}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* A plain table: rows are [row header, ...cells]; heads name every column. On a phone each cell carries its column's name. */
const table = (caption, heads, rows, keyCol, fold = true) => `<div class="rr-tw"><table class="${fold ? "rr-tab" : "rr-tab0"}"><caption>${caption}</caption>`
  + `<thead><tr>${heads.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`
  + rows.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((c, i) => `<td${keyCol === i + 1 ? ' class="k"' : ""}><span class="l">${heads[i + 1]}</span>${c}</td>`).join("")}</tr>`).join("")
  + `</tbody></table></div>`;
const plain = (items) => `<ul class="rr-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const steps = (items) => `<ol class="rr-steps">${items.map(([b, t]) => `<li><b>${b}</b> ${t}</li>`).join("")}</ol>`;

const GATES = table("You can rent by the night only when both say yes", ["City or county", "HOA or condo papers", "Rent by the night?"], [
  ["Yes", "Yes", "Yes"],
  ["Yes", "No", "No"],
  ["No", "Yes", "No"],
], 2, false);
const SCFL = table("If the owners add a rental rule after you buy", ["Where", "Who the new rule binds"], [
  ["South Carolina, condos and HOAs", "Everyone, including owners who bought first."],
  ["Florida, condos", `Only owners who consent to the amendment, and later buyers (${h.ext(FL718, "718.110(13)")}).`],
  ["Florida, HOAs", `For a rental rule adopted after July 1, 2021, only owners who agree and later buyers. A rule against leases under 6 months, or more than three a year, binds everyone (${h.ext(FL720, "720.306(1)(h)")}).`],
]);
const MORE_TABLE = table("The shortest stay allowed comes first", ["Community", "Homes", "What the papers say"],
  MORE.map(([p, k, r, u]) => [h.ext(u, p), k, r]));
const VOTES = table("What it takes to change the papers in five more communities", ["Community", "Homes", "The vote the papers require"], VOTE_ROWS);

/* ---------------------------------------------------------------------------- */
/* The FAQ: only questions the page answers, said short and in other words. Plain characters only. */

const FAQ = [
  { q: "Am I grandfathered if my HOA bans rentals after I buy?", a: "Not by South Carolina law. Neither its HOA law nor its condo law exempts owners who bought before a new rule. Florida has such a law, and South Carolina does not. At The Atrium in Myrtle Beach, a 1998 amendment ended leases of 30 days or less for every unit." },
  { q: "Does residential use only ban Airbnb?", a: "Not by those words alone in the papers we read. North Beach Plantation's residential-use rule says it does not restrict any form of rental, and Sand Dunes Oceanfront Tower allows transient residential use. A South Carolina court reads unclear words the way that least restricts the owner." },
  { q: "Can an HOA make my renters register?", a: "Yes, if its papers say so. In parts of North Beach Plantation, rental guests not staying with the owner register with the on-site access company. Del Webb at Grande Dunes wants notice of each lease within 10 days, and The Farm at Carolina Forest wants the tenants' names." },
  { q: "What counts as a short-term rental in South Carolina?", a: "For the state's lodging tax, a stay of fewer than 90 days in a row by the same guest. A community's papers can define it differently. Surf Estates treats any use under a year as short-term." },
  { q: "Can I rent out a home in a 55+ community near Myrtle Beach?", a: "Yes, with the age rule. Del Webb at Grande Dunes asks for a 12-month lease and board approval for a tenant under 55. Seasons at Prince Creek West asks for a one-year lease. At Myrtle Trace, a tenant 55 or older must live there full time." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: `Can an HOA Ban Rentals in Myrtle Beach? ${PLACES_N} Real Rules`,
  description: `Can an HOA ban rentals in South Carolina? Yes, if the rule is recorded. The rental rules of ${PLACES_N} Grand Strand communities, and how owners can change them.`,
  ogTitle: `Can an HOA ban rentals in Myrtle Beach? The rental rules of ${PLACES_N} Grand Strand communities, and how they change`,
  crumb: "Rental Restrictions",
  eyebrow: "HOA rental rules",
  h1: "Can an HOA stop you from renting your home in Myrtle Beach?",
  h1em: `Yes, if its papers say so. We read the rental rules of ${PLACES_N} Grand Strand communities.`,
  /* Required by mkpage; hidden by the page's style, since the italic line and the short answer say it. */
  sub: "An HOA or condo can limit renting in Horry County when its recorded papers say so, and the real rules differ by community.",
  heroMedia: CSS + G.homesCss(),
  /* The towers aerial's 1x1, 4x3 and 16x9 crops: Article.image and the share image. */
  pageImages: () => PH.pageImages(TOWERS),
  heroCta: { title: "Tell us your rental plan. We read the rules for the home before you offer.", label: "Have us read the rules", href: ASK },
  author: "devin",
  shortAnswer: [
    "Yes. A South Carolina HOA or condo association can ban or limit renting when the rule is in its recorded papers. South Carolina law has no exemption for owners who bought before a new rule.",
    "On the Grand Strand, North Beach Plantation's papers allow \"any form of rental\". At Del Webb at Grande Dunes and Robber's Roost, no lease may be shorter than a year.",
  ],
  sections: [
    { h2: "Can an HOA ban rentals in South Carolina?", toc: "The law", id: "the-law", html: () =>
      h.p("Yes, when the rule is in the association's papers and its words are clear. State law and the courts say four things about it:") +
      plain([
        ["The papers must be recorded", `An HOA's governing documents must be recorded at the county to be enforced. Board rules take effect when adopted, and stay enforceable only if recorded by January 10 of the next year (${h.ext(T27_30, "27-30-130")}).`],
        ["A condo's master deed states it", `The master deed is the paper that creates a condo building and its association. South Carolina requires it to state any limits on leasing a unit, including the term. Each owner must follow it strictly (${h.ext(T27_31, "27-31-100 and 27-31-170")}).`],
        ["No cap and no grandfather rule", "Neither South Carolina's HOA Act nor its condo law caps an association's rental rules, or exempts owners who bought before a new one."],
        ["A clear rule holds; an unclear one is read for the owner", `In ${h.ext(OP5362, "a 2015 case")}, a Richland County condo barred renting to college students not related to the owner. Owners who paid $470,000 in 2007 rented to students anyway, and lost. In ${h.ext(OP5525, "a 2017 Hilton Head case")}, the court read unclear rules the way that "least restricts the use of the property", and the owners won.`],
      ]) +
      h.p("In the 2015 case, the court also said the association had not given up its rule, even if it had not watched rentals before. It acted once it got a complaint.") +
      h.p("The city's rule comes on top. The city or county decides whether a home may be rented by the night at that address. The association's papers say whether that one home may be. Both must say yes.") +
      GATES +
      h.p(`The rules for each town are on our ${h.a("/invest/str-rules/", "Myrtle Beach short-term rental rules page")}.`) },

    { h2: "What do HOA rental rules say in real Grand Strand communities?", toc: "Real rules", id: "real-rules", html: (bg) =>
      h.p(`Some allow any rental at all. Others require a lease of a year or more. These ${PLACES_N} come from each community's own posted or recorded papers. The first seven are ordered from the most open to the most limited.`) +
      SOLD +
      `<div class="rr-after">` + h.h3("Eight more rules we read") + MORE_TABLE +
      h.p("Plenty of communities here ban renting the house out at all. When you buy a rental with us, our agents leave those out of your search. We read each home's papers for rules that would block your plan.") +
      h.p(`New communities differ. There is no single pattern for rental caps in them, so we check each new community case by case. Our ${h.a("/hoa/documents/", "guide to HOA documents")} shows what to ask for.`) + `</div>` +
      h.cta("Found a community you like?", "Send us its name. We read its recorded rules and tell you whether your rental plan fits, before you offer.", "Send us the community", ASK, bg) },

    { h2: "Can the HOA change the rental rules after you buy?", toc: "Rule changes", id: "rule-changes", html: (bg) =>
      h.p("Yes, by the vote its papers require.") +
      h.h3("The Atrium, a condo building on North Ocean Boulevard") +
      h.p(`In 1997 the owners of The Atrium, at 7600 North Ocean Boulevard in Myrtle Beach, met with 93.75 percent of owners present. Not less than two-thirds of all owners voted to ${h.ext(CAM(2399), "amend the master deed")}.`) +
      h.p(`The amendment, filed in 1998, says no unit may be leased for 30 days or less. It says it was meant to end "short term or vacation rentals". The posted papers show no later change.`) +
      h.p(`Its ${h.ext(CAM(2400), "master deed")} asks for two approvals: owners of at least 66 percent of the units, and the lenders holding first mortgages on 66 percent of them.`) +
      VOTES +
      h.p(`A vote that misses the papers' number fails. In ${h.ext(OP5312, "a 2015 case")}, affirmed in 2017, a South Carolina court threw out a subdivision's amendment that lacked the vote its restrictions required.`) +
      h.h3("How often the papers change") +
      h.p(`More often than buyers expect. From 2012 through October 2026, the ${h.ext(DEEDS, "county's index")} lists ${FARM_AMENDS} amendments to The Farm at Carolina Forest's declaration, its sixth to fifteenth, and ${BERK_AMENDS} to Berkshire Forest's.`) +
      h.p(`Who can change the papers while the builder still runs the HOA is on our ${h.a("/hoa/developer-control-turnover/", "developer turnover page")}.`) +
      h.h3("Buyers from Florida: the law here is different") +
      SCFL +
      h.cta("Worried about a rental vote?", "Send us the community. We read how its papers can be changed and what vote it takes.", "Ask us to read the papers", ASK, bg) },

    { h2: "Can an HOA ban Airbnb but allow yearly leases?", toc: "Airbnb or yearly", id: "airbnb-or-yearly", html: (bg) =>
      h.p(`Yes. ${NO_NIGHTLY === 11 ? "Eleven" : NO_NIGHTLY} of the ${PLACES_N} communities above do: their papers bar stays of a month or less and allow a longer lease. Waterfall's rules name Airbnb and VRBO.`) +
      h.p(`For the state's lodging tax, a short-term rental is a stay of fewer than 90 days in a row by the same guest (${h.ext(T12_36, "12-36-920")}). Papers may use their own definition: Surf Estates calls any use under a year short-term.`) +
      NIGHT_CHART +
      h.p(`The same city can give two answers. In ${h.ext(NMBSTR, "North Myrtle Beach")}, the city asks for no special zoning or permit beyond its license. There, ${NMB.house_with_hoa_fee.nightly} of ${NMB.house_with_hoa_fee.listings} houses for sale with an HOA fee say nightly rentals are allowed, fewer than 1 in 4.`) +
      h.p(`Of the ${NMB.house_no_hoa_fee.listings} houses there with no HOA fee, ${NMB.house_no_hoa_fee.nightly} do, about 6 in 10.`) +
      h.p(`In Carolina Forest, every one of the ${CF.house_with_hoa_fee.listings} houses for sale has an HOA fee, and ${CF.house_with_hoa_fee.nightly} says nightly rentals are allowed. Most of them are outside city limits, where ${h.ext(ZONING, "the county's zoning")} has no limit on how long a home may be rented.`) +
      h.p(`Condos lean the other way: about ${CONDO_TEN} in 10 condos for sale say short-term rentals are allowed. Our ${h.a("/invest/condos/", "guide to Myrtle Beach condos")} has that count by area.`) +
      TOWERS_PHOTO +
      G.homes("no-hoa-nightly-houses", "Houses with no HOA fee", h.cta("Prefer a house with no HOA at all?", "Houses with no HOA fee have no association to say no. We send the ones whose listing says nightly rentals are allowed.", "Send me houses with no HOA", ASK, bg), "No HOA, and you can rent it by the night") },

    { h2: "Does a building full of renters change the loan?", toc: "Loans", id: "loans", html: () =>
      h.p("It can. FHA and Fannie Mae both look at how many owners live in a condo building and how it is rented.") +
      plain([
        ["FHA approval of the building", `At least half of a condo project's units must be owner-occupied. Under extra conditions, an existing project more than a year old can be approved with 35 percent, and a new one with 30 percent (${h.ext(HUD, "HUD Handbook 4000.1")}).`],
        ["What counts as owner-occupied", "A unit counts only if the owner lives there part of the year and does not rent it out for most of the year."],
        ["One unit in an unapproved building", "FHA may insure it only if, among other things, at least half the units are owner-occupied. In a building of 20 or more units, FHA may stop new loans once it insures more than 10 percent of them. In a smaller one, the limit is two."],
        ["Fannie Mae", `It will not buy a loan in a building whose papers require a rental pool or limit when owners may stay. The same goes for papers that make owners share rental profits with the association or a rental company. A building with hotel services, such as daily rentals and daily cleaning, is out too (${h.ext(FNMA, "B4-2.1-03")}).`],
      ]) +
      h.p(`Loans on these buildings are on our ${h.a("/invest/non-warrantable-condos/", "page on condos most lenders will not lend on")} and our ${h.a("/invest/condotel-financing/", "condotel financing page")}.`) },

    { h2: "What other HOA rules apply only to renters?", toc: "Renter rules", id: "renter-rules", html: () =>
      h.p("Some papers keep a few rules for renters alone. The ones we read cover pets and parking:") +
      plain([
        ["Pets", `At Teal Lake Village, North Myrtle Beach condos, renters on a lease shorter than half a year may not keep pets. A lease of 6 months or longer on file allows them. At ${h.ext(CAM(5485), "Cypress Bay II")} and ${h.ext(CAM(5444), "North Beach Towers")}, renters and guests may not bring pets.`],
        ["The golf cart space", `At ${h.ext(CAM(4894), "Carolina Keyes")}, an owner who rents the unit to long-term renters loses the unit's golf cart parking space.`],
      ]) },

    { h2: "How do you find out before you buy?", toc: "Before you offer", id: "before-you-offer", html: () =>
      h.p("We find out for the one home, before you make an offer, in three steps:") +
      steps([
        ["We check the address.", `Whether the city or county allows the rental you plan there. Each town's rule is on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`],
        ["We pull the papers.", `The recorded papers, their amendments and the latest rules. The county's index is online, but its pages are not, so the copies come from the Register of Deeds or the association. One North Myrtle Beach manager ${h.ext(CAMDOCS, "posts 210 files")} for the 62 associations it runs.`],
        ["We read the seller's answer.", `South Carolina's ${h.ext(ADDENDUM, "HOA disclosure addendum")} asks the seller about any owners association "resale or rental restrictions". The seller may answer "No Representation", so we read the papers either way.`],
      ]) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([HARBOUR, TOWERS]),
  faqTitle: "HOA rental restrictions FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 12-36-920", href: T12_36 },
    { name: "SC Op. 5362", href: OP5362 },
    { name: "Op. 5525", href: OP5525 },
    { name: "Op. 5312", href: OP5312 },
    { name: "Fla. Stat. 718.110", href: FL718 },
    { name: "720.306", href: FL720 },
    { name: "HUD Handbook 4000.1", href: HUD },
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "SC HOA addendum", href: ADDENDUM },
    { name: "posted HOA papers", href: CAMDOCS },
    { name: "county deed index", href: DEEDS },
    { name: "Horry County zoning", href: ZONING },
    { name: "North Myrtle Beach", href: NMBSTR },
  ],
  sourcesNote: `Each community's rule is linked to its own posted or recorded paper. Listing counts: the rental flags on homes for sale, ${PULL_DAY}, in total only. General information, not legal advice.`,
  bottomCta: { h2: "Tell us the plan before you buy.", p: `Nightly, by the season or by the year: we read the recorded rules for the home and tell you whether your plan fits. Or call ${PHONE}.`, label: "Ask us to check a home", href: ASK },
  keywords: "can an HOA ban rentals, HOA rental restrictions South Carolina, HOA leasing restrictions, minimum lease term HOA, can an HOA change rental rules after purchase, HOA rental restrictions Myrtle Beach, can HOA ban Airbnb, condo rental restrictions Myrtle Beach, 55+ community rental rules",
  about: "HOA and condo rental restrictions in Myrtle Beach and Horry County, South Carolina",
});
