import p5 from 'p5'
import type { GraphNode, SimulationConfig } from '../types'
import { COLORS_DARK, COLORS_LIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'

export function drawMinimap(
  p: p5,
  nodes: GraphNode[],
  config: SimulationConfig,
  camX: number,
  camY: number,
  zoom: number
) {
  const margin = 20
  const width = 180
  const height = 120
  const x = p.width - width - margin
  const y = p.height - height - margin - 40 // Above stats bar

  const colors = config.darkMode ? COLORS_DARK : COLORS_LIGHT
  const virtualWidth = CANVAS_WIDTH
  const virtualHeight = CANVAS_HEIGHT

  // 1. Draw Background
  p.push()
  p.noStroke()
  p.fill(config.darkMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.3)')
  p.rect(x, y, width, height, 8)
  p.stroke(config.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
  p.noFill()
  p.rect(x, y, width, height, 8)

  // 2. Draw Nodes
  nodes.forEach(node => {
    const nx = x + (node.x / virtualWidth) * width
    const ny = y + (node.y / virtualHeight) * height
    
    // Risk-based color
    const dotColor = colors.nodeByRisk[node.risk]
    
    p.fill(dotColor)
    p.noStroke()
    p.circle(nx, ny, 3)
  })

  // 3. Draw Viewport Rectangle
  // The viewport size in virtual coordinates depends on the window size and zoom
  const viewWidthVirtual = p.width / zoom
  const viewHeightVirtual = p.height / zoom
  
  // Top-left of viewport in virtual coordinates
  const vX = camX - viewWidthVirtual / 2
  const vY = camY - viewHeightVirtual / 2
  
  const vxMap = x + (vX / virtualWidth) * width
  const vyMap = y + (vY / virtualHeight) * height
  const vwMap = (viewWidthVirtual / virtualWidth) * width
  const vhMap = (viewHeightVirtual / virtualHeight) * height
  
  p.noFill()
  p.stroke(config.darkMode ? '#00f0ff' : '#00a0aa')
  p.strokeWeight(1.5)
  // Constrain to minimap bounds
  const rectX = p.constrain(vxMap, x, x + width)
  const rectY = p.constrain(vyMap, y, y + height)
  const rectW = p.min(vwMap, x + width - rectX)
  const rectH = p.min(vhMap, y + height - rectY)
  
  p.rect(rectX, rectY, rectW, rectH, 2)
  
  p.pop()
}
