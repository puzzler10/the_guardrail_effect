read @AGENTS.md

## Autonomous Operation Mode

This project runs autonomously. Claude is the orchestrator, Gemini agents handle parallelizable implementation.

### Session startup

1. Read `docs/tasks.md` and `docs/session-log.md`
2. Pick the next pending task(s) from `docs/tasks.md` and begin work
3. If no pending tasks exist, inform the user

### Task execution

- Work through tasks in order from `docs/tasks.md`
- Delegate visual/rendering/sound tasks to Gemini (see delegation rules below)
- Implement simulation/logic/infrastructure tasks directly
- After each task: run `npm run check`, mark task done in `docs/tasks.md`, commit
- Continue to the next task automatically

### Checkpoints (IMPORTANT)

**Stop and wait for user input after:**
- Completing a batch of 3-5 tasks (whichever boundary makes sense)
- Any task that changes user-facing behavior significantly
- Completing all tasks in a phase

At checkpoints:
1. Summarize what was done
2. Show the remaining task list
3. Ask: "Want to review, add feedback, or continue?"

This is how the user steers the project — they work at the task level, not implementation level.

### Quality evaluation

Run quality evaluation in batches, not per-task:
- After completing a batch of visual tasks, take a screenshot and evaluate against `agents/quality-rubric.md`
- Use evaluation results to create new improvement tasks
- The user will also periodically review and add their own feedback as new tasks

## Orchestration Workflow

### When to delegate to Gemini

Dispatch via `./scripts/agent-dispatch.sh` for:
- Visual/rendering changes (`src/rendering/`)
- CSS/styling changes (`src/ui/styles.css`)
- Sound design changes (`src/sound/`)
- Any task with a prepared prompt in `agents/tasks/`

Implement directly (as Claude) for:
- Simulation logic (`src/simulation/`)
- Type/config changes (`src/types.ts`, `src/config.ts`)
- Infrastructure/scripts changes
- Bug fixes requiring cross-module understanding
- Doc updates

### Merge flow

1. `./scripts/agent-monitor.sh` — check progress
2. `./scripts/agent-merge.sh <branch>` — validates, merges, auto-updates docs
3. Docs are automatically appended from `.agent-summary.md`

### Sandboxing

- Gemini agents run in isolated git worktrees — they cannot affect `main` until explicitly merged
- Gemini runs with `--approval-mode yolo` within its worktree (safe because worktree is disposable)
- Agent boundary: agents must only modify files within their assigned module (enforced by task prompt, validated at merge)
