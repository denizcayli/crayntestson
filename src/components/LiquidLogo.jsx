import { LiquidMetal } from '@paper-design/shaders-react'
import { LOGO_ICON } from '../lib/site.js'

export const LOGO_URL = LOGO_ICON

// The Crayn icon in flowing liquid metal: the shader keeps only the logo's silhouette and fills
// it with moving chrome. It fills its parent, which sets the size, edge to edge.
export default function LiquidLogo({ className }) {
  return (
    <LiquidMetal
      className={className}
      image={LOGO_URL}
      colorBack="#00000000"
      colorTint="#c9d8ff"
      repetition={3}
      softness={0.3}
      shiftRed={0.2}
      shiftBlue={0.4}
      distortion={0.1}
      contour={0.6}
      speed={1.2}
      scale={1}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
