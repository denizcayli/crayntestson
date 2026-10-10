import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { loadPage } from './lib/route.js'

// Order matches the original site: Tailwind, Swiper, then the theme overrides.
import './styles/index.css'
import 'swiper/css/bundle'
import './styles/theme.css'
import './styles/talep.css'
import './styles/prose.css'
import './styles/post-row.css'
import './styles/faq.css'
import './styles/mullion.css'
import './styles/menu.css'
import './styles/glass-button.css'

// The page's own code is fetched alongside this file (the theme preloads it), then drawn at once.
const Page = await loadPage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App Page={Page} />
  </StrictMode>,
)
