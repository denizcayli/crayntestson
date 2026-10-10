import ExpandingCards from '../components/ExpandingCards.jsx'
import HandWrite from '../components/HandWrite.jsx'
import { SERVICES } from '../data/services.js'
import { twoDigits } from '../lib/content.js'
import { withBase } from '../lib/paths.js'

// On wide screens the section is exactly one viewport tall, so the heading and the cards stay
// on screen together while the cards step through on scroll.
// The cards are the services themselves, in their order: adding a service adds its card.
export default function Services({ heading, text }) {
  const cards = SERVICES.map((service, index) => ({
    number: twoDigits(index),
    label: service.label,
    title: service.title,
    href: withBase(`/hizmetler/${service.slug}`),
    tags: service.tags,
    text: service.lead,
    image: service.card_image ?? service.features[0]?.image,
    color: service.card_color || '#191919',
  }))

  return (
    <section id="services" className="w-full bg-[#e6ebf2] text-graphite px-6 md:px-12 py-24 md:h-screen md:min-h-[560px] md:pt-24 md:pb-8">
      <div className="max-w-[1600px] mx-auto md:h-full md:flex md:flex-col">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-7">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 md:mb-3">
            <HandWrite text={heading} />
          </h2>
          <p className="text-slate-brand text-lg leading-relaxed">
            {text}
          </p>
        </div>
        <ExpandingCards items={cards} scrollLength="+=150%" className="md:flex-1 md:min-h-0" />
      </div>
    </section>
  )
}
