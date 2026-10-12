/* /buyers/55-plus-communities/myrtle-trace/ - what it is like to live in Myrtle Trace,
 * a 55+ neighborhood just outside Conway.
 *
 * Version 14c, 2026-10-11: the v14b owner's-eye review (OWNER-EYE-v14b.md) and a cold reader of the pros and
 *            cons: nothing acts (no bill pays, no rule limits, no route runs, no home sits); the plain
 *            word first ("the clubhouse, also called the amenity center", rows 106 and 108); the place
 *            named in each section's first sentence; repeats cut; a "homes for sale" offer to the
 *            contact form, as Myrtle Trace has (the site has no listing search to link).
 *            MT: the first pro in the costs section's form; $95 once in the comparison and pros; the
 *            house-and-yard con cut (the homes section says it).
 * Version 14b, 2026-10-11: the pros and cons rewritten in the expert's voice (the owner, BUYER-3: "according
 *            to the records and so on when we are the experts"; CRAFT 5; lessons L21 and L34): no
 *            attribution, no names the reader cannot picture, no method, about 15 words each. The rows
 *            behind each item are the same as in version 14; no item claims more than its row.
 * Version 14, 2026-10-11: the SEO gaps (coordinator). A pros and cons section after the comparison and
 *            before the fence story, in the verifier's wording (PROS-CONS-candidates.md, "Verifier
 *            check"): pros P1 (rows 30, 34: $95 a month; the HOA says dues pay for the maintenance and
 *            improvement of the pool, clubhouse, gate, roads, common areas and lakes), P2 (rows 86, 87:
 *            from the HOA's address, the hospital and a Walmart Supercenter about 3 minutes), P3 (rows
 *            78 to 80: standing committees for bingo and game nights; a Labor Day picnic and a craft
 *            fair; no counts or months); cons C1 (row 85: the beach about 15 minutes from the HOA's
 *            address), C2 (row 94: most homes in the listings built 1984 to 1998; act: ask the roof's
 *            age), C6 (row 29: the HOA says there are no sidewalks), C5 (row 59: the HOA's rules, the plain word for the
 *            covenants, say each owner keeps up the lot and the home). Title and description carry "55+", "HOA fee" and
 *            "pros and cons" (STANDARD S1, S2, S9). The pinned datePublished is removed.
 * Version 12, 2026-10-11: the v11 owner's-eye review (OWNER-EYE-v11-myrtle-trace.md): headings with the
 *            place name and short contents labels, "Conway's riverwalk", the league card, the walkways
 *            in the homes section (row 46), "trees" not "pines" (no row says pines), "helps you get",
 *            the FAQ on Myrtle Trace South and Myrtle Trace Grande (rows 68 and 69), "About $95".
 * Version 11b, 2026-10-11: row 93 (to 300 Main Street in Conway, about 10 minutes by car).
 * Version 11, 2026-10-11: the v10 owner's-eye review (OWNER-EYE-v10-myrtle-trace.md): short
 * question headings, the full fence answer above the story (row 54 and its note: perimeter fences
 * only on lots backing onto roads or future development, never golf course or pond lots), people
 * act in every sentence, no "the HOA says", the month section folded into its cards, the homes
 * sentence in two (row 92's middle range: "about 1,500 to 2,100"), "In our experience" as on the
 * other pages, one line under the story (the offer), the bottom offer about rules and costs.
 * The drive to downtown Conway waits for the researcher's verified row (coordinator).
 * Version 10, 2026-10-11: the owner's-eye review of version 9
 * (batches/2026-10-a/OWNER-EYE-myrtle-trace.md) and the coordinator's decisions.
 * Shape: what is close (one map, one link), a normal month, the homes (one-story first, the
 * overview aerial beside the layout sentence, a close aerial of a street of houses, the golf
 * course view before the golf balls, a homes-for-sale offer), Conway in three sentences with
 * its two photos beside them, the money (the $95 fee, no city tax, flood in two sentences),
 * who can live there and the rules (no fence card: the agent finds the fence rule in the
 * story), the comparison led by the good, then the fence example as the last section before
 * the FAQ, under the buyer's question. No dates in captions; the photo year is in the credits.
 *
 * Facts:  batches/2026-10-a/facts/myrtle-trace-facts.md, verified rows only.
 *   Place:   rows 15, 72, 85 to 89; rush hour: stories.json "traffic-timing".
 *   Life:    rows 25, 43 to 46, 78 to 80.
 *   Homes:   row 92 (about 1,000 to 2,900 sq ft; mostly 3 bedrooms, some 2; built mostly 1984 to
 *            1998, "in the 1980s and 1990s"; every home for sale on one level), rows 26, 47 (golf
 *            easement), 48, 59. Row 22 (laid out 1984 to 1994) is cut (owner).
 *   Rules:   rows 1, 6 (no minimum age for the others in the home; OCR copy), 8 and 51, 53
 *            (trucks in the garage; campers and boats at the clubhouse lot with a permit), 54 and
 *            47 (b) (fences: found by the agent in the story), 55, 56, 16, 38.
 *   Money:   rows 81, 30 (exactly $95, the SEO audit), 34, 35, 72, v4 tax plus row 73.
 *   Flood:   rows 60 and 61, 75.
 *   Gates:   row 16 is the HOA's own 2025 gates policy, a primary source, so the gate FAQ stays.
 * Photos: the overview and street aerials (USDA NAIP 2023); Conway riverwalk and Main Street,
 *         each beside its sentence. The cypress photo is cut. The overview is the share image.
 * Story:  an Example (Pat and Max): the agent reads the HOA's design rules for that lot with her,
 *         finds no fence is allowed on a golf course or pond lot and that an approved dog run is
 *         (stories.json "hoa-rental-bans-filtered", "ny-buyer-rules-fit").
 */
const { h, maps, story, glance, photoSet, compareTable, atAGlance, prosCons } = require("./_55-plus-kit.js");

const HUB = "/buyers/55-plus-communities/";
const SELF = "/buyers/55-plus-communities/myrtle-trace/";
const TEL = "tel:+18543332135";

/* Primary sources, opened by the researcher and re-opened by the verifier. */
const HOA = "https://myrtletracesc.org/";
const COV = "https://myrtletracesc.org/wp-content/uploads/Guidelines/MyrtleTraceCovenant.pdf";
const CAL = "https://myrtletracesc.org/2026-calendars/";
const FEMA = "https://msc.fema.gov/portal/search?AddressQuery=101%20Myrtle%20Trace%20Drive%2C%20Conway%2C%20SC%2029526";
const LAW = "https://www.law.cornell.edu/uscode/text/42/4012a";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";

const ph = photoSet();
const OVER = ph.aerial("myrtle-trace-from-above", "Myrtle Trace from above, with the golf course next door. The orange line is the edge of the neighborhood.");
const STREET = ph.aerial("myrtle-trace-homes-from-above", "Houses along two streets and a pond in Myrtle Trace, from above.", { closeUp: true });
const RIVER = ph.aerial("conway-riverwalk-boardwalk", "The riverwalk in Conway.", { closeUp: true, alt: "A wooden boardwalk with a black railing, shaded by trees, beside old wooden buildings in Conway" });
const MAIN = ph.aerial("conway-main-street", "Main Street in Conway.", { closeUp: true, alt: "Main Street in downtown Conway, South Carolina, lined with old brick shop buildings" });
const M = maps("myrtle-trace", [
  { id: "hosp_cmc", name: "Conway Medical Center", short: "Hospital", kind: "hospital" },
  { id: "groc_mt", name: "Walmart Supercenter", short: "Walmart", kind: "grocery" },
  { id: "beach_mt", name: "the beach by the Myrtle Beach Boardwalk", short: "Beach", kind: "beach" },
  { id: "airport", name: "Myrtle Beach International Airport", short: "Myrtle Beach airport", kind: "airport" },
], {
  amenity: "Clubhouse",
  regionCaption: "Map of where Myrtle Trace is, inland from Myrtle Beach, with drive times by car.",
  closeCaption: "Map of the streets, ponds and clubhouse inside Myrtle Trace.",
});

module.exports = {
  url: SELF,
  hub: { name: "55+ communities", url: HUB },
  /* No datePublished (version 14): mkpage keeps the date of a page already built and gives a new page
     the day it is first built for the live site; build.js dates never moves it. */
  /* The overview aerial's 1x1, 4x3 and 16x9 crops: Article.image and the share image. */
  pageImages: () => ph.pageImages(),
  title: "Myrtle Trace 55+, Conway: HOA Fee, Pros and Cons | Chapter3",
  description: "Myrtle Trace 55+ in Conway: the pros and cons, the $95 HOA fee and what it includes, a hospital minutes away, the pool and clubs, the homes and the fence rules.",
  ogTitle: "Living in Myrtle Trace, Conway: close to the hospital, with a pool, ponds and clubs",
  crumb: "Myrtle Trace",
  eyebrow: "Conway, 55+",
  h1: "What is it like to live in Myrtle Trace in Conway?",
  h1em: "A 55+ neighborhood close to the hospital.",
  sub: "Myrtle Trace is a 55+ neighborhood of mostly one-story houses just outside Conway, with a pool, ponds and a busy club calendar.",
  heroMedia: glance([
    { icon: "hospital", label: "Hospital", text: "About 3 minutes" },
    { icon: "grocery", label: "Groceries", text: "About 3 minutes" },
    { icon: "beach", label: "Beach", text: "About 15 minutes" },
    { icon: "airport", label: "Airport", text: "About 20 minutes" },
  ]),
  heroCta: { label: "Talk to an agent", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Myrtle Trace has about 500 homes, and at least one person in each home must be 55 or older. The homeowners association (HOA) fee is $95 a month.",
    "Conway Medical Center and a Walmart Supercenter are each about 3 minutes away by car. Owners share a clubhouse, a pool and ponds for fishing. The neighborhood calendar lists about 70 events and club meetings a month.",
  ],
  sections: [
    { h2: "What is close to Myrtle Trace?", toc: "What is close", html:
      ph.css() +
      h.p("The closest beach to Myrtle Trace by car is the one by the Myrtle Beach Boardwalk. In our experience, rush hour adds 5 to 10 minutes to the drive.") +
      M.where },

    { h2: "What is a month like in Myrtle Trace?", toc: "A normal month", html:
      h.p(`In a normal month in Myrtle Trace, you can play bingo, swim, fish and play in a league. The rest is on the ${h.ext(CAL, "neighborhood's calendar")}.`) +
      ph.cards([
        { illustration: "card-table", label: "Bingo and game nights", text: "Bingo two Friday nights a month, and a game night on Sundays" },
        { illustration: "outdoor-pool", label: "The pool", text: "Open every day 8 a.m. to 9 p.m., until the start of October" },
        { illustration: "bocce", label: "Bocce and shuffleboard", text: "A bocce league and a shuffleboard league you can join" },
        { illustration: "fishing-pond", label: "Fishing", text: "Ponds where you and your guests fish and let the fish go. You cannot swim or take a boat in the ponds." },
      ], { cols: 4 }) +
      h.p("There is also line dancing, a coffee group and a craft fair.") +
      "" },

    { h2: "What are the homes like in Myrtle Trace?", toc: "The homes", html: (bg) =>
      h.p("Most homes in Myrtle Trace are one-story houses with their own yards, and a few are townhouses. Most were built in the 1980s and 1990s.") +
      h.p("Most have 3 bedrooms and about 1,500 to 2,100 square feet. The houses are on curving streets among trees and ponds, with Burning Ridge Golf Club next door. Wide paths between the houses are open to every resident.") +
      OVER +
      STREET +
      h.p("Some homes look out on the golf course, which is privately owned. Golf balls from the course can land in those yards.") +
      h.p("Each owner takes care of the house and the yard, including the roof and the grass.") +
      h.cta("Get the list of Myrtle Trace homes for sale.", "Tell us what you are looking for, and one of our agents will send you the homes for sale now.", "Get the list", "/contact/", bg) },

    { h2: "What is Conway like?", toc: "Conway", html:
      h.p("Conway is the town next to Myrtle Trace, on the Waccamaw River. Main Street in Conway is about 10 minutes away by car. Conway's riverwalk is a wooden boardwalk along the water, shaded by trees.") +
      RIVER +
      h.p("Main Street is lined with old brick buildings with shops and places to eat.") +
      MAIN },

    { h2: "What does it cost to live in Myrtle Trace?", toc: "Costs", html: (bg) =>
      h.p("Homes in Myrtle Trace usually sell for about $300,000. If you live in the home, plan for these costs:") +
      atAGlance([
        { icon: "dollar", label: "HOA fee", text: "$95 a month" },
        { icon: "tax", label: "Property tax", text: "About $1,200 a year" },
        { icon: "key", label: "When you buy", text: "A one-time fee to the HOA of a little over $1,500" },
      ], { bg, min: "13rem" }) +
      h.p("The HOA uses the fee to keep up the pool, the clubhouse, the gates, the roads it owns, the ponds and the shared land. Myrtle Trace has a Conway address but is outside the city limits, so you pay no Conway city tax.") +
      h.p(`You probably will not need flood insurance, because no home here is in a high-risk flood zone on ${h.ext(FEMA, "the government's flood map")}. If you want it, a policy here usually costs about $550 a year.`) +
      h.cta("Get an insurance quote before you offer.", `Pick the Myrtle Trace home you like. An agent at Chapter3 helps you get a homeowners ${h.a("/buyers/coastal-insurance/", "insurance")} quote before you write the offer.`, "Get a quote", "/contact/", bg) },

    { h2: "Who can live in Myrtle Trace?", toc: "Who can live here", html: (bg) =>
      h.p(`At least one person in every home in Myrtle Trace must be 55 or older, under the ${h.ext(COV, "HOA's rules")}. The others in the home can be any age, and grandchildren can visit.`) +
      atAGlance([
        { icon: "pets", label: "Pets", text: "Yes. Keep them on a leash outside your yard, and out of the clubhouse and pool area." },
        { icon: "key", label: "Renting it out", text: "Yes, for a year or longer. One tenant must be 55 or older and live there." },
        { icon: "home", label: "Sheds and pools", text: "No free-standing sheds, gazebos or private swimming pools." },
        { icon: "dock", label: "Trucks and boats", text: "Park your truck in the garage. Campers, boats and RVs can park at the clubhouse lot with a permit." },
      ], { bg, min: "18rem" }) +
      h.p("In our experience, many HOAs here do not allow renting at all. Myrtle Trace does.") },

    { h2: "How does Myrtle Trace compare with other 55+ neighborhoods?", toc: "Compare", html: () =>
      h.p("Myrtle Trace has the lowest HOA fee of these four 55+ neighborhoods, and its homes usually sell for the least.") +
      compareTable(SELF) },

    { h2: "What are the pros and cons of living in Myrtle Trace?", toc: "Pros and cons", html: (bg) =>
      h.p("Myrtle Trace is minutes from the hospital and has a busy club calendar, and its homes are older.") +
      prosCons([
        "The HOA fee is $95 a month. The HOA uses it to keep up the pool, clubhouse, gates, roads and ponds.",
        "The hospital and a Walmart Supercenter are each about 3 minutes away by car.",
        "Bingo, game nights, a Labor Day picnic and a craft fair are on the calendar.",
      ], [
        { text: "The beach is about 15 minutes away by car." },
        { text: "Most homes were built in the 1980s and 1990s.", act: "Ask how old the roof is before you make an offer." },
        { text: "There are no sidewalks." },
      ], { bg }) },

    { h2: "Can you fence a yard in Myrtle Trace?", toc: "Fences", html: (bg) =>
      h.p("Usually not in Myrtle Trace. Fences between yards and across the front are not allowed, and most lots cannot have a fence around the back yard either. A dog run is allowed once the HOA approves it.") +
      story([
        "<strong>Example:</strong> Pat is moving from Erie, Pennsylvania, with her dog, Max, and she wants a fenced back yard where he can run. She likes a house in Myrtle Trace that backs onto the golf course.",
        "Before she makes an offer, her Chapter3 agent reads the neighborhood's rules with her. A house on the golf course cannot have a fence around its back yard.",
        "The agent shows her that a dog run, a small pen beside the house, is allowed once the HOA approves it. Pat makes her offer, with a plan for Max's dog run beside the patio.",
      ], "", bg,
      `An agent at Chapter3 can ${h.a("/contact/", "read the HOA's rules with you")} before you make an offer.`) },
  ],
  faqTitle: "Myrtle Trace FAQ",
  faq: [
    { q: "Is Myrtle Trace a gated community?", a: "Only in part. The front entrance is always open. The HOA put gates on the back entrance so drivers do not cut through the neighborhood." },
    { q: "How much is the HOA fee in Myrtle Trace?", a: "The HOA fee is $95 a month. The HOA uses it to keep up the pool, the clubhouse, the gates, the roads it owns, the ponds and the shared land." },
    { q: "Is Myrtle Trace South part of Myrtle Trace?", a: "No. Myrtle Trace South and Myrtle Trace Grande are separate neighborhoods, each with its own HOA. The fee and rules on this page are for Myrtle Trace." },
    { q: "Who runs the Myrtle Trace HOA?", a: "The owners run the Myrtle Trace HOA themselves, with volunteers. There is no management company." },
    { q: "Is the golf course part of Myrtle Trace?", a: "No. Burning Ridge Golf Club, next door, is privately owned and is not part of the HOA. Some Myrtle Trace homes back onto it." },
    { q: "Can you fish in the Myrtle Trace ponds?", a: "Yes. Residents and their house guests can fish from the shared land around the 15 ponds. You let every fish go." },
    { q: "Do you need flood insurance in Myrtle Trace?", a: "Probably not. No home here is in a high-risk flood zone. If you want a policy, it usually costs about $550 a year." },
    { q: "Is Myrtle Trace inside Conway city limits?", a: "No. Myrtle Trace has a Conway mailing address but is outside the city, so owners there pay no Conway city tax." },
  ],
  sources: [
    { name: "Myrtle Trace HOA", href: HOA },
    { name: "HOA rules", href: COV },
    { name: "Horry County deed records", href: DEEDS },
    { name: "FEMA flood map", href: FEMA },
  ],
  sourcesNote: "Not legal or tax advice. The home sizes are from recent home listings. Drive times are OpenStreetMap estimates with no traffic. The flood cost is FEMA's middle policy price for this ZIP code.",
  /* The photo credits sit with the sources line, after the FAQ (website mkpage-photos.patch). */
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Talk to us about a home in Myrtle Trace.", p: "Call about the home you like. One of our agents will go over the HOA's rules and the costs with you. Office hours are Monday to Friday 9 to 6 and Saturday 10 to 4.", label: "Call an agent", href: TEL },
  keywords: "Myrtle Trace Conway, Myrtle Trace 55 community, living in Myrtle Trace, Myrtle Trace HOA fee, Myrtle Trace homes, Myrtle Trace activities",
  about: "Myrtle Trace, a 55+ community in unincorporated Horry County near Conway, South Carolina",
};
