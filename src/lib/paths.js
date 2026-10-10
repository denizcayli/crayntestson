// Where the site lives. As a WordPress theme (`npm run build:wp`) the theme passes both
// addresses as window.CRAYN; otherwise they are the folder the build is served from.
const wp = window.CRAYN ?? {}
const trim = (path) => path.replace(/\/$/, '')

// The folder the site is served from, without a trailing slash: '' at the root of a domain.
export const BASE = trim(wp.base ?? import.meta.env.BASE_URL)
// The folder holding /assets, which under WordPress is inside the theme.
const ASSETS = trim(wp.assets ?? import.meta.env.BASE_URL)

// A site path ('/talep', '/#services', '/assets/…') as it is reached from that folder.
export const withBase = (path) => (path.startsWith('/assets/') ? ASSETS : BASE) + path
