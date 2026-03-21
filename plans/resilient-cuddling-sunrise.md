# Particle Visual Overhaul: "Luminous Agents"

## Context

Particles currently render as identical 6px cyan circles with barely-visible persistence-buffer trails. They fade to nothing between nodes, feel generic, and don't convey the core concept: each particle is an autonomous AI agent with its own identity, trajectory, and story. The user wants particles that are visually compelling, feel like distinct agents, and invite curiosity.

## Design Direction

**Confirmed choices:** Cool spectrum palette (cyan → purple) + comet/teardrop shape.

Transform particles from anonymous dots into **directional, individually-colored luminous comets** with proper tapered trails. Each agent gets a unique visual identity through color, and their movement is conveyed through shape and trail.

### Key changes:

1. **Individual color identity** — Each particle gets a unique hue derived from `particle.id`, within the cool spectrum (hue 170–300: cyan → teal → blue → purple → magenta). Golden ratio hashing ensures neighboring particles look distinct. This immediately signals "these are different agents."

2. **Directional comet shape** — Replace the circle with a rotated elongated ellipse (1.8:1 aspect ratio) oriented along the direction of travel. Direction computed from the delta between current position and previous trail point. Conveys intentionality and agency.

3. **Proper tapered trails** — The `particle.trail[]` array is already populated by `updateTrail()` in `src/simulation/particle.ts:146` but is currently unused by rendering. Draw these as 10 segments: thick+bright at the head, tapering exponentially to thin+transparent at the tail. Each segment is a small ellipse in the particle's color.

4. **White-hot core + colored glow** — Each particle has a small bright white center (2-3px) with a larger colored glow aura (3x size, alpha ~40) in the particle's unique hue. The white core ensures visibility against ANY background — critical for rainbow mode where cool-spectrum particles would otherwise blend in. Same approach in both themes.

5. **Size variation** — Particles vary in size (4–8px) based on journey progress (`stepsCompleted / maxSteps`). Newer agents are smaller; agents deep into their journey are slightly larger.

6. **Less aggressive alpha fade** — Node-boundary fade reduced from 15% to 8% of progress, preventing the "vanishing mid-path" problem.

### What stays the same:
- State colors for failures (yellow/orange/red/white) override the individual hue
- Exploded ring effect stays
- Trail persistence buffer stays (provides atmospheric background glow behind the new explicit trails)
- Scenic route curved paths stay

## Implementation

### Step 1: Add direction calculation utility

**File:** `src/simulation/particle.ts`

Add a function that returns both position and travel direction (dx, dy) for a particle. Direction comes from the difference between current position and previous trail position (or from the edge vector if no trail yet).

```ts
export function getParticleDirection(particle: Particle, nodeMap: Map<string, GraphNode>): { dx: number, dy: number } | null
```

### Step 2: Add color identity config

**File:** `src/config.ts`

```ts
export const PARTICLE_VISUALS = {
  hueRange: [170, 300],     // cyan through purple (HSB hue degrees)
  baseSizeMin: 4,
  baseSizeMax: 8,
  glowMultiplier: 3,        // glow ellipse = size * this
  glowAlpha: 40,
  trailSegments: 10,        // how many trail points to render
  trailTaperPower: 2,       // exponential taper curve
  cometElongation: 1.8,     // width:height ratio for directional shape
}
```

### Step 3: Overhaul particle-renderer.ts

**File:** `src/rendering/particle-renderer.ts`

For each particle:
1. Get position + direction
2. Compute individual hue from `particle.id` (golden ratio hash mapped to hueRange)
3. Compute size from journey progress
4. Draw colored glow ellipse (large, soft, particle's hue at low alpha)
5. Draw tapered trail from `particle.trail[]` — iterate from oldest to newest, increasing size and alpha, in particle's color
6. Draw main body as a rotated ellipse (elongated along travel direction) in particle's color
7. Draw white-hot core (small bright white ellipse at center, 2-3px) — ensures visibility on both dark and rainbow backgrounds

The state-based coloring (recovering/failed/exploded) overrides the individual hue but keeps the white core.

### Step 4: Enhance trail rendering

**File:** `src/rendering/trails.ts`

- Keep the persistence buffer for atmospheric background glow (it's cheap and adds depth)
- Optionally reduce its intensity slightly so it doesn't compete with the new explicit trails
- The explicit trails in particle-renderer.ts become the primary trail visual

### Step 5: Adjust alpha fade curve

**File:** `src/simulation/particle.ts` (in `getParticlePosition`)

Make the node-boundary alpha fade less aggressive:
- Currently: fade over first/last 15% of progress
- Change to: fade over first/last 8% of progress
- This keeps the smooth appear/disappear but prevents the "vanishing mid-path" feel

### Step 6: Config tuning pass

**File:** `src/config.ts`

- Increase `PARTICLE.trailLength` from 15 to 20 (more trail data for smoother rendering)
- Adjust `TRAIL.alphaMax` down slightly for the persistence buffer (supporting role now)

## Files to modify

| File | Change |
|---|---|
| `src/simulation/particle.ts` | Add `getParticleDirection()`, adjust alpha fade curve |
| `src/config.ts` | Add `PARTICLE_VISUALS` config, tune trail settings |
| `src/rendering/particle-renderer.ts` | Complete overhaul: individual colors, comet shape, tapered trails, glow |
| `src/rendering/trails.ts` | Reduce persistence buffer intensity |

## Verification

1. `npm run check` — type checking, lint, tests, build all pass
2. Visual inspection in browser (`npm run dev`):
   - Each particle should have a distinct color within the cyan-purple range
   - Particles should appear as elongated comets oriented along their travel direction
   - Tapered trails should be visible behind each particle (thick→thin, bright→dim)
   - Soft glow halos visible around particles
   - Particles should NOT vanish mid-path between nodes
   - Failure states (yellow/orange/red/white) should still be clearly distinguishable
   - Performance should stay smooth at 300 particles (target 60fps)
3. Take screenshot for visual quality check against rubric
