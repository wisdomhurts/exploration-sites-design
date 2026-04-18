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
const FILL_COLOR      = 0xF4F1EC;   // Quartz
const DOT_SIZE_PX     = 1;

// Pin magnetism
const MAGNET_RADIUS  = 160;         // px — within this distance the pin attracts
const TOUCH_RADIUS   = 28;          // px — tooltip appears when effective distance is ≤ this
const PIN_MAX_SCALE  = 2.5;         // 250% peak scale at peak attraction

// Pin-to-pin repulsion (only applied to pins currently attracted to the cursor,
// so at rest pins sit exactly on their geographic coords; clusters only fan
// out while the user is interacting with them).
const REPEL_RADIUS     = 36;        // px — pins within this distance push apart (halved from 72)
const REPEL_ITERATIONS = 2;         // chain-cluster stabilization

// Orientation — north directly up, Western Canada centered.
// With the geographic convention x=cos(lat)·sin(lon), z=cos(lat)·cos(lon),
// camera at +Z sees lon=0 at center. To center lon=−120° (Victoria BC) we
// rotate the globe by α = +120° = 2π/3.
const INITIAL_TILT_X = 0;           // true north up
const INITIAL_ROT_Y  = 2 * Math.PI / 3;  // = 2.094 rad, puts lon −120° at world +Z

// Camera
const CAMERA_FOV     = 26;
const CAMERA_Z       = 4.6;
const MIN_DISTANCE   = 2.2;
const MAX_DISTANCE   = 8.0;

// Auto-rotate (~50s per revolution). Negative = globe spins west→east
// (real Earth direction from a northern viewer), so continents move left→right
// across the visible disc.
const AUTO_ROTATE_SPEED = -1.2;

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

// Geographic → scene position: north pole = +Y, lon=0 meridian = +Z,
// lon=+90°E = +X. This matches how we decode lon from Fibonacci candidates
// below (`atan2(x, z)`), so east is always to the viewer's right.
function latLonToXYZ(lat, lon, radius = 1.002) {
  const phi = lat * Math.PI / 180;
  const lambda = lon * Math.PI / 180;
  const cosLat = Math.cos(phi);
  return [
    radius * cosLat * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * cosLat * Math.cos(lambda),
  ];
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
    // Geographic convention: x = cos(lat)·sin(lon), z = cos(lat)·cos(lon)
    // ⇒ lon = atan2(x, z) so east (+lon) maps to the viewer's right (+X).
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = Math.atan2(x, z) * 180 / Math.PI;
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

  const group = new THREE.Group();
  group.add(fillSphere);
  group.add(makePoints(oceanPos, OCEAN_COLOR, dpr));
  group.add(makePoints(landPos, CONTINENT_COLOR, dpr));
  group.rotation.x = INITIAL_TILT_X;
  group.rotation.y = INITIAL_ROT_Y;
  scene.add(group);

  // Victoria pin is an HTML element overlaid on the canvas (for magnetism,
  // scale animation, and tooltip). Projected each frame from 3D.
  // Collect every .hero-globe-pin in the DOM and build a projection record
  // for each. Coordinates come from data-lat / data-lon; color comes from CSS.
  const pins = Array.from(document.querySelectorAll('.hero-globe-pin')).map(el => ({
    el,
    local: new THREE.Vector3(...latLonToXYZ(
      parseFloat(el.dataset.lat),
      parseFloat(el.dataset.lon)
    )),
    world: new THREE.Vector3(),
    ndc:   new THREE.Vector3(),
  }));

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

  // --- Mouse tracking (shared by repulsion + pin magnetism) ---
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
  const hitPoint = new THREE.Vector3();
  const invGroupMatrix = new THREE.Matrix4();
  const targetMouseLocal = new THREE.Vector3();
  let mouseOverGlobe = false;
  let mouseClientX = -9999;
  let mouseClientY = -9999;

  function onPointerMove(e) {
    mouseClientX = e.clientX;
    mouseClientY = e.clientY;

    const r = canvas.getBoundingClientRect();
    const overCanvas = (
      e.clientX >= r.left && e.clientX <= r.right &&
      e.clientY >= r.top  && e.clientY <= r.bottom
    );
    if (!overCanvas) {
      mouseOverGlobe = false;
      return;
    }
    mouseNDC.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - r.top) / r.height) * 2 + 1;
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
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', () => { mouseOverGlobe = false; }, { passive: true });

  function updatePins() {
    if (!pins.length) return;
    group.updateMatrixWorld();

    // Shared geometry
    const parentBox = pins[0].el.parentElement.getBoundingClientRect();
    const canvasBox = canvas.getBoundingClientRect();
    const offsetX = canvasBox.left - parentBox.left;
    const offsetY = canvasBox.top  - parentBox.top;
    const mx = mouseClientX - parentBox.left;
    const my = mouseClientY - parentBox.top;

    // Pass 1 — project each pin, compute visibility, base screen position,
    // and initial display position with cursor attraction.
    for (const pin of pins) {
      pin.world.copy(pin.local).applyMatrix4(group.matrixWorld);
      pin.visible = pin.world.dot(camera.position) > 0;
      if (!pin.visible) continue;

      pin.ndc.copy(pin.world).project(camera);
      if (Math.abs(pin.ndc.x) > 1.1 || Math.abs(pin.ndc.y) > 1.1) {
        pin.visible = false;
        continue;
      }

      pin.baseX = offsetX + (pin.ndc.x * 0.5 + 0.5) * canvasBox.width;
      pin.baseY = offsetY + (-pin.ndc.y * 0.5 + 0.5) * canvasBox.height;

      const dx = mx - pin.baseX;
      const dy = my - pin.baseY;
      const dist = Math.hypot(dx, dy);
      pin.active = !isDragging && dist < MAGNET_RADIUS;

      if (pin.active) {
        const t = 1 - dist / MAGNET_RADIUS;
        const eased = t * t * (3 - 2 * t);
        pin.scale    = 1 + eased * (PIN_MAX_SCALE - 1);
        pin.displayX = pin.baseX + dx * eased * 0.7;
        pin.displayY = pin.baseY + dy * eased * 0.7;
      } else {
        pin.scale = 1;
        pin.displayX = pin.baseX;
        pin.displayY = pin.baseY;
      }
    }

    // Pass 2 — pair-wise repulsion. Only *active* pins move, but they repel
    // from every visible pin (active or not) so clusters fan around the cursor
    // without displacing stationary neighbors. Iterate a couple of times so
    // chains of close pins settle rather than overshoot.
    for (let iter = 0; iter < REPEL_ITERATIONS; iter++) {
      for (const pin of pins) {
        if (!pin.visible || !pin.active) continue;
        let rx = 0, ry = 0;
        for (const other of pins) {
          if (other === pin || !other.visible) continue;
          const dx = pin.displayX - other.displayX;
          const dy = pin.displayY - other.displayY;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_RADIUS && d > 0.001) {
            // Move this pin half the overlap along the pin-to-pin axis.
            // After one iteration two active pins will sit exactly REPEL_RADIUS apart.
            const overlap = REPEL_RADIUS - d;
            rx += (dx / d) * overlap * 0.5;
            ry += (dy / d) * overlap * 0.5;
          }
        }
        pin.displayX += rx;
        pin.displayY += ry;
      }
    }

    // Pass 3 — pick the single nearest active pin to the cursor for the
    // tooltip. Prevents multiple tooltips showing when clusters overlap.
    let touchedPin = null;
    let bestEff = TOUCH_RADIUS;
    for (const pin of pins) {
      if (!pin.visible || !pin.active) continue;
      const eff = Math.hypot(mx - pin.displayX, my - pin.displayY);
      if (eff < bestEff) {
        bestEff = eff;
        touchedPin = pin;
      }
    }

    // Pass 4 — commit styles.
    for (const pin of pins) {
      if (!pin.visible) {
        pin.el.classList.add('is-hidden');
        pin.el.classList.remove('is-touched');
        continue;
      }
      pin.el.classList.remove('is-hidden');
      pin.el.style.transform = `translate(${pin.displayX}px, ${pin.displayY}px)`;
      pin.el.style.setProperty('--pin-scale', pin.scale);
      pin.el.classList.toggle('is-touched', pin === touchedPin);
    }
  }

  function frame() {
    controls.update();

    // Repulsion on land/ocean dots only when hovering AND not dragging
    const active = mouseOverGlobe && !isDragging;
    const targetStrength = active ? MOUSE_STRENGTH : 0;
    sharedUniforms.uStrength.value += (targetStrength - sharedUniforms.uStrength.value) * MOUSE_LERP;
    sharedUniforms.uMouse.value.lerp(targetMouseLocal, MOUSE_LERP);

    updatePins();

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
