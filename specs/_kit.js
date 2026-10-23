/* The batch 2026-10-b kit: the shared page blocks, given this batch's data. Every spec in this
 * batch can require it. No sentence of page copy lives here: every word a reader sees is in a spec.
 *
 * Written 2026-10-13 by the writer of /buyers/gated-communities/. Other writers: add what your page
 * needs below the exports; do not change what an export already returns, because a page built on
 * it would change too.
 *
 * Blocks (Blog-Brain tools):
 *   tools/page-kit.js   placesMap (one map of 2 to 15 places with a numbered key), maps (one
 *                       community), photoSet, story, glance, prosCons, atAGlance, icon.
 *   tools/compare.js    compareCards (a table that becomes cards on a phone), wantPicker.
 * Data (../data/2026-10-b/ in the website working copy, from batches/2026-10-b/data/):
 *   photos.json         licensed photo records; optional until a page shows a photo.
 *
 * The spec runs from the website working copy (specs/). The copy in Blog-Brain
 * (batches/2026-10-b/specs/) is the record; it builds only from the website.
 */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

/* Where the Blog-Brain tools are: the copy an upload package puts in the website's
   tools/blog-brain-2026-10-b/ (tools/package-batch.js), then $BLOG_BRAIN, then the Blog-Brain repo.
   Batch 2026-10-a's pages keep tools/blog-brain/, so this batch's newer tools do not change them. */
const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const { compareCards, wantPicker } = require(path.join(BB, "tools", "compare.js"));

/* Where a map file goes when it is too big to sit inline (over 60 KB). */
const MAP_DIR = path.join(__dirname, "..", "chapter3realty", "images", "maps");
const MAP_SRC = "/images/maps";

/* This batch's files: the website's data/2026-10-b/ (where the upload package puts them), else the
   batch folder in Blog-Brain. Photo records: batch 2026-10-a's (the website's data/photos.json), then this batch's. */
const BATCH_DATA = [path.join(__dirname, "..", "data", "2026-10-b"), path.join(BB, "batches", "2026-10-b", "data"),
  "/home/user/Blog-Brain/batches/2026-10-b/data"].find((d) => fs.existsSync(path.join(d, "photos.json")));
if (!BATCH_DATA) throw new Error("batch 2026-10-b photos.json not found");
const PHOTO_FILES = [path.join(__dirname, "..", "data", "photos.json"), path.join(BATCH_DATA, "photos.json")].filter((f) => fs.existsSync(f));
const kit = PK.create({ h, photos: batchPhotos(), mapDir: MAP_DIR, mapSrc: MAP_SRC });

/* A batch data file, read fresh, from this batch's data folder. */
const data = (name) => JSON.parse(fs.readFileSync(path.join(BATCH_DATA, name), "utf8"));

module.exports = { h, kit, data, compareCards, wantPicker, BB,
  placesMap: kit.placesMap, photoSet: kit.photoSet, story: kit.story, glance: kit.glance,
  prosCons: kit.prosCons, atAGlance: kit.atAGlance, icon: kit.icon };

/* Added 2026-10-13 (gated communities, round 2): this batch's photo records. The website's
   data/photos.json holds batch 2026-10-a's records; batch 2026-10-b's photos.json is in BATCH_DATA.
   Records from both files are merged (batch 2026-10-a's first), so a page can show a photo from
   either batch. photoSetB(o) is kit.photoSet(o) over the merged records. */
function batchPhotos() {
  const recs = [];
  const add = (f) => { if (fs.existsSync(f)) for (const r of JSON.parse(fs.readFileSync(f, "utf8")).photos) if (!recs.some((x) => x.file === r.file)) recs.push(r); };
  for (const f of PHOTO_FILES) add(f);
  return recs;
}
const photoSetB = (o) => PK.create({ h, photos: batchPhotos(), mapDir: MAP_DIR, mapSrc: MAP_SRC }).photoSet(o);
module.exports.photoSetB = photoSetB;
module.exports.batchPhotos = batchPhotos;
