import { CONNECTOR_LIBRARY, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import type { GraphNode, LayoutPreset } from '../types'
import { buildScenarioGraph } from './scenarios'

export function buildGraph(layout: LayoutPreset, scenarioId: string = 'global'): GraphNode[] {
  if (scenarioId !== 'global') {
    return buildScenarioGraph(scenarioId, layout)
  }

  // Global Nexus (All Connectors) - Organise into a 4x15 horizontal serpentine grid
  const ROWS = 4
  const COLS = 15
  const totalCells = ROWS * COLS
  
  // Create a mapping of nodes to grid positions
  const nodes: GraphNode[] = []
  
  CONNECTOR_LIBRARY.forEach((template, index) => {
    // Basic linear index to grid cell (row, col)
    const cellIndex = index % totalCells
    const row = Math.floor(cellIndex / COLS)
    let col = cellIndex % COLS
    
    // Serpentine logic: reverse col on odd rows
    const isReverseRow = row % 2 === 1
    if (isReverseRow) {
      col = (COLS - 1) - col
    }

    // Calculate coordinates using grid position
    const coords = calculateCoordinates(template.id, row, col, index, layout)
    
    // Connectivity: Primarily follow the serpentine sequence (index -> index + 1)
    const neighbors: string[] = []
    
    // 1. Next in sequence (main flow)
    const nextTemplate = CONNECTOR_LIBRARY[(index + 1) % CONNECTOR_LIBRARY.length]
    if (nextTemplate && nextTemplate.id !== template.id) {
      neighbors.push(nextTemplate.id)
    }

    // 2. Occasional "long jumps" and loops for visual interest
    const seed = template.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Skip-ahead jump (long travel time)
    if (seed % 13 === 0) {
      const jumpTarget = CONNECTOR_LIBRARY[(index + 5) % CONNECTOR_LIBRARY.length]
      if (jumpTarget) neighbors.push(jumpTarget.id)
    }

    // Horizontal bridge (skipping rows)
    if (seed % 17 === 0) {
      const rowJumpTarget = CONNECTOR_LIBRARY[(index + COLS) % CONNECTOR_LIBRARY.length]
      if (rowJumpTarget) neighbors.push(rowJumpTarget.id)
    }

    // Small backward loop
    if (seed % 19 === 0 && index > 2) {
      const backTarget = CONNECTOR_LIBRARY[index - 2]
      if (backTarget) neighbors.push(backTarget.id)
    }

    nodes.push({
      id: template.id,
      name: template.name,
      icon: template.icon,
      risk: template.risk,
      description: template.description,
      x: coords.x,
      y: coords.y,
      neighbors: Array.from(new Set(neighbors)),
    })
  })

  return nodes
}

function calculateCoordinates(
  id: string, 
  row: number, 
  col: number, 
  index: number, 
  layout: LayoutPreset
): { x: number; y: number } {
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const jitter = (amount: number) => (Math.sin(seed * 0.5) * amount)

  if (layout === 'clustered') {
    // Keep cluster logic based on some grouping (risk or just modulo)
    const groupIndex = index % 5 
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 550
    const clusterCenterX = CENTER_X + Math.cos(angles[groupIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[groupIndex]) * distance
    const localAngle = (index / 12) * Math.PI * 2
    const localDist = 60 + ((index % 12) * 12)
    
    return {
      x: clusterCenterX + Math.cos(localAngle) * localDist + jitter(20),
      y: clusterCenterY + Math.sin(localAngle) * localDist + jitter(20),
    }
  } else if (layout === 'flow') {
    // Horizontal serpentine layout
    const xPadding = 200
    const yPadding = 250
    const COLS = 15
    const ROWS = 4
    
    const availableWidth = CANVAS_WIDTH - (xPadding * 2)
    const availableHeight = CANVAS_HEIGHT - (yPadding * 2)
    
    const xStep = availableWidth / (COLS - 1)
    const yStep = availableHeight / (ROWS - 1)
    
    // row and col are passed in from buildGraph
    const xBase = xPadding + (col * xStep)
    const yBase = yPadding + (row * yStep)

    // Reduced jitter for "tidier" look, but enough to avoid perfect grids
    return {
      x: xBase + jitter(35),
      y: yBase + jitter(35),
    }
  } else if (layout === 'ring') {
    const radius = 250 + ((index % 5) * 150)
    const angleOffset = (index % 5) * 0.5
    const angle = angleOffset + (index / 12) * Math.PI * 2
    
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
  // Always include the first few nodes of the serpentine path to ensure full-length journeys
  const startNodes = nodes.slice(0, 5)
  // Plus any safe/low risk nodes for uniform spread
  const safeNodes = nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
  
  return Array.from(new Set([...startNodes, ...safeNodes]))
}

export function getExitNodes(nodes: GraphNode[]): GraphNode[] {
  // Exit at the end of the serpentine path
  const endNodes = nodes.slice(-5)
  // Plus any safe/low risk nodes
  const safeNodes = nodes.filter(n => n.risk === 'safe' || n.risk === 'low')
  
  return Array.from(new Set([...endNodes, ...safeNodes]))
}
