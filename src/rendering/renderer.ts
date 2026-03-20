import p5 from 'p5'
import type { SimulationState } from '../types'
import { COLORS_DARK, COLORS_LIGHT, UI } from '../config'
import { drawNodes, drawEdges } from './node-renderer'
import { drawParticles } from './particle-renderer'
import type { Effect } from './effects'
import { 
  drawEffects, 
  pruneEffects, 
  getCameraShakeOffset, 
  createShockwave, 
  createScreenShake 
} from './effects'
import type { FloatingText } from './text-overlay'
import { 
  drawFloatingTexts, 
  pruneFloatingTexts, 
  createFloatingText 
} from './text-overlay'

export interface Renderer {
  sketch: (p: p5) => void
  setCameraTarget: (x: number, y: number) => void
}

export function createSketch(getState: () => SimulationState): Renderer {
  let camX = 600 // Default center (based on graph.ts CANVAS_WIDTH/2)
  let camY = 400 // Default center (based on graph.ts CANVAS_HEIGHT/2)
  let zoom = 1.0
  
  let effects: Effect[] = []
  let floatingTexts: FloatingText[] = []
  const processedEventIds = new Set<string>()

  const setCameraTarget = (x: number, y: number) => {
    camX = x
    camY = y
  }

  const sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight)
      p.pixelDensity(1) // performance
    }

    p.draw = () => {
      const state = getState()
      const nowMs = p.millis() // Using p5 millis which starts at 0 on setup
      // We might need to sync nowMs with simulation's idea of time, 
      // but p5's millis is usually fine for visual effects.
      
      const colors = state.config.darkMode ? COLORS_DARK : COLORS_LIGHT

      // 1. Process new events from state
      // We'll use a combination of nodeId and timestamp as a key
      state.recentFailures.forEach(event => {
        const id = `fail-${event.nodeId}-${event.timestamp}`
        if (!processedEventIds.has(id)) {
          processedEventIds.add(id)
          floatingTexts.push(createFloatingText(event, nowMs))
          
          if (event.tier === 4) {
            effects.push(createShockwave(event.x, event.y, nowMs))
            effects.push(createScreenShake(nowMs))
            setCameraTarget(event.x, event.y)
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

      // 2. Prune old effects/texts (limit processedEventIds too to prevent leak)
      if (processedEventIds.size > 200) {
        // Clear old IDs - this is a bit crude but works for last 50 events
        processedEventIds.clear()
      }
      
      effects = pruneEffects(effects, nowMs)
      floatingTexts = pruneFloatingTexts(floatingTexts, nowMs)

      // 3. Clear and apply Camera
      p.background(colors.background)
      
      const shake = getCameraShakeOffset(effects, nowMs)
      
      p.push()
      p.translate(p.width / 2 + shake.dx, p.height / 2 + shake.dy)
      p.scale(zoom)
      p.translate(-camX, -camY)

      // 4. Draw Layers
      drawEdges(p, state.nodes, colors)
      drawNodes(p, state.nodes, colors, state.config.guardrailsEnabled)
      drawParticles(p, state.particles, state.nodes, colors)
      drawEffects(p, effects, nowMs)
      drawFloatingTexts(p, floatingTexts, nowMs, colors)

      p.pop()
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
    }

    p.mouseDragged = () => {
      // Don't pan if clicking UI? usually lil-gui handles its own events
      camX -= (p.mouseX - p.pmouseX) / zoom
      camY -= (p.mouseY - p.pmouseY) / zoom
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.mouseWheel = (event?: any) => {
      if (!event) return
      // Zoom toward mouse position would be nice, but simple center zoom for now
      const delta = event.delta > 0 ? 0.9 : 1.1
      zoom = p.constrain(zoom * delta, UI.zoomMin, UI.zoomMax)
      return false // Prevent page scroll
    }
  }

  return { sketch, setCameraTarget }
}
