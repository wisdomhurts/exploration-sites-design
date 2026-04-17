// Hero dotted globe — Three.js point cloud driven by a real-world land mask.
//
// Fibonacci sphere candidates are split into two buckets: continents (sampled
// from the Natural Earth 1:110m land mask) and ocean (everything else).
// Each bucket renders as its own Points mesh so they can carry different
// colors while sharing rotation via a parent Group.

import * as THREE from 'three';
import { CLIENT_PROJECTS } from './client-projects.js';

const CANVAS_SELECTOR = '.hero-globe-canvas';
const MASK_URL = '/assets/world-mask.png';

// Total candidates. ~30% become continent dots, ~70% ocean dots.
const N_CANDIDATES = 60000;

// Visual
const CONTINENT_COLOR = 0x5A5F63;   // Slate
const OCEAN_COLOR     = 0xC8C2B4;   // Graticule
const PROJECT_COLOR   = 0x5A5F63;   // Slate — client projects (same hue, bigger/round)
const FILL_COLOR      = 0xF4F1EC;   // Quartz — solid sphere behind dots (occludes back side)
const DOT_SIZE_PX     = 1;          // continent/ocean pixel size
const PROJECT_SIZE_PX = 5;          // client projects, 5× base size, rendered as circles

// Orientation
const INITIAL_TILT_X = -0.18;
const INITIAL_ROT_Y  = 0.8;

// Rotation speed (radians per millisecond → ~50s per revolution)
const ROT_SPEED_Y = 0.00012;

// Mouse repulsion
const MOUSE_RADIUS   = 0.35;        // influence radius in sphere-local units
const MOUSE_STRENGTH = 0.28;        // how far points displace at peak
const MOUSE_LERP     = 0.30;        // per-frame smoothing for position + strength

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

// Shared uniforms driven from the host — every Points material reads the same
// mouse position and strength so the three layers repel together.
const sharedUniforms = {
  uMouse:    { value: new THREE.Vector3(0, 0, 0) },
  uStrength: { value: 0 },
  uRadius:   { value: MOUSE_RADIUS },
};

function makePoints(positions, color, dpr, sizePx = DOT_SIZE_PX, circular = false) {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: sizePx * dpr,
    sizeAttenuation: false,
    transparent: circular,         // circular dots need alpha for the discarded corners
    alphaTest: circular ? 0.5 : 0,
  });
  // Inject mouse-repulsion into the built-in points vertex shader, and
  // (for circular points) clip the square sprite corners to a disc.
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uMouse    = sharedUniforms.uMouse;
    shader.uniforms.uStrength = sharedUniforms.uStrength;
    shader.uniforms.uRadius   = sharedUniforms.uRadius;
    shader.vertexShader =
      'uniform vec3 uMouse;\nuniform float uStrength;\nuniform float uRadius;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `vec3 transformed = position;
         vec3 diff = transformed - uMouse;
         float d = length(diff);
         float fall = exp(-(d * d) / (uRadius * uRadius));
         vec3 tangent = d > 0.0001 ? diff / d : vec3(0.0);
         vec3 outward = normalize(transformed);
         transformed += (tangent * 0.65 + outward * 0.35) * fall * uStrength;`
      );
    if (circular) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
         if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;`
      );
    }
  };
  return new THREE.Points(geom, mat);
}

// Convert lat/lon (degrees) to a unit-sphere xyz matching our candidate points.
// Inverse of: lat = asin(y); lon = atan2(z, x) * 180/π
function latLonToXYZ(lat, lon, radius = 1.002) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  const r = radius * Math.sin(phi);
  return [r * Math.cos(theta), radius * Math.cos(phi), r * Math.sin(theta)];
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

  // Client project markers — Ore-colored highlights at each lat/lon
  const projectPos = [];
  for (const p of CLIENT_PROJECTS) {
    const [px, py, pz] = latLonToXYZ(p.lat, p.lon);
    projectPos.push(px, py, pz);
  }

  const group = new THREE.Group();
  group.add(fillSphere);
  group.add(makePoints(oceanPos, OCEAN_COLOR, dpr));
  group.add(makePoints(landPos, CONTINENT_COLOR, dpr));
  group.add(makePoints(projectPos, PROJECT_COLOR, dpr, PROJECT_SIZE_PX, true));
  group.rotation.x = INITIAL_TILT_X;
  group.rotation.y = INITIAL_ROT_Y;
  scene.add(group);

  // --- Mouse repulsion ---
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
  const hitPoint = new THREE.Vector3();
  const invGroupMatrix = new THREE.Matrix4();
  const targetMouseLocal = new THREE.Vector3();
  let targetStrength = 0;
  let mouseOverGlobe = false;

  function onPointer(e) {
    const r = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (Math.abs(mouseNDC.x) > 1 || Math.abs(mouseNDC.y) > 1) {
      mouseOverGlobe = false;
      return;
    }
    raycaster.setFromCamera(mouseNDC, camera);
    if (raycaster.ray.intersectSphere(hitSphere, hitPoint)) {
      group.updateMatrixWorld();
      invGroupMatrix.copy(group.matrixWorld).invert();
      targetMouseLocal.copy(hitPoint).applyMatrix4(invGroupMatrix);
      mouseOverGlobe = true;
    } else {
      mouseOverGlobe = false;
    }
  }
  canvas.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('pointerleave', () => { mouseOverGlobe = false; }, { passive: true });

  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    group.rotation.y += ROT_SPEED_Y * dt;

    // Lerp strength toward target; lerp mouse position toward target
    targetStrength = mouseOverGlobe ? MOUSE_STRENGTH : 0;
    sharedUniforms.uStrength.value += (targetStrength - sharedUniforms.uStrength.value) * MOUSE_LERP;
    sharedUniforms.uMouse.value.lerp(targetMouseLocal, MOUSE_LERP);

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
