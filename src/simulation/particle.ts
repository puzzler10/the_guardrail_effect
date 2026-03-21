import type { Particle, FailureTier } from '../types'
import { PARTICLE } from '../config'

/**
 * Creates a new particle starting at a given node.
 */
export function createParticle(id: number, startNodeId: string, neighbors: string[]): Particle {
  const targetNodeId = neighbors[Math.floor(Math.random() * neighbors.length)]
  const maxSteps = Math.floor(Math.random() * (PARTICLE.maxSteps - PARTICLE.minSteps + 1)) + PARTICLE.minSteps
  // Vary speed multiplier to show non-linear agent behavior (Phase 7)
  const speedMultiplier = 0.8 + Math.random() * 0.4
  
  return {
    id,
    state: 'spawning',
    currentNodeId: startNodeId,
    targetNodeId,
    progress: 0,
    stepsCompleted: 0,
    maxSteps,
    speedMultiplier,
    trail: []
  }
}

/**
 * Calculates the visual position of a particle, including "scenic route" curves.
 */
export function getParticlePosition(
  particle: Particle, 
  nodes: Map<string, { x: number; y: number }>
): { x: number; y: number } | null {
  const from = nodes.get(particle.currentNodeId)
  const to = nodes.get(particle.targetNodeId)
  if (!from || !to) return null

  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  if (dist === 0) return { x: from.x, y: from.y }

  // Scenic route: add a perpendicular offset based on progress and particle ID (Phase 7)
  const nx = -dy / dist
  const ny = dx / dist
  
  // Stable offset based on particle ID
  const offsetScale = (Math.sin(particle.id * 1.5) * 40) + (Math.cos(particle.id * 0.7) * 20)
  const offset = Math.sin(particle.progress * Math.PI) * offsetScale
  
  return {
    x: from.x + dx * particle.progress + nx * offset,
    y: from.y + dy * particle.progress + ny * offset,
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
