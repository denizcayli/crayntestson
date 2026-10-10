const ICONS = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />,
  linkedin: (
    <>
      <rect x="4" y="9.5" width="3.4" height="10.5" fill="currentColor" />
      <circle cx="5.7" cy="5.6" r="2" fill="currentColor" />
      <path d="M10.4 9.5h3.2v1.6c.6-1.1 1.9-1.9 3.6-1.9 3 0 3.8 1.9 3.8 4.7V20h-3.4v-5.4c0-1.4-.3-2.4-1.7-2.4s-2.1 1-2.1 2.4V20h-3.4z" fill="currentColor" />
    </>
  ),
}

// Row of round social buttons in a pill. A hovered button grows upwards from its base and its
// name pops up above it. Each link is `{ icon, label, href }`, with `icon` one of the keys above.
export default function SocialLinks({ links, className = '' }) {
  return (
    <div className={`social-links ${className}`}>
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="social-links__item">
          <span aria-hidden="true" className="social-links__label">{link.label}</span>
          <span className="social-links__icon">
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">{ICONS[link.icon]}</svg>
          </span>
        </a>
      ))}
    </div>
  )
}
