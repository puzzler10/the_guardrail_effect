import { CONNECTOR_LIBRARY, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import type { GraphNode, LayoutPreset } from '../types'
import { buildScenarioGraph } from './scenarios'

export function buildGraph(layout: LayoutPreset, scenarioId: string = 'global'): GraphNode[] {
  if (scenarioId !== 'global') {
    return buildScenarioGraph(scenarioId, layout)
  }

  // Global Nexus (All Connectors) - Organise into 5 flowchart stages
  const STAGE_COUNT = 5
  const stages: (typeof CONNECTOR_LIBRARY)[] = Array.from({ length: STAGE_COUNT }, () => [])
  
  // Distribute nodes pseudo-randomly but deterministically into stages
  CONNECTOR_LIBRARY.forEach((template) => {
    const seed = template.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const stageIndex = seed % STAGE_COUNT
    stages[stageIndex].push(template)
  })

  const nodes: GraphNode[] = []

  // Auto-generate connections for Global Nexus to simulate a flowchart
  stages.forEach((stageNodes, stageIndex) => {
    stageNodes.forEach((template, index) => {
      // Calculate coordinates using stageIndex as the group index
      const coords = calculateCoordinates(template.id, stageIndex, index, stageNodes.length, layout)
      
      const neighbors: string[] = []
      
      // 1. Link within the same stage (form a loop/chain within stage to look like a sub-process)
      const nextInStage = stageNodes[(index + 1) % stageNodes.length]
      if (nextInStage && nextInStage.id !== template.id) {
        neighbors.push(nextInStage.id)
      }
      
      // 2. Link to next stage (primary forward flow)
      if (stageIndex < STAGE_COUNT - 1) {
        const nextStage = stages[stageIndex + 1]
        if (nextStage.length > 0) {
          const target1 = nextStage[index % nextStage.length]
          neighbors.push(target1.id)
          
          if (nextStage.length > 1) {
             const target2 = nextStage[(index + 1) % nextStage.length]
             neighbors.push(target2.id)
          }
        }
      }

      // 3. Deliberate "long jumps" and loops
      const seed = template.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      if (seed % 7 === 0 && stageIndex < STAGE_COUNT - 2) {
        const jumpStage = stages[stageIndex + 2]
        if (jumpStage.length > 0) neighbors.push(jumpStage[index % jumpStage.length].id)
      }
      if (seed % 11 === 0 && stageIndex > 1) {
        const backStage = stages[stageIndex - 1]
        if (backStage.length > 0) neighbors.push(backStage[index % backStage.length].id)
      }

      nodes.push({
        id: template.id,
        name: template.name,
        icon: template.icon,
        risk: template.risk,
        x: coords.x,
        y: coords.y,
        neighbors: Array.from(new Set(neighbors)),
      })
    })
  })

  return nodes
}

function calculateCoordinates(
  id: string, 
  groupIndex: number, 
  index: number, 
  count: number, 
  layout: LayoutPreset
): { x: number; y: number } {
  const CENTER_X = CANVAS_WIDTH / 2
  const CENTER_Y = CANVAS_HEIGHT / 2

  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const jitter = (amount: number) => (Math.sin(seed) * amount)

  if (layout === 'clustered') {
    const angles = [0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6]
    const distance = 550
    const clusterCenterX = CENTER_X + Math.cos(angles[groupIndex]) * distance
    const clusterCenterY = CENTER_Y + Math.sin(angles[groupIndex]) * distance
    const localAngle = (index / count) * Math.PI * 2
    const localDist = 60 + (index * 12)
    
    return {
      x: clusterCenterX + Math.cos(localAngle) * localDist + jitter(20),
      y: clusterCenterY + Math.sin(localAngle) * localDist + jitter(20),
    }
  } else if (layout === 'flow') {
    const xPadding = 250
    const availableWidth = CANVAS_WIDTH - (xPadding * 2)
    // groupIndex is the stage from 0 to 4
    const xStep = availableWidth / 4
    const xBase = xPadding + (groupIndex * xStep)

    const yPadding = 250
    const availableHeight = CANVAS_HEIGHT - (yPadding * 2)
    let yBase = CANVAS_HEIGHT / 2
    if (count > 1) {
      const yStep = availableHeight / (count - 1)
      yBase = yPadding + (index * yStep)
    }

    return {
      x: xBase + jitter(90),
      y: yBase + jitter(90),
    }
  } else if (layout === 'ring') {
    const radius = 250 + (groupIndex * 150)
    const angleOffset = groupIndex * 0.5
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
