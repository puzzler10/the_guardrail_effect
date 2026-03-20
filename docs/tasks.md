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

## Phase 1: Simulation Core (TDD — pure TypeScript, no rendering)
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
- [ ] URL query params

## Phase 5: Integration & Polish ✅ DONE
- [x] Wire everything together in main.ts
- [x] First-load experience
- [x] Auto-zoom on catastrophic events
- [x] Minimap when zoomed in
- [x] Performance tuning
- [x] Layout presets (clustered, flow, ring)

## Phase 6: E2E & Deploy
- [ ] Minimal Playwright tests (page loads, no errors, buttons work)
- [ ] Deploy to Netlify
- [ ] Test on different screens
