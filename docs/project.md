# Project: Particle Swarm City (Agent Swarm)

## Overview

Interactive p5.js visualization showing AI agents as particles flowing through a network of tool-nodes. Demonstrates the need for agent guardrails by visualizing cascading failures — and how guardrails prevent them.

Non-technical audience. Shareable URL. 2-minute interactive exploration.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Rendering | p5.js (2D mode with optimized batched drawing) |
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
│   ├── graph.ts               # Workflow graph: global nexus & scenario routing
│   ├── particle.ts            # Particle agent: state machine, movement, curved paths
│   ├── failure.ts             # Failure probabilities, node-specific messages
│   ├── guardrails.ts          # Force fields, deflection, blocking
│   ├── simulation.ts          # Orchestrator: spawning, stats, non-repetition engine
│   └── scenarios.ts           # Mega-Scenario definitions (RevOps, DevOps, HR)
├── rendering/                 # p5.js rendering
│   ├── renderer.ts            # Main render loop, camera (zoom/pan), atmosphere
│   ├── node-renderer.ts       # Node visuals, icons, breathing halos
│   ├── particle-renderer.ts   # Particle + tapered trail visuals
│   ├── effects.ts             # Shockwaves, explosions, shake
│   ├── text-overlay.ts        # Floating failure text
│   └── minimap.ts             # Bottom-right navigation overview
├── sound/                     # Tone.js audio
│   ├── sound-engine.ts        # Ambient drone, master controls
│   └── events.ts              # Event-triggered sounds
├── ui/                        # UI chrome
│   ├── styles.css             # Modern glassmorphism UI styling
│   ├── controls.ts            # Custom control panel (Model, Scenario, Rate, etc.)
│   ├── stats.ts               # Stats bar (Active, Completed, Failures, ☠)
│   ├── event-log.ts           # Severity-filtered event history
│   ├── help.ts                # Help/about overlay with color guide
│   ├── onboarding.ts          # First-load welcome experience
│   ├── keyboard.ts            # Keyboard shortcut handler (Space, G, D, etc.)
│   └── sound-overlay.ts       # Sound enablement modal
├── config.ts                  # All tuneable constants & Connector Library
└── types.ts                   # Shared TypeScript types
tests/
├── unit/                      # Vitest — pure simulation logic
├── integration/               # Vitest — Monte Carlo distribution tests
└── e2e/                       # Playwright — browser automation tests
```

## Design Decisions

1. **Simulation/rendering split** — enables TDD, deterministic testing.
2. **Branded Connector Library** — 65+ connectors (Salesforce, Stripe, AWS, etc.) representing real-world Civic ecosystem.
3. **Mega-Scenario Topologies** — Handcrafted branching workflows for RevOps, DevOps, and HR onboarding.
4. **Scenic Route Routing** — Particles follow deterministic, curved paths based on ID to simulate "deliberate" agent behavior.
5. **Non-Repetition Engine** — Session-level failure message tracking ensures high-variety error reporting without immediate repetition.
6. **Contextual Node Visuals** — Labels only appear on hover; nodes feature "breathing" halos and larger icons for a cleaner, high-scale feel.
7. **Custom UI suite** — replaced lil-gui with custom HTML/CSS for better non-technical audience appeal and branding.
8. **Fixed timestep** — 60Hz simulation, rendering interpolates.
9. **Atmospheric FX & Persistent Trails** — Vignette, scanlines, camera shake, and a world-space SCREEN-blended trail buffer enhance the "high-tech" simulation aesthetic.
10. **Cinematic Camera Easing** — Responsive camera LERP with snap-to-focus on catastrophic events.
11. **Performance Optimization** — Batched trail drawing and O(1) node lookups enable 1000+ particles at 60fps on 2D canvas.
12. **Guardrails are perfect** — tier 4 = 0%, tier 3 ≈ 0% when on. Clear message.
13. **Simulation Reliability** — verified by Monte Carlo integration tests in `tests/integration/` ensuring correct failure distributions across model presets.

## Key Specs

- 65+ graph nodes, 5 risk categories, all with nonzero failure rates.
- 4-tier failure system with escalating visual/audio severity.
- 5 model presets (Frontier → Small/Local).
- Scenario Selector: Switch between Global Nexus and targeted strategic workflows.
- Auto-Zoom Toggle: Enable/disable focus on catastrophic events.
- Sound design with Tone.js (muted by default).
- Deploy to Netlify with shareable URL.
