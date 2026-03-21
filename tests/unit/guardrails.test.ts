import { describe, it, expect } from 'vitest'
import {
  isProtectedNode,
  shouldIntercept,
  interceptParticle,
  pickGuardrailMessage,
  createGuardrailEvent,
  getSafeNeighbors,
} from '../../src/simulation/guardrails'
import type { GraphNode, Particle } from '../../src/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNode(id: string, risk: GraphNode['risk'], neighborIds: string[] = []): GraphNode {
  return { id, name: id, icon: '🔧', risk, x: 0, y: 0, neighbors: neighborIds }
}

function makeParticle(overrides: Partial<Particle> = {}): Particle {
  return {
    id: 1,
    state: 'active',
    currentNodeId: 'a',
    targetNodeId: 'b',
    progress: 0.5,
    stepsCompleted: 3,
    maxSteps: 10,
    speedMultiplier: 1,
    pathType: 'straight',
    trail: [],
    ...overrides,
  }
}

// ─── isProtectedNode ──────────────────────────────────────────────────────────

describe('isProtectedNode', () => {
  it('returns true for high risk', () => {
    expect(isProtectedNode(makeNode('n', 'high'))).toBe(true)
  })

  it('returns true for critical risk', () => {
    expect(isProtectedNode(makeNode('n', 'critical'))).toBe(true)
  })

  it('returns false for safe', () => {
    expect(isProtectedNode(makeNode('n', 'safe'))).toBe(false)
  })

  it('returns false for low', () => {
    expect(isProtectedNode(makeNode('n', 'low'))).toBe(false)
  })

  it('returns false for medium', () => {
    expect(isProtectedNode(makeNode('n', 'medium'))).toBe(false)
  })
})

// ─── shouldIntercept ──────────────────────────────────────────────────────────

describe('shouldIntercept', () => {
  const protectedNode = makeNode('x', 'critical')
  const safeNode = makeNode('y', 'safe')

  it('returns false when guardrails disabled, all tiers', () => {
    for (const tier of [1, 2, 3, 4] as const) {
      expect(shouldIntercept(protectedNode, tier, false)).toBe(false)
    }
  })

  it('returns true for tier 4 on any node when guardrails on', () => {
    expect(shouldIntercept(safeNode, 4, true)).toBe(true)
    expect(shouldIntercept(protectedNode, 4, true)).toBe(true)
  })

  it('returns true for tier 3 on protected node when guardrails on', () => {
    expect(shouldIntercept(protectedNode, 3, true)).toBe(true)
  })

  it('returns false for tier 3 on safe/low/medium node when guardrails on', () => {
    expect(shouldIntercept(safeNode, 3, true)).toBe(false)
    expect(shouldIntercept(makeNode('n', 'low'), 3, true)).toBe(false)
    expect(shouldIntercept(makeNode('n', 'medium'), 3, true)).toBe(false)
  })

  it('returns false for tier 1 even on protected node', () => {
    expect(shouldIntercept(protectedNode, 1, true)).toBe(false)
  })

  it('returns false for tier 2 even on protected node', () => {
    expect(shouldIntercept(protectedNode, 2, true)).toBe(false)
  })
})

// ─── interceptParticle ───────────────────────────────────────────────────────

describe('interceptParticle', () => {
  it('changes targetNodeId to one of safeNeighborIds', () => {
    const p = makeParticle({ targetNodeId: 'dangerous' })
    const result = interceptParticle(p, ['safe1', 'safe2'])
    expect(['safe1', 'safe2']).toContain(result.targetNodeId)
  })

  it('sets state to recovering', () => {
    const p = makeParticle({ state: 'active' })
    const result = interceptParticle(p, ['safe1'])
    expect(result.state).toBe('recovering')
  })

  it('is immutable — original particle unchanged', () => {
    const p = makeParticle({ targetNodeId: 'dangerous', state: 'active' })
    interceptParticle(p, ['safe1'])
    expect(p.targetNodeId).toBe('dangerous')
    expect(p.state).toBe('active')
  })

  it('returns particle unchanged when safeNeighborIds is empty', () => {
    const p = makeParticle({ targetNodeId: 'dangerous', state: 'active' })
    const result = interceptParticle(p, [])
    expect(result.targetNodeId).toBe('dangerous')
    expect(result.state).toBe('active')
  })
})

// ─── getSafeNeighbors ─────────────────────────────────────────────────────────

describe('getSafeNeighbors', () => {
  const nodes: GraphNode[] = [
    makeNode('hub', 'safe', ['safe1', 'low1', 'high1', 'critical1']),
    makeNode('safe1', 'safe'),
    makeNode('low1', 'low'),
    makeNode('high1', 'high'),
    makeNode('critical1', 'critical'),
  ]

  it('returns only non-protected neighbor IDs', () => {
    const result = getSafeNeighbors(nodes, 'hub')
    expect(result).toContain('safe1')
    expect(result).toContain('low1')
    expect(result).not.toContain('high1')
    expect(result).not.toContain('critical1')
  })

  it('returns empty array when node has no safe neighbors', () => {
    const dangerNodes: GraphNode[] = [
      makeNode('a', 'safe', ['b', 'c']),
      makeNode('b', 'high'),
      makeNode('c', 'critical'),
    ]
    expect(getSafeNeighbors(dangerNodes, 'a')).toEqual([])
  })

  it('returns empty array for unknown nodeId', () => {
    expect(getSafeNeighbors(nodes, 'nonexistent')).toEqual([])
  })
})

// ─── pickGuardrailMessage ─────────────────────────────────────────────────────

describe('pickGuardrailMessage', () => {
  it('returns a non-empty string', () => {
    const msg = pickGuardrailMessage()
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('returns different messages over many calls (not always the same)', () => {
    const msgs = new Set(Array.from({ length: 50 }, () => pickGuardrailMessage()))
    expect(msgs.size).toBeGreaterThan(1)
  })
})

// ─── createGuardrailEvent ─────────────────────────────────────────────────────

describe('createGuardrailEvent', () => {
  it('assembles all fields correctly', () => {
    const event = createGuardrailEvent('node1', 100, 200, 12345)
    expect(event.nodeId).toBe('node1')
    expect(event.x).toBe(100)
    expect(event.y).toBe(200)
    expect(event.timestamp).toBe(12345)
    expect(typeof event.text).toBe('string')
    expect(event.text.length).toBeGreaterThan(0)
  })
})
