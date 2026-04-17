// One-shot script to build src/assets/client-projects.js from src/clients.html.
// Reads table rows, geocodes the location string to a representative mining-region
// centroid, applies deterministic jitter so overlapping locations spread out.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const SRC = path.join(ROOT, 'src', 'clients.html');
const OUT = path.join(ROOT, 'src', 'assets', 'client-projects.js');

const html = fs.readFileSync(SRC, 'utf8');

// Rows that carry client data have exactly this shape; header rows use <th>.
// Match all <tr>...</tr> that contain <td>.
const rowRegex = /<tr>\s*<td>([^<]*)<\/td>\s*<td>[^<]*<\/td>\s*<td>[^<]*<\/td>\s*<td>[^<]*<\/td>\s*<td>[^<]*<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>/g;

const rows = [];
let m;
while ((m = rowRegex.exec(html)) !== null) {
  rows.push({
    name: decode(m[1].trim()),
    commodity: decode(m[2].trim()),
    location: decode(m[3].trim()),
  });
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Location → [lat, lon]. Keys are matched case-insensitively after trimming.
// Representative mining-region centroids where specified in the spec; otherwise
// a sensible mining-district centroid.
const GEO = {
  // Canada provinces/territories
  'yukon, canada':                [63.8, -138.0],
  'bc, canada':                   [55.0, -126.0],
  'british columbia, canada':     [55.0, -126.0],
  'ontario, canada':              [49.0, -84.0],
  'quebec, canada':               [48.5, -77.0],
  'alberta, canada':              [54.0, -115.0],
  'manitoba, canada':             [55.0, -98.0],
  'saskatchewan, canada':         [58.2, -104.5],  // Athabasca uranium basin
  'newfoundland, canada':         [49.5, -56.0],
  'new brunswick, canada':        [47.0, -66.5],
  'nunavut, canada':              [65.0, -105.0],
  'nova scotia, canada':          [45.0, -63.0],
  'nwt, canada':                  [63.5, -116.0],
  'canada':                       [55.0, -105.0],

  // USA states
  'nevada, usa':                  [40.5, -117.0],
  'idaho, usa':                   [44.5, -115.5],
  'arizona, usa':                 [33.0, -111.0],
  'alaska, usa':                  [63.0, -147.0],
  'montana, usa':                 [46.5, -112.5],
  'wyoming, usa':                 [42.5, -107.5],
  'nebraska, usa':                [42.0, -102.0],
  'utah, usa':                    [39.5, -112.5],
  'colorado, usa':                [39.0, -106.5],
  'california, usa':              [36.5, -118.0],
  'usa':                          [39.0, -98.0],
  'nevada, usa / peru':           [40.5, -117.0],  /* primary: Nevada */

  // Australia
  'victoria, australia':          [-37.0, 143.0],
  'western australia':            [-26.0, 121.0],
  'wa, australia':                [-26.0, 121.0],
  'nsw, australia':               [-31.5, 146.0],
  'queensland, australia':        [-22.0, 144.0],
  'qld, australia':               [-22.0, 144.0],
  'south australia':              [-30.0, 136.0],
  'sa, australia':                [-30.0, 136.0],
  'nt, australia':                [-14.5, 132.5],
  'tasmania, australia':          [-41.5, 146.5],
  'australia':                    [-25.0, 133.0],

  // Latin America
  'argentina':                    [-28.0, -67.0],
  'salta, argentina':             [-24.0, -66.0],
  'brazil':                       [-6.0, -50.0],
  'peru':                         [-10.0, -76.0],
  'chile':                        [-24.0, -69.0],
  'mexico':                       [24.0, -102.5],
  'colombia':                     [6.0, -74.0],
  'guyana':                       [5.5, -58.5],
  'suriname':                     [4.5, -55.5],
  'guatemala':                    [15.0, -90.5],
  'ecuador':                      [-1.5, -78.5],

  // Africa
  'ghana':                        [6.5, -1.5],
  "cote d'ivoire":                [9.0, -5.5],
  'cote d\'ivoire':               [9.0, -5.5],
  "côte d'ivoire":                [9.0, -5.5],
  'mali':                         [13.0, -8.0],
  'burkina faso':                 [12.5, -1.5],
  'guinea':                       [10.5, -11.0],
  'drc':                          [-7.0, 23.0],
  'dr congo':                     [-7.0, 23.0],
  'zambia':                       [-13.0, 28.0],
  'south africa':                 [-28.0, 27.0],
  'tanzania':                     [-6.5, 35.0],
  'namibia':                      [-22.0, 17.5],
  'botswana':                     [-22.0, 24.0],
  'cameroon':                     [5.5, 12.5],
  'west africa':                  [11.5, -3.0],
  'africa':                       [2.0, 20.0], /* approx — continent-level fallback */

  // Europe
  'finland':                      [65.0, 25.5],
  'sweden':                       [66.5, 20.0],
  'portugal':                     [37.8, -8.0],
  'ireland':                      [53.0, -8.5],
  'serbia':                       [44.0, 21.0],
  'germany':                      [51.0, 10.5],
  'austria':                      [47.5, 14.5],
  'spain':                        [37.5, -6.0],

  // Asia-Pacific
  'mongolia':                     [43.5, 106.5],
  'papua new guinea':             [-6.0, 143.0],
  'philippines':                  [12.0, 122.0],
  'indonesia':                    [-2.0, 120.0],
  'new zealand':                  [-42.0, 172.0],

  // Generic
  'multiple':                     [50.0, -100.0], /* approx — diversified Canadian portfolio */
};

function lookup(locRaw) {
  if (!locRaw || locRaw === '—' || locRaw === '-') return null;
  const key = locRaw.toLowerCase().trim();
  if (GEO[key]) return GEO[key];
  // Try last segment (e.g., "Kalgoorlie, Western Australia" → "western australia").
  const parts = key.split(',').map(s => s.trim());
  if (parts.length > 1) {
    const tail = parts.slice(-1)[0];
    if (GEO[tail]) return GEO[tail];
    const tail2 = parts.slice(-2).join(', ');
    if (GEO[tail2]) return GEO[tail2];
  }
  return null;
}

// Deterministic PRNG so output is stable across runs.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit seed so jitter is stable per-name.
function hash32(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const unknown = [];
const entries = [];
const locCounts = new Map();

for (const row of rows) {
  const hit = lookup(row.location);
  if (!hit) {
    unknown.push(`${row.name}  (location="${row.location}", commodity="${row.commodity}")`);
    continue;
  }
  const key = `${hit[0]},${hit[1]}`;
  locCounts.set(key, (locCounts.get(key) || 0) + 1);

  // Jitter: deterministic per-name, ±0.5° lat/lon. Only apply if more than one
  // client shares this centroid (we apply always for simplicity; it's tiny).
  const rng = mulberry32(hash32(row.name));
  const dLat = (rng() - 0.5) * 1.0; // ±0.5
  const dLon = (rng() - 0.5) * 1.0;

  entries.push({
    name: row.name,
    lat: +(hit[0] + dLat).toFixed(3),
    lon: +(hit[1] + dLon).toFixed(3),
    commodity: row.commodity || 'Unknown',
    rawLocation: row.location,
  });
}

// Emit file.
const header = `// Client project locations — geocoded from src/clients.html.
// Lat/lon are representative mining-region centroids (not strict admin centers);
// each entry has small deterministic jitter so dots in shared regions don't
// perfectly overlap. Regenerate via scripts/build-client-projects.js.

export const CLIENT_PROJECTS = [
`;

const padName = Math.max(...entries.map(e => JSON.stringify(e.name).length));
const padLat  = Math.max(...entries.map(e => String(e.lat).length));
const padLon  = Math.max(...entries.map(e => String(e.lon).length));

const body = entries.map(e => {
  const n   = (JSON.stringify(e.name) + ',').padEnd(padName + 1);
  const lat = String(e.lat).padStart(padLat);
  const lon = String(e.lon).padStart(padLon);
  const c   = JSON.stringify(e.commodity);
  return `  { name: ${n} lat: ${lat}, lon: ${lon}, commodity: ${c} },`;
}).join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header + body + '\n];\n', 'utf8');

console.log(`Rows parsed:   ${rows.length}`);
console.log(`Entries out:   ${entries.length}`);
console.log(`Unknown locs:  ${unknown.length}`);
if (unknown.length) {
  console.log('---');
  for (const u of unknown) console.log('  ' + u);
}
console.log(`Wrote: ${OUT}`);
