import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK, PARTICLE_VISUALS } from '../config'
import { getParticlePosition } from '../simulation/particle'

// Golden angle (degrees) for hue distribution — ensures visually distinct colors for nearby IDs
const GOLDEN_ANGLE_DEG = 137.508

function getParticleHue(id: number): number {
  return PARTICLE_VISUALS.hueMin + ((id * GOLDEN_ANGLE_DEG) % 360) / 360 * (PARTICLE_VISUALS.hueMax - PARTICLE_VISUALS.hueMin)
}

export function drawParticles(p: p5, particles: Particle[], _nodes: GraphNode[], _colors: typeof COLORS_DARK, nodeMap: Map<string, GraphNode>): void {
  // Use HSB color mode for easy hue-based individual colors
  // Note: p5 push/pop does NOT save colorMode, so we reset manually at the end
  p.colorMode(p.HSB, 360, 100, 100, 255)
  p.noStroke()

  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

    const alpha255 = 255 * pos.alpha

    // Failure states override individual identity hue; healthy particles get unique hues
    let hue = getParticleHue(particle.id)
    let sat = 90
    let bri = 100

    if (particle.state === 'exploded') {
      // White flash ring — preserve existing exploded behavior
      const pulse = (p.millis() % 500) / 500
      p.noFill()
      p.stroke(0, 0, 100, (1 - pulse) * 255 * pos.alpha)
      p.strokeWeight(2)
      p.ellipse(pos.x, pos.y, pulse * 40)
      p.noStroke()
      continue
    } else if (particle.state === 'recovering') {
      hue = 55   // yellow
      sat = 95
      bri = 100
    } else if (particle.state === 'failed') {
      const tier = particle.failureTier || 2
      if (tier === 3) {
        hue = 5    // red
        sat = 95
        bri = 100
      } else {
        hue = 28   // orange
        sat = 95
        bri = 100
      }
    }

    // Base size scales with journey progress (newer agents are smaller)
    const journeyT = particle.maxSteps > 0 ? particle.stepsCompleted / particle.maxSteps : 0
    const baseSize = PARTICLE_VISUALS.baseSizeMin + journeyT * (PARTICLE_VISUALS.baseSizeMax - PARTICLE_VISUALS.baseSizeMin)

    // 1. Outer glow aura (large soft halo in particle's color)
    p.fill(hue, sat, bri, PARTICLE_VISUALS.glowAlpha * pos.alpha)
    p.ellipse(pos.x, pos.y, baseSize * PARTICLE_VISUALS.glowMultiplier)

    // 2. Tapered trail from trail array (thick+bright at head, thin+dim at tail)
    const trail = particle.trail
    if (trail.length >= 2) {
      for (let i = 0; i < trail.length; i++) {
        const t = i / (trail.length - 1) // 0 = oldest tail, 1 = newest near-head
        const tt = Math.pow(t, PARTICLE_VISUALS.trailTaperPower)
        const trailSize = baseSize * 0.85 * tt + 0.4
        const trailAlpha = tt * 160 * pos.alpha
        if (trailAlpha < 2) continue
        p.fill(hue, sat, bri, trailAlpha)
        p.ellipse(trail[i].x, trail[i].y, trailSize)
      }
    }

    // 3. Orb body — simple circle (no rotation)
    p.fill(hue, sat, bri, alpha255 * 0.85)
    p.ellipse(pos.x, pos.y, baseSize)

    // 4. White-hot core — small bright center ensures visibility on ALL backgrounds
    // (critical for rainbow mode where cool-spectrum hues could blend in)
    p.fill(0, 0, 100, alpha255)
    p.ellipse(pos.x, pos.y, PARTICLE_VISUALS.coreSize)
  }

  // Restore RGB color mode so other renderers are unaffected
  p.colorMode(p.RGB, 255, 255, 255, 255)
}
