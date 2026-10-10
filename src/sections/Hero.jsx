import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroPearls from '../components/HeroPearls.jsx'
import { preloaderRemaining } from '../components/Preloader.jsx'
import { link, lines, list } from '../lib/content.js'

gsap.registerPlugin(ScrollTrigger)

// How far the page scrolls with the hero held in place while its backdrop comes into focus.
const FOCUS_SCROLL = '+=80%'

export default function Hero({ heading, strong, kicker, primary_label, primary_href, secondary_label, secondary_href }) {
  // One entry per line on wide screens; narrow screens let the words wrap freely.
  const headingLines = lines(heading)
  // The words that carry the message are set semibold; the rest stay light.
  const strongWords = new Set(list(strong))
  const weightOf = (word) => (strongWords.has(word) ? 'font-semibold' : 'font-light')

  const rootRef = useRef(null)
  const revealRef = useRef(null)
  // How unfocused the backdrop is: 1 at the top of the page, 0 once it has been scrolled into focus.
  const blurRef = useRef(1)

  // Entrance, once the preloader starts clearing: heading words rise in one after another,
  // then the supporting copy fades up.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: preloaderRemaining() + 0.15 })
        .to('.hero-title-word', { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' })
        .to('.hero-fade', { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
        .set(revealRef.current, { visibility: 'visible' })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The hero stays put for a short scroll while the backdrop sharpens, then scrolls away.
  useEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: FOCUS_SCROLL,
        pin: true,
        onUpdate: ({ progress }) => { blurRef.current = 1 - progress },
      })
    })
    return () => media.revert()
  }, [])

  return (
    <section ref={rootRef} className="hero relative isolate w-full min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden px-6 py-28">
      <HeroPearls revealRef={revealRef} blurRef={blurRef} />
      <div className="hero-heading relative z-10 text-center uppercase">
        <h1>
          {headingLines.map((line) => (
            <span key={line} className="md:block">
              {line.split(' ').flatMap((word) => [
                <span key={word} className={`hero-title-word ${weightOf(word)}`}>{word}</span>,
                ' ',
              ])}
            </span>
          ))}
        </h1>
        {/* Coloured copy of the heading, shown only where a pearl passes over it */}
        <div ref={revealRef} aria-hidden="true" className="hero-reveal absolute inset-0 invisible">
          {headingLines.map((line) => (
            <span key={line} className="md:block">
              {line.split(' ').flatMap((word) => [
                <span key={word} className={weightOf(word)}>{word}</span>,
                ' ',
              ])}
            </span>
          ))}
        </div>
      </div>
      <p className="hero-kicker hero-fade relative z-10 mx-auto max-w-[44rem] text-center font-light">
        {kicker}
      </p>
      <div className="hero-fade hero-cta relative z-10 flex flex-wrap items-stretch justify-center gap-3">
        <a href={link(primary_href)} className="magnet-pill magnet-pill--logo">
          <span className="magnet-pill__face">{primary_label}</span>
        </a>
        <a href={link(secondary_href)} className="hero-pill">
          <span className="hero-pill__label">{secondary_label}</span>
          <svg className="hero-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14m-6-6 6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  )
}
