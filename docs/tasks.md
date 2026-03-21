# Tasks

## Phase 0: Project Setup ✅ DONE
- [x] Write spec (docs/spec.md)
- [x] Write project docs (docs/project.md)
- [x] Init git repo
- [x] Initialize Vite + TypeScript project
- [x] Install deps: p5, tone, vitest, playwright, eslint, @types/p5, typescript, @eslint/js, typescript-eslint
- [x] Configure `npm run check`: `vitest run && tsc --noEmit && eslint src/ tests/ && vite build`
- [x] Configure vitest in vite.config.ts (uses `vitest/config`)
- [x] Create `src/types.ts` — all shared interfaces
- [x] Create `src/config.ts` — model presets, failure messages, guardrail messages, color palettes, UI limits
- [x] Create `index.html` with full-screen canvas container
- [x] Create `src/main.ts` — proof-of-life p5.js sketch
- [x] Create `netlify.toml`
- [x] `npm run check` passes (14 tests, types, eslint, build all green)
- [x] Committed: "chore: project setup with Vite, p5.js, TypeScript, Vitest"

## Phase 1: Simulation Core (TDD — pure TypeScript, no rendering) ✅ DONE
- [x] `src/simulation/graph.ts` + `tests/unit/graph.test.ts`
- [x] `src/simulation/particle.ts` + `tests/unit/particle.test.ts`
- [x] `src/simulation/failure.ts` + `tests/unit/failure.test.ts`
- [x] `src/simulation/guardrails.ts` + `tests/unit/guardrails.test.ts`
- [x] `src/simulation/simulation.ts` + `tests/unit/simulation.test.ts`
- [x] `tests/integration/failure-distribution.test.ts`
- [x] `tests/integration/guardrail-effectiveness.test.ts`
- [x] `tests/integration/simulation-flow.test.ts`

## Phase 2: Rendering (p5.js 2D canvas) ✅ DONE
- [x] `src/rendering/renderer.ts` — main loop, camera (zoom/pan)
- [x] `src/rendering/node-renderer.ts` — node circles, pulses, icons
- [x] `src/rendering/particle-renderer.ts` — particles + trails + glow (shadowBlur)
- [x] `src/rendering/effects.ts` — shockwaves, explosions, screen shake
- [x] `src/rendering/text-overlay.ts` — floating failure text

## Phase 3: Sound (reduced scope) ✅ DONE
- [x] `src/sound/sound-engine.ts` — Tone.js setup, master controls
- [x] `src/sound/events.ts` — event sounds by severity (5 sounds: 4 tiers + guardrail)
- [x] "Enable Sound" overlay button
- [x] (stretch) Ambient drone layer

## Phase 4: UI & Controls ✅ DONE
- [x] Custom HTML/CSS controls panel (slides from left)
- [x] Stats bar (always visible, bottom)
- [x] Event log panel (slides from right)
- [x] Help/about overlay
- [x] Keyboard shortcuts
- [x] Dark/light mode
- [x] URL query params

## Phase 5: Integration & Polish ✅ DONE
- [x] Wire everything together in main.ts
- [x] First-load experience
- [x] Auto-zoom on catastrophic events
- [x] Minimap when zoomed in
- [x] Performance tuning
- [x] Layout presets (clustered, flow, ring) - Improved structured distribution
- [x] UI/UX Polish (glassmorphism, animations, label visibility, particle contrast, node count)

## Orchestration Infrastructure ✅ DONE
- [x] `scripts/agent-dispatch.sh` — worktree + Gemini launcher
- [x] `scripts/agent-monitor.sh` — progress reader
- [x] `scripts/agent-merge.sh` — validate + merge + cleanup + auto-update docs
- [x] `scripts/agent-cleanup.sh` — remove without merge
- [x] `scripts/agent-review.sh` — pre-merge visual quality screenshot
- [x] `scripts/quality-screenshot.py` — Playwright screenshot
- [x] `agents/base-context.md` — shared Gemini context (includes .agent-summary.md requirement)
- [x] `agents/quality-rubric.md` — visual quality scoring
- [x] `agents/skills/p5-visual-quality.md` — p5.js art techniques
- [x] `agents/skills/aesthetic-criteria.md` — anti-AI-slop criteria
- [x] Task prompts: particle-trails, node-glow, background-field
- [x] Pipeline test: particle-trails dispatched, completed, merged
- [x] Doc auto-update on merge (agent-summary.md → session-log.md + tasks.md)
- [x] Autonomous operation config (CLAUDE.md workflow routing, task pickup, checkpoints)
- [x] Full permissions + OS sandbox for Claude
- [x] Performance fix: disabled trail smoothing, reduced trail length

## Visual Upgrades (via Gemini agents) ✅ DONE
- [x] Enhanced particle trails (alpha gradient, taper, curves)
- [x] Node glow & atmosphere (radial halos, breathing)
- [x] Background atmosphere (noise field, vignette, dust)

## Phase 6: E2E & Deploy ✅ DONE
- [x] Minimal Playwright tests (page loads, no errors, buttons work)
- [x] Deploy to Netlify (ready for auto-deploy)
- [x] Test on different screens (verified responsive layout)

## Phase 7: Voice Note Feedback Implementation ✅ DONE
- [x] **Nodes Visuals**: Remove lines between nodes. Nodes should be just big icons, very visible, without the enclosing circle.
- [x] **Simulation Speed**: Slow down the particles traveling between nodes. The current effect is too frantic.
- [x] **Scale and Layout**: Make the entire map much bigger and increase the total number of nodes to give the impression of a complex system too large for a human to easily understand.
- [x] **Node Events**: Lower the probability of any particular node failing/going off. This reduces visual clutter and chaotic popping, compensating for the higher number of nodes.
- [x] **Camera Behavior**: Add a UI toggle to enable/disable the dramatic auto-zoom on catastrophic events, as it can be jarring.
- [x] **Particle Routing**: Make particle paths curved/randomized ("scenic route") instead of straight lines, and vary speeds to show non-linear agent behavior.
- [x] **Typography & Design**: Improve the overall design, typography, and fonts used. Reduce overall text clutter.
- [x] **Node Hover**: Remove static text under nodes. Display node labels/descriptions (e.g., "restart service") only on hover, relying on clear icons by default.
- [ ] **Theming (Stretch/Future)**: Consider themed options (e.g., cars driving on a map, ships between ports) instead of just particles.

## Phase 8: Civic Scenario Integration (Mega-Scenarios) ✅ DONE
- [x] **Connector Library**: Populate `config.ts` with 40+ Civic connectors (CRM, Dev, Finance, etc.) and metadata.
- [x] **Mega-Scenario Definitions**: Define topology and node lists for RevOps, DevOps, and HR scenarios.
- [x] **Personalized Failures**: Implement `NODE_FAILURES` mapping for 40+ nodes across 4 tiers.
- [x] **Scenario Logic**: Update `buildGraph` and simulation `tick` to support scenario-based filtering and custom connections.
- [x] **Non-Repetition Engine**: Implement `usedMessages` persistence to ensure unique errors per session.
- [x] **UI Integration**: Add Scenario Selector and Complexity Slider to the controls panel.

## Phase 9: OpenProcessing Quality Upgrades ✅ DONE
- [x] **Persistent Trails Buffer**: Ghostly, world-space persistent trails with SCREEN blending.
- [x] **Cinematic Easing**: Responsive camera LERP with snap-to-focus on catastrophic events.
- [x] **Advanced FX**: Secondary ripples and noise-based debris for shockwaves.
- [x] **Visual Review**: Comprehensive audit against aesthetic and p5.js quality criteria.
