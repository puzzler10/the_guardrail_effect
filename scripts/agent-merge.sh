#!/bin/bash
# Usage: ./scripts/agent-merge.sh <branch-name>
# Validates checks pass on the branch, merges to main, runs post-merge checks, cleans up.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

BRANCH="$1"
REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_DIR="${REPO_ROOT}/../worktrees/${BRANCH##*/}"

if [ ! -d "$WORKTREE_DIR" ]; then
  echo "ERROR: No worktree found at $WORKTREE_DIR"
  exit 1
fi

# Check agent is finished
PID=$(cat "$WORKTREE_DIR/.agent-pid" 2>/dev/null || echo "0")
if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
  echo "WARNING: Agent still running (PID $PID). Wait for it to finish or kill it first."
  exit 1
fi

# Show what will be merged
echo "=== Files to merge from $BRANCH ==="
cd "$WORKTREE_DIR"
git diff --stat main
echo ""

# Validate in worktree
echo "=== Running checks on $BRANCH ==="
npm run check || {
  echo ""
  echo "FAIL: npm run check did not pass on $BRANCH"
  echo "Fix the issues or re-dispatch the agent."
  exit 1
}
echo "All checks passed."
echo ""

# Merge into main
cd "$REPO_ROOT"
echo "=== Merging $BRANCH into main ==="
git merge --no-ff "$BRANCH" -m "merge: ${BRANCH##*/}" || {
  echo ""
  echo "MERGE CONFLICT. Resolve manually then run: npm run check"
  exit 1
}

# Post-merge checks
echo ""
echo "=== Post-merge checks ==="
npm run check || {
  echo ""
  echo "WARNING: Post-merge checks failed!"
  echo "Consider: git reset --merge HEAD~1"
  exit 1
}
echo "Post-merge checks passed."

# Cleanup
echo ""
echo "=== Cleanup ==="
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
git branch -d "$BRANCH" 2>/dev/null || true
echo "Merged and cleaned up $BRANCH successfully."
