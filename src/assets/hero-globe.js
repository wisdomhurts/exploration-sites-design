// Hero dotted globe — Three.js point cloud driven by a real-world land mask.
// Continents (Slate) and ocean (Graticule) come from a Fibonacci sphere
// filtered by the Natural Earth 1:110m mask. One highlight marker sits on
// Victoria, BC. OrbitControls handle drag-to-rotate + wheel zoom, with idle
// auto-rotate. On hover (no drag), all points repel away from the cursor
// with a smooth Gaussian falloff.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CANVAS_SELECTOR = '.hero-globe-canvas';
const MASK_URL = '/assets/world-mask.png';

const N_CANDIDATES = 60000;

// Visual
const CONTINENT_COLOR = 0x5A5F63;   // Slate
const OCEAN_COLOR     = 0xC8C2B4;   // Graticule
const PROJECT_COLOR   = 0x2C3338;   // Basalt
const FILL_COLOR      = 0xF4F1EC;   // Quartz
const DOT_SIZE_PX     = 1;
const PROJECT_SIZE_PX = 3;

// Victoria, BC — Exploration Sites HQ
const VICTORIA = { lat: 48.4284, lon: -123.3656 };

// Orientation
const INITIAL_TILT_X = -0.18;
const INITIAL_ROT_Y  = 0.8;

// Camera
const CAMERA_FOV     = 26;
const CAMERA_Z       = 4.6;
const MIN_DISTANCE   = 2.2;
const MAX_DISTANCE   = 8.0;

// Auto-rotate (~50s per revolution)
const AUTO_ROTATE_SPEED = 1.2;

// Mouse repulsion
const MOUSE_RADIUS   = 0.35;
const MOUSE_STRENGTH = 0.28;
const MOUSE_LERP     = 0.30;

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

function latLonToXYZ(lat, lon, radius = 1.002) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  const r = radius * Math.sin(phi);
  return [r * Math.cos(theta), radius * Math.cos(phi), r * Math.sin(theta)];
}

// Shared uniforms so all three Points meshes repel together in lockstep.
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
    transparent: circular,
    alphaTest: circular ? 0.5 : 0,
  });
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
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);
  camera.position.set(0, 0, CAMERA_Z);

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

  const fillSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.99, 64, 48),
    new THREE.MeshBasicMaterial({ color: FILL_COLOR })
  );

  // Single project marker on Victoria, BC
  const vic = latLonToXYZ(VICTORIA.lat, VICTORIA.lon);

  const group = new THREE.Group();
  group.add(fillSphere);
  group.add(makePoints(oceanPos, OCEAN_COLOR, dpr));
  group.add(makePoints(landPos, CONTINENT_COLOR, dpr));
  group.add(makePoints(vic, PROJECT_COLOR, dpr, PROJECT_SIZE_PX, true));
  group.rotation.x = INITIAL_TILT_X;
  group.rotation.y = INITIAL_ROT_Y;
  scene.add(group);

  // --- OrbitControls: drag-to-rotate + wheel zoom, idle auto-rotate ---
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.autoRotate = true;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;

  let isDragging = false;
  controls.addEventListener('start', () => {
    isDragging = true;
    controls.autoRotate = false;
  });
  controls.addEventListener('end', () => {
    isDragging = false;
    controls.autoRotate = true;
  });

  // --- Mouse repulsion: track hover point in the group's local space ---
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
  const hitPoint = new THREE.Vector3();
  const invGroupMatrix = new THREE.Matrix4();
  const targetMouseLocal = new THREE.Vector3();
  let mouseOverGlobe = false;

  function onPointerMove(e) {
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
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerleave', () => { mouseOverGlobe = false; }, { passive: true });

  function frame() {
    controls.update();

    // Repulsion only when hovering AND not dragging (so drag doesn't trigger
    // chaotic ripples while rotating).
    const active = mouseOverGlobe && !isDragging;
    const targetStrength = active ? MOUSE_STRENGTH : 0;
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
