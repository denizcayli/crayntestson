import Mullion from '../components/Mullion.jsx'
import { PAGE_SECTIONS, link, pageContent } from '../lib/content.js'
import { MAIL_HREF, PHONE_HREF, SITE } from '../lib/site.js'

// What a card says when open: its text a paragraph per line, then, where asked for, the
// contact details and a closing link.
function Caption({ item }) {
  return (
    <>
      {(item.text ?? '').split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {item.contact && (
        <>
          <p>
            <a href={MAIL_HREF} className="font-semibold text-graphite underline-offset-4 hover:underline">{SITE.email}</a>
            {' · '}
            <a href={PHONE_HREF} className="font-semibold text-graphite underline-offset-4 hover:underline">{SITE.phone}</a>
          </p>
          <p>{SITE.address}</p>
        </>
      )}
      {item.link && item.link_label && (
        <p>
          <a href={link(item.link)} className="font-semibold text-graphite underline underline-offset-4">{item.link_label}</a>
        </p>
      )}
    </>
  )
}

export default function Hakkimizda() {
  const { heading, items } = pageContent('about_page', PAGE_SECTIONS?.find((section) => section.type === 'about_page')?.props)
  const cards = items.map((item, index) => ({
    id: item.id ?? index,
    title: item.title,
    image: item.image,
    link: item.link ? link(item.link) : undefined,
    caption: <Caption item={item} />,
  }))

  return (
    <main>
      <h1 className="sr-only">{heading}</h1>
      {/* The card is the page: edge to edge, a full screen tall, running under the top bar */}
      <Mullion items={cards} className="mullion--page" />
    </main>
  )
}
