import IcerikDetayContent from './IcerikDetayContent.jsx'
import NotFound from './NotFound.jsx'
import { findPost } from '../data/posts.js'
import { SLUG as slug } from '../lib/route.js'

export default function IcerikDetay() {
  const post = findPost(slug)
  if (!post) return <NotFound />

  return (
    <main className="min-h-screen pt-24 bg-[#070707]">
      <IcerikDetayContent post={post} />
    </main>
  )
}
