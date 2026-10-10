import { withBase } from './paths.js'

// Site-wide details and menus. Under WordPress the theme passes what is set in its settings
// page and in Appearance → Menus as window.CRAYN; whatever is left empty there keeps the
// value below.
const wp = window.CRAYN ?? {}

const DEFAULTS = {
  email: 'hello@crayn.ai',
  phone: '0544 240 71 99',
  address: 'Bilişim Vadisi, Teknoloji Geliştirme Bölgesi, Kocaeli / Türkiye',
  footerText: "Şirketlere özel AI agent'lar, otomasyon sistemleri ve üretken yapay zeka yazılımları geliştiriyoruz.",
  copyright: '© 2026 Crayn AI. Tüm hakları saklıdır.',
  footerNote: 'Bilişim Vadisi, Kocaeli · Yerli Yazılım Şirketi',
  menuNote: '© 2026 Crayn AI',
  instagram: '#',
  x: '#',
  linkedin: '#',
}

const filled = Object.fromEntries(Object.entries(wp.site ?? {}).filter(([, value]) => value))

export const SITE = { ...DEFAULTS, ...filled }

// The mark and the wordmark. The wordmark file is white: it is shown as it is over dark
// sections and in black over light ones, so a replacement has to be white on transparent too.
export const LOGO_ICON = SITE.icon ?? withBase('/assets/brand/crayn-icon.png')
export const LOGO_WORDMARK = SITE.wordmark ?? withBase('/assets/brand/crayn-wordmark-white.png')
export const MAIL_HREF = `mailto:${SITE.email}`
export const PHONE_HREF = `tel:${SITE.phone.replace(/[^\d+]/g, '')}`

// In a menu made in the panel, a link to '#eposta' or '#telefon' stands for the e-mail address
// or the phone number of the settings: it is shown as that and leads to it.
const withContacts = (links) => links.map((item) => {
  if (item.href.endsWith('#eposta')) return { label: SITE.email, href: MAIL_HREF }
  if (item.href.endsWith('#telefon')) return { label: SITE.phone, href: PHONE_HREF }
  return item
})

// Links of the full-screen menu.
export const MAIN_MENU = wp.menus?.main?.length ? withContacts(wp.menus.main) : [
  { label: 'Ana Sayfa', href: withBase('/#') },
  { label: 'Hakkımızda', href: withBase('/hakkimizda') },
  { label: 'Hizmetler', href: withBase('/#services') },
  { label: 'Neler Yapıyoruz', href: withBase('/#solutions') },
  { label: 'İletişim', href: withBase('/talep') },
]

// Columns of the footer, each `{ title, links }`.
export const FOOTER_MENUS = wp.menus?.footer?.length ? wp.menus.footer.map((column) => ({ ...column, links: withContacts(column.links) })) : [
  {
    title: 'Crayn AI',
    links: [
      { label: 'Hizmetler', href: withBase('/#services') },
      { label: 'Neler Yapıyoruz', href: withBase('/#solutions') },
      { label: 'Hakkımızda', href: withBase('/hakkimizda') },
    ],
  },
  {
    title: 'Keşfet',
    links: [
      { label: 'İçerikler', href: withBase('/icerikler') },
      { label: 'Sıkça Sorulan Sorular', href: withBase('/#cta') },
    ],
  },
  {
    title: 'İletişim',
    links: [
      { label: 'Bize Ulaşın', href: withBase('/talep') },
      { label: SITE.email, href: MAIL_HREF },
      { label: SITE.phone, href: PHONE_HREF },
    ],
  },
]
