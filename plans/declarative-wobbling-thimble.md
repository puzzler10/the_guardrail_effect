# UI/UX Polish Plan

## Context

The network visualization is too zoomed-in by default, has too many failure events firing, particles are too fast/frantic, the "foxes" text bug is visible, and particles clip through node icons. The user wants a calmer, more cinematic default experience that showcases the full network.

---

## Task 1: Fix GitLab "foxes" icon bug

**File:** `src/config.ts:171`

Change `' foxes'` to `'🦊'`

**Verify:** `npm run check`, visual check that GitLab shows fox emoji.

---

## Task 2: Config tuning — failure rate, particle speed, spawn rate, breathing

**File:** `src/config.ts`

| Line | Setting | Current | New | Why |
|------|---------|---------|-----|-----|
| 41 | `failureMultiplier` | `1` | `0.01` | 1/100th failure rate as requested |
| 57 | `spawnRate` | `15` | `8` | Less frantic particle density |
| 59 | `baseSpeed` | `0.0035` | `0.0012` | ~3x slower particle traversal |
| 351 | `NODE_GLOW.breatheAmount` | `0.08` | `0` | Stop node size jiggling |

**Verify:** `npm run check`. Visually: far fewer failures, calmer particles, static nodes.

---

## Task 3: Default zoom out + camera reset

**File:** `src/rendering/renderer.ts`

| Line | Current | New |
|------|---------|-----|
| 32 | `zoom = 1.0` | `zoom = 0.6` |
| 36 | `targetZoom = 1.0` | `targetZoom = 0.6` |
| 101 | `targetZoom = 1.0` (tier-4 reset) | `targetZoom = 0.6` |

Also in `src/config.ts`:
| Line | Setting | Current | New |
|------|---------|---------|-----|
| 338 | `UI.zoomMin` | `0.5` | `0.3` |

Consider extracting `0.6` as `const DEFAULT_ZOOM = 0.6` at top of renderer.ts.

**Verify:** On load, the full 2000x1400 world fits comfortably on screen. After tier-4 zoom, camera returns to zoomed-out view.

---

## Task 4: Reduce camera shake

**File:** `src/rendering/effects.ts:84`

Change: `const intensity = (1 - progress) * 8` → `const intensity = (1 - progress) * 2`

Max shake offset goes from ±8px to ±2px.

**Verify:** `npm run check`.

---

## Task 5: Reduce edge line opacity

**File:** `src/rendering/node-renderer.ts:101`

Change: `fromColor.setAlpha(255 * 0.3)` → `fromColor.setAlpha(255 * 0.15)`

The gold connection lines are visually dominant in screenshots. Halving their opacity keeps structure visible but less noisy.

**Verify:** `npm run check`. Edges visible but not overwhelming.

---

## Task 6: Soften trail intensity

**File:** `src/config.ts`

| Line | Setting | Current | New |
|------|---------|---------|-----|
| 65 | `TRAIL.alphaMax` | `180` | `100` |
| 68 | `TRAIL.widthMax` | `3.5` | `2.5` |

**File:** `src/rendering/trails.ts` — find the `fill(0, 15)` fade overlay and change to `fill(0, 25)` for faster trail decay.

**Verify:** `npm run check`. Trails visible but more subtle.

---

## Task 7: Particles stop at node boundaries (most complex)

Particles currently travel center-to-center, visually clipping through node icons. They should fade out as they approach a node and fade in as they leave.

**Files:**
- `src/config.ts` — add `NODE_SIZES` export (currently only in node-renderer.ts)
- `src/simulation/particle.ts` — modify `getParticlePosition` to return alpha based on proximity to node boundary
- `src/rendering/particle-renderer.ts` — use returned alpha to modulate particle dot opacity
- `src/rendering/trails.ts` — modulate trail alpha similarly

**Approach:**
1. Export `NODE_SIZES` from `config.ts` (simulation code can't import from rendering)
2. In `getParticlePosition`, compute edge length from source→target distance. Calculate `startFraction = sourceRadius / edgeLength` and `endFraction = targetRadius / edgeLength`
3. Return `alpha`: 0 at progress=0, ramp to 1 over first 15% of edge, hold at 1, ramp to 0 over last 15%
4. In particle-renderer, multiply particle dot alpha by the returned alpha value

**Verify:** Unit tests: at progress=0 alpha=0, at progress=0.5 alpha=1, at progress≥0.9 alpha<1. Visual: particles fade in/out at node edges. `npm run check`.

---

## Execution Order

Tasks 1-6 are independent single-file changes — can all run in parallel.
Task 7 is multi-file and should run last (or as a separate agent).

## Verification

After all tasks: `npm run check` (vitest + tsc + eslint + vite build). Visual inspection of the running app at localhost:5173.
