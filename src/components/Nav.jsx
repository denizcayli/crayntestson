import { useEffect, useRef, useState } from 'react'
import { replayIntroOnNextLoad } from './Preloader.jsx'
import { isDarkBehind, watchBackdrop } from '../lib/backdrop.js'
import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'
import { LOGO_ICON_SMALL, LOGO_WORDMARK } from '../lib/site.js'

// Top bar with no background of its own: brand on the left, contact button and the menu toggle
// on the right. Each side picks light or dark lettering from what is behind it, so it stays
// readable over any section. The toggle's label swaps between "Menü" and "Kapat" and its two
// lines fold into a cross; the menu itself is driven from lib/siteAnimations.js.
export default function Nav() {
  const barRef = useRef(null)
  const brandRef = useRef(null)
  const actionsRef = useRef(null)
  const [brandOnDark, setBrandOnDark] = useState(true)
  const [actionsOnDark, setActionsOnDark] = useState(true)

  useEffect(() => {
    const centreIsDark = (element) => {
      const rect = element.getBoundingClientRect()
      return isDarkBehind(rect.left + rect.width / 2, rect.top + rect.height / 2, barRef.current)
    }
    const update = () => {
      setBrandOnDark(centreIsDark(brandRef.current))
      setActionsOnDark(centreIsDark(actionsRef.current))
    }
    const unwatch = watchBackdrop(update)
    // Pages finish laying out a moment after the route changes.
    const settle = setTimeout(update, 400)
    return () => {
      clearTimeout(settle)
      unwatch()
    }
  }, [])

  return (
    <header ref={barRef} className="site-bar">
      <a
        ref={brandRef}
        href={withBase('/')}
        onClick={replayIntroOnNextLoad}
        aria-label={t("Crayn AI ana sayfa")}
        className="site-bar__side site-bar__brand"
        data-on={brandOnDark ? 'dark' : 'light'}
      >
        <img src={LOGO_ICON_SMALL} alt="" className="size-8 md:size-9" />
        {/* The wordmark file is white; over light sections it is shown in black */}
        <img src={LOGO_WORDMARK} alt="Crayn AI" className="site-bar__wordmark h-[10px] sm:h-[15px] md:h-[18px] w-auto" />
      </a>
      <div ref={actionsRef} className="site-bar__side flex items-center gap-2 md:gap-6" data-on={actionsOnDark ? 'dark' : 'light'}>
        <a href={withBase('/talep')} className="site-bar__contact group">
          <span>{t("Bize Ulaşın")}</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
        <button type="button" id="menu-toggle" className="menu-toggle" aria-label={t("Menü")} aria-expanded="false" aria-controls="full-menu">
          <span className="menu-toggle__label" aria-hidden="true">
            <span>{t("Menü")}</span>
            <span>{t("Kapat")}</span>
          </span>
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  )
}
