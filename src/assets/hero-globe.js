// Hero dotted globe — Three.js point cloud driven by a real-world land mask.
// Continents (Slate) and ocean (Graticule) come from a Fibonacci sphere
// filtered by the Natural Earth 1:110m mask. One highlight marker sits on
// Victoria, BC. OrbitControls handle drag-to-rotate + wheel zoom, with idle
// auto-rotate. On hover (no drag), all points repel away from the cursor
// with a smooth Gaussian falloff.

// NOTE (ITEM 5): Three.js is no longer imported at module top level. It is
// dynamically imported inside init() only when the globe is actually going to
// run (desktop width, motion allowed, hero near viewport). This keeps the
// ~600KB Three.js bundle off the mobile / reduced-motion critical path.
// `THREE` and `OrbitControls` are assigned to module-scoped bindings inside
// init() so the helpers below (sharedUniforms, makePoints) can use them.
let THREE = null;
let OrbitControls = null;

const CANVAS_SELECTOR = '.hero-globe-canvas';
const MASK_URL = '/assets/world-mask.png';

const N_CANDIDATES = 60000;

// Visual
const CONTINENT_COLOR = 0x5A5F63;   // Slate
const OCEAN_COLOR     = 0xC8C2B4;   // Graticule
const FILL_COLOR      = 0xF4F1EC;   // Quartz
const DOT_SIZE_PX     = 1;

// Pin magnetism — every pin eases toward ONE continuous per-frame target
// (its geographic home eased toward the cursor). Attraction + scale ramp
// smoothly from 0 at MAGNET_RADIUS, and a single critically-damped position
// lerp smooths the activation transient, the cursor motion, and the repulsion
// together — so a pin never snaps when it crosses the radius and a dense
// cluster never "bursts" when many pins activate on the same frame.
const MAGNET_RADIUS  = 80;          // px — cursor influence radius
const PIN_PULL       = 0.7;         // fraction of the cursor gap a fully-attracted pin closes
const PIN_MAX_SCALE  = 2.5;         // 250% peak scale at peak attraction
const POSITION_LERP  = 0.25;        // per-frame ease of a pin toward its target position
const SCALE_LERP     = 0.25;        // matching ease for scale
const REST_SNAP_PX   = 0.4;         // idle pin within this of home snaps exactly on (zero drift)

// Pin-to-pin repulsion — clusters fan out around the cursor. Solved on the
// stable target positions (not the smoothed display positions, which would
// feed back and oscillate), then eased into a smoothed per-pin offset scaled
// by the pin's own attraction, so the fan-out ramps in continuously (no pop)
// and is exactly zero at rest.
const REPEL_RADIUS     = 35;        // px — how far clustered pins fan apart on hover (~20% gentler than 44)
const REPEL_ITERATIONS = 3;         // relaxation passes so dense chains settle without overshoot
const REPEL_LERP       = 0.32;      // ease the smoothed repulsion offset toward the solved target

// Tooltip selection — single winner, with hysteresis so the highlight doesn't
// flicker between neighbours in a dense cluster. All distances are cursor↔BASE
// (geographic) so auto-rotate still releases the highlight.
const TOUCH_RADIUS         = 24;    // px — a pin must be this close to ACQUIRE the tooltip
const TOUCH_RELEASE_RADIUS = 44;    // px — the current winner keeps it until the cursor drifts past this
const TOUCH_SWITCH_MARGIN  = 12;    // px — a rival must be this much closer to steal it

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
const HOVER_SLOW_FACTOR = 0.1;   // slow to 10% of base speed when a pin is highlighted
const ROTATE_SPEED_LERP = 0.08;  // smoothing factor — keeps the transition unnoticeable

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
// Built inside init() once THREE is available (see ITEM 5 note above).
let sharedUniforms = null;

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

  // ITEM 5: dynamically load Three.js + OrbitControls. The import map in
  // head.html still resolves these bare specifiers for dynamic imports.
  try {
    THREE = await import('three');
    ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  } catch (err) {
    console.warn('[hero-globe] Three.js load failed; keeping static fallback:', err);
    return;
  }

  // Build the shared repulsion uniforms now that THREE exists.
  sharedUniforms = {
    uMouse:    { value: new THREE.Vector3(0, 0, 0) },
    uStrength: { value: 0 },
    uRadius:   { value: MOUSE_RADIUS },
  };

  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const dpr = Math.min(window.devicePixelRatio, 2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    // No WebGL context — leave the static fallback in place.
    console.warn('[hero-globe] WebGL unavailable; keeping static fallback:', err);
    return;
  }
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
    // Current displayed state (smoothed). `null` until first projection.
    displayX: null,
    displayY: null,
    scale:    1,
    eased:    0,   // continuous attraction 0..1 this frame (drives pull, scale, repulsion)
    repelX:   0,   // smoothed pin-to-pin repulsion offset (px)
    repelY:   0,
    repTX:    0,   // freshly-solved repulsion target offset for this frame (px)
    repTY:    0,
    visiblePrev: false,  // was this pin visible last frame (reseed on re-entry)
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

  let touchedPinRef = null;

  function updatePins() {
    if (!pins.length) return;
    group.updateMatrixWorld();

    // Shared geometry (rects hoisted — one read per frame, no per-pin layout).
    const parentBox = pins[0].el.parentElement.getBoundingClientRect();
    const canvasBox = canvas.getBoundingClientRect();
    const offsetX = canvasBox.left - parentBox.left;
    const offsetY = canvasBox.top  - parentBox.top;
    const mx = mouseClientX - parentBox.left;
    const my = mouseClientY - parentBox.top;

    // Pass 1 — project each pin and compute ONE continuous per-frame target:
    // its geographic home eased toward the cursor. `eased` is a smoothstep that
    // is exactly 0 at MAGNET_RADIUS, so the target collapses to `base` at the
    // boundary — crossing the radius is continuous (no snap), and a whole
    // cluster activating together just eases in together (no burst).
    for (const pin of pins) {
      pin.world.copy(pin.local).applyMatrix4(group.matrixWorld);
      if (pin.world.dot(camera.position) <= 0) { pin.visible = false; continue; }

      pin.ndc.copy(pin.world).project(camera);
      if (Math.abs(pin.ndc.x) > 1.1 || Math.abs(pin.ndc.y) > 1.1) { pin.visible = false; continue; }
      pin.visible = true;

      pin.baseX = offsetX + (pin.ndc.x * 0.5 + 0.5) * canvasBox.width;
      pin.baseY = offsetY + (-pin.ndc.y * 0.5 + 0.5) * canvasBox.height;

      const dx = mx - pin.baseX;
      const dy = my - pin.baseY;
      pin.baseDist = Math.hypot(dx, dy);

      // Continuous activation 0..1 (smoothstep), exactly 0 outside the radius.
      let eased = 0;
      if (!isDragging && pin.baseDist < MAGNET_RADIUS) {
        const t = 1 - pin.baseDist / MAGNET_RADIUS;
        eased = t * t * (3 - 2 * t);
      }
      pin.eased = eased;

      // Attracted target (pre-repulsion). eased→0 ⇒ target === base.
      pin.targetX = pin.baseX + dx * eased * PIN_PULL;
      pin.targetY = pin.baseY + dy * eased * PIN_PULL;
      pin.targetScale = 1 + eased * (PIN_MAX_SCALE - 1);
      pin.repTX = 0;
      pin.repTY = 0;

      // Seed display at target on first projection OR when the pin has just
      // rotated back into view, so it appears in place instead of gliding in
      // from a stale off-screen position.
      if (pin.displayX === null || !pin.visiblePrev) {
        pin.displayX = pin.targetX;
        pin.displayY = pin.targetY;
        pin.scale    = pin.targetScale;
        pin.repelX   = 0;
        pin.repelY   = 0;
      }
    }

    // Pass 2 — pair-wise repulsion solved on the STABLE target positions. Only
    // attracted pins (eased>0) move; they push off every visible pin, so
    // stationary neighbours aren't displaced. An axis bounding-box reject runs
    // before the hypot, so a lone active pin does cheap comparisons rather than
    // ~213 square roots. Reading the corrected positions each pass lets chains
    // settle in ~2 iterations instead of overshooting.
    for (let iter = 0; iter < REPEL_ITERATIONS; iter++) {
      for (const pin of pins) {
        if (!pin.visible || pin.eased <= 0) continue;
        const px = pin.targetX + pin.repTX;
        const py = pin.targetY + pin.repTY;
        let rx = pin.repTX, ry = pin.repTY;
        for (const other of pins) {
          if (other === pin || !other.visible) continue;
          const dx = px - (other.targetX + other.repTX);
          if (dx > REPEL_RADIUS || dx < -REPEL_RADIUS) continue;   // bbox prune
          const dy = py - (other.targetY + other.repTY);
          if (dy > REPEL_RADIUS || dy < -REPEL_RADIUS) continue;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_RADIUS && d > 0.001) {
            // Push half the overlap along the pin-to-pin axis; two pins settle
            // exactly REPEL_RADIUS apart. Magnitude is bounded by ½·REPEL_RADIUS
            // (unit axis × overlap), so near-coincident pins can't explode.
            const overlap = REPEL_RADIUS - d;
            rx += (dx / d) * overlap * 0.5;
            ry += (dy / d) * overlap * 0.5;
          }
        }
        pin.repTX = rx;
        pin.repTY = ry;
      }
    }

    // Pass 3 — settle. Ease the smoothed repulsion offset toward the freshly
    // solved target (scaled by attraction so the fan-out ramps in continuously
    // and vanishes on release), then critically-damp the display position toward
    // (attracted target + repulsion). This single position lerp smooths the
    // activation transient, the cursor motion, AND the repulsion, so nothing
    // pops. At rest (eased 0) the residual decays and snaps to exactly the
    // geographic home — zero drift.
    for (const pin of pins) {
      if (!pin.visible) continue;
      pin.repelX += (pin.repTX * pin.eased - pin.repelX) * REPEL_LERP;
      pin.repelY += (pin.repTY * pin.eased - pin.repelY) * REPEL_LERP;

      const goalX = pin.targetX + pin.repelX;
      const goalY = pin.targetY + pin.repelY;
      pin.displayX += (goalX - pin.displayX) * POSITION_LERP;
      pin.displayY += (goalY - pin.displayY) * POSITION_LERP;
      pin.scale    += (pin.targetScale - pin.scale) * SCALE_LERP;

      if (pin.eased === 0) {
        if (Math.abs(pin.repelX) < 0.05) pin.repelX = 0;
        if (Math.abs(pin.repelY) < 0.05) pin.repelY = 0;
        if (Math.abs(pin.displayX - pin.baseX) < REST_SNAP_PX) pin.displayX = pin.baseX;
        if (Math.abs(pin.displayY - pin.baseY) < REST_SNAP_PX) pin.displayY = pin.baseY;
        if (Math.abs(pin.scale - 1) < 0.01) pin.scale = 1;
      }
    }

    // Pass 4 — pick the single tooltip pin WITH hysteresis, gated on cursor↔BASE
    // distance (so auto-rotate still releases the highlight as the geographic
    // home rotates away). Acquire within TOUCH_RADIUS; the incumbent keeps the
    // tooltip until the cursor drifts past the larger TOUCH_RELEASE_RADIUS (or
    // it hides / a drag starts); a rival only steals it by being
    // TOUCH_SWITCH_MARGIN px closer. This stops the winner flickering between
    // neighbours in a dense cluster.
    let best = null;
    let bestDist = TOUCH_RADIUS;
    for (const pin of pins) {
      if (!pin.visible || pin.eased <= 0) continue;
      if (pin.baseDist < bestDist) {
        bestDist = pin.baseDist;
        best = pin;
      }
    }

    const prev = touchedPinRef;
    let touchedPin;
    if (prev && prev.visible && !isDragging && prev.baseDist < TOUCH_RELEASE_RADIUS) {
      // Incumbent still inside its (enlarged) release zone — keep it unless a
      // rival is closer by more than the switch margin.
      touchedPin = (best && best !== prev && best.baseDist < prev.baseDist - TOUCH_SWITCH_MARGIN)
        ? best
        : prev;
    } else {
      touchedPin = best;
    }

    // Pass 5 — commit styles, writing ONLY when a value actually changed so we
    // don't trigger a style-recalc storm across every pin element each frame
    // (the --pin-scale and is-touched writes are static at rest; skipping them
    // avoids needless recalc). Position stays on transform (compositor-friendly).
    for (const pin of pins) {
      const el = pin.el;

      if (!pin.visible) {
        if (pin._hidden !== true) {
          el.classList.add('is-hidden');
          el.classList.remove('is-touched');
          pin._hidden = true;
          pin._touched = false;
        }
        pin.visiblePrev = false;
        continue;
      }
      if (pin._hidden !== false) {
        el.classList.remove('is-hidden');
        pin._hidden = false;
      }

      const rx = Math.round(pin.displayX * 100) / 100;
      const ry = Math.round(pin.displayY * 100) / 100;
      if (rx !== pin._wx || ry !== pin._wy) {
        el.style.transform = `translate(${rx}px, ${ry}px)`;
        pin._wx = rx;
        pin._wy = ry;
      }

      const rs = Math.round(pin.scale * 1000) / 1000;
      if (rs !== pin._ws) {
        el.style.setProperty('--pin-scale', rs);
        pin._ws = rs;
      }

      const touched = pin === touchedPin;
      if (touched !== pin._touched) {
        el.classList.toggle('is-touched', touched);
        pin._touched = touched;
      }

      pin.visiblePrev = true;
    }

    touchedPinRef = touchedPin;
  }

  function frame() {
    controls.update();

    // Repulsion on land/ocean dots only when hovering AND not dragging
    const active = mouseOverGlobe && !isDragging;
    const targetStrength = active ? MOUSE_STRENGTH : 0;
    sharedUniforms.uStrength.value += (targetStrength - sharedUniforms.uStrength.value) * MOUSE_LERP;
    sharedUniforms.uMouse.value.lerp(targetMouseLocal, MOUSE_LERP);

    updatePins();

    // Slow auto-rotation while a pin is highlighted so the user can read it.
    if (controls.autoRotate) {
      const targetRotateSpeed = touchedPinRef
        ? AUTO_ROTATE_SPEED * HOVER_SLOW_FACTOR
        : AUTO_ROTATE_SPEED;
      controls.autoRotateSpeed +=
        (targetRotateSpeed - controls.autoRotateSpeed) * ROTATE_SPEED_LERP;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      canvas.classList.add('is-active');
      // The live WebGL globe is up — hide the static fallback (ITEM 5).
      if (parent) parent.classList.add('is-live');
    });
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

// --- Gated bootstrap (ITEM 5) -------------------------------------------------
// Only load + initialise the Three.js globe when ALL of these hold:
//   • viewport is desktop-width  (min-width: 1024px)
//   • the user has not asked to reduce motion
// On phones / tablets / reduced-motion the static CSS fallback stays visible
// and Three.js is never fetched. When the gate passes, init() is deferred until
// the hero is near the viewport (IntersectionObserver) — or, if IO is
// unavailable, until the browser is idle (requestIdleCallback / timeout).
let booted = false;

function bootGlobe() {
  if (booted) return;
  booted = true;
  init();
}

function maybeBootGlobe() {
  const wideEnough     = window.matchMedia('(min-width: 1024px)').matches;
  const motionAllowed  = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!wideEnough || !motionAllowed) return;   // keep the static fallback

  const hero = document.querySelector('.hero-globe');

  // Defer until the hero is near/in the viewport, falling back to idle time.
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some(e => e.isIntersecting)) {
        obs.disconnect();
        bootGlobe();
      }
    }, { rootMargin: '200px' });
    io.observe(hero);
    // Safety net: the hero is at the top of the page, so it should intersect
    // immediately — but boot on idle regardless so we never wait forever.
    if ('requestIdleCallback' in window) {
      requestIdleCallback(bootGlobe, { timeout: 2500 });
    } else {
      setTimeout(bootGlobe, 1200);
    }
    return;
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(bootGlobe, { timeout: 2500 });
  } else {
    setTimeout(bootGlobe, 200);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', maybeBootGlobe);
} else {
  maybeBootGlobe();
}
