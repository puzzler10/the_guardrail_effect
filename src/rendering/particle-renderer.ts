import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK } from '../config'

export function getParticlePosition(particle: Particle, nodes: GraphNode[]): { x: number; y: number } | null {
  const from = nodes.find(n => n.id === particle.currentNodeId)
  const to = nodes.find(n => n.id === particle.targetNodeId)
  if (!from || !to) return null

  return {
    x: from.x + (to.x - from.x) * particle.progress,
    y: from.y + (to.y - from.y) * particle.progress,
  }
}

export function drawParticles(p: p5, particles: Particle[], nodes: GraphNode[], colors: typeof COLORS_DARK): void {
  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodes)
    if (!pos) continue

    // 1. Draw Trail
    if (particle.trail.length > 1) {
      p.noFill()
      
      // Use drawing context for glow if possible
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = (p as any).drawingContext
      if (ctx) {
        ctx.shadowBlur = 4
        ctx.shadowColor = colors.particleHealthy
      }

      p.strokeWeight(2)
      for (let i = 0; i < particle.trail.length - 1; i++) {
        const alpha = (i / particle.trail.length) * 0.3 * 255
        const c = p.color(colors.particleHealthy)
        c.setAlpha(alpha)
        p.stroke(c)
        p.line(particle.trail[i].x, particle.trail[i].y, particle.trail[i + 1].x, particle.trail[i + 1].y)
      }

      if (ctx) {
        ctx.shadowBlur = 0
      }
    }

    // 2. Draw Particle Dot
    let dotSize = 6
    let dotColor = p.color(colors.particleHealthy)
    
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
