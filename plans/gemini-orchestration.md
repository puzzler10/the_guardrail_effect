# Autonomous Orchestration Plan

**Role:** Gemini CLI as Head Orchestrator
**Goal:** Complete all remaining project tasks autonomously by dispatching sub-agents (Gemini) in parallel via git worktrees, monitoring their progress, and merging them back into `main` without requiring any user intervention.

## Task Inventory & Mapping
Based on `docs/tasks.md` and the available prompts in `agents/tasks/`:

### Group A: Visual Polish (Parallelizable)
- **Node Glow:** `agents/tasks/node-glow.md` -> Branch: `feat/node-glow`
- **Background Field:** `agents/tasks/background-field.md` -> Branch: `feat/background-field`

### Group B: Voice Note Feedback (Phase 7 - Parallelizable)
- **Node Overhaul:** `agents/tasks/node-overhaul.md` -> Branch: `feat/node-overhaul`
- **Curved Particles:** `agents/tasks/curved-particles.md` -> Branch: `feat/curved-particles`
- **Typography & Design:** `agents/tasks/typography.md` -> Branch: `feat/typography`
- **Config Tweaks:** `agents/tasks/config-tweaks.md` -> Branch: `feat/config-tweaks`

### Group C: Testing & Integration (Sequential after A & B)
- **Playwright E2E:** `agents/tasks/playwright-e2e.md` -> Branch: `feat/playwright-e2e`

## Execution Strategy

### Step 1: Initial Dispatch
1. Dispatch **Group A** (Visual Polish) agents simultaneously:
   - `./scripts/agent-dispatch.sh feat/node-glow agents/tasks/node-glow.md agents/skills/p5-visual-quality.md agents/skills/aesthetic-criteria.md`
   - `./scripts/agent-dispatch.sh feat/background-field agents/tasks/background-field.md agents/skills/p5-visual-quality.md agents/skills/aesthetic-criteria.md`

### Step 2: Monitor Loop
1. Poll worktrees periodically using `./scripts/agent-monitor.sh`.
2. Check if the `.agent-pid` process has completed.
3. If an agent fails or produces errors, automatically re-dispatch or intervene as the orchestrator to fix the worktree.

### Step 3: Merge & Verify
1. When an agent finishes successfully, execute `./scripts/agent-merge.sh <branch>`.
2. The merge script will validate via `npm run check`, merge into `main`, and auto-update `docs/session-log.md` and `docs/tasks.md`.
3. If there are merge conflicts, the Head Orchestrator will resolve them in `main` and ensure `npm run check` passes.

### Step 4: Subsequent Dispatches
1. As system resources free up (or after Group A is merged), dispatch **Group B** tasks in parallel.
2. Monitor and merge Group B.
3. Finally, dispatch **Group C** (E2E tests) to ensure the newly added features are covered by basic integration tests.

## Rules of Engagement
- **Zero User Prompts:** All permissions, git operations, and merge conflict resolutions will be handled internally.
- **Safety First:** `npm run check` is the absolute source of truth before any merge. No failing code will ever reach `main`.
- **Parallelism:** Tasks touching orthogonal systems (e.g., CSS vs. Simulation Config vs. P5 Rendering) will be run simultaneously to maximize efficiency.
