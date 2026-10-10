import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Port of the original crayn-theme.js. Returns a cleanup function.
export function initSiteAnimations() {
  const abort = new AbortController()
  const { signal } = abort
  let refreshTimer

  // 1. Lenis smooth scroll, driven by the GSAP ticker
  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0, 0)

  const ctx = gsap.context(() => {
    // 2. Fullscreen menu
    const menuToggleBtn = document.getElementById('menu-toggle')
    const menuElement = document.getElementById('full-menu')

    if (menuToggleBtn && menuElement) {
      // The sheet opens in a circle that grows from the toggle; the links then come in one after
      // another out of a blur.
      const menuTl = gsap.timeline({ paused: true, reversed: true })
      menuTl
        .fromTo(menuElement, { '--menu-radius': '0vmax' }, { '--menu-radius': '150vmax', duration: 0.8, ease: 'power3.inOut' })
        .from('.menu-list-item', { y: 40, opacity: 0, filter: 'blur(12px)', stagger: 0.07, duration: 0.7, ease: 'power3.out' }, 0.25)
        .from('.menu-info-item', { y: 20, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, 0.5)

      const setOpen = (open) => {
        menuToggleBtn.classList.toggle('menu-open', open)
        menuToggleBtn.setAttribute('aria-expanded', String(open))
        menuToggleBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menü')
        document.documentElement.classList.toggle('menu-is-open', open)
      }

      const closeMenu = () => {
        if (menuTl.reversed()) return
        setOpen(false)
        lenis.start()
        menuTl.timeScale(1.5).reverse().then(() => { menuElement.style.display = 'none' })
      }

      menuToggleBtn.addEventListener('click', () => {
        if (menuTl.reversed()) {
          const icon = menuToggleBtn.querySelector('.menu-toggle__icon').getBoundingClientRect()
          menuElement.style.setProperty('--menu-x', `${Math.round(icon.left + icon.width / 2)}px`)
          menuElement.style.setProperty('--menu-y', `${Math.round(icon.top + icon.height / 2)}px`)
          menuElement.style.display = 'flex'
          menuElement.style.pointerEvents = 'auto'
          setOpen(true)
          lenis.stop()
          menuTl.timeScale(1).play()
        } else {
          closeMenu()
        }
      }, { signal })

      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu() }, { signal })

      document.querySelectorAll('.menu-link-item').forEach((link) => {
        link.addEventListener('click', closeMenu, { signal })
      })
    }
  })

  // 3. Magnetic buttons
  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect()
      const x = e.clientX - position.left - position.width / 2
      const y = e.clientY - position.top - position.height / 2
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
    }, { signal })
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0px, 0px)' }, { signal })
  })

  // 4. Smooth link transitions. A link to a section of this page glides there; a link to another
  // page first fades the screen out (the new page fades itself in, see PAGE VEIL in theme.css).
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let leaveTimer
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a[href]')
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (link.target === '_blank' || link.hasAttribute('download')) return
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin) return

    if (url.pathname === window.location.pathname) {
      // "/#" means the top of this page; a bare link to this page is left to reload it.
      const toTop = !url.hash && link.getAttribute('href').endsWith('#')
      const target = toTop ? 0 : url.hash && document.getElementById(url.hash.slice(1))
      if (target === '' || target === null) return
      e.preventDefault()
      lenis.start()
      lenis.scrollTo(target, { duration: calm ? 0 : 1.4 })
      window.history.replaceState(null, '', url.hash || url.pathname)
    } else if (!calm) {
      e.preventDefault()
      document.documentElement.classList.add('page-leaving')
      leaveTimer = setTimeout(() => { window.location.href = url.href }, 380)
    }
  }, { signal })
  // Coming back with the browser's back button restores the page as it was left: lift the veil.
  window.addEventListener('pageshow', () => document.documentElement.classList.remove('page-leaving'), { signal })

  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500)

  // Pinned and scrubbed sections are measured against the layout above them, so they are
  // re-measured whenever the page changes height (late fonts, images, content swaps).
  let pageHeight = document.body.offsetHeight
  let layoutTimer
  const layoutObserver = new ResizeObserver(() => {
    clearTimeout(layoutTimer)
    layoutTimer = setTimeout(() => {
      if (document.body.offsetHeight === pageHeight) return
      ScrollTrigger.refresh()
      pageHeight = document.body.offsetHeight
    }, 200)
  })
  layoutObserver.observe(document.body)

  return () => {
    abort.abort()
    clearTimeout(refreshTimer)
    clearTimeout(leaveTimer)
    clearTimeout(layoutTimer)
    layoutObserver.disconnect()
    ctx.revert()
    gsap.ticker.remove(tick)
    lenis.destroy()

    const menuElement = document.getElementById('full-menu')
    if (menuElement) menuElement.style.display = 'none'
    document.getElementById('menu-toggle')?.classList.remove('menu-open')
    document.documentElement.classList.remove('menu-is-open')
  }
}
