import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'

// Body blocks: a string is a paragraph, { h } a subheading and { list } a bulleted list.
function Block({ block }) {
  if (typeof block === 'string') return <p>{block}</p>
  if (block.h) return <h2 className="text-2xl md:text-3xl font-bold pt-5">{block.h}</h2>
  return (
    <ul className="space-y-2">
      {block.list.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

export default function IcerikDetayContent({ post }) {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <nav className="text-sm text-gray-500 mb-8">
        <a href={withBase('/')} className="hover:text-gray-300 transition-colors">{t("Anasayfa")}</a>
        <span className="mx-2 text-gray-700">/</span>
        <a href={withBase('/icerikler')} className="hover:text-gray-300 transition-colors">{t("İçerikler")}</a>
        <span className="mx-2 text-gray-700">/</span>
        <span className="text-gray-300 font-medium">{post.title}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <span className="font-bold uppercase tracking-widest text-xs text-crayn">{post.category}</span>
        <time dateTime={post.date} className="text-gray-500">{post.dateLabel}</time>
        <span className="text-gray-500">{post.readTime}</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-8 leading-tight">
        {post.title}
      </h1>
      <img src={post.image} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl mb-10" />
      <p className="text-lg text-gray-300 leading-relaxed mb-10 border-l-4 border-crayn pl-4 italic">
        {post.excerpt}
      </p>
      {post.bodyHtml ? (
        <div className="prose-crayn prose-crayn--html max-w-none text-lg leading-relaxed space-y-5" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      ) : (
        <div className="prose-crayn max-w-none text-lg leading-relaxed space-y-5">
          {(post.body ?? []).map((block, index) => <Block key={index} block={block} />)}
        </div>
      )}
      <div className="mt-14 pt-8 border-t border-[#1a1a1a]">
        <a href={withBase('/icerikler')} className="inline-flex items-center gap-2 text-crayn hover:text-white font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {t("Tüm İçerikler")}
        </a>
      </div>
    </div>
  )
}
