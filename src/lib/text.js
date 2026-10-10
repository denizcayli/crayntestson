const wp = window.CRAYN ?? {}
const everywhere = wp.texts ?? {}

// A fixed text of the site (a label, a button). Under WordPress each one can be replaced in the
// panel, which lists them by the text written here; one left empty there stays as it is.
export const t = (text) => everywhere[text] || text

// The same for a part of the site that is edited in a place of its own in the panel: 'talep'
// is the request form (its page), 'kart' the request card (its settings page).
export function scoped(scope) {
  const own = wp.scopes?.[scope] ?? {}
  return (text) => own[text] || everywhere[text] || text
}
