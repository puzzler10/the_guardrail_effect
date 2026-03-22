import { CONNECTOR_LIBRARY, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import type { GraphNode, LayoutPreset, RiskLevel } from '../types'
import { buildScenarioGraph } from './scenarios'

export function buildGraph(layout: LayoutPreset, scenarioId: string = 'global'): GraphNode[] {
  if (scenarioId !== 'global') {
    return buildScenarioGraph(scenarioId, layout)
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

  const riskOrder: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical']

  // Expand each tier with one duplicate per node for visual density
  type TemplateEntry = { id: string; name: string; icon: string; risk: RiskLevel }
  const expandedByRisk: Record<RiskLevel, TemplateEntry[]> = {
    safe: [], low: [], medium: [], high: [], critical: [],
  }
  riskOrder.forEach(risk => {
    for (const t of byRisk[risk]) {
      expandedByRisk[risk].push(t)
      expandedByRisk[risk].push({ id: `${t.id}-2`, name: t.name, icon: t.icon, risk: t.risk })
    }
  })

  const hashId = (id: string) => id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

  const nodes: GraphNode[] = []

  riskOrder.forEach((risk, riskIndex) => {
    const templates = expandedByRisk[risk]

    templates.forEach((template, index) => {
      const coords = calculateCoordinates(template.id, riskIndex, index, templates.length, layout)

      const neighbors: string[] = []

      // 1. Next in same tier (cycle)
      const nextInTier = templates[(index + 1) % templates.length]
      if (nextInTier && nextInTier.id !== template.id) neighbors.push(nextInTier.id)

      // 2. Cross-tier: link to next tier
      if (riskIndex < riskOrder.length - 1) {
        const nextTier = expandedByRisk[riskOrder[riskIndex + 1]]
        if (nextTier.length > 0) {
          const target = nextTier[index % nextTier.length]
          neighbors.push(target.id)
        }
      }

      // 3. Skip-tier cross link for denser paths
      if (riskIndex < riskOrder.length - 2) {
        const skipTier = expandedByRisk[riskOrder[riskIndex + 2]]
        if (skipTier.length > 0) {
          const h = hashId(template.id)
          const target = skipTier[h % skipTier.length]
          if (!neighbors.includes(target.id)) neighbors.push(target.id)
        }
      }

      // 4. Same-tier non-adjacent link (if tier has 5+ nodes)
      if (templates.length >= 5) {
        const h = hashId(template.id)
        const skipIndex = (index + 2 + (h % 3)) % templates.length
        const skipNode = templates[skipIndex]
        if (skipNode && skipNode.id !== template.id && !neighbors.includes(skipNode.id)) {
          neighbors.push(skipNode.id)
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
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  const seed = id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  const jitter = (amount: number) => (Math.sin(seed) * amount)

  if (layout === 'clustered') {
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 280
    const clusterCenterX = CENTER_X + Math.cos(angles[riskIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[riskIndex]) * distance
    const localAngle = (index / count) * Math.PI * 2
    const localDist = 50 + (index % 8) * 10  // cap spiral radius to avoid bounds violations

    return {
      x: clusterCenterX + Math.cos(localAngle) * localDist + jitter(20),
      y: clusterCenterY + Math.sin(localAngle) * localDist + jitter(20),
    }
  } else if (layout === 'flow') {
    const xBase = 150 + (riskIndex * 200)
    const yPadding = 80
    const availableHeight = CANVAS_HEIGHT - (yPadding * 2)
    const yStep = count > 1 ? availableHeight / (count - 1) : 0
    const yBase = yPadding + (index * yStep)

    return {
      x: xBase + jitter(30),
      y: yBase + jitter(30),
    }
  } else if (layout === 'ring') {
    const radius = 80 + (riskIndex * 70)  // max 360, fits within CANVAS_HEIGHT/2=450
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
  const endNodes = nodes.slice(-5)
  const safeNodes = nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
  return Array.from(new Set([...endNodes, ...safeNodes]))
}
