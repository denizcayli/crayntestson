import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Text that is "written" letter by letter as it scrolls into view: each letter slides in from the
// left while un-tilting. The letters appear between the text entering the viewport and reaching
// its centre, and are un-written again when scrolling back up.
// A "\n" in `text` is a line break; `breakClassName` can limit it to some screen sizes.
export default function HandWrite({ text, breakClassName }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const letters = root.querySelectorAll('.hand-write-letter')
    let written = 0
    const write = (count) => {
      for (let i = Math.min(written, count); i < Math.max(written, count); i++) {
        letters[i].classList.toggle('is-written', i < count)
      }
      written = count
    }

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const update = ({ progress }) => write(Math.ceil(progress * letters.length))
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'center center', onUpdate: update, onRefresh: update })
      return () => write(0)
    })
    return () => media.revert()
  }, [text])

  let index = 0
  return (
    <span ref={rootRef} aria-label={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <><br className={breakClassName} />{' '}</>}
          {line.split(' ').map((word, wordIndex) => (
            <Fragment key={wordIndex}>
              {wordIndex > 0 && ' '}
              {/* Words stay whole when the line wraps */}
              <span aria-hidden="true" className="inline-block whitespace-nowrap">
                {[...word].map((letter) => (
                  <span key={index++} className="hand-write-letter">{letter}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </span>
  )
}
