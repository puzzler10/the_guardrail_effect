# AGENTS.md

This file provides project-specific context to any AI coding agent working in this repository.

Read these as needed (not all at session start):

## Key docs

- `docs/project.md` — architecture, tech stack, design decisions
- `docs/tasks.md` — current roadmap and task status (check before starting work)
- `docs/session-log.md` — session history and handoff notes (check before starting work)

Update `docs/tasks.md` and append to `docs/session-log.md` when finished (create if not there).



## Rules

- Proceed autonomously — don't ask permission on implementation decisions
- **Non-interactive only:** NEVER run interactive commands (like `npx playwright test` without `CI=true`) that might hang the terminal or wait for user input. Always use headless/CI flags.
- NEVER use destructive git commands (e.g., `git reset --hard`, `git clean -fd`) without explicit user permission. Use `git stash` or manual resolution instead.
- API keys in `.env` only — never hardcode
- After phase/feature work: update status in memory.md, tasks in `docs/tasks.md`, directory tree in `docs/project.md` if files changed
- Plans: Always always write all implementation plans to `plans/` directory in the project root
- Run `npm run check` after every change and fix all errors before finishing
- The project uses a fast/slow test workflow. Backend: 'pytest -n auto -m "not slow"'. Frontend: 'npm run test:fast'. All external APIs are mocked in fast mode via conftest.py.
- When working on filter/sync bugs always write a fix plan with test cases BEFORE implementing. Never apply a partial fix - ensure all filter update paths (clear, change value, LLM-parsed values) are covered in one pass.

