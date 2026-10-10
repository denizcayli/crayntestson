import { lazy, Suspense } from 'react'
import { ShaderMount, getShaderColorFromString } from '@paper-design/shaders-react'
import { defaultObjectSizing, liquidMetalFragmentShader, LiquidMetalShapes, ShaderFitOptions } from '@paper-design/shaders'
import { LOGO_ICON, SITE } from '../lib/site.js'
import { withBase } from '../lib/paths.js'

export const LOGO_URL = LOGO_ICON

// The look of the metal.
export const METAL = {
  colorBack: '#00000000',
  colorTint: '#c9d8ff',
  repetition: 3,
  softness: 0.3,
  shiftRed: 0.2,
  shiftBlue: 0.4,
  distortion: 0.1,
  contour: 0.6,
  speed: 1.2,
  scale: 1,
}

// What the shader draws from is not the logo itself but a picture worked out from it
// (`toProcessedLiquidMetal` of the shader library). For the site's own mark that picture is
// kept as a file, so a visitor's browser does not have to work it out; it has to be made again
// if crayn-icon.png changes. A mark set in the panel is worked out on the spot instead.
const PROCESSED = withBase('/assets/brand/crayn-icon-metal.png')
const LiquidLogoProcessed = lazy(() => import('./LiquidLogoProcessed.jsx'))

const UNIFORMS = {
  u_colorBack: getShaderColorFromString(METAL.colorBack),
  u_colorTint: getShaderColorFromString(METAL.colorTint),
  u_image: PROCESSED,
  u_contour: METAL.contour,
  u_distortion: METAL.distortion,
  u_softness: METAL.softness,
  u_repetition: METAL.repetition,
  u_shiftRed: METAL.shiftRed,
  u_shiftBlue: METAL.shiftBlue,
  u_angle: 70,
  u_isImage: true,
  u_shape: LiquidMetalShapes.diamond,
  u_fit: ShaderFitOptions[defaultObjectSizing.fit],
  u_scale: METAL.scale,
  u_rotation: defaultObjectSizing.rotation,
  u_offsetX: defaultObjectSizing.offsetX,
  u_offsetY: defaultObjectSizing.offsetY,
  u_originX: defaultObjectSizing.originX,
  u_originY: defaultObjectSizing.originY,
  u_worldWidth: defaultObjectSizing.worldWidth,
  u_worldHeight: defaultObjectSizing.worldHeight,
}

// The Crayn icon in flowing liquid metal: the shader keeps only the logo's silhouette and fills
// it with moving chrome. It fills its parent, which sets the size, edge to edge.
export default function LiquidLogo({ className }) {
  if (SITE.icon) {
    return (
      <Suspense fallback={null}>
        <LiquidLogoProcessed className={className} />
      </Suspense>
    )
  }
  return (
    <ShaderMount
      className={className}
      speed={METAL.speed}
      frame={0}
      fragmentShader={liquidMetalFragmentShader}
      mipmaps={['u_image']}
      uniforms={UNIFORMS}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
