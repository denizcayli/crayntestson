import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/text.js'
import { LOGO_ICON_SMALL } from '../lib/site.js'

// Counts 0, 1, … count - 1 and round again, one step every `ms`, while `ref` is on screen.
// With reduced motion it stays on `still`.
function useStep(ref, count, ms, still = 0) {
  const [step, setStep] = useState(still)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    const start = () => {
      if (!timer) timer = setInterval(() => setStep((current) => (current + 1) % count), ms)
    }
    const stop = () => {
      clearInterval(timer)
      timer = 0
    }
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      stop()
    }
  }, [ref, count, ms])

  return step
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

// A rail of numbered stops joined by a dotted line; a light walks from stop to stop and the
// card beneath shows the point it has reached.
function Rail({ points }) {
  const ref = useRef(null)
  const active = useStep(ref, points.length, 2400)

  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-6 px-6">
      <ol className="relative flex items-center justify-between">
        <span aria-hidden="true" className="absolute inset-x-5 top-1/2 border-t-2 border-dotted border-graphite/20" />
        {points.map((point, index) => (
          <li key={point} className={`relative flex size-10 items-center justify-center rounded-xl text-sm font-bold transition-[background-color,color,box-shadow,transform] duration-500 ${index === active ? 'scale-110 bg-graphite text-crayn shadow-[0_10px_20px_-8px_rgba(11,15,20,0.6)]' : index < active ? 'bg-crayn/30 text-graphite' : 'bg-white text-slate-brand'}`}>
            {index < active ? <Tick /> : index + 1}
          </li>
        ))}
      </ol>
      {/* Keyed so the text eases in afresh at every stop */}
      <p key={active} className="service-panel-in min-h-[4.5rem] rounded-xl bg-white p-4 text-sm font-semibold leading-snug text-graphite shadow-[0_14px_30px_-18px_rgba(11,15,20,0.5)]">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-brand">{t('Adım')} {active + 1} / {points.length}</span>
        {points[active]}
      </p>
    </div>
  )
}

// A short conversation that writes itself: the points arrive one by one as chat bubbles from
// alternating sides, a typing mark shows before each, then it clears and starts over.
function Chat({ points }) {
  const ref = useRef(null)
  const lines = points.slice(0, 3)
  // One step per bubble, then two of rest before clearing.
  const step = useStep(ref, lines.length + 3, 1300, lines.length)
  const shown = Math.min(step, lines.length)

  return (
    <div ref={ref} className="flex h-full flex-col justify-end gap-2.5 px-6 pb-6">
      {lines.map((line, index) => {
        const mine = index % 2 === 1
        return (
          <p key={line} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-snug transition-[opacity,transform] duration-500 ${mine ? 'self-end rounded-br-md bg-graphite text-cloud' : 'self-start rounded-bl-md bg-white text-graphite shadow-[0_10px_24px_-16px_rgba(11,15,20,0.5)]'} ${index < shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            {line}
          </p>
        )
      })}
      <span aria-hidden="true" className={`fx-typing self-start transition-opacity duration-300 ${shown < lines.length ? 'opacity-100' : 'opacity-0'}`}>
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}

// Two rows of chips drifting in opposite directions behind the Crayn mark: the things this part
// of the service connects.
function Stream({ chips }) {
  const half = Math.ceil(chips.length / 2)
  const rows = [chips.slice(0, half), chips.slice(half)]

  return (
    <div className="relative flex h-full flex-col justify-center gap-3 overflow-hidden">
      {rows.map((row, index) => (
        <div key={index} className={`fx-stream ${index === 1 ? 'fx-stream--back' : ''}`}>
          {/* The row is laid out twice so that it can loop without a seam */}
          {[...row, ...row, ...row, ...row].map((chip, position) => (
            <span key={position} className="rounded-full border border-graphite/10 bg-white px-4 py-2 text-[13px] font-semibold text-graphite shadow-[0_8px_20px_-14px_rgba(11,15,20,0.5)]">{chip}</span>
          ))}
        </div>
      ))}
      <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-graphite shadow-[0_0_0_10px_rgba(230,235,242,0.9),0_20px_40px_-12px_rgba(11,15,20,0.7)]">
        <img src={LOGO_ICON_SMALL} alt="" className="size-9" />
      </span>
    </div>
  )
}

const KINDS = ['rail', 'chat', 'stream']

// Small animated "screen" standing in for a feature: a window with a title bar, and inside it
// one of three moving illustrations made from the feature's own words — a rail of steps, a
// conversation, or a stream of chips. `kind` picks which; `tags` are the stream's chips.
export default function FeatureVisual({ feature, kind = 0, tags = [] }) {
  const name = KINDS[kind % KINDS.length]

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white bg-white/70 shadow-[0_30px_50px_-28px_rgba(11,15,20,0.6)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-graphite/10 bg-white px-5 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-brand">{feature.title}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => <span key={dot} className="size-1.5 rounded-full bg-silver" />)}
        </span>
      </div>
      <div className="h-72" aria-hidden="true">
        {name === 'rail' && <Rail points={feature.points} />}
        {name === 'chat' && <Chat points={feature.points} />}
        {name === 'stream' && <Stream chips={tags} />}
      </div>
    </div>
  )
}
