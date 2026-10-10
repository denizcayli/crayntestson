import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Timings in milliseconds.
const START_DELAY = 400
const TYPE_SPEED = 45
const DELETE_SPEED = 30
const PAUSE_AFTER_TYPE = 900
const PAUSE_AFTER_DELETE = 300
// Extra wait after punctuation, so the typing has the rhythm of someone thinking.
const PAUSES = { ',': 140, ';': 140, '.': 320, '!': 320, '?': 320, '…': 520, '\n': 260 }
// How many of the most recent letters carry the coloured trail while typing.
const TRAIL = 3

// Types each text letter by letter with a blinking block caret, holds it, deletes it and moves
// on to the next one. Freshly typed letters leave a coloured trail; a finished text turns fully
// coloured. "\n" in a text starts a new line. Typing waits while the element is off screen.
// `label` is what assistive technology reads instead of the changing letters.
export default function Typewriter({ texts, label = texts[0].replace(/\n/g, ' '), className = '' }) {
  const rootRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState('waiting')
  const [inView, setInView] = useState(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: ({ isActive }) => setInView(isActive),
    })
    return () => trigger.kill()
  }, [])

  const text = texts[index]

  useEffect(() => {
    if (reducedMotion || !inView) return
    const after = (delay, action) => {
      const timer = setTimeout(action, delay)
      return () => clearTimeout(timer)
    }
    if (phase === 'waiting') return after(START_DELAY, () => setPhase('typing'))
    if (phase === 'typing') {
      if (typed.length >= text.length) return after(0, () => setPhase('holding'))
      const previous = typed[typed.length - 1]
      return after(TYPE_SPEED + (PAUSES[previous] ?? 0), () => setTyped(text.slice(0, typed.length + 1)))
    }
    if (phase === 'holding') return after(PAUSE_AFTER_TYPE, () => setPhase('deleting'))
    if (phase === 'deleting') {
      if (typed.length) return after(DELETE_SPEED, () => setTyped(typed.slice(0, -1)))
      return after(PAUSE_AFTER_DELETE, () => {
        setIndex((index + 1) % texts.length)
        setPhase('typing')
      })
    }
  }, [phase, typed, text, index, texts.length, inView, reducedMotion])

  const shown = reducedMotion ? text : typed
  const complete = reducedMotion || phase === 'holding'
  const lines = shown.split('\n')

  return (
    <span ref={rootRef} aria-label={label} className={`typewriter ${className}`}>
      {/* Invisible copies of every text keep the height steady while the letters come and go */}
      {texts.map((ghost) => (
        <span key={ghost} aria-hidden="true" className="typewriter__ghost">{ghost}</span>
      ))}
      <span aria-hidden="true" className="typewriter__live">
        {lines.map((line, lineIndex) => {
          const active = lineIndex === lines.length - 1
          const trail = active && phase === 'typing' ? Math.min(TRAIL, line.length) : 0
          return (
            <span key={lineIndex} className="typewriter__line">
              <span className={`typewriter__text ${complete ? 'is-complete' : ''}`}>
                {line.slice(0, line.length - trail)}
                {trail > 0 && <span className="typewriter__trail">{line.slice(-trail)}</span>}
              </span>
              {active && !reducedMotion && <span className="typewriter__caret" />}
            </span>
          )
        })}
      </span>
    </span>
  )
}
