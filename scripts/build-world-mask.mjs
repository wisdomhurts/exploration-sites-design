// Downloads Natural Earth 1:110m land GeoJSON (public domain) and renders
// it to an equirectangular PNG land mask used by the hero globe.
//
// Output: src/assets/world-mask.png (white land on transparent ocean).

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
const OUT = 'src/assets/world-mask.png';
const W = 2048;
const H = 1024;

// lng (-180..180) -> x (0..W); lat (90..-90) -> y (0..H)
const px = (lng) => ((lng + 180) / 360) * W;
const py = (lat) => ((90 - lat) / 180) * H;

function ringToPath(ring) {
  // ring: [[lng, lat], ...] closed
  if (!ring.length) return '';
  let d = `M ${px(ring[0][0]).toFixed(2)} ${py(ring[0][1]).toFixed(2)}`;
  for (let i = 1; i < ring.length; i++) {
    d += ` L ${px(ring[i][0]).toFixed(2)} ${py(ring[i][1]).toFixed(2)}`;
  }
  return d + ' Z';
}

function polygonToPath(polygon) {
  // polygon: array of rings, first outer, rest inner
  return polygon.map(ringToPath).join(' ');
}

function featureToPath(feature) {
  const g = feature.geometry;
  if (!g) return '';
  if (g.type === 'Polygon') return polygonToPath(g.coordinates);
  if (g.type === 'MultiPolygon') return g.coordinates.map(polygonToPath).join(' ');
  return '';
}

async function main() {
  console.log(`Fetching ${SRC}...`);
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const geo = await res.json();

  const paths = geo.features.map(featureToPath).filter(Boolean).join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="black"/>
  <path d="${paths}" fill="white" fill-rule="evenodd"/>
</svg>`;

  const pngBuffer = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();

  // Flatten to a clean grayscale PNG for easy sampling
  await sharp(pngBuffer).png({ compressionLevel: 9 }).toFile(OUT);
  console.log(`Wrote ${OUT} (${W}×${H})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
