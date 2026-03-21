#!/bin/bash
# Usage: ./scripts/agent-review.sh <branch-name>
# Takes a screenshot of the agent's work for visual quality review.
# Run BEFORE agent-merge.sh for visual changes.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

BRANCH="$1"
REPO_ROOT="$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/\.git$||')"
WORKTREE_DIR="${REPO_ROOT}/.worktrees/${BRANCH##*/}"

if [ ! -d "$WORKTREE_DIR" ]; then
  echo "ERROR: No worktree found at $WORKTREE_DIR"
  exit 1
fi

SCREENSHOT_PATH="/tmp/agent-review-${BRANCH##*/}.png"

echo "=== Starting dev server in worktree ==="
cd "$WORKTREE_DIR"
npx vite --port 5174 &
VITE_PID=$!
sleep 3

echo "=== Taking screenshot ==="
python3 "$REPO_ROOT/scripts/quality-screenshot.py" --port 5174 --output "$SCREENSHOT_PATH" --wait 5

echo "=== Stopping dev server ==="
kill $VITE_PID 2>/dev/null || true

echo ""
echo "Screenshot saved: $SCREENSHOT_PATH"
echo ""
echo "Review against: agents/quality-rubric.md"
echo "If score < 18/30, re-dispatch the agent with feedback."
