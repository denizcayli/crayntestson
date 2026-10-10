import HandWrite from '../components/HandWrite.jsx'
import PostRow from '../components/PostRow.jsx'
import { POSTS } from '../data/posts.js'
import { link } from '../lib/content.js'

export default function Blog({ heading, text, button_label, button_href }) {
  return (
    <section id="blog" className="py-32 bg-[#e6ebf2] text-graphite overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="md:max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              <HandWrite text={heading} />
            </h2>
            <p className="text-slate-brand text-lg leading-relaxed max-w-xl">
              {text}
            </p>
          </div>
          <a href={link(button_href)} className="magnet-pill magnet-pill--soft group shrink-0">
            <span className="magnet-pill__face">
              {button_label}
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </a>
        </div>
        <PostRow posts={POSTS.slice(0, 3)} />
      </div>
    </section>
  )
}
