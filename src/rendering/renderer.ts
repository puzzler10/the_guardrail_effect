import p5 from 'p5'
import type { SimulationState } from '../types'
import { COLORS_DARK, COLORS_LIGHT, UI } from '../config'
import { drawNodes } from './node-renderer'
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
import { drawMinimap } from './minimap'

export interface Renderer {
  sketch: (p: p5) => void
  setCameraTarget: (x: number, y: number, zoom?: number) => void
}

export function createSketch(getState: () => SimulationState): Renderer {
  let camX = 600 // Current camera X
  let camY = 400 // Current camera Y
  let zoom = 1.0 // Current zoom
  
  let targetCamX = 600
  let targetCamY = 400
  let targetZoom = 1.0
  let focusEndTime = 0
  
  let effects: Effect[] = []
  let floatingTexts: FloatingText[] = []
  const processedEventIds = new Set<string>()

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
          
          if (event.tier === 4) {
            effects.push(createShockwave(event.x, event.y, nowMs))
            effects.push(createScreenShake(nowMs))
            
            // Auto-zoom on catastrophe
            targetCamX = event.x
            targetCamY = event.y
            targetZoom = 2.0
            focusEndTime = nowMs + 2500 // Hold for 2.5s
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
        targetCamX = 600
        targetCamY = 400
        targetZoom = 1.0
        focusEndTime = 0
      }

      // Smooth camera LERP
      const lerpFactor = 0.1
      camX = p.lerp(camX, targetCamX, lerpFactor)
      camY = p.lerp(camY, targetCamY, lerpFactor)
      zoom = p.lerp(zoom, targetZoom, lerpFactor)

      // 2. Prune old effects/texts
      if (processedEventIds.size > 200) {
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
      drawNodes(p, state.nodes, colors, state.config.guardrailsEnabled, zoom)
      drawParticles(p, state.particles, state.nodes, colors)
      drawEffects(p, effects, nowMs)
      drawFloatingTexts(p, floatingTexts, nowMs, colors)

      p.pop()

      // 5. Draw UI Elements (Unscaled)
      drawMinimap(p, state.nodes, state.config, camX, camY, zoom)
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
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
