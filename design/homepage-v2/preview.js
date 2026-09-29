// Build the self-contained preview of the redesign for the Artifact viewer.
//   node design/homepage-v2/preview.js <outdir>
// Writes <outdir>/index.html and copies the hero film and the map to <outdir>/media/, so the
// folder can be served locally and checked before it is published. Media paths become
// relative ("media/hero/...", "media/map/..."), because the artifact page does not live at the site root.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const DIR = __dirname, REPO = path.join(DIR, "..", "..");
const out = path.resolve(process.argv[2] || "preview");
const DIRS = ["hero", "map"];
for (const d of DIRS) fs.mkdirSync(path.join(out, "media", d), { recursive: true });
const page = path.join(out, "index.html");
execFileSync("node", [path.join(REPO, "tools", "mkpreview.js"), "/", page, path.join(DIR, "index.html")], { stdio: "inherit" });
let s = fs.readFileSync(page, "utf-8");
const n = (s.match(/\/media\/(hero|map)\//g) || []).length;
s = s.replace(/(["\s,])\/media\/(hero|map)\//g, "$1media/$2/");
if (/\/media\/(hero|map)\//.test(s.replace(/(["\s,])media\/(hero|map)\//g, ""))) throw new Error("absolute media path left");
// preview only: the analyzer would navigate inside the viewer, so it explains itself instead;
// the sticky header clears the phone status bar the way the viewer pads the page.
s += `\n<style>header{top:env(safe-area-inset-top,0px)}</style>\n<script>window.shouldIBuy=function(){var t=document.getElementById('c3toast');t.textContent='Preview only: the investor analysis opens on the live site.';t.style.display='block';setTimeout(function(){t.style.display='none'},2600);};</script>\n`;
// the gallery names the artifact from <title>; the preview is named for what it is, the site page keeps its own
s = s.replace(/<title>[\s\S]*?<\/title>/, '<title>Chapter3 Homepage Redesign</title>');
fs.writeFileSync(page, s);
const files = {};
for (const d of DIRS) for (const f of fs.readdirSync(path.join(DIR, "media", d))) {
  fs.copyFileSync(path.join(DIR, "media", d, f), path.join(out, "media", d, f));
  files["media/" + d + "/" + f] = path.join(out, "media", d, f);
}
console.log("rewrote", n, "media paths;", Object.keys(files).length, "media files");
fs.writeFileSync(path.join(out, "files.json"), JSON.stringify(files, null, 1));
