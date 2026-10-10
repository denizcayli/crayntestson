import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'
import HandWrite from '../components/HandWrite.jsx'

gsap.registerPlugin(ScrollTrigger)

const STAR = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6-4.8-4.6 6.6-.9z'

export default function References({ heading, text, card_brand, card_title, card_caption, items }) {
  // Shown twice over: with only four cards the slider's endless loop runs out of slides to wrap.
  const slides = [...items, ...items]

  const rowRef = useRef(null)
  const swiperRef = useRef(null)

  useEffect(() => {
    const row = rowRef.current
    const card = row.querySelector('.trust-card')
    const slider = row.querySelector('.trust-slider')

    const swiper = new Swiper(slider, {
      modules: [Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 10,
      loop: true,
      // Lets the arrows be clicked again before the previous slide has settled.
      loopPreventsSliding: false,
      speed: 900,
      grabCursor: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
    })
    swiperRef.current = swiper

    // Entrance: the brand card starts wide in the middle of the row, then slides to the left
    // edge while the testimonials fade in beside it.
    const media = gsap.matchMedia()
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 75%', once: true } })
        .from(card, { flexBasis: '52%', marginLeft: '24%', duration: 1.1, ease: 'power3.inOut' })
        .from(slider, { opacity: 0, x: 80, duration: 0.9, ease: 'power3.out' }, '-=0.7')
    })

    return () => {
      media.revert()
      swiper.destroy(true, true)
    }
  }, [])

  return (
    <section id="referanslar" className="bg-[#e6ebf2] text-graphite px-6 pt-[100px] pb-20 overflow-hidden">
      <div className="mb-10 md:mb-[62px] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[42px] md:text-[62px] font-bold uppercase leading-[1.2]">
            <HandWrite text={heading} />
          </h2>
          <p className="mt-3 max-w-[460px] text-base md:text-lg leading-[1.6] text-slate-brand">
            {text}
          </p>
        </div>
        <div>
          <div className="flex gap-2.5">
            <button type="button" aria-label="Önceki yorum" className="trust-arrow" onClick={() => swiperRef.current?.slidePrev()}>
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
              </svg>
            </button>
            <button type="button" aria-label="Sonraki yorum" className="trust-arrow" onClick={() => swiperRef.current?.slideNext()}>
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div ref={rowRef} className="flex flex-col gap-2.5 lg:h-[500px] lg:flex-row">
        <div className="trust-card flex h-[340px] shrink-0 flex-col items-center justify-center gap-8 rounded-xl bg-graphite p-6 text-center text-cloud lg:h-auto lg:basis-[35.5%]">
          <span className="text-3xl font-extrabold tracking-tighter">{card_brand}</span>
          <h3 className="max-w-[14em] text-[26px] md:text-[32px] leading-[1.2]">
            {card_title}
          </h3>
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <svg key={index} viewBox="0 0 24 24" className="size-6 fill-crayn">
                  <path d={STAR} />
                </svg>
              ))}
            </div>
            <strong className="text-lg text-silver">{card_caption}</strong>
          </div>
        </div>
        <div className="trust-slider swiper w-full min-w-0 flex-1 cursor-grab active:cursor-grabbing">
          <div className="swiper-wrapper">
            {slides.map((item, index) => (
              <figure key={index} className="swiper-slide !flex !h-[420px] !w-[min(440px,84vw)] flex-col justify-between rounded-xl border border-graphite/10 bg-white p-6 lg:!h-[500px]">
                <div className="flex flex-col gap-6">
                  <svg viewBox="0 0 62 33" className="h-[33px] w-[62px]" aria-hidden="true">
                    <path d="M12 0h16L16 33H0zM46 0h16L50 33H34z" fill="#7DA3FF" />
                  </svg>
                  <blockquote className="text-lg md:text-xl leading-[1.4]">“{item.text}”</blockquote>
                </div>
                <figcaption className="flex items-center gap-4">
                  <img src={item.image} alt="" loading="lazy" className="size-[45px] rounded-full object-cover" />
                  <span>
                    <span className="block text-base">{item.name}</span>
                    <span className="block text-sm tracking-[-0.04em] text-slate-brand">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
