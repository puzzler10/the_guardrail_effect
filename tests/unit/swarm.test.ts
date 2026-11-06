import { describe, it, expect } from 'vitest'
import { createParticle } from '../../src/simulation/particle'
import { swarmMemberOffset } from '../../src/simulation/swarm'
import { SWARM } from '../../src/config'

const mag = (o: { dx: number; dy: number }) => Math.hypot(o.dx, o.dy)

describe('swarm assignment', () => {
  it('a fraction of particles travel as swarms, matching SWARM.chance', () => {
    const n = 4000
    let swarms = 0
    for (let i = 0; i < n; i++) {
      if ((createParticle(i, 'a', ['b']).swarmSize ?? 0) > 0) swarms++
    }
    expect(swarms / n).toBeGreaterThan(SWARM.chance - 0.03)
    expect(swarms / n).toBeLessThan(SWARM.chance + 0.03)
  })

  it('swarm sizes are within configured bounds; solo agents have size 0', () => {
    for (let i = 0; i < 1000; i++) {
      const size = createParticle(i, 'a', ['b']).swarmSize ?? 0
      if (size !== 0) {
        expect(size).toBeGreaterThanOrEqual(SWARM.minSize)
        expect(size).toBeLessThanOrEqual(SWARM.maxSize)
        expect(Number.isInteger(size)).toBe(true)
      }
    }
  })
})

describe('swarmMemberOffset', () => {
  it('stays within SWARM.radius', () => {
    for (let i = 0; i < 500; i++) {
      const o = swarmMemberOffset(i, i % 9, Math.random(), Math.random() * 1e6)
      expect(mag(o)).toBeLessThanOrEqual(SWARM.radius + 1e-9)
    }
  })

  it('gives different members of the same swarm different positions', () => {
    const a = swarmMemberOffset(7, 0, 0.5, 1000)
    const b = swarmMemberOffset(7, 1, 0.5, 1000)
    expect(Math.hypot(a.dx - b.dx, a.dy - b.dy)).toBeGreaterThan(0.5)
  })

  it('members move over time', () => {
    const a = swarmMemberOffset(7, 2, 0.5, 1000)
    const b = swarmMemberOffset(7, 2, 0.5, 1600)
    expect(Math.hypot(a.dx - b.dx, a.dy - b.dy)).toBeGreaterThan(0.5)
  })

  it('swarm tightens near nodes and spreads mid-edge', () => {
    let atNode = 0
    let midEdge = 0
    for (let m = 0; m < 9; m++) {
      for (let t = 0; t < 10; t++) {
        atNode += mag(swarmMemberOffset(3, m, 0, t * 300))
        midEdge += mag(swarmMemberOffset(3, m, 0.5, t * 300))
      }
    }
    expect(atNode).toBeLessThan(midEdge * 0.5)
  })

  it('is deterministic for the same inputs', () => {
    expect(swarmMemberOffset(11, 4, 0.3, 4242)).toEqual(swarmMemberOffset(11, 4, 0.3, 4242))
  })
})
