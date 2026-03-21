import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK, TRAIL } from '../config'

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

  // Pre-cache colors for performance
  const healthyColor = p.color(colors.particleHealthy)
  const tier1Color = p.color(colors.tier1)
  const tier2Color = p.color(colors.tier2)
  const tier3Color = p.color(colors.tier3)
  const explodedColor = p.color(255)

  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

    // 1. Draw Trail (Gradient & Tapered)
    if (particle.trail.length > 1) {
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

      const trailLen = particle.trail.length
      p.noFill()
      
      for (let i = 1; i < trailLen; i++) {
        const progress = i / (trailLen - 1)
        const alpha = Math.pow(progress, TRAIL.alphaExponent) * TRAIL.alphaMax
        const weight = TRAIL.widthMin + progress * (TRAIL.widthMax - TRAIL.widthMin)

        p.stroke(r, g, b, alpha)
        p.strokeWeight(weight)

        const p1 = particle.trail[i - 1]
        const p2 = particle.trail[i]

        if (TRAIL.smoothing && trailLen >= 4) {
          // For Catmull-Rom, we need 4 points. 
          // p0 and p3 are the control points.
          const p0 = particle.trail[Math.max(0, i - 2)]
          const p3 = particle.trail[Math.min(trailLen - 1, i + 1)]
          p.spline(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
        } else {
          p.line(p1.x, p1.y, p2.x, p2.y)
        }
      }
    }

    // 2. Draw Particle Dot
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
      c.setAlpha((1 - pulse) * 255)
      p.stroke(c)
      p.strokeWeight(2)
      p.ellipse(pos.x, pos.y, pulse * 40)
      
      dotColor = explodedColor
      dotSize = 0 // Gone after explosion
    }

    if (dotSize > 0) {
      p.noStroke()
      p.fill(dotColor)
      p.ellipse(pos.x, pos.y, dotSize)
    }
  }
}
