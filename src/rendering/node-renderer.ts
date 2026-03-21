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
  isHovered: boolean = false
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

  // Node atmosphere (halo)
  const isHighRisk = node.risk === 'high' || node.risk === 'critical'
  if (isHighRisk || isHovered) {
    const breathing = (Math.sin(p.millis() * 0.003) + 1) * 0.5
    const haloSize = size * (2.0 + (isHovered ? 0.5 : 0) + breathing * 0.5)
    const haloAlpha = isHovered ? 40 : (20 + breathing * 10)
    
    const haloColor = p.color(nodeColor)
    haloColor.setAlpha(haloAlpha)
    
    p.noStroke()
    p.fill(haloColor)
    p.ellipse(node.x, node.y, haloSize)
    
    // Core glow
    haloColor.setAlpha(haloAlpha * 2)
    p.ellipse(node.x, node.y, haloSize * 0.6)
  }

  // Node Icon (No background circle anymore, as per Phase 7)
  p.textAlign(p.CENTER, p.CENTER)
  
  // Larger icons
  const iconSize = size * 1.5
  p.textSize(iconSize)
  
  // Icon shadow for depth
  p.fill(0, 100)
  p.text(node.icon, node.x + 2, node.y + 2)
  
  // Main icon
  p.fill(nodeColor)
  p.text(node.icon, node.x, node.y)

  // Label - only show on hover (as per Phase 7)
  if (isHovered) {
    p.textAlign(p.CENTER, p.TOP)
    p.textSize(12)
    p.textStyle(p.BOLD)

    // Shadow for readability
    p.fill(0, 200)
    p.text(node.name, node.x + 1, node.y + iconSize / 2 + 6)

    p.fill(255)
    p.text(node.name, node.x, node.y + iconSize / 2 + 5)
    p.textStyle(p.NORMAL)
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
  hoveredNodeId?: string
): void {
  for (const node of nodes) {
    drawNode(p, node, colors, guardrailsEnabled, node.id === hoveredNodeId)
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
