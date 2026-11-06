# Session Log

## 2026-03-22 — Session 26: Help Page & Failure Expansion

**What was done:**
- Overhauled help page (`src/ui/help.ts`) with a detailed explanation of guardrails and a practical Stripe-based example.
- Updated the "Agent Status" color guide to align with the T1-T4 failure tiers and current particle hues (Cyan, Yellow, Orange, Red, White Flash).
- Added the missing `C` (Toggle Controls) shortcut to the help overlay.
- Expanded the failure message library in `src/config.ts` with 40+ new, realistic, and "scary" scenarios for Tier 3 and Tier 4.
- Implemented connector-specific failure scenarios for high/critical nodes including AWS IAM, RDS, Kubernetes, Stripe, Okta, and 1Password.
- Verified all changes with `npm run check` (106 tests passed).

**What's next:**
- Review the new failure messages in action during a simulation.
- Proceed with any remaining UI or sound polish.

---

## 2026-03-22 — Session 25: Title + Layout Density + Particle Slider Fix

**What was done:**
- Renamed project to "The Guardrail Effect" — updated `index.html` title, sound overlay, onboarding modal, `docs/project.md`
- Added persistent floating title at top-center of viewport (`src/ui/title.ts`, CSS in `styles.css`)
- Doubled node count: each connector now appears twice in global scenario (~130 nodes), via `expandedByRisk` in `graph.ts`
- Compacted flow layout: canvas 2000×1400 → 1200×900, column spacing 400→200px, yPadding 150→80
- Added denser graph connectivity: skip-tier cross-links + same-tier non-adjacent links per node
- Camera default zoom: 0.8 → 1.2; center: (1000,700) → (600,450)
- Min zoom raised: 0.3 → 0.5 (prevents zooming out to where everything becomes tiny)
- Default particle count: 300 → 700
- Fixed particle slider: spawn rate now scales with deficit (`rampMultiplier`) so target count is reached within seconds
- Minimap virtualHeight updated: 800 → 900
- All 105 tests passing

**What's next:**
- Soundscape improvements (deferred by user)

---

## 2026-03-21 — Session 23: Zoom sensitivity fix + git cleanup

**What was done:**
- Reduced scroll zoom sensitivity from 10% to 4% per tick (`0.9/1.1` → `0.96/1.04`) in `src/rendering/renderer.ts`
- Merged `fix-zoom-sensitivity` branch to main
- Cleaned up stale git worktrees and orphaned directories (agent-ad8a7db2, atmospheric-storm, rendering-perf, storm-polish-perf, storm-v2, vivid-rainbow)

**What's next:**
- Decide what to do with `prep-public-repo` worktree (1 unmerged commit: strip internal docs for public GitHub release)

**Unresolved:**
- `prep-public-repo` branch pending user decision (merge, drop, or leave)

---

## 2026-03-21 — Session 22: UI/UX Polish

**What was done:**
- Fixed GitLab icon bug (`' foxes'` → `'🦊'`) in `src/config.ts`
- Reduced failure rate to 1/100th: `failureMultiplier` default 1→0.01, `UI.failureMultiplierMin` 0.1→0.01
- Slowed particles: `baseSpeed` 0.0035→0.0012, `spawnRate` 15→8
- Stopped node breathing animation: `NODE_GLOW.breatheAmount` 0.08→0
- Default zoom changed to 0.6 (zoomed out to show full network), `zoomMin` 0.5→0.3
- Reduced camera shake intensity: ±8px→±2px
- Reduced edge line opacity: 0.3→0.15 alpha
- Softened trails: `alphaMax` 180→100, `widthMax` 3.5→2.5, faster fade (fill alpha 15→25)
- Particles fade in/out at node boundaries (no longer clip through icons): exported `NODE_SIZES` from config.ts, modified `getParticlePosition` in `particle.ts` to return alpha based on proximity to node edge, applied alpha in particle-renderer and trails
- All changes implemented in git worktree, merged to main. 111 tests passing.

**What's next:**
- Visual review of the calmer, zoomed-out experience
- Further UX refinements as needed



## 2026-03-21 — Session 21: E2E Tests & Visual Upgrades

**What was done:**
- Implemented 7 Playwright E2E tests in `tests/e2e/app.spec.ts` covering:
  - Page load and console error check
  - Sound overlay dismissal
  - Controls panel open/close
  - Keyboard shortcuts (C, L, ?, Space, Escape)
  - Stats bar real-time updates
  - Event log filtering and entry generation
  - Canvas rendering verification
- Fixed UI layering issues:
  - Modified `main.ts` to show onboarding overlay ONLY after sound overlay is dismissed
  - Changed `sound-overlay.ts` to append to `document.body` (fixing silent failure on missing `#app`)
  - Added `.help-overlay` class to help backdrop for precise E2E targeting
- Upgraded Node Visuals (Node Glow & Atmosphere):
  - Multi-layered radial halos (3-5 layers based on risk)
  - Desynchronized breathing animations (±8% size oscillation)
  - Upgraded Guardrail Shields: 3 concentric rings with staggered pulses and exponential decay
- Implemented Background Atmosphere:
  - Noise-based undulating color field using an offscreen `p5.Graphics` buffer
  - Performance optimization: noise buffer updates every 30 frames
  - Decorative dust particles with noise-based drifting movement
  - Integrated Vignette effect in screen space
- Refactored `keyboard.ts` to use `e.key` instead of `e.code` for better layout compatibility and shortcut reliability.
- Verified Phase 8 (Civic Scenarios) and Phase 7 (Voice Feedback) implementations which were previously integrated.
- All checks passed: 92 tests green, clean TSC, clean ESLint, successful production build.

**Key decisions:**
- Switched to `e.key` for keyboard shortcuts to fix issues with certain keys (like `?`) and make them more intuitive.
- Sequential overlay display (Sound -> Onboarding) improves user flow and prevents interaction conflicts.
- Offscreen buffering for noise and vignette ensures high performance even with complex background effects.


## 2026-03-21 — Session 23: Phase 9 Visual Upgrades

**What was done:**
- Conducted a comprehensive **Visual Quality Audit** against the project's aesthetic and p5.js quality criteria.
- Implemented **Persistent Trail Buffer** in `src/rendering/trails.ts`:
  - Replaced immediate-mode polylines with a world-space buffer that fades over time.
  - Used `SCREEN` blend mode for luminous, additive trail effects.
- Implemented **Cinematic Camera Easing** in `src/rendering/renderer.ts`:
  - Split LERP factors for pan and zoom.
  - Added "snap-to-focus" behavior for catastrophic failure events.
- Enhanced **Shockwave Effects** in `src/rendering/effects.ts`:
  - Added secondary ripples and 15 noise-directed debris particles per shockwave.
- Documented findings and improvements in `docs/visual-review-feedback-v1.md`.
- Fixed lint/type errors and verified with `npm run check`.

**Key decisions:**
- Using a 2000x1400 world-space buffer for trails allows them to stay fixed to the simulation grid during camera movements, creating a "solid" feel.
- Lowered the trail fade rate (`fill(0, 15)`) to create long, ghostly wakes that emphasize agent paths.

**What's next:**
- Final polish and user feedback review.

## 2026-03-21 — Session 24: Bug Fix - Node Visibility & Camera Alignment

**What was done:**
- Fixed critical visibility issue where nodes were not rendering on-screen:
  - Aligned default camera coordinates and auto-return target (`1000, 700`) with the world center defined in `graph.ts` (`2000x1400` world).
  - Restored `drawEdges` call in `renderer.ts` to show the graph's connective structure.
  - Added explicit `p.blendMode(p.BLEND)` reset in `trails.ts` after the `SCREEN` pass to prevent blend state leakage that was washing out subsequent layers.
- Resolved `SyntaxError: Named export 'GIFEncoder' not found` in unit tests:
  - Reverted `clear()` calls to `clear(0, 0, 0, 0)` in `background.ts` and `trails.ts`. While `clear()` is the preferred p5.js API for graphics, the specific bundle/environment interaction with the `gifenc` module was causing an import failure during Vitest execution.
- Verified fix with `npm run check`: all 104 tests (including background and rendering tests) are now passing.

**Key decisions:**
- Prioritized camera centering as the root cause of "missing" nodes; icons were rendering correctly but were far outside the initial 600x400 viewport.
- Reverting to the older `clear(0,0,0,0)` syntax was necessary to maintain test stability across the environment's CJS/ESM boundary for the `gifenc` dependency.

## 2026-03-21 — Orchestrator: Stability & Test Expansion

**What was done:**
- **Investigated Loading Issue:** Diagnosed a test failure caused by a module incompatibility in `p5.js@2.2.2`. The issue was resolved by downgrading to the more stable `p5.js@1.9.0`.
- **Expanded Test Coverage:** Implemented new unit test suites for previously untested, critical areas of the codebase:
  - `tests/unit/scenarios.test.ts`: Validates the integrity of all scenario definitions.
  - `tests/unit/background.test.ts`: Verifies the initialization logic for the complex background rendering.
  - `tests/unit/ui-event-log.test.ts`: Ensures the UI event log correctly adds, caps, and filters events.
- **Fixed Test Environment:** Installed the `jsdom` dev dependency and configured tests to use it, resolving `window is not defined` errors.
- **Code Quality:** Fixed all subsequent TypeScript and ESLint errors that arose from the new tests, ensuring the entire project passes the `npm run check` command successfully.
- **Orchestration:** Managed the project state by merging a feature branch from a sub-agent, cleaning up failed agent worktrees, and committing all final changes directly to `main`.

**Key decisions:**
- Chose to downgrade `p5.js` rather than apply complex Vitest configuration workarounds, prioritizing stability and simplicity.
- Acted directly to implement the test expansion task after the dispatched sub-agent failed repeatedly, ensuring the user's request was completed efficiently.

**What's next:**
- The project is feature-complete according to the current task list. Remaining items are deployment and a stretch goal for theming.

## 2026-03-21 — Session 25: Cha Cha Cha Theme Planning

**What was done:**
- Created a comprehensive implementation plan for the "Cha Cha Cha" dynamic visual theme (`plans/cha-cha-cha-theme.md`).
- Defined the "Angry Storm" (guardrails OFF) and "Rolling Rainbow" (guardrails ON) aesthetics.
- Added Phase 10 to `docs/tasks.md` for future implementation.

**Key decisions:**
- Use Käärijä's "Cha Cha Cha" as a metaphor for the simulation's safety state.
- Transition between high-contrast/neon/stormy and soft/rainbow/flowing visuals based on guardrail toggles.

**What's next:**
- Dispatch a Gemini agent to implement Phase 10.

## 2026-03-21 — Orchestrator: Project Consolidation & Bug Fixes

**What was done:**
- Fixed critical "invisible canvas" bug where `p5` was appending to `body` instead of the `#app` container, causing the simulation to render off-screen.
- Archived completed phases (0-9) from `docs/tasks.md` to `docs/archive/completed-tasks.md`.
- Consolidated and cleaned up workspace by moving old `.md` plan files and agent task files into `archive/` directories.
- Updated `docs/project.md` to ensure recent Phase 8 & 9 enhancements (Civic Scenarios, cinematic camera, persistent trails) were properly documented.
- Verified system stability with `npm run check`.

**Key decisions:**
- A clean workspace and slimmed-down task list sets up a better foundation for the final stretch (Phase 10 Dynamic Theming).

**What's next:**
- Implementation of Phase 10 (Cha Cha Cha theme).

## 2026-03-21 — Agent merge: rendering-perf

## Tasks completed
- **Performance Optimization**: Removed O(N) Map allocations and object creations (p5.Color) from the render loop. Fixed periodic noise update lag spikes in `background.ts` by using a panning buffer strategy.
- **Palette Configuration**: Added `THEME.storm` and `THEME.rainbow` to `src/config.ts`.
- **Dynamic Background Engine**: Implemented `initBackground` and `drawBackground` in `src/rendering/background.ts` to transition between a tense "Angry Storm" and relaxed "Rolling Rainbow" state based on guardrail toggle.
- **Storm Flash Effects**: Implemented a red-orange storm flash in `src/rendering/effects.ts` triggered on simulation failures when guardrails are disabled.

## Results
The simulation now runs "smooth as butter" with a stabilized frame rate even at high particle counts. The visual theme provides visceral feedback on the security state of the system.

## 2026-03-21 — Agent merge: atmospheric-storm

## Tasks completed
- **Atmospheric "Rolling Clouds"**: Replaced the simple panning noise with a multi-layered, independently animated "cloud" system. 
    - Layer 1: Dark, deep-blue/grey base clouds (slow moving).
    - Layer 2: Faster, wispy red-tinted upper clouds using `p.blendMode(p.ADD)` for atmospheric depth.
- **Intense Red Flashes**: Updated `stormFlash` from red-orange to a deep, pure red (`#ee0000`). Doubled the flash duration (400ms -> 800ms) and adjusted the fade curve for maximum visual impact.
- **Storm Palette Intensification**: Updated `THEME.storm` in `config.ts` with a darker background (`#010103`) and a tighter vignette (`0.75`) to create a more claustrophobic, intense feeling when guardrails are off.

## Results
The "Angry Storm" state is now much more atmospheric and visceral. The layered clouds provide a sense of scale and motion, while the pure red flashes clearly distinguish the high-risk state from the safer rainbow mode.

## 2026-11-06 — CV readiness check + swarms

**What was done:**
- Verified live site (theguardraileffect.netlify.app) serves the latest build; GitHub README had a dead demo link and image — replaced with refreshed README + committed screenshot, added LICENSE.
- Removed duplicate help button, added "made march 2026" subtitle.
- Added subagent swarms (pure offset function in `simulation/swarm.ts` + renderer), tests first.
- Stabilised Playwright e2e (workers: 1, `canvas.p5Canvas` locator). Note: e2e needs to run outside the sandbox (Chromium can't launch inside it).
- Researched recent agent developments; brainstormed pivots (fleet/judges, stigmergy). Parked as future pieces.

**What's next:**
- Nothing required. Optional: new piece based on parked ideas in `docs/tasks.md`.

**Decisions:**
- Keep the guardrail theme for this piece; it's dated as a March 2026 snapshot rather than reworked.
- Visual work done directly, not via Gemini.
