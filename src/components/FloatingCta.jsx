import { useEffect, useRef, useState } from 'react'
import LiquidLogo from './LiquidLogo.jsx'
import { introFinished } from './Preloader.jsx'
import { isDarkBehind, watchBackdrop } from '../lib/backdrop.js'
import { withBase } from '../lib/paths.js'
import { LOGO_ICON_SMALL } from '../lib/site.js'
import { PATHNAME } from '../lib/route.js'
import { t } from '../lib/text.js'

// Fixed round call-to-action in frosted glass: pops in on load, turns with the page scroll and
// switches between light and dark lettering to stay readable over whatever is behind it.
export default function FloatingCta() {
  const ref = useRef(null)
  const [onDark, setOnDark] = useState(true)
  // Starting the metal logo is heavy, so it waits for the intro and then for the visitor's first
  // move (a scroll, a touch, the pointer, a key) and a quiet moment after it; the plain icon
  // stands in until then.
  const [metal, setMetal] = useState(false)
  useEffect(() => {
    const whenIdle = window.requestIdleCallback ?? ((run) => setTimeout(run, 200))
    const signs = ['scroll', 'pointermove', 'touchstart', 'keydown']
    const start = () => {
      signs.forEach((sign) => window.removeEventListener(sign, start))
      whenIdle(() => setMetal(true))
    }
    introFinished.then(() => signs.forEach((sign) => window.addEventListener(sign, start, { passive: true })))
    return () => signs.forEach((sign) => window.removeEventListener(sign, start))
  }, [])
  const hidden = PATHNAME === '/talep'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const turns = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // The turn follows the scroll frame by frame; the look behind the button does not need to.
    let frame = 0
    const turn = () => {
      frame = 0
      el.style.setProperty('--fab-rot', `${window.scrollY * 0.08}deg`)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(turn) }
    if (turns) {
      turn()
      window.addEventListener('scroll', schedule, { passive: true })
    }
    const unwatch = watchBackdrop(() => {
      const rect = el.getBoundingClientRect()
      setOnDark(isDarkBehind(rect.left + rect.width / 2, rect.top + rect.height / 2, el))
    })
    return () => {
      window.removeEventListener('scroll', schedule)
      if (frame) cancelAnimationFrame(frame)
      unwatch()
    }
  }, [hidden])

  if (hidden) return null

  return (
    <a
      ref={ref}
      href={withBase('/talep')}
      aria-label={t('Proje başlat, bize ulaşın')}
      style={{ rotate: 'var(--fab-rot, 0deg)' }}
      className={`fixed bottom-6 right-4 lg:bottom-8 lg:right-8 z-[45] size-[76px] lg:size-[104px] rounded-full border shadow-lg backdrop-blur-md backdrop-saturate-150 transition-[filter,background-color,border-color,color,transform] duration-300 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crayn ${onDark ? 'border-white/30 bg-white/10 text-white' : 'border-graphite/15 bg-cloud/60 text-graphite'}`}
    >
      <span className="fab-pop relative block size-full">
        <svg viewBox="0 0 160 160" className="block size-full" aria-hidden="true">
          <defs>
            <path id="floating-cta-text-path" d="M 80,23 a 57,57 0 1,1 0,114 a 57,57 0 1,1 0,-114" />
          </defs>
          <text fill="currentColor" style={{ fontSize: '15px', fontWeight: 800 }}>
            <textPath href="#floating-cta-text-path" textLength="352" lengthAdjust="spacing">
              {t('PROJE BAŞLAT • BİZE ULAŞIN •')}
            </textPath>
          </text>
          {/* Light plate so the logo's dark bands stay visible on dark pages */}
          <circle cx="80" cy="80" r="47" fill="#F8FAFC" fillOpacity="0.92" />
        </svg>
        <span className="absolute left-1/2 top-1/2 size-[54%] -translate-x-1/2 -translate-y-1/2">
          {metal ? <LiquidLogo /> : <img src={LOGO_ICON_SMALL} alt="" className="size-full" />}
        </span>
      </span>
    </a>
  )
}
