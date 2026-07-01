// Minimal topographic-contour shader for the footer background.
// Slow-drifting simplex-noise isolines in warm paper tones with
// the occasional ore-tinted peak. Tuned for "barely there" — it
// should read as texture, not decoration, and respect reduced-motion.

const vertSrc = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragSrc = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0*fract(p*C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Anisotropic coord — gentle horizontal drift, taller bands than wide
  // so the contours read as a map, not pebbles.
  vec2 p = vec2(v_uv.x * (u_resolution.x / u_resolution.y) * 0.85,
                v_uv.y * 1.55);
  float t = u_time * 0.030;

  // Single low-frequency octave — concentric, breathing rings.
  // Tiny second octave for slow organic variation without scribble.
  float n  = snoise(p * 1.05 + vec2(t, t * 0.55));
        n += snoise(p * 2.1  + vec2(-t * 0.8, t * 0.3)) * 0.12;

  // Sparser band count + gentle falloff = elegant contour strokes
  float bandPos = n * 3.4 - 0.5;
  float bands   = abs(fract(bandPos) - 0.5);
  float line    = 1.0 - smoothstep(0.006, 0.028, bands);

  // Every 15th band gets the ore tint — a quiet accent on the map.
  float bandIdx = floor(bandPos);
  float oreBand = step(0.5, 1.0 - abs(mod(bandIdx, 15.0)));

  // Warm paper base (quartz, a hair darker than --quartz to read behind content)
  vec3 base  = vec3(0.949, 0.937, 0.917);
  // Default contour — cool slate with a whisper of warmth
  vec3 slateC = vec3(0.298, 0.318, 0.345);
  // Ore accent — brand --ore (#B8823A)
  vec3 oreC   = vec3(0.722, 0.510, 0.227);
  vec3 lineC  = mix(slateC, oreC, oreBand);
  // Ore lines get a touch more opacity so the accent reads
  float lineStrength = mix(0.17, 0.45, oreBand);
  vec3 col   = mix(base, lineC, line * lineStrength);

  // Barely-there horizontal wash — slightly brighter toward the right edge
  col += smoothstep(0.0, 1.0, v_uv.x) * 0.012;

  // Soft vignette — fades to pure quartz at top/bottom
  // so content always reads cleanly against the surface
  float edge = smoothstep(0.0, 0.20, v_uv.y) * smoothstep(1.0, 0.82, v_uv.y);
  col = mix(vec3(0.957, 0.945, 0.925), col, edge);

  gl_FragColor = vec4(col, 1.0);
}`;

function mount(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes  = gl.getUniformLocation(prog, 'u_resolution');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = canvas.clientWidth  * dpr;
    const h = canvas.clientHeight * dpr;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  // Pause rendering when the footer is off-screen. Keeps the idle
  // GPU cost at zero for the 99% of time users spend above the fold.
  let visible = false;
  const io = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestAnimationFrame(frame);
  }, { rootMargin: '200px' });
  io.observe(canvas);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();

  function frame() {
    resize();
    const t = reduced ? 0 : (performance.now() - start) * 0.001;
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && !reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    if (visible) requestAnimationFrame(frame);
  }, { passive: true });
}

function init() {
  document.querySelectorAll('.footer-canvas, .paper-shader').forEach(mount);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
