import { BASE } from './paths.js'

// Which page was opened. Every link on the site loads a page afresh, so the address is read
// once: there is nothing to follow afterwards.

// The address inside the site, without the folder it is served from: '/', '/talep', '/hizmetler/web-cozumleri'.
export const PATHNAME = window.location.pathname.slice(BASE.length).replace(/\/+$/, '') || '/'

const [section, slug, more] = PATHNAME.split('/').slice(1)

// The last part of a service's or a post's address.
export const SLUG = slug ? decodeURIComponent(slug) : undefined

const LISTS = { hizmetler: 'hizmet', icerikler: 'icerik' }
const PAGES = ['talep', 'hakkimizda', 'hizmetler', 'icerikler']

// The page that address belongs to; `load` brings its code, so a visitor only downloads the
// page being looked at.
export const PAGE = (() => {
  if (PATHNAME === '/') return 'home'
  if (more !== undefined) return 'notfound'
  if (slug) return LISTS[section] ?? 'notfound'
  return PAGES.includes(section) ? section : 'notfound'
})()

const LOADERS = {
  home: () => import('../pages/Home.jsx'),
  talep: () => import('../pages/Talep.jsx'),
  hakkimizda: () => import('../pages/Hakkimizda.jsx'),
  hizmetler: () => import('../pages/Hizmetler.jsx'),
  hizmet: () => import('../pages/Hizmet.jsx'),
  icerikler: () => import('../pages/Icerikler.jsx'),
  icerik: () => import('../pages/IcerikDetay.jsx'),
  notfound: () => import('../pages/NotFound.jsx'),
}

export const loadPage = () => LOADERS[PAGE]().then((module) => module.default)
