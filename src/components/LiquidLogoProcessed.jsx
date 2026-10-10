import { LiquidMetal } from '@paper-design/shaders-react'
import { LOGO_ICON } from '../lib/site.js'
import { METAL } from './LiquidLogo.jsx'

// The liquid-metal logo for a mark set in the panel: the shader's picture of it is worked out
// here, in the visitor's browser, which keeps the page busy for a moment.
export default function LiquidLogoProcessed({ className }) {
  return <LiquidMetal className={className} image={LOGO_ICON} {...METAL} style={{ width: '100%', height: '100%' }} />
}
