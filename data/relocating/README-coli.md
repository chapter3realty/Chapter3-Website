# The cost-of-living index behind the calculator

Two indexes live in `col-places.json`. The page uses the second one.

## `rpp` — the BEA Regional Price Parities

Straight from the U.S. Bureau of Economic Analysis, 2024 vintage. Public
domain. Five numbers per place, US average = 100: `all`, `goods`, `housing`,
`utilities`, `other`.

Correct, official, and **wrong for this page as a headline**. Two reasons:

1. BEA weights housing at about **14.5%** of consumption. Solved for it
   directly against every metro; the fit is within ~4 index points.
2. BEA measures housing as **rent**, including an imputed rent for owners.

That is the right way to answer "what does a basket of everything cost".
It is the wrong way to answer "I am buying a house, what changes", which is
the only question this page's readers have.

The effect was large. Los Angeles to Myrtle Beach on $70,000 came out at
**$57,719**, while Forbes published **$45,276** for the same move. Every
competing calculator showed a bigger saving than ours, because every competing
calculator licenses C2ER.

## `coli` — the buyer-weighted index the page uses

Same idea as C2ER's Cost of Living Index, built from data we are allowed to
publish.

- **Weights**: C2ER's own published category weights. Housing 28.03%,
  utilities 9.65%, groceries 13.06% + transportation 11.50% (both ride the BEA
  `goods` index), health 4.36% + miscellaneous 33.40% (both ride BEA `other`).
  The weights are published. Only C2ER's **collected prices** are licensed,
  and none of those are used here.
- **Housing**: Zillow's typical home value for the place, divided by the US
  typical home value, times 100. A home **price**, not a rent.
- **Everything else**: the BEA component indexes.

### Does it work

Checked against the two Forbes figures we have:

| Move | Forbes (C2ER) | This index | Difference |
|---|---|---|---|
| Los Angeles to Myrtle Beach | $45,276 | $43,303 | −4.4% |
| Portland to Myrtle Beach | $55,806 | $57,662 | +3.3% |

Within about 4% on both, in opposite directions, which is what an honest
approximation of a licensed dataset should look like.

Range across all 380 metros with a home value: **77.0** (Enid, OK) to
**196.4** (San Jose). No outliers. Myrtle Beach is **95.0**.

### What it is not

It is not C2ER data and must never be described as such. It is not a
per-item price list: there are no milk or bread prices here, because no free
source publishes them by metro (see `research/relocating/local-facts.md` E23
for the licence terms on all five candidates).

Seven places have no Zillow home value and therefore no `coli`. The page
falls back to the BEA all-items index for those and says so.

## The city name index

`cities.json` and `chapter3realty/assets/cities.js` map 12,097 town names to
the metro the calculator prices. Built by `node build.js citydata` from three
public domain Census files: the 2020 place file, the July 2023 CBSA
delineation, and the Vintage 2024 population estimates.

It exists because the picker used to search metro titles only. "Plano",
"Scottsdale", "Bethesda" and "Boca Raton" appear in no metro title, so those
buyers got no result at all. Worse, "Conway" returned Little Rock, when Conway
is in our own metro.

Three things it has to get right, each of which was wrong on the first build:

- The county list in the place file is separated by `~~~`, not commas.
  Splitting on commas drops every city in two counties, which is most large
  suburbs. Plano, Frisco and Cary all disappeared.
- A city in two counties must not take the first one listed. Cary sits in
  Chatham and Wake, and the first lands it in Durham instead of Raleigh.
- Connecticut replaced counties with planning regions in 2022. The delineation
  file uses the new regions, the place file still uses the old counties, and
  there is no newer place file. CT is bridged by hand in `build-cities.js`.

Census designated places are kept at any size because the population estimates
program does not cover them, so every one would score zero and be cut. That
includes Bethesda, Arlington, Silver Spring, Metairie and The Villages.

The file is 282KB, so the page fetches it only when the cursor lands in the
city box. The metro search works without it.

## Refreshing

`node build.js coldata` rebuilds both indexes and the browser asset from the
raw files, re-downloading the Zillow CSVs if they are missing. Then
`node build.js rehash`. The build fails if Myrtle Beach's index leaves the
60–140 band, or if more than 25 places lose their home value.
