import type {
  SimulationConfig,
  SimulationState,
  SimulationStats,
  Particle,
} from '../types'
import { DEFAULT_CONFIG, PARTICLE } from '../config'
import { buildGraph, getEntryNodes } from './graph'
import {
  createParticle,
  advanceParticle,
  arriveAtNode,
  applyFailure,
  updateTrail,
} from './particle'
import {
  computeFailureRate,
  rollFailure,
  pickTier,
  createFailureEvent,
} from './failure'
import {
  shouldIntercept,
  getSafeNeighbors,
  interceptParticle,
  createGuardrailEvent,
} from './guardrails'

export function createSimulation(config?: Partial<SimulationConfig>): SimulationState {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const nodes = buildGraph(finalConfig.layout)

  return {
    nodes,
    particles: [],
    stats: {
      active: 0,
      completed: 0,
      selfCorrected: 0,
      failed: 0,
      catastrophic: 0,
    },
    config: finalConfig,
    recentFailures: [],
    recentGuardrails: [],
    nextParticleId: 1,
    lastSpawnMs: 0,
  }
}

export function applyConfig(
  state: SimulationState,
  patch: Partial<SimulationConfig>
): SimulationState {
  const newConfig = { ...state.config, ...patch }
  let nodes = state.nodes

  // Rebuild graph if layout changed
  if (patch.layout && patch.layout !== state.config.layout) {
    nodes = buildGraph(patch.layout)
  }

  return {
    ...state,
    config: newConfig,
    nodes,
  }
}

export function tick(state: SimulationState, deltaMs: number, nowMs: number): SimulationState {
  let { particles, nextParticleId, lastSpawnMs } = state
  const { config, nodes, recentFailures, recentGuardrails } = state

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // 1. Spawn new particles
  const spawnInterval = 1000 / PARTICLE.spawnRate
  if (lastSpawnMs === 0) {
    lastSpawnMs = nowMs
  }

  const timeSinceLastSpawn = nowMs - lastSpawnMs
  const spawnCount = Math.floor(timeSinceLastSpawn / spawnInterval)

  if (spawnCount > 0) {
    const entryNodes = getEntryNodes(nodes)
    let activeCount = 0
    for (const p of particles) {
      if (!['completed', 'failed', 'exploded'].includes(p.state)) {
        activeCount++
      }
    }

    for (let i = 0; i < spawnCount; i++) {
      if (activeCount < config.particleCount) {
        const startNode = entryNodes[Math.floor(Math.random() * entryNodes.length)]
        if (startNode) {
          const newParticle = createParticle(nextParticleId++, startNode.id, startNode.neighbors)
          particles = [...particles, newParticle]
          activeCount++
        }
      }
    }
    lastSpawnMs = lastSpawnMs + spawnCount * spawnInterval
  }

  // 2. Update existing particles
  const nextParticles: Particle[] = []
  const nextFailures = [...recentFailures]
  const nextGuardrails = [...recentGuardrails]

  for (let p of particles) {
    // Only advance if state is spawning, active, or recovering
    if (p.state === 'failed' || p.state === 'exploded' || p.state === 'completed') {
      nextParticles.push(p)
      continue
    }

    // Update trail based on current position
    const currentNode = nodeMap.get(p.currentNodeId)
    const targetNode = nodeMap.get(p.targetNodeId)
    
    if (currentNode && targetNode) {
      const x = currentNode.x + (targetNode.x - currentNode.x) * p.progress
      const y = currentNode.y + (targetNode.y - currentNode.y) * p.progress
      p = updateTrail(p, x, y)
    }

    // Advance progress
    p = advanceParticle(p, deltaMs, config.agentSpeed)

    // Handle arrival
    if (p.progress >= 1.0) {
      const nodeReached = nodeMap.get(p.targetNodeId)
      if (!nodeReached) {
        // Should not happen, but for safety
        p = { ...p, state: 'completed' }
      } else {
        // Roll for failure BEFORE arriving (logical step)
        const failureRate = computeFailureRate(nodeReached.risk, config.modelPreset, config.failureMultiplier)
        const isFailed = rollFailure(failureRate)

        if (isFailed) {
          const tier = pickTier(nodeReached.risk, config.guardrailsEnabled)
          
          if (shouldIntercept(nodeReached, tier, config.guardrailsEnabled)) {
            // Guardrail intercept
            const safeNeighbors = getSafeNeighbors(nodes, nodeReached.id)
            if (safeNeighbors.length > 0) {
              p = interceptParticle(p, safeNeighbors)
              nextGuardrails.push(createGuardrailEvent(nodeReached.id, nodeReached.x, nodeReached.y, nowMs))
            } else {
              // No safe path, just complete it but mark as intercepted if possible?
              p = { ...p, state: 'completed', currentNodeId: nodeReached.id, progress: 0 }
              nextGuardrails.push(createGuardrailEvent(nodeReached.id, nodeReached.x, nodeReached.y, nowMs))
            }
          } else {
            // Failure applies
            const event = createFailureEvent(tier, nodeReached.id, nodeReached.x, nodeReached.y, nowMs)
            p = applyFailure(p, tier, event.text, 2) // arbitrary stepBack 2 for tier 1
            nextFailures.push(event)
          }
        } else {
          // Success arrival
          p = arriveAtNode(p, nodeReached.neighbors)
        }
      }
    }

    nextParticles.push(p)
  }

  // 3. Prune and Update stats in one pass
  const finalParticles: Particle[] = []
  const activeParticles: Particle[] = []
  const inactiveParticles: Particle[] = []

  const stats: SimulationStats = {
    active: 0,
    completed: 0,
    selfCorrected: 0,
    failed: 0,
    catastrophic: 0,
  }

  for (const p of nextParticles) {
    const isInactive = ['completed', 'failed', 'exploded'].includes(p.state)
    if (isInactive) {
      inactiveParticles.push(p)
    } else {
      activeParticles.push(p)
      stats.active++
    }

    // Tally stats
    if (p.state === 'completed') stats.completed++
    if (p.failureTier === 1) stats.selfCorrected++
    else if (p.failureTier === 2 || p.failureTier === 3) stats.failed++
    else if (p.failureTier === 4) stats.catastrophic++
  }

  const prunedInactive = inactiveParticles.slice(-200)
  finalParticles.push(...activeParticles, ...prunedInactive)

  // 5. Cap recent events
  const finalFailures = nextFailures.slice(-50)
  const finalGuardrails = nextGuardrails.slice(-50)

  return {
    ...state,
    particles: finalParticles,
    stats,
    recentFailures: finalFailures,
    recentGuardrails: finalGuardrails,
    nextParticleId,
    lastSpawnMs,
  }
}
