# Hero Section — Geological Globe Design

**Date:** 2026-04-17
**Project:** Exploration Sites website rebuild
**Location:** `src/index.html` hero section
**Status:** Design locked — ready for implementation plan

---

## Goal

Replace the current text-only hero with a distinctive, sector-native visual anchor: a geological Earth centered on the Pacific Ring of Fire, with plate boundaries visible and mineral deposits marked in the brand's Ore accent. The visual should read as an archival geological survey plate rendered in real-time, not a consumer "earth globe."

The globe is an **ES brand asset** — no client-specific project polygons. It communicates "we understand how the Earth makes metal," positioning ES as geologically literate rather than generic IR.

## What it is (visual design — locked)

**Subject:** The Earth as seen from above the Pacific Ocean, showing the full Ring of Fire subduction arc (Andes → Cascades → Aleutians → Japan → Indonesia → Kermadec).

**Palette (brand-exact):**
- **Base sphere:** Quartz `#F4F1EC` → Vellum `#E8E2D5` radial gradient (top-left light)
- **Continents:** Vellum `#D8D2C4` at 75% opacity
- **Graticule:** Graticule `#C8C2B4` at 60% opacity — four lines only (two parallels, two meridians). Just enough to read as spherical.
- **Plate boundaries:** Slate `#5A5F63`, single stroke, with faint Slate tick marks indicating subduction direction (archival survey convention)
- **Mineral deposits:** Ore `#B8823A` — the only color. ~9 pulse points marking Andes, Great Basin/Carlin, Canadian Shield, Japan/Philippines epithermal, Western Australia. Two largest deposits get a faint static pulse ring.
- **Edge:** Graphite `#1A101F` at 40% opacity, 1px stroke

**Reference implementation:** the SVG in `docs/superpowers/specs/2026-04-17-hero-geological-globe-reference.html` defines geometry and color intent (committed alongside this spec). The Three.js/TSL implementation should match this rest state exactly.

## Where it sits (composition — locked)

**Layout:** Offset bleed right.

- Globe positioned absolute, top `-15%`, right `-18%`, width `75%` of hero section, height `150%` of hero section (extends off the right and top edges)
- Quartz-to-transparent gradient overlay from left (100% opacity at 38% across) to right (0% at 62% across) fades the globe behind the text on the left
- Hero text (label, headline, body, buttons) stays in existing left-aligned hierarchy with `max-width: 58%` on desktop
- Globe is cosmetic — behind the content, does not block CTAs

**Responsive behavior (mobile < 768px):**
- Globe moves to below-text position, centered, scaled to fit
- OR: globe hidden entirely, hero falls back to current text-only layout
- Final call during implementation based on mobile visual test

## What it does (behavior — locked)

**Single opening reveal, then static.**

**Reveal choreography (Option D — combo):**
1. **0.0s:** Page loads. Hero text already positioned but hidden (opacity 0).
2. **0.0s → 2.0s:** Globe rotates gently from a default orientation (~20° east of final) into the Pacific-centered frame. Easing: custom cubic-bezier(0.22, 0.61, 0.36, 1) — slow-out, no overshoot. Continents, plate boundaries, and graticule fade in during the rotation.
3. **2.0s → 3.5s:** Globe settles. Ore deposit dots "ignite" in sequence — one every ~150ms, starting from the largest Andean porphyry and spreading outward. Each dot fades in with a single 300ms opacity+scale pulse (0 → 1.3x → 1.0x).
4. **1.2s (during globe reveal):** Hero text begins staggered fade-in over the existing `data-reveal` animation system already present in `src/_includes/scripts.html`.
5. **3.5s onward:** Globe is **frozen**. No rotation, no breathing, no continuous render loop. The renderer pauses after the final frame.

**Total runtime:** 3.5 seconds.

**After reveal:** No interactivity, no parallax, no scroll response, no hover effects. Pure static.

## Technical approach

**Primary:** Three.js r171+ with WebGPU renderer and TSL shaders. Authoritative reference: `.claude/skills/webgpu-threejs-tsl/` (installed in this project).

**Scene graph:**
- Perspective camera, fixed position matching the composition crop
- Single sphere mesh (Three.js SphereGeometry, 64×32 segments)
- `MeshBasicNodeMaterial` — this is a non-lit shader surface; lighting is baked into the color math
- Custom TSL `colorNode` combining:
  - Base Quartz/Vellum radial gradient (computed from sphere normal)
  - Procedural continent mask (from a low-res texture atlas, `public/assets/globe/continents.png`, see Data section)
  - Procedural plate-boundary line (from `public/assets/globe/plates.png` as an alpha mask with anti-aliased lines)
  - Graticule lines (computed procedurally from UV coordinates, not textured)
  - Ore deposit dots (from `public/assets/globe/ore-points.json` — lat/lon → UV → rendered as instanced sprite quads or shader-drawn circles; final approach decided during implementation)

**Animation:** JavaScript-driven camera rotation (no shader uniforms for the reveal — simpler). Ore dot sequence uses a single `uRevealProgress` uniform driving the TSL reveal mask (dots appear as progress crosses each dot's threshold).

**Lifecycle:**
- Init: lazy — only call `renderer.init()` and start render loop after the hero enters the viewport via IntersectionObserver (which is immediate on page load since hero is above the fold, but this keeps mobile/tablet rotate-to-landscape clean)
- Render: `requestAnimationFrame` loop from init to the end of the reveal (~3.5s), then `cancelAnimationFrame` and leave the last frame on the canvas
- Dispose: on page navigation (Eleventy static site — this happens on actual browser nav, not critical)

## Fallback strategy (progressive enhancement — locked)

1. **Feature detect:** `if (navigator.gpu) → try WebGPU renderer`
2. **Primary fallback:** `WebGLRenderer` with the same scene. Three.js WebGPURenderer falls back to WebGL internally if init fails; we accept that path.
3. **Secondary fallback (no WebGL, no WebGPU, or JS disabled):** Static SVG of the globe's final state embedded inline in the hero HTML. Identical composition, no motion. This SVG is a progressive-enhancement base layer — it renders immediately, and the canvas overlays on top once the renderer initializes.
4. **`prefers-reduced-motion: reduce`:** Skip the animation entirely. Render the final frame directly (equivalent to setting `uRevealProgress = 1` and camera in final position). The frozen frame is the whole experience.

**Implication:** the static SVG version must be visually correct on its own, because it's both the baseline and the reduced-motion state.

## Data

**Plate boundaries** — simplified curves tracing the Pacific Ring of Fire. Source: `docs/superpowers/specs/2026-04-17-hero-geological-globe-design.md` references the locked SVG for geometry. For WebGPU implementation, plate boundaries become either:
- Option A: a 1024×512 equirectangular alpha mask texture (`plates.png`), blurred slightly for anti-aliasing
- Option B: line geometry (`THREE.Line` with `LineBasicNodeMaterial`) positioned on the sphere surface via lat/lon conversion

Implementation plan will pick one based on shader complexity cost. Preference: **Option A** (simpler, matches the "baked survey plate" aesthetic).

**Continent shapes** — equirectangular alpha mask (`continents.png`) derived from Natural Earth 1:110m simplified coastlines. Rendered as Vellum fill where the mask is opaque.

**Ore deposit points** — hand-authored JSON:
```json
[
  { "name": "Andean porphyry (N. Chile)", "lat": -23.5, "lon": -69.0, "radius": 5 },
  { "name": "Central Andes", "lat": -15.0, "lon": -72.0, "radius": 4.5 },
  { "name": "Southern Andes", "lat": -34.0, "lon": -70.0, "radius": 4 },
  { "name": "Carlin trend (NV)", "lat": 41.0, "lon": -116.0, "radius": 4.5 },
  { "name": "Great Basin", "lat": 39.0, "lon": -117.0, "radius": 3.5 },
  { "name": "Yukon / Canadian Shield", "lat": 63.0, "lon": -135.0, "radius": 4 },
  { "name": "Japan epithermal", "lat": 36.0, "lon": 138.0, "radius": 3.5 },
  { "name": "Philippines / Indonesia", "lat": 10.0, "lon": 124.0, "radius": 3.2 },
  { "name": "Western Australia (Kalgoorlie)", "lat": -30.7, "lon": 121.5, "radius": 3.8 }
]
```
Names are internal (non-rendered) documentation for future edits. No client IP, no tooltips in this version.

## File structure

```
src/
  _includes/
    hero-globe.html            # New: includes the <canvas> and inline SVG fallback
  index.html                    # Modified: hero section uses {% include hero-globe.html %}
  assets/
    globe/
      hero-globe.js             # New: Three.js/TSL scene setup, init, reveal loop
      globe-material.js         # New: TSL colorNode definition
      ore-points.json           # New: deposit data
      continents.png            # New: 1024×512 alpha mask (~50-100KB PNG)
      plates.png                # New: 1024×512 alpha mask (~30-50KB PNG)
public/
  assets/globe/                 # Generated output — do NOT hand-edit
```

The inline SVG fallback lives directly inside `src/_includes/hero-globe.html` so it renders immediately on page load with no additional HTTP request.

## Accessibility

- Canvas has `role="img"` and `aria-label="A geological globe showing the Pacific Ring of Fire with mineral deposit locations highlighted in gold."`
- `prefers-reduced-motion: reduce` → skip animation entirely, show final frame
- Globe is purely decorative relative to the hero's CTA; no keyboard interaction required
- Focus order unchanged (label → headline → body → CTAs). The canvas is not focusable.

## Performance budget

- Initial JS payload: Three.js r171+ core + `three/webgpu` + `three/tsl` + ~300 lines of app code. Target: < 180KB gzipped for the globe bundle, loaded with `defer` so it doesn't block first paint.
- Textures: `continents.png` + `plates.png` combined < 150KB
- First Contentful Paint: must not regress — inline SVG renders before the canvas code parses.
- Render budget: 60fps during the 3.5s reveal on a mid-tier laptop GPU. After reveal: 0 fps (no render loop).
- Canvas resolution: `devicePixelRatio` capped at 2 to avoid 4K+ waste.

## Integration with existing hero

Current hero markup (`src/index.html:7-16`):
```html
<section class="hero">
  <div class="hero-label" data-reveal>Exploration Sites</div>
  <h1 class="hero-headline" data-reveal data-reveal-delay="1">…</h1>
  <p class="hero-body" data-reveal data-reveal-delay="2">…</p>
  <div class="hero-buttons" data-reveal data-reveal-delay="3">…</div>
</section>
```

Post-change:
```html
<section class="hero">
  {% include hero-globe.html %}
  <div class="hero-content">
    <div class="hero-label" data-reveal>Exploration Sites</div>
    <h1 class="hero-headline" data-reveal data-reveal-delay="1">…</h1>
    <p class="hero-body" data-reveal data-reveal-delay="2">…</p>
    <div class="hero-buttons" data-reveal data-reveal-delay="3">…</div>
  </div>
</section>
```

CSS updates in `src/styles.css`:
- `.hero` → `position: relative; overflow: hidden;`
- New `.hero-globe` wrapper with absolute positioning + gradient overlay
- New `.hero-content` wrapper with `position: relative; z-index: 2; max-width: 58%` on desktop, full-width on mobile
- Breakpoint behavior defined in the implementation plan based on actual mobile test

No changes required to: `src/_includes/head.html`, `src/_includes/nav.html`, `src/_includes/footer.html`, `src/_includes/scripts.html` (reveal system continues to work).

## Out of scope (explicitly NOT building)

To prevent scope creep and protect the brand restraint:

- ❌ Interactivity (no hover, no click, no drag, no parallax)
- ❌ Multiple projects or carousel of projects
- ❌ Tooltips or labels on Ore dots
- ❌ Continuous rotation or "breathing" after reveal
- ❌ Scroll-driven parallax or scroll-linked animation
- ❌ Atmosphere glow beyond the subtle outer Ore ring already in the SVG
- ❌ Particle effects, orbits, satellites, lens flares
- ❌ Post-processing effects (bloom, DOF, etc.)
- ❌ Night-side lights, clouds, real-photo textures
- ❌ Audio

These will feel tempting once the WebGPU skill is loaded. The brand rule says no.

## Success criteria

1. Hero loads within 100ms on a cold cache on desktop Chrome; inline SVG visible immediately, canvas takes over once `renderer.init()` resolves.
2. Reveal plays at a solid 60fps on a 2022-era MacBook Pro and a mid-tier Windows laptop.
3. Safari and Firefox users see the WebGL fallback with identical composition and choreography.
4. Reduced-motion users see the locked static frame with no motion.
5. The globe "reads" — a geologist recognizes the Ring of Fire and the Carlin trend dot as the Carlin trend.
6. The globe does not visually overpower the text. Reading order: label → headline → body → CTA, with the globe as a quiet stage behind them.

## Open questions for implementation plan

1. **Ore dot rendering:** shader-drawn circles (cheapest) vs. instanced sprite meshes (more flexible for future pulse animation, if we ever want it). Pick during plan — the spec is silent.
2. **Pacific framing lat/lon:** the exact camera look-at point. Proposed: center on 0°N, 180°E (dateline). Final frame may adjust ±10° based on visual balance with the text overlay.
3. **Mobile behavior:** hide globe vs. reposition below text. Final call after mobile prototype.

## Next step

Invoke `superpowers:writing-plans` to produce a step-by-step implementation plan referencing the `webgpu-threejs-tsl` skill.
