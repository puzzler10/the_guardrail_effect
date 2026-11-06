import p5 from 'p5'
import type { Particle, GraphNode } from '../types'
import { COLORS_DARK, PARTICLE_VISUALS } from '../config'
import { getParticlePosition } from '../simulation/particle'
import { swarmMemberOffset } from '../simulation/swarm'

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

    // 1. Outer glow aura at current position
    p.fill(hue, sat, bri, PARTICLE_VISUALS.glowAlpha * pos.alpha)
    p.ellipse(pos.x, pos.y, baseSize * PARTICLE_VISUALS.glowMultiplier)

    // 2. Motion-blur trail — short, sharp taper (smear not a tail)
    const trail = particle.trail
    if (trail.length >= 2) {
      for (let i = 0; i < trail.length; i++) {
        const t = i / (trail.length - 1) // 0=oldest, 1=newest
        const tt = Math.pow(t, PARTICLE_VISUALS.trailTaperPower)
        const trailSize = baseSize * 0.8 * tt + 0.3
        const trailAlpha = tt * 140 * pos.alpha
        if (trailAlpha < 2) continue
        p.fill(hue, sat, bri, trailAlpha)
        p.ellipse(trail[i].x, trail[i].y, trailSize)
      }
    }

    // 3. Comet body — elongated ellipse rotated along direction of travel
    let angle = 0
    if (trail.length >= 1) {
      const last = trail[trail.length - 1]
      const ddx = pos.x - last.x
      const ddy = pos.y - last.y
      if (Math.abs(ddx) > 0.01 || Math.abs(ddy) > 0.01) {
        angle = Math.atan2(ddy, ddx)
      }
    }
    p.push()
    p.translate(pos.x, pos.y)
    p.rotate(angle)
    p.fill(hue, sat, bri, alpha255 * 0.9)
    p.ellipse(0, 0, baseSize * PARTICLE_VISUALS.cometElongation, baseSize)
    p.pop()

    // 4. White-hot core
    p.fill(0, 0, 100, alpha255)
    p.ellipse(pos.x, pos.y, PARTICLE_VISUALS.coreSize)

    // 5. Helper subagents swarming around the lead agent
    if (particle.swarmSize) {
      const last = trail.length >= 1 ? trail[trail.length - 1] : pos
      drawSwarm(p, particle, pos.x, pos.y, pos.x - last.x, pos.y - last.y, hue, sat, bri, baseSize, pos.alpha)
    }
  }

  // Restore RGB color mode so other renderers are unaffected
  p.colorMode(p.RGB, 255, 255, 255, 255)
}

function drawSwarm(
  p: p5, particle: Particle, x: number, y: number, vx: number, vy: number,
  hue: number, sat: number, bri: number, baseSize: number, alpha: number,
): void {
  const now = p.millis()
  const size = baseSize * 0.55
  for (let m = 0; m < (particle.swarmSize ?? 0); m++) {
    const { dx, dy } = swarmMemberOffset(particle.id, m, particle.progress, now)
    const mx = x + dx
    const my = y + dy
    const h = (hue + (m - particle.swarmSize! / 2) * 6 + 360) % 360
    // short motion streak behind each helper
    p.fill(h, sat, bri, 60 * alpha)
    p.ellipse(mx - vx * 0.8, my - vy * 0.8, size * 0.8)
    p.fill(h, sat, bri, PARTICLE_VISUALS.glowAlpha * 1.4 * alpha)
    p.ellipse(mx, my, size * 2.6)
    p.fill(h, sat * 0.5, bri, 230 * alpha)
    p.ellipse(mx, my, size)
  }
}
