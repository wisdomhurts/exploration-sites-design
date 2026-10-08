// Thumbnail, example count and client names for services.html, read at build
// time from the pages themselves, so What We Do always shows the first piece
// (and true count) of each category as currently ordered.
//   - Map pages and Presentations come from their data files.
//   - The other pages are hand-written HTML: we take the first card's <img>,
//     count the cards (site-card / design-card / movie-card) and read the card
//     titles for client names.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..");
const abs = (p) => (p.startsWith("/") ? p : "/" + p);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&rsquo;/g, "’").replace(/&#39;/g, "'").trim();

// Client name from a map caption: "New Found Gold — Keats drill results" -> "New Found Gold".
// Generic figures with no client ("Porphyry deposit model") have no " — " and are skipped.
const clientFromCaption = (c) => (c.includes(" — ") ? decode(c.split(" — ")[0]) : null);

function fromData(file, imgKey = "src", nameOf = (m) => clientFromCaption(m.caption)) {
  const d = require(path.join(__dirname, file));
  return { img: abs(d[0][imgKey]), count: d.length, clients: d.map(nameOf).filter(Boolean) };
}

function fromPage(page, cardClass) {
  const html = fs.readFileSync(path.join(SRC, page), "utf8");
  const cards = html.split(`class="${cardClass}"`);
  const count = cards.length - 1;
  const m = count > 0 ? cards[1].match(/<img[^>]*\ssrc="([^"]+)"/) : null;
  const titleClass = cardClass + "-title";
  const clients = [...html.matchAll(new RegExp(`class="${titleClass}">([^<]+)<`, "g"))].map((x) => decode(x[1]));
  return { img: m ? abs(m[1]) : null, count, clients };
}

// Up to `max` distinct client names, taken round-robin from the pages in order,
// so each category contributes its lead clients.
function recent(pages, max = 5) {
  const out = [];
  const seen = new Set();
  const key = (n) => n.toLowerCase().replace(/\b(metals|mining|gold|copper|silver|resources|minerals|corp|inc)\b/g, "").replace(/[^a-z]/g, "");
  for (let i = 0; out.length < max && i < 40; i++) {
    for (const p of pages) {
      const n = p.clients[i];
      if (n && !seen.has(key(n))) { seen.add(key(n)); out.push(n); }
      if (out.length >= max) break;
    }
  }
  return out;
}

module.exports = () => {
  const s = {
    "locators-area-plays.html": fromData("locatorMaps.json"),
    "property-target.html": fromData("propertyMaps.json"),
    "geoscience-maps.html": fromData("geoMaps.json"),
    "drilling.html": fromData("drillingMaps.json"),
    "3d-models.html": fromData("modelMaps.json"),
    "schematics-plans.html": fromData("schematicsMaps.json"),
    // The program page leads with these New Found Gold maps; it is a program, not a gallery, so no count.
    "news-release-map-program.html": { img: "/images/work/drilling/nfg-keats-news-release.webp", count: 0, clients: [] },
    "webflow.html": fromPage("webflow.html", "site-card"),
    "wordpress.html": fromPage("wordpress.html", "site-card"),
    "hosting.html": { ...fromPage("hosting.html", "site-card"), count: 0 },
    "presentations.html": fromData("presentations.json", "cover", (d) => d.title),
    "fact-sheets.html": fromPage("fact-sheets.html", "design-card"),
    "movies.html": fromPage("movies.html", "movie-card"),
    "logos-branding.html": fromPage("logos-branding.html", "design-card"),
    "conference-booth.html": fromPage("conference-booth.html", "design-card"),
  };
  s.recent = {
    maps: recent(["locators-area-plays.html", "drilling.html", "3d-models.html", "property-target.html", "geoscience-maps.html", "schematics-plans.html"].map((k) => s[k])),
    websites: recent(["webflow.html", "wordpress.html"].map((k) => s[k])),
    presentations: recent(["presentations.html", "fact-sheets.html"].map((k) => s[k])),
    // Logos-page card titles describe the piece ("The mark"), not the client, so Design draws on the booth page.
    design: recent(["conference-booth.html"].map((k) => s[k])),
  };
  return s;
};
