// Hero dotted globe — Three.js point cloud driven by a real-world land mask.
//
// The mask (src/assets/world-mask.png) is Natural Earth 1:110m land data
// rasterized to 2048×1024 equirectangular black/white. We generate a
// Fibonacci sphere of candidate points, sample the mask at each point's
// lat/lon, and keep only those that fall on land. The result is real
// continent geometry as ~18k evenly-distributed 2px dots.
//
// Design: Vellum dots at 50% opacity, slow Y rotation, no lighting, no glow.

import * as THREE from 'three';

const CANVAS_SELECTOR = '.hero-globe-canvas';
const MASK_URL = '/assets/world-mask.png';

// How many sphere points to try — final count is about 30% (the global land fraction).
const N_CANDIDATES = 60000;

// Visual
const DOT_COLOR   = 0xE8E2D5;   // Vellum
const DOT_OPACITY = 0.5;
const DOT_SIZE_PX = 2;          // true pixel size (no perspective attenuation)

// Orientation — tilt slightly so the poles aren't on axis
const INITIAL_TILT_X = -0.18;   // radians (≈ -10°)
const INITIAL_ROT_Y  = 0.8;     // radians — starts showing Americas/Europe

// Rotation speed (radians per millisecond → ~50s per revolution)
const ROT_SPEED_Y = 0.00012;

async function loadMask(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  return { data, w, h };
}

function isLand(mask, lat, lon) {
  let u = ((lon + 180) / 360) % 1;
  if (u < 0) u += 1;
  const v = (90 - lat) / 180;
  const x = Math.min(mask.w - 1, Math.max(0, Math.floor(u * mask.w)));
  const y = Math.min(mask.h - 1, Math.max(0, Math.floor(v * mask.h)));
  const i = (y * mask.w + x) * 4;
  return mask.data[i] > 128;
}

// Golden-ratio (Fibonacci) sphere — uniform distribution, no pole clustering.
function fibonacciPoints(n) {
  const pts = [];
  const goldenAngle = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    pts.push([x, y, z]);
  }
  return pts;
}

async function init() {
  const canvas = document.querySelector(CANVAS_SELECTOR);
  if (!canvas) return;

  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const dpr = Math.min(window.devicePixelRatio, 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10);
  camera.position.set(0, 0, 3.4);
  camera.lookAt(0, 0, 0);

  // Load world mask and build the point cloud
  let mask;
  try {
    mask = await loadMask(MASK_URL);
  } catch (err) {
    console.warn('[hero-globe] mask load failed:', err);
    return;
  }

  const candidates = fibonacciPoints(N_CANDIDATES);
  const positions = [];
  for (const [x, y, z] of candidates) {
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = Math.atan2(z, x) * 180 / Math.PI;
    if (isLand(mask, lat, lon)) {
      positions.push(x, y, z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: DOT_COLOR,
    size: DOT_SIZE_PX * dpr,     // pixel-sized when sizeAttenuation=false
    sizeAttenuation: false,
    transparent: true,
    opacity: DOT_OPACITY,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.rotation.x = INITIAL_TILT_X;
  points.rotation.y = INITIAL_ROT_Y;
  scene.add(points);

  // Render loop — continuous slow rotation
  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    points.rotation.y += ROT_SPEED_Y * dt;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Fade canvas in after first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => canvas.classList.add('is-active'));
  });

  // Resize: preserve square aspect and update renderer
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const r = parent.getBoundingClientRect();
      const s = Math.min(r.width, r.height);
      renderer.setSize(s, s, false);
    }, 150);
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
