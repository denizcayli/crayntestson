import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import LiquidLogo from './LiquidLogo.jsx'

const SEEN_KEY = 'crayn-intro-seen'

// Seconds: when the logo starts to grow, and how long it takes to open the page.
const OPEN_AT = 1.4
const OPEN_DURATION = 1.6

// Outline of the logo with its hollows filled in, as fractions of its box measured from the
// centre. The opening in the screen has this shape, and the logo sits in it like in a frame.
const OUTLINE = [
  [-0.438, -0.148], [-0.434, -0.18], [-0.416, -0.223], [-0.396, -0.246], [-0.373, -0.266], [-0.34, -0.289],
  [-0.188, -0.391], [-0.104, -0.445], [-0.072, -0.461], [-0.045, -0.469], [-0.016, -0.473], [0.021, -0.473],
  [0.057, -0.465], [0.09, -0.449], [0.125, -0.43], [0.186, -0.395], [0.357, -0.293], [0.387, -0.273],
  [0.41, -0.25], [0.43, -0.215], [0.436, -0.188], [0.436, -0.16], [0.434, 0.176], [0.428, 0.203],
  [0.414, 0.23], [0.391, 0.258], [0.357, 0.281], [0.17, 0.398], [0.094, 0.445], [0.068, 0.457],
  [0.025, 0.469], [-0.035, 0.469], [-0.078, 0.457], [-0.17, 0.402], [-0.225, 0.367], [-0.291, 0.324],
  [-0.355, 0.281], [-0.381, 0.262], [-0.404, 0.238], [-0.422, 0.211], [-0.432, 0.184],
]
// Radius of the largest circle around the centre that fits in the logo's hollow, as a fraction
// of its box: how far the logo must grow before the hollow has cleared the whole screen.
const HOLLOW_RADIUS = 0.115

// The metal is drawn this many times larger than shown, so it stays sharp for longer as it grows.
const DETAIL = 4

// Number of straight segments the zoom's curve is cut into.
const ZOOM_STEPS = 32

// Only the first page load of a visit gets the intro; reloads and later pages skip it.
function firstVisit() {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage unavailable: show the intro.
  }
  return true
}

// Makes the next page load play the intro again (the nav logo does this before going home).
export function replayIntroOnNextLoad() {
  try {
    sessionStorage.removeItem(SEEN_KEY)
  } catch {
    // Storage unavailable: the intro plays on every load anyway.
  }
}

const show = firstVisit()
const startedAt = performance.now()

// Settles when the intro has finished (at once if it is not shown), for work that can wait for it.
let resolveIntro
export const introFinished = new Promise((resolve) => { resolveIntro = resolve })
if (!show) resolveIntro()

// Seconds left until the page is mostly uncovered, so page entrances can wait for it.
export function preloaderRemaining() {
  if (!show) return 0
  return Math.max(0, startedAt / 1000 + OPEN_AT + OPEN_DURATION * 0.6 - performance.now() / 1000)
}

const PLUG_SHAPE = `polygon(${OUTLINE.map(([x, y]) => `${((x + 0.5) * 100).toFixed(1)}% ${((y + 0.5) * 100).toFixed(1)}%`).join(', ')})`

// Intro shown on the first visit: the logo in liquid metal sits in the middle of the screen
// between two labels. Then the whole screen zooms in on the logo: the logo grows, the page shows
// through its hollow centre, and the hollow widens until the page fills the view.
export default function Preloader() {
  const rootRef = useRef(null)
  const slotRef = useRef(null)
  const screenRef = useRef(null)
  const [done, setDone] = useState(!show)

  // The screen has an opening where the logo sits (plugged until the zoom starts), and the zoom
  // is centred on it. Both follow the logo's position if the window is resized.
  useLayoutEffect(() => {
    if (!show) return
    const place = () => {
      // Once the intro has gone there is nothing left to place.
      if (!slotRef.current) return
      const box = slotRef.current.getBoundingClientRect()
      const centreX = box.left + box.width / 2
      const centreY = box.top + box.height / 2
      const outline = OUTLINE.map(([x, y]) => `${(centreX + x * box.width).toFixed(1)}px ${(centreY + y * box.width).toFixed(1)}px`)
      screenRef.current.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${outline.join(', ')}, ${outline[0]})`
      rootRef.current.style.transformOrigin = `${centreX}px ${centreY}px`
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // Every movement here is a transform or opacity animation handed to the browser, so it keeps
  // running smoothly while the page behind is still busy starting up.
  useEffect(() => {
    if (!show) return
    const root = rootRef.current
    const running = []
    const finish = () => {
      resolveIntro()
      setDone(true)
    }

    const open = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const fade = root.animate({ opacity: [1, 0] }, { duration: 400, fill: 'forwards' })
        running.push(fade)
        fade.finished.then(finish, () => {})
        return
      }
      const box = slotRef.current.getBoundingClientRect()
      const centreX = box.left + box.width / 2
      const centreY = box.top + box.height / 2
      const reach = Math.hypot(
        Math.max(centreX, window.innerWidth - centreX),
        Math.max(centreY, window.innerHeight - centreY),
      )
      const growth = (reach / (HOLLOW_RADIUS * box.width)) * 1.05
      // Growing by a constant factor per unit of time reads as a steady zoom; the steps ease in
      // and out of that.
      const frames = Array.from({ length: ZOOM_STEPS + 1 }, (_, step) => {
        const t = step / ZOOM_STEPS
        const eased = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) ** 2
        return { transform: `scale(${(growth ** eased).toFixed(4)})` }
      })
      const zoom = root.animate(frames, { duration: OPEN_DURATION * 1000, easing: 'linear', fill: 'forwards' })
      const unplug = root.querySelector('.preloader-plug').animate({ opacity: [1, 0] }, { duration: 350, fill: 'forwards' })
      running.push(zoom, unplug)
      zoom.finished.then(finish, () => {})
    }

    const timer = setTimeout(open, OPEN_AT * 1000)
    return () => {
      clearTimeout(timer)
      running.forEach((animation) => animation.cancel())
    }
  }, [])

  if (done) return null

  return (
    <div ref={rootRef} className="preloader" role="status" aria-label="Yükleniyor">
      <div ref={screenRef} className="preloader-screen" />
      <div className="preloader-label preloader-label--left">©2026</div>
      <div ref={slotRef} className="preloader-slot">
        <div className="preloader-plug" style={{ clipPath: PLUG_SHAPE }} />
        <div className="preloader-logo">
          <div className="preloader-metal" style={{ width: `${DETAIL * 100}%`, height: `${DETAIL * 100}%`, scale: 1 / DETAIL }}>
            <LiquidLogo />
          </div>
        </div>
      </div>
      <div className="preloader-label preloader-label--right">CraynAI</div>
    </div>
  )
}
