import { SWARM } from '../config'

// Cheap deterministic pseudo-random in [0, 1) from integer seeds
function hash01(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Offset (px) of one helper subagent from its lead agent, which flies straight
 * along an edge with unit direction (ex, ey) and the given length.
 *
 * Helpers stream ahead of and behind the leader, spread sideways mid-edge,
 * converge at nodes, and dart about individually ("flit"). Pure and deterministic.
 */
export function swarmMemberOffset(
  particleId: number,
  memberIndex: number,
  progress: number,
  timeMs: number,
  ex: number,
  ey: number,
  edgeLength: number,
): { dx: number; dy: number } {
  const r1 = hash01(particleId, memberIndex)
  const r2 = hash01(memberIndex + 17, particleId)
  const r3 = hash01(particleId + 31, memberIndex + 7)
  const t = timeMs / 1000
  const pr = Math.min(1, Math.max(0, progress))

  const envelope = SWARM.nodeTightness + (1 - SWARM.nodeTightness) * Math.sin(Math.PI * pr)

  // Along-edge: each helper holds a slot ahead/behind the leader that slowly drifts
  const slot = Math.max(-0.5, Math.min(0.5, (r1 - 0.5) + 0.15 * Math.sin(t * (0.7 + r2) + r3 * 6.28)))
  let along = slot * SWARM.length * envelope
  // Keep helpers on the edge: don't overshoot either node
  const pos = pr * edgeLength
  along = Math.min(edgeLength - pos, Math.max(-pos, along))

  // Sideways: weave gently, tighter at nodes
  const side = (r2 * 2 - 1) * 0.6 + 0.4 * Math.sin(t * (1.1 + r1) + r2 * 6.28)
  const perp = Math.max(-1, Math.min(1, side)) * SWARM.width * envelope

  // Flit: quick individual darting (two fast sines per axis), bounded by SWARM.flit
  const fx = 0.6 * Math.sin(t * (6 + r3 * 5) + r1 * 20) + 0.4 * Math.sin(t * (11 + r2 * 7) + r3 * 9)
  const fy = 0.6 * Math.sin(t * (7 + r1 * 5) + r2 * 20) + 0.4 * Math.sin(t * (13 + r3 * 6) + r1 * 9)
  const flitX = fx * SWARM.flit * Math.SQRT1_2
  const flitY = fy * SWARM.flit * Math.SQRT1_2

  // Rotate (along, perp) into world space; perpendicular normal is (-ey, ex)
  return {
    dx: along * ex - perp * ey + flitX,
    dy: along * ey + perp * ex + flitY,
  }
}
