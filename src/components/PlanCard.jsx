import { useEffect, useId, useRef, useState } from 'react'
import { isDarkBehind, watchBackdrop } from '../lib/backdrop.js'
import { SERVICES } from '../data/services.js'
import { SEND_FAILED, sendRequest } from '../lib/requests.js'
import { scoped } from '../lib/text.js'
import { LOGO_ICON } from '../lib/site.js'

const t = scoped('kart')

// The pill's label: on narrow screens only its first word is shown.
const PILL = t('Demo planlayalım').split(' ')
const CHIPS = [t('Keşif görüşmesi'), t('Yol haritası'), t('Net teklif')]
const STEPS = [t('İşiniz'), t('İhtiyaç'), t('İletişim')]
const BUSINESSES = [t('E-ticaret'), t('Ajans'), t('SaaS / Uygulama'), t('Hizmet işletmesi'), t('Marka / Üretici'), t('Diğer')]
const TEAM_SIZES = [t('1 kişi'), t('2–10'), t('11–50'), t('51–200'), t('200+')]

// How long after the page opens (ms) the card slides in.
const SHOW_AFTER = 600
// How long the success tick stays up (ms) before the card returns to its invitation.
const DONE_FOR = 6000

const blank = (service) => ({ website: '', business: '', team: '', service, name: '', company: '', email: '', phone: '', note: '' })

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'
const FIELD = 'w-full rounded-xl border border-silver bg-white px-3.5 py-2.5 text-base text-graphite outline-none lg:text-sm transition-colors placeholder:text-slate-brand/60 focus:border-graphite'
// The open card's two widths; a phone's screen is narrower than either, so there it takes the
// screen's width less a margin.
const NARROW = 'w-[min(21rem,calc(100vw-2rem))]'
const WIDE = 'w-[min(25rem,calc(100vw-2rem))]'
const LABEL = 'mb-1.5 block text-sm font-bold'
// The last field sits half under the form's footer until the step is scrolled; focusing it
// brings it fully into view.
const reveal = (event) => event.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
const OPTIONAL = <span className="font-medium text-slate-brand">{t(" (isteğe bağlı)")}</span>

function Stroke({ d, className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
const VIDEO = 'M3 6h13v12H3zM16 10l5-3v10l-5-3'
const CALENDAR = 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5'
const CROSS = 'M6 6l12 12M18 6L6 18'

function Close({ onClick, className = '' }) {
  return (
    <button type="button" aria-label={t("Küçült")} onClick={onClick} className={`flex size-8 shrink-0 items-center justify-center rounded-full text-slate-brand transition-colors hover:bg-graphite/5 hover:text-graphite ${className}`}>
      <Stroke d={CROSS} className="size-4" />
    </button>
  )
}

// A question answered by picking one of a few boxes.
function Choices({ legend, name, options, value, onChange, columns = 'grid-cols-2' }) {
  return (
    <fieldset>
      <legend className={LABEL}>{legend}</legend>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <label key={option} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${value === option ? 'border-graphite bg-graphite/[0.04]' : 'border-silver hover:border-slate-brand'}`}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="size-4 shrink-0 accent-graphite" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// Invitation pinned to the bottom-left corner, sliding in shortly after the page opens as a small
// glass pill. Pressed, it unfolds into a brushed-metal card whose button
// turns it into a short three-step request form, which ends on a tick that draws itself before
// the card starts over. The cross folds the card back down to the pill, which opens it again
// where it was left. `service` is the service
// the page is about, pre-selected in the form. On a phone it sits beside the round button, and
// open it spans the screen and lies over that button.
export default function PlanCard({ service = '' }) {
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  // Whether the page's footer has come up to where the card sits; it bows out while it has.
  const [atFooter, setAtFooter] = useState(false)
  // Whether the page behind the folded pill is dark, so that it can wear the same glass as the
  // round button in the opposite corner: pale over dark ground, misted white over light.
  const [onDark, setOnDark] = useState(true)
  const rootRef = useRef(null)
  const [view, setView] = useState('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(() => blank(service))
  // 'sending' while the request is on its way, 'failed' when the site did not take it.
  const [sending, setSending] = useState('')
  const id = useId()
  const answer = (key) => (value) => setAnswers((current) => ({ ...current, [key]: value }))
  // Text fields keep their value in `answers` too, so it survives moving between steps.
  const field = (name) => ({ name, value: answers[name], onChange: (event) => answer(name)(event.target.value) })

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), SHOW_AFTER)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    return watchBackdrop(() => {
      const box = root.getBoundingClientRect()
      setOnDark(isDarkBehind(box.left + 24, box.bottom - 24, root))
    })
  }, [])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    // Counts the footer as arrived once it is a card's height into view from the bottom.
    const observer = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting), { rootMargin: '0px 0px -110px 0px' })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  // Back to the invitation with an empty form.
  const restart = () => {
    setView('intro')
    setStep(0)
    setAnswers(blank(service))
  }
  useEffect(() => {
    if (view !== 'done') return
    const timer = setTimeout(restart, DONE_FOR)
    return () => clearTimeout(timer)
  }, [view])

  const last = step === STEPS.length - 1
  const onSubmit = (event) => {
    event.preventDefault()
    if (!last) return setStep(step + 1)
    if (sending === 'sending') return
    setSending('sending')
    sendRequest('Görüşme kartı', answers).then(
      () => { setSending(''); setView('done') },
      () => setSending('failed'),
    )
  }

  const wide = open && view === 'form'
  const metal = open && view === 'intro'
  const fold = (isOpen) => `grid transition-[grid-template-rows,opacity] duration-500 ${EASE} motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`

  return (
    <aside
      ref={rootRef}
      aria-label={t("Görüşme planlayın")}
      inert={!shown || atFooter}
      className={`group fixed bottom-6 left-4 overflow-hidden shadow-[0_30px_60px_-25px_rgba(11,15,20,0.55)] transition-[width,border-radius,opacity,transform] duration-500 ${EASE} motion-reduce:transition-none lg:bottom-8 lg:left-8 ${open ? 'z-[46]' : 'z-[44]'} ${!open ? (onDark ? 'plan-pill plan-pill--dark text-white' : 'plan-pill text-graphite') : metal ? 'glassy-box text-graphite' : 'border border-graphite/5 bg-white text-graphite'} ${open ? 'rounded-[1.75rem]' : 'rounded-[2rem]'} ${wide ? WIDE : open ? NARROW : ''} ${!shown ? 'translate-y-6 opacity-0' : atFooter ? 'opacity-0 !duration-1000' : 'opacity-100'}`}
    >
      {/* Folded: a small pill that opens the card again. Every few seconds, and whenever it is
          pointed at, it widens while the logo rolls across to the right and its label shows in
          the space left behind; then the logo rolls home. On a phone it is smaller and keeps its
          width: the logo rolls within it. The motion is in theme.css. */}
      <div inert={open} className={fold(!open)}>
        <div className="overflow-hidden">
          <button type="button" aria-expanded={open} aria-controls={id} aria-label={PILL.join(' ')} onClick={() => setOpen(true)} className="relative flex w-full items-center p-2 text-left sm:p-2.5">
            {/* A phone's pill is too short for the whole label */}
            <span className="plan-pill__label" aria-hidden="true">{PILL[0]}<span className="hidden sm:inline"> {PILL.slice(1).join(' ')}</span></span>
            <span className="flex shrink-0 -space-x-2" aria-hidden="true">
              <span className="plan-pill__logo relative z-[2] flex size-8 items-center justify-center sm:size-9">
                <img src={LOGO_ICON} alt="" className="size-7 sm:size-8" />
              </span>
              <span className={`plan-pill__extra relative z-[1] flex size-8 items-center justify-center rounded-full sm:size-9 ${onDark ? 'bg-white/15' : 'bg-graphite/10'}`}><Stroke d={VIDEO} className="size-4" /></span>
              <span className={`plan-pill__extra flex size-8 items-center justify-center rounded-full sm:size-9 ${onDark ? 'bg-white/15' : 'bg-graphite/10'}`}><Stroke d={CALENDAR} className="size-4" /></span>
            </span>
            <span className="flex-1" />
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors sm:size-9 ${onDark ? 'border-white/40 group-hover:bg-white group-hover:text-graphite' : 'border-graphite/30 group-hover:bg-graphite group-hover:text-cloud'}`}>
              <Stroke d="M5 12h13M13 7l5 5-5 5" className="size-4" />
            </span>
          </button>
        </div>
      </div>

      <div id={id} inert={!open} className={fold(open)}>
        <div className="overflow-hidden">
          {view === 'intro' && (
            <div className="glassy-box__face service-panel-in relative p-6 text-center">
              <Close onClick={() => setOpen(false)} className="absolute right-4 top-4" />
              <div className="flex justify-center -space-x-2" aria-hidden="true">
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-graphite">
                  <img src={LOGO_ICON} alt="" className="size-6" />
                </span>
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-[#eef2f8]"><Stroke d={VIDEO} /></span>
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-[#eef2f8]"><Stroke d={CALENDAR} /></span>
              </div>
              <p className="mt-4 text-lg font-extrabold tracking-tight">{t("Projenizi birlikte planlayalım")}</p>
              <p className="mt-1.5 text-sm leading-snug text-slate-brand">
                {t('Sürecinizi dinleyelim, nereden başlanabileceğini birlikte netleştirelim.')}
              </p>
              <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
                {CHIPS.map((chip) => (
                  <li key={chip} className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold">{chip}</li>
                ))}
              </ul>
              <button type="button" onClick={() => setView('form')} className="glassy-btn mt-5 w-full">
                {t('Görüşme planla')}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={onSubmit} className={`service-panel-in flex max-h-[min(36rem,calc(100dvh-7rem))] ${WIDE} flex-col`}>
              <div className="flex items-center gap-3 px-5 pt-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2f8]"><Stroke d={CALENDAR} /></span>
                <span className="flex-1">
                  <span className="block font-extrabold leading-tight tracking-tight">{t("Keşif görüşmesi")}</span>
                  <span className="block text-sm text-slate-brand">{t("Ekibimizle tanışın, ihtiyacınızı konuşalım")}</span>
                </span>
                <Close onClick={() => setOpen(false)} />
              </div>
              <ol className="mt-4 grid grid-cols-3 gap-2 border-b border-graphite/10 px-5 pb-3">
                {STEPS.map((name, index) => (
                  <li key={name} aria-current={index === step ? 'step' : undefined} className={`text-xs font-semibold transition-colors duration-300 ${index === step ? 'text-graphite' : 'text-slate-brand/70'}`}>
                    <span className={`mb-1.5 block h-1 rounded-full transition-colors duration-500 ${index <= step ? 'bg-graphite' : 'bg-silver/60'}`} />
                    {name}
                  </li>
                ))}
              </ol>

              {/* Keyed so each step eases in afresh */}
              <div key={step} data-lenis-prevent className="service-panel-in flex flex-1 scroll-py-4 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-4">
                {step === 0 && (
                  <>
                    <div>
                      <p className="text-lg font-extrabold tracking-tight">{t("İşinizi tanıyalım")}</p>
                      <p className="mt-0.5 text-sm text-slate-brand">{t("Görüşmeyi sizin işinize göre hazırlayalım.")}</p>
                    </div>
                    <label>
                      <span className={LABEL}>{t('Web siteniz')}{OPTIONAL}</span>
                      <input type="text" {...field('website')} inputMode="url" autoComplete="url" placeholder={t("ornekmarka.com")} className={FIELD} />
                    </label>
                    <Choices legend={t("Ne iş yapıyorsunuz?")} name="business" options={BUSINESSES} value={answers.business} onChange={answer('business')} />
                  </>
                )}
                {step === 1 && (
                  <>
                    <div>
                      <p className="text-lg font-extrabold tracking-tight">{t("Neye ihtiyacınız var?")}</p>
                      <p className="mt-0.5 text-sm text-slate-brand">{t("Kabaca söylemeniz yeterli.")}</p>
                    </div>
                    <Choices legend={t("Ekibiniz kaç kişi?")} name="team" options={TEAM_SIZES} value={answers.team} onChange={answer('team')} columns="grid-cols-2 sm:grid-cols-3" />
                    <Choices legend={t("Hangi hizmetle ilgileniyorsunuz?")} name="service" options={SERVICES.map((item) => item.title)} value={answers.service} onChange={answer('service')} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <div>
                      <p className="text-lg font-extrabold tracking-tight">{t("Size nasıl ulaşalım?")}</p>
                      <p className="mt-0.5 text-sm text-slate-brand">{t("Uygun bir zaman için size yazacağız.")}</p>
                    </div>
                    <div className="grid grid-cols-2 items-end gap-3">
                      <label>
                        <span className={LABEL}>{t("Ad soyad")}</span>
                        <input type="text" {...field('name')} autoComplete="name" required className={FIELD} />
                      </label>
                      <label>
                        <span className={LABEL}>{t("Şirket ya da marka")}</span>
                        <input type="text" {...field('company')} autoComplete="organization" className={FIELD} />
                      </label>
                    </div>
                    <label>
                      <span className={LABEL}>{t("İş e-postanız")}</span>
                      <input type="email" {...field('email')} autoComplete="email" required className={FIELD} />
                    </label>
                    <label>
                      <span className={LABEL}>{t('Telefon')}{OPTIONAL}</span>
                      <input type="tel" {...field('phone')} autoComplete="tel" className={FIELD} />
                    </label>
                    <label>
                      <span className={LABEL}>{t('Konuşmak istediğiniz bir konu?')}{OPTIONAL}</span>
                      <textarea {...field('note')} rows="2" onFocus={reveal} placeholder={t("Örn. satış sürecinin otomasyonu, iç raporlama")} className={`${FIELD} resize-none`} />
                    </label>
                  </>
                )}
              </div>

              {sending === 'failed' && <p role="alert" className="px-5 pb-3 text-sm font-semibold text-red-600">{SEND_FAILED}</p>}
              <div className="flex items-center justify-between border-t border-graphite/10 px-5 py-4">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="px-2 text-sm font-semibold text-slate-brand transition-colors hover:text-graphite">{t("Geri")}</button>
                ) : <span />}
                <button type="submit" className="flex items-center gap-2 rounded-full border-[1.5px] border-graphite px-6 py-2.5 text-sm font-bold transition-colors hover:bg-graphite hover:text-cloud">
                  {last ? t('Talebi gönder') : t('Devam')}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}

          {view === 'done' && (
            <div role="status" className={`service-panel-in ${NARROW} p-8 text-center`}>
              <svg viewBox="0 0 52 52" className="plan-check mx-auto size-16" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="26" cy="26" r="24" className="stroke-crayn" />
                <path d="M16 27l7 7 14-15" className="stroke-graphite" />
              </svg>
              <p className="mt-5 text-lg font-extrabold tracking-tight">{t("Talebiniz alındı!")}</p>
              <p className="mt-1.5 text-sm leading-snug text-slate-brand">{t("Ekibimiz en kısa sürede sizinle iletişime geçecek.")}</p>
              <button type="button" onClick={restart} className="glassy-btn mt-6 w-full">{t("Başa dön")}</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
