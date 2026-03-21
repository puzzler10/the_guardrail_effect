#!/bin/bash
# Usage: ./scripts/agent-monitor.sh [branch-name]
# Without args: shows all agents. With arg: shows specific agent.

REPO_ROOT="$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/\.git$||')"
WORKTREE_BASE="${REPO_ROOT}/.worktrees"

if [ ! -d "$WORKTREE_BASE" ]; then
  echo "No worktrees found at $WORKTREE_BASE"
  exit 0
fi

show_agent() {
  local dir="$1"
  local branch
  branch=$(basename "$dir")

  echo "--- $branch ---"

  # Check process status
  local pid_file="$dir/.agent-pid"
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Process: RUNNING (PID $pid)"
    else
      echo "Process: FINISHED (PID $pid)"
    fi
  else
    echo "Process: NO PID"
  fi

  # Show progress file
  if [ -f "$dir/.agent-progress.md" ]; then
    echo ""
    cat "$dir/.agent-progress.md"
  else
    echo "Progress: (no .agent-progress.md yet)"
  fi

  # Show git diff stats
  echo ""
  echo "Files changed:"
  cd "$dir" 2>/dev/null && git diff --stat main 2>/dev/null || echo "  (none)"

  # Show last few lines of output log
  if [ -f "$dir/.agent-output.log" ]; then
    local lines
    lines=$(wc -l < "$dir/.agent-output.log")
    echo ""
    echo "Output log: $lines lines (tail -20 $dir/.agent-output.log to see more)"
  fi

  echo ""
}

echo "=== Agent Status Report ==="
echo "Time: $(date)"
echo ""

if [ $# -gt 0 ]; then
  # Show specific agent
  TARGET_DIR="$WORKTREE_BASE/${1##*/}"
  if [ -d "$TARGET_DIR" ]; then
    show_agent "$TARGET_DIR"
  else
    echo "No worktree found for: $1"
    exit 1
  fi
else
  # Show all agents
  found=0
  for dir in "$WORKTREE_BASE"/*/; do
    [ -d "$dir" ] || continue
    found=1
    show_agent "$dir"
  done
  if [ "$found" -eq 0 ]; then
    echo "No active agents."
  fi
fi
