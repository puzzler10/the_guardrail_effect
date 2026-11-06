import { describe, it, expect } from 'vitest'
import { createParticle, advanceParticle, arriveAtNode, applyFailure, updateTrail } from '../../src/simulation/particle'
import { PARTICLE, SWARM } from '../../src/config'

describe('Particle Simulation', () => {
  describe('createParticle', () => {
    it('produces correct initial state', () => {
      const neighbors = ['node-2', 'node-3']
      const p = createParticle(1, 'node-1', neighbors)
      
      expect(p.id).toBe(1)
      expect(p.currentNodeId).toBe('node-1')
      expect(neighbors).toContain(p.targetNodeId)
      expect(p.progress).toBe(0)
      expect(p.state).toBe('spawning')
      expect(p.trail).toEqual([])
      expect(p.stepsCompleted).toBe(0)
      // Solo agents vary 0.8–1.2x; swarms dart faster (see swarm.test.ts)
      const [lo, hi] = p.swarmSize ? [SWARM.speedMin, SWARM.speedMax] : [0.8, 1.2]
      expect(p.speedMultiplier).toBeGreaterThanOrEqual(lo)
      expect(p.speedMultiplier).toBeLessThanOrEqual(hi)
    })

    it('maxSteps is always within [minSteps, maxSteps] range', () => {
      for (let i = 0; i < 100; i++) {
        const p = createParticle(i, 'node-1', ['node-2'])
        expect(p.maxSteps).toBeGreaterThanOrEqual(PARTICLE.minSteps)
        expect(p.maxSteps).toBeLessThanOrEqual(PARTICLE.maxSteps)
      }
    })
  })

  describe('advanceParticle', () => {
    it('increments progress proportionally to deltaMs and speed', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const deltaMs = 100
      const speed = 1.0
      const p2 = advanceParticle(p, deltaMs, speed)
      
      const expectedProgress = PARTICLE.baseSpeed * speed * p.speedMultiplier * deltaMs
      expect(p2.progress).toBeCloseTo(expectedProgress)
    })

    it('clamps progress at 1.0, does not exceed', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const deltaMs = 10000 // Large enough to exceed 1.0
      const speed = 1.0
      const p2 = advanceParticle(p, deltaMs, speed)
      
      expect(p2.progress).toBe(1.0)
    })

    it('is immutable', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const p2 = advanceParticle(p, 10, 1.0)
      expect(p2).not.toBe(p)
      expect(p.progress).toBe(0)
    })
  })

  describe('arriveAtNode', () => {
    it('transitions currentNodeId, resets progress, increments stepsCompleted', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const nextNeighbors = ['node-3', 'node-4']
      const p2 = arriveAtNode({ ...p, progress: 1.0, targetNodeId: 'node-2' }, nextNeighbors)
      
      expect(p2.currentNodeId).toBe('node-2')
      expect(nextNeighbors).toContain(p2.targetNodeId)
      expect(p2.progress).toBe(0)
      expect(p2.stepsCompleted).toBe(1)
      expect(p2.state).toBe('active')
    })

    it('sets state="completed" when stepsCompleted >= maxSteps', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const pWithMax = { ...p, maxSteps: 5, stepsCompleted: 4, progress: 1.0, targetNodeId: 'node-2' }
      const p2 = arriveAtNode(pWithMax, ['node-3'])
      
      expect(p2.stepsCompleted).toBe(5)
      expect(p2.state).toBe('completed')
    })

    it('is immutable', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const p2 = arriveAtNode(p, ['node-3'])
      expect(p2).not.toBe(p)
    })
  })

  describe('applyFailure', () => {
    it('sets correct state per tier', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      
      expect(applyFailure(p, 1, 'error', 1).state).toBe('recovering')
      expect(applyFailure(p, 2, 'error', 1).state).toBe('failed')
      expect(applyFailure(p, 3, 'error', 1).state).toBe('failed')
      expect(applyFailure(p, 4, 'error', 1).state).toBe('exploded')
    })

    it('tier 1 decrements stepsCompleted by stepBack (not below 0)', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const pWithSteps = { ...p, stepsCompleted: 5 }
      
      const p2 = applyFailure(pWithSteps, 1, 'retry', 2)
      expect(p2.stepsCompleted).toBe(3)
      
      const p3 = applyFailure(pWithSteps, 1, 'retry', 10)
      expect(p3.stepsCompleted).toBe(0)
    })

    it('is immutable', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const p2 = applyFailure(p, 1, 'error', 1)
      expect(p2).not.toBe(p)
    })
  })

  describe('updateTrail', () => {
    it('appends position and trims to trailLength', () => {
      let p = createParticle(1, 'node-1', ['node-2'])
      
      for (let i = 0; i < PARTICLE.trailLength + 5; i++) {
        p = updateTrail(p, i, i)
      }
      
      expect(p.trail.length).toBe(PARTICLE.trailLength)
      expect(p.trail[p.trail.length - 1]).toEqual({ x: PARTICLE.trailLength + 4, y: PARTICLE.trailLength + 4 })
    })

    it('is immutable', () => {
      const p = createParticle(1, 'node-1', ['node-2'])
      const p2 = updateTrail(p, 10, 10)
      expect(p2).not.toBe(p)
      expect(p.trail.length).toBe(0)
    })
  })
})
