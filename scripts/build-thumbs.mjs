// Generates the small image variants the homepage serves (npm run thumbs).
//
//   map tiles     src/images/work/<type>/x.webp   -> .../thumb/x.webp      (640px wide)
//   site shots    src/images/sites/x.avif         -> .../sites/x-800.avif  (800px wide)
//   client logos  src/images/clients/x.avif      -> .../clients/sm/x.avif (320px wide)
//
// Only missing variants are written, so re-running is cheap. The `thumb`, `site800`
// and `logoSm` filters in .eleventy.js fall back to the original when a variant is
// missing, so forgetting to run this never breaks an image; it just costs bytes.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("src");
const DATA = ["locatorMaps", "propertyMaps", "geoMaps", "drillingMaps", "modelMaps", "schematicsMaps"];
let made = 0;

async function variant(from, to, width, fmt) {
  if (!fs.existsSync(from) || fs.existsSync(to)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const img = sharp(from).resize({ width, withoutEnlargement: true });
  await (fmt === "avif" ? img.avif({ quality: 55 }) : img.webp({ quality: 78 })).toFile(to);
  made++;
}

// Map tiles: every entry in every map data file (the homepage shows the first eight
// of each, in page order, so any reorder is already covered).
for (const name of DATA) {
  const maps = JSON.parse(fs.readFileSync(path.join(SRC, "_data", name + ".json"), "utf8"));
  for (const m of maps) {
    const rel = m.src.replace(/^\//, "");
    const to = path.join(SRC, path.dirname(rel), "thumb", path.basename(rel).replace(/\.\w+$/, ".webp"));
    await variant(path.join(SRC, rel), to, 640, "webp");
  }
}

// Website screenshots and client logos: every file in the folder.
for (const f of fs.readdirSync(path.join(SRC, "images/sites"))) {
  if (!/\.avif$/.test(f) || /-800\.avif$/.test(f)) continue;
  await variant(path.join(SRC, "images/sites", f), path.join(SRC, "images/sites", f.replace(/\.avif$/, "-800.avif")), 800, "avif");
}
for (const f of fs.readdirSync(path.join(SRC, "images/clients"))) {
  if (!/\.avif$/.test(f)) continue;
  await variant(path.join(SRC, "images/clients", f), path.join(SRC, "images/clients/sm", f), 320, "avif");
}
console.log(`thumbs: ${made} new variant(s)`);
