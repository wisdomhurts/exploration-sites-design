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

  createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio, 2),
    width: size * 2,
    height: size * 2,
    phi,
    theta: 0.18,
    dark: 0,
    diffuse: 0,
    glowColor: QUARTZ,
    opacity: 1,
    scale: 1.02,
    offset: [0, 0],
    baseColor: VELLUM,
    markerColor: VELLUM,
    mapSamples: 64000,
    mapBrightness: 5,
    mapBaseBrightness: 0.08,
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
