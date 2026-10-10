// Second half of `npm run build:wp`: gives the theme the data its PHP reads.
//  - veri/*.json: the approved content, copied from src/data
//  - veri/texts.json: every fixed text wrapped in t(), by the place it is edited in the panel
//  - veri/talep.json: the request form's texts, by the tab of its element they are edited under
import fs from 'node:fs'
import path from 'node:path'

const out = 'tema/craynai/veri'
fs.mkdirSync(out, { recursive: true })
for (const name of ['home', 'service-page', 'about-page', 'form-page', 'services', 'posts']) {
  fs.copyFileSync(`src/data/${name}.json`, `${out}/${name}.json`)
}

// Brand files kept in the project for reference; nothing on the site shows them.
for (const name of ['crayn-app-icon', 'crayn-color-palette', 'crayn-icon-light', 'crayn-logo-clear-space', 'crayn-logo-horizontal-light', 'crayn-logo-stacked-dark', 'crayn-logo-stacked-light']) {
  fs.rmSync(`tema/craynai/app/assets/brand/${name}.webp`, { force: true })
}
fs.rmSync('tema/craynai/app/index.html', { force: true })

// The guide travels with the theme, so whoever opens the theme's folder on the server finds it.
// It is not for visitors: the folder's .htaccess keeps it from being opened from the web.
fs.copyFileSync('KILAVUZ.md', 'tema/craynai/KILAVUZ.md')
fs.writeFileSync('tema/craynai/.htaccess', `<FilesMatch "\\.md$">
Require all denied
</FilesMatch>
`)

// Files whose name carries a hash of their content never change under that name, so a browser
// may keep them for good; photos and logos are kept for a month.
fs.writeFileSync('tema/craynai/app/assets/.htaccess', `<IfModule mod_headers.c>
<FilesMatch "\\.(webp|png|jpg|glb)$">
Header set Cache-Control "public, max-age=2592000"
</FilesMatch>
<FilesMatch "-[A-Za-z0-9_-]{8}\\.(js|css)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
</IfModule>
`)

// Which part of the site a source file's texts belong to, as the panel names it.
const GROUPS = [
  [/TalepContent|talepForm/, 'Talep formu'],
  [/PlanCard/, 'Görüşme kartı'],
  [/Nav|FullMenu/, 'Menü'],
  [/FloatingCta/, 'Sağ alttaki dönen düğme'],
  [/PostRow|ExpandingCards|BentoGrid|FeatureVisual/, 'Kartlar'],
  [/NotFound/, '404 sayfası'],
  [/Hizmet/, 'Hizmet sayfaları'],
  [/Icerik/, 'İçerik sayfaları'],
]

// The texts of a source file in the order a visitor meets them. A text held in a constant at
// the top of the file (a list of choices, say) counts from where that constant is shown.
function textsIn(source) {
  const found = [...source.matchAll(/\bt\(("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\)/g)].map((match, order) => {
    const lineStart = source.lastIndexOf('\n', match.index) + 1
    const constant = source.slice(lineStart, match.index).match(/^const ([A-Z_]+) =/)?.[1]
    const shown = constant ? source.slice(match.index).search(new RegExp(`\\{${constant}\\b`)) : -1
    return {
      text: match[1].startsWith('"') ? JSON.parse(match[1]) : match[1].slice(1, -1).replace(/\\'/g, "'"),
      at: shown < 0 ? match.index : match.index + shown,
      order,
    }
  })
  return found.sort((a, b) => a.at - b.at || a.order - b.order).map((entry) => entry.text)
}

const add = (lists, name, text) => {
  if (Object.values(lists).some((list) => list.includes(text))) return
  ;(lists[name] ??= []).push(text)
}

// The request form and the request card are each edited in a place of their own; every other
// text is edited on one page, where the same text is listed once however many places show it.
const OWN_PLACE = ['Talep formu', 'Görüşme kartı']
const shared = {}

const files = fs.readdirSync('src', { recursive: true }).map((file) => path.join('src', file)).filter((file) => /\.jsx?$/.test(file)).sort()
const groups = {}
for (const file of files) {
  const group = GROUPS.find(([pattern]) => pattern.test(file))?.[1] ?? 'Diğer'
  groups[group] ??= {}
  for (const text of textsIn(fs.readFileSync(file, 'utf8'))) {
    if (OWN_PLACE.includes(group)) add(groups[group], 'all', text)
    else add(shared, group, text)
  }
}
const texts = Object.fromEntries([
  ...Object.entries(groups).map(([group, lists]) => [group, lists.all ?? []]),
  ...Object.entries(shared),
].filter(([, list]) => list.length))
fs.writeFileSync(`${out}/texts.json`, JSON.stringify(texts, null, 2) + '\n')

// The request form: what comes before the first step is general, then a tab per step, then
// the buttons under the steps.
const form = fs.readFileSync('src/pages/TalepContent.jsx', 'utf8')
const tabs = {}
const parts = form.split(/(?=<div className="talep-step)/)
parts.forEach((part, index) => {
  const [steps, footer = ''] = index === parts.length - 1 ? part.split('<div className="tlp-footer">') : [part]
  for (const text of textsIn(steps)) add(tabs, index === 0 ? 'Genel' : `${index}. Adım`, text)
  for (const text of textsIn(footer)) add(tabs, 'Düğmeler', text)
})
for (const text of textsIn(fs.readFileSync('src/lib/talepForm.js', 'utf8'))) add(tabs, 'Genel', text)
fs.writeFileSync(`${out}/talep.json`, JSON.stringify(tabs, null, 2) + '\n')

console.log(`tema verisi: ${Object.values(texts).flat().length} metin (${Object.entries(texts).map(([group, list]) => `${group} ${list.length}`).join(', ')})`)
