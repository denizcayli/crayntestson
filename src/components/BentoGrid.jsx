import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { t } from '../lib/text.js'

gsap.registerPlugin(Flip)

const SPAN = { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3' }
// How long the cards take to move to a new layout, in seconds.
const LAYOUT_DURATION = 0.9

// Bento layout on a three-column grid. With nothing selected the cards alternate wide and narrow;
// a selected card takes a full row and its row partner joins a neighbouring row as three singles.
function bentoLayout(count, active) {
  const rows = []
  for (let index = 0; index < count; index += 2) rows.push([index, index + 1].filter((item) => item < count))
  const activeRow = active === null ? -1 : Math.floor(active / 2)
  const partner = activeRow < 0 ? undefined : rows[activeRow].find((item) => item !== active)
  const host = activeRow + 1 < rows.length ? activeRow + 1 : activeRow - 1

  return rows.flatMap((items, row) => {
    if (row === activeRow) return [{ index: active, span: 3 }]
    if (activeRow >= 0 && row === host && partner !== undefined) {
      const trio = host > activeRow ? [partner, ...items] : [...items, partner]
      return trio.map((index) => ({ index, span: 1 }))
    }
    if (items.length === 1) return [{ index: items[0], span: 3 }]
    const wideFirst = row % 2 === 0
    return items.map((index, position) => ({ index, span: (position === 0) === wideFirst ? 2 : 1 }))
  })
}

// Spotlight bento grid: cards sit muted until hovered; a clicked card opens across a full row
// while the others re-flow around it. Each item has `label`, `title`, `text`, `image`, `color`
// and optionally `tags`; `cover` makes the image fill the card instead of sitting in its corner.
export default function BentoGrid({ items, linkHref = '#cta', linkLabel = t('Görüşelim') }) {
  const gridRef = useRef(null)
  const flipState = useRef(null)
  const [active, setActive] = useState(null)

  const select = (index) => {
    // Remember where every card is, so the move to the new layout can be animated.
    flipState.current = Flip.getState(gridRef.current.children)
    setActive((current) => (current === index ? null : index))
  }

  useLayoutEffect(() => {
    const state = flipState.current
    flipState.current = null
    if (!state || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    Flip.from(state, { duration: LAYOUT_DURATION, ease: 'power3.inOut' })
  }, [active])

  const layout = bentoLayout(items.length, active)

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((item, index) => {
        const slot = layout.findIndex((entry) => entry.index === index)
        const open = active === index
        return (
          <article
            key={item.title}
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onClick={() => select(index)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              select(index)
            }}
            style={{ order: slot, backgroundColor: item.color }}
            className={`bento-card ${SPAN[layout[slot].span]} ${open ? 'is-open h-[460px] md:h-[500px]' : 'h-[340px] md:h-[380px]'}`}
          >
            <img src={item.image} alt="" className={item.cover ? 'bento-card__cover' : 'bento-card__image'} />
            <div className="bento-card__shade" />
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-bold tracking-widest text-white/60 uppercase block mb-2">
                {item.label}
              </span>
              <h3 className="text-[28px] md:text-4xl font-semibold leading-[1.1] tracking-[-0.03em]">
                {item.title}
              </h3>
              <div className="bento-card__more">
                <div>
                  <p className="mt-3 text-sm md:text-base leading-[1.45] text-white/85">
                    {item.text}
                  </p>
                  {open && (
                    <>
                      {item.tags && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 border border-white/30 rounded-full text-xs font-bold uppercase text-white/90">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <a href={linkHref} onClick={(e) => e.stopPropagation()} className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                        <span className="link-underline">{linkLabel}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
