#!/bin/bash
# Usage: ./scripts/agent-dispatch.sh <branch> <task-file> [skill-file...]
# Example: ./scripts/agent-dispatch.sh feat/particle-trails agents/tasks/particle-trails.md agents/skills/p5-visual-quality.md
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <branch-name> <task-file> [skill-file...]"
  echo "Example: $0 feat/particle-trails agents/tasks/particle-trails.md agents/skills/p5-visual-quality.md"
  exit 1
fi

BRANCH="$1"; shift
TASK_FILE="$1"; shift
SKILL_FILES=("$@")

REPO_ROOT="$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/\.git$||')"
WORKTREE_DIR="${REPO_ROOT}/.worktrees/${BRANCH##*/}"

# Validate task file exists
if [ ! -f "$REPO_ROOT/$TASK_FILE" ]; then
  echo "ERROR: Task file not found: $REPO_ROOT/$TASK_FILE"
  exit 1
fi

# Create worktree from current main
echo "Creating worktree for $BRANCH..."
git branch "$BRANCH" main 2>/dev/null || true
git worktree add "$WORKTREE_DIR" "$BRANCH" 2>/dev/null || {
  echo "Worktree already exists at $WORKTREE_DIR"
  echo "Run ./scripts/agent-cleanup.sh $BRANCH first"
  exit 1
}

# Install deps in worktree
echo "Installing dependencies..."
cd "$WORKTREE_DIR"
npm install --silent 2>/dev/null

# Assemble prompt: base context + skills + task
PROMPT="$(cat "$REPO_ROOT/agents/base-context.md")"

for skill in "${SKILL_FILES[@]+"${SKILL_FILES[@]}"}"; do
  if [ -f "$REPO_ROOT/$skill" ]; then
    PROMPT="$PROMPT

---

$(cat "$REPO_ROOT/$skill")"
  else
    echo "WARNING: Skill file not found: $skill (skipping)"
  fi
done

PROMPT="$PROMPT

---

$(cat "$REPO_ROOT/$TASK_FILE")"

# Launch Gemini headless in the worktree directory
echo "Launching Gemini agent..."
cd "$WORKTREE_DIR"
gemini -p "$PROMPT" -y --sandbox --output-format text \
  > "${WORKTREE_DIR}/.agent-output.log" 2>&1 &

GEMINI_PID=$!
echo "$GEMINI_PID" > "${WORKTREE_DIR}/.agent-pid"
echo ""
echo "=== Agent Dispatched ==="
echo "  PID:      $GEMINI_PID"
echo "  Branch:   $BRANCH"
echo "  Worktree: $WORKTREE_DIR"
echo "  Task:     $TASK_FILE"
echo "  Skills:   ${SKILL_FILES[*]:-none}"
echo ""
echo "Monitor with: ./scripts/agent-monitor.sh"
echo "Merge with:   ./scripts/agent-merge.sh $BRANCH"
