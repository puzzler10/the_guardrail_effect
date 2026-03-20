import { describe, it, expect } from 'vitest'
import { MODEL_PRESETS, DEFAULT_CONFIG, FAILURE_MESSAGES, GUARDRAIL_MESSAGES, UI } from '../../src/config'

describe('MODEL_PRESETS', () => {
  const riskLevels = ['safe', 'low', 'medium', 'high', 'critical'] as const

  it('has all 5 presets', () => {
    expect(Object.keys(MODEL_PRESETS)).toHaveLength(5)
  })

  it('all presets have failure rates for every risk level', () => {
    for (const [key, preset] of Object.entries(MODEL_PRESETS)) {
      for (const level of riskLevels) {
        expect(preset.rates[level], `${key}.rates.${level}`).toBeGreaterThan(0)
        expect(preset.rates[level], `${key}.rates.${level}`).toBeLessThan(1)
      }
    }
  })

  it('frontier has lower rates than strong across all levels', () => {
    for (const level of riskLevels) {
      expect(MODEL_PRESETS.frontier.rates[level]).toBeLessThan(MODEL_PRESETS.strong.rates[level])
    }
  })

  it('rates increase with risk level within each preset', () => {
    for (const preset of Object.values(MODEL_PRESETS)) {
      expect(preset.rates.safe).toBeLessThan(preset.rates.low)
      expect(preset.rates.low).toBeLessThan(preset.rates.medium)
      expect(preset.rates.medium).toBeLessThan(preset.rates.high)
      expect(preset.rates.high).toBeLessThan(preset.rates.critical)
    }
  })
})

describe('DEFAULT_CONFIG', () => {
  it('has a valid model preset key', () => {
    expect(MODEL_PRESETS[DEFAULT_CONFIG.modelPreset]).toBeDefined()
  })

  it('failureMultiplier is within UI limits', () => {
    expect(DEFAULT_CONFIG.failureMultiplier).toBeGreaterThanOrEqual(UI.failureMultiplierMin)
    expect(DEFAULT_CONFIG.failureMultiplier).toBeLessThanOrEqual(UI.failureMultiplierMax)
  })

  it('agentSpeed is within UI limits', () => {
    expect(DEFAULT_CONFIG.agentSpeed).toBeGreaterThanOrEqual(UI.agentSpeedMin)
    expect(DEFAULT_CONFIG.agentSpeed).toBeLessThanOrEqual(UI.agentSpeedMax)
  })

  it('particleCount is within UI limits', () => {
    expect(DEFAULT_CONFIG.particleCount).toBeGreaterThanOrEqual(UI.particleCountMin)
    expect(DEFAULT_CONFIG.particleCount).toBeLessThanOrEqual(UI.particleCountMax)
  })

  it('soundVolume is in [0, 1]', () => {
    expect(DEFAULT_CONFIG.soundVolume).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_CONFIG.soundVolume).toBeLessThanOrEqual(1)
  })

  it('sound is disabled by default', () => {
    expect(DEFAULT_CONFIG.soundEnabled).toBe(false)
  })

  it('guardrails are disabled by default', () => {
    expect(DEFAULT_CONFIG.guardrailsEnabled).toBe(false)
  })
})

describe('FAILURE_MESSAGES', () => {
  it('has messages for all 4 tiers', () => {
    expect(FAILURE_MESSAGES[1].length).toBeGreaterThan(0)
    expect(FAILURE_MESSAGES[2].length).toBeGreaterThan(0)
    expect(FAILURE_MESSAGES[3].length).toBeGreaterThan(0)
    expect(FAILURE_MESSAGES[4].length).toBeGreaterThan(0)
  })

  it('tier 4 messages start with an uppercase letter', () => {
    for (const msg of FAILURE_MESSAGES[4]) {
      expect(msg[0]).toBe(msg[0].toUpperCase())
    }
  })
})

describe('GUARDRAIL_MESSAGES', () => {
  it('has at least 5 messages', () => {
    expect(GUARDRAIL_MESSAGES.length).toBeGreaterThanOrEqual(5)
  })
})
