import { GUARDRAIL_MESSAGES } from '../config'
import type { GraphNode, Particle, GuardrailEvent, FailureTier } from '../types'

export function isProtectedNode(node: GraphNode): boolean {
  return node.risk === 'high' || node.risk === 'critical'
}

export function shouldIntercept(
  node: GraphNode,
  tier: FailureTier,
  guardrailsEnabled: boolean,
): boolean {
  if (!guardrailsEnabled) return false
  if (tier === 4) return true
  if (tier === 3 && isProtectedNode(node)) return true
  return false
}

export function interceptParticle(particle: Particle, safeNeighborIds: string[]): Particle {
  if (safeNeighborIds.length === 0) return particle
  const newTarget = safeNeighborIds[Math.floor(Math.random() * safeNeighborIds.length)]
  return { ...particle, targetNodeId: newTarget, state: 'recovering' }
}

export function getSafeNeighbors(nodes: GraphNode[], nodeId: string): string[] {
  const node = nodes.find(n => n.id === nodeId)
  if (!node) return []
  return node.neighbors.filter(neighborId => {
    const neighbor = nodes.find(n => n.id === neighborId)
    return neighbor !== undefined && !isProtectedNode(neighbor)
  })
}

export function pickGuardrailMessage(): string {
  return GUARDRAIL_MESSAGES[Math.floor(Math.random() * GUARDRAIL_MESSAGES.length)]
}

export function createGuardrailEvent(
  nodeId: string,
  x: number,
  y: number,
  timestamp: number,
): GuardrailEvent {
  return { text: pickGuardrailMessage(), nodeId, x, y, timestamp }
}
