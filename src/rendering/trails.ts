import p5 from 'p5'
import { TRAIL, COLORS_DARK, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import type { Particle, GraphNode } from '../types'
import { getParticlePosition } from '../simulation/particle'

let trailBuffer: p5.Graphics
let frameCount = 0

export function initTrails(p: p5) {
  trailBuffer = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT)
  trailBuffer.pixelDensity(1)
  trailBuffer.clear()
}

export function drawTrails(p: p5, particles: Particle[], _nodes: GraphNode[], colors: typeof COLORS_DARK, nodeMap: Map<string, GraphNode>) {
  if (!trailBuffer) return
  frameCount++

  // Only update the buffer every other frame to halve the pixel-fill cost
  if (frameCount % 2 === 0) {
    trailBuffer.push()
    trailBuffer.fill(0, 55) // faster fade keeps buffer lighter
    trailBuffer.noStroke()
    trailBuffer.rect(0, 0, trailBuffer.width, trailBuffer.height)
    trailBuffer.pop()

    const healthyColor = p.color(colors.particleHealthy)
    const tier1Color = p.color(colors.tier1)
    const tier2Color = p.color(colors.tier2)
    const tier3Color = p.color(colors.tier3)
    const explodedColor = p.color(255)

    for (const particle of particles) {
      const pos = getParticlePosition(particle, nodeMap)
      if (!pos) continue

      let baseColor = healthyColor
      if (particle.state === 'recovering') baseColor = tier1Color
      else if (particle.state === 'failed') {
        baseColor = (particle.failureTier || 2) === 3 ? tier3Color : tier2Color
      } else if (particle.state === 'exploded') {
        baseColor = explodedColor
      }

      trailBuffer.noStroke()
      const alpha = (TRAIL.alphaMax / 2) * pos.alpha
      trailBuffer.fill(p.red(baseColor), p.green(baseColor), p.blue(baseColor), alpha)
      trailBuffer.ellipse(pos.x, pos.y, TRAIL.widthMax)
    }
  }

  p.push()
  p.blendMode(p.SCREEN)
  p.image(trailBuffer, 0, 0)
  p.blendMode(p.BLEND)
  p.pop()
}

export function handleTrailsResize(_p: p5) {
  // Trail buffer is world-space, unchanged on viewport resize
}
