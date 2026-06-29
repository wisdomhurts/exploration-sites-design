// Build-time grouping of the globe's client-project pins (projects.json) by continent,
// so the hero can render a VISIBLE, keyboard/screen-reader-reachable "clients by region"
// panel — an accessible route to the geographic proof the decorative globe shows (A11Y-09).
// Counts derive from the same data that draws the pins, so they can never drift.
const projects = require("./projects.json");

function region(lat, lon) {
  if (lat >= 13 && lon >= -170 && lon <= -50) return "North America";
  if (lat < 13 && lon >= -85 && lon <= -34) return "South America";
  if (lon >= -12 && lon <= 45 && lat >= 35) return "Europe";
  if (lon >= -20 && lon <= 52 && lat >= -38 && lat < 38) return "Africa";
  if (lon >= 110 && lat < 5) return "Australia & Oceania";
  if (lon >= 25 && lon <= 155 && lat >= 0) return "Asia";
  return "Other";
}

const order = ["North America", "South America", "Europe", "Africa", "Asia", "Australia & Oceania", "Other"];
const counts = {};
projects.forEach((p) => {
  const r = region(p.lat, p.lon);
  counts[r] = (counts[r] || 0) + 1;
});

module.exports = order
  .filter((r) => counts[r])
  .map((r) => ({ region: r, count: counts[r] }))
  .sort((a, b) => b.count - a.count);
