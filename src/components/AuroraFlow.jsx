import { useEffect, useRef } from 'react'

// Rendered at half resolution and stretched: the ribbons are soft, so it is not noticeable.
// Phones draw it smaller still and at half the frame rate; the flow is slow enough to take it.
const RESOLUTION = 0.5
const PHONE_RESOLUTION = 0.35
const PHONE_FRAME = 30
const MAX_DPR = 2
const LAYERS = 84

const VERTEX = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }
`

// Ribbons of light built by folding and warping space LAYERS times and adding a glow at each
// step. The field twists towards the pointer. The result is laid over the background like ink
// on paper, so it works on a light page.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uBg;
uniform float uGain;
uniform vec2 uMouse;
uniform float uOn;
uniform float uReach;
uniform vec2 uVel;
out vec4 o;

const float LAYERS = ${LAYERS.toFixed(1)};
const float TWIST = 1.25;
const float DRAG = 0.18;
const float ANGLE = -3.14159265;
const vec2 CENTRE = vec2(-0.62, 0.24);
const float THETA = 2.13;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float dither(vec2 p, float f) { p += 5.588238 * mod(f, 64.0); return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }

void main() {
  vec2 pos = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  vec2 d = pos - uMouse;
  float w = uOn * exp(-dot(d, d) / (uReach * uReach));
  if (w > 1e-4) pos = uMouse + rot(w * TWIST) * d * (1.0 - 0.3 * min(w, 1.0)) - uVel * min(w, 1.0) * DRAG;

  pos = rot(ANGLE) * pos;
  float t = uTime * 0.49 + 12.0;
  float breath = (-sin(uTime * 0.735) + sin(uTime * 0.49 + 1.0)) * 0.25 + 0.5;
  vec2 u = rot(0.6) * ((pos - CENTRE) * (1.05 - breath * 0.085));
  mat2 fold = mat2(cos(THETA), sin(THETA), -0.963, cos(THETA));

  vec3 light = vec3(0.0);
  for (float i = 1.0; i <= LAYERS; i += 1.0) {
    u.x -= sin(u.y * 0.42 + t + i * 0.007) * 0.13;
    u.y -= sin(u.x * 2.4 - t + i * 0.02) * 0.027;
    u = fold * u * 0.953;
    vec2 q = (u - vec2(0.36 + breath * 0.1, 0.0)) * vec2(2.1, 0.17);
    float glow = 0.0021 / (dot(q, q) + 0.0019) * (0.25 + breath * 0.4);
    float r = length(u);
    float k = sin(i * 0.16 + t * 1.2 + r * 2.0) * 0.5 + 0.5;
    light += glow * mix(uC1, uC2, k) * (0.62 + 0.5 * k) * exp2(-r * 0.37);
  }
  vec3 x = max(light * uGain, 0.0);
  light = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  light = pow(clamp(light, 0.0, 1.0), vec3(0.85, 0.92, 0.98));

  float strength = clamp(max(light.r, max(light.g, light.b)), 0.0, 1.0);
  vec3 color = uBg * (1.0 - strength) + light * 0.96;
  color += (dither(gl_FragCoord.xy, floor(uTime * 24.0)) - 0.5) / 255.0;
  o = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

const toRgb = (hex) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  console.error('AuroraFlow shader:', gl.getShaderInfoLog(shader))
  return null
}

// Flowing two-colour ribbons as a background layer. Fills its positioned parent, reacts to the
// pointer, and only draws while it is actually on screen (so a hidden menu costs nothing).
// Colours are six-digit hex. `intensity` scales how bright the ribbons are, `speed` how fast
// they flow and `pointerSpeed` how quickly the twist catches up with the pointer (1 is the
// original for each; 0 turns pointer following off). `stillOnPhones` draws a single frame on
// phones instead of flowing, for pages where it would run behind a form the whole visit.
// Without WebGL2 the plain background colour is shown.
export default function AuroraFlow({ background = '#f6f4ef', color1 = '#2fd3f2', color2 = '#7b61ff', intensity = 1, speed = 1, pointerSpeed = 1, stillOnPhones = false, className = '' }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false })
    if (!gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    if (!vertex || !fragment) return
    const program = gl.createProgram()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.useProgram(program)
    gl.bindVertexArray(gl.createVertexArray())
    const uniform = (name) => gl.getUniformLocation(program, name)
    const u = {
      res: uniform('uRes'), time: uniform('uTime'), mouse: uniform('uMouse'),
      on: uniform('uOn'), reach: uniform('uReach'), vel: uniform('uVel'),
    }
    gl.uniform3f(uniform('uC1'), ...toRgb(color1))
    gl.uniform3f(uniform('uC2'), ...toRgb(color2))
    gl.uniform3f(uniform('uBg'), ...toRgb(background))
    gl.uniform1f(uniform('uGain'), 0.62 * intensity)

    let width = 0
    let height = 0
    const resizeObserver = new ResizeObserver(() => {
      // A phone's address bar changes the height as the page scrolls; the still picture is
      // stretched that little bit rather than drawn again, which would make it jump.
      if (phone && stillOnPhones && width && root.clientWidth === width) return
      width = root.clientWidth
      height = root.clientHeight
      if (width && height) wake()
    })

    const pointer = { x: 0, y: 0, inside: false }
    const onPointerMove = (e) => {
      const rect = root.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = window.matchMedia('(pointer: coarse)').matches
    const still = reducedMotion || (phone && stillOnPhones)
    let frame = 0
    let last = -1
    let clock = 0
    let mx = 0, my = 0, vx = 0, vy = 0, on = 0

    const render = (now) => {
      // Hidden (display: none) or collapsed: stop until the size comes back.
      if (!width || !height) { frame = 0; last = -1; return }
      frame = still ? 0 : requestAnimationFrame(render)
      if (!still && phone && last >= 0 && now - last < PHONE_FRAME) return
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.05)
      last = now
      clock = (clock + dt * speed) % 3600

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * (phone ? PHONE_RESOLUTION : RESOLUTION)
      const bw = Math.max(1, Math.round(width * dpr))
      const bh = Math.max(1, Math.round(height * dpr))
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
        gl.viewport(0, 0, bw, bh)
      }

      // Pointer position, speed and presence are all eased so the twist never jumps.
      const present = pointer.inside && !reducedMotion ? 1 : 0
      if (present && on < 0.02) { mx = pointer.x; my = pointer.y }
      on += (present - on) * (1 - Math.exp(-dt * 5 * pointerSpeed))
      const follow = 1 - Math.exp(-dt * 16 * pointerSpeed)
      const nx = mx + (pointer.x - mx) * follow
      const ny = my + (pointer.y - my) * follow
      if (dt > 0) {
        const ease = 1 - Math.exp(-dt * 8 * pointerSpeed)
        vx += ((nx - mx) / dt - vx) * ease
        vy += ((ny - my) / dt - vy) * ease
      }
      mx = nx
      my = ny
      const pointerVelocity = Math.hypot(vx, vy) / height
      const cap = pointerVelocity > 3 ? 3 / pointerVelocity : 1

      gl.uniform2f(u.res, bw, bh)
      gl.uniform1f(u.time, clock)
      gl.uniform2f(u.mouse, (mx - width / 2) / height, (height / 2 - my) / height)
      gl.uniform1f(u.on, on)
      gl.uniform1f(u.reach, 240 / height)
      gl.uniform2f(u.vel, (vx / height) * cap, (-vy / height) * cap)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    function wake() {
      if (!frame) frame = requestAnimationFrame(render)
    }
    resizeObserver.observe(root)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    }
  }, [background, color1, color2, intensity, speed, pointerSpeed, stillOnPhones])

  return (
    <div ref={rootRef} aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`} style={{ background }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
