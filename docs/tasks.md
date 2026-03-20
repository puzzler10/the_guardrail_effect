# Tasks

## Phase 0: Project Setup
- [x] Write spec (docs/spec.md)
- [x] Write project docs (docs/project.md)
- [x] Init git repo
- [ ] Initialize Vite + TypeScript project (`npm create vite`)
- [ ] Install deps: p5.js, tone, lil-gui
- [ ] Install dev deps: vitest, playwright, eslint, @types/*
- [ ] Configure `npm run check` script (vitest + tsc + eslint + vite build)
- [ ] Configure Playwright for headless E2E
- [ ] Create `types.ts` and `config.ts` (shared foundation)
- [ ] Verify blank p5.js WebGL canvas renders
- [ ] Set up netlify.toml

## Phase 1: Simulation Core (TDD — pure TypeScript, no rendering)
- [ ] `graph.ts` — nodes (30-40), edges, loops, risk categories, force-directed layout
- [ ] `graph.test.ts` — reachability, cycles, layout non-overlap, edge weight normalization
- [ ] `particle.ts` — state machine (spawn → active → complete/fail/explode), movement, trail buffer, recycling
- [ ] `particle.test.ts` — state transitions, interpolation, trail buffer, max step limit
- [ ] `failure.ts` — probability engine, 4 tiers, 5 model presets, multiplier, event catalog
- [ ] `failure.test.ts` — rates match config, multiplier scaling, tier distribution, text selection
- [ ] `guardrails.ts` — force fields, deflection, perfect tier 4 blocking, 95% tier 3 reduction
- [ ] `guardrails.test.ts` — deflection rates, routing, tier 1-2 unaffected
- [ ] `simulation.ts` — orchestrator: spawn rate, update loop, stats aggregation, pause/reset
- [ ] `simulation.test.ts` — spawn rate, active count, stats, pause/reset
- [ ] Integration: `failure-distribution.test.ts` — 10k particles, verify rates ±5%
- [ ] Integration: `guardrail-effectiveness.test.ts` — 10k particles, tier 4 = 0 with guardrails
- [ ] Integration: `simulation-flow.test.ts` — no stuck particles, all complete or fail

## Phase 2: Rendering (p5.js WebGL)
- [ ] `renderer.ts` — main render loop, camera (zoom/pan), WebGL setup
- [ ] `node-renderer.ts` — node circles, pulses, halos, icons, risk-colored
- [ ] `particle-renderer.ts` — particles with trails, glow, color per state
- [ ] `effects.ts` — shockwaves (expanding ring), explosions (sub-particles), screen shake
- [ ] `text-overlay.ts` — floating text: spawn at position, drift up, fade, tier-colored, tier 4 larger/longer

## Phase 3: Sound
- [ ] `sound-engine.ts` — Tone.js ambient drone, dissonance scaling with failure rate
- [ ] `events.ts` — event sounds: pluck (spawn), chime (complete), click (t1), buzz (t2), bass+alarm (t3), boom+siren (t4), shield ping (guardrail)
- [ ] "Enable Sound" overlay button

## Phase 4: UI & Controls
- [ ] `controls.ts` — lil-gui: model preset, failure rate, speed, particle count, guardrails, dark/light, volume
- [ ] `stats.ts` — live stats bar: active, completed, self-corrected, failures, catastrophic (☠), uptime
- [ ] `event-log.ts` — scrollable event feed (slides from right), filterable by severity
- [ ] `help.ts` — help/about overlay: what is this, node legend, color legend, keyboard shortcuts, credits
- [ ] Keyboard shortcuts: Space (pause), G (guardrails), R (reset), M (mute), ? (help), L (log), D (dark/light)
- [ ] Dark/light mode toggle with separate color palettes
- [ ] URL query params for shareable presets

## Phase 5: Integration & Polish
- [ ] `main.ts` — wire simulation + rendering + sound + UI together
- [ ] First-load experience: loading indicator → particles flowing → "Enable Sound" overlay
- [ ] Auto-zoom on catastrophic events
- [ ] Minimap when zoomed in
- [ ] Performance tuning: 60fps at 500 particles
- [ ] Visual polish: bloom, trail fade, guardrail ambient glow

## Phase 6: E2E Tests & Deploy
- [ ] `canvas-renders.spec.ts` — page loads, canvas exists, not blank
- [ ] `controls-work.spec.ts` — panel opens, sliders work, guardrails toggle
- [ ] `zoom-pan.spec.ts` — zoom/pan work, minimap appears
- [ ] `guardrails-toggle.spec.ts` — catastrophic count stops with guardrails on
- [ ] `sound-toggle.spec.ts` — sound button works, no crashes
- [ ] Deploy to Netlify
- [ ] Test on different laptop screen sizes

## Future / Nice-to-have
- [ ] Tree visualization mode
- [ ] Layout toggle (different force-directed algorithms)
- [ ] Mobile touch support
- [ ] Portfolio mode (custom domain, polished branding)
