// Hero dotted globe — Three.js point cloud driven by a real-world land mask.
//
// Fibonacci sphere candidates are split into two buckets: continents (sampled
// from the Natural Earth 1:110m land mask) and ocean (everything else).
// Each bucket renders as its own Points mesh so they can carry different
// colors while sharing rotation via a parent Group.

import * as THREE from 'three';

const CANVAS_SELECTOR = '.hero-globe-canvas';
const MASK_URL = '/assets/world-mask.png';

// Total candidates. ~30% become continent dots, ~70% ocean dots.
const N_CANDIDATES = 60000;

// Visual
const CONTINENT_COLOR = 0x5A5F63;   // Slate
const OCEAN_COLOR     = 0xC8C2B4;   // Graticule
const FILL_COLOR      = 0xF4F1EC;   // Quartz — solid sphere behind dots (occludes back side)
const DOT_SIZE_PX     = 1;          // true pixel size (no perspective attenuation)

// Orientation
const INITIAL_TILT_X = -0.18;
const INITIAL_ROT_Y  = 0.8;

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

function fibonacciPoints(n) {
  const pts = [];
  const goldenAngle = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}

function makePoints(positions, color, dpr) {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: DOT_SIZE_PX * dpr,
    sizeAttenuation: false,
    transparent: false,
  });
  return new THREE.Points(geom, mat);
}

async function init() {
  const canvas = document.querySelector(CANVAS_SELECTOR);
  if (!canvas) return;

  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const dpr = Math.min(window.devicePixelRatio, 2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  // Camera pulled back + narrower FOV so the full sphere fits with margin.
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 10);
  camera.position.set(0, 0, 4.6);
  camera.lookAt(0, 0, 0);

  let mask;
  try {
    mask = await loadMask(MASK_URL);
  } catch (err) {
    console.warn('[hero-globe] mask load failed:', err);
    return;
  }

  const candidates = fibonacciPoints(N_CANDIDATES);
  const landPos = [];
  const oceanPos = [];
  for (const [x, y, z] of candidates) {
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = Math.atan2(z, x) * 180 / Math.PI;
    if (isLand(mask, lat, lon)) {
      landPos.push(x, y, z);
    } else {
      oceanPos.push(x, y, z);
    }
  }

  // Solid fill sphere — sits just inside the dot radius so front dots still
  // show but back-side dots are occluded.
  const fillSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.99, 64, 48),
    new THREE.MeshBasicMaterial({ color: FILL_COLOR })
  );

  const group = new THREE.Group();
  group.add(fillSphere);
  group.add(makePoints(oceanPos, OCEAN_COLOR, dpr));
  group.add(makePoints(landPos, CONTINENT_COLOR, dpr));
  group.rotation.x = INITIAL_TILT_X;
  group.rotation.y = INITIAL_ROT_Y;
  scene.add(group);

  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    group.rotation.y += ROT_SPEED_Y * dt;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => canvas.classList.add('is-active'));
  });

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
