import p5 from 'p5'

export interface Effect {
  type: 'shockwave' | 'shake'
  x?: number
  y?: number
  startMs: number
  durationMs: number
}

export function createShockwave(x: number, y: number, nowMs: number): Effect {
  return {
    type: 'shockwave',
    x,
    y,
    startMs: nowMs,
    durationMs: 1000,
  }
}

export function createScreenShake(nowMs: number): Effect {
  return {
    type: 'shake',
    startMs: nowMs,
    durationMs: 500,
  }
}

export function drawEffects(p: p5, effects: Effect[], nowMs: number): void {
  for (const effect of effects) {
    if (effect.type === 'shockwave' && effect.x !== undefined && effect.y !== undefined) {
      const elapsed = nowMs - effect.startMs
      const progress = Math.min(elapsed / effect.durationMs, 1)
      const radius = progress * 200
      const alpha = (1 - progress) * 255

      // 1. Primary shockwave ring
      p.noFill()
      p.stroke(255, alpha)
      p.strokeWeight(2 + progress * 5) // Getting thicker as it expands
      p.ellipse(effect.x, effect.y, radius * 2)

      // 2. Secondary ripple (Phase 9)
      if (progress > 0.2) {
        const rippleProgress = (progress - 0.2) / 0.8
        const rippleRadius = rippleProgress * 150
        p.stroke(255, (1 - rippleProgress) * 100)
        p.strokeWeight(1)
        p.ellipse(effect.x, effect.y, rippleRadius * 2)
      }

      // 3. Debris particles (Phase 9)
      const seed = effect.startMs
      p.noStroke()
      for (let i = 0; i < 15; i++) {
        // Use noise for stable random-ish paths
        const angle = (p.noise(seed + i * 0.5) * p.TWO_PI * 2) + (progress * 0.5)
        const d = progress * 250 * (0.3 + p.noise(seed + i * 0.8) * 0.7)
        const dx = Math.cos(angle) * d
        const dy = Math.sin(angle) * d
        
        const size = (1 - progress) * (4 + p.noise(seed + i) * 4)
        const particleAlpha = (1 - Math.pow(progress, 2)) * 200
        
        p.fill(255, particleAlpha)
        p.ellipse(effect.x + dx, effect.y + dy, size)
      }
    }
  }
}

export function pruneEffects(effects: Effect[], nowMs: number): Effect[] {
  return effects.filter(effect => nowMs - effect.startMs < effect.durationMs)
}

export function getCameraShakeOffset(effects: Effect[], nowMs: number): { dx: number; dy: number } {
  let dx = 0
  let dy = 0

  for (const effect of effects) {
    if (effect.type === 'shake') {
      const elapsed = nowMs - effect.startMs
      const progress = Math.min(elapsed / effect.durationMs, 1)
      const intensity = (1 - progress) * 2 // Max offset ±2px

      dx += (Math.random() * 2 - 1) * intensity
      dy += (Math.random() * 2 - 1) * intensity
    }
  }

  return { dx, dy }
}
