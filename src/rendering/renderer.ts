import p5 from 'p5'
import type { SimulationState } from '../types'
import { COLORS_DARK, COLORS_LIGHT, UI, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'

const DEFAULT_ZOOM = 0.8
import { drawNodes, drawEdges } from './node-renderer'
import { drawParticles } from './particle-renderer'
import type { Effect } from './effects'
import {
  drawWorldEffects,
  drawScreenEffects,
  pruneEffects,
  getCameraShakeOffset,
  createShockwave,
  createScreenShake,
  createStormFlash
} from './effects'
import type { FloatingText } from './text-overlay'
import { 
  drawFloatingTexts, 
  pruneFloatingTexts, 
  createFloatingText 
} from './text-overlay'
import { drawMinimap } from './minimap'
import { initBackground, drawBackground, drawVignette, handleResize } from './background'
import { initTrails, drawTrails } from './trails'

import type { GraphNode } from '../types'

const RISK_LABELS: Record<string, string> = {
  safe: 'Safe Tool',
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
}

function drawNodeTooltip(p: p5, node: GraphNode, sx: number, sy: number, colors: typeof COLORS_DARK) {
  const padding = 12
  const lines = [node.name, RISK_LABELS[node.risk] || node.risk]
  p.textSize(13)
  const textW = Math.max(...lines.map(l => p.textWidth(l)))
  const boxW = textW + padding * 2
  const boxH = lines.length * 20 + padding * 2
  // Position above the node, clamped to screen
  const tx = p.constrain(sx - boxW / 2, 8, p.width - boxW - 8)
  const tyRaw = sy - boxH - 12
  const ty = tyRaw < 8 ? sy + 20 : tyRaw

  p.push()
  p.noStroke()
  // Background
  p.fill(10, 10, 20, 220)
  p.rect(tx, ty, boxW, boxH, 6)
  // Accent border
  const nodeColor = p.color(colors.nodeByRisk[node.risk] || '#ffffff')
  nodeColor.setAlpha(180)
  p.stroke(nodeColor)
  p.strokeWeight(1)
  p.noFill()
  p.rect(tx, ty, boxW, boxH, 6)
  // Text
  p.noStroke()
  p.fill(255)
  p.textAlign(p.LEFT, p.TOP)
  p.textStyle(p.BOLD)
  p.textSize(13)
  p.text(lines[0], tx + padding, ty + padding)
  p.textStyle(p.NORMAL)
  p.textSize(11)
  const riskColor = p.color(colors.nodeByRisk[node.risk] || '#ffffff')
  riskColor.setAlpha(200)
  p.fill(riskColor)
  p.text(lines[1], tx + padding, ty + padding + 18)
  p.pop()
}

export interface Renderer {
  sketch: (p: p5) => void
  setCameraTarget: (x: number, y: number, zoom?: number) => void
}

export function createSketch(getState: () => SimulationState): Renderer {
  let camX = CANVAS_WIDTH / 2 // Current camera X
  let camY = CANVAS_HEIGHT / 2 // Current camera Y
  let zoom = DEFAULT_ZOOM // Current zoom

  let targetCamX = CANVAS_WIDTH / 2
  let targetCamY = CANVAS_HEIGHT / 2
  let targetZoom = DEFAULT_ZOOM
  let focusEndTime = 0
  
  let effects: Effect[] = []
  let floatingTexts: FloatingText[] = []
  const processedEventIds = new Set<string>()
  let clickedNodeId: string | undefined = undefined

  const setCameraTarget = (x: number, y: number, z?: number) => {
    targetCamX = x
    targetCamY = y
    if (z !== undefined) targetZoom = z
    else focusEndTime = 0 // Manual move resets focus
  }

  const sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight)
      p.pixelDensity(1) // performance
      
      initBackground(p)
      initTrails(p)
    }

    p.draw = () => {
      const state = getState()
      const nowMs = p.millis()
      
      const colors = state.config.darkMode ? COLORS_DARK : COLORS_LIGHT

      // 1. Process new events from state
      state.recentFailures.forEach(event => {
        const id = `fail-${event.nodeId}-${event.timestamp}`
        if (!processedEventIds.has(id)) {
          processedEventIds.add(id)
          floatingTexts.push(createFloatingText(event, nowMs))
          
          // Storm flash for "Angry Storm" mode (guardrails OFF)
          if (!state.config.guardrailsEnabled) {
            effects.push(createStormFlash(nowMs));
          }
          
          if (event.tier === 4) {
            effects.push(createShockwave(event.x, event.y, nowMs))
            effects.push(createScreenShake(nowMs))
            
            // Auto-zoom on catastrophe (only if enabled)
            if (state.config.autoZoomEnabled) {
              targetCamX = event.x
              targetCamY = event.y
              targetZoom = 2.0
              focusEndTime = nowMs + 2500 // Hold for 2.5s
            }
          }
        }
      })

      state.recentGuardrails.forEach(event => {
        const id = `guard-${event.nodeId}-${event.timestamp}`
        if (!processedEventIds.has(id)) {
          processedEventIds.add(id)
          floatingTexts.push(createFloatingText(event, nowMs))
        }
      })

      // Auto-return to default view
      if (focusEndTime > 0 && nowMs > focusEndTime) {
        targetCamX = CANVAS_WIDTH / 2
        targetCamY = CANVAS_HEIGHT / 2
        targetZoom = DEFAULT_ZOOM
        focusEndTime = 0
      }

      // Cinematic camera LERP (Phase 9)
      // Faster when focused on catastrophe, slower for manual pans
      const isFocused = focusEndTime > 0
      const panLerp = isFocused ? 0.15 : 0.08
      const zoomLerp = isFocused ? 0.12 : 0.05
      
      camX = p.lerp(camX, targetCamX, panLerp)
      camY = p.lerp(camY, targetCamY, panLerp)
      zoom = p.lerp(zoom, targetZoom, zoomLerp)

      // 2. Prune old effects/texts
      if (processedEventIds.size > 200) {
        processedEventIds.clear()
      }
      
      effects = pruneEffects(effects, nowMs)
      floatingTexts = pruneFloatingTexts(floatingTexts, nowMs)

      // 3. Clear canvas then draw background (Screen space)
      p.background(colors.background)
      drawBackground(p, state.config.guardrailsEnabled)
      
      const shake = getCameraShakeOffset(effects, nowMs)

      // Calculate hovered node
      // Convert screen mouse coordinates back to world coordinates
      const worldMouseX = (p.mouseX - p.width / 2 - shake.dx) / zoom + camX
      const worldMouseY = (p.mouseY - p.height / 2 - shake.dy) / zoom + camY
      
      let hoveredNodeId: string | undefined = undefined
      let minDistance = 30 // Threshold for hover
      
      for (const node of state.nodes) {
        const dist = p.dist(worldMouseX, worldMouseY, node.x, node.y)
        if (dist < minDistance) {
          minDistance = dist
          hoveredNodeId = node.id
        }
      }
      
      p.push()
      p.translate(p.width / 2 + shake.dx, p.height / 2 + shake.dy)
      p.scale(zoom)
      p.translate(-camX, -camY)

      // 4. Draw Layers (World space)
      const nodeMap = new Map(state.nodes.map(n => [n.id, n]));
      drawTrails(p, state.particles, state.nodes, colors, nodeMap)
      drawEdges(p, state.nodes, colors, nodeMap)
      drawNodes(p, state.nodes, colors, state.config.guardrailsEnabled, hoveredNodeId)
      drawParticles(p, state.particles, state.nodes, colors, nodeMap)
      drawWorldEffects(p, effects, nowMs)
      drawFloatingTexts(p, floatingTexts, nowMs, colors)

      p.pop()

      // 5. Draw screen-space effects (outside camera transform)
      drawScreenEffects(p, effects, nowMs)

      // 6. Draw UI Elements (Unscaled)
      drawMinimap(p, state.nodes, state.config, camX, camY, zoom)

      // Node tooltip for clicked node
      if (clickedNodeId) {
        const clickedNode = state.nodes.find(n => n.id === clickedNodeId)
        if (clickedNode) {
          // Convert world position to screen position
          const sx = (clickedNode.x - camX) * zoom + p.width / 2 + shake.dx
          const sy = (clickedNode.y - camY) * zoom + p.height / 2 + shake.dy
          drawNodeTooltip(p, clickedNode, sx, sy, colors)
        }
      }

      // Vignette effect (Phase 9)
      drawVignette(p, state.config.guardrailsEnabled)
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
      handleResize(p)
    }

    p.mouseDragged = () => {
      // Manual pan overrides auto-zoom
      focusEndTime = 0
      targetCamX -= (p.mouseX - p.pmouseX) / zoom
      targetCamY -= (p.mouseY - p.pmouseY) / zoom
      // We set camX/camY immediately to feel responsive during drag
      camX = targetCamX
      camY = targetCamY
    }

    p.mouseClicked = () => {
      const shake = getCameraShakeOffset(effects, p.millis())
      const worldMouseX = (p.mouseX - p.width / 2 - shake.dx) / zoom + camX
      const worldMouseY = (p.mouseY - p.height / 2 - shake.dy) / zoom + camY
      const state = getState()
      let hit: string | undefined
      let minDist = 40
      for (const node of state.nodes) {
        const d = p.dist(worldMouseX, worldMouseY, node.x, node.y)
        if (d < minDist) { minDist = d; hit = node.id }
      }
      clickedNodeId = hit === clickedNodeId ? undefined : hit
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.mouseWheel = (event?: any) => {
      if (!event) return
      focusEndTime = 0
      const delta = event.delta > 0 ? 0.9 : 1.1
      targetZoom = p.constrain(targetZoom * delta, UI.zoomMin, UI.zoomMax)
      return false // Prevent page scroll
    }
  }

  return { sketch, setCameraTarget }
}
