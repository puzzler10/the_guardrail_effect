import { SWARM } from '../config'

const GOLDEN_ANGLE_RAD = 2.399963

// Cheap deterministic pseudo-random in [0, 1) from integer seeds
function hash01(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Offset of one helper subagent from its lead agent.
 * Helpers orbit and drift around the leader, spreading out mid-edge and
 * converging as the swarm reaches a node. Pure and deterministic.
 */
export function swarmMemberOffset(
  particleId: number,
  memberIndex: number,
  progress: number,
  timeMs: number,
): { dx: number; dy: number } {
  const r1 = hash01(particleId, memberIndex)
  const r2 = hash01(memberIndex + 17, particleId)

  const speed = (0.6 + r1 * 1.2) * (r2 < 0.5 ? -1 : 1)          // rad/s, mixed directions
  const angle = memberIndex * GOLDEN_ANGLE_RAD + r2 * Math.PI * 2 + (timeMs / 1000) * speed
  const breathe = 0.55 + 0.45 * Math.sin(timeMs / 1000 * (1 + r1) + r2 * 10)  // 0.1 – 1

  const envelope = SWARM.nodeTightness + (1 - SWARM.nodeTightness) * Math.sin(Math.PI * Math.min(1, Math.max(0, progress)))
  const radius = SWARM.radius * (0.35 + 0.65 * r1) * breathe * envelope

  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius }
}
