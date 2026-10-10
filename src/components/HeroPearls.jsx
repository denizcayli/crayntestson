import { useEffect, useRef } from 'react'
import { withBase } from '../lib/paths.js'

// Layout is authored on a 1000 x 657 reference frame (the proportions of the original scene)
// and scaled to the hero.
const FRAME = { width: 1000, height: 657 }
const BLOBS = [
  { x: 140, y: 100, radius: 56, drift: 8, seed: 0, warm: [-0.5, -0.8] },
  { x: 55, y: 440, radius: 56, drift: 8, seed: 11, warm: [-0.9, 0.1] },
  { x: 940, y: 215, radius: 53, drift: 22, seed: 23, warm: [0.2, -0.9] },
  { x: 965, y: 490, radius: 53, drift: 9, seed: 37, warm: [-0.7, 0.6] },
]
// Invisible spot that follows the pointer and recolours the heading it passes over.
const SPOTLIGHT = { radius: 46, lag: 0.18 }

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Pearl in the brand tones: white core, a silver-to-Crayn-blue blush on one side and a deeper
// blue rim that dissolves into the page.
const PEARL_FRAGMENT = /* glsl */ `
  uniform vec2 uWarm;
  varying vec3 vNormal;
  void main() {
    // Distance from the centre of the silhouette: 0 in the middle, 1 at the outline.
    float edge = length(vNormal.xy);
    float side = dot(normalize(vNormal.xy + 1e-4), normalize(uWarm)) * 0.5 + 0.5;
    vec3 color = vec3(1.0);
    vec3 blush = mix(vec3(0.80, 0.84, 0.88), vec3(0.49, 0.64, 1.0), smoothstep(0.35, 0.85, edge));
    color = mix(color, blush, smoothstep(0.25, 0.75, edge) * smoothstep(0.05, 0.75, side));
    color = mix(color, vec3(0.29, 0.42, 0.86), smoothstep(0.7, 0.96, edge));
    gl_FragColor = vec4(color, 1.0 - smoothstep(0.84, 1.0, edge));
  }
`

// Backdrop photo: the default "arch" image of the Unfocused+ Framer component by Jay Ji
// (reveals.cool), whose defocus effect is recreated below.
const BACKDROP_IMAGE = withBase('/assets/hero/unfocused-arch.jpg')
const BACKDROP_COLOR = 0x0a0a0a

// "Unfocused" finish over the whole backdrop: the picture is sharp at the far corner and gets
// progressively more blurred towards the near one, with the red and blue channels pulled apart
// at the blurred end and film grain on top. Settings follow the effect's defaults; the caller
// scales blur and grain between 0 (in focus) and 1 (fully unfocused).
const UNFOCUS = { blur: 200, angle: 45, origin: [0, 0.5], dispersion: 0.2, noise: 1 }

// What the scene may cost. The unfocus pass reads the picture `samples` times for every pixel it
// draws, so the number of pixels is capped: `pixels` is the most the canvas may hold and
// `ratio` the most device pixels per CSS pixel. The picture is blurred, so the difference does
// not show. `detail` is how finely the pearls are divided; they are reshaped on every frame.
const QUALITY = {
  desktop: { samples: 16, pixels: 3.7e6, ratio: 2, detail: 10 },
  phone: { samples: 10, pixels: 0.9e6, ratio: 1.5, detail: 6 },
}

const UNFOCUS_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const unfocusFragment = (samples) => /* glsl */ `
  uniform sampler2D uScene;
  uniform vec2 uPanel;
  uniform float uBlur;
  uniform float uAngle;
  uniform vec2 uOrigin;
  uniform float uDispersion;
  uniform float uNoise;
  varying vec2 vUv;

  const int SAMPLES = ${samples};
  const float TAU = 6.28318530718;

  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 direction = vec2(cos(uAngle), sin(uAngle));
    float along = clamp(max(dot(vUv - uOrigin, direction), 0.0) / 0.7, 0.0, 1.0);
    float strength = uBlur * (1.0 - smoothstep(0.0, 1.0, along));
    vec2 texel = 1.0 / uPanel;
    float radius = strength * 0.5;
    vec2 split = vec2(-direction.y, direction.x) * uDispersion * strength * 0.35 * texel;

    vec3 sum = vec3(0.0);
    float total = 0.0;
    for (int i = 0; i < SAMPLES; i++) {
      float fi = float(i);
      float turn = fi / float(SAMPLES) * TAU;
      // Jittered ring radius: this is what gives the blur its grainy, optical look.
      float reach = clamp(rand(vec2(fi, vUv.x + vUv.y)) * 0.5 + 0.5 + (rand(vUv + fi * 0.1) * 2.0 - 1.0) * uNoise * 0.3, 0.1, 1.0);
      vec2 offset = vec2(cos(turn), sin(turn)) * radius * reach * texel;
      float weight = 1.0 - smoothstep(0.0, 1.0, reach);
      weight = max(weight * (1.0 + (rand(vUv + fi * 0.05 + 13.7) * 2.0 - 1.0) * uNoise * 0.2), 0.02);
      vec2 at = clamp(vUv + offset, 0.0, 1.0);
      sum += vec3(
        texture2D(uScene, clamp(at - split, 0.0, 1.0)).r,
        texture2D(uScene, at).g,
        texture2D(uScene, clamp(at + split, 0.0, 1.0)).b
      ) * weight;
      total += weight;
    }
    vec3 color = sum / total;
    color += (rand(vUv * uPanel) - 0.5) * 0.045 * uNoise;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

// Hero backdrop: a photo with four slowly wobbling pearls in front of it, shown through the
// unfocus pass. `blurRef.current` (1 to 0) says how unfocused it is; the hero drives it from the
// scroll position. `revealRef` is the coloured copy of the heading; it is masked to the pearls
// and to a spot under the pointer, so the heading changes colour wherever one passes over it.
export default function HeroPearls({ revealRef, blurRef }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    let disposed = false
    let cleanup = () => {}

    Promise.all([
      import('three'),
      import('three/examples/jsm/math/ImprovedNoise.js'),
      import('three/examples/jsm/utils/BufferGeometryUtils.js'),
    ]).then(([THREE, { ImprovedNoise }, { mergeVertices }]) => {
      if (disposed) return

      const quality = window.matchMedia('(pointer: coarse)').matches ? QUALITY.phone : QUALITY.desktop
      // Everything is drawn through the unfocus pass, which smooths edges anyway.
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      // The shaders write display colours directly.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000)
      camera.position.z = 1000

      // Photo behind the pearls, sized in resize() to cover the hero.
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: BACKDROP_COLOR }),
      )
      photo.position.z = -500
      scene.add(photo)
      let photoAspect = 1.5
      new THREE.TextureLoader().load(BACKDROP_IMAGE, (texture) => {
        if (disposed) return texture.dispose()
        photoAspect = texture.image.width / texture.image.height
        photo.material.map = texture
        photo.material.color.set(0xffffff)
        photo.material.needsUpdate = true
        resize()
      })

      // Everything is drawn into an offscreen picture first, then shown through the unfocus pass.
      const target = new THREE.WebGLRenderTarget(1, 1)
      const unfocus = new THREE.ShaderMaterial({
        vertexShader: UNFOCUS_VERTEX,
        fragmentShader: unfocusFragment(quality.samples),
        uniforms: {
          uScene: { value: target.texture },
          uPanel: { value: new THREE.Vector2(1, 1) },
          uBlur: { value: UNFOCUS.blur },
          uAngle: { value: (UNFOCUS.angle * Math.PI) / 180 },
          uOrigin: { value: new THREE.Vector2(...UNFOCUS.origin) },
          uDispersion: { value: UNFOCUS.dispersion },
          uNoise: { value: UNFOCUS.noise },
        },
        depthTest: false,
      })
      const screenGeometry = new THREE.PlaneGeometry(2, 2)
      const screen = new THREE.Mesh(screenGeometry, unfocus)
      screen.frustumCulled = false
      const screenScene = new THREE.Scene().add(screen)

      // Smooth sphere without a UV seam, so recomputed normals stay continuous while it deforms.
      const sphere = (detail) => {
        const geometry = new THREE.IcosahedronGeometry(1, detail)
        geometry.deleteAttribute('uv')
        geometry.deleteAttribute('normal')
        const merged = mergeVertices(geometry)
        geometry.dispose()
        merged.computeVertexNormals()
        return merged
      }
      const pearlMaterial = (warm) => new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: PEARL_FRAGMENT,
        uniforms: { uWarm: { value: new THREE.Vector2(warm[0], -warm[1]) } },
        transparent: true,
        depthWrite: false,
      })

      const disposables = []
      const blobs = BLOBS.map((config) => {
        const geometry = sphere(quality.detail)
        const mesh = new THREE.Mesh(geometry, pearlMaterial(config.warm))
        scene.add(mesh)
        disposables.push(geometry, mesh.material)
        return { ...config, mesh, rest: geometry.attributes.position.array.slice(), px: 0, py: 0, pr: 0 }
      })

      const spotlight = { x: 0, y: 0 }

      // Reference-frame coordinates -> hero pixels (origin top-left).
      const view = { width: 1, height: 1, unit: 1, unitX: 1, size: 1 }
      const place = (x, y) => [
        view.width / 2 + (x - FRAME.width / 2) * view.unitX,
        view.height / 2 + (y - FRAME.height / 2) * view.unit,
      ]
      const toScene = (object, px, py) => object.position.set(px - view.width / 2, view.height / 2 - py, object.position.z)

      const resize = () => {
        const { clientWidth: width, clientHeight: height } = mount
        if (!width || !height) return
        view.width = width
        view.height = height
        view.unit = Math.min(width / FRAME.width, height / FRAME.height)
        // On portrait screens the pearls spread to the edges and keep a readable size.
        const portrait = width < height
        view.unitX = portrait ? width / 760 : view.unit
        view.size = Math.max(view.unit, 0.7)
        if (portrait) view.unit = height / 820
        camera.left = -width / 2
        camera.right = width / 2
        camera.top = height / 2
        camera.bottom = -height / 2
        camera.updateProjectionMatrix()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.ratio, Math.sqrt(quality.pixels / (width * height))))
        renderer.setSize(width, height)
        const cover = Math.max(width / photoAspect, height)
        photo.scale.set(cover * photoAspect, cover, 1)
        const pixelRatio = renderer.getPixelRatio()
        target.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio))
        // The blur is measured in CSS pixels, like the original effect.
        unfocus.uniforms.uPanel.value.set(width, height)
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)

      const pointer = { x: 0, y: 0, seen: false }
      const onPointerMove = (e) => {
        const rect = mount.getBoundingClientRect()
        pointer.x = e.clientX - rect.left
        pointer.y = e.clientY - rect.top
        if (!pointer.seen) Object.assign(spotlight, { x: pointer.x, y: pointer.y })
        pointer.seen = true
      }
      window.addEventListener('pointermove', onPointerMove)

      let focus = 1
      // What the heading was last told, so that it is only told again when something has moved.
      const told = []
      const noise = new ImprovedNoise()
      const draw = (seconds) => {
        for (const blob of blobs) {
          const positions = blob.mesh.geometry.attributes.position
          const { rest } = blob
          for (let i = 0; i < rest.length; i += 3) {
            const x = rest[i], y = rest[i + 1], z = rest[i + 2]
            const offset = 1 + 0.2 * noise.noise(x * 1.1 + blob.seed, y * 1.1 + seconds * 0.22, z * 1.1 + seconds * 0.16)
            positions.array[i] = x * offset
            positions.array[i + 1] = y * offset
            positions.array[i + 2] = z * offset
          }
          positions.needsUpdate = true
          blob.mesh.geometry.computeVertexNormals()

          const [px, py] = place(
            blob.x + Math.sin(seconds * 0.31 + blob.seed) * blob.drift,
            blob.y + Math.cos(seconds * 0.23 + blob.seed) * blob.drift,
          )
          blob.pr = blob.radius * view.size
          // Never further out than half hidden behind the side edges (matters on narrow screens).
          blob.px = Math.min(Math.max(px, 0), view.width)
          blob.py = py
          toScene(blob.mesh, blob.px, py)
          blob.mesh.scale.setScalar(blob.pr)
          blob.mesh.rotation.z = seconds * 0.05
        }

        spotlight.x += (pointer.x - spotlight.x) * SPOTLIGHT.lag
        spotlight.y += (pointer.y - spotlight.y) * SPOTLIGHT.lag

        // Tell the coloured heading where the pearls and the spotlight are (relative to its own box).
        const reveal = revealRef.current
        if (reveal) {
          const heroRect = mount.getBoundingClientRect()
          const rect = reveal.getBoundingClientRect()
          const spots = [
            ...blobs.map((blob) => [blob.px, blob.py, blob.pr * 0.82]),
            [spotlight.x, spotlight.y, pointer.seen ? SPOTLIGHT.radius * view.size : 0],
          ]
          // Whole pixels: the pearls drift slowly, so most frames change nothing and the heading
          // is left alone instead of being repainted.
          spots.forEach(([x, y, radius], index) => {
            const spot = `${Math.round(x - (rect.left - heroRect.left))},${Math.round(y - (rect.top - heroRect.top))},${Math.round(radius)}`
            if (told[index] === spot) return
            told[index] = spot
            const [sx, sy, sr] = spot.split(',')
            reveal.style.setProperty(`--x${index}`, `${sx}px`)
            reveal.style.setProperty(`--y${index}`, `${sy}px`)
            reveal.style.setProperty(`--r${index}`, `${sr}px`)
          })
        }

        // Ease towards the requested amount so the focus pull never jumps.
        focus += ((blurRef?.current ?? 1) - focus) * 0.12
        unfocus.uniforms.uBlur.value = UNFOCUS.blur * focus
        unfocus.uniforms.uNoise.value = UNFOCUS.noise * focus

        renderer.setRenderTarget(target)
        renderer.setClearColor(BACKDROP_COLOR, 1)
        renderer.clear()
        renderer.render(scene, camera)
        renderer.setRenderTarget(null)
        renderer.render(screenScene, camera)
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let frame = 0
      let visible = true
      const loop = (now) => {
        frame = requestAnimationFrame(loop)
        if (visible) draw(now / 1000)
      }
      draw(0)
      if (!reducedMotion) frame = requestAnimationFrame(loop)

      // No rendering while the hero is scrolled out of view.
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
      visibility.observe(mount)

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('pointermove', onPointerMove)
        resizeObserver.disconnect()
        visibility.disconnect()
        disposables.forEach((item) => item.dispose())
        photo.material.map?.dispose()
        ;[target, unfocus, screenGeometry, photo.geometry, photo.material].forEach((item) => item.dispose())
        renderer.dispose()
        renderer.domElement.remove()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [revealRef, blurRef])

  return <div ref={mountRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />
}
