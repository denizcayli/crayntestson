import { useEffect } from 'react'
import Hero from '../sections/Hero.jsx'
import Diagnostic from '../sections/Diagnostic.jsx'
import Services from '../sections/Services.jsx'
import Solutions from '../sections/Solutions.jsx'
import References from '../sections/References.jsx'
import About from '../sections/About.jsx'
import Blog from '../sections/Blog.jsx'
import Cta from '../sections/Cta.jsx'
import { PAGE_SECTIONS, pageContent } from '../lib/content.js'

const SECTIONS = { hero: Hero, diagnostic: Diagnostic, services: Services, solutions: Solutions, references: References, about: About, blog: Blog, cta: Cta }

// The sections as ordered in the panel; without a panel, all of them in the approved order.
const ORDER = PAGE_SECTIONS?.filter((section) => SECTIONS[section.type]) ?? Object.keys(SECTIONS).map((type) => ({ type }))

export default function Home() {
  // Arriving from another page with /#section: the target only exists after render.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      {ORDER.map((section, index) => {
        const Section = SECTIONS[section.type]
        return <Section key={index} {...pageContent(section.type, section.props)} />
      })}
    </>
  )
}
