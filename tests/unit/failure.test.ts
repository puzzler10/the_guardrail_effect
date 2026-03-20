import { describe, it, expect } from 'vitest'
import {
  computeFailureRate,
  rollFailure,
  pickTier,
  pickFailureText,
  createFailureEvent,
} from '../../src/simulation/failure'
import { MODEL_PRESETS, FAILURE_MESSAGES } from '../../src/config'

describe('computeFailureRate', () => {
  it('returns correct rate for known presets', () => {
    expect(computeFailureRate('safe', 'frontier', 1)).toBeCloseTo(0.001)
    expect(computeFailureRate('critical', 'strong', 1)).toBeCloseTo(0.10)
  })

  it('applies multiplier correctly', () => {
    expect(computeFailureRate('medium', 'frontier', 2)).toBeCloseTo(0.03)
    expect(computeFailureRate('medium', 'frontier', 0.5)).toBeCloseTo(0.0075)
  })

  it('clamps to [0, 1]', () => {
    expect(computeFailureRate('critical', 'small', 10)).toBe(1)
    expect(computeFailureRate('safe', 'frontier', 0)).toBe(0)
    expect(computeFailureRate('safe', 'frontier', -1)).toBe(0)
  })

  it('falls back to frontier for unknown preset', () => {
    expect(computeFailureRate('high', 'nonexistent', 1)).toBeCloseTo(
      MODEL_PRESETS.frontier.rates.high,
    )
  })
})

describe('rollFailure', () => {
  it('always returns false for rate 0', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollFailure(0)).toBe(false)
    }
  })

  it('always returns true for rate 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollFailure(1)).toBe(true)
    }
  })
})

describe('pickTier', () => {
  it('with guardrails: never returns tier 4', () => {
    for (let i = 0; i < 1000; i++) {
      const tier = pickTier('critical', true)
      expect(tier).not.toBe(4)
    }
  })

  it('with guardrails: tier 3 is rare (< 5% for critical risk)', () => {
    let tier3Count = 0
    const n = 1000
    for (let i = 0; i < n; i++) {
      if (pickTier('critical', true) === 3) tier3Count++
    }
    expect(tier3Count / n).toBeLessThan(0.05)
  })

  it('without guardrails, critical risk: returns tier 4 at meaningful rate', () => {
    let tier4Count = 0
    const n = 1000
    for (let i = 0; i < n; i++) {
      if (pickTier('critical', false) === 4) tier4Count++
    }
    // Expected ~25%, check it's at least 10%
    expect(tier4Count / n).toBeGreaterThan(0.10)
  })
})

describe('pickFailureText', () => {
  it('returns a non-empty string', () => {
    const text = pickFailureText(1)
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(0)
  })

  it('returns text from the correct tier message list', () => {
    for (const tier of [1, 2, 3, 4] as const) {
      const text = pickFailureText(tier)
      expect(FAILURE_MESSAGES[tier]).toContain(text)
    }
  })
})

describe('createFailureEvent', () => {
  it('assembles all fields correctly', () => {
    const event = createFailureEvent(2, 'node-1', 100, 200, 5000)
    expect(event.tier).toBe(2)
    expect(event.nodeId).toBe('node-1')
    expect(event.x).toBe(100)
    expect(event.y).toBe(200)
    expect(event.timestamp).toBe(5000)
    expect(FAILURE_MESSAGES[2]).toContain(event.text)
  })
})
