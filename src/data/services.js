import APPROVED from './services.json'
import PAGE from './service-page.json'
import { withApprovedImages, withLocalImages } from '../lib/content.js'

const DEFAULTS = withLocalImages(APPROVED)

const wp = window.CRAYN ?? {}

const filled = (fields = {}) => Object.fromEntries(Object.entries(fields).filter(([, value]) => (Array.isArray(value) ? value.length : value)))
const approved = (slug) => DEFAULTS.find((service) => service.slug === slug) ?? {}

// In the data and in the panel, tags are typed as 'a, b' and a feature's points one per line.
const asList = (text = '', separator) => text.split(separator).map((item) => item.trim()).filter(Boolean)

// One entry per service page. Under WordPress the services are the ones entered in the panel,
// in its order; a field left empty there keeps the approved value of the service with that
// address. `features` become the tabs of the page's content section: `summary` is the line
// under the tab, `heading` and `points` fill the panel it opens. `steps` and `others` are the
// headings and steps of the page's two closing sections.
export const SERVICES = (wp.services?.length ? wp.services : DEFAULTS).map((entry) => {
  const service = { ...PAGE.service, ...approved(entry.slug), ...filled(entry) }
  return {
    ...service,
    tags: asList(service.tags, ','),
    features: withApprovedImages(service.features ?? [], approved(entry.slug).features).map((feature) => ({ ...feature, points: asList(feature.points, '\n') })),
    steps: { ...PAGE.service_steps, ...filled(entry.steps) },
    others: { ...PAGE.service_others, ...filled(entry.others) },
  }
})

export const findService = (slug) => SERVICES.find((service) => service.slug === slug)
