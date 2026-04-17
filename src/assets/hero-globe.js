// Minimal dotted globe — Vellum dots at 50% canvas opacity.
// Single cobe instance. No markers, no glow, no shadow.

import createGlobe from 'cobe';

const QUARTZ = [0.957, 0.945, 0.925];   // #F4F1EC — page bg (invisible glow)
const VELLUM = [0.910, 0.886, 0.835];   // #E8E2D5 — dot color

const PHI_SPEED = 0.0018;

function init() {
  const canvas = document.querySelector('.hero-globe-canvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';

  let phi = 0.5;

  // Render at much higher resolution than display so each Fibonacci dot
  // occupies fewer CSS pixels.
  const RENDER_MULTIPLIER = 4;
  createGlobe(canvas, {
    devicePixelRatio: 2,
    width: size * RENDER_MULTIPLIER,
    height: size * RENDER_MULTIPLIER,
    phi,
    theta: 0.32,                // tilt hides north-pole Fibonacci convergence
    dark: 0,
    diffuse: 0,
    glowColor: QUARTZ,
    opacity: 1,
    scale: 1.22,                // 20% zoom
    offset: [0, 0],
    baseColor: VELLUM,
    markerColor: VELLUM,
    mapSamples: 128000,
    mapBrightness: 2.2,         // softer continent dots — same visual weight as ocean
    mapBaseBrightness: 0.9,     // ocean nearly as bright as continents
    markers: [],
    onRender: (state) => {
      state.phi = phi;
      phi += PHI_SPEED;
    },
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => canvas.classList.add('is-active'));
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const r = parent.getBoundingClientRect();
      const s = Math.min(r.width, r.height);
      canvas.style.width = s + 'px';
      canvas.style.height = s + 'px';
    }, 150);
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
