import { SERVICES } from '../data/services.js'
import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'

// Index of the service pages.
export default function Hizmetler() {
  return (
    <main className="min-h-screen bg-[#070707] pt-24">
      <section className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-8">
          <nav aria-label={t("Sayfa yolu")} className="mb-8 text-sm text-gray-500">
            <a href={withBase('/')} className="transition-colors hover:text-gray-300">{t("Anasayfa")}</a>
            <span className="mx-2 text-gray-700">/</span>
            <span className="font-medium text-gray-300">{t("Hizmetler")}</span>
          </nav>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">{t("Hizmetler")}</h1>
        </div>
      </section>
      <div className="bg-[#e6ebf2]">
        <ul className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <li key={service.slug}>
              <a href={withBase(`/hizmetler/${service.slug}`)} className="group flex h-full flex-col rounded-[1.75rem] bg-white p-8 text-graphite shadow-[0_30px_60px_-45px_rgba(11,15,20,0.5)] transition-transform duration-300 hover:-translate-y-1">
                <span className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-brand">
                  {service.label}
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </span>
                <h2 className="mt-10 text-2xl font-extrabold tracking-tight">{service.title}</h2>
                <p className="mt-3 line-clamp-3 leading-relaxed text-slate-brand">{service.lead}</p>
                <span className="mt-8 flex items-center gap-2 text-sm font-bold">
                  {t('Detayları gör')}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
