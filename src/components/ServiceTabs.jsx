import { useId, useState } from 'react'
import FeatureVisual from './FeatureVisual.jsx'

const ICONS = {
  layout: <path d="M4 4h16v16H4zM4 9h16M9 9v11" />,
  window: <path d="M3 5h18v14H3zM3 9h18M6 7h.01M9 7h.01" />,
  server: <path d="M4 4h16v7H4zM4 13h16v7H4zM7.5 7.5h.01M7.5 16.5h.01" />,
  search: <path d="M11 17a6 6 0 100-12 6 6 0 000 12zM20 20l-4.6-4.6" />,
  target: <path d="M12 20a8 8 0 100-16 8 8 0 000 16zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01" />,
  chart: <path d="M3 20h18M6 20v-8M12 20V5M18 20v-5" />,
  spark: <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z" />,
  video: <path d="M3 6h13v12H3zM16 10l5-3v10l-5-3" />,
  pen: <path d="M4 20l4.5-1L20 7.5 16.5 4 5 15.5zM14 6.5L17.5 10" />,
  users: <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 11.5a2.5 2.5 0 100-5M17.5 14.3A5.6 5.6 0 0121 20" />,
  image: <path d="M3 5h18v14H3zM8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 16l-5-5-9 8" />,
  megaphone: <path d="M4 10v4h3l7 4V6l-7 4zM17.5 9a4 4 0 010 6" />,
  bot: <path d="M5 9h14v10H5zM12 5v4M9.5 13.5h.01M14.5 13.5h.01M2.5 13v3M21.5 13v3" />,
  link: <path d="M9 15l6-6M11 6.5L12.5 5a4.6 4.6 0 016.5 6.5L17.5 13M13 17.5L11.5 19A4.6 4.6 0 015 12.5L6.5 11" />,
  flow: <path d="M4 5h6v5H4zM14 14h6v5h-6zM10 7.5h4.5a2.5 2.5 0 012.5 2.5v4" />,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />,
  monitor: <path d="M3 4h18v12H3zM8 20h8M12 16v4" />,
  database: <path d="M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />,
}

function Icon({ name, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

function Check({ className = '' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-crayn/25 text-graphite ${className}`}>
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

// Ground behind the panel's illustration, tinted a little differently from tab to tab.
const GROUNDS = ['from-[#eef2f8] to-[#cfd8e6]', 'from-[#e9eef6] to-[#c6d3e8]', 'from-[#eff3f6] to-[#d3dde2]']

// A row of tabs, each naming one part of a service, over the panel of whichever is selected:
// its heading, a checklist and a call to action on the left, and on the right a small animated
// screen, a different kind from tab to tab. Arrows on the panel's edges step through the tabs
// too. `tags` are the service's own tags, shown among the chips of the stream illustration.
// Each feature is `{ icon, title, summary, heading, points, image }`.
export default function ServiceTabs({ features, label, action, tags = [] }) {
  const [active, setActive] = useState(0)
  const id = useId()
  const feature = features[active]
  const chips = [...tags, ...features.map((item) => item.title)]

  const step = (by) => (active + by + features.length) % features.length
  // Arrow keys move between tabs, as the tab pattern expects.
  const onKeyDown = (event) => {
    const by = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!by) return
    event.preventDefault()
    const next = step(by)
    setActive(next)
    document.getElementById(`${id}-tab-${next}`)?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0">
        {features.map((item, index) => {
          const selected = index === active
          return (
            <button
              key={item.title}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={(event) => {
                setActive(index)
                event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
              }}
              className={`relative w-[78%] shrink-0 snap-center rounded-2xl p-5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite md:w-auto ${selected ? 'bg-white shadow-[0_10px_30px_-18px_rgba(11,15,20,0.45)]' : 'hover:bg-white/50'}`}
            >
              <span aria-hidden="true" className={`absolute left-5 right-5 top-0 h-0.5 rounded-full bg-graphite transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0'}`} />
              <span className={`mb-4 flex size-10 items-center justify-center rounded-xl transition-colors duration-300 ${selected ? 'bg-graphite text-crayn' : 'bg-white/70 text-slate-brand'}`}>
                <Icon name={item.icon} className="size-5" />
              </span>
              <span className="block font-bold text-graphite">{item.title}</span>
              <span className="mt-1 block text-sm leading-snug text-slate-brand">{item.summary}</span>
            </button>
          )
        })}
      </div>

      <div className="relative mt-4">
        {/* Round arrows on the panel's edges step to the neighbouring tab */}
        {[[-1, 'Önceki başlık', '-left-5', 'M15 5l-7 7 7 7'], [1, 'Sonraki başlık', '-right-5', 'M9 5l7 7-7 7']].map(([by, name, side, d]) => (
          <button key={by} type="button" aria-label={name} onClick={() => setActive(step(by))} className={`absolute top-24 z-20 hidden size-11 items-center justify-center rounded-full bg-graphite/85 text-white shadow-[0_10px_24px_-10px_rgba(11,15,20,0.8)] backdrop-blur transition-[background-color,transform] hover:scale-105 hover:bg-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite xl:flex ${side}`}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={d} />
            </svg>
          </button>
        ))}
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-40px_rgba(11,15,20,0.5)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Keyed so the contents fade in afresh on every tab change */}
        <div key={`text-${active}`} className="service-panel-in flex flex-col items-start p-8 md:p-12 lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-brand">{feature.title}</p>
          <h3 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-graphite md:text-4xl">{feature.heading}</h3>
          <ul className="mt-8 flex flex-col gap-4">
            {feature.points.map((point) => (
              <li key={point} className="flex gap-3 font-medium leading-snug text-graphite">
                <Check className="mt-0.5 size-5" />
                {point}
              </li>
            ))}
          </ul>
          <a href={action.href} className="magnetic-btn magnetic-btn-ink mt-10 !px-7 !py-3.5 !text-sm">{action.label}</a>
        </div>
        <div className={`flex min-w-0 items-center bg-gradient-to-br p-6 md:p-10 ${GROUNDS[active % GROUNDS.length]}`}>
          <div key={`visual-${active}`} className="service-panel-in w-full min-w-0">
            <FeatureVisual feature={feature} kind={active} tags={chips} />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
