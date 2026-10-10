import { useEffect } from 'react'
import Nav from './Nav.jsx'
import FullMenu from './FullMenu.jsx'
import Footer from './Footer.jsx'
import FloatingCta from './FloatingCta.jsx'
import PlanCard from './PlanCard.jsx'
import { findService } from '../data/services.js'
import { PATHNAME as pathname, SLUG } from '../lib/route.js'
import { initSiteAnimations } from '../lib/siteAnimations.js'
import { initGlassButtons } from '../lib/glassButtons.js'
import { initMagnetPills } from '../lib/magnetPills.js'

export default function Layout({ children }) {
  useEffect(() => initSiteAnimations(), [])

  useEffect(() => initGlassButtons(), [])
  useEffect(() => initMagnetPills(), [])

  // On a service's own page the request card starts with that service chosen.
  const service = pathname.startsWith('/hizmetler/') ? findService(SLUG)?.title ?? '' : ''

  return (
    <>
      <Nav />
      <FullMenu />
      {children}
      <Footer />
      <FloatingCta />
      {/* The request form's own page does not need an invitation to it */}
      {pathname !== '/talep' && <PlanCard service={service} />}
    </>
  )
}
