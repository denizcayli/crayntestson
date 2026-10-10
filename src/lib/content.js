import HOME from '../data/home.json'
import ABOUT from '../data/about-page.json'
import FORM from '../data/form-page.json'
import { withBase } from './paths.js'

const wp = window.CRAYN ?? {}

// Sections of the page in the order set in the panel, each `{ type, props }`; null when the
// page has none of its own.
export const PAGE_SECTIONS = wp.sections?.length ? wp.sections : null

// The approved photos are kept in the project ('/assets/photos/…'); wherever one is named in
// the data, it is reached from the folder the assets are served from.
export function withLocalImages(data) {
  if (Array.isArray(data)) return data.map(withLocalImages)
  if (!data || typeof data !== 'object') return data
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, /image$/.test(key) && typeof value === 'string' && value.startsWith('/assets/') ? withBase(value) : withLocalImages(value)]))
}

const APPROVED = withLocalImages({ ...HOME, ...ABOUT })

// What a section of a page shows: the approved content from the data files, with whatever the
// panel filled in laid over it. A field left empty there keeps the approved value.
export function pageContent(type, props = {}) {
  const approved = APPROVED[type]
  const filled = Object.entries(props)
    .filter(([, value]) => (Array.isArray(value) ? value.length : value))
    .map(([key, value]) => [key, Array.isArray(value) ? withApprovedImages(value, approved[key]) : value])
  return { ...approved, ...Object.fromEntries(filled) }
}

// A row with no picture chosen in the panel keeps the approved picture of the row in its place.
export const withApprovedImages = (items, approved = []) =>
  items.map((item, index) => (item.image || !approved[index]?.image ? item : { ...item, image: approved[index].image }))

// '|' marks a line break in a heading typed in the panel.
export const lines = (text = '') => text.split('|').map((line) => line.trim())
export const withBreaks = (text = '') => lines(text).join('\n')

// The choices of one of the request form's questions: the ones typed on its page in the panel
// ('a | b | c'), or the approved ones.
export const choices = (name) => lines(wp.lists?.[name] || FORM.lists[name].items).filter(Boolean)

// 'a, b, c' as typed in the panel, as a list.
export const list = (text = '') => text.split(',').map((item) => item.trim()).filter(Boolean)

// A site path ('/talep') is reached from the site's folder; a full address is left as it is.
export const link = (href = '') => (href.startsWith('/') && !href.startsWith('//') ? withBase(href) : href)

export const twoDigits = (index) => String(index + 1).padStart(2, '0')
