import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSimulation, tick, applyConfig } from '../../src/simulation/simulation'
import { PARTICLE } from '../../src/config'
import * as failure from '../../src/simulation/failure'

// Mocking the entire failure module to control the tiers
vi.mock('../../src/simulation/failure', async () => {
  const actual = await vi.importActual<typeof import('../../src/simulation/failure')>('../../src/simulation/failure')
  return {
    ...actual,
    rollFailure: vi.fn(),
    pickTier: vi.fn(),
    createFailureEvent: actual.createFailureEvent,
  }
})

describe('Simulation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('createSimulation() returns valid initial state', () => {
    const state = createSimulation()
    expect(state.nodes.length).toBeGreaterThan(0)
    expect(state.particles).toEqual([])
    expect(state.stats.active).toBe(0)
    expect(state.config.modelPreset).toBe('frontier')
  })

  it('tick() spawns particles over time', () => {
    let state = createSimulation({ particleCount: 10 })
    const spawnInterval = 1000 / PARTICLE.spawnRate
    
    // Initial tick to set lastSpawnMs
    state = tick(state, 16, 1000)
    expect(state.particles.length).toBe(0)
    expect(state.lastSpawnMs).toBe(1000)

    // Tick forward enough to spawn one particle
    state = tick(state, spawnInterval + 1, 1000 + spawnInterval + 1)
    expect(state.particles.length).toBe(1)
    expect(state.particles[0].id).toBe(1)
    expect(state.stats.active).toBe(1)
  })

  it('tick() advances particle progress', () => {
    let state = createSimulation()
    // Find a node that has neighbors
    const node = state.nodes.find(n => n.neighbors.length > 0)!
    const targetId = node.neighbors[0]
    const target = state.nodes.find(n => n.id === targetId)!
    
    state.particles = [{
      id: 1,
      state: 'active',
      currentNodeId: node.id,
      targetNodeId: target.id,
      progress: 0,
      stepsCompleted: 0,
      maxSteps: 10,
      speedMultiplier: 1,
      trail: []
    }]

    const deltaMs = 100
    state = tick(state, deltaMs, 100)
    
    expect(state.particles[0].progress).toBeGreaterThan(0)
    expect(state.particles[0].trail.length).toBe(1)
  })

  it('tick() handles particle arrival and success', () => {
    // Mock failure to be false
    vi.mocked(failure.rollFailure).mockReturnValue(false)

    let state = createSimulation()
    // Find a node that has neighbors
    const node = state.nodes.find(n => n.neighbors.length > 0)!
    const targetId = node.neighbors[0]
    const target = state.nodes.find(n => n.id === targetId)!
    
    state.particles = [{
      id: 1,
      state: 'active',
      currentNodeId: node.id,
      targetNodeId: target.id,
      progress: 0.99, // Near arrival
      stepsCompleted: 0,
      maxSteps: 10,
      speedMultiplier: 1,
      trail: []
    }]

    // One more tick to arrive
    state = tick(state, 100, 200)
    
    expect(state.particles[0].currentNodeId).toBe(target.id)
    expect(state.particles[0].progress).toBe(0)
    expect(state.particles[0].stepsCompleted).toBe(1)
  })

  it('tick() handles failure when rolled', () => {
    // Mock failure to be true
    vi.mocked(failure.rollFailure).mockReturnValue(true)
    vi.mocked(failure.pickTier).mockReturnValue(2) // Tier 2 failure

    let state = createSimulation({ modelPreset: 'frontier', failureMultiplier: 1 })
    // Find a node that has neighbors
    const node = state.nodes.find(n => n.neighbors.length > 0)!
    const targetId = node.neighbors[0]
    const target = state.nodes.find(n => n.id === targetId)!
    
    state.particles = [{
      id: 1,
      state: 'active',
      currentNodeId: node.id,
      targetNodeId: target.id,
      progress: 0.99,
      stepsCompleted: 0,
      maxSteps: 10,
      speedMultiplier: 1,
      trail: []
    }]

    state = tick(state, 100, 200)
    
    expect(state.particles[0].state).toBe('failed')
    expect(state.recentFailures.length).toBe(1)
  })

  it('Guardrail intercept redirects particle when enabled', () => {
    // Mock failure to be true
    vi.mocked(failure.rollFailure).mockReturnValue(true)
    // We want to trigger shouldIntercept(nodeReached, tier, true)
    vi.mocked(failure.pickTier).mockReturnValue(4) // Tier 4 always intercepted

    let state = createSimulation({ guardrailsEnabled: true })
    // Find a node that is reachable from somewhere AND has at least one safe neighbor
    const target = state.nodes.find(n => {
      const safeNeighbors = n.neighbors
        .map(nid => state.nodes.find(x => x.id === nid))
        .filter(x => x && x.risk !== 'high' && x.risk !== 'critical')
      return safeNeighbors.length > 0
    })!
    const source = state.nodes.find(n => n.neighbors.includes(target.id)) || state.nodes[0]
    
    state.particles = [{
      id: 1,
      state: 'active',
      currentNodeId: source.id,
      targetNodeId: target.id,
      progress: 0.99,
      stepsCompleted: 0,
      maxSteps: 10,
      speedMultiplier: 1,
      trail: []
    }]

    state = tick(state, 100, 200)
    
    // Should be intercepted
    expect(state.recentGuardrails.length).toBe(1)
    expect(state.particles[0].state).toBe('recovering')
  })

  it('applyConfig() rebuilds graph on layout change', () => {
    const state = createSimulation({ layout: 'clustered' })
    const oldNodes = state.nodes
    
    const newState = applyConfig(state, { layout: 'flow' })
    expect(newState.config.layout).toBe('flow')
    expect(newState.nodes).not.toBe(oldNodes)
  })

  it('Stats are correctly computed', () => {
    let state = createSimulation()
    // Set lastSpawnMs to avoid unexpected spawns
    state.lastSpawnMs = 100
    
    state.particles = [
      { id: 1, state: 'active', currentNodeId: 'a', targetNodeId: 'b', progress: 0, stepsCompleted: 0, maxSteps: 10, speedMultiplier: 1, trail: [] },
      { id: 2, state: 'completed', currentNodeId: 'a', targetNodeId: 'b', progress: 0, stepsCompleted: 10, maxSteps: 10, speedMultiplier: 1, trail: [] },
      { id: 3, state: 'recovering', failureTier: 1, currentNodeId: 'a', targetNodeId: 'b', progress: 0, stepsCompleted: 5, maxSteps: 10, speedMultiplier: 1, trail: [] },
      { id: 4, state: 'failed', failureTier: 2, currentNodeId: 'a', targetNodeId: 'b', progress: 0, stepsCompleted: 5, maxSteps: 10, speedMultiplier: 1, trail: [] },
      { id: 5, state: 'exploded', failureTier: 4, currentNodeId: 'a', targetNodeId: 'b', progress: 0, stepsCompleted: 5, maxSteps: 10, speedMultiplier: 1, trail: [] },
    ]

    state = tick(state, 0, 100) // Just to trigger stats update

    expect(state.stats.active).toBe(2) // active + recovering
    expect(state.stats.completed).toBe(1)
    expect(state.stats.selfCorrected).toBe(1)
    expect(state.stats.failed).toBe(1)
    expect(state.stats.catastrophic).toBe(1)
  })
})
