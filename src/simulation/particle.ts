import type { Particle, FailureTier, PathType } from '../types'
import { PARTICLE, NODE_SIZES, PATH_TYPES } from '../config'

function pickPathType(): PathType {
  const r = Math.random() * 100
  for (let i = 0; i < PATH_TYPES.cumulativeWeights.length; i++) {
    if (r < PATH_TYPES.cumulativeWeights[i]) return PATH_TYPES.types[i] as PathType
  }
  return 'straight'
}

/**
 * Creates a new particle starting at a given node.
 */
export function createParticle(id: number, startNodeId: string, neighbors: string[]): Particle {
  const targetNodeId = neighbors[Math.floor(Math.random() * neighbors.length)]
  const maxSteps = Math.floor(Math.random() * (PARTICLE.maxSteps - PARTICLE.minSteps + 1)) + PARTICLE.minSteps
  // Vary speed multiplier to show non-linear agent behavior (Phase 7)
  const speedMultiplier = 0.8 + Math.random() * 0.4
  const pathType = pickPathType()

  return {
    id,
    state: 'spawning',
    currentNodeId: startNodeId,
    targetNodeId,
    progress: 0,
    stepsCompleted: 0,
    maxSteps,
    speedMultiplier,
    pathType,
    trail: []
  }
}

/**
 * Calculates the visual position of a particle, including "scenic route" curves.
 * Returns position and alpha (0-1) for fading at node boundaries.
 */
export function getParticlePosition(
  particle: Particle,
  nodes: Map<string, { x: number; y: number; risk?: string }>
): { x: number; y: number; alpha: number } | null {
  const from = nodes.get(particle.currentNodeId)
  const to = nodes.get(particle.targetNodeId)
  if (!from || !to) return null

  const dx = to.x - from.x
  const dy = to.y - from.y
  const edgeLength = Math.sqrt(dx * dx + dy * dy)

  if (edgeLength === 0) return { x: from.x, y: from.y, alpha: 1 }

  // Compute node radii from NODE_SIZES (fall back to safe size if unknown)
  const sourceRadius = NODE_SIZES[from.risk ?? ''] ?? NODE_SIZES.safe
  const targetRadius = NODE_SIZES[to.risk ?? ''] ?? NODE_SIZES.safe

  // Fraction of the edge occupied by each node boundary
  const startFraction = sourceRadius / edgeLength
  const endFraction = targetRadius / edgeLength

  // Remap progress to only travel between node boundaries
  const adjustedProgress = startFraction + particle.progress * (1 - startFraction - endFraction)

  // Perpendicular normal vector (for side-to-side offsets)
  const nx = -dy / edgeLength
  const ny = dx / edgeLength
  // Along-edge unit vector (for forward/backward offsets in loop paths)
  const ex = dx / edgeLength
  const ey = dy / edgeLength

  // Envelope: zero at endpoints so particles enter/exit nodes cleanly
  const envelope = Math.sin(particle.progress * Math.PI)
  const pr = particle.progress

  let perpOffset = 0   // perpendicular displacement
  let alongOffset = 0  // along-edge displacement (used by loop type)

  switch (particle.pathType) {
    case 'straight':
      // No offset — direct line
      break

    case 'arc': {
      // Single smooth bulge to one side (direction alternates by id)
      const side = (particle.id % 2 === 0) ? 1 : -1
      perpOffset = Math.sin(pr * Math.PI) * PATH_TYPES.arcScale * side
      break
    }

    case 'wobble': {
      // Classic sine wobble (original behavior)
      const offsetScale = (Math.sin(particle.id * 1.5) * 20) + (Math.cos(particle.id * 0.7) * 10)
      const wave1 = Math.sin(pr * Math.PI * 2) * offsetScale * 0.6
      const wave2 = Math.sin(pr * Math.PI * 3 + particle.id * 0.3) * offsetScale * 0.3
      perpOffset = (wave1 + wave2) * envelope
      break
    }

    case 'loop': {
      // Particle curves out then loops back on itself before continuing
      // Loop occurs in the middle 40% of the journey (progress 0.3 → 0.7)
      if (pr >= 0.3 && pr <= 0.7) {
        const loopPhase = (pr - 0.3) / 0.4  // 0 → 1 over loop segment
        const loopAngle = loopPhase * Math.PI * 2
        const loopEnv = Math.sin(loopPhase * Math.PI) // fade loop at its own ends
        perpOffset = Math.sin(loopAngle) * PATH_TYPES.loopRadius * loopEnv
        // Loop also doubles back along the edge (negative = backward)
        alongOffset = -Math.sin(loopAngle * 0.5) * PATH_TYPES.loopRadius * 0.6 * loopEnv
      } else {
        perpOffset = 0
      }
      break
    }

    case 'zigzag': {
      // Sharp triangle-wave direction changes
      const peaks = PATH_TYPES.zigzagPeaks
      const side = (particle.id % 2 === 0) ? 1 : -1
      const zigT = (pr * peaks) % 1  // 0→1 sawtooth per peak
      const triangleWave = zigT < 0.5 ? zigT * 2 : (1 - zigT) * 2  // triangle 0→1→0
      perpOffset = (triangleWave * 2 - 1) * 22 * side * envelope
      break
    }
  }

  // Alpha: fade in over first 8%, full for middle 84%, fade out over last 8%
  const FADE_ZONE = 0.08
  let alpha: number
  const p = particle.progress
  if (p < FADE_ZONE) {
    alpha = p / FADE_ZONE
  } else if (p > 1 - FADE_ZONE) {
    alpha = (1 - p) / FADE_ZONE
  } else {
    alpha = 1
  }

  return {
    x: from.x + dx * adjustedProgress + nx * perpOffset + ex * alongOffset,
    y: from.y + dy * adjustedProgress + ny * perpOffset + ey * alongOffset,
    alpha,
  }
}

/**
 * Advances the particle's progress based on time and speed.
 */
export function advanceParticle(particle: Particle, deltaMs: number, speed: number): Particle {
  const progressIncrement = PARTICLE.baseSpeed * speed * particle.speedMultiplier * deltaMs
  const newProgress = Math.min(1.0, particle.progress + progressIncrement)
  
  return {
    ...particle,
    progress: newProgress
  }
}

/**
 * Handles the particle arriving at its target node.
 */
export function arriveAtNode(particle: Particle, nextNeighbors: string[]): Particle {
  const currentNodeId = particle.targetNodeId
  const targetNodeId = nextNeighbors[Math.floor(Math.random() * nextNeighbors.length)]
  const stepsCompleted = particle.stepsCompleted + 1
  const state = stepsCompleted >= particle.maxSteps ? 'completed' : 'active'
  
  return {
    ...particle,
    currentNodeId,
    targetNodeId,
    progress: 0,
    stepsCompleted,
    state
  }
}

/**
 * Applies a failure to the particle.
 */
export function applyFailure(particle: Particle, tier: FailureTier, text: string, stepBack: number): Particle {
  let state = particle.state
  let stepsCompleted = particle.stepsCompleted

  switch (tier) {
    case 1:
      state = 'recovering'
      stepsCompleted = Math.max(0, stepsCompleted - stepBack)
      break
    case 2:
    case 3:
      state = 'failed'
      break
    case 4:
      state = 'exploded'
      break
  }

  return {
    ...particle,
    state,
    stepsCompleted,
    failureTier: tier,
    failureText: text
  }
}

/**
 * Updates the particle's trail with a new position.
 */
export function updateTrail(particle: Particle, x: number, y: number): Particle {
  const newTrail = [...particle.trail, { x, y }]
  if (newTrail.length > PARTICLE.trailLength) {
    newTrail.shift()
  }
  
  return {
    ...particle,
    trail: newTrail
  }
}
