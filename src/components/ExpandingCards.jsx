import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { t } from '../lib/text.js'

gsap.registerPlugin(ScrollTrigger)

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

// Accordion of image cards: one is open and wide, the rest are narrow strips showing only their
// number and icon. Hovering, focusing or tapping a card opens it. On small screens they stack.
// On wide screens the enclosing section also holds still at the top of the viewport for a short
// scroll that opens the cards in turn; `className` sizes the row (the section decides its height).
// Items have `number`, `label`, `title`, `text`, `image` and optionally `icon`, `tags` and a card
// `color`; `contain` shows the image whole (artwork) instead of filling the card (photo). An item
// with an `href` goes there when its open card is pressed.
// `scrollLength` is how much scrolling the whole walkthrough takes.
export default function ExpandingCards({ items, className = '', scrollLength = '+=100%' }) {
  const rootRef = useRef(null)
  const [active, setActive] = useState(0)
  // Whether the card being pressed was already open when the press began. A tap on a touch
  // screen opens the card first, so only a press on an open card follows its link.
  const pressedOpen = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const media = gsap.matchMedia()
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      let step = 0
      const section = root.closest('section')
      ScrollTrigger.create({
        trigger: section,
        pin: section,
        start: 'top top',
        end: scrollLength,
        onUpdate: ({ progress }) => {
          const next = Math.min(items.length - 1, Math.floor(progress * items.length))
          // Only a change of step moves the cards, so a card opened by hover stays open meanwhile.
          if (next !== step) {
            step = next
            setActive(next)
          }
        },
      })
    })
    return () => media.revert()
  }, [items.length, scrollLength])

  return (
    <div ref={rootRef} className={`flex flex-col md:flex-row gap-2.5 ${className}`}>
      {items.map((item, index) => {
        const open = index === active
        return (
          <button
            key={item.number}
            type="button"
            aria-expanded={open}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onPointerDown={() => { pressedOpen.current = open }}
            onClick={(event) => {
              // Keyboard activation has no press; the card is open by then, having taken focus.
              const follow = item.href && (event.detail === 0 || pressedOpen.current)
              if (follow) window.location.assign(item.href)
              else setActive(index)
            }}
            style={{ backgroundColor: item.color }}
            className={`group relative overflow-hidden rounded-[10px] bg-[#111] text-left text-white shrink-0 md:shrink md:basis-0 transition-[flex-grow,height] duration-700 ${EASE} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-full ${open ? 'grow-[5] h-[460px]' : 'grow h-16'}`}
          >
            {/* Fixed size, centred: the image does not rescale while the card grows */}
            <img
              src={item.image}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute left-1/2 max-w-none -translate-x-1/2 transition-opacity duration-700 ${item.contain ? 'top-[14%] h-[44%] w-auto object-contain' : 'top-0 h-full w-[1400px] object-cover'} ${open ? 'opacity-100' : 'opacity-80'}`}
            />
            <span className={`absolute inset-0 bg-gradient-to-t ${item.contain ? 'from-black/60 to-transparent' : 'from-black/85 via-black/45 to-black/45'}`} />

            <span className={`absolute top-4 text-sm font-semibold tracking-widest transition-all duration-500 ${open ? 'left-4' : 'left-4 md:left-1/2 md:-translate-x-1/2'}`}>
              {item.number}
              <span className={`ml-2 text-white/70 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 md:hidden'}`}>{item.label}</span>
            </span>
            {/* Stacked layout: a closed card is a single row with its title */}
            <span className={`absolute top-5 left-14 right-4 truncate text-sm font-semibold md:hidden ${open ? 'hidden' : ''}`}>
              {item.title}
            </span>

            <span className={`absolute bottom-4 left-1/2 hidden -translate-x-1/2 transition-opacity duration-300 md:block ${open ? 'opacity-0' : 'opacity-100'}`}>
              {item.icon}
            </span>
            {/* Fixed width so the text does not reflow while the card grows */}
            <span className={`absolute bottom-4 left-4 w-[min(440px,calc(100vw-5rem))] transition-opacity duration-500 ${open ? 'opacity-100 delay-200' : 'opacity-0'}`}>
              <span className="flex items-center gap-2.5">
                {item.icon}
                <span className="text-lg md:text-xl font-semibold leading-snug">{item.title}</span>
              </span>
              <span className="mt-2.5 block text-sm md:text-[15px] leading-[1.6] text-white/85">{item.text}</span>
              {item.tags && (
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 border border-white/30 rounded-full text-[11px] font-bold uppercase text-white/90">{tag}</span>
                  ))}
                </span>
              )}
              {item.href && (
                <span className="mt-4 flex items-center gap-2 text-sm font-bold">
                  {t('Detayları gör')}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
