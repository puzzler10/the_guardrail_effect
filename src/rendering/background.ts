import p5 from 'p5'
import { BACKGROUND, COLORS_DARK } from '../config'

let noiseBuffer: p5.Graphics
let vignetteBuffer: p5.Graphics
let dustParticles: DustParticle[] = []

interface DustParticle {
  x: number
  y: number
  size: number
  noiseOffset: number
}

export function initBackground(p: p5, colors: typeof COLORS_DARK) {
  // 1. Create noise buffer
  noiseBuffer = p.createGraphics(p.width, p.height)
  noiseBuffer.pixelDensity(1)
  updateNoiseBuffer(p, colors)

  // 2. Create vignette buffer
  vignetteBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer.pixelDensity(1)
  updateVignetteBuffer(p)

  // 3. Initialize dust particles
  dustParticles = []
  for (let i = 0; i < BACKGROUND.dustCount; i++) {
    dustParticles.push({
      x: p.random(p.width),
      y: p.random(p.height),
      size: p.random(1, 2.5),
      noiseOffset: p.random(1000)
    })
  }
}

function updateNoiseBuffer(p: p5, colors: typeof COLORS_DARK) {
  if (!noiseBuffer) return
  
  noiseBuffer.clear(0, 0, 0, 0)
  const baseColor = p.color(colors.background)
  const r = p.red(baseColor)
  const g = p.green(baseColor)
  const b = p.blue(baseColor)

  const step = 8 // Skip pixels for performance
  noiseBuffer.noStroke()

  for (let x = 0; x < p.width; x += step) {
    for (let y = 0; y < p.height; y += step) {
      const n = p.noise(
        x * BACKGROUND.noiseScale, 
        y * BACKGROUND.noiseScale, 
        p.frameCount * BACKGROUND.noiseSpeed
      )
      
      // Variation: +/- noiseIntensity (5%)
      const variation = (n - 0.5) * 2 * (255 * BACKGROUND.noiseIntensity)
      noiseBuffer.fill(r + variation, g + variation, b + variation)
      noiseBuffer.rect(x, y, step, step)
    }
  }
}

function updateVignetteBuffer(p: p5) {
  if (!vignetteBuffer) return
  vignetteBuffer.clear(0, 0, 0, 0)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (vignetteBuffer as any).drawingContext as CanvasRenderingContext2D
  const centerX = p.width / 2
  const centerY = p.height / 2
  
  const gradient = ctx.createRadialGradient(
    centerX, centerY, p.width * 0.2,
    centerX, centerY, p.width * 0.8
  )
  
  // We'll draw the vignette with a fixed color, but vary its alpha in drawBackground
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,1)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, p.width, p.height)
}

export function drawBackground(p: p5, colors: typeof COLORS_DARK, isDarkMode: boolean) {
  // 1. Draw Noise Field (replaces p.background)
  if (p.frameCount % BACKGROUND.noiseUpdateInterval === 0) {
    updateNoiseBuffer(p, colors)
  }
  p.image(noiseBuffer, 0, 0)

  // 2. Draw Dust Particles (Screen space or world space? Task says "behind everything", 
  // but dust usually looks better if it doesn't move 1:1 with the camera)
  // Let's draw them in screen space for a more "atmospheric" feel (like specs on a lens)
  p.noStroke()
  const dustColor = p.color(isDarkMode ? 255 : 0)
  dustColor.setAlpha(BACKGROUND.dustAlpha)
  p.fill(dustColor)
  
  for (const dp of dustParticles) {
    // Noise-based drift
    const driftX = (p.noise(dp.noiseOffset + p.frameCount * 0.005) - 0.5) * BACKGROUND.dustSpeed * 2
    const driftY = (p.noise(dp.noiseOffset + 1000 + p.frameCount * 0.005) - 0.5) * BACKGROUND.dustSpeed * 2
    
    dp.x = (dp.x + driftX + p.width) % p.width
    dp.y = (dp.y + driftY + p.height) % p.height
    
    p.ellipse(dp.x, dp.y, dp.size)
  }
}

export function drawVignette(p: p5, isDarkMode: boolean) {
  const strength = isDarkMode ? BACKGROUND.vignetteStrength : BACKGROUND.vignetteLightStrength
  p.tint(255, strength * 255)
  p.image(vignetteBuffer, 0, 0)
  p.noTint()
}

export function handleResize(p: p5, colors: typeof COLORS_DARK) {
  noiseBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer = p.createGraphics(p.width, p.height)
  updateNoiseBuffer(p, colors)
  updateVignetteBuffer(p)
}
