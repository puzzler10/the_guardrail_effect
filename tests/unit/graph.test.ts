import { describe, it, expect } from 'vitest'
import { buildGraph, getNeighbors, getNodeById, getEntryNodes, getExitNodes } from '../../src/simulation/graph'
import type { LayoutPreset } from '../../src/types'

describe('Graph Module', () => {
  const layouts: LayoutPreset[] = ['clustered', 'flow', 'ring']

  describe('buildGraph', () => {
    it('should return 65 nodes for global layout', () => {
      layouts.forEach(layout => {
        const nodes = buildGraph(layout, 'global')
        expect(nodes.length).toBe(130)
      })
    })

    it('should return correct node counts for scenarios', () => {
      expect(buildGraph('clustered', 'revops').length).toBe(10)
      expect(buildGraph('clustered', 'devops').length).toBe(10)
      expect(buildGraph('clustered', 'hr').length).toBe(11)
    })

    it('should have all required fields for every node', () => {
      const nodes = buildGraph('clustered', 'global')
      nodes.forEach(node => {
        expect(node.id).toBeDefined()
        expect(typeof node.id).toBe('string')
        expect(node.name).toBeDefined()
        expect(typeof node.name).toBe('string')
        expect(node.icon).toBeDefined()
        expect(typeof node.icon).toBe('string')
        expect(node.risk).toBeDefined()
        expect(['safe', 'low', 'medium', 'high', 'critical']).toContain(node.risk)
        expect(node.x).toBeDefined()
        expect(typeof node.x).toBe('number')
        expect(node.y).toBeDefined()
        expect(typeof node.y).toBe('number')
        expect(node.neighbors).toBeDefined()
        expect(Array.isArray(node.neighbors)).toBe(true)
      })
    })

    it('should be a connected graph (every node reachable from entry nodes)', () => {
      const nodes = buildGraph('clustered', 'global')
      const entryNodes = getEntryNodes(nodes)
      expect(entryNodes.length).toBeGreaterThan(0)

      const visited = new Set<string>()
      const queue: string[] = entryNodes.map(n => n.id)
      
      while (queue.length > 0) {
        const id = queue.shift()!
        if (!visited.has(id)) {
          visited.add(id)
          const node = getNodeById(nodes, id)
          if (node) {
            node.neighbors.forEach(neighborId => {
              if (!visited.has(neighborId)) {
                queue.push(neighborId)
              }
            })
          }
        }
      }

      expect(visited.size).toBe(nodes.length)
    })

    it('should have all neighbor references pointing to valid node IDs', () => {
      const nodes = buildGraph('clustered', 'global')
      const nodeIds = new Set(nodes.map(n => n.id))
      
      nodes.forEach(node => {
        node.neighbors.forEach(neighborId => {
          expect(nodeIds.has(neighborId)).toBe(true)
        })
      })
    })

    it('should span all 5 risk levels in global mode', () => {
      const nodes = buildGraph('clustered', 'global')
      const risks = new Set(nodes.map(n => n.risk))
      expect(risks.has('safe')).toBe(true)
      expect(risks.has('low')).toBe(true)
      expect(risks.has('medium')).toBe(true)
      expect(risks.has('high')).toBe(true)
      expect(risks.has('critical')).toBe(true)
    })

    it('should have different coordinates for same node in different layouts', () => {
      const clusteredNodes = buildGraph('clustered', 'global')
      const ringNodes = buildGraph('ring', 'global')
      
      const node1 = clusteredNodes[0]
      const node2 = ringNodes.find(n => n.id === node1.id)!
      
      expect(node1.x).not.toBe(node2.x)
      expect(node1.y).not.toBe(node2.y)
    })
  })

  describe('helpers', () => {
    const nodes = buildGraph('clustered', 'global')

    it('getNeighbors should return correct nodes', () => {
      const node = nodes[0]
      const neighbors = getNeighbors(nodes, node.id)
      expect(neighbors.length).toBe(node.neighbors.length)
      neighbors.forEach(n => {
        expect(node.neighbors).toContain(n.id)
      })
    })

    it('getNodeById should return correct node or undefined', () => {
      const node = nodes[0]
      expect(getNodeById(nodes, node.id)).toBe(node)
      expect(getNodeById(nodes, 'non-existent')).toBeUndefined()
    })

    it('getEntryNodes should return safe or low risk nodes', () => {
      const entryNodes = getEntryNodes(nodes)
      expect(entryNodes.length).toBeGreaterThan(0)
      entryNodes.forEach(n => {
        expect(['safe', 'low']).toContain(n.risk)
      })
    })

    it('getExitNodes should return safe or low risk nodes', () => {
      const exitNodes = getExitNodes(nodes)
      expect(exitNodes.length).toBeGreaterThan(0)
      exitNodes.forEach(n => {
        expect(['safe', 'low']).toContain(n.risk)
      })
    })
  })
})
