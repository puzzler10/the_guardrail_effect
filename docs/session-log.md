# Session Log

## 2026-03-20 — Session 1: Ideation & Spec

**What was done:**
- Brainstormed 16 visualization concepts for AI agent guardrail demo
- Selected "Particle Swarm City" as primary direction
- Conducted requirements interview (audience, interaction, tech, deployment)
- Wrote comprehensive spec (docs/spec.md) covering:
  - Simulation model (graph, particles, failure tiers, guardrail mode)
  - Visual design (palette, effects, camera)
  - Sound design (Tone.js, severity-mapped sounds)
  - UI/controls layout
  - Performance budget
  - Full testing strategy with test file breakdown
  - Failure event catalog (30+ events across 4 tiers)
  - User journey walkthrough
- Created project docs, task roadmap

**Key decisions:**
- p5.js WebGL + Vite + TypeScript + Vitest
- Simulation fully decoupled from rendering for testability
- Non-technical audience, self-contained shareable URL
- Sound on but muted by default
- Toggle (not split-screen) for guardrails
- Generic branding, no Civic-specific references
- Gemini co-building same project, need clean module boundaries

**What's next:**
- Phase 0: Initialize project — follow `plans/phase-0-setup.md` step by step
- Then Phase 1: simulation core with TDD

## Implementation decisions (2026-03-20)

Key decisions made during spec review:
- **p5.js 2D canvas mode** (not WebGL) — text just works, perf fine for 500 particles, upgrade only if needed
- **Custom HTML/CSS controls** instead of lil-gui — better for non-technical audience
- **Preset layouts** (clustered, flow, ring) instead of force-directed — simpler, no d3-force dep
- **Sound scope reduced** — event sounds only, ambient drone is stretch goal
- **Playwright E2E minimal** — page loads + no crashes, lean on unit tests
- **Guardrails are perfect** — tier 4 = 0%, tier 3 ≈ 0% when on

## 2026-03-20 — Session 2: Phase 0 Execution

**What was done:**
- Executed plans/phase-0-setup.md step by step
- Manually scaffolded Vite vanilla-ts project (create-vite cancels on non-empty dirs)
- Installed all deps: p5, tone, vitest, @playwright/test, eslint, @eslint/js, typescript-eslint, @types/p5
- Configured package.json scripts including `npm run check`
- Created vite.config.ts (uses `vitest/config` for `test` property — not plain `vite`)
- Created src/types.ts: RiskLevel, FailureTier, ParticleState, GraphNode, Particle, SimulationStats, ModelPreset, FailureEvent, GuardrailEvent, SimulationConfig
- Created src/config.ts: 5 model presets, default config, failure messages (60+ across 4 tiers), guardrail messages, dark/light color palettes, UI limits
- Created index.html, src/main.ts (spinning cyan circle proof-of-life), netlify.toml, .gitignore
- Created tests/unit/config.test.ts (14 tests — all passing)
- `npm run check` exits 0: 14 tests pass, tsc clean, eslint clean, build succeeds

**What's next:**
- Phase 1: Simulation core (TDD — pure TypeScript, no rendering)
  - graph.ts, particle.ts, failure.ts, guardrails.ts, simulation.ts
  - Unit tests first, then implementation

**Notes:**
- The `check` script includes eslint — requires eslint.config.js with typescript-eslint
- ESLint v10 uses flat config format (eslint.config.js, not .eslintrc)
- vitest `test` config must use `vitest/config` not plain `vite`
- vitest run does not support glob patterns easily on some OS, using `vitest run` instead of `vitest run tests/unit/*.test.ts`

## 2026-03-20 — Session 3: Particle Module (Phase 1)

**What was done:**
- Implemented `src/simulation/particle.ts` using TDD
- Created `tests/unit/particle.test.ts` with 13 tests covering:
  - Initial state creation
  - Random step range validation
  - Progress advancement with deltaMs/speed
  - Progress clamping
  - Node arrival logic (state transitions, step increments)
  - Failure tier application (recovering vs failed vs exploded)
  - Trail management (append and trim)
  - Immutability across all operations
- Verified implementation with `npm run check` (all tests passing, types green, lint clean, build successful)

**Key decisions:**
- Adhered strictly to pure TypeScript requirement in `src/simulation/`
- Ensured all functions are immutable, returning new objects
- Fixed type-only import issue (`import type`) for `verbatimModuleSyntax` compatibility

**What's next:**
- Phase 1 continues: `src/simulation/graph.ts`, `failure.ts`, `guardrails.ts`, `simulation.ts`
- Integration tests for failure distribution and guardrail effectiveness

## 2026-03-20 — Session 4: Graph Module (Phase 1)

**What was done:**
- Implemented `src/simulation/graph.ts` using TDD
- Created `tests/unit/graph.test.ts` with 11 tests covering:
  - Node count (30-40) for all layouts
  - Field validation (id, name, icon, risk, x, y, neighbors)
  - Connectivity (BFS reachability from entry nodes)
  - Neighbor ID validation
  - Risk level distribution (all 5 levels present)
  - Entry/Exit node filtering (safe/low risk only)
  - Layout coordinate differences (clustered vs flow vs ring)
  - Helper functions (getNeighbors, getNodeById)
- Implemented 35 tool-nodes representing AI agent capabilities (Read Docs, DB Drop, etc.)
- Implemented deterministic layout coordinate calculation (1200x800 canvas)
- Verified implementation with `npm run check` (all 38 tests passing, types green, lint clean, build successful)

**Key decisions:**
- Used a deterministic seed based on node ID string to ensure consistent positioning within a layout across rebuilds
- Ensured full connectivity with a predefined adjacency list that includes cycles
- Implemented distinct spatial signatures for each layout (Clustered: neighborhoods, Flow: left-to-right, Ring: concentric)

**What's next:**
- Phase 1 continues: `src/simulation/failure.ts`, `src/simulation/guardrails.ts`, `src/simulation/simulation.ts`
- Phase 2: Rendering (p5.js)

## 2026-03-20 — Session 5: Guardrails Module (Phase 1)

**What was done:**
- Implemented `src/simulation/guardrails.ts` using TDD
- Created `tests/unit/guardrails.test.ts` with 21 tests covering:
  - `isProtectedNode` (high/critical = protected, safe/low/medium = not)
  - `shouldIntercept` (disabled when guardrails off; tier 4 always intercepted; tier 3 on protected nodes only; tier 1/2 pass through)
  - `interceptParticle` (reroutes to safe neighbor, sets state=recovering, immutable, no-op on empty neighbors)
  - `getSafeNeighbors` (filters out high/critical neighbors)
  - `pickGuardrailMessage` (non-empty, varied)
  - `createGuardrailEvent` (all fields)
- `npm run check` passes: 59 tests, tsc clean, eslint clean, build green
- Committed: `feat: guardrails module with intercept logic` on `feat/simulation-core`

**Status of Phase 1 (parallel agents):**
- ✅ `graph.ts` + tests — done (Gemini agent)
- ✅ `particle.ts` + tests — done (Gemini agent)
- ✅ `guardrails.ts` + tests — done (Claude)
- ⏳ `failure.ts` + tests — pending (Gemini agent)
- ⏳ `simulation.ts` + tests — blocked on failure.ts

**What's next:**
- Merge `failure.ts` when Gemini agent finishes
- Then implement `simulation.ts` (orchestrates graph, particle, failure, guardrails)
- Then 3 integration tests (failure-distribution, guardrail-effectiveness, simulation-flow)
- Then Phase 2: Rendering

## 2026-03-20 — Session 6: Branch Merge

**What was done:**
- Merged `feat/simulation-core` (graph, particle, guardrails) into `main` via fast-forward
- Merged `feat/failure` (failure module) into `main` — clean merge, no conflicts
- Verified `npm run check` passes: 71 tests, tsc clean, eslint clean, build green
- Cleaned up worktree (`encode_hackathon-failure`) and deleted both feature branches

**Phase 1 status after merge — all 4 modules on main:**
- ✅ `graph.ts` + tests (11 tests)
- ✅ `particle.ts` + tests (13 tests)
- ✅ `guardrails.ts` + tests (21 tests)
- ✅ `failure.ts` + tests (12 tests)
- ⏳ `simulation.ts` + tests — not started
- ⏳ 3 integration tests — not started

**What's next:**
- Implement `simulation.ts` (orchestrator that wires graph, particle, failure, guardrails)
- Write 3 integration tests (failure-distribution, guardrail-effectiveness, simulation-flow)
- Then Phase 2: Rendering

## 2026-03-20 — Session 7: Phase 2 Rendering Implementation

**What was done:**
- Implemented the full rendering layer in `src/rendering/`.
- `renderer.ts`: Main p5.js sketch with camera pan/zoom, coordinate mapping, and event-to-effect bridge.
- `node-renderer.ts`: Risk-based node visualization with labels, icons, and guardrail pulse rings.
- `particle-renderer.ts`: Dynamic particle drawing with health/failure states, fading trails, and glow effects.
- `effects.ts`: Visual feedback system for shockwaves and camera shake on catastrophic failures.
- `text-overlay.ts`: Floating status messages for failure and guardrail events.
- Fixed lint and type errors in `src/simulation/simulation.ts` and the new rendering files.
- Verified all systems with `npm run check`.

**Key decisions:**
- Managed camera state (pan/zoom) directly in the renderer to allow for independent UI scaling later.
- Used a `processedEventIds` Set to ensure events from the simulation only trigger visual effects once.
- Implemented a rising and fading animation for floating text based on event severity.

**What's next:**
- Phase 3: Sound (Tone.js)
- Phase 4: UI & Controls

## 2026-03-20 — Session 8: Phase 3 Sound Implementation

**What was done:**
- Implemented `src/sound/sound-engine.ts` — SoundEngine interface with createSoundEngine() factory
  - Sound disabled by default; setEnabled(true) triggers Tone.start()
  - setVolume() converts 0-1 linear to dB via Tone.gainToDb()
  - Exports singleton `soundEngine`
- Implemented `src/sound/events.ts` — 5 distinct sounds:
  - Tier 1: Short sine blip at A5, ~100ms, quiet (-20dB)
  - Tier 2: Descending square wave (E4→B3), ~300ms
  - Tier 3: MembraneSynth thud (C2) + brown noise buzz, ~500ms
  - Tier 4: Deep MembraneSynth boom (E1) + distorted sawtooth + white noise, ~1.5s
  - Guardrail: Ascending triangle chime (C5→E5→G5), ~400ms
- All synths auto-dispose after playback via setTimeout
- `npm run check` passes: 79 tests, tsc clean, eslint clean, build green
  - Note: 2 pre-existing TS warnings in rendering/particle-renderer.ts (unused imports) — not caused by this work

**What's next:**
- Phase 3 remaining: "Enable Sound" overlay button (UI integration)
- Phase 4: UI & Controls
- Phase 5: Integration & Polish

## 2026-03-20 — Session 9: Phase 1 Simulation Orchestrator Completion

**What was done:**
- Implemented `src/simulation/simulation.ts` and `tests/unit/simulation.test.ts`.
- Added `SimulationState` to `src/types.ts`.
- Implemented the `tick()` function to handle particle spawning, movement, arrival, failure rolling, and guardrail interception.
- Handled immutable state updates and stat calculation.
- Fixed type and lint errors across `simulation.ts`, `renderer.ts`, `particle-renderer.ts`, and `text-overlay.ts` ensuring a fully passing `npm run check`.

**What's next:**
- Write 3 integration tests (failure-distribution, guardrail-effectiveness, simulation-flow).
- Complete remaining Phase 3 and Phase 4 tasks.

## 2026-03-20 — Session 10: Phase 4 UI Implementation

**What was done:**
- Implemented full UI suite in `src/ui/` using pure TypeScript and DOM APIs.
- `styles.css`: Custom dark/light mode styles, panel animations, and component styling.
- `controls.ts`: Left-side panel with 8+ simulation controls (presets, sliders, toggles).
- `stats.ts`: Bottom bar with real-time counters and uptime.
- `event-log.ts`: Right-side panel with severity-filtered event history.
- `help.ts`: Modal overlay with color guides and keyboard shortcuts.
- `keyboard.ts`: Global shortcut handler (Space, G, D, M, L, ?, R).
- Verified implementation with `tsc` and `eslint`.
- All UI components are ready to be wired in Phase 5.

**Key decisions:**
- Used CSS backdrop-filter for modern glassmorphism aesthetic.
- Implemented robust UI-to-Config sync logic in `syncControls`.
- Added automatic light/dark mode body class switching.

**What's next:**
- Phase 5: Integration & Polish (wiring UI to simulation and sound in `main.ts`).

## 2026-03-20 — Session 11: Phase 1 Integration Tests Completion

**What was done:**
- Implemented three comprehensive integration test files in `tests/integration/`:
  - `simulation-flow.test.ts`: Verified particle termination, step limits, and stats consistency.
  - `failure-distribution.test.ts`: Verified tier distribution (T1 > T2 > T3 > T4), multiplier scaling, and model preset differences.
  - `guardrail-effectiveness.test.ts`: Verified T4 elimination, T3 reduction, and guardrail event generation.
- Identified and fixed a critical bug in `src/simulation/simulation.ts` where inactive particles were incorrectly counted against the `particleCount` limit, preventing continuous spawning.
- Fixed type errors and lint warnings in `src/ui/controls.ts` and the new test files.
- Verified the entire project with `npm run check` (92 tests passing, clean TSC, clean ESLint, successful build).

**Key decisions:**
- Increased simulation speed and decreased `deltaMs` in integration tests to gather sufficient statistical data quickly.
- Implemented robust failure and guardrail event counting by tracking timestamps within the simulation loop.
- Adjusted test tolerances (±30%) to account for the stochastic nature of the simulation without sacrificing reliability.

**What's next:**
- Phase 5: Integration & Polish (wiring everything together in `main.ts`).
- Phase 6: E2E & Deploy.

## 2026-03-20 — Session 12: Phase 5 Integration `main.ts`

**What was done:**
- Wrote and executed a comprehensive implementation plan to wire everything together in `src/main.ts`.
- Integrated `createSimulation()`, `tick()`, and `applyConfig()` from the simulation module.
- Bootstrapped Tone.js sound engine and passed it to the `events.ts` sound triggers.
- Initialized p5.js renderer and provided it with the reactive global simulation state.
- Wired all DOM UI modules (`initEventLog`, `initStats`, `initHelp`, `initControls`, `initKeyboard`) to internal callbacks.
- Implemented a decoupled `requestAnimationFrame` simulation loop capping `deltaMs` to prevent background-tab death spirals.
- Implemented deduplication logic for passing events to the event log and sound engine using a sliding `processedEventIds` set.
- Successfully verified full application integrity using `npm run check` (92 passing tests, clean build).

**What's next:**
- Phase 5: Integration & Polish (First-load experience, Auto-zoom, Minimap, Performance tuning).

## 2026-03-20 — Session 13: Phase 3 Sound Completion

**What was done:**
- Implemented "Enable Sound" overlay in `src/ui/sound-overlay.ts`.
- Created glassmorphic UI for initial load to satisfy Web Audio unlock requirement.
- Added ambient drone in `src/sound/sound-engine.ts` using `Tone.Noise('brown')` + `Tone.AutoFilter`.
- Wired overlay into `src/main.ts` with proper sound activation logic.
- Updated `src/ui/styles.css` with sound-specific visual components.
- Verified all systems with `npm run check`.

**Key decisions:**
- Used a brown noise source with low-pass filtering for a subtle "data center" atmosphere.
- Integrated sound enablement with `SimulationConfig` to ensure UI controls stay synced with the engine state.
- Utilized CSS backdrop-filter to maintain the project's modern aesthetic for the sound overlay.

## 2026-03-20 — Session 14: Phase 5 Polish & Navigation

**What was done:**
- Implemented **Auto-zoom on Catastrophe** in `src/rendering/renderer.ts`.
  - Added smooth LERP for camera pan (`camX`, `camY`) and `zoom`.
  - Tier 4 catastrophic events now trigger a 2.5s focus lock on the node where the event occurred.
  - Camera automatically returns to the default view after the focus duration.
- Implemented **Minimap Navigation** in `src/rendering/minimap.ts`.
  - Added a glassmorphic minimap overlay in the bottom-right of the canvas.
  - Visualizes all graph nodes as risk-colored dots.
  - Draws a real-time "viewport rectangle" showing the current camera view area.
- Implemented **First-load Onboarding** in `src/ui/onboarding.ts`.
  - Created a glassmorphic welcome overlay using `localStorage` for persistence.
  - Includes a color-coded risk guide and explanation of the "G" key for Guardrail toggling.
  - Integrated into `src/main.ts` to appear after the sound initialization.
- Verified all changes with `npm run check` (92 tests passed, clean build).

**Key decisions:**
- Used a LERP factor of 0.1 for smooth camera transitions that feel responsive but not jarring.
- Positioned the minimap above the stats bar to avoid UI overlap.
- Reused existing CSS variables and glassmorphic styles for a consistent "high-tech" look.

**What's next:**
- Phase 6: E2E & Deploy.
- Minimal Playwright tests for final verification.
- Deploy to Netlify.

## 2026-03-20 — Session 15: Performance Optimization

**What was done:**
- Investigated and resolved critical performance bottlenecks in simulation and rendering.
- Implemented **O(1) Node Lookups**:
  - Replaced `Array.find` (O(N)) with `Map` lookups in the simulation's `tick` loop and rendering loops for edges and particles.
- Optimized **Rendering Pipeline**:
  - Removed `shadowBlur` (heavy Canvas2D effect) from particle rendering.
  - Implemented **Batched Trail Drawing** using `p.beginShape()` and `p.endShape()` to reduce draw calls.
- Optimized **Simulation Logic**:
  - Refactored statistics calculation to a single-pass loop over particles.
  - Reduced redundant array filter operations during spawning and pruning.
- Verified all changes with `npm run check` (92 tests passed, build successful).
- Changes merged into `main` after verification in a dedicated worktree.

**Key decisions:**
- Prioritized frame stability over minor visual fidelity (shadow blur) to ensure a smooth 60 FPS experience with high particle counts.
- Used a temporary `Map` within hot loops to maintain O(1) performance without breaking the established simulation/rendering split.
- Maintained existing unit and integration test coverage throughout the refactor.

**What's next:**
- Phase 6: E2E & Deploy.

## 2026-03-20 — Session 16: Polish & Aesthetic Improvements

**What was done:**
- Implemented **Slower Particles** for better visibility and "deliberate" feel.
  - Reduced `baseSpeed` from 0.008 to 0.005 in `src/config.ts`.
- **Simplified Visuals** by removing lines between nodes (edges).
  - Cleaned up `src/rendering/renderer.ts` and `src/rendering/node-renderer.ts` to remove edge drawing logic.
- Enhanced **Contrast & Legibility**:
  - Updated color palettes in `src/config.ts` with more vibrant particle colors and muted node colors.
  - Added dark halos/shadows to floating text and node labels for readability on complex backgrounds.
  - Implemented contextual node labels: only visible when zoomed in or for high-risk nodes.
- Expanded **Simulation Scale**:
  - Increased node count from 35 to 45 in `src/simulation/graph.ts`.
  - Refined all 45 node templates with unique icons for better distinction.
- Verified all changes with `npm run check` (92 tests passed, build successful).

**Key decisions:**
- Removing edges significantly reduced visual noise, letting the particle swarm "define" the network structure.
- Tied label visibility to camera zoom to keep the wide view clean while providing detail when focused.
- Added a "shiver" jitter effect to Tier 4 floating text to emphasize catastrophic failure.

**What's next:**
- Phase 6: E2E & Deploy.
