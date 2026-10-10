import { useState } from 'react'
import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'

// Row of light post cards. Every card shows its number, title and summary; the one being pointed
// at (the first, when none is) widens to reveal its picture, washed in the brand blue.
// `startIndex` continues the numbering when a list is split over several rows.
export default function PostRow({ posts, startIndex = 0, headingLevel: Heading = 'h3' }) {
  const [active, setActive] = useState(0)

  return (
    <div className="post-row">
      <div className="post-row__track" onMouseLeave={() => setActive(0)}>
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className="post-card"
            data-active={index === active}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            {/* Laid out at the card's full open width, so nothing reflows while it widens */}
            <div className="post-card__inner">
              <div className="post-card__text">
                <p className="post-card__number">
                  {String(startIndex + index + 1).padStart(2, '0')}
                  <span>{post.category}</span>
                </p>
                <div className="post-card__copy">
                  <Heading className="post-card__title">
                    <a href={withBase(`/icerikler/${post.slug}`)}>{post.title}</a>
                  </Heading>
                  <p className="post-card__summary">{post.excerpt}</p>
                  <p className="post-card__more">
                    <time dateTime={post.date}>{post.dateLabel}</time>
                    <span aria-hidden="true">{t('Devamını Oku →')}</span>
                  </p>
                </div>
              </div>
              <div className="post-card__media">
                <img src={post.image} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
