const fs = require("fs"), path = require("path");
const PH = require("/home/user/Blog-Brain/tools/photos.js");
const WEB = "/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2";
const SLUG = "submarkets-north-myrtle-beach", D = path.join(WEB, "data/2026-11-a", SLUG), IMG = path.join(WEB, "chapter3realty/images/2026-11-a", SLUG);
const OUT = "/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/wf2/submarkets-north-myrtle-beach/aer2/out";
const PJ = JSON.parse(fs.readFileSync(path.join(D, "photos.json"), "utf8"));
const LAB = JSON.parse(fs.readFileSync(path.join(D, "images/aerial-labels-fix1.json"), "utf8"));
const base = PJ.photos.find((p) => p.file.includes("barefoot-landing-waterway"));
const TILE = { "windy-hill-beach": "m_3307811_sw_17_060_20230410", "west-of-us-17-new-streets": "m_3307811_nw_17_060_20230410", "tilghman-beach": "m_3307811_ne_17_060_20230410" };
const NEW = {
  "windy-hill-beach": { name: "windy-hill-from-above", title: "Windy Hill, North Myrtle Beach, from above, NAIP aerial, April 2023",
    what: "Windy Hill in North Myrtle Beach from straight above: streets of houses under trees, a row of condo buildings along Ocean Boulevard and the beach, the ocean at lower right and a marsh creek at the left. Labels: Windy Hill, Atlantic Ocean.",
    caption: "Windy Hill from above, 2023 aerial: streets of houses under the trees, condo buildings along the ocean, and a marsh creek at the left.",
    alt: "From above: streets of houses among trees labelled Windy Hill, a row of condo buildings along the beach, and the Atlantic Ocean",
    sub: "Windy Hill" },
  "west-of-us-17-new-streets": { name: "west-of-us-17-new-streets-from-above", title: "West of US 17, North Myrtle Beach, from above, NAIP aerial, April 2023",
    what: "The mainland west of US 17 in North Myrtle Beach from straight above: new streets and ponds cleared for houses, rows of new houses on some of them, the ball fields of Central Park, and US 17 at lower right. A golf course at the lower left is not labelled. Labels: West of US 17, Central Park, US 17.",
    caption: "West of US 17 from above, 2023 aerial: new streets cleared for houses, Central Park's ball fields, and US 17.",
    alt: "From above: new streets and ponds cleared for houses labelled West of US 17, ball fields labelled Central Park, and the highway labelled US 17",
    sub: "West of US 17, Central Park" },
  "tilghman-beach": { name: "tilghman-beach-from-above", title: "Tilghman Beach, North Myrtle Beach, from above, NAIP aerial, April 2023",
    what: "Tilghman Beach in North Myrtle Beach from straight above: a row of houses along the ocean, streets of houses and lakes behind them, and a few condo buildings at the lower left. Labels: Tilghman Beach, Atlantic Ocean.",
    caption: "Tilghman Beach from above, 2023 aerial: a row of houses along the ocean, and streets of houses around the lakes behind them.",
    alt: "From above: houses around lakes labelled Tilghman Beach, a row of houses along the beach, and the Atlantic Ocean",
    sub: "Tilghman Beach" },
};
for (const [k, o] of Object.entries(NEW)) {
  const L = LAB[k]; const file = `images/2026-11-a/${SLUG}/${o.name}-1200w.webp`;
  const rec = Object.assign({}, base, {
    source_request: L.source_request, frame: { bbox_wgs84: L.bbox_wgs84, ground_m_per_px_1200w: 1.7 }, naip_tiles: [TILE[k]],
    labels: L.labels.map((x) => x.text), annotation_sources: Object.fromEntries(L.labels.map((x) => [x.text, `${x.source} (${x.lon}, ${x.lat})`])),
    method: "data/2026-11-a/submarkets-north-myrtle-beach/images/aerial_render_fix1.py and aerial-labels-fix1.json (fix round 1; labels from ground coordinates through the export's own EPSG:3857 extent, never by eye)",
    file, variants: { 600: file.replace("-1200w", "-600w"), 1200: file }, title: o.title, what: o.what, caption: o.caption, alt: o.alt,
    place: { city: "North Myrtle Beach", sublocation: o.sub },
    provenance: `U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm, flown 2023-04-10 (tile ${TILE[k]}, read with the image service's identify call on 2026-11-04).`,
    subject_check: "Looked at full size (1200 px) by the fixer of /submarkets/north-myrtle-beach/ on 2026-11-04. Every label's dot or box sits on the place it names (coordinates in aerial-labels-fix1.json). No person, sign, plate or house number is readable at this scale." });
  delete rec.crops;
  PH.checkRecord(rec);
  const v = PH.makeVariants(path.join(OUT, `${k}.png`), path.join(IMG, o.name), { rec });
  rec.width = v.width; rec.height = v.height;
  PJ.photos = PJ.photos.filter((p) => p.file !== file); PJ.photos.push(rec);
}
/* The 1941 postcard of the pavilion at Ocean Drive Beach. */
{
  const file = `images/2026-11-a/${SLUG}/ocean-drive-beach-pavilion-postcard-1941-1200w.webp`;
  const rec = { slug: SLUG, source: "https://commons.wikimedia.org/wiki/File:Ocean_Drive_Beach_-_Roberts_Pavilion.jpg", commons_page: "https://commons.wikimedia.org/wiki/File:Ocean_Drive_Beach_-_Roberts_Pavilion.jpg",
    source_name: "Wikimedia Commons", author: "Tichnor Brothers, Boston (publisher)", author_type: "Organization", license: "Public domain",
    license_url: "https://commons.wikimedia.org/wiki/Template:PD-US-no_notice",
    license_note: "Commons file page (API extmetadata read 2026-11-04): LicenseShortName 'Public domain', category 'PD US no notice', Copyrighted False; a postcard published in 1941 without a copyright notice. The batch verifier checked this file's licence on 2026-11-03 (VERIFY.md, photo candidates: 'Public domain (same rule), Tichnor Brothers postcard, 1941').",
    taken: "1941", display_credit: "Postcard, 1941, public domain",
    credit: "Postcard: Tichnor Brothers, Boston, 1941, public domain, via Wikimedia Commons. Resized by Chapter3 Realty.",
    digital_source_type: "print", changes: "Chapter3 Realty resized the scan",
    file, variants: { 600: file.replace("-1200w", "-600w"), 1200: file },
    title: "The pavilion at Ocean Drive Beach, postcard, 1941",
    what: "A colored 1941 postcard titled 'Pavilion, Ocean Drive Beach, S. C.': a long two-story wooden pavilion on the sand with 'Roberts Pavilion' and 'Dancing' painted on its end wall, a bath house and cafe signs along its front, and two cars of the time parked beside it. Drink advertisements on the wall are incidental, not the subject; no person is the subject.",
    caption: "The pavilion at Ocean Drive Beach on a 1941 postcard, with \"Dancing\" painted on its end wall.",
    alt: "A postcard of a long wooden pavilion on the beach at Ocean Drive, with Roberts Pavilion and Dancing painted on its end wall and old cars parked beside it",
    place: { city: "North Myrtle Beach", sublocation: "Ocean Drive" },
    provenance: "Wikimedia Commons, File:Ocean_Drive_Beach_-_Roberts_Pavilion.jpg (1489 x 936), downloaded 2026-11-04 at 1280 x 805 through the Commons thumbnail service.",
    subject_check: "Looked at full size (1280 px) by the fixer of /submarkets/north-myrtle-beach/ on 2026-11-04: the printed title reads 'Pavilion, Ocean Drive Beach, S. C., America's Finest Strand'; the end wall reads 'Roberts Pavilion' and 'Dancing'. Ad signs (Coca-Cola, a beer brand) are on the wall but are not the subject." };
  PH.checkRecord(rec);
  const v = PH.makeVariants(path.join(OUT, "roberts-1280.jpg"), path.join(IMG, "ocean-drive-beach-pavilion-postcard-1941"), { rec });
  rec.width = v.width; rec.height = v.height;
  PJ.photos = PJ.photos.filter((p) => p.file !== file); PJ.photos.push(rec);
}
fs.writeFileSync(path.join(D, "photos.json"), JSON.stringify(PJ, null, 1) + "\n");
console.log(PJ.photos.map((p) => `${p.file} ${p.width}x${p.height}`).join("\n"));
