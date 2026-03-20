# Project: Particle Swarm City (Agent Swarm)

## Overview

Interactive p5.js visualization showing AI agents as particles flowing through a network of tool-nodes. Demonstrates the need for agent guardrails by visualizing cascading failures — and how guardrails prevent them.

Non-technical audience. Shareable URL. 2-minute interactive exploration.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Rendering | p5.js (WebGL mode) |
| Sound | Tone.js |
| Build | Vite |
| Language | TypeScript |
| Unit Testing | Vitest |
| E2E Testing | Playwright |
| UI Controls | Custom HTML/CSS (Vanilla TS) |
| Deploy | Netlify |

## Architecture

Simulation logic is fully decoupled from rendering — pure TypeScript, no p5.js dependency, fully unit-testable.

```
src/
├── main.ts                    # Entry point, p5.js sketch
├── simulation/                # Pure logic, no rendering deps
│   ├── graph.ts               # Workflow graph: nodes, edges, loops, layout
│   ├── particle.ts            # Particle agent: state machine, movement
│   ├── failure.ts             # Failure probabilities, events, tiers
│   ├── guardrails.ts          # Force fields, deflection, blocking
│   └── simulation.ts          # Orchestrator: spawning, stats, pause/reset
├── rendering/                 # p5.js rendering
│   ├── renderer.ts            # Main render loop, camera (zoom/pan)
│   ├── node-renderer.ts       # Node visuals, icons, pulses
│   ├── particle-renderer.ts   # Particle + trail visuals
│   ├── effects.ts             # Shockwaves, explosions, shake
│   ├── text-overlay.ts        # Floating failure text
│   └── minimap.ts             # Bottom-right navigation overview
├── sound/                     # Tone.js audio
│   ├── sound-engine.ts        # Ambient drone, master controls
│   └── events.ts              # Event-triggered sounds
├── ui/                        # UI chrome
│   ├── styles.css             # Modern glassmorphism UI styling
│   ├── controls.ts            # Custom control panel (Model, Rate, Speed, etc.)
│   ├── stats.ts               # Stats bar (Active, Completed, Failures, ☠)
│   ├── event-log.ts           # Severity-filtered event history
│   ├── help.ts                # Help/about overlay with color guide
│   ├── onboarding.ts          # First-load welcome experience
│   ├── keyboard.ts            # Keyboard shortcut handler (Space, G, D, etc.)
│   └── sound-overlay.ts       # Sound enablement modal
├── config.ts                  # All tuneable constants
└── types.ts                   # Shared TypeScript types
tests/
├── unit/                      # Vitest — pure simulation logic
├── integration/               # Vitest — Monte Carlo distribution tests
└── e2e/                       # Playwright — browser automation tests
```

## Design Decisions

1. **Simulation/rendering split** — enables TDD, deterministic testing
2. **Custom UI suite** — replaced lil-gui with custom HTML/CSS for better non-technical audience appeal and branding
3. **Fixed timestep** — 60Hz simulation, rendering interpolates
4. **Spatial hash** — O(1) neighbor lookups for shockwaves
5. **Object pooling** — pre-allocated particles, no GC pauses
6. **Graph with cycles** — supports agent retry/polling loops
7. **Deterministic layouts** — consistent node positioning using ID-based seeding for clustered, flow, and ring presets
8. **Spatial signatures** — layout presets provide distinct arrangements (Clustered: neighborhoods, Flow: left-to-right workflow, Ring: concentric rings by risk level)
9. **Tool-node variety** — 35 nodes spanning all 5 risk levels (safe to critical) representing real AI agent capabilities
10. **WebGL** — GPU-accelerated for 500+ particles at 60fps
11. **Guardrails are perfect** — tier 4 = 0%, tier 3 ≈ 0% when on. Clear message.
12. **Simulation Reliability** — verified by Monte Carlo integration tests in `tests/integration/` ensuring correct failure distributions across model presets and multipliers.
13. **Active-Only Spawning** — simulation spawning logic correctly tracks active vs. inactive particles to ensure consistent density regardless of particle lifespan.

## Parallel Development

Modules have clean interfaces. Can be developed in separate git worktrees:

| Branch | Module | Can merge after |
|--------|--------|----------------|
| `feat/types-config` | `types.ts`, `config.ts` | — (merge first) |
| `feat/simulation-core` | `simulation/*` | types-config |
| `feat/rendering` | `rendering/*` | types-config |
| `feat/sound` | `sound/*` | types-config |
| `feat/ui` | `ui/*`, `index.html` | types-config |
| `feat/e2e-tests` | `tests/e2e/*` | all above |

## Key Specs

- See `docs/spec.md` for full specification
- 30-40 graph nodes, 5 risk categories, all with nonzero failure rates
- 4-tier failure system with escalating visual/audio severity
- 5 model presets (Frontier → Small/Local)
- Guardrail toggle: perfect blocking of catastrophic events
- Dark/light mode, event log, help overlay
- Sound design with Tone.js (muted by default)
- Deploy to Netlify with shareable URL
