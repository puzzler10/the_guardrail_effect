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
