# Schools page: compliance brief for Devin and Timmy

Written 2026-08-16 for `/buyers/relocating/schools/`. Two pages. Read this
before reviewing the page. Sources are quoted in full in
`research/relocating/schools-brief.md`, Part 1.

## What the law says, in three sentences

1. The Fair Housing Act and HUD's rule prohibit **steering**: restricting a
   buyer's choices "because of" race, color, religion, sex, disability,
   familial status, or national origin, including by "exaggerating drawbacks
   or failing to inform any person of desirable features" of a neighborhood.
   (24 CFR 100.70.)
2. On **April 24, 2026** HUD's fair housing office issued a "Dear Colleague"
   letter saying agents "do not violate the Fair Housing Act merely by
   discussing ... the quality of schools," provided the information is given
   "in an equal and consistent manner," "truthfully," and is "nonracial." HUD
   told its funded state agencies (South Carolina's Human Affairs Commission
   is one) not to bring cases on that basis.
3. On **June 5, 2026** NAR published FAQs agreeing agents may share school
   information, and warning that the letter "may not shield agents from
   liability": courts have treated comments like "poor schools" as
   **code words** for race, private plaintiffs and state regulators can still
   sue, and NAR's advice is unchanged since the 1980s: **objective, factual,
   from reliable sources, the same for everyone; avoid subjective commentary,
   personal opinions, or hearsay.**

The Newsday Long Island investigation (2019) is the case to remember: agents
were disciplined because their *opinions* about schools functioned as a proxy
for race, even though nobody mentioned race. The district they steered
people away from had a 97 percent graduation rate.

## Why a public web page is the safest place to do this

A page is, by definition, "the same information for everyone." The risk is
not *that* we publish school information; it is *what kind*. Opinions and
rankings are the exposure. Facts and official tools are not.

## The rules this page follows

| Rule | On the page it looks like |
|---|---|
| Facts only, from official sources | SC Department of Education report cards, Horry County Schools and Georgetown County School District sites, the state Commission on Higher Education. Every fact links to where it came from. |
| No quality words | Never "good," "bad," "best," "top," "strong," "great," "desirable," "sought-after," "family-friendly," "safe." Not in headings, not in body, not in the FAQ. |
| No rankings, no ratings reprinted | We do not rank schools and we do not reprint GreatSchools/Niche scores or even the state's overall rating for each school. We explain what the state report card measures and link the reader to it. The reader forms the view. |
| No demographics | No enrollment by race, income, or language, and no phrases that stand in for them. |
| Describe the system, not the school | Zones, how to look one up, that zones change, choice and magnet programs and their deadlines, enrollment documents, tuition residency. |
| The buyer test | Every sentence should change what a buyer *does*: verify the zone before contract, do not trust listing remarks, check the rezoning history, know the choice application window. |
| Say why we do it this way | One plain paragraph tells the reader we do not rate schools, that the state publishes the data, and that the choice is theirs. It reads as service, and it is also our compliance position in writing. |

## What we deliberately leave out

- Any statement that a school, district, or attendance zone is better or
  worse than another, or that a neighborhood is "good for families."
- Third-party rating widgets or scores.
- Test-score tables copied from the report cards. Linking is fine;
  republishing a comparison table invites the reader to read it as our
  ranking.
- Anything about who lives in a zone.

## The one judgment call for you two

HUD's 2026 letter would let us go further: reprint the state's official
report card rating for each school as a fact. NAR still advises against
subjective commentary but says factual data from the school district is fine.
Reprinting the state's own rating is arguably factual. **We recommend not
doing it in version one**, for two reasons: private plaintiffs and the state
commission are not bound by HUD's letter, and a table of ratings on a
brokerage site reads as a recommendation no matter how it is labeled. If you
want the ratings shown later, that is a decision for you and, ideally, the
firm's attorney, and it can be added without rewriting the page.

## Audit gate

`node build.js audit` already fails the build on the phrases "good schools
for your kids," "family-friendly neighborhood," "safe neighborhood," "low
crime" and similar. This page adds no new gate; it stays clean under the
existing one.
