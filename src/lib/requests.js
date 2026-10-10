import { SITE } from './site.js'

const wp = window.CRAYN ?? {}
const opened = Date.now()

export const SEND_FAILED = `Bir hata oluştu ve talebiniz bize ulaşmadı. Lütfen biraz sonra tekrar deneyin ya da ${SITE.email} adresine yazın.`

// Sends a request form's answers to the site, where they are kept in the panel and mailed on.
// `source` says which form they came from. The build that runs without WordPress has nowhere
// to send them, so there it resolves at once. Rejects when the site did not take the request.
export async function sendRequest(source, fields) {
  if (!wp.form) return

  const body = new FormData()
  body.append('action', 'crayn_talep')
  body.append('kaynak', source)
  body.append('sayfa', window.location.href)
  // How long the page had been open, in seconds: a form filled in an instant was not filled by a person.
  body.append('sure', String(Math.round((Date.now() - opened) / 1000)))
  for (const [name, value] of Object.entries(fields)) body.append(`alan[${name}]`, value)

  const response = await fetch(wp.form, { method: 'POST', body })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success) throw new Error('request not accepted')
}
