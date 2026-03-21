import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK } from '../config'
import { getParticlePosition } from '../simulation/particle'

export function drawParticles(p: p5, particles: Particle[], nodes: GraphNode[], colors: typeof COLORS_DARK): void {
  const nodeMap = new Map<string, GraphNode>()
  for (const node of nodes) {
    nodeMap.set(node.id, node)
  }

  // Pre-cache colors for performance
  const healthyColor = p.color(colors.particleHealthy)
  const tier1Color = p.color(colors.tier1)
  const tier2Color = p.color(colors.tier2)
  const tier3Color = p.color(colors.tier3)
  const explodedColor = p.color(255)

  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

    // 1. Draw Particle Dot (Trails are now handled by drawTrails buffer)
    let dotSize = 6
    let dotColor = healthyColor

    if (particle.state === 'recovering') {
      dotColor = tier1Color
      dotSize = 6 + Math.sin(p.millis() * 0.01) * 2 // pulsing
    } else if (particle.state === 'failed') {
      const tier = particle.failureTier || 2
      dotColor = tier === 3 ? tier3Color : tier2Color
      dotSize = 4
    } else if (particle.state === 'exploded') {
      // White flash ring
      const pulse = (p.millis() % 500) / 500
      p.noFill()
      const c = p.color(255)
      c.setAlpha((1 - pulse) * 255 * pos.alpha)
      p.stroke(c)
      p.strokeWeight(2)
      p.ellipse(pos.x, pos.y, pulse * 40)

      dotColor = explodedColor
      dotSize = 0 // Gone after explosion
    }

    if (dotSize > 0) {
      p.noStroke()
      const dc = p.color(dotColor)
      dc.setAlpha(p.alpha(dotColor) * pos.alpha)
      p.fill(dc)
      p.ellipse(pos.x, pos.y, dotSize)
    }
  }
}
