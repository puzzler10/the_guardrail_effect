import p5 from 'p5'
import { BACKGROUND, THEME } from '../config'

let stormBuffer: p5.Graphics
let cloudLayer2: p5.Graphics
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
  stormBuffer = p.createGraphics(p.width, p.height)
  stormBuffer.pixelDensity(1)
  
  cloudLayer2 = p.createGraphics(p.width, p.height)
  cloudLayer2.pixelDensity(1)

  rainbowBuffer = p.createGraphics(p.width, p.height)
  rainbowBuffer.pixelDensity(1)

  vignetteBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer.pixelDensity(1)

  updateStormBuffers(p)
  updateRainbowBuffer(p)
  updateVignetteBuffer(p)

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

function getSeamlessNoise(p: p5, x: number, y: number, w: number, scale: number, xOffset: number = 0) {
  const nx = x + xOffset
  const n1 = p.noise(nx * scale, y * scale)
  const blendZone = w * 0.2
  if (x > w - blendZone) {
    const n2 = p.noise((nx - w) * scale, y * scale)
    const t = (x - (w - blendZone)) / blendZone
    const smoothT = t * t * (3 - 2 * t)
    return p.lerp(n1, n2, smoothT)
  }
  return n1
}

function getSeamlessNoise3D(p: p5, x: number, y: number, z: number, w: number, scale: number) {
  const n1 = p.noise(x * scale, y * scale, z)
  const blendZone = w * 0.2
  if (x > w - blendZone) {
    const n2 = p.noise((x - w) * scale, y * scale, z)
    const t = (x - (w - blendZone)) / blendZone
    const smoothT = t * t * (3 - 2 * t)
    return p.lerp(n1, n2, smoothT)
  }
  return n1
}

function updateStormBuffers(p: p5) {
  if (!stormBuffer || !cloudLayer2) return
  
  const step = 8
  
  // Layer 1: Sharp, high-contrast dark clouds
  stormBuffer.clear(0, 0, 0, 0)
  stormBuffer.noStroke()
  for (let x = 0; x < p.width; x += step) {
    for (let y = 0; y < p.height; y += step) {
      const n = getSeamlessNoise(p, x, y, p.width, 0.002)
      if (n > 0.45) {
        // High contrast thresholding for "clumpy" storm clouds
        const brightness = p.map(n, 0.45, 1, 10, 80)
        stormBuffer.fill(brightness * 0.8, brightness * 0.9, brightness * 1.2, 255)
        stormBuffer.rect(x, y, step, step)
      }
    }
  }

  // Layer 2: Luminous "Angry" Red wisps
  cloudLayer2.clear(0, 0, 0, 0)
  cloudLayer2.noStroke()
  for (let x = 0; x < p.width; x += step) {
    for (let y = 0; y < p.height; y += step) {
      const n = getSeamlessNoise(p, x, y, p.width, 0.004, 500 / 0.004)
      if (n > 0.65) {
        // Luminous red "static" or lightning-esque energy
        const alpha = p.map(n, 0.65, 1, 0, 180)
        cloudLayer2.fill(180, 20, 40, alpha)
        cloudLayer2.rect(x, y, step, step)
      }
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
      const n = getSeamlessNoise3D(p, x, y, 100, p.width, BACKGROUND.noiseScale * 0.5)
      const hue = (n * 360) % 360
      rainbowBuffer.fill(hue, 70, 55, 1)
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
  const gradient = ctx.createRadialGradient(centerX, centerY, p.width * 0.1, centerX, centerY, p.width * 0.9)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.2)')
  gradient.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, p.width, p.height)
}

export function drawBackground(p: p5, guardrailsEnabled: boolean) {
  const target = guardrailsEnabled ? 1 : 0
  transitionFactor = p.lerp(transitionFactor, target, 0.04)

  p.push()
  if (transitionFactor < 0.99) {
    const stormAlpha = (1 - transitionFactor) * 255
    p.tint(255, stormAlpha)
    
    const offset1 = (p.frameCount * 0.4) % p.width
    const offset2 = (p.frameCount * 1.5) % p.width
    
    // Storm base
    p.image(stormBuffer, -offset1, 0)
    p.image(stormBuffer, p.width - offset1 - 1, 0)
    
    // Storm lightning/static wisps
    // Subtle flicker
    const flicker = p.noise(p.frameCount * 0.1) > 0.7 ? 1.5 : 1.0
    p.tint(255, stormAlpha * flicker)
    p.blendMode(p.SCREEN)
    p.image(cloudLayer2, -offset2, 0)
    p.image(cloudLayer2, p.width - offset2, 0)
    p.blendMode(p.BLEND)
  }
  
  if (transitionFactor > 0.01) {
    p.tint(255, transitionFactor * 255)
    const rOffset = (p.frameCount * BACKGROUND.noiseSpeed * 40) % p.width
    p.blendMode(p.SCREEN)
    p.image(rainbowBuffer, -rOffset, 0)
    p.image(rainbowBuffer, p.width - rOffset - 1, 0)
    p.blendMode(p.BLEND)
  }
  p.pop()

  p.noStroke()
  const dustAlpha = BACKGROUND.dustAlpha * (1 - transitionFactor * 0.5)
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
  cloudLayer2 = p.createGraphics(p.width, p.height)
  rainbowBuffer = p.createGraphics(p.width, p.height)
  vignetteBuffer = p.createGraphics(p.width, p.height)
  updateStormBuffers(p)
  updateRainbowBuffer(p)
  updateVignetteBuffer(p)
}
