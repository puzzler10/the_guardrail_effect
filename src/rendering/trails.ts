import p5 from 'p5'
import { TRAIL, COLORS_DARK } from '../config'
import type { Particle, GraphNode } from '../types'
import { getParticlePosition } from '../simulation/particle'

let trailBuffer: p5.Graphics

export function initTrails(p: p5) {
  // Create a buffer that matches the simulation world size
  // Phase 7 expanded world to 2000x1400
  trailBuffer = p.createGraphics(2000, 1400)
  trailBuffer.pixelDensity(1)
  trailBuffer.clear()
}

export function drawTrails(p: p5, particles: Particle[], nodes: GraphNode[], colors: typeof COLORS_DARK) {
  if (!trailBuffer) return

  // 1. Slow fade of the buffer
  // We use a semi-transparent black to fade old trails
  // The alpha determines how long the "ghost" lasts
  trailBuffer.push()
  trailBuffer.fill(0, 15) // Lower = longer trails
  trailBuffer.noStroke()
  trailBuffer.rect(0, 0, trailBuffer.width, trailBuffer.height)
  trailBuffer.pop()

  const nodeMap = new Map<string, GraphNode>()
  for (const node of nodes) {
    nodeMap.set(node.id, node)
  }

  // Pre-cache colors
  const healthyColor = p.color(colors.particleHealthy)
  const tier1Color = p.color(colors.tier1)
  const tier2Color = p.color(colors.tier2)
  const tier3Color = p.color(colors.tier3)
  const explodedColor = p.color(255)

  // 2. Draw current particle positions to the buffer
  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

    let baseColor = healthyColor
    if (particle.state === 'recovering') baseColor = tier1Color
    else if (particle.state === 'failed') {
      const tier = particle.failureTier || 2
      baseColor = tier === 3 ? tier3Color : tier2Color
    } else if (particle.state === 'exploded') {
      baseColor = explodedColor
    }

    const r = p.red(baseColor)
    const g = p.green(baseColor)
    const b = p.blue(baseColor)

    // Draw a small glowing point to the buffer
    // The cumulative effect of these points creates the trail
    trailBuffer.noStroke()
    for (let i = 2; i > 0; i--) {
      const alpha = (TRAIL.alphaMax / 2) / i
      trailBuffer.fill(r, g, b, alpha)
      const size = (TRAIL.widthMax / 2) * (1 + i * 0.5)
      trailBuffer.ellipse(pos.x, pos.y, size)
    }
  }

  // 3. Draw the buffer to the main canvas
  // This should be called WITHIN the camera transform (push/pop in renderer.ts)
  p.push()
  p.blendMode(p.SCREEN) // Screen blending makes trails feel luminous
  p.image(trailBuffer, 0, 0)
  p.blendMode(p.BLEND)
  p.pop()
}

export function handleTrailsResize(_p: p5) {

  // Trail buffer is world-space, so resize only if world size changes
  // For now, we keep it fixed to world size
}
