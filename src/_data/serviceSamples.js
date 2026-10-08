// Thumbnail + example count for each service row on services.html, read at
// build time from the pages themselves, so the What We Do page always shows the
// first piece (and true count) of each category as currently ordered.
//   - Map pages and Presentations come from their data files.
//   - The other pages are hand-written HTML: we take the first card's <img> and
//     count the cards (site-card / design-card / movie-card).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..");
const abs = (p) => (p.startsWith("/") ? p : "/" + p);

function fromData(file, imgKey = "src") {
  const d = require(path.join(__dirname, file));
  return { img: abs(d[0][imgKey]), count: d.length };
}

function fromPage(page, cardClass) {
  const html = fs.readFileSync(path.join(SRC, page), "utf8");
  const cards = html.split(`class="${cardClass}"`);
  const count = cards.length - 1;
  const m = count > 0 ? cards[1].match(/<img[^>]*\ssrc="([^"]+)"/) : null;
  return { img: m ? abs(m[1]) : null, count };
}

module.exports = () => ({
  "locators-area-plays.html": fromData("locatorMaps.json"),
  "property-target.html": fromData("propertyMaps.json"),
  "geoscience-maps.html": fromData("geoMaps.json"),
  "drilling.html": fromData("drillingMaps.json"),
  "3d-models.html": fromData("modelMaps.json"),
  "schematics-plans.html": fromData("schematicsMaps.json"),
  // The program page leads with these New Found Gold maps; it is a program, not a gallery, so no count.
  "news-release-map-program.html": { img: "/images/work/drilling/nfg-keats-news-release.webp", count: 0 },
  "webflow.html": fromPage("webflow.html", "site-card"),
  "wordpress.html": fromPage("wordpress.html", "site-card"),
  "hosting.html": { ...fromPage("hosting.html", "site-card"), count: 0 },
  "presentations.html": fromData("presentations.json", "cover"),
  "fact-sheets.html": fromPage("fact-sheets.html", "design-card"),
  "movies.html": fromPage("movies.html", "movie-card"),
  "logos-branding.html": fromPage("logos-branding.html", "design-card"),
  "infographics.html": fromPage("infographics.html", "design-card"),
  "conference-booth.html": fromPage("conference-booth.html", "design-card"),
});
