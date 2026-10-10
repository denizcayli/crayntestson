// Liquid-glass surface for `.glass-btn` buttons: a dark pill whose rim catches flowing light, with
// a thin moving highlight and a few twinkling sparks. It livens up on hover and surges on click.
//
// Every button gets a small 2D canvas behind its label, but all of them are drawn by ONE WebGL
// context (browsers allow only a handful per page): each frame the shader is rendered at a
// button's size and copied into that button's canvas. Only buttons on screen are drawn.

export const GLASS_BUTTONS = '.glass-btn'

const BASE = [0.02, 0.027, 0.039] // near-black graphite
const GLASS = [0.796, 0.835, 0.882] // silver
const MAX_DPR = 2

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;
uniform vec2 uSize;
uniform float uTime;
uniform float uHover;
uniform float uClick;
uniform vec3 uBase;
uniform vec3 uGlass;

float rand(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 17531.7); }

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float bottom = mix(rand(cell), rand(cell + vec2(1.0, 0.0)), f.x);
  float top = mix(rand(cell + vec2(0.0, 1.0)), rand(cell + vec2(1.0, 1.0)), f.x);
  return mix(bottom, top, f.y);
}

float flow(vec2 p) {
  float sum = 0.0;
  float weight = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += weight * valueNoise(p);
    p = p * 2.03 + 7.1;
    weight *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  float aspect = uSize.x / uSize.y;

  // Depth into the pill, in units of half its height: 0 at the edge, 1 along the middle.
  vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);
  vec2 q = abs(p) - vec2(max(aspect - 1.0, 0.0), 0.0);
  float depth = clamp(1.0 - length(max(q, 0.0)) - min(max(q.x, q.y), 0.0), 0.0, 1.0);

  vec2 fromCentre = uv - 0.5;
  float reach = length(fromCentre);
  vec2 outward = fromCentre / (reach + 0.0001);

  // Slow liquid field; hovering stirs it and a click pushes it out from the centre.
  vec2 field = uv * vec2(2.2, 1.0);
  vec2 stir = vec2(flow(field + uTime * 0.5), flow(field - uTime * 0.45 + 9.7)) * 0.4 * uHover;
  stir -= outward * uClick * 0.25 * smoothstep(0.8, 0.0, reach);
  float slow = flow(field + stir + vec2(uTime, 0.0));
  float fine = flow(field + stir + vec2(slow, uTime * 1.2));

  // Light gathered along the rim, wider where the liquid swells, stronger towards the right.
  float lean = smoothstep(0.2, 1.0, uv.x);
  float rimWidth = mix(0.15, 0.35, fine) * mix(1.0, 1.4, uHover) + uClick * 0.15;
  float rim = smoothstep(rimWidth, 0.0, depth) * mix(0.6, 1.5, lean);
  // Hairline highlight just inside the edge, wandering with the liquid.
  float glint = smoothstep(0.03, 0.0, abs(depth - 0.12 + slow * 0.08)) * mix(0.5, 2.0, lean);

  // Sparks: a drifting grid in which a few cells hold a twinkling point.
  vec2 grid = uv * vec2(aspect * 6.0, 6.0);
  grid.x -= uTime * 0.2;
  grid.y += sin(uTime * 0.5 + grid.x) * mix(0.2, 0.6, uHover);
  grid += outward * uClick * 1.5;
  vec2 cell = floor(grid);
  float seed = rand(cell);
  float spark = 0.0;
  if (seed > mix(0.94, 0.86, uHover)) {
    vec2 wobble = vec2(sin(uTime * 2.0 + seed * 50.0), cos(uTime * 2.3 + seed * 40.0)) * 0.25 * uHover;
    float away = length(fract(grid) - 0.5 - wobble) * mix(0.5, 2.5, rand(cell + 13.4));
    spark = smoothstep(0.12, 0.0, away) + smoothstep(0.25, 0.0, away) * 0.3;
    spark *= 0.5 + 0.5 * sin(uTime * mix(5.0, 15.0, rand(cell + 42.0)) + seed * 100.0);
    spark *= smoothstep(0.05, 0.2, depth);
  }

  vec3 color = uBase;
  color += uGlass * smoothstep(0.2, 0.9, fine) * (1.0 - depth) * mix(0.2, 0.45, uHover);
  color += uGlass * rim * mix(0.6, 1.2, uHover);
  color += vec3(glint) * mix(0.8, 2.0, uHover);
  color += vec3(spark) * mix(0.8, 1.5, uHover);
  // Click: the rim flares and a soft glow blooms in the middle.
  color += uGlass * (rim * 0.8 + exp(-reach * 6.0) * 0.6) * uClick + vec3(glint) * uClick * 1.5;
  color *= smoothstep(1.5, 0.2, reach);
  gl_FragColor = vec4(color, 1.0);
}
`

function createPainter() {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true })
  if (!gl) return null

  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniform = (name) => gl.getUniformLocation(program, name)
  const size = uniform('uSize')
  const time = uniform('uTime')
  const hover = uniform('uHover')
  const click = uniform('uClick')
  gl.uniform3fv(uniform('uBase'), BASE)
  gl.uniform3fv(uniform('uGlass'), GLASS)

  return {
    // Draws one button's frame into the bottom-left corner of the shared canvas and copies it out.
    paint(target, width, height, state) {
      if (canvas.width < width || canvas.height < height) {
        canvas.width = Math.max(canvas.width, width)
        canvas.height = Math.max(canvas.height, height)
      }
      gl.viewport(0, 0, width, height)
      gl.uniform2f(size, width, height)
      gl.uniform1f(time, state.time)
      gl.uniform1f(hover, state.hover)
      gl.uniform1f(click, state.click)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      target.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, width, height)
    },
    dispose() {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

// Gives every matching button, now and later, its glass surface. Returns a cleanup function.
export function initGlassButtons() {
  // The painter and its frame loop only exist while the page has such a button.
  let painter = null
  let unsupported = false

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const buttons = new Map()
  const abort = new AbortController()
  const { signal } = abort

  const visibility = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const state = buttons.get(entry.target)
      if (state) state.visible = entry.isIntersecting
    }
  })

  const adopt = (element) => {
    if (buttons.has(element) || unsupported) return
    painter ??= createPainter()
    if (!painter) { unsupported = true; return }
    const surface = document.createElement('canvas')
    surface.className = 'glass-btn__fx'
    surface.setAttribute('aria-hidden', 'true')
    element.prepend(surface)
    const state = {
      surface,
      context: surface.getContext('2d'),
      // Each button starts at a different moment of the flow so they do not move in step.
      time: Math.random() * 40,
      hover: 0,
      click: 0,
      hovered: false,
      pressed: false,
      visible: false,
      painted: false,
    }
    buttons.set(element, state)
    visibility.observe(element)
    const enter = () => { state.hovered = true }
    const leave = () => { state.hovered = false }
    element.addEventListener('pointerenter', enter, { signal })
    element.addEventListener('pointerleave', leave, { signal })
    element.addEventListener('focus', enter, { signal })
    element.addEventListener('blur', leave, { signal })
    element.addEventListener('pointerdown', () => { state.pressed = true }, { signal })
    element.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') state.pressed = true }, { signal })
  }

  const release = (element) => {
    const state = buttons.get(element)
    if (!state) return
    visibility.unobserve(element)
    state.surface.remove()
    buttons.delete(element)
  }

  const scan = () => {
    document.querySelectorAll(GLASS_BUTTONS).forEach(adopt)
    for (const [element, state] of buttons) {
      if (!element.isConnected) release(element)
      // A re-render can replace a button's children; put its surface back.
      else if (state.surface.parentNode !== element) element.prepend(state.surface)
    }
    if (buttons.size && !frame) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }
  // Pages and cards come and go; pick up their buttons as they appear.
  let scanQueued = false
  const watcher = new MutationObserver(() => {
    if (scanQueued) return
    scanQueued = true
    queueMicrotask(() => { scanQueued = false; scan() })
  })
  watcher.observe(document.body, { childList: true, subtree: true })

  let frame = 0
  let last = performance.now()
  const tick = (now) => {
    frame = buttons.size ? requestAnimationFrame(tick) : 0
    const delta = Math.min((now - last) / 1000, 0.1)
    last = now
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    for (const [element, state] of buttons) {
      if (!state.visible) continue
      if (still && state.painted) continue
      state.hover += ((state.hovered ? 1 : 0) - state.hover) * Math.min(1, delta * 4)
      if (state.pressed) { state.click = 1; state.pressed = false }
      state.click += (0 - state.click) * Math.min(1, delta * 6)
      // The flow runs slowly at rest and speeds up under the pointer.
      state.time += delta * (0.15 + 0.45 * state.hover)

      const width = Math.round(element.clientWidth * ratio)
      const height = Math.round(element.clientHeight * ratio)
      if (!width || !height) continue
      if (state.surface.width !== width || state.surface.height !== height) {
        state.surface.width = width
        state.surface.height = height
      }
      painter.paint(state.context, width, height, state)
      state.painted = true
    }
  }
  scan()

  return () => {
    cancelAnimationFrame(frame)
    abort.abort()
    watcher.disconnect()
    visibility.disconnect()
    for (const element of [...buttons.keys()]) release(element)
    painter?.dispose()
  }
}
