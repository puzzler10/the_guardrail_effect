import { describe, it, expect } from 'vitest'
import { createSimulation, tick, applyConfig } from '../../src/simulation/simulation'

describe('Guardrail Effectiveness Integration', () => {
  it('should eliminate tier 4 failures when guardrails are enabled', () => {
    let state = createSimulation({
      guardrailsEnabled: true,
      failureMultiplier: 10,
      modelPreset: 'small',
      particleCount: 100,
      agentSpeed: 4,
    })
    const deltaMs = 16
    let nowMs = 0

    for (let i = 0; i < 2000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    expect(state.stats.catastrophic).toBe(0)
  })

  it('should significantly reduce tier 3 failures', () => {
    const runSimulation = (guardrails: boolean) => {
      let state = createSimulation({
        guardrailsEnabled: guardrails,
        failureMultiplier: 10,
        modelPreset: 'small',
        particleCount: 200,
        agentSpeed: 8,
      })
      const deltaMs = 16
      let nowMs = 0
      let tier3Count = 0

      for (let i = 0; i < 5000; i++) {
        const currentTickMs = nowMs
        state = tick(state, deltaMs, nowMs)
        nowMs += deltaMs

        state.recentFailures.forEach(f => {
          if (f.timestamp === currentTickMs && f.tier === 3) tier3Count++
        })
      }
      return tier3Count
    }

    const tier3Without = runSimulation(false)
    const tier3With = runSimulation(true)

    if (tier3Without > 0) {
      expect(tier3With).toBeLessThan(tier3Without * 0.15)
    }
  })

  it('should leave tier 1-2 failures approximately unchanged', () => {
    const runSimulation = (guardrails: boolean) => {
      let state = createSimulation({
        guardrailsEnabled: guardrails,
        failureMultiplier: 2,
        modelPreset: 'midtier',
        particleCount: 200,
        agentSpeed: 8,
      })
      const deltaMs = 16
      let nowMs = 0
      let tier12Count = 0

      for (let i = 0; i < 5000; i++) {
        const currentTickMs = nowMs
        state = tick(state, deltaMs, nowMs)
        nowMs += deltaMs

        state.recentFailures.forEach(f => {
          if (f.timestamp === currentTickMs && (f.tier === 1 || f.tier === 2)) tier12Count++
        })
      }
      return tier12Count
    }

    const tier12Without = runSimulation(false)
    const tier12With = runSimulation(true)

    if (tier12Without > 20) {
      const ratio = tier12With / tier12Without
      expect(ratio).toBeGreaterThan(0.3)
      expect(ratio).toBeLessThan(3.0)
    }
  })

  it('should generate guardrail events', () => {
    let state = createSimulation({
      guardrailsEnabled: true,
      failureMultiplier: 10,
      modelPreset: 'small',
      particleCount: 300,
      agentSpeed: 10,
    })
    const deltaMs = 16
    let nowMs = 0

    // Run for longer
    for (let i = 0; i < 10000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
      if (state.recentGuardrails.length > 0) break
    }

    expect(state.recentGuardrails.length).toBeGreaterThan(0)
  })

  it('should work when toggling guardrails mid-run', () => {
    let state = createSimulation({
      guardrailsEnabled: false,
      failureMultiplier: 10,
      modelPreset: 'small',
      particleCount: 100,
      agentSpeed: 4,
    })
    const deltaMs = 16
    let nowMs = 0

    // Phase 1: Guardrails OFF
    for (let i = 0; i < 500; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }
    
    // We expect some catastrophic failures possibly, but let's just toggle
    state = applyConfig(state, { guardrailsEnabled: true })
    const catastrophicBefore = state.stats.catastrophic

    // Phase 2: Guardrails ON
    for (let i = 0; i < 500; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    expect(state.stats.catastrophic).toBe(catastrophicBefore) // No new catastrophic failures
  })
})
