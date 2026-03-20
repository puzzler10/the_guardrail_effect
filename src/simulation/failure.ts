import type { RiskLevel, FailureTier, FailureEvent } from '../types'
import { MODEL_PRESETS, FAILURE_MESSAGES } from '../config'

// ─── Tier weight tables ─────────────────────────────────────────────────────

const TIER_WEIGHTS: Record<RiskLevel, [number, number, number, number]> = {
  safe:     [0.70, 0.25, 0.04, 0.01],
  low:      [0.70, 0.25, 0.04, 0.01],
  medium:   [0.50, 0.35, 0.12, 0.03],
  high:     [0.30, 0.40, 0.20, 0.10],
  critical: [0.15, 0.30, 0.30, 0.25],
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeFailureRate(
  risk: RiskLevel,
  presetKey: string,
  multiplier: number,
): number {
  const preset = MODEL_PRESETS[presetKey] ?? MODEL_PRESETS.frontier
  return Math.max(0, Math.min(1, preset.rates[risk] * multiplier))
}

export function rollFailure(rate: number): boolean {
  return Math.random() < rate
}

export function pickTier(risk: RiskLevel, guardrailsEnabled: boolean): FailureTier {
  const weights = [...TIER_WEIGHTS[risk]] as [number, number, number, number]

  if (guardrailsEnabled) {
    // Block tier 4 entirely, reduce tier 3 by 95%
    const removedT4 = weights[3]
    const removedT3 = weights[2] * 0.95
    weights[3] = 0
    weights[2] *= 0.05
    // Redistribute to tier 1 and 2 proportionally
    const redistribute = removedT4 + removedT3
    const t1t2Sum = weights[0] + weights[1]
    if (t1t2Sum > 0) {
      weights[0] += redistribute * (weights[0] / t1t2Sum)
      weights[1] += redistribute * (weights[1] / t1t2Sum)
    } else {
      weights[0] += redistribute
    }
  }

  // Normalize and pick via cumulative distribution
  const total = weights[0] + weights[1] + weights[2] + weights[3]
  const roll = Math.random() * total
  let cumulative = 0
  for (let i = 0; i < 4; i++) {
    cumulative += weights[i]
    if (roll < cumulative) return (i + 1) as FailureTier
  }
  return 1 // fallback (shouldn't reach here)
}

export function pickFailureText(tier: FailureTier): string {
  const messages = FAILURE_MESSAGES[tier]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function createFailureEvent(
  tier: FailureTier,
  nodeId: string,
  x: number,
  y: number,
  timestamp: number,
): FailureEvent {
  return {
    text: pickFailureText(tier),
    tier,
    nodeId,
    x,
    y,
    timestamp,
  }
}
