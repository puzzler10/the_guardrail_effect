#!/bin/bash
# Usage: ./scripts/agent-cleanup.sh <branch-name>
# Removes a worktree without merging. Kills the agent if still running.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

BRANCH="$1"
REPO_ROOT="$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/\.git$||')"
WORKTREE_DIR="${REPO_ROOT}/.worktrees/${BRANCH##*/}"

if [ ! -d "$WORKTREE_DIR" ]; then
  echo "No worktree found at $WORKTREE_DIR"
  exit 0
fi

# Kill agent if running
PID=$(cat "$WORKTREE_DIR/.agent-pid" 2>/dev/null || echo "0")
if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
  echo "Killing agent (PID $PID)..."
  kill "$PID" 2>/dev/null || true
  sleep 1
fi

# Remove worktree and branch
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || {
  echo "Force removing directory..."
  rm -rf "$WORKTREE_DIR"
  git worktree prune
}
git branch -D "$BRANCH" 2>/dev/null || true

echo "Cleaned up $BRANCH (worktree removed, branch deleted)"
