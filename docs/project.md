# Project: Particle Swarm City

## Overview

Interactive p5.js visualization showing AI agents as particles flowing through a network of tool-nodes. Demonstrates the need for agent guardrails by visualizing cascading failures — and how guardrails prevent them.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Rendering | p5.js (WebGL mode) |
| Sound | Tone.js |
| Build | Vite |
| Language | TypeScript |
| Testing | Vitest |
| UI Controls | lil-gui |
| Deploy | Vercel / GitHub Pages |

## Architecture

Simulation logic is fully decoupled from rendering. All simulation code is pure TypeScript with no p5.js dependency, making it unit-testable.

```
src/
├── main.ts                    # Entry point, p5.js sketch
├── simulation/                # Pure logic, no rendering deps
│   ├── graph.ts               # Workflow graph: nodes, edges, layout
│   ├── particle.ts            # Particle agent: state, movement
│   ├── failure.ts             # Failure probabilities, events
│   ├── guardrails.ts          # Force fields, deflection
│   └── simulation.ts          # Orchestrator: spawning, stats
├── rendering/                 # p5.js rendering
│   ├── renderer.ts            # Main render loop, camera
│   ├── node-renderer.ts       # Node visuals
│   ├── particle-renderer.ts   # Particle + trail visuals
│   ├── effects.ts             # Shockwaves, explosions, shake
│   └── text-overlay.ts        # Floating failure text
├── sound/                     # Tone.js audio
│   ├── sound-engine.ts        # Ambient layer, setup
│   └── events.ts              # Event-triggered sounds
├── ui/                        # Controls and stats
│   ├── controls.ts            # lil-gui setup
│   ├── stats.ts               # Stats bar
│   └── help.ts                # Help overlay
├── config.ts                  # All tuneable constants
└── types.ts                   # Shared types
```

## Design Decisions

1. **Simulation/rendering split** — enables TDD, deterministic testing
2. **Fixed timestep** — 60Hz simulation, rendering interpolates
3. **Spatial hash** — O(1) neighbor lookups for shockwave propagation
4. **Object pooling** — pre-allocated particles, no GC pauses
5. **WebGL** — GPU-accelerated for 500+ particles at 60fps

## Key Specs

- See `docs/spec.md` for full specification
- Target: 60fps with 500 particles on M1 MacBook
- 30-40 graph nodes across 5 risk categories
- 4-tier failure system with escalating visual/audio severity
- Guardrail toggle with force field visualization

## Known Limitations

- No mobile optimization (laptop target only)
- Sound starts muted (browser autoplay policy)
- Failure rates are illustrative, not benchmarked
