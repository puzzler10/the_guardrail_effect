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
