import Faq from '../components/Faq.jsx'
import Halo from '../components/Halo.jsx'
import Typewriter from '../components/Typewriter.jsx'
import { MAIL_HREF, SITE } from '../lib/site.js'

// Closing section over slowly wandering halos of blue light on a dark ground: the heading with
// a typed line under it, the questions, and where to write.
export default function Cta({ heading, typed, note, items }) {
  return (
    <section id="cta" className="relative isolate overflow-hidden bg-graphite text-cloud py-20 md:py-24 px-6 md:px-12">
      {/* Discs of light in the brand's blues, drifting very slowly behind the questions */}
      <Halo
        className="-z-10"
        colors={[['#7da3ff', 5], ['#a9c1ff', 4], ['#f8fafc', 3]]}
        size={340}
        blur={90}
        seconds={16}
      />
      <div className="absolute inset-0 -z-10 bg-graphite/45" />
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center">
          {heading}
        </h2>
        <p className="mt-4 mb-10 text-center text-xl md:text-2xl font-semibold tracking-tight">
          <Typewriter texts={[typed]} />
        </p>
        <Faq items={items.map((item) => ({ question: item.title, answer: item.text }))} className="w-full" />
        <p className="mt-10 text-center text-lg text-cloud/75">
          {note}{' '}
          <a href={MAIL_HREF} className="font-semibold text-cloud underline decoration-cloud/40 underline-offset-4 transition-colors hover:decoration-crayn">{SITE.email}</a>
        </p>
      </div>
    </section>
  )
}
