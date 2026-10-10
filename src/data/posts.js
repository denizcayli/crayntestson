import APPROVED from './posts.json'
import { withLocalImages } from '../lib/content.js'

const DEFAULTS = withLocalImages(APPROVED)

const wp = window.CRAYN ?? {}

// Posts shown in the content section and on /icerikler, newest first. Under WordPress they are
// the site's own posts. `body` is a list of blocks: a string is a paragraph, { h } a subheading
// and { list } a bulleted list; a post written in the panel has `bodyHtml` instead.
// A post of the panel with no picture of its own keeps the approved picture of the post at its address.
export const POSTS = wp.posts?.length
  ? wp.posts.map((post) => (post.image ? post : { ...post, image: DEFAULTS.find((approved) => approved.slug === post.slug)?.image }))
  : DEFAULTS

export const findPost = (slug) => POSTS.find((post) => post.slug === slug)
