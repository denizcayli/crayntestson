import { useEffect, useRef, useState } from 'react'

// A frame whose image stays fixed to the viewport while the frame scrolls with the page, so the
// frame works like a window onto a still picture. `overlay` darkens the image (0–1) so content
// placed inside stays readable.
export default function ParallaxFixedImage({ image, overlay = 0, className = '', children }) {
  // The picture is fetched once the frame is within half a screen of the view.
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setNear(true)
      observer.disconnect()
    }, { rootMargin: '50% 0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        role="img"
        aria-hidden="true"
        className="parallax-fixed-image absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={near ? { backgroundImage: `url(${image})` } : undefined}
      />
      {overlay > 0 && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${overlay})` }} />}
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}
