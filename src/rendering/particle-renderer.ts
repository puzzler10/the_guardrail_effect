import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK } from '../config'

export function getParticlePosition(particle: Particle, nodeMap: Map<string, GraphNode>): { x: number; y: number } | null {
  const from = nodeMap.get(particle.currentNodeId)
  const to = nodeMap.get(particle.targetNodeId)
  if (!from || !to) return null

  return {
    x: from.x + (to.x - from.x) * particle.progress,
    y: from.y + (to.y - from.y) * particle.progress,
  }
}

export function drawParticles(p: p5, particles: Particle[], nodes: GraphNode[], colors: typeof COLORS_DARK): void {
  const nodeMap = new Map<string, GraphNode>()
  for (const node of nodes) {
    nodeMap.set(node.id, node)
  }

  const particleColor = p.color(colors.particleHealthy)
  const trailColor = p.color(colors.particleHealthy)
  trailColor.setAlpha(255 * 0.15) // Fixed alpha for batching

  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

    // 1. Draw Trail (Batched)
    if (particle.trail.length > 1) {
      p.noFill()
      p.stroke(trailColor)
      p.strokeWeight(2)
      p.beginShape()
      for (const pt of particle.trail) {
        p.vertex(pt.x, pt.y)
      }
      p.endShape()
    }

    // 2. Draw Particle Dot
    let dotSize = 6
    let dotColor = particleColor
    
    if (particle.state === 'recovering') {
      dotColor = p.color(colors.tier1)
      dotSize = 6 + Math.sin(p.millis() * 0.01) * 2 // pulsing
    } else if (particle.state === 'failed') {
      const tier = particle.failureTier || 2
      dotColor = p.color(tier === 3 ? colors.tier3 : colors.tier2)
      // shrinking effect - we don't have a timeSinceFailure, 
      // so we can just make it smaller or use progress if it's "stuck"
      dotSize = 4
    } else if (particle.state === 'exploded') {
      // White flash ring
      const pulse = (p.millis() % 500) / 500
      p.noFill()
      const c = p.color(255)
      c.setAlpha((1 - pulse) * 255)
      p.stroke(c)
      p.strokeWeight(2)
      p.ellipse(pos.x, pos.y, pulse * 40)
      
      dotColor = p.color(255)
      dotSize = 0 // Gone after explosion
    }

    if (dotSize > 0) {
      p.noStroke()
      p.fill(dotColor)
      p.ellipse(pos.x, pos.y, dotSize)
    }
  }
}
