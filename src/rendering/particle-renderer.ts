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
  const ctx = p.drawingContext as CanvasRenderingContext2D
  ctx.save() // native draws below must not leak fill/stroke state into p5

  for (const particle of particles) {
    const pos = getParticlePosition(particle, nodeMap)
    if (!pos) continue

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

    if (particle.swarmSize) {
      drawSwarm(p, particle, pos.x, pos.y, hue, sat, bri, pos.alpha, nodeMap)
      continue
    }

    drawSoloAgent(ctx, particle, pos.x, pos.y, pos.alpha, hsbToRgb(hue, sat, bri))
  }

  ctx.restore()

  // Restore RGB color mode so other renderers are unaffected
  p.colorMode(p.RGB, 255, 255, 255, 255)
}

const TWO_PI = Math.PI * 2

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TWO_PI)
  ctx.fill()
}

/**
 * Draws a solo agent (glow, tapered trail, comet body, white core) with native
 * canvas calls — much cheaper than p5 fill()/ellipse() at high agent counts.
 */
function drawSoloAgent(
  ctx: CanvasRenderingContext2D, particle: Particle,
  x: number, y: number, alpha: number, [r, g, b]: [number, number, number],
): void {
  const rgba = (a255: number) => `rgba(${r},${g},${b},${(a255 / 255).toFixed(3)})`

  // Base size scales with journey progress (newer agents are smaller)
  const journeyT = particle.maxSteps > 0 ? particle.stepsCompleted / particle.maxSteps : 0
  const baseSize = PARTICLE_VISUALS.baseSizeMin + journeyT * (PARTICLE_VISUALS.baseSizeMax - PARTICLE_VISUALS.baseSizeMin)

  // 1. Outer glow aura
  ctx.fillStyle = rgba(PARTICLE_VISUALS.glowAlpha * alpha)
  disc(ctx, x, y, baseSize * PARTICLE_VISUALS.glowMultiplier / 2)

  // 2. Motion-blur trail — short, sharp taper (smear not a tail)
  const trail = particle.trail
  if (trail.length >= 2) {
    for (let i = 0; i < trail.length; i++) {
      const tt = Math.pow(i / (trail.length - 1), PARTICLE_VISUALS.trailTaperPower)
      const trailAlpha = tt * 140 * alpha
      if (trailAlpha < 2) continue
      ctx.fillStyle = rgba(trailAlpha)
      disc(ctx, trail[i].x, trail[i].y, (baseSize * 0.8 * tt + 0.3) / 2)
    }
  }

  // 3. Comet body — elongated ellipse rotated along direction of travel
  let angle = 0
  if (trail.length >= 1) {
    const last = trail[trail.length - 1]
    const ddx = x - last.x
    const ddy = y - last.y
    if (Math.abs(ddx) > 0.01 || Math.abs(ddy) > 0.01) angle = Math.atan2(ddy, ddx)
  }
  ctx.fillStyle = rgba(255 * alpha * 0.9)
  ctx.beginPath()
  ctx.ellipse(x, y, baseSize * PARTICLE_VISUALS.cometElongation / 2, baseSize / 2, angle, 0, TWO_PI)
  ctx.fill()

  // 4. White-hot core
  ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
  disc(ctx, x, y, PARTICLE_VISUALS.coreSize / 2)
}

function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  const sat = s / 100
  const v = b / 100
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => v * (1 - sat * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)]
}

const SWARM_STREAK_MS = 60
const SWARM_STREAK_PX = 5

/**
 * Draws a swarm of helper subagents with batched native canvas calls
 * (3 draw calls per swarm instead of several per helper).
 */
function drawSwarm(
  p: p5, particle: Particle, x: number, y: number,
  hue: number, sat: number, bri: number, alpha: number,
  nodeMap: Map<string, GraphNode>,
): void {
  const from = nodeMap.get(particle.currentNodeId)
  const to = nodeMap.get(particle.targetNodeId)
  if (!from || !to) return
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1
  const ex = (to.x - from.x) / len
  const ey = (to.y - from.y) / len

  const now = p.millis()
  const n = particle.swarmSize ?? 0
  const ctx = p.drawingContext as CanvasRenderingContext2D
  const [r, g, b] = hsbToRgb(hue, sat, bri)
  const [cr, cg, cb] = hsbToRgb(hue, sat * 0.35, 100)
  // Streak tail: a short step back along the edge plus each helper's own recent darting
  const lx = x - ex * SWARM_STREAK_PX
  const ly = y - ey * SWARM_STREAK_PX

  const xs: number[] = []
  const ys: number[] = []
  const pxs: number[] = []
  const pys: number[] = []
  for (let m = 0; m < n; m++) {
    const o = swarmMemberOffset(particle.id, m, particle.progress, now, ex, ey, len)
    const po = swarmMemberOffset(particle.id, m, particle.progress, now - SWARM_STREAK_MS, ex, ey, len)
    xs.push(x + o.dx); ys.push(y + o.dy)
    pxs.push(lx + po.dx); pys.push(ly + po.dy)
  }

  ctx.save()
  ctx.globalAlpha = alpha

  // Soft shared glow
  ctx.fillStyle = `rgba(${r},${g},${b},0.16)`
  ctx.beginPath()
  for (let m = 0; m < n; m++) { ctx.moveTo(xs[m] + 5, ys[m]); ctx.arc(xs[m], ys[m], 5, 0, Math.PI * 2) }
  ctx.fill()

  // Motion streaks
  ctx.strokeStyle = `rgba(${r},${g},${b},0.55)`
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let m = 0; m < n; m++) { ctx.moveTo(pxs[m], pys[m]); ctx.lineTo(xs[m], ys[m]) }
  ctx.stroke()

  // Bright cores
  ctx.fillStyle = `rgb(${cr},${cg},${cb})`
  ctx.beginPath()
  for (let m = 0; m < n; m++) { ctx.moveTo(xs[m] + 1.3, ys[m]); ctx.arc(xs[m], ys[m], 1.3, 0, Math.PI * 2) }
  ctx.fill()

  ctx.restore()
}
