import { useEffect, useRef } from 'react'

// Soft discs of light that wander slowly around their container: every few seconds each one is
// sent off towards a new random spot. Fills its positioned parent. `colors` is a list of
// [colour, how many discs]; `seconds` is how long one move takes.
export default function Halo({ colors, size = 320, blur = 90, seconds = 14, className = '' }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const discs = [...root.children]
    const scatter = () => {
      const { clientWidth: width, clientHeight: height } = root
      for (const disc of discs) {
        // Discs may hang half-way over the edges, so the light reaches the corners too.
        const x = Math.random() * width - size / 2
        const y = Math.random() * height - size / 2
        disc.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`
      }
    }

    // Start already spread out, without the discs flying in from the corner.
    discs.forEach((disc) => { disc.style.transition = 'none' })
    scatter()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timer = 0
    const start = () => {
      if (timer) return
      discs.forEach((disc) => { disc.style.transition = `transform ${seconds}s ease-in-out` })
      scatter()
      timer = setInterval(scatter, seconds * 1000)
    }
    const stop = () => {
      clearInterval(timer)
      timer = 0
    }
    // Only wander while on screen.
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    observer.observe(root)
    return () => {
      observer.disconnect()
      stop()
    }
  }, [size, seconds])

  return (
    <div ref={rootRef} aria-hidden="true" className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {colors.flatMap(([color, count]) => Array.from({ length: count }, (_, index) => (
        <span
          key={`${color}-${index}`}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={{ width: size, height: size, background: color, filter: `blur(${blur}px)` }}
        />
      )))}
    </div>
  )
}
