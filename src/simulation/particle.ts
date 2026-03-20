import type { Particle, FailureTier } from '../types'
import { PARTICLE } from '../config'

/**
 * Creates a new particle starting at a given node.
 */
export function createParticle(id: number, startNodeId: string, neighbors: string[]): Particle {
  const targetNodeId = neighbors[Math.floor(Math.random() * neighbors.length)]
  const maxSteps = Math.floor(Math.random() * (PARTICLE.maxSteps - PARTICLE.minSteps + 1)) + PARTICLE.minSteps
  
  return {
    id,
    state: 'spawning',
    currentNodeId: startNodeId,
    targetNodeId,
    progress: 0,
    stepsCompleted: 0,
    maxSteps,
    trail: []
  }
}

/**
 * Advances the particle's progress based on time and speed.
 */
export function advanceParticle(particle: Particle, deltaMs: number, speed: number): Particle {
  const progressIncrement = PARTICLE.baseSpeed * speed * deltaMs
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
