import ExpandingCards from '../components/ExpandingCards.jsx'
import HandWrite from '../components/HandWrite.jsx'
import ServiceTabs from '../components/ServiceTabs.jsx'
import NotFound from './NotFound.jsx'
import { SERVICES, findService } from '../data/services.js'
import { withBase } from '../lib/paths.js'
import { SLUG as slug } from '../lib/route.js'
import { t } from '../lib/text.js'

// Page of a single service: a dark heading band, the service told part by part in tabs, the
// steps an engagement goes through, and the other services as a row of expanding cards.
export default function Hizmet() {
  const service = findService(slug)
  if (!service) return <NotFound />
  const { steps } = service

  const others = SERVICES.filter((item) => item.slug !== slug).map((item, index) => ({
    number: String(index + 1).padStart(2, '0'),
    label: item.label,
    title: item.title,
    text: item.lead,
    tags: item.tags,
    image: item.features[0]?.image,
    color: '#111',
    href: withBase(`/hizmetler/${item.slug}`),
  }))

  return (
    <main className="min-h-screen bg-[#070707] pt-24">
      <section className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-8">
          <nav aria-label={t("Sayfa yolu")} className="mb-8 text-sm text-gray-500">
            <a href={withBase('/')} className="transition-colors hover:text-gray-300">{t("Anasayfa")}</a>
            <span className="mx-2 text-gray-700">/</span>
            <a href={withBase('/hizmetler')} className="transition-colors hover:text-gray-300">{t("Hizmetler")}</a>
            <span className="mx-2 text-gray-700">/</span>
            <span className="font-medium text-gray-300">{service.title}</span>
          </nav>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-crayn">{service.label}</p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl">{service.title}</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-gray-400">{service.lead}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {service.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-gray-300">{tag}</li>
            ))}
          </ul>
          <a href={withBase('/talep')} className="magnet-pill magnet-pill--light mt-10">
            <span className="magnet-pill__face">{service.button_label}</span>
          </a>
        </div>
      </section>

      {service.features.length > 0 && (
      <section className="bg-[#e6ebf2] text-graphite">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-brand">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {service.eyebrow}
          </p>
          <h2 className="mt-5 max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
            <HandWrite text={service.tabs_heading || `${service.title} kapsamında neler yapıyoruz?`} />
          </h2>
          <p className="mb-10 mt-5 max-w-2xl text-lg leading-relaxed text-slate-brand">
            {service.tabs_text}
          </p>
          <ServiceTabs
            features={service.features}
            label={`${service.title} başlıkları`}
            tags={service.tags}
            action={{ label: service.button_label, href: withBase('/talep') }}
          />
        </div>
      </section>
      )}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-crayn">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {steps.eyebrow}
          </p>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight text-white md:text-5xl">
            <HandWrite text={steps.heading} />
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">
            {steps.text}
          </p>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.items.map((step, index) => (
              <li key={step.title} className="spot-card">
                <div className="spot-card__face flex min-h-[15rem] flex-col p-7">
                  <span className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold tracking-tight text-white/15">{String(index + 1).padStart(2, '0')}</span>
                    {index < steps.items.length - 1 && (
                      <svg viewBox="0 0 24 24" className="size-5 text-crayn" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    )}
                  </span>
                  <h3 className="mt-auto pt-10 text-xl font-bold tracking-tight text-white">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-400">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* One viewport tall on wide screens, held in place while the cards step through on scroll */}
      <section className="w-full bg-[#e6ebf2] px-6 py-24 text-graphite md:h-screen md:min-h-[560px] md:px-12 md:pb-8 md:pt-24">
        <div className="mx-auto max-w-[1600px] md:flex md:h-full md:flex-col">
          <div className="mx-auto mb-12 max-w-4xl text-center md:mb-7">
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:mb-3 md:text-6xl">
              <HandWrite text={service.others.heading} />
            </h2>
            <p className="text-lg leading-relaxed text-slate-brand">{service.others.text}</p>
          </div>
          <ExpandingCards items={others} scrollLength="+=120%" className="md:min-h-0 md:flex-1" />
        </div>
      </section>
    </main>
  )
}
