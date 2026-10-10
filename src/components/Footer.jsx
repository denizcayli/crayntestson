import LiquidLogo from './LiquidLogo.jsx'
import SocialLinks from './SocialLinks.jsx'
import { SOCIALS } from '../data/socials.js'
import { withBase } from '../lib/paths.js'
import { FOOTER_MENUS, LOGO_ICON, LOGO_WORDMARK, MAIL_HREF, PHONE_HREF, SITE } from '../lib/site.js'

// Link whose label rolls up on hover, replaced by a copy coming from below.
function RollLink({ href, children }) {
  return (
    <a href={href} className="roll-link">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </a>
  )
}

// Light panel, full width, with blurred copies of the Crayn mark slowly breathing behind its
// content.
export default function Footer() {
  return (
    <footer>
      <div className="footer-panel">
        <img src={LOGO_ICON} alt="" aria-hidden="true" loading="lazy" decoding="async" className="footer-mark footer-mark--left" />
        <img src={LOGO_ICON} alt="" aria-hidden="true" loading="lazy" decoding="async" className="footer-mark footer-mark--right" />
        <img src={LOGO_ICON} alt="" aria-hidden="true" loading="lazy" decoding="async" className="footer-mark footer-mark--centre" />

        <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex max-w-xs flex-col items-start gap-5">
            <a href={withBase('/')} aria-label="Crayn AI ana sayfa" className="flex items-center gap-3">
              <span className="block size-16 -ml-1.5">
                <LiquidLogo />
              </span>
              {/* The wordmark file is white; on this light footer it is shown in black */}
              <img src={LOGO_WORDMARK} alt="Crayn AI" className="h-[18px] w-auto brightness-0" />
            </a>
            <p className="text-sm leading-relaxed text-slate-brand">
              {SITE.footerText}
            </p>
            {/* Address and number, with the social buttons beside them */}
            <div className="flex items-center gap-5">
              <ul className="flex flex-col gap-1 text-sm font-semibold text-graphite">
                <li>
                  <a href={MAIL_HREF} className="flex items-center gap-2.5 transition-colors hover:text-[#3b5fb5]">
                    <svg className="size-4 text-slate-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
                    </svg>
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a href={PHONE_HREF} className="flex items-center gap-2.5 transition-colors hover:text-[#3b5fb5]">
                    <svg className="size-4 text-slate-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A15 15 0 014 5a1 1 0 011-1z" />
                    </svg>
                    {SITE.phone}
                  </a>
                </li>
              </ul>
              <SocialLinks links={SOCIALS} className="social-links--light" />
            </div>
          </div>
          <nav aria-label="Alt menü" className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:gap-x-24">
            {FOOTER_MENUS.map((column) => (
              <div key={column.title}>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-brand/70">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-2 text-sm font-medium text-graphite">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <RollLink href={link.href}>{link.label}</RollLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative z-10 h-px bg-graphite/10" />

        <div className="relative z-10 flex flex-col gap-2 pb-20 text-xs text-slate-brand md:flex-row md:items-center md:justify-between md:pb-0 md:pr-36">
          <p>{SITE.copyright}</p>
          <p>{SITE.footerNote}</p>
        </div>
      </div>
    </footer>
  )
}
