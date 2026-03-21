# Agent Context

You are working in a git worktree of **Particle Swarm City** — an interactive p5.js visualization demonstrating AI agent guardrails. Hundreds of glowing particles (agents) flow through a network of nodes representing AI tool actions, with failures and guardrails creating dramatic visual events.

## Architecture

```
src/
  simulation/  — Pure TypeScript logic. NO p5/browser imports. DO NOT MODIFY.
  rendering/   — p5.js 2D canvas drawing
    renderer.ts          — Main render loop, camera (pan/zoom)
    node-renderer.ts     — Node visuals, icons, pulses
    particle-renderer.ts — Particle trails, color states, glow
    effects.ts           — Shockwaves, explosions, screen shake
    text-overlay.ts      — Floating failure/guardrail text
    minimap.ts           — Corner navigation overview
  sound/       — Tone.js synthesis
    sound-engine.ts      — Ambient drone + master controls
    events.ts            — Severity-mapped event sounds
  ui/          — DOM/CSS controls
    styles.css           — Glassmorphism dark/light mode
    controls.ts          — Left panel (preset, sliders, toggles)
    stats.ts             — Bottom bar (counters, uptime)
    event-log.ts         — Right panel (severity-filtered history)
    help.ts              — Modal overlay
    keyboard.ts          — Shortcut handler
    onboarding.ts        — First-load welcome
    sound-overlay.ts     — "Enable Sound" modal
  types.ts     — All shared TypeScript interfaces
  config.ts    — Model presets, constants, tuneable parameters
  main.ts      — Entry point, wires everything together
```

## Key Systems

- **45 nodes** with 5 risk levels (safe/low/medium/high/critical)
- **200-500 active particles** at any time, each traversing 8-20 nodes
- **4 failure tiers**: self-correcting → minor → severe → catastrophic
- **Guardrails**: force fields that block tier 3-4 failures when enabled
- **Camera**: pan (drag), zoom (scroll), auto-zoom on catastrophe
- **Dark/light mode**, custom CSS UI panels, glassmorphism styling

## Critical Rules

1. **NEVER modify `src/simulation/`** — it is stable, tested, and pure TypeScript
2. Run `npm run check` before your final commit: `vitest run && tsc --noEmit && eslint src/ tests/ && vite build`
3. Commit with descriptive messages using conventional format: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
4. Read `AGENTS.md` in the repo root for full project conventions
5. Keep the simulation/rendering split — rendering code imports FROM simulation types but simulation NEVER imports rendering

## Tech Stack

- **p5.js** (2D Canvas mode) for rendering
- **Tone.js** for sound synthesis
- **Vite** for build/dev server
- **TypeScript** (strict mode) throughout
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests (configured, tests not yet written)

## Progress Reporting

**UPDATE `.agent-progress.md` FREQUENTLY** as you work. This is how the orchestrator tracks your progress.

Format:
```
## Status: working | blocked | done

## Completed
- item 1
- item 2

## Current
What you're doing right now.

## Issues
Any blockers or questions.

## Files Modified
- path/to/file.ts — what changed
```

## Before Finishing

1. Run `npm run check` — fix ALL errors until it passes
2. Set Status to `done` in `.agent-progress.md`
3. Write `.agent-summary.md` in the worktree root with this exact format:

```markdown
## What was done
- <bullet point summary of changes>

## Key decisions
- <any non-obvious choices made>

## Files modified
- path/to/file.ts — what changed

## Tasks completed
- <task name from docs/tasks.md that this work completes, if any>
```

4. `git add` all changed files (including `.agent-summary.md`)
5. Commit with a descriptive message: `feat: <what you accomplished>`
