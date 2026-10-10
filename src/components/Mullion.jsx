import { useEffect, useId, useRef, useState } from 'react'

// Seconds each entry stays up when the list is left to play by itself.
const INTERVAL = 7

const pad = (n) => String(n).padStart(2, '0')

// A numbered list beside a framed picture. The current row opens to show its text and takes the
// frame's colour, running into it with rounded notches so row and frame read as one shape; the
// picture wipes over to match. Pointing at a row selects it. Left alone, the list plays through
// by itself, with a thin bar under the current row showing the time left; it waits while the
// pointer is over it or it is off screen.
// Items have `id`, `title`, `caption` (a node), `image` and optionally `link`.
export default function Mullion({ items, className = '' }) {
  const rootRef = useRef(null)
  const bars = useRef([])
  const rows = useRef([])
  const elapsed = useRef(0)
  const [current, setCurrent] = useState(0)
  const [inside, setInside] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const id = useId()
  const count = items.length

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.04 })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  // Each change of row restarts the countdown.
  useEffect(() => {
    elapsed.current = 0
    bars.current.forEach((bar) => { if (bar) bar.style.transform = 'scaleX(0)' })
  }, [current])

  useEffect(() => {
    if (inside || !onScreen || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let last = -1
    const step = (now) => {
      if (last < 0) last = now
      // Long gaps (a background tab) are not counted as viewing time.
      elapsed.current += Math.min(64, now - last)
      last = now
      const progress = Math.min(1, elapsed.current / (INTERVAL * 1000))
      const bar = bars.current[current]
      if (bar) bar.style.transform = `scaleX(${progress})`
      if (progress >= 1) setCurrent((index) => (index + 1) % count)
      else frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [inside, onScreen, current, count])

  const onKeyDown = (e) => {
    const target = {
      ArrowDown: current + 1, ArrowRight: current + 1, ArrowUp: current - 1, ArrowLeft: current - 1, Home: 0, End: count - 1,
    }[e.key]
    if (target === undefined) return
    e.preventDefault()
    const next = (target + count) % count
    setCurrent(next)
    rows.current[next]?.focus()
  }

  return (
    <div
      ref={rootRef}
      className={`mullion ${className}`}
      onMouseEnter={() => setInside(true)}
      onMouseLeave={() => setInside(false)}
    >
      <div className="mullion__list" role="tablist" aria-orientation="vertical" onKeyDown={onKeyDown}>
        {items.map((item, index) => {
          const on = index === current
          const Arrow = item.link ? 'a' : 'span'
          return (
            <div
              key={item.id}
              ref={(element) => { rows.current[index] = element }}
              role="tab"
              id={`${id}-row-${index}`}
              aria-selected={on}
              aria-controls={`${id}-frame`}
              tabIndex={on ? 0 : -1}
              className="mullion__row"
              onMouseEnter={() => setCurrent(index)}
              onClick={() => setCurrent(index)}
              onFocus={() => setCurrent(index)}
            >
              <div className="mullion__head">
                <span className="mullion__number">{pad(index + 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="mullion__title">{item.title}</span>
                    <Arrow
                      className="mullion__arrow"
                      href={item.link}
                      aria-label={item.link ? `${item.title} sayfasını aç` : undefined}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3.5 12h16.5M14 6l6 6-6 6" />
                      </svg>
                    </Arrow>
                  </div>
                  <div className="mullion__caption" inert={!on}>
                    <div>{item.caption}</div>
                  </div>
                </div>
              </div>
              <span className="mullion__timer" aria-hidden="true">
                <span ref={(element) => { bars.current[index] = element }} />
              </span>
            </div>
          )
        })}
      </div>

      <div className="mullion__frame">
        <div id={`${id}-frame`} role="tabpanel" aria-labelledby={`${id}-row-${current}`} className="mullion__view">
          {items.map((item, index) => (
            // Pictures before the current one are wiped away upwards, later ones wait below.
            <div key={item.id} className="mullion__slide" data-place={Math.sign(index - current)} aria-hidden={index !== current}>
              <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />
            </div>
          ))}
          <div className="mullion__scrim" aria-hidden="true" />
          <div className="mullion__plate">
            <div className="overflow-hidden min-w-0">
              {/* Keyed so the title rises in again on each change */}
              <div key={current} className="mullion__plate-title">{items[current].title}</div>
            </div>
            <div className="mullion__counter">{pad(current + 1)} / {pad(count)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
