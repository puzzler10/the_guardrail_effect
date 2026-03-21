#!/bin/bash
# Usage: ./scripts/agent-merge.sh <branch-name>
# Validates checks pass on the branch, merges to main, runs post-merge checks,
# auto-updates docs from .agent-summary.md, then cleans up.
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

# Check agent is finished
PID=$(cat "$WORKTREE_DIR/.agent-pid" 2>/dev/null || echo "0")
if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
  echo "WARNING: Agent still running (PID $PID). Wait for it to finish or kill it first."
  exit 1
fi

# Capture agent summary before merge (worktree will be removed later)
AGENT_SUMMARY=""
if [ -f "$WORKTREE_DIR/.agent-summary.md" ]; then
  AGENT_SUMMARY=$(cat "$WORKTREE_DIR/.agent-summary.md")
  echo "=== Agent summary found ==="
  echo "$AGENT_SUMMARY"
  echo ""
else
  echo "WARNING: No .agent-summary.md found. Docs will not be auto-updated."
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

# Auto-update docs from agent summary
if [ -n "$AGENT_SUMMARY" ]; then
  echo ""
  echo "=== Updating docs ==="
  DATE=$(date +%Y-%m-%d)
  BRANCH_SHORT="${BRANCH##*/}"

  # Append to session-log.md
  {
    echo ""
    echo "## ${DATE} — Agent merge: ${BRANCH_SHORT}"
    echo ""
    echo "$AGENT_SUMMARY"
  } >> "$REPO_ROOT/docs/session-log.md"
  echo "  Updated docs/session-log.md"

  # Extract completed tasks and mark them in tasks.md
  # Look for lines like "- Task name" under "## Tasks completed"
  TASKS_SECTION=$(echo "$AGENT_SUMMARY" | sed -n '/^## Tasks completed/,/^## /p' | grep '^- ' || true)
  if [ -n "$TASKS_SECTION" ]; then
    echo "  Tasks completed by agent:"
    echo "$TASKS_SECTION" | while IFS= read -r task_line; do
      task_name=$(echo "$task_line" | sed 's/^- //')
      echo "    - $task_name"
      # Try to check off matching task in tasks.md ([ ] -> [x])
      if grep -q "\[ \].*${task_name}" "$REPO_ROOT/docs/tasks.md" 2>/dev/null; then
        sed -i '' "s/\[ \]\(.*${task_name}\)/[x]\1/" "$REPO_ROOT/docs/tasks.md"
        echo "      ✓ Marked complete in tasks.md"
      fi
    done
  fi

  # Commit doc updates
  cd "$REPO_ROOT"
  git add docs/session-log.md docs/tasks.md
  if ! git diff --cached --quiet; then
    git commit -m "docs: auto-update from ${BRANCH_SHORT} agent merge"
    echo "  Committed doc updates."
  fi
fi

# Cleanup
echo ""
echo "=== Cleanup ==="
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
git branch -d "$BRANCH" 2>/dev/null || true
echo "Merged and cleaned up $BRANCH successfully."
