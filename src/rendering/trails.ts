import p5 from 'p5'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import type { Particle, GraphNode } from '../types'
import type { COLORS_DARK } from '../config'

let trailBuffer: p5.Graphics

export function initTrails(p: p5) {
  trailBuffer = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT)
  trailBuffer.pixelDensity(1)
  trailBuffer.clear()
}

// Trail buffer disabled — saves a full 2.4M-pixel fade + blit every frame.
// Primary motion-blur trails are handled in particle-renderer.ts.
export function drawTrails(_p: p5, _particles: Particle[], _nodes: GraphNode[], _colors: typeof COLORS_DARK, _nodeMap: Map<string, GraphNode>) {
  void trailBuffer
}

export function handleTrailsResize(_p: p5) {
  // no-op: buffer is world-space, unchanged on viewport resize
}
