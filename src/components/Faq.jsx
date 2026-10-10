import { useId, useState } from 'react'

// Accordion of questions in dark tiles packed into one rounded tray. One answer is open at a
// time; the plus in the corner folds into a minus while its tile is open.
export default function Faq({ items, className = '' }) {
  const [open, setOpen] = useState(0)
  const id = useId()

  return (
    <div className={`faq ${className}`}>
      {items.map((item, index) => {
        const isOpen = index === open
        return (
          <div key={item.question} className="faq-item" data-open={isOpen}>
            <h3>
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`${id}-${index}`}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                <span>{item.question}</span>
                <span className="faq-mark" aria-hidden="true" />
              </button>
            </h3>
            <div id={`${id}-${index}`} className="faq-answer" inert={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
