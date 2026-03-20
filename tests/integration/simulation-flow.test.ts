import { describe, it, expect } from 'vitest'
import { createSimulation, tick, applyConfig } from '../../src/simulation/simulation'

describe('Simulation Flow Integration', () => {
  it('should eventually terminate all particles', () => {
    let state = createSimulation({ particleCount: 10, agentSpeed: 4 })
    const deltaMs = 16
    let nowMs = 0

    // Run for 100 ticks to spawn some particles
    for (let i = 0; i < 100; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    expect(state.particles.length).toBeGreaterThan(0)

    // Stop spawning more particles by setting count to 0
    state = applyConfig(state, { particleCount: 0 })
    
    // Run for another 5000 ticks
    for (let i = 0; i < 5000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    const activeParticles = state.particles.filter(p => 
      ['spawning', 'active', 'recovering'].includes(p.state)
    )
    
    expect(activeParticles.length).toBe(0)
  })

  it('should not exceed maxSteps for any particle', () => {
    let state = createSimulation({ particleCount: 20, agentSpeed: 2 })
    const deltaMs = 16
    let nowMs = 0

    // Run for 5000 ticks
    for (let i = 0; i < 5000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    state.particles.forEach(p => {
      expect(p.stepsCompleted).toBeLessThanOrEqual(p.maxSteps)
    })
  })

  it('should maintain consistent stats with particle states', () => {
    let state = createSimulation({ particleCount: 50, agentSpeed: 1 })
    const deltaMs = 16
    let nowMs = 0

    // Run for 1000 ticks
    for (let i = 0; i < 1000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
      
      const activeInState = state.particles.filter(p => 
        ['spawning', 'active', 'recovering'].includes(p.state)
      ).length
      
      expect(state.stats.active).toBe(activeInState)
    }

    expect(state.stats.completed + state.stats.failed + state.stats.catastrophic).toBeGreaterThan(0)
  })

  it('should spawn particles over time', () => {
    let state = createSimulation({ particleCount: 100 })
    const initialCount = state.particles.length
    const deltaMs = 100 // Large delta to speed up spawn
    let nowMs = 0

    // Run for some ticks
    for (let i = 0; i < 10; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    expect(state.particles.length).toBeGreaterThan(initialCount)
  })
})
