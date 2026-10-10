// Whether the page behind a point is dark, judged by the nearest painted background colour
// there. `ignore` lists the elements doing the asking, which sit on top and must not count.
export function isDarkBehind(x, y, ...ignore) {
  for (const element of document.elementsFromPoint(x, y)) {
    // The intro screen is temporary cover, not the page.
    if (ignore.some((own) => own?.contains(element)) || element.closest('.preloader')) continue
    const channels = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number)
    if (!channels || (channels[3] ?? 1) < 0.5) continue
    const [r, g, b] = channels
    return 0.299 * r + 0.587 * g + 0.114 * b < 140
  }
  return true
}

// How often (ms) the backdrop is looked at while the page scrolls.
const LOOK_EVERY = 120

// Calls `update` now, and again while the page scrolls or is resized — but only every LOOK_EVERY
// ms, not on every frame: looking behind a point makes the browser lay the page out, which is
// too much work to do in step with the scroll. Returns a cleanup function.
export function watchBackdrop(update) {
  let timer = 0
  let last = 0
  const look = () => {
    timer = 0
    last = performance.now()
    update()
  }
  const schedule = () => {
    if (!timer) timer = setTimeout(look, Math.max(0, LOOK_EVERY - (performance.now() - last)))
  }
  look()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    clearTimeout(timer)
  }
}
