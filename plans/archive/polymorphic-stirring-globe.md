# Plan: Claude + Gemini Orchestration Workflow

## Context

Claude acts as head orchestrator, delegating coding tasks to Gemini CLI agents running in parallel git worktrees (2-3 at a time). Gemini has the higher token budget and does the heavy implementation. Claude handles planning, dispatching, monitoring, merging, and quality review.

The system is **general-purpose** — any task can be dispatched by writing a markdown prompt file. We start with visual polish tasks but the infrastructure supports E2E testing, deploy, and anything else.

Key insight from Anthropic's skills repo: the **algorithmic-art** and **frontend-design** skills contain battle-tested criteria for what makes visuals look great vs "AI slop". We adapt these into agent context and quality judging.

---

## What We're Building

### Directory Structure
```
scripts/
  agent-dispatch.sh     # Create worktree + launch Gemini agent
  agent-monitor.sh      # Read progress from all active agents
  agent-merge.sh        # Validate + merge completed branch
  agent-cleanup.sh      # Remove worktree without merging
  quality-screenshot.py  # Playwright script to capture app screenshots
agents/
  base-context.md       # Shared project context (every Gemini prompt)
  quality-rubric.md     # Visual quality judging criteria (for Claude review)
  skills/
    p5-visual-quality.md   # p5.js generative art techniques (from algorithmic-art skill)
    aesthetic-criteria.md  # Anti-AI-slop design criteria (from frontend-design skill)
  tasks/                # One file per task (any type of work)
```

---

## Implementation Steps

### Step 1: `scripts/agent-dispatch.sh`

Usage: `./scripts/agent-dispatch.sh <branch> <task-file> [skill-file...]`

```bash
#!/bin/bash
set -euo pipefail

BRANCH="$1"; shift
TASK_FILE="$1"; shift
SKILL_FILES=("$@")  # Optional skill files to append

REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_DIR="${REPO_ROOT}/../worktrees/${BRANCH##*/}"

# Create worktree from current main
git branch "$BRANCH" main 2>/dev/null || true
git worktree add "$WORKTREE_DIR" "$BRANCH"

# Install deps
cd "$WORKTREE_DIR"
npm install --silent

# Assemble prompt: base context + skills + task
PROMPT="$(cat "$REPO_ROOT/agents/base-context.md")"
for skill in "${SKILL_FILES[@]}"; do
  PROMPT="$PROMPT
---
$(cat "$REPO_ROOT/$skill")"
done
PROMPT="$PROMPT
---
$(cat "$REPO_ROOT/$TASK_FILE")"

# Launch Gemini headless
gemini -p "$PROMPT" --approval-mode yolo --output-format text \
  > "${WORKTREE_DIR}/.agent-output.log" 2>&1 &

echo $! > "${WORKTREE_DIR}/.agent-pid"
echo "Dispatched: PID $! | Branch: $BRANCH | Dir: $WORKTREE_DIR"
```

### Step 2: `scripts/agent-monitor.sh`

Reads all worktree progress files. Claude calls this to check status.

```bash
#!/bin/bash
WORKTREE_BASE="$(git rev-parse --show-toplevel)/../worktrees"
echo "=== Agent Status ==="
for dir in "$WORKTREE_BASE"/*/; do
  [ -d "$dir" ] || continue
  BRANCH=$(basename "$dir")
  echo "--- $BRANCH ---"
  # Check process
  PID=$(cat "$dir/.agent-pid" 2>/dev/null || echo "0")
  if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Status: RUNNING (PID $PID)"
  else
    echo "Status: FINISHED"
  fi
  # Show progress
  if [ -f "$dir/.agent-progress.md" ]; then
    cat "$dir/.agent-progress.md"
  else
    echo "(no progress file yet)"
  fi
  # Show what files changed
  cd "$dir" && git diff --stat main 2>/dev/null
  echo ""
done
```

### Step 3: `scripts/agent-merge.sh`

Non-interactive. Validates, merges, cleans up.

```bash
#!/bin/bash
set -euo pipefail
BRANCH="$1"
REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_DIR="${REPO_ROOT}/../worktrees/${BRANCH##*/}"

# Validate in worktree
cd "$WORKTREE_DIR"
echo "Running checks on $BRANCH..."
npm run check || { echo "FAIL: checks don't pass"; exit 1; }

# Merge into main
cd "$REPO_ROOT"
git merge --no-ff "$BRANCH" -m "merge: $BRANCH"
echo "Running post-merge checks..."
npm run check || { echo "WARN: post-merge checks failed"; exit 1; }

# Cleanup
git worktree remove "$WORKTREE_DIR" --force
git branch -d "$BRANCH" 2>/dev/null || true
echo "Done: merged and cleaned $BRANCH"
```

### Step 4: `scripts/agent-cleanup.sh`

Remove worktree without merging (failed/abandoned).

```bash
#!/bin/bash
set -euo pipefail
BRANCH="$1"
REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_DIR="${REPO_ROOT}/../worktrees/${BRANCH##*/}"
# Kill if still running
PID=$(cat "$WORKTREE_DIR/.agent-pid" 2>/dev/null || echo "0")
[ "$PID" != "0" ] && kill "$PID" 2>/dev/null || true
git worktree remove "$WORKTREE_DIR" --force
git branch -D "$BRANCH" 2>/dev/null || true
echo "Cleaned up $BRANCH"
```

### Step 5: `scripts/quality-screenshot.py`

Playwright script to capture screenshots of the running app. Used by Claude for quality review.

```python
"""Capture screenshot of running app for quality review.
Usage: python scripts/quality-screenshot.py [--port 5173] [--output /tmp/screenshot.png] [--wait 5]
"""
import argparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--port', default=5173, type=int)
parser.add_argument('--output', default='/tmp/app-screenshot.png')
parser.add_argument('--wait', default=5, type=int, help='Seconds to wait for particles')
args = parser.parse_args()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(f'http://localhost:{args.port}')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(args.wait * 1000)  # Let particles populate
    page.screenshot(path=args.output, full_page=False)
    browser.close()
    print(f"Screenshot saved to {args.output}")
```

### Step 6: `agents/base-context.md`

Shared context for ALL Gemini agents (not just visual tasks):

```markdown
# Agent Context

You are working in a git worktree of "Particle Swarm City" — a p5.js
visualization of AI agent particles flowing through a node graph.

## Architecture
- `src/simulation/` — Pure TypeScript. NO p5/browser imports. DO NOT MODIFY.
- `src/rendering/` — p5.js drawing (renderer, node-renderer, particle-renderer, effects, text-overlay, minimap)
- `src/sound/` — Tone.js audio
- `src/ui/` — DOM/CSS controls
- `src/types.ts` — Shared interfaces
- `src/config.ts` — Tuneable constants

## Rules
1. NEVER modify `src/simulation/` — it's stable and tested
2. Run `npm run check` before final commit (vitest + tsc + eslint + vite build)
3. Commit with descriptive messages: `feat:`, `fix:`, `refactor:`, etc.
4. Read AGENTS.md for full conventions

## Progress Reporting
Update `.agent-progress.md` frequently:

    ## Status: working | blocked | done
    ## Completed
    - what you finished
    ## Current
    - what you're doing now
    ## Issues
    - any blockers
    ## Files Modified
    - path/to/file.ts — what changed

## Before Finishing
1. Run `npm run check` — fix ALL errors
2. Set Status to `done` in .agent-progress.md
3. Commit everything including .agent-progress.md
```

### Step 7: `agents/skills/p5-visual-quality.md`

Adapted from the **algorithmic-art** skill. p5.js techniques for OpenProcessing-grade quality:

Content covers:
- **Philosophy-first approach**: Think about the computational aesthetic before coding — what makes this feel alive?
- **Trail rendering**: Per-vertex alpha gradient (loop trail array, set alpha as `i/trail.length`), width taper via multiple overlapping lines, `curveVertex()` for smooth Catmull-Rom splines, persistent trails via `createGraphics()` buffer that fades each frame
- **Glow simulation**: 3-5 concentric circles with decreasing opacity and increasing radius. `drawingContext.shadowBlur`/`shadowColor` (expensive — nodes only, not per-particle)
- **Color mastery**: `lerpColor()` for gradients, HSB mode (`colorMode(HSB)`) for hue rotation, cohesive palettes derived from 2-3 base colors. NEVER random RGB values
- **Organic motion**: `noise()` for natural movement (`noiseDetail(4, 0.5)`), sine waves for breathing/pulsing, exponential easing for fade-outs (not linear)
- **Atmosphere**: Noise-based gradient fields, vignette (radial gradient overlay), depth through layered transparency (background < edges < nodes < particles < effects)
- **Performance**: Batch draw calls, cache `p.color()` objects, avoid per-particle `push()`/`pop()`, minimize state changes, `noStroke()` when only filling
- **"OpenProcessing grade" criteria**: Emergent complexity from simple rules, organic motion, intentional color, smooth transitions (no popping), depth layers, the screenshot alone tells a story

### Step 8: `agents/skills/aesthetic-criteria.md`

Adapted from the **frontend-design** skill. Anti-"AI slop" criteria:

- **Typography**: Distinctive choices, not generic system fonts
- **Color**: Dominant colors with sharp accents > timid evenly-distributed palettes. CSS variables for consistency.
- **Motion**: High-impact orchestrated moments > scattered micro-interactions
- **Spatial composition**: Asymmetry, overlap, generous negative space
- **Backgrounds**: Atmosphere and depth, not flat solid colors
- **NEVER**: Generic purple gradients, predictable layouts, cookie-cutter patterns, overused sans-serif fonts

### Step 9: `agents/quality-rubric.md`

Quality judging rubric for Claude to use when reviewing screenshots. Structured scoring:

```markdown
# Visual Quality Review Rubric

Rate each dimension 1-5, then provide overall assessment.

## Dimensions

### 1. Depth & Atmosphere (1-5)
- 1: Flat solid background, no layering
- 3: Some transparency, basic layering
- 5: Rich depth with multiple visual layers, vignette, atmospheric effects

### 2. Color Cohesion (1-5)
- 1: Random/clashing colors, generic palette
- 3: Reasonable palette, some harmony
- 5: Intentional, cohesive palette with purposeful accents

### 3. Motion Quality (1-5)
- 1: Static or jerky, linear interpolation
- 3: Smooth but basic animation
- 5: Organic, eased motion with emergent patterns

### 4. Particle/Trail Aesthetics (1-5)
- 1: Plain dots, no trails or flat lines
- 3: Basic trails with some fade
- 5: Gradient trails with taper, smooth curves, glow effects

### 5. Effects Polish (1-5)
- 1: No visual effects on events
- 3: Basic shockwave rings
- 5: Multi-layer effects (debris, afterglow, screen response)

### 6. Overall "Would Share" Factor (1-5)
- 1: Looks like a homework assignment
- 3: Decent visualization, wouldn't embarrass you
- 5: Would proudly post on OpenProcessing / share with friends

## Assessment
- Score < 18: Needs significant work — create follow-up tasks
- Score 18-24: Good but could be better — targeted refinements
- Score 25-30: OpenProcessing grade — ship it
```

### Step 10: First batch of task prompts

Create `agents/tasks/` with initial visual polish tasks. Each is a focused markdown file with: objective, files to modify, acceptance criteria, technique guidance.

Starting set:
- `particle-trails.md` — Enhanced trails (alpha gradient, taper, curves)
- `node-glow.md` — Radial glow halos, breathing animation
- `background-field.md` — Noise gradient, vignette, atmosphere

These serve as **templates** for future tasks too — same format for E2E tests, deploy, etc.

---

## Claude's Orchestration Workflow

```
1. SETUP   — Create all scripts + agent files (one-time)
2. DISPATCH — Run agent-dispatch.sh for 2-3 tasks in parallel
3. MONITOR  — Run agent-monitor.sh periodically (cheap file reads)
4. MERGE    — When "done", run agent-merge.sh in safe order
5. REVIEW   — Screenshot via quality-screenshot.py or browser automation
             Score against quality-rubric.md
             + User provides manual feedback
6. ITERATE  — Write new task prompt with specific feedback, re-dispatch
7. DOCS     — Update tasks.md and session-log.md
```

### Quality Review Loop (Dual)

**Automated (Claude):**
1. Start dev server: `npm run dev &`
2. Take screenshot: `python scripts/quality-screenshot.py` (or browser automation)
3. Read screenshot, score against `agents/quality-rubric.md`
4. If score < 18: auto-generate follow-up task with specific issues
5. If score >= 25: mark as done

**Manual (User):**
- User looks at running app, gives feedback
- Claude converts feedback into task prompt, dispatches to Gemini

### Error Handling

| Scenario | Action |
|----------|--------|
| Gemini crashes | `agent-cleanup.sh`, re-dispatch same task |
| `npm run check` fails | Re-dispatch with errors in prompt |
| Merge conflict | Claude resolves additive conflicts, flags complex ones |
| Agent blocked | Read `.agent-output.log` tail, adjust prompt |

---

## Files to Create (in order)

1. `scripts/agent-dispatch.sh` — Core dispatch script
2. `scripts/agent-monitor.sh` — Status dashboard
3. `scripts/agent-merge.sh` — Validate + merge
4. `scripts/agent-cleanup.sh` — Cleanup failed work
5. `scripts/quality-screenshot.py` — Playwright screenshot capture
6. `agents/base-context.md` — Shared Gemini context
7. `agents/quality-rubric.md` — Visual quality scoring
8. `agents/skills/p5-visual-quality.md` — p5.js art techniques
9. `agents/skills/aesthetic-criteria.md` — Anti-AI-slop design criteria
10. `agents/tasks/particle-trails.md` — First visual task
11. `agents/tasks/node-glow.md` — Second visual task
12. `agents/tasks/background-field.md` — Third visual task

## Verification

1. Create all files, make scripts executable
2. Single agent test: `./scripts/agent-dispatch.sh feat/test agents/tasks/particle-trails.md agents/skills/p5-visual-quality.md`
3. Monitor: `./scripts/agent-monitor.sh`
4. Wait for completion, merge: `./scripts/agent-merge.sh feat/test`
5. Screenshot review: `python scripts/quality-screenshot.py && open /tmp/app-screenshot.png`
6. If that works → scale to 2-3 parallel agents
