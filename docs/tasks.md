# Tasks

## Phase 0: Project Setup ← START HERE
- [x] Write spec (docs/spec.md)
- [x] Write project docs (docs/project.md)
- [x] Init git repo
- [ ] Initialize Vite + TypeScript project (`npm create vite@latest . -- --template vanilla-ts`)
- [ ] Install deps: `npm install p5 tone`
- [ ] Install dev deps: `npm install -D vitest playwright @playwright/test eslint @types/p5 typescript`
- [ ] Configure `npm run check` script in package.json: `vitest run && tsc --noEmit && vite build`
- [ ] Configure vitest in vite.config.ts
- [ ] Create `src/types.ts` — all shared interfaces (see spec section 6.1, 11.3)
- [ ] Create `src/config.ts` — all tuneable constants, model presets, color palettes (see spec sections 2.4, 3.2, 3.3)
- [ ] Create basic `index.html` with full-screen canvas container
- [ ] Create `src/main.ts` — minimal p5.js 2D canvas sketch that renders a colored background
- [ ] Verify `npm run dev` shows the canvas, `npm run check` passes
- [ ] Create `netlify.toml`
- [ ] Commit: "chore: project setup with Vite, p5.js, TypeScript, Vitest"

## Phase 1: Simulation Core (TDD — pure TypeScript, no rendering)
- [ ] `src/simulation/graph.ts` + `tests/unit/graph.test.ts`
- [ ] `src/simulation/particle.ts` + `tests/unit/particle.test.ts`
- [ ] `src/simulation/failure.ts` + `tests/unit/failure.test.ts`
- [ ] `src/simulation/guardrails.ts` + `tests/unit/guardrails.test.ts`
- [ ] `src/simulation/simulation.ts` + `tests/unit/simulation.test.ts`
- [ ] `tests/integration/failure-distribution.test.ts`
- [ ] `tests/integration/guardrail-effectiveness.test.ts`
- [ ] `tests/integration/simulation-flow.test.ts`

## Phase 2: Rendering (p5.js 2D canvas)
- [ ] `src/rendering/renderer.ts` — main loop, camera (zoom/pan)
- [ ] `src/rendering/node-renderer.ts` — node circles, pulses, icons
- [ ] `src/rendering/particle-renderer.ts` — particles + trails + glow (shadowBlur)
- [ ] `src/rendering/effects.ts` — shockwaves, explosions, screen shake
- [ ] `src/rendering/text-overlay.ts` — floating failure text

## Phase 3: Sound (reduced scope)
- [ ] `src/sound/sound-engine.ts` — Tone.js setup, master controls
- [ ] `src/sound/events.ts` — event sounds by severity (7 sounds)
- [ ] "Enable Sound" overlay button
- [ ] (stretch) Ambient drone layer

## Phase 4: UI & Controls
- [ ] Custom HTML/CSS controls panel (slides from left)
- [ ] Stats bar (always visible, bottom)
- [ ] Event log panel (slides from right)
- [ ] Help/about overlay
- [ ] Keyboard shortcuts
- [ ] Dark/light mode
- [ ] URL query params

## Phase 5: Integration & Polish
- [ ] Wire everything together in main.ts
- [ ] First-load experience
- [ ] Auto-zoom on catastrophic events
- [ ] Minimap when zoomed in
- [ ] Performance tuning
- [ ] Layout presets (clustered, flow, ring)

## Phase 6: E2E & Deploy
- [ ] Minimal Playwright tests (page loads, no errors, buttons work)
- [ ] Deploy to Netlify
- [ ] Test on different screens
