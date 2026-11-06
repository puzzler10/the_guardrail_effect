import { describe, it, expect } from 'vitest'
import { createParticle } from '../../src/simulation/particle'
import { swarmMemberOffset } from '../../src/simulation/swarm'
import { SWARM } from '../../src/config'

const mag = (o: { dx: number; dy: number }) => Math.hypot(o.dx, o.dy)

// Edge pointing right, 300px long
const EDGE = { ex: 1, ey: 0, length: 300 }
const offset = (id: number, m: number, progress: number, t: number) =>
  swarmMemberOffset(id, m, progress, t, EDGE.ex, EDGE.ey, EDGE.length)

function makeSwarm() {
  for (let i = 0; i < 10000; i++) {
    const p = createParticle(i, 'a', ['b'])
    if ((p.swarmSize ?? 0) > 0) return p
  }
  throw new Error('no swarm created')
}

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

  it('swarms always fly straight between nodes (no wobble/loop/zigzag)', () => {
    for (let i = 0; i < 200; i++) expect(makeSwarm().pathType).toBe('straight')
  })

  it('swarms flit faster than solo agents', () => {
    for (let i = 0; i < 200; i++) {
      expect(makeSwarm().speedMultiplier).toBeGreaterThanOrEqual(SWARM.speedMin)
    }
  })
})

describe('swarmMemberOffset', () => {
  const maxReach = SWARM.length / 2 + SWARM.width + SWARM.flit

  it('stays within the swarm envelope', () => {
    for (let i = 0; i < 500; i++) {
      const o = offset(i, i % 9, Math.random(), Math.random() * 1e6)
      expect(mag(o)).toBeLessThanOrEqual(maxReach + 1e-9)
    }
  })

  it('never pushes a member past either end of the edge', () => {
    for (let i = 0; i < 500; i++) {
      const progress = Math.random()
      const o = offset(i, i % 9, progress, Math.random() * 1e6)
      const along = progress * EDGE.length + o.dx
      expect(along).toBeGreaterThanOrEqual(-SWARM.flit - 1e-9)
      expect(along).toBeLessThanOrEqual(EDGE.length + SWARM.flit + 1e-9)
    }
  })

  it('spreads members along the direction of travel (a stream, not a ball)', () => {
    let alongSpread = 0
    let perpSpread = 0
    for (let m = 0; m < 9; m++) {
      const o = offset(5, m, 0.5, 0)
      alongSpread += Math.abs(o.dx)
      perpSpread += Math.abs(o.dy)
    }
    expect(alongSpread).toBeGreaterThan(perpSpread)
  })

  it('gives different members different positions', () => {
    const a = offset(7, 0, 0.5, 1000)
    const b = offset(7, 1, 0.5, 1000)
    expect(Math.hypot(a.dx - b.dx, a.dy - b.dy)).toBeGreaterThan(0.5)
  })

  it('members flit over time', () => {
    const a = offset(7, 2, 0.5, 1000)
    const b = offset(7, 2, 0.5, 1150)
    expect(Math.hypot(a.dx - b.dx, a.dy - b.dy)).toBeGreaterThan(0.5)
  })

  it('swarm converges at nodes and spreads mid-edge', () => {
    let atNode = 0
    let midEdge = 0
    for (let m = 0; m < 9; m++) {
      for (let t = 0; t < 10; t++) {
        atNode += mag(offset(3, m, 0, t * 300))
        midEdge += mag(offset(3, m, 0.5, t * 300))
      }
    }
    expect(atNode).toBeLessThan(midEdge * 0.6)
  })

  it('is deterministic for the same inputs', () => {
    expect(offset(11, 4, 0.3, 4242)).toEqual(offset(11, 4, 0.3, 4242))
  })
})
