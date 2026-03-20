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

      p.noFill()
      p.stroke(255, alpha)
      p.strokeWeight(2)
      p.ellipse(effect.x, effect.y, radius * 2)
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
      const intensity = (1 - progress) * 8 // Max offset ±8px

      dx += (Math.random() * 2 - 1) * intensity
      dy += (Math.random() * 2 - 1) * intensity
    }
  }

  return { dx, dy }
}
