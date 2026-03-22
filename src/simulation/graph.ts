import { CONNECTOR_LIBRARY } from '../config'
import type { GraphNode, LayoutPreset, RiskLevel } from '../types'
import { buildScenarioGraph } from './scenarios'

// Canvas dimensions for global graph layout
const CANVAS_WIDTH = 2400
const CANVAS_HEIGHT = 1000

const RISK_ORDER: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical']

// Weighted hash — char position matters so "salesforce" and "salesforce-2" spread apart
function hashId(id: string): number {
  return id.split('').reduce((acc: number, char: string, i: number) => acc + char.charCodeAt(0) * (i + 1), 0)
}

export function buildGraph(layout: LayoutPreset, scenarioId: string = 'global'): GraphNode[] {
  if (scenarioId !== 'global') {
    return buildScenarioGraph(scenarioId, layout)
  }

  type TemplateEntry = { id: string; name: string; icon: string; risk: RiskLevel }

  const byRisk: Record<RiskLevel, TemplateEntry[]> = {
    safe: [], low: [], medium: [], high: [], critical: [],
  }
  CONNECTOR_LIBRARY.forEach(t => byRisk[t.risk].push(t))

  // Build flat list: original + duplicate for each connector
  const allTemplates: TemplateEntry[] = []
  RISK_ORDER.forEach(risk => {
    for (const t of byRisk[risk]) {
      allTemplates.push(t)
      allTemplates.push({ id: `${t.id}-2`, name: t.name, icon: t.icon, risk: t.risk })
    }
  })

  // Deterministic shuffle: spread duplicates far apart in the grid
  // Using hash of full ID so "salesforce-2" ends up far from "salesforce"
  const shuffled = [...allTemplates].sort((a, b) => (hashId(a.id) % 1301) - (hashId(b.id) % 1301))

  if (layout === 'flow') {
    return buildFlowLayout(shuffled)
  } else {
    return buildTierLayout(shuffled, byRisk, layout)
  }
}

// ─── Flow layout: horizontal serpentine grid ─────────────────────────────────

function buildFlowLayout(
  shuffled: { id: string; name: string; icon: string; risk: RiskLevel }[]
): GraphNode[] {
  const N_COLS = 13
  const padX = 80
  const padY = 80
  const N_ROWS = Math.ceil(shuffled.length / N_COLS)           // = 10
  const colStep = (CANVAS_WIDTH - padX * 2) / (N_COLS - 1)    // ~184px
  const rowStep = (CANVAS_HEIGHT - padY * 2) / (N_ROWS - 1)   // ~89px

  const nodes: GraphNode[] = shuffled.map((template, i) => {
    const row = Math.floor(i / N_COLS)
    const col = i % N_COLS
    // Serpentine: odd rows right-to-left
    const colPos = row % 2 === 0 ? col : (N_COLS - 1 - col)

    const seed = hashId(template.id)
    const jitter = (amount: number) => Math.sin(seed + i * 7) * amount

    const x = padX + colPos * colStep + jitter(12)
    const y = padY + row * rowStep + jitter(12)

    // Neighbors: bidirectional serpentine + long-range jumps for path variety
    const neighbors: string[] = []

    // Forward in serpentine
    if (i + 1 < shuffled.length) neighbors.push(shuffled[i + 1].id)
    // Backward in serpentine (ensures every node reachable from any entry point)
    if (i - 1 >= 0) neighbors.push(shuffled[i - 1].id)
    // Long-range hop every 5th node
    if (i % 5 === 0 && i + 11 < shuffled.length) neighbors.push(shuffled[i + 11].id)
    // Second long-range hop every 7th node
    if (i % 7 === 0 && i + 21 < shuffled.length) neighbors.push(shuffled[i + 21].id)

    return { id: template.id, name: template.name, icon: template.icon, risk: template.risk, x, y, neighbors }
  })

  return nodes
}

// ─── Clustered / Ring layouts: group by risk tier (secondary modes) ──────────

function buildTierLayout(
  shuffled: { id: string; name: string; icon: string; risk: RiskLevel }[],
  byRisk: Record<RiskLevel, { id: string }[]>,
  layout: LayoutPreset
): GraphNode[] {
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  // Track per-risk group index for spread within cluster
  const riskCounter: Record<RiskLevel, number> = { safe: 0, low: 0, medium: 0, high: 0, critical: 0 }

  const nodes: GraphNode[] = shuffled.map((template, i) => {
    const riskIndex = RISK_ORDER.indexOf(template.risk)
    const groupIndex = riskCounter[template.risk]++
    const groupCount = byRisk[template.risk].length * 2  // includes duplicates

    const seed = hashId(template.id)
    const jitter = (amount: number) => Math.sin(seed + i * 7) * amount

    let x: number, y: number

    if (layout === 'clustered') {
      const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
      const dist = 550
      const cx = CENTER_X + Math.cos(angles[riskIndex]) * dist
      const cy = CENTER_Y + Math.sin(angles[riskIndex]) * dist
      const localAngle = (groupIndex / Math.max(groupCount, 1)) * Math.PI * 2
      const localDist = 80 + (groupIndex % 6) * 20
      x = cx + Math.cos(localAngle) * localDist + jitter(15)
      y = cy + Math.sin(localAngle) * localDist + jitter(15)
    } else {
      // ring
      const radius = 120 + riskIndex * 100  // max 520
      const angleOffset = riskIndex * 0.5
      const angle = angleOffset + (groupIndex / Math.max(groupCount, 1)) * Math.PI * 2
      x = CENTER_X + Math.cos(angle) * radius + jitter(10)
      y = CENTER_Y + Math.sin(angle) * radius + jitter(10)
    }

    // Clamp to canvas
    x = Math.max(40, Math.min(CANVAS_WIDTH - 40, x))
    y = Math.max(40, Math.min(CANVAS_HEIGHT - 40, y))

    // Neighbors: bidirectional serpentine + long-range
    const neighbors: string[] = []
    if (i + 1 < shuffled.length) neighbors.push(shuffled[i + 1].id)
    if (i - 1 >= 0) neighbors.push(shuffled[i - 1].id)
    if (i % 5 === 0 && i + 11 < shuffled.length) neighbors.push(shuffled[i + 11].id)
    if (i % 7 === 0 && i + 21 < shuffled.length) neighbors.push(shuffled[i + 21].id)

    return { id: template.id, name: template.name, icon: template.icon, risk: template.risk, x, y, neighbors }
  })

  return nodes
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
