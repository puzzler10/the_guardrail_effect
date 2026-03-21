# Visual/UI Bug Fix Plan

## Context

The simulation has multiple visual bugs visible in screenshots: ghosting/after-images when dragging, red horizontal stripe artifacts, nodes clumped in 5 circles instead of spread across the screen, and a psychedelic rainbow mode. Additionally, several UI controls need cleanup (remove model preset, dark mode toggle, rescale failure rate slider).

## Root Cause Analysis

**Ghosting/artifacts:** `renderer.ts` draw() never calls `p.background()`. It relies on `drawBackground()` which uses alpha-tinted buffers — during storm/rainbow transitions, neither buffer is fully opaque, so previous frames bleed through. SCREEN blend mode only adds light, never darkens.

**Red stripes:** `stormFlash` effect uses `p.resetMatrix()` inside the world-space push/pop AND previous flashes accumulate because the canvas is never cleared.

**5 circles:** Default layout is 'clustered' which arranges 5 risk groups in a pentagon pattern. The user wants a horizontal spread.

**Rainbow too bright:** HSB noise at saturation 85, brightness 45 with SCREEN blend = blinding. Vignette only 0.2 in rainbow mode.

---

## Phase 1: Fix Rendering Artifacts (background clear + storm flash)

### Files
- `src/rendering/renderer.ts`
- `src/rendering/effects.ts`

### Changes
1. **Add `p.background(colors.background)` as first line after `const colors = ...` in draw()** — clears canvas every frame
2. **Split `drawEffects` into `drawWorldEffects` and `drawScreenEffects`:**
   - `drawWorldEffects`: shockwaves (stay inside world-space push/pop)
   - `drawScreenEffects`: stormFlash (call AFTER `p.pop()`, before minimap/vignette)
3. Remove `p.resetMatrix()` from stormFlash since it's now drawn in screen space naturally

### Verification
- No ghosting when dragging/rotating
- No red stripe accumulation
- No artifacts when toggling guardrails on/off

---

## Phase 2: Config & UI Cleanup

### Files
- `src/config.ts`
- `src/ui/controls.ts`

### Changes
1. **Failure rate slider:** max 10 → 3, step 0.1 → 0.01, display toFixed(2)
2. **Default agent speed:** 1 → 0.5
3. **Default layout:** 'clustered' → 'flow'
4. **Remove Model Preset dropdown** (lines 33-39 in controls.ts + sync line 158)
5. **Remove Dark Mode toggle** (lines 109-117 in controls.ts + sync line 166)
6. Keep `document.body.classList.toggle('light-mode', !config.darkMode)` in syncControls

### Verification
- `npm run check` passes
- Slider shows 0.01-3.00x range with 2 decimal places
- No model preset or dark mode in panel

---

## Phase 3: Layout — Spread Nodes Horizontally

### Files
- `src/simulation/graph.ts`

### Changes
1. **Flow layout spacing:** change `200 + (riskIndex * 350)` to `150 + (riskIndex * 400)` — positions become 150, 550, 950, 1350, 1750 spanning nearly full 2000px width

### Verification
- Nodes spread across full horizontal canvas width
- Existing tests pass

---

## Phase 4: Rainbow Theme Tone-Down

### Files
- `src/rendering/background.ts`
- `src/config.ts`

### Changes
1. **Rainbow buffer:** saturation 85 → 50, brightness 45 → 25 (background.ts line 91)
2. **Rainbow vignette:** 0.2 → 0.4 (config.ts line 403)

### Verification
- Rainbow mode is calmer, no white-hot center
- Still visually distinct from storm mode

---

## Phase 5: Scrollbar CSS

### Files
- `src/ui/styles.css`

### Changes
1. Scrollbar width: 4px → 8px
2. Thumb opacity increase for visibility

### Verification
- Scrollbar is easily grabbable

---

## Phase 6: Particle Movement Variety

### Files
- `src/simulation/particle.ts`

### Changes
1. Replace single sine offset with multi-frequency wobble:
   - `wave1 = sin(progress * PI * 2) * scale * 0.6` (full S-curve)
   - `wave2 = sin(progress * PI * 3 + id * 0.3) * scale * 0.3` (detour)
   - `envelope = sin(progress * PI)` (fade at endpoints)
   - Combined offset creates loops/detours while arriving cleanly at destination

### Verification
- Particles take visibly varied paths
- Simulation tests still pass

---

## Delegation Plan (Gemini vs Claude)

**Gemini agent tasks** (rendering/visual/UI — write to `agents/tasks/`):
1. Phase 1: Background clear + storm flash restructure
2. Phase 4: Rainbow theme tone-down
3. Phase 5: Scrollbar CSS
4. Phase 2 partial: Remove model preset dropdown, remove dark mode toggle, fix slider scale

**Claude direct** (simulation/logic/config):
1. Phase 2 partial: Config defaults (layout, speed)
2. Phase 3: Layout algorithm spacing
3. Phase 6: Particle movement variety

### Execution for new sessions
The plan file at `plans/peaceful-munching-pizza.md` serves as the reference. For Gemini delegation, task prompts will be written to `agents/tasks/` and dispatched via `./scripts/agent-dispatch.sh`. Claude work can be done directly in this worktree.

---

## End-to-End Test
1. Run `npm run check` (vitest + tsc + eslint + vite build)
2. Open dev server, verify:
   - No ghosting when dragging camera
   - No red stripes on failures
   - Nodes spread horizontally
   - Rainbow mode is muted/pleasant
   - Slider shows 0.01-3.00x
   - No model preset or dark mode controls
   - Particles take varied paths
   - Scrollbar is usable
