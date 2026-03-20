import p5 from 'p5'
import type { GraphNode, RiskLevel } from '../types'
import { COLORS_DARK } from '../config'

const NODE_SIZES: Record<RiskLevel, number> = {
  safe: 16,
  low: 18,
  medium: 22,
  high: 28,
  critical: 36,
}

export function drawNode(
  p: p5, 
  node: GraphNode, 
  colors: typeof COLORS_DARK, 
  guardrailsEnabled: boolean = false,
  zoom: number = 1.0
): void {
  const size = NODE_SIZES[node.risk] || 16
  const nodeColor = colors.nodeByRisk[node.risk] || '#ffffff'

  // Guardrail pulse ring
  if (guardrailsEnabled && (node.risk === 'high' || node.risk === 'critical')) {
    const pulse = (Math.sin(p.millis() * 0.005) + 1) * 0.5
    const ringSize = size + 4 + pulse * 10
    const ringAlpha = (1 - pulse) * 100
    const ringColor = p.color(colors.guardrailText)
    ringColor.setAlpha(ringAlpha)
    p.noFill()
    p.stroke(ringColor)
    p.strokeWeight(2)
    p.ellipse(node.x, node.y, ringSize)
  }

  // Node circle
  p.fill(nodeColor)
  p.noStroke()
  p.ellipse(node.x, node.y, size)

  // Icon
  p.textAlign(p.CENTER, p.CENTER)
  p.textSize(size * 0.6)
  p.fill(0, 150) // dark overlay for icon visibility on bright colors
  p.text(node.icon, node.x, node.y)

  // Label - only show if zoomed in or if it's a high-risk node
  const showLabel = zoom > 1.2 || node.risk === 'high' || node.risk === 'critical'
  if (showLabel) {
    p.textAlign(p.CENTER, p.TOP)
    p.textSize(10)

    // Shadow for readability
    p.fill(0, 180)
    p.text(node.name, node.x + 1, node.y + size / 2 + 5)

    p.fill(200)
    p.text(node.name, node.x, node.y + size / 2 + 4)
  }
}

export function drawEdge(p: p5, from: GraphNode, to: GraphNode, colors: typeof COLORS_DARK): void {
  const fromColor = p.color(colors.nodeByRisk[from.risk] || '#ffffff')
  fromColor.setAlpha(255 * 0.3)
  
  p.stroke(fromColor)
  p.strokeWeight(1)
  p.line(from.x, from.y, to.x, to.y)
}

export function drawNodes(
  p: p5, 
  nodes: GraphNode[], 
  colors: typeof COLORS_DARK, 
  guardrailsEnabled: boolean = false,
  zoom: number = 1.0
): void {
  for (const node of nodes) {
    drawNode(p, node, colors, guardrailsEnabled, zoom)
  }
}

export function drawEdges(p: p5, nodes: GraphNode[], colors: typeof COLORS_DARK): void {
  const nodeMap = new Map<string, GraphNode>()
  for (const node of nodes) {
    nodeMap.set(node.id, node)
  }

  for (const from of nodes) {
    for (const neighborId of from.neighbors) {
      const to = nodeMap.get(neighborId)
      if (to) {
        drawEdge(p, from, to, colors)
      }
    }
  }
}
