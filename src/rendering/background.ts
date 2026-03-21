import p5 from 'p5'
import { BACKGROUND, THEME } from '../config'

let stormBuffer: p5.Graphics
let rainbowBuffer: p5.Graphics
let vignetteBuffer: p5.Graphics
let dustParticles: DustParticle[] = []
let transitionFactor = 0 // 0 = storm, 1 = rainbow

interface DustParticle {
  x: number
  y: number
  size: number
  noiseOffset: number
}

export function initBackground(p: p5) {
  // 1. Create buffers
  stormBuffer = p.createGraphics(p.width, p.height)
  stormBuffer.pixelDensity(1)
  
  rainbowBuffer = p.createGraphics(p.width, p.height)
  rainbowBuffer.pixelDensity(1)

  vignetteBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer.pixelDensity(1)

  updateStormBuffer(p)
  updateRainbowBuffer(p)
  updateVignetteBuffer(p)

  // 2. Initialize dust particles
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

function updateStormBuffer(p: p5) {
  if (!stormBuffer) return
  stormBuffer.clear(0, 0, 0, 0)
  const baseColor = p.color(THEME.storm.background)
  const r = p.red(baseColor)
  const g = p.green(baseColor)
  const b = p.blue(baseColor)
  const step = 8
  stormBuffer.noStroke()
  for (let x = 0; x < p.width; x += step) {
    for (let y = 0; y < p.height; y += step) {
      const n = p.noise(x * BACKGROUND.noiseScale, y * BACKGROUND.noiseScale, 0)
      const variation = (n - 0.5) * 2 * (255 * THEME.storm.noiseIntensity)
      stormBuffer.fill(r + variation, g + variation, b + variation)
      stormBuffer.rect(x, y, step, step)
    }
  }
}

function updateRainbowBuffer(p: p5) {
  if (!rainbowBuffer) return
  rainbowBuffer.clear(0, 0, 0, 0)
  rainbowBuffer.colorMode(p.HSB, 360, 100, 100, 1)
  const step = 8
  rainbowBuffer.noStroke()
  for (let x = 0; x < p.width; x += step) {
    for (let y = 0; y < p.height; y += step) {
      const n = p.noise(x * BACKGROUND.noiseScale * 0.5, y * BACKGROUND.noiseScale * 0.5, 100)
      // Soft rainbow hues
      const hue = (n * 360) % 360
      rainbowBuffer.fill(hue, 30, 15, 1)
      rainbowBuffer.rect(x, y, step, step)
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
  const gradient = ctx.createRadialGradient(centerX, centerY, p.width * 0.2, centerX, centerY, p.width * 0.8)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, p.width, p.height)
}

export function drawBackground(p: p5, guardrailsEnabled: boolean) {
  // Lerp transition factor
  const target = guardrailsEnabled ? 1 : 0
  transitionFactor = p.lerp(transitionFactor, target, 0.05)

  // 1. Draw Buffers
  const offset = (p.frameCount * BACKGROUND.noiseSpeed * 100) % p.width
  
  p.push()
  if (transitionFactor < 0.99) {
    p.tint(255, (1 - transitionFactor) * 255)
    p.image(stormBuffer, -offset, 0)
    p.image(stormBuffer, p.width - offset, 0)
  }
  
  if (transitionFactor > 0.01) {
    p.tint(255, transitionFactor * 255)
    // Rainbow buffer rolls slightly differently
    const rOffset = (p.frameCount * BACKGROUND.noiseSpeed * 40) % p.width
    p.image(rainbowBuffer, -rOffset, 0)
    p.image(rainbowBuffer, p.width - rOffset, 0)
  }
  p.pop()

  // 2. Dust Particles
  p.noStroke()
  const dustAlpha = BACKGROUND.dustAlpha * (1 - transitionFactor * 0.5) // Less dust in rainbow mode
  p.fill(255, dustAlpha)
  for (const dp of dustParticles) {
    const driftX = (p.noise(dp.noiseOffset + p.frameCount * 0.005) - 0.5) * BACKGROUND.dustSpeed * 2
    const driftY = (p.noise(dp.noiseOffset + 1000 + p.frameCount * 0.005) - 0.5) * BACKGROUND.dustSpeed * 2
    dp.x = (dp.x + driftX + p.width) % p.width
    dp.y = (dp.y + driftY + p.height) % p.height
    p.ellipse(dp.x, dp.y, dp.size)
  }
}

export function drawVignette(p: p5, _guardrailsEnabled: boolean) {
  const stormV = THEME.storm.vignette
  const rainbowV = THEME.rainbow.vignette
  const strength = p.lerp(stormV, rainbowV, transitionFactor)
  p.tint(255, strength * 255)
  p.image(vignetteBuffer, 0, 0)
  p.noTint()
}

export function handleResize(p: p5) {
  stormBuffer = p.createGraphics(p.width, p.height)
  rainbowBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer = p.createGraphics(p.width, p.height)
  updateStormBuffer(p)
  updateRainbowBuffer(p)
  updateVignetteBuffer(p)
}
