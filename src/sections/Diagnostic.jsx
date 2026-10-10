import HandWrite from '../components/HandWrite.jsx'
import ParallaxFixedImage from '../components/ParallaxFixedImage.jsx'
import { twoDigits, withBreaks } from '../lib/content.js'

export default function Diagnostic({ heading, text, items }) {
  return (
    <section id="diagnostic-section" className="w-full bg-black border-t border-gray-900 px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white">
            <HandWrite text={withBreaks(heading)} breakClassName="md:hidden" />
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            {text}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          {items.map((item, index) => (
            <ParallaxFixedImage key={index} image={item.image} overlay={0.5} className="h-[70vh] min-h-[420px] rounded-[1.75rem] text-white">
              <div className="flex h-full flex-col justify-between p-7 md:p-12">
                <span className="text-sm font-semibold tracking-widest">
                  {twoDigits(index)}
                  <span className="ml-3 text-white/70">{item.label}</span>
                </span>
                <div className="max-w-2xl">
                  <h3 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base md:text-xl leading-relaxed text-white/85">
                    {item.text}
                  </p>
                </div>
              </div>
            </ParallaxFixedImage>
          ))}
        </div>
      </div>
    </section>
  )
}
