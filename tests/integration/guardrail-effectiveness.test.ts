import { describe, it, expect } from 'vitest'
import { createSimulation, tick } from '../../src/simulation/simulation'

describe('Guardrail Effectiveness Integration', () => {
  it('should significantly reduce tier 3 failures', { timeout: 15000 }, () => {
    const runSimulation = (guardrails: boolean) => {
      let state = createSimulation({
        modelPreset: 'opensource',
        failureMultiplier: 10, // Max failure rate
        particleCount: 100,
        agentSpeed: 4,
        guardrailsEnabled: guardrails,
      })
      
      let t3Failures = 0
      const durationMs = 15000
      const deltaMs = 100
      
      for (let t = 0; t < durationMs; t += deltaMs) {
        state = tick(state, deltaMs, t)
        t3Failures += state.recentFailures.filter(f => f.tier === 3).length
        // Clear failures to count unique ones each tick
        state.recentFailures = []
      }
      return t3Failures
    }

    const t3WithGuardrailsOff = runSimulation(false)
    const t3WithGuardrailsOn = runSimulation(true)

    // With guardrails on, tier 3 failures should be reduced by ~95%
    if (t3WithGuardrailsOff > 5) {
      expect(t3WithGuardrailsOn).toBeLessThan(t3WithGuardrailsOff * 0.2) // Conservative check
    }
  })

  it('should prevent all tier 4 failures', { timeout: 15000 }, () => {
    let state = createSimulation({
      modelPreset: 'small',
      failureMultiplier: 10,
      particleCount: 100,
      agentSpeed: 4,
      guardrailsEnabled: true,
    })
    
    // Ensure critical node
    state.nodes[0].risk = 'critical'
    
    const durationMs = 20000
    const deltaMs = 100
    
    for (let t = 0; t < durationMs; t += deltaMs) {
      state = tick(state, deltaMs, t)
      const t4s = state.recentFailures.filter(f => f.tier === 4)
      expect(t4s.length).toBe(0)
      state.recentFailures = []
    }
  })
})
