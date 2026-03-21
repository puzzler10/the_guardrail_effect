import { CONNECTOR_LIBRARY } from '../config'
import type { GraphNode, LayoutPreset, RiskLevel } from '../types'
import { buildScenarioGraph } from './scenarios'

export function buildGraph(layout: LayoutPreset, scenarioId: string = 'global'): GraphNode[] {
  if (scenarioId !== 'global') {
    return buildScenarioGraph(scenarioId)
  }

  // Global Nexus (All Connectors)
  const byRisk: Record<RiskLevel, typeof CONNECTOR_LIBRARY> = {
    safe: [],
    low: [],
    medium: [],
    high: [],
    critical: [],
  }
  CONNECTOR_LIBRARY.forEach(t => byRisk[t.risk].push(t))

  const nodes: GraphNode[] = []
  const riskOrder: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical']

  // Auto-generate some connections for Global Nexus if not explicitly defined
  // For now, let's keep it simple: link within risk tiers and to next tier
  riskOrder.forEach((risk, riskIndex) => {
    const templates = byRisk[risk]
    templates.forEach((template, index) => {
      const coords = calculateCoordinates(template.id, riskIndex, index, templates.length, layout)
      
      // Simple connectivity logic for Global mode
      const neighbors: string[] = []
      
      // 1. Link to next node in same tier (cycle)
      const nextInTier = templates[(index + 1) % templates.length]
      if (nextInTier && nextInTier.id !== template.id) neighbors.push(nextInTier.id)
      
      // 2. Link to a node in the next tier
      if (riskIndex < riskOrder.length - 1) {
        const nextTier = byRisk[riskOrder[riskIndex + 1]]
        if (nextTier.length > 0) {
          const target = nextTier[index % nextTier.length]
          neighbors.push(target.id)
        }
      }

      nodes.push({
        id: template.id,
        name: template.name,
        icon: template.icon,
        risk: template.risk,
        x: coords.x,
        y: coords.y,
        neighbors,
      })
    })
  })

  return nodes
}

function calculateCoordinates(
  id: string, 
  riskIndex: number, 
  index: number, 
  count: number, 
  layout: LayoutPreset
): { x: number; y: number } {
  const CANVAS_WIDTH = 2000
  const CANVAS_HEIGHT = 1400
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const jitter = (amount: number) => (Math.sin(seed) * amount)

  if (layout === 'clustered') {
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 450
    const clusterCenterX = CENTER_X + Math.cos(angles[riskIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[riskIndex]) * distance
    const localAngle = (index / count) * Math.PI * 2
    const localDist = 60 + (index * 15)
    
    return {
      x: clusterCenterX + Math.cos(localAngle) * localDist + jitter(20),
      y: clusterCenterY + Math.sin(localAngle) * localDist + jitter(20),
    }
  } else if (layout === 'flow') {
    const xBase = 150 + (riskIndex * 400)
    const yPadding = 150
    const availableHeight = CANVAS_HEIGHT - (yPadding * 2)
    const yStep = count > 1 ? availableHeight / (count - 1) : 0
    const yBase = yPadding + (index * yStep)

    return {
      x: xBase + jitter(40),
      y: yBase + jitter(40),
    }
  } else if (layout === 'ring') {
    const radius = 200 + (riskIndex * 150)
    const angleOffset = riskIndex * 0.5
    const angle = angleOffset + (index / count) * Math.PI * 2
    
    return {
      x: CENTER_X + Math.cos(angle) * radius + jitter(10),
      y: CENTER_Y + Math.sin(angle) * radius + jitter(10),
    }
  }

  return { x: CENTER_X, y: CENTER_Y }
}

export function getNeighbors(nodes: GraphNode[], nodeId: string): GraphNode[] {
  const node = nodes.find(n => n.id === nodeId)
  if (!node) return []
  return node.neighbors
    .map(neighborId => nodes.find(n => n.id === neighborId))
    .filter((n): n is GraphNode => !!n)
}

export function getNodeById(nodes: GraphNode[], nodeId: string): GraphNode | undefined {
  return nodes.find(n => n.id === nodeId)
}

export function getEntryNodes(nodes: GraphNode[]): GraphNode[] {
  const entry = nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
  return entry.length > 0 ? entry : nodes.slice(0, 3)
}

export function getExitNodes(nodes: GraphNode[]): GraphNode[] {
  return nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
}
