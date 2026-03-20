# Tasks

## Phase 1: Project Setup
- [x] Write spec (docs/spec.md)
- [x] Write project docs
- [ ] Initialize Vite + TypeScript + Vitest project
- [ ] Set up linting (ESLint) and formatting (Prettier)
- [ ] Configure `npm run check` script
- [ ] Set up CI-friendly test runner
- [ ] Verify blank p5.js WebGL canvas renders

## Phase 2: Simulation Core (TDD)
- [ ] `types.ts` — shared type definitions
- [ ] `config.ts` — all tuneable constants with defaults
- [ ] `graph.ts` — workflow graph with nodes, edges, risk levels, force-directed layout
- [ ] `particle.ts` — particle state machine, movement, trail buffer
- [ ] `failure.ts` — failure probability engine, event catalog, tier selection
- [ ] `guardrails.ts` — force field logic, deflection, interception
- [ ] `simulation.ts` — orchestrator: spawn, update, stats, pause/reset

## Phase 3: Rendering
- [ ] `renderer.ts` — main render loop, camera (zoom/pan), WebGL setup
- [ ] `node-renderer.ts` — node circles, pulses, halos, risk-colored
- [ ] `particle-renderer.ts` — particles with trails, glow, color states
- [ ] `effects.ts` — shockwaves, explosions, screen shake
- [ ] `text-overlay.ts` — floating failure text, fade, drift

## Phase 4: Sound
- [ ] `sound-engine.ts` — Tone.js ambient drone, dissonance scaling
- [ ] `events.ts` — event-triggered sounds by severity tier

## Phase 5: UI & Controls
- [ ] `controls.ts` — lil-gui panel: model preset, failure rate, speed, particle count, guardrails toggle
- [ ] `stats.ts` — live stats bar (active, completed, failed, catastrophic)
- [ ] `help.ts` — help overlay with keyboard shortcuts
- [ ] Keyboard shortcuts (Space, G, R, M)
- [ ] URL query param support for shareable presets

## Phase 6: Polish & Deploy
- [ ] Visual tuning — bloom, colors, trail fade
- [ ] Performance profiling — ensure 60fps at 500 particles
- [ ] Auto-zoom on catastrophic events
- [ ] Minimap when zoomed in
- [ ] Deploy to Vercel/GitHub Pages
- [ ] Test on different screen sizes

## Future / Nice-to-have
- [ ] Tree visualization mode (Phase 2 of project)
- [ ] Mobile touch support
- [ ] Recording/replay (save seeds)
