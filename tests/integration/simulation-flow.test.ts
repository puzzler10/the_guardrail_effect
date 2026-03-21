import { describe, it, expect } from 'vitest'
import { createSimulation, tick } from '../../src/simulation/simulation'

describe('Simulation Flow Integration', () => {
  it('should process particles from start to finish', { timeout: 15000 }, () => {
    let state = createSimulation({
      particleCount: 10,
      agentSpeed: 4,
      modelPreset: 'frontier',
      failureMultiplier: 0, // No failures for clean flow
    })

    const durationMs = 15000
    const deltaMs = 100
    
    for (let t = 0; t < durationMs; t += deltaMs) {
      state = tick(state, deltaMs, t)
    }

    // After 15s at 4x speed, many particles should have finished
    expect(state.stats.completed).toBeGreaterThan(0)
  })

  it('should handle high particle counts without crashing', { timeout: 20000 }, () => {
    let state = createSimulation({
      particleCount: 500,
      agentSpeed: 1,
    })

    const durationMs = 5000
    const deltaMs = 100
    
    for (let t = 0; t < durationMs; t += deltaMs) {
      state = tick(state, deltaMs, t)
    }

    expect(state.particles.length).toBeGreaterThan(100)
  })

  it('should not exceed maxSteps for any particle', { timeout: 15000 }, () => {
    let state = createSimulation({ particleCount: 20, agentSpeed: 4 })
    const deltaMs = 100
    
    for (let t = 0; t < 10000; t += deltaMs) {
      state = tick(state, deltaMs, t)
      state.particles.forEach(p => {
        expect(p.path.length).toBeLessThanOrEqual(20)
      })
    }
  })
})
