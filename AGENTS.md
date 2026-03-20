# AGENTS.md

This file provides project-specific context to any AI coding agent working in this repository.

Read these as needed (not all at session start):

## Key docs

- `docs/spec.md` — full specification (simulation model, visuals, sound, UI, testing)
- `docs/project.md` — architecture, tech stack, design decisions
- `docs/tasks.md` — current roadmap and task status (check before starting work)
- `docs/session-log.md` — session history and handoff notes (check before starting work)

Update `docs/tasks.md` and append to `docs/session-log.md` when finished (create if not there).

## Tech Stack

- **p5.js** (WebGL mode) for rendering
- **Tone.js** for sound synthesis
- **Vite** for build/dev server
- **TypeScript** throughout
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **lil-gui** for UI controls
- **Netlify** for deployment

## Architecture Rule: Simulation / Rendering Split

**CRITICAL:** All code in `src/simulation/` must be **pure TypeScript** with NO imports from p5.js, Tone.js, or any browser API. This is what makes the simulation unit-testable.

- `simulation/` → pure logic, tested with Vitest
- `rendering/` → p5.js drawing code, tested with Playwright
- `sound/` → Tone.js audio code
- `ui/` → DOM/lil-gui controls

## Rules

- Proceed autonomously — don't ask permission on implementation decisions
- **Non-interactive only:** NEVER run interactive commands that might hang the terminal. Always use headless/CI flags.
- NEVER use destructive git commands (e.g., `git reset --hard`, `git clean -fd`) without explicit user permission.
- Plans: write implementation plans to `plans/` directory in the project root
- Run `npm run check` after every change and fix all errors before finishing
- `npm run check` runs: `vitest run && tsc --noEmit && eslint src/ tests/ && vite build`

## Parallel Development (Worktrees)

This project is designed for parallel agent development via git worktrees.

### Module boundaries

Each module has clean interfaces defined in `types.ts`. Modules communicate through:
- `types.ts` — shared interfaces (created first, don't modify without coordination)
- `config.ts` — shared constants and tuneable parameters

### Branch naming

- `feat/types-config` — shared types + config (merge first)
- `feat/simulation-core` — simulation/* module
- `feat/rendering` — rendering/* module
- `feat/sound` — sound/* module
- `feat/ui` — ui/* + HTML
- `feat/e2e-tests` — Playwright tests

### Merge order

1. `feat/types-config` (foundation — all others depend on this)
2. `feat/simulation-core` (pure logic, no deps beyond types)
3. `feat/rendering` + `feat/sound` (parallel, both depend on simulation interfaces)
4. `feat/ui` (depends on rendering)
5. `feat/e2e-tests` (depends on everything)
6. `main.ts` integration (final wiring)

### When working in a worktree

- Only modify files within your module boundary
- Import from `types.ts` and `config.ts` freely
- If you need a new type/interface, add it to `types.ts` with a comment noting which module needs it
- Write tests alongside your code
- Run `npm run check` before committing
