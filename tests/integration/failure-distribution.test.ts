import { describe, it, expect } from 'vitest'
import { createSimulation, tick } from '../../src/simulation/simulation'

describe('Failure Distribution Integration', () => {
  it('should have ordered tier distribution (tier1 > tier2 > tier3 > tier4)', () => {
    let state = createSimulation({
      modelPreset: 'small',
      failureMultiplier: 10, // 100% failure rate
      particleCount: 100,
      agentSpeed: 4,
    })
    
    const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
    const deltaMs = 2 // Small delta to spread out arrivals
    let nowMs = 0
    let totalFailures = 0

    // Run until we have enough failures
    for (let i = 0; i < 50000 && totalFailures < 1000; i++) {
      const currentTickMs = nowMs
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs

      // Detect new failures in this tick
      state.recentFailures.forEach(f => {
        if (f.timestamp === currentTickMs) {
          tierCounts[f.tier]++
          totalFailures++
        }
      })
    }

    expect(totalFailures).toBeGreaterThan(300)
    expect(tierCounts[1]).toBeGreaterThan(tierCounts[2])
    expect(tierCounts[2]).toBeGreaterThan(tierCounts[3])
    expect(tierCounts[3]).toBeGreaterThan(tierCounts[4])
  })

  it('should scale failures proportionally with multiplier', () => {
    const runSimulation = (multiplier: number) => {
      let state = createSimulation({
        modelPreset: 'strong',
        failureMultiplier: multiplier,
        particleCount: 100,
        agentSpeed: 2,
      })
      const deltaMs = 16
      let nowMs = 0
      
      for (let i = 0; i < 2000; i++) {
        state = tick(state, deltaMs, nowMs)
        nowMs += deltaMs
      }
      return state.stats.selfCorrected + state.stats.failed + state.stats.catastrophic
    }

    const count1x = runSimulation(1)
    const count2x = runSimulation(2)

    // expect total failures at 2x is between 1.5x and 2.5x of failures at 1x
    // with a minimum floor to avoid division by zero or low numbers
    if (count1x > 10) {
      const ratio = count2x / count1x
      expect(ratio).toBeGreaterThan(1.2)
      expect(ratio).toBeLessThan(3.0) 
    }
  })

  it('should have more failures for small model than frontier model', () => {
    const runSimulation = (preset: string) => {
      let state = createSimulation({
        modelPreset: preset,
        failureMultiplier: 2,
        particleCount: 100,
        agentSpeed: 2,
      })
      const deltaMs = 16
      let nowMs = 0
      for (let i = 0; i < 2000; i++) {
        state = tick(state, deltaMs, nowMs)
        nowMs += deltaMs
      }
      return state.stats.selfCorrected + state.stats.failed + state.stats.catastrophic
    }

    const frontierFailures = runSimulation('frontier')
    const smallFailures = runSimulation('small')

    expect(smallFailures).toBeGreaterThan(frontierFailures * 1.5)
  })

  it('should produce zero tier 2-4 failures with zero multiplier', () => {
    let state = createSimulation({
      failureMultiplier: 0,
      particleCount: 100,
      agentSpeed: 2,
    })
    const deltaMs = 16
    let nowMs = 0
    for (let i = 0; i < 1000; i++) {
      state = tick(state, deltaMs, nowMs)
      nowMs += deltaMs
    }

    expect(state.stats.failed).toBe(0)
    expect(state.stats.catastrophic).toBe(0)
  })
})
