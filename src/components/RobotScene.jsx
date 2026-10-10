import { useEffect, useRef, useState } from 'react'
import { withBase } from '../lib/paths.js'

const MODEL_URL = withBase('/assets/robot/glowbot.glb')
const DESKTOP = '(min-width: 1024px)'

// Brand palette
const GRAPHITE = 0x0b0f14
const SILVER = 0xcbd5e1
const CRAYN_BLUE = 0x7da3ff
const CLOUD = 0xf8fafc

// How far the head turns towards the pointer, in radians.
const MAX_YAW = 0.85
const MAX_PITCH = 0.32

// Height of the narrowest point of the neck in the model's own units; everything above it is the head.
const NECK_Y = -0.09
const NECK_RADIUS = 0.2

// What the robot's shell reflects: a graphite room with a cloud-white window up and to the left
// and Crayn Blue glows low on either side.
function reflectionTexture(THREE) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')
  const sky = context.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#cbd5e1')
  sky.addColorStop(0.45, '#4b5563')
  sky.addColorStop(1, '#0b0f14')
  context.fillStyle = sky
  context.fillRect(0, 0, 512, 256)
  for (const [x, y, radius, color] of [
    [150, 60, 120, '248, 250, 252'],
    [400, 120, 110, '125, 163, 255'],
    [40, 170, 90, '125, 163, 255'],
  ]) {
    const light = context.createRadialGradient(x, y, 0, x, y, radius)
    light.addColorStop(0, `rgba(${color}, 1)`)
    light.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = light
    context.fillRect(0, 0, 512, 256)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Crayn Blue pool of light on the floor with a soft shadow where the robot stands.
function floorTexture(THREE) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')
  const pool = context.createRadialGradient(256, 256, 0, 256, 256, 256)
  pool.addColorStop(0, 'rgba(125, 163, 255, 0.75)')
  pool.addColorStop(0.5, 'rgba(125, 163, 255, 0.3)')
  pool.addColorStop(1, 'rgba(125, 163, 255, 0)')
  context.fillStyle = pool
  context.fillRect(0, 0, 512, 512)
  const shadow = context.createRadialGradient(256, 256, 0, 256, 256, 120)
  shadow.addColorStop(0, 'rgba(11, 15, 20, 0.9)')
  shadow.addColorStop(0.6, 'rgba(11, 15, 20, 0.55)')
  shadow.addColorStop(1, 'rgba(11, 15, 20, 0)')
  context.fillStyle = shadow
  context.fillRect(0, 0, 512, 512)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Robot beside the request form. Its head turns to follow the pointer anywhere on the page.
export default function RobotScene() {
  const mountRef = useRef(null)
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(DESKTOP)
    const onChange = () => setDesktop(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!desktop || !mount) return

    let disposed = false
    let cleanup = () => {}

    // three.js is heavy, so it only loads where the robot is shown.
    Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
    ]).then(async ([THREE, { GLTFLoader }]) => {
      const gltf = await new GLTFLoader().loadAsync(MODEL_URL)
      if (disposed) return

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const reflections = reflectionTexture(THREE)
      scene.environment = pmrem.fromEquirectangular(reflections).texture
      reflections.dispose()

      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const radius = sphere.radius
      model.position.sub(sphere.center)
      const robot = new THREE.Group()
      robot.add(model)
      scene.add(robot)

      // The model is one fused mesh, so it is cut at the neck: triangles above it become a head
      // that turns on its own, around a ball joint that covers the cut.
      let body
      model.traverse((node) => { if (node.isMesh) body ??= node })
      const whole = body.geometry
      const positions = whole.attributes.position
      const headIndex = []
      const bodyIndex = []
      for (let i = 0; i < whole.index.count; i += 3) {
        const a = whole.index.getX(i)
        const b = whole.index.getX(i + 1)
        const c = whole.index.getX(i + 2)
        const above = positions.getY(a) + positions.getY(b) + positions.getY(c) > NECK_Y * 3
        ;(above ? headIndex : bodyIndex).push(a, b, c)
      }
      const part = (index) => {
        const geometry = new THREE.BufferGeometry()
        Object.entries(whole.attributes).forEach(([name, attribute]) => geometry.setAttribute(name, attribute))
        geometry.setIndex(index)
        return geometry
      }
      body.geometry = part(bodyIndex)
      const neck = new THREE.Group()
      neck.position.set(0, NECK_Y, 0)
      const head = new THREE.Mesh(part(headIndex), body.material)
      head.position.y = -NECK_Y
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(NECK_RADIUS, 32, 16),
        new THREE.MeshStandardMaterial({ color: SILVER, metalness: 0.9, roughness: 0.3 }),
      )
      neck.add(head, joint)
      body.parent.add(neck)

      // Cloud-white key from the upper left, Crayn Blue rims from behind, silver fill from the right.
      scene.add(new THREE.HemisphereLight(CLOUD, GRAPHITE, 0.5))
      const key = new THREE.DirectionalLight(CLOUD, 1.6)
      key.position.set(-1.5, 2, 2.5)
      const fill = new THREE.DirectionalLight(SILVER, 0.5)
      fill.position.set(2.5, 0.5, 1.5)
      const rimRight = new THREE.DirectionalLight(CRAYN_BLUE, 4)
      rimRight.position.set(2.5, 1, -2.5)
      const rimLeft = new THREE.DirectionalLight(CRAYN_BLUE, 2.5)
      rimLeft.position.set(-2.5, -0.5, -2)
      const underglow = new THREE.PointLight(CRAYN_BLUE, 3, radius * 4)
      underglow.position.set(0, -radius * 1.1, radius * 0.6)
      // Blue light that hovers in front of the robot wherever the pointer is.
      const pointerLight = new THREE.PointLight(CRAYN_BLUE, 5, radius * 5)
      pointerLight.position.set(0, 0, radius * 1.4)
      scene.add(key, fill, rimRight, rimLeft, underglow, pointerLight)

      // Lit patch of floor with the robot's shadow on it.
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 1.8, radius * 1.8),
        new THREE.MeshBasicMaterial({ map: floorTexture(THREE), transparent: true, depthWrite: false, toneMapped: false }),
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.y = box.min.y - sphere.center.y - radius * 0.06
      scene.add(floor)

      const camera = new THREE.PerspectiveCamera(28, 1, radius * 0.1, radius * 40)
      const viewDirection = new THREE.Vector3(0, 0.2, 1).normalize()
      const target = new THREE.Vector3()

      const resize = () => {
        const { clientWidth: width, clientHeight: height } = mount
        if (!width || !height) return
        camera.aspect = width / height
        // Far enough back that the robot and the whole pool of light under it fit the narrower side of the frame.
        const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
        const fit = Math.min(Math.tan(halfFov), Math.tan(halfFov) * camera.aspect)
        target.set(0, -radius * 0.14, 0)
        camera.position.copy(viewDirection).multiplyScalar((radius * 1.04) / Math.sin(Math.atan(fit))).add(target)
        camera.lookAt(target)
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(mount)

      // Head look-at: aims at the pointer relative to where the head sits on screen.
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const aim = { yaw: 0, pitch: 0 }
      const current = { ...aim }
      const headScreen = new THREE.Vector3()

      const onPointerMove = (e) => {
        if (reducedMotion) return
        const rect = mount.getBoundingClientRect()
        neck.getWorldPosition(headScreen).project(camera)
        const headX = rect.left + ((headScreen.x + 1) / 2) * rect.width
        const headY = rect.top + ((1 - headScreen.y) / 2) * rect.height
        const dx = THREE.MathUtils.clamp((e.clientX - headX) / (window.innerWidth / 2), -1, 1)
        const dy = THREE.MathUtils.clamp((e.clientY - headY) / (window.innerHeight / 2), -1, 1)
        aim.yaw = dx * MAX_YAW
        aim.pitch = dy * MAX_PITCH
      }
      window.addEventListener('pointermove', onPointerMove)

      let frame = 0
      const render = (now) => {
        frame = requestAnimationFrame(render)
        current.yaw += (aim.yaw - current.yaw) * 0.08
        current.pitch += (aim.pitch - current.pitch) * 0.08
        neck.rotation.set(current.pitch, current.yaw, 0, 'YXZ')
        if (!reducedMotion) robot.position.y = Math.sin(now / 900) * radius * 0.025
        pointerLight.position.x = (current.yaw / MAX_YAW) * radius * 1.3
        pointerLight.position.y = (-current.pitch / MAX_PITCH) * radius
        renderer.render(scene, camera)
      }
      render(performance.now())
      setLoaded(true)

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('pointermove', onPointerMove)
        observer.disconnect()
        whole.dispose()
        scene.traverse((node) => {
          if (!node.isMesh) return
          node.geometry.dispose()
          Object.values(node.material).forEach((value) => { if (value?.isTexture) value.dispose() })
          node.material.dispose()
        })
        scene.environment.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [desktop])

  if (!desktop) return null

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`sticky top-28 h-[calc(100vh-10rem)] min-h-[480px] pointer-events-none drop-shadow-[0_0_28px_rgba(125,163,255,0.4)] transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}

