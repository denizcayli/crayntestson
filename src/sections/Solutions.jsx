import BentoGrid from '../components/BentoGrid.jsx'
import HandWrite from '../components/HandWrite.jsx'
import { twoDigits } from '../lib/content.js'

export default function Solutions({ heading, text, items }) {
  const cards = items.map((item, index) => ({ ...item, label: twoDigits(index), color: '#0d0d10', cover: true }))

  return (
    <section id="solutions" className="py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
            <HandWrite text={heading} />
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
            {text}
          </p>
        </div>
        <BentoGrid items={cards} />
      </div>
    </section>
  )
}
