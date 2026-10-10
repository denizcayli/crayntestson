import Typewriter from '../components/Typewriter.jsx'
import { withBreaks } from '../lib/content.js'

export default function About({ slogans, text_1, text_2, items }) {
  return (
    <section id="about" className="py-28 md:py-36 px-6 bg-[#0a0a0a] border-y border-[#1a1a1a] relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
          <Typewriter texts={slogans.map((slogan) => withBreaks(slogan.text))} />
        </h2>
        <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-gray-300">
          {text_1}
        </p>
        <p className="mt-5 max-w-3xl mx-auto text-lg leading-relaxed text-gray-400">
          {text_2}
        </p>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {items.map((point) => (
            <div key={point.title} className="p-6 md:p-7 border border-[#222] rounded-2xl bg-[#050505]">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">
                {point.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
