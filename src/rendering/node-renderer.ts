import p5 from 'p5'
import type { GraphNode, RiskLevel } from '../types'
import { COLORS_DARK, NODE_GLOW } from '../config'

const NODE_SIZES: Record<RiskLevel, number> = {
  safe: 16,
  low: 18,
  medium: 22,
  high: 28,
  critical: 36,
}

function drawGlow(p: p5, x: number, y: number, size: number, color: string, risk: RiskLevel) {
  const layers = risk === 'critical' ? NODE_GLOW.layersCritical : 
                 risk === 'high' ? 4 :
                 risk === 'safe' ? NODE_GLOW.layersSafe : 3
  
  p.noStroke()
  for (let i = layers; i > 0; i--) {
    const c = p.color(color)
    c.setAlpha(40 / i)  // Outer layers more transparent
    p.fill(c)
    p.ellipse(x, y, size * (1 + i * NODE_GLOW.glowSpread))
  }
}

export function drawNode(
  p: p5, 
  node: GraphNode, 
  colors: typeof COLORS_DARK, 
  guardrailsEnabled: boolean = false,
  isHovered: boolean = false
): void {
  const baseSize = NODE_SIZES[node.risk] || 16
  const nodeColor = colors.nodeByRisk[node.risk] || '#ffffff'

  // 1. Breathing Animation
  // Use id as seed for desynchronized phase
  const phaseOffset = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 0.7
  const breathe = 1 + Math.sin(p.millis() * NODE_GLOW.breatheSpeed + phaseOffset) * NODE_GLOW.breatheAmount
  const size = baseSize * breathe

  // 2. Node Glow Halo
  drawGlow(p, node.x, node.y, size, nodeColor, node.risk)

  // 3. Guardrail Shield Upgrade
  if (guardrailsEnabled && (node.risk === 'high' || node.risk === 'critical')) {
    const time = p.millis() * 0.005
    p.noFill()
    p.strokeWeight(1.5)

    // Multiple concentric rings (3)
    for (let i = 0; i < 3; i++) {
      const pulsePhase = (time + i * 1.5) % Math.PI
      const pulse = Math.sin(pulsePhase)
      
      const ringSize = size * (1.2 + i * 0.15 + pulse * 0.4)
      const ringAlpha = (1 - pulse) * 120 * Math.pow(0.6, i) // exponential decay
      
      const ringColor = p.color(colors.guardrailText)
      ringColor.setAlpha(ringAlpha)
      
      p.stroke(ringColor)
      p.ellipse(node.x, node.y, ringSize)
    }
  }

  // Node Icon
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
  fromColor.setAlpha(255 * 0.15)
  
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
