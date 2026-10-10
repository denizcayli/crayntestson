import { useEffect, useState } from 'react'
import AuroraFlow from './AuroraFlow.jsx'
import SocialLinks from './SocialLinks.jsx'
import { SOCIALS } from '../data/socials.js'
import { MAIL_HREF, MAIN_MENU, PHONE_HREF, SITE } from '../lib/site.js'
import { t } from '../lib/text.js'

// Full-screen menu: a dark sheet with slow ribbons of light flowing behind it, opening in a
// circle from the toggle. The links come
// in one after another out of a blur; pointing at one nudges it forward and dims the rest.
// Opening and closing are driven from lib/siteAnimations.js.
export default function FullMenu() {
  // The light behind the menu costs a WebGL scene, so it is set up when the visitor first
  // reaches for the menu button rather than on every page load.
  const [wanted, setWanted] = useState(false)
  useEffect(() => {
    const toggle = document.getElementById('menu-toggle')
    if (!toggle) return setWanted(true)
    const want = () => setWanted(true)
    const signs = ['pointerenter', 'pointerdown', 'focus', 'click']
    signs.forEach((sign) => toggle.addEventListener(sign, want, { once: true }))
    return () => signs.forEach((sign) => toggle.removeEventListener(sign, want))
  }, [])

  return (
    <div id="full-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menü" style={{ display: 'none' }}>
      {wanted && <AuroraFlow background="#05070a" color1="#7da3ff" color2="#33507f" intensity={0.42} speed={0.7} pointerSpeed={0.35} className="!fixed pointer-events-none" />}
      <div className="menu-overlay__body">
        <nav aria-label="Ana menü">
          <ul className="menu-overlay__links">
            {MAIN_MENU.map((link, index) => (
              <li key={link.label} className="menu-list-item">
                <a href={link.href} className="menu-link-item">
                  <span className="menu-link-item__number">{String(index + 1).padStart(2, '0')}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-overlay__info">
          <div className="menu-info-item">
            <span className="menu-overlay__caption">{t('İletişim Kurun')}</span>
            <a href={MAIL_HREF} className="menu-overlay__contact text-2xl md:text-3xl font-bold">
              {SITE.email}
              <span className="menu-overlay__underline" />
            </a>
            <a href={PHONE_HREF} className="menu-overlay__contact mt-2 text-base font-semibold text-white/60">
              {SITE.phone}
              <span className="menu-overlay__underline" />
            </a>
          </div>
          <div className="menu-info-item">
            <span className="menu-overlay__caption">{t('Merkez')}</span>
            <p className="max-w-[250px] leading-relaxed text-white/60">
              {SITE.address}
            </p>
          </div>
          <div className="menu-info-item">
            <SocialLinks links={SOCIALS} />
          </div>
        </div>
      </div>
      <p className="menu-overlay__note menu-info-item">{SITE.menuNote}</p>
    </div>
  )
}
