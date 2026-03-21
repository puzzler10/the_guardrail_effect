# Task: Curved Particle Routing & Speed Variation

## Objective
Make particles travel along curved, randomized "scenic route" paths instead of straight lines between nodes. Vary individual particle speeds to show non-linear, organic agent behavior. The goal is to make the particle flow feel natural and mesmerizing rather than mechanical.

## Files to Modify
- `src/rendering/particle-renderer.ts` — Main changes (curve rendering + position calc)
- `src/config.ts` — Add ROUTING config section

## DO NOT MODIFY
- `src/simulation/` — never touch simulation code
- `src/rendering/renderer.ts` — another agent is modifying this
- `src/rendering/node-renderer.ts` — another agent is modifying this

## Current State
`getParticlePosition()` in `particle-renderer.ts` calculates position as a simple linear interpolation:
```typescript
x: from.x + (to.x - from.x) * particle.progress
y: from.y + (to.y - from.y) * particle.progress
```
Where `particle.progress` goes from 0 to 1 as the particle moves from current node to target node.

Particles all move at the same base speed (`config.ts: PARTICLE.baseSpeed = 0.005`).

## What to Build

### 1. Curved Paths (Quadratic Bezier)
Replace the linear interpolation with a curved path using a random control point:
```typescript
function getCurvedPosition(
  from: {x: number, y: number},
  to: {x: number, y: number},
  t: number,       // progress 0-1
  seed: number     // for deterministic randomness per particle-edge
): {x: number, y: number} {
  // Generate a control point offset perpendicular to the line
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Perpendicular offset, seeded per particle
  const perpX = -dy / dist
  const perpY = dx / dist
  const offset = (seededRandom(seed) - 0.5) * dist * 0.4  // ±40% of edge length

  const cx = midX + perpX * offset
  const cy = midY + perpY * offset

  // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
  const mt = 1 - t
  return {
    x: mt * mt * from.x + 2 * mt * t * cx + t * t * to.x,
    y: mt * mt * from.y + 2 * mt * t * cy + t * t * to.y,
  }
}
```

The seed should be deterministic per particle+edge combination so the curve doesn't change as the particle moves along it. Use something like: `hashCode(particle.id + particle.currentNodeId + particle.targetNodeId)`

### 2. Simple Seeded Random
Implement a simple hash-based seeded random for deterministic curves:
```typescript
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
```

### 3. Speed Variation
Add per-particle speed variation to make the flow feel organic:
- When drawing, apply an easing function to `particle.progress` to create acceleration/deceleration:
```typescript
// Ease in-out cubic: slow start, fast middle, slow end
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
```
- This doesn't change actual simulation speed, just how the visual position maps from progress

### 4. Update Trail Recording
The trail positions should follow the curved path. Update `getParticlePosition()` to use the curved calculation, so trails naturally trace the curves.

### 5. Config Parameters
Add to `src/config.ts`:
```typescript
export const ROUTING = {
  curvature: 0.4,       // Max perpendicular offset as fraction of edge length
  easing: true,         // Apply ease-in-out to progress
  curveEnabled: true,    // Master toggle for curves
}
```

## Acceptance Criteria
- [ ] Particles travel along smooth curved paths, not straight lines
- [ ] Each particle-edge combination has a unique, deterministic curve
- [ ] Some curves bend left, some right (randomized per particle)
- [ ] Trails follow the curved paths
- [ ] Visual speed varies along the path (slow at nodes, fast in between)
- [ ] ROUTING config added to config.ts
- [ ] Performance: 300 particles with curves at 60fps (bezier math is cheap)
- [ ] `npm run check` passes
- [ ] Dark and light mode both work

## Performance Notes
- Quadratic bezier is just a few multiplications — very cheap
- The seeded random is computed once per particle position, not per frame
- Trail rendering already iterates segments, just need to update positions
