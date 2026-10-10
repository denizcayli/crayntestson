import PostRow from '../components/PostRow.jsx'
import { POSTS } from '../data/posts.js'
import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'

export default function IceriklerContent() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 relative z-10">
          <nav className="text-sm text-gray-500 mb-8">
            <a href={withBase('/')} className="hover:text-gray-300 transition-colors">
              {t("Anasayfa")}
            </a>
            {' '}
            <span className="mx-2 text-gray-700">
              /
            </span>
            {' '}
            <span className="text-gray-300 font-medium">
              {t("İçerikler")}
            </span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            {t("İçerikler")}
          </h1>
        </div>
      </section>
      <div className="bg-[#e6ebf2]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {/* Rows of three; the numbering runs on from row to row */}
        <div className="flex flex-col gap-2">
          {POSTS.filter((_, index) => index % 3 === 0).map((_, row) => row * 3).map((start) => (
            <PostRow key={start} posts={POSTS.slice(start, start + 3)} startIndex={start} headingLevel="h2" />
          ))}
        </div>
        <div className="mt-12 text-gray-400" />
      </div>
      </div>
    </>
  )
}
