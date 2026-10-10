// A frame whose image stays fixed to the viewport while the frame scrolls with the page, so the
// frame works like a window onto a still picture. `overlay` darkens the image (0–1) so content
// placed inside stays readable.
export default function ParallaxFixedImage({ image, overlay = 0, className = '', children }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        role="img"
        aria-hidden="true"
        className="parallax-fixed-image absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      {overlay > 0 && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${overlay})` }} />}
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}
