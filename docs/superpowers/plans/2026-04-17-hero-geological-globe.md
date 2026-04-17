# Hero Geological Globe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the locked hero geological globe — a paper-map Earth centered on the Pacific Ring of Fire that performs a 3.5-second rotate-then-ignite reveal on page load, then freezes.

**Architecture:** ES modules loaded via browser import map (no bundler — matches the existing Eleventy passthrough philosophy). Three.js r171+ with WebGPU renderer (falls back to WebGL automatically). Single sphere mesh using `MeshBasicNodeMaterial` with a TSL `colorNode` that combines a procedural Quartz/Vellum gradient, a sampled continent/plate texture atlas, procedurally-drawn graticule lines, and shader-drawn Ore dots from a uniform array. JavaScript drives sphere rotation and a reveal-progress uniform. Inline SVG fallback in the HTML renders immediately and is replaced once the canvas initializes. `prefers-reduced-motion` and no-JS users see the same static SVG.

**Tech Stack:** Three.js r171+ (via jsdelivr CDN), TSL (Three.js Shading Language), Eleventy 3.x, vanilla ES modules, HTML import maps.

**Spec:** [docs/superpowers/specs/2026-04-17-hero-geological-globe-design.md](../specs/2026-04-17-hero-geological-globe-design.md)
**Visual reference:** [docs/superpowers/specs/2026-04-17-hero-geological-globe-reference.html](../specs/2026-04-17-hero-geological-globe-reference.html)
**WebGPU skill:** `.claude/skills/webgpu-threejs-tsl/` — consult this for TSL syntax, node material patterns, and WebGPU renderer setup.

**Testing approach:** The project has no unit test infrastructure and this is a visual feature. Each task ends with a **visual verification checkpoint** — run `npm run dev`, open the page, confirm the observable outcome listed. Commit only after verification.

---

## File Structure

**New files:**
- `src/_includes/hero-globe.html` — HTML partial: inline SVG fallback + canvas container + import map + module script tag
- `src/assets/globe/hero-globe.js` — scene graph, renderer lifecycle, reveal animation loop, IntersectionObserver hookup
- `src/assets/globe/globe-material.js` — TSL material factory: colorNode composing base gradient, continent mask, plate lines, graticule, Ore dots
- `src/assets/globe/ore-points.js` — static data module exporting the 9 deposit lat/lon entries as a `Float32Array` suitable for uniform upload
- `src/assets/globe/atlas.png` — 2048×1024 equirectangular RGBA texture. R = continent mask, G = plate boundary mask, B = reserved, A = combined
- `scripts/build-globe-atlas.mjs` — Node script that generates `atlas.png` from Natural Earth land polygons + PB2002 plate boundaries. One-shot; output committed to the repo.

**Modified files:**
- `src/index.html` — hero section replaced with `{% include "hero-globe.html" %}` wrapping the existing copy
- `src/styles.css` — new `.hero`, `.hero-globe`, `.hero-content`, and mobile rules
- `.eleventy.js` — add `src/assets` to passthrough copy
- `src/_includes/head.html` — preconnect to the Three.js CDN for faster first paint

**Unchanged:**
- `src/_includes/scripts.html` — the existing `data-reveal` system continues to handle hero text fade-in
- All other pages, partials, and styles

---

## Task 1: Eleventy passthrough for assets

**Files:**
- Modify: `.eleventy.js`
- Create: `src/assets/globe/.gitkeep`

- [ ] **Step 1: Add passthrough for src/assets**

Edit `.eleventy.js` to add a passthrough entry alongside the existing ones:

```js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets");
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    }
  };
};
```

- [ ] **Step 2: Create the assets directory with a placeholder**

```bash
mkdir -p src/assets/globe
touch src/assets/globe/.gitkeep
```

- [ ] **Step 3: Verify passthrough works**

Run `npm run build`. Confirm `public/assets/globe/.gitkeep` exists.

```bash
npm run build
ls public/assets/globe/
```

Expected: `.gitkeep` present in output.

- [ ] **Step 4: Commit**

```bash
git add .eleventy.js src/assets/globe/.gitkeep
git commit -m "Add src/assets passthrough for globe assets"
```

---

## Task 2: Build the fallback SVG partial

**Files:**
- Create: `src/_includes/hero-globe.html`

This is the baseline that every visitor sees, even with JS disabled. It must match the locked visual reference exactly.

- [ ] **Step 1: Create the partial with the locked SVG inline**

The SVG below is the final rest-state of the globe, extracted from the locked reference and stripped of the brainstorm-companion chrome. Copy verbatim into `src/_includes/hero-globe.html`:

```html
<div class="hero-globe" aria-hidden="true">
  <svg class="hero-globe-svg" viewBox="0 0 440 440" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A geological globe centered on the Pacific Ring of Fire, with mineral deposit locations highlighted in gold.">
    <defs>
      <radialGradient id="globeFill" cx="42%" cy="36%">
        <stop offset="0%" stop-color="#FAF7F0"/>
        <stop offset="100%" stop-color="#E8E2D5"/>
      </radialGradient>
      <clipPath id="globeClip"><circle cx="220" cy="220" r="200"/></clipPath>
    </defs>
    <circle cx="220" cy="220" r="200" fill="url(#globeFill)"/>
    <g clip-path="url(#globeClip)">
      <g fill="#D8D2C4" opacity="0.75">
        <path d="M 140 95 Q 175 78 215 95 Q 235 115 240 150 L 235 180 Q 215 190 195 185 L 170 175 Q 150 160 142 135 Q 138 115 140 95 Z"/>
        <path d="M 210 195 Q 225 200 232 215 L 228 230 Q 218 228 212 220 Z"/>
        <path d="M 215 235 Q 240 238 250 270 Q 258 320 250 370 Q 235 390 220 375 Q 200 320 210 265 Q 212 245 215 235 Z"/>
        <path d="M 38 140 Q 68 125 98 150 Q 108 180 95 210 Q 70 215 48 195 Q 30 170 38 140 Z"/>
        <path d="M 75 250 Q 95 245 112 258 Q 115 275 100 282 Q 82 278 75 265 Z"/>
        <path d="M 75 300 Q 115 290 145 310 Q 142 340 110 345 Q 82 340 75 315 Z"/>
      </g>
      <g stroke="#C8C2B4" stroke-width="0.5" fill="none" opacity="0.6">
        <ellipse cx="220" cy="220" rx="200" ry="60"/>
        <ellipse cx="220" cy="220" rx="200" ry="140"/>
        <ellipse cx="220" cy="220" rx="80" ry="200"/>
        <ellipse cx="220" cy="220" rx="155" ry="200"/>
      </g>
      <g stroke="#5A5F63" stroke-width="1.4" fill="none" opacity="0.85" stroke-linecap="round">
        <path d="M 248 155 Q 258 220 262 305 T 268 400"/>
        <path d="M 118 72 Q 145 88 185 110 T 230 128"/>
        <path d="M 60 142 Q 88 180 96 230"/>
        <path d="M 108 260 Q 118 295 125 340"/>
        <path d="M 135 360 Q 148 385 158 410"/>
      </g>
      <g stroke="#5A5F63" stroke-width="0.8" opacity="0.55">
        <line x1="254" y1="180" x2="260" y2="177"/>
        <line x1="260" y1="235" x2="266" y2="232"/>
        <line x1="264" y1="290" x2="270" y2="287"/>
        <line x1="155" y1="92" x2="156" y2="86"/>
        <line x1="192" y1="112" x2="193" y2="106"/>
        <line x1="85" y1="185" x2="90" y2="182"/>
        <line x1="115" y1="290" x2="120" y2="287"/>
      </g>
      <g fill="#B8823A">
        <circle cx="252" cy="195" r="5"/>
        <circle cx="260" cy="260" r="4.5"/>
        <circle cx="265" cy="320" r="4"/>
        <circle cx="195" cy="160" r="4.5"/>
        <circle cx="175" cy="105" r="4"/>
        <circle cx="200" cy="170" r="3.5"/>
        <circle cx="88" cy="200" r="3.5"/>
        <circle cx="108" cy="275" r="3.2"/>
        <circle cx="112" cy="320" r="3.8"/>
      </g>
      <g fill="none" stroke="#B8823A" opacity="0.35">
        <circle cx="252" cy="195" r="8" stroke-width="0.8"/>
        <circle cx="195" cy="160" r="8" stroke-width="0.8"/>
      </g>
    </g>
    <circle cx="220" cy="220" r="200" fill="none" stroke="#1A101F" stroke-width="0.9" opacity="0.4"/>
  </svg>
  <canvas class="hero-globe-canvas" aria-hidden="true"></canvas>
</div>
```

- [ ] **Step 2: Verify it renders standalone**

Temporarily open `src/_includes/hero-globe.html` in a browser by including it in a test HTML file, or skip to Task 3 verification. The partial by itself is not routable.

- [ ] **Step 3: Commit**

```bash
git add src/_includes/hero-globe.html
git commit -m "Add hero-globe partial with locked SVG fallback"
```

---

## Task 3: Integrate the partial into index.html

**Files:**
- Modify: `src/index.html:7-16`

- [ ] **Step 1: Wrap the existing hero content**

Replace lines 7-16 in `src/index.html`:

```html
    <!-- HERO -->
    <section class="hero">
      {% include "hero-globe.html" %}
      <div class="hero-content">
        <div class="hero-label" data-reveal>Exploration Sites</div>
        <h1 class="hero-headline" data-reveal data-reveal-delay="1">Institutional-grade investor relations for exploration-stage companies.</h1>
        <p class="hero-body" data-reveal data-reveal-delay="2">We transform complex geology into institutional-grade narratives &mdash; maps, websites, presentations, and brand systems built specifically for the capital markets that fund discovery.</p>
        <div class="hero-buttons" data-reveal data-reveal-delay="3">
          <a href="contact.html" class="btn-primary">Start a project</a>
          <a href="pricing.html" class="btn-secondary">See pricing</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Visual verification**

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:8080/`. Expected:
- The SVG globe appears in the hero section (currently unstyled — will overlap text).
- The existing hero text (label, headline, body, buttons) still shows.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.html
git commit -m "Wire hero-globe partial into homepage hero"
```

---

## Task 4: CSS for offset-bleed composition

**Files:**
- Modify: `src/styles.css:504-543` (the existing `.hero`, `.hero-label`, `.hero-headline`, `.hero-body`, `.hero-buttons` block)

- [ ] **Step 1: Update the hero block**

Replace the current `.hero` rule (line 505-507) with:

```css
    .hero {
      padding: 100px 0 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 58%;
    }

    .hero-globe {
      position: absolute;
      top: -15%;
      right: -18%;
      width: 75%;
      height: 150%;
      z-index: 1;
      pointer-events: none;
    }

    .hero-globe::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to right,
        var(--body-bg, #F4F1EC) 0%,
        var(--body-bg, #F4F1EC) 38%,
        rgba(244, 241, 236, 0) 62%
      );
      pointer-events: none;
    }

    .hero-globe-svg,
    .hero-globe-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .hero-globe-canvas {
      opacity: 0;
      transition: opacity 200ms ease-out;
    }

    .hero-globe-canvas.is-active {
      opacity: 1;
    }

    .hero-globe-canvas.is-active ~ .hero-globe-svg,
    .hero-globe:has(.hero-globe-canvas.is-active) .hero-globe-svg {
      opacity: 0;
    }
```

Note: the gradient overlay sits *on top* of both SVG and canvas via `::after` on the `.hero-globe` wrapper — so the text fade-over-globe effect works regardless of which layer is visible. The `--body-bg` fallback variable should already exist in `:root` as `#F4F1EC`; if not, the literal color is a safe fallback.

- [ ] **Step 2: Add mobile rule (< 768px)**

At line ~1895 (near the existing `@media (max-width: 767px)` block with `.hero` padding), append:

```css
      .hero-content {
        max-width: 100%;
      }

      .hero-globe {
        top: auto;
        bottom: -20%;
        right: -30%;
        width: 120%;
        height: 80%;
        opacity: 0.35;
      }

      .hero-globe::after {
        background: linear-gradient(
          to bottom,
          var(--body-bg, #F4F1EC) 0%,
          var(--body-bg, #F4F1EC) 20%,
          rgba(244, 241, 236, 0) 55%
        );
      }
```

This pushes the globe below the text on mobile at reduced opacity so the CTAs remain the hero focus.

- [ ] **Step 3: Verify the existing `--body-bg` CSS variable**

Search `src/styles.css` for `--body-bg`. If absent, add to `:root` (near the top of the file):

```css
--body-bg: #F4F1EC;
```

- [ ] **Step 4: Visual verification**

Run `npm run dev` and reload the homepage. Expected:
- Globe bleeds off the right edge, taking roughly 75% of the hero width.
- Hero text sits on the left with the gradient softly fading the globe behind it.
- CTAs remain visible above the fold.
- Resize to 375px wide: globe shifts to the bottom-right, faded; CTAs remain primary focus.
- Compare side-by-side to the locked reference layout in `docs/superpowers/specs/2026-04-17-hero-geological-globe-reference.html` — the composition should match the "Offset bleed right" mockup from the brainstorm.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "Hero composition: offset-bleed-right layout with mobile adapt"
```

---

## Task 5: Generate the globe atlas texture

**Files:**
- Create: `scripts/build-globe-atlas.mjs`
- Create: `src/assets/globe/atlas.png` (generated output, committed)
- Modify: `package.json` (add `sharp` and `svg-to-png` approach — decided below)

The atlas is a 2048×1024 equirectangular RGBA PNG: R = continent mask, G = plate boundary mask. Authored from Natural Earth land polygons and the PB2002 plate boundary dataset.

For the first iteration we prioritize **fidelity to the locked SVG** over real-world precision — a simplified vector rendering in equirectangular projection is fine, because the globe is viewed from one angle (Pacific) and the rest of the world is out of frame during the reveal.

- [ ] **Step 1: Install sharp for PNG encoding and jsdom for SVG-to-canvas**

```bash
npm install --save-dev sharp @resvg/resvg-js
```

- [ ] **Step 2: Create the atlas builder script**

Create `scripts/build-globe-atlas.mjs`:

```js
// Generates src/assets/globe/atlas.png — 2048×1024 equirectangular RGBA.
// R = continent mask, G = plate boundary mask, A = combined.
// Source geometry authored directly as equirectangular SVG below.
// To refine: replace the SVG paths with higher-fidelity geometry from
// Natural Earth (land) and PB2002 (plate boundaries) later.

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const W = 2048;
const H = 1024;

// Equirectangular coordinate helper: lat/lon (degrees) → SVG (x, y) in the 2048×1024 plane.
// lon: -180..180 → x: 0..2048 ; lat: 90..-90 → y: 0..1024
function ll(lat, lon) {
  const x = ((lon + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return [x.toFixed(1), y.toFixed(1)].join(' ');
}

// Continent mask (R channel): simplified land polygons in equirectangular space.
// Geometry derived from public-domain Natural Earth 1:110m land data, hand-simplified for our paper-map aesthetic.
const CONTINENTS_PATH = `
M ${ll(70, -165)} L ${ll(55, -125)} L ${ll(48, -123)} L ${ll(32, -117)} L ${ll(23, -106)} L ${ll(8, -77)} L ${ll(-10, -79)} L ${ll(-35, -73)} L ${ll(-54, -70)} L ${ll(-55, -66)} L ${ll(-25, -48)} L ${ll(0, -50)} L ${ll(10, -62)} L ${ll(15, -87)} L ${ll(25, -82)} L ${ll(47, -60)} L ${ll(65, -62)} L ${ll(72, -80)} L ${ll(70, -140)} Z
M ${ll(45, 130)} L ${ll(35, 140)} L ${ll(30, 135)} L ${ll(33, 128)} L ${ll(40, 128)} Z
M ${ll(-10, 120)} L ${ll(-8, 140)} L ${ll(-20, 150)} L ${ll(-38, 146)} L ${ll(-35, 115)} L ${ll(-22, 114)} L ${ll(-12, 122)} Z
M ${ll(60, 160)} L ${ll(55, 165)} L ${ll(52, 158)} Z
`;

// Plate boundary mask (G channel): the five arcs from the locked SVG, placed as equirectangular polylines.
const PLATES_PATHS = [
  // Andean subduction (East Pacific margin)
  `M ${ll(10, -78)} Q ${ll(-5, -80)} ${ll(-20, -72)} T ${ll(-55, -72)}`,
  // Cascadia / Aleutian
  `M ${ll(60, -150)} Q ${ll(55, -135)} ${ll(50, -125)} T ${ll(40, -124)}`,
  // Kamchatka / Japan trench
  `M ${ll(55, 158)} Q ${ll(40, 145)} ${ll(32, 140)}`,
  // Philippine / Mariana
  `M ${ll(18, 122)} Q ${ll(10, 128)} ${ll(0, 135)}`,
  // Kermadec / Tonga
  `M ${ll(-15, -175)} Q ${ll(-25, -178)} ${ll(-35, 178)}`,
];

function makeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="black"/>
  <path d="${CONTINENTS_PATH}" fill="#ff0000"/>
  ${PLATES_PATHS.map(d => `<path d="${d}" stroke="#00ff00" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('\n  ')}
</svg>`;
}

async function main() {
  const svg = makeSvg();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const pngBuffer = resvg.render().asPng();

  // Run through sharp to force alpha from R+G (so transparent where both are 0)
  const processed = await sharp(pngBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = processed;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    if (info.channels === 4) {
      data[i + 3] = Math.max(r, g); // alpha
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png({ compressionLevel: 9 })
    .toFile('src/assets/globe/atlas.png');

  console.log('Wrote src/assets/globe/atlas.png (%d×%d)', W, H);
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Add build script to package.json**

Add under `"scripts"`:

```json
"build-atlas": "node scripts/build-globe-atlas.mjs"
```

- [ ] **Step 4: Run the builder**

```bash
npm run build-atlas
```

Expected output: `Wrote src/assets/globe/atlas.png (2048×1024)`. File appears at `src/assets/globe/atlas.png`.

- [ ] **Step 5: Visual spot-check the atlas**

Open `src/assets/globe/atlas.png` directly in an image viewer. Expected:
- Black background
- Red continent blobs roughly where the Americas, east Asia edge, Australia, and Kamchatka are (this is a crude equirectangular map — it will look stretched)
- Green curved lines tracing the five Ring-of-Fire plate boundaries

If the geometry looks wildly wrong (e.g., Americas in the wrong half), re-check the `ll()` helper: `lon: -180..180 → x: 0..2048`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-globe-atlas.mjs package.json package-lock.json src/assets/globe/atlas.png
git commit -m "Generate equirectangular atlas (continents R, plates G)"
```

---

## Task 6: Ore deposit data module

**Files:**
- Create: `src/assets/globe/ore-points.js`

- [ ] **Step 1: Write the module**

```js
// Ore deposit positions for the hero globe.
// Coordinates are lat/lon in degrees; rendered as shader-drawn circles.
// These are the 9 deposits from the locked spec: Andes (3), Great Basin (2),
// Canadian Shield (1), Japan (1), Philippines (1), Western Australia (1).

export const ORE_POINTS = [
  { name: 'Andean porphyry (N. Chile)',  lat: -23.5, lon:  -69.0, size: 1.00 },
  { name: 'Central Andes',                lat: -15.0, lon:  -72.0, size: 0.90 },
  { name: 'Southern Andes',               lat: -34.0, lon:  -70.0, size: 0.80 },
  { name: 'Carlin trend (NV)',            lat:  41.0, lon: -116.0, size: 0.90 },
  { name: 'Great Basin',                  lat:  39.0, lon: -117.0, size: 0.70 },
  { name: 'Yukon / Canadian Shield',      lat:  63.0, lon: -135.0, size: 0.80 },
  { name: 'Japan epithermal',             lat:  36.0, lon:  138.0, size: 0.70 },
  { name: 'Philippines / Indonesia',      lat:  10.0, lon:  124.0, size: 0.64 },
  { name: 'Kalgoorlie (W. Australia)',    lat: -30.7, lon:  121.5, size: 0.76 },
];

// Convert lat/lon (degrees) to a unit-sphere 3D position (Three.js Y-up).
// lat:  90 → +Y ; lat: -90 → -Y
// lon:   0 → +Z ; lon:  90 → +X ; lon: 180 → -Z ; lon: -90 → -X
export function latLonToVec3(lat, lon, radius = 1) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y:  radius * Math.cos(phi),
    z:  radius * Math.sin(phi) * Math.sin(theta),
  };
}

// Produce a Float32Array packed as [x0,y0,z0,size0, x1,y1,z1,size1, ...]
// suitable for uploading to a shader uniform array.
export function oreAsFloat32() {
  const out = new Float32Array(ORE_POINTS.length * 4);
  ORE_POINTS.forEach((p, i) => {
    const v = latLonToVec3(p.lat, p.lon, 1.001); // slight lift off surface
    out[i * 4 + 0] = v.x;
    out[i * 4 + 1] = v.y;
    out[i * 4 + 2] = v.z;
    out[i * 4 + 3] = p.size;
  });
  return out;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/globe/ore-points.js
git commit -m "Add ore deposit data with lat/lon→vec3 conversion"
```

---

## Task 7: Import map + CDN preconnect in head

**Files:**
- Modify: `src/_includes/head.html`

- [ ] **Step 1: Add the Three.js preconnect and import map**

Append to `src/_includes/head.html` (after line 19, the styles.css link):

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<script type="importmap">
{
  "imports": {
    "three":          "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
    "three/webgpu":   "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.webgpu.js",
    "three/tsl":      "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.tsl.js",
    "three/addons/":  "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/"
  }
}
</script>
```

**Why 0.171.0:** the WebGPU skill documents this as the minimum stable version for the TSL API we use. Newer versions (r178+) rename some nodes (`PI2` → `TWO_PI`, `transformedNormalWorld` → `normalWorld`). Pinning to r171 matches the skill's reference syntax verbatim.

- [ ] **Step 2: Visual verification**

Run `npm run dev`. Reload homepage. Open DevTools Network tab. Expected:
- No errors in console.
- No requests to jsdelivr yet (import map is declarative; it only activates when a module import fires).

- [ ] **Step 3: Commit**

```bash
git add src/_includes/head.html
git commit -m "Add Three.js r171 import map and CDN preconnect"
```

---

## Task 8: TSL globe material

**Files:**
- Create: `src/assets/globe/globe-material.js`

This builds the `MeshBasicNodeMaterial` with the full TSL `colorNode`. Shader logic follows the locked SVG: Quartz/Vellum base gradient, continent mask from atlas R, plate lines from atlas G, procedural graticule, shader-drawn Ore dots from a uniform array.

- [ ] **Step 1: Write the material factory**

```js
// TSL material for the hero globe surface.
// Visual recipe:
//   1. Base: radial Quartz→Vellum gradient
//   2. Continents: atlas.r mask filled with Vellum
//   3. Plate boundaries: atlas.g mask painted in Slate
//   4. Graticule: procedural lines at fixed lat/lon intervals
//   5. Ore dots: sampled from a 16×1 DataTexture of [x,y,z,size] vec4s,
//      drawn as angular-radius circles on the sphere, gated by uRevealProgress.

import * as THREE from 'three/webgpu';
import {
  Fn, float, vec2, vec3, color, uniform, texture, uv,
  smoothstep, mix, step, abs, normalize,
  positionLocal, normalLocal, dot, clamp, min,
} from 'three/tsl';

// Brand colors
const C_QUARTZ    = 0xFAF7F0;
const C_VELLUM    = 0xE8E2D5;
const C_CONTINENT = 0xD8D2C4;
const C_GRATICULE = 0xC8C2B4;
const C_SLATE     = 0x5A5F63;
const C_ORE       = 0xB8823A;

export const MAX_ORE_POINTS = 16;

export function createGlobeMaterial(atlasTexture, orePointsTexture, oreCount) {
  const material = new THREE.MeshBasicNodeMaterial();
  material.transparent = false;
  material.side = THREE.FrontSide;

  // Uniforms
  const uRevealProgress = uniform(float(0));       // 0..1 drives ore ignite sequence
  const uOreCount       = uniform(float(oreCount));

  const atlas = texture(atlasTexture, uv());

  // --- 1. Base gradient: light upper-left to darker lower-right ---
  const base = Fn(() => {
    const shade = clamp(normalLocal.x.mul(0.35).add(normalLocal.y.mul(0.45)).add(0.5), 0.0, 1.0);
    return mix(color(C_VELLUM), color(C_QUARTZ), shade);
  });

  // --- 2. Continents (atlas R) → Vellum fill ---
  const withContinents = Fn(() => {
    const continentMask = atlas.r;
    const softened = smoothstep(0.45, 0.55, continentMask);
    return mix(base(), color(C_CONTINENT), softened.mul(0.75));
  });

  // --- 3. Plate boundaries (atlas G) → Slate line ---
  const withPlates = Fn(() => {
    const plateMask = atlas.g;
    const line = smoothstep(0.35, 0.65, plateMask);
    return mix(withContinents(), color(C_SLATE), line.mul(0.85));
  });

  // --- 4. Graticule: four lines (two parallels, two meridians) ---
  const withGraticule = Fn(() => {
    const u = uv().x;
    const v = uv().y;
    const parallel1 = smoothstep(0.0, 0.003, abs(v.sub(0.30)));
    const parallel2 = smoothstep(0.0, 0.003, abs(v.sub(0.70)));
    const parallels = min(parallel1, parallel2);
    const meridian1 = smoothstep(0.0, 0.003, abs(u.sub(0.20)));
    const meridian2 = smoothstep(0.0, 0.003, abs(u.sub(0.70)));
    const meridians = min(meridian1, meridian2);
    const gridLine = float(1.0).sub(min(parallels, meridians));
    return mix(withPlates(), color(C_GRATICULE), gridLine.mul(0.6));
  });

  // --- 5. Ore dots: sampled from a 16×1 DataTexture ---
  // Each texel stores (x, y, z, size). We sample at centers of texels:
  // for index i out of N texels, sample at u = (i + 0.5) / N.
  // The loop is unrolled at shader-compile time up to MAX_ORE_POINTS.
  const withOre = Fn(() => {
    const fragDir = normalize(positionLocal);
    let oreMask = float(0);

    for (let i = 0; i < MAX_ORE_POINTS; i++) {
      const active = step(float(i + 0.5), uOreCount);

      // Sample ore texel i. Y coord = 0.5 since texture is 1 row high.
      const sampleU = float((i + 0.5) / MAX_ORE_POINTS);
      const texel = texture(orePointsTexture, vec2(sampleU, 0.5));
      const pointDir = vec3(texel.r, texel.g, texel.b);
      const size = texel.a;

      const angular = dot(fragDir, normalize(pointDir));
      const radius = size.mul(0.012);
      const inside = smoothstep(float(1.0).sub(radius), float(1.0).sub(radius.mul(0.5)), angular);

      const igniteAt = float(i).div(uOreCount);
      const igniteOpacity = smoothstep(igniteAt, igniteAt.add(0.08), uRevealProgress);

      oreMask = oreMask.add(inside.mul(active).mul(igniteOpacity));
    }

    oreMask = clamp(oreMask, 0.0, 1.0);
    return mix(withGraticule(), color(C_ORE), oreMask);
  });

  material.colorNode = withOre();

  // Expose uniform so hero-globe.js can animate it.
  material.userData.uRevealProgress = uRevealProgress;

  return material;
}
```

**TSL reference check:** Before running Task 9, skim `.claude/skills/webgpu-threejs-tsl/REFERENCE.md` to confirm the imports and function signatures above match r171 exactly. The skill is the authoritative source — if any TSL node name differs (e.g., `normalLocal` is called something else in r171), update the import and usage accordingly.

- [ ] **Step 2: Commit**

```bash
git add src/assets/globe/globe-material.js
git commit -m "TSL globe material: base + continents + plates + graticule + ore"
```

---

## Task 9: Scene setup + renderer lifecycle (no animation yet)

**Files:**
- Create: `src/assets/globe/hero-globe.js`

This task gets the canvas rendering a static globe. Animation comes in Task 10.

- [ ] **Step 1: Write the scene bootstrap**

```js
// Hero globe entry point. Initializes a WebGPU renderer with WebGL fallback,
// builds the single-sphere scene, and runs the reveal animation once before
// freezing.

import * as THREE from 'three/webgpu';
import { createGlobeMaterial } from './globe-material.js';
import { oreAsFloat32 } from './ore-points.js';

const CANVAS_SELECTOR = '.hero-globe-canvas';
const ATLAS_URL = '/assets/globe/atlas.png';

// Final-frame camera looks at the Pacific (lon ~180°, lat ~5°N).
// The sphere rotates into this orientation during reveal.
const FINAL_ROTATION_Y = Math.PI * 1.0;      // ≈ 180° — Pacific faces camera
const FINAL_ROTATION_X = -0.08;              // slight tilt toward northern hemisphere
const START_ROTATION_Y = FINAL_ROTATION_Y - 0.35;  // ~20° east of final
const START_ROTATION_X = FINAL_ROTATION_X - 0.12;

async function init() {
  const canvas = document.querySelector(CANVAS_SELECTOR);
  if (!canvas) return;

  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();

  // Renderer — WebGPU with automatic WebGL fallback.
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(rect.width, rect.height, false);

  try {
    await renderer.init();
  } catch (err) {
    console.warn('[hero-globe] WebGPU/WebGL init failed, falling back to SVG:', err);
    return;
  }

  // Scene + camera
  const scene = new THREE.Scene();
  const aspect = rect.width / rect.height;
  const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 10);
  camera.position.set(0, 0, 3.2);
  camera.lookAt(0, 0, 0);

  // Load atlas
  const atlasTexture = await new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(ATLAS_URL, resolve, undefined, reject);
  });
  atlasTexture.colorSpace = THREE.NoColorSpace;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;

  // Ore-points data texture (16×1 RGBA32F; unused slots are zeroed → shader masks them off)
  const ORE_MAX = 16;
  const orePacked = oreAsFloat32();
  const oreCount = orePacked.length / 4;
  const oreTextureData = new Float32Array(ORE_MAX * 4);
  oreTextureData.set(orePacked);
  const orePointsTexture = new THREE.DataTexture(
    oreTextureData, ORE_MAX, 1, THREE.RGBAFormat, THREE.FloatType
  );
  orePointsTexture.minFilter = THREE.NearestFilter;
  orePointsTexture.magFilter = THREE.NearestFilter;
  orePointsTexture.needsUpdate = true;

  // Sphere
  const geometry = new THREE.SphereGeometry(1, 64, 32);
  const material = createGlobeMaterial(atlasTexture, orePointsTexture, oreCount);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.rotation.set(FINAL_ROTATION_X, FINAL_ROTATION_Y, 0);
  scene.add(sphere);

  // Hand-off to animator (Task 10). For now, set final state and render once.
  material.userData.uRevealProgress.value = 1;
  await renderer.renderAsync(scene, camera);

  // Reveal the canvas over the SVG
  canvas.classList.add('is-active');

  // Resize handler — keeps the canvas matching its CSS box
  window.addEventListener('resize', () => {
    const r = parent.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.renderAsync(scene, camera);
  }, { passive: true });
}

// Fire once the main thread is free and the canvas exists.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: Wire the script into the partial**

Edit `src/_includes/hero-globe.html`, add before the closing `</div>`:

```html
<script type="module" src="/assets/globe/hero-globe.js"></script>
```

- [ ] **Step 3: Visual verification**

Run `npm run dev`. Reload homepage. Open DevTools Console and Network. Expected:
- `three.module.js`, `three.webgpu.js`, `three.tsl.js`, `atlas.png`, `hero-globe.js`, `globe-material.js`, `ore-points.js` all load with 200 status.
- No console errors.
- The canvas takes over from the SVG (fades in) showing a rotated sphere with:
  - Quartz/Vellum base gradient
  - Continents as Vellum fills
  - Plate boundary lines in Slate
  - Two parallel + two meridian graticule lines
  - Nine Ore dots visible in their final positions

If the sphere shows but geometry is misplaced: verify the atlas builder's `ll()` helper, and verify `latLonToVec3` rotation convention matches the sphere's default UV wrap.

- [ ] **Step 4: Commit**

```bash
git add src/assets/globe/hero-globe.js src/_includes/hero-globe.html
git commit -m "WebGPU scene: renderer, camera, textured sphere — static final frame"
```

---

## Task 10: Reveal animation (rotate + Ore ignite)

**Files:**
- Modify: `src/assets/globe/hero-globe.js`

- [ ] **Step 1: Replace the static render with an animated reveal**

Replace the bottom of `hero-globe.js` (from the line `material.userData.uRevealProgress.value = 1;` down to just before the resize handler) with:

```js
  // --- Reveal animation ---
  // Respect prefers-reduced-motion: skip animation, show final frame.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ROTATE_DURATION_MS = 2000;
  const IGNITE_DURATION_MS = 1500;
  const TOTAL_DURATION_MS = ROTATE_DURATION_MS + IGNITE_DURATION_MS;

  // Custom easing: cubic-bezier(0.22, 0.61, 0.36, 1) approximated via sampling.
  // For simplicity use an ease-out-cubic which is visually very close.
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function setFinalState() {
    sphere.rotation.x = FINAL_ROTATION_X;
    sphere.rotation.y = FINAL_ROTATION_Y;
    material.userData.uRevealProgress.value = 1;
  }

  if (prefersReduced) {
    setFinalState();
    await renderer.renderAsync(scene, camera);
    canvas.classList.add('is-active');
  } else {
    // Start state
    sphere.rotation.x = START_ROTATION_X;
    sphere.rotation.y = START_ROTATION_Y;
    material.userData.uRevealProgress.value = 0;

    // First paint in the start state so the canvas fade-in shows the starting globe
    await renderer.renderAsync(scene, camera);
    canvas.classList.add('is-active');

    const startTime = performance.now();
    let rafId;

    function frame(now) {
      const elapsed = now - startTime;

      // Rotation phase: 0 → ROTATE_DURATION_MS
      const rotateT = Math.min(elapsed / ROTATE_DURATION_MS, 1);
      const rotateEased = easeOutCubic(rotateT);
      sphere.rotation.x = START_ROTATION_X + (FINAL_ROTATION_X - START_ROTATION_X) * rotateEased;
      sphere.rotation.y = START_ROTATION_Y + (FINAL_ROTATION_Y - START_ROTATION_Y) * rotateEased;

      // Ignite phase: ROTATE_DURATION_MS → TOTAL_DURATION_MS
      const igniteElapsed = Math.max(0, elapsed - ROTATE_DURATION_MS);
      const igniteT = Math.min(igniteElapsed / IGNITE_DURATION_MS, 1);
      material.userData.uRevealProgress.value = igniteT;

      renderer.renderAsync(scene, camera);

      if (elapsed < TOTAL_DURATION_MS) {
        rafId = requestAnimationFrame(frame);
      } else {
        setFinalState();
        renderer.renderAsync(scene, camera);
        // Render loop stops here — globe is frozen.
      }
    }

    rafId = requestAnimationFrame(frame);
  }
```

- [ ] **Step 2: Visual verification**

Run `npm run dev`. Reload homepage. Expected:
- On load, the SVG shows briefly, then the canvas fades in with the globe rotated ~20° off-final.
- Over ~2 seconds the globe rotates into the Pacific-centered frame with ease-out motion.
- Over the next ~1.5 seconds, the nine Ore dots fade in roughly in sequence.
- After 3.5s total the globe is static — no more motion.
- Toggle `prefers-reduced-motion: reduce` in DevTools → Rendering tab. Reload. Expected: globe appears instantly in final state, no motion.

Timing check: the reveal must feel deliberate, not rushed. If 2s rotation feels too fast, adjust `ROTATE_DURATION_MS` to 2500.

- [ ] **Step 3: Commit**

```bash
git add src/assets/globe/hero-globe.js
git commit -m "Hero globe: rotate-then-ignite reveal with reduced-motion path"
```

---

## Task 11: Cross-browser + fallback verification

**Files:**
- None (verification only)

- [ ] **Step 1: Chrome/Edge (WebGPU)**

Run `npm run dev`, open in Chrome. DevTools Console: no errors. Network: confirm `three.webgpu.js` loads. Reveal plays at 60fps (check Performance tab — frame times under 16.7ms during reveal).

- [ ] **Step 2: Firefox (WebGL fallback)**

Open in Firefox. WebGPU is behind a flag by default, so Three.js's `WebGPURenderer` should fall back to WebGL internally. Expected: same visual output, same reveal, possibly slightly different anti-aliasing. If the canvas stays blank: check console for "WebGPU not available" and confirm the fallback kicked in. If renderer.init() throws, our catch falls through to the SVG — which is acceptable but not ideal; investigate.

- [ ] **Step 3: Safari (WebGL fallback or SVG)**

If Safari available: open and verify reveal plays with WebGL. Safari 17+ has WebGPU behind Technology Preview — most users will land on WebGL.

- [ ] **Step 4: No-JS fallback**

In Chrome DevTools → Settings → Debugger → Disable JavaScript. Reload. Expected: the SVG renders and stays (canvas is empty, no import map activation). The hero looks identical to the final frame of the reveal.

- [ ] **Step 5: Commit any adjustments**

If the verification surfaced tweaks (timing, easing, camera position), fix and commit:

```bash
git add -p
git commit -m "Hero globe: cross-browser polish"
```

Otherwise skip the commit.

---

## Task 12: Performance pass

**Files:**
- None initially (measurement); may modify `src/assets/globe/hero-globe.js`, `src/_includes/head.html` based on findings.

- [ ] **Step 1: Measure cold-cache load**

Chrome DevTools → Network → Disable cache. Reload. Record:
- Time to SVG visible (inline = should be < 100ms)
- Time to canvas active (`is-active` class applied)
- Total payload (should be < 400KB for the globe stack: Three.js ~180KB + atlas ~80-120KB + app code ~5KB)

- [ ] **Step 2: Measure reveal FPS**

DevTools → Performance → Record. Reload page. Stop after reveal completes. Confirm 60fps during the 3.5s reveal window on a mid-tier machine.

- [ ] **Step 3: If payload too large**

Options (pick based on findings):
- If Three.js is heavy: consider bundling just the used submodules (future work; out of scope for this plan).
- If atlas is heavy: drop resolution from 2048×1024 to 1024×512 and regenerate via `npm run build-atlas` with `W=1024; H=512` constants.

- [ ] **Step 4: Commit any adjustments**

```bash
git add -p
git commit -m "Hero globe: perf tuning"
```

---

## Task 13: Accessibility final check

**Files:**
- None (verification); possibly `src/_includes/hero-globe.html` for aria tweaks.

- [ ] **Step 1: Screen reader pass**

Enable VoiceOver/NVDA. Navigate to the homepage. Expected:
- The hero globe announces once via its `role="img"` / `aria-label` on the SVG.
- The canvas has `aria-hidden="true"` and is skipped.
- Focus order: skip link → nav → headline → body → primary CTA → secondary CTA. Globe is not in tab order.

- [ ] **Step 2: Keyboard**

Tab through the page. The globe must not be focusable and must not trap focus.

- [ ] **Step 3: Reduced motion**

Already verified in Task 10 — confirm once more the final frame renders instantly with `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Commit any a11y adjustments**

```bash
git add -p
git commit -m "Hero globe: a11y polish"
```

---

## Task 14: Final visual sign-off

**Files:**
- None.

- [ ] **Step 1: Side-by-side comparison**

Open the homepage in one window and `docs/superpowers/specs/2026-04-17-hero-geological-globe-reference.html` in another. Compare:
- Palette matches (Quartz base, Vellum continents, Slate plates, Ore dots)
- Globe feels "paper map" not "consumer earth"
- Composition: offset bleed right, text readable over gradient
- CTAs visible above the fold on a 1440×900 viewport

- [ ] **Step 2: Mobile test (375×812)**

Chrome DevTools device emulation → iPhone. Expected: text legible, CTAs above fold, globe subdued at the bottom-right at ~35% opacity. If globe competes with text at all, reduce opacity further or hide entirely (`display: none` on mobile).

- [ ] **Step 3: Final commit + push**

```bash
git status
git log --oneline -20
git push origin master
```

- [ ] **Step 4: Check the Vercel preview**

Confirm https://es-draft-1.vercel.app/ shows the new hero without regressions.

---

## Out-of-scope (explicitly not in this plan)

Per the spec's "Out of scope" list, the following are **not** to be added during this implementation:

- Interactivity (hover, click, parallax, drag)
- Multiple projects or project carousel
- Tooltips/labels on Ore dots
- Continuous rotation or "breathing" post-reveal
- Scroll-driven parallax
- Atmosphere/bloom post-processing
- Particles, orbits, lens flares
- Cloud layer, night lights, real-photo textures
- Audio

If during execution one of these feels tempting, stop and record it as future work. Don't scope-creep.

---

## Spec coverage check

Mapping each spec section to a task:

| Spec section                       | Task(s)                            |
|------------------------------------|------------------------------------|
| Visual design (palette, geometry)  | Task 2 (SVG), Task 5 (atlas), Task 8 (TSL material) |
| Composition (offset bleed right)   | Task 4                             |
| Behavior (single reveal, frozen)   | Task 10                            |
| Reveal choreography (rotate+ignite)| Task 10                            |
| Technical: Three.js r171 + TSL     | Task 7, Task 8, Task 9             |
| Fallback: WebGPU → WebGL → SVG     | Task 7 (import map), Task 9 (try/catch), Task 2 (SVG), Task 11 |
| prefers-reduced-motion             | Task 10                            |
| Data: ore-points.json              | Task 6                             |
| File structure                     | Task 1, and each creation task     |
| Accessibility                      | Task 2 (aria-label), Task 13       |
| Performance budget                 | Task 12                            |
| Integration with hero              | Task 3                             |
| Out of scope list                  | Noted in this plan                 |

Three open questions from the spec:
1. **Ore dot rendering:** resolved — shader-drawn circles from a uniform array (Task 8).
2. **Pacific framing lat/lon:** resolved — `FINAL_ROTATION_Y = π` and `FINAL_ROTATION_X = -0.08` (Task 9), adjustable in Task 14.
3. **Mobile behavior:** resolved — reposition below text at reduced opacity (Task 4), with escape hatch in Task 14 to hide if it competes.
