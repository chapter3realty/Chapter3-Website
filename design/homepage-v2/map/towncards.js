// The town pins on the homepage map, with each town's card facts. One place for them, used two ways:
//   require: pins() returns them (assemble.js used it while the page was a preview; the page went live 2026-10-05)
//   node design/homepage-v2/map/towncards.js [page]   rewrites the pins in a built page in place, chapter3realty/index.html
//     by default. Run it after a refresh of data/str-market.json (the short-term rental figures, every 90 days) or of
//     data/towns.json (Zillow's home values: python3 design/homepage-v2/map/build_towns.py). build.js check fails while the
//     homepage's figures disagree with data/str-market.json.
// A card shows the town's typical home value (Zillow) and its short-term rentals (AirROI, from the site's own data file,
// so a card always matches its town page). fx.html draws the card from the data attributes, and from them writes each
// label's description for assistive tech, the same facts in sentences (in the page as written they would count as body
// copy: their 300 words made the audit read the homepage as an article, and their dates as dates in body copy).
const fs = require("fs"), path = require("path");
const HP = path.join(__dirname, ".."), REPO = path.join(HP, "..", "..");
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function load() {
  return {
    plane: JSON.parse(fs.readFileSync(path.join(HP, "data", "strand-plane.json"), "utf-8")),
    zv: JSON.parse(fs.readFileSync(path.join(HP, "data", "towns.json"), "utf-8")),
    str: JSON.parse(fs.readFileSync(path.join(REPO, "data", "str-market.json"), "utf-8")),
  };
}

// { PINS: the <li> lines, PINS_DATA: the attributes of the <ol> }
function pins({ plane, zv, str } = load()) {
  const f = (n) => +(n / 100).toFixed(4);
  // the town pages' own words for the same figures: "AirROI, data through 2026-08-08"
  const asOf = new Date(str.dataAsOf + "T12:00:00Z"), strWhen = `data through ${MON[asOf.getUTCMonth()]} ${asOf.getUTCDate()}, ${asOf.getUTCFullYear()}`;
  const towns = Object.entries(plane.towns).sort((a, b) => b[1].y - a[1].y);   // south to north, the order a visitor reads the coast
  const PINS = towns.map(([slug, t], k) => {
    if (!fs.existsSync(path.join(REPO, "chapter3realty", "submarkets", slug, "index.html"))) throw new Error("no page for town " + slug);
    const z = zv.towns[slug]; if (!z) throw new Error("no home value for town " + slug + " in data/towns.json");
    const m = (str.markets || []).find((x) => x.slug === slug);
    if (!m && !(str.noMarket || []).some((x) => x.slug === slug)) throw new Error("town " + slug + " is in neither list of data/str-market.json");
    const zip = z.region.type === "zip" ? z.region.name : "";
    const data = `data-v="${z.value}" data-y="${z.yoy}" data-t="${z.tenYear}" data-s="${z.series.join(",")}"${zip ? ` data-zip="${zip}"` : ""}${m ? ` data-adr="${m.adr}" data-occ="${m.occupancy}"` : ""}`;
    return `<li class="tw-pt tw-pin" data-town="${slug}" style="--px:${f(t.px)};--py:${f(t.py)};--i:${k}" ${data}><a href="/submarkets/${slug}/">${t.n}</a><i class="rg"></i></li>`;
  }).join("\n");
  const PINS_DATA = `data-zm="${zv.monthName}" data-zs="${zv.startName}" data-am="${strWhen}"`;
  return { PINS, PINS_DATA };
}

module.exports = { pins, load };

if (require.main === module) {
  const page = process.argv[2] || path.join(REPO, "chapter3realty", "index.html");
  const crlf = fs.readFileSync(page, "utf-8").includes("\r\n");
  const s = fs.readFileSync(page, "utf-8").replace(/\r\n/g, "\n");
  const re = /<ol class="tw-pins" role="list" aria-label="Towns on the map"[^>]*>\n[\s\S]*?\n<\/ol>/;
  if (!re.test(s)) { console.error(path.relative(REPO, page) + " has no town pins to update"); process.exit(1); }
  const { PINS, PINS_DATA } = pins();
  const out = s.replace(re, `<ol class="tw-pins" role="list" aria-label="Towns on the map" ${PINS_DATA}>\n${PINS}\n</ol>`);
  fs.writeFileSync(page, crlf ? out.replace(/\n/g, "\r\n") : out);
  console.log(out === s ? "town pins already current in " : "updated the town pins in ", path.relative(REPO, page));
}
