# Tasks

*(Note: Tasks from Phase 0 to Phase 9 have been completed and archived. See [docs/archive/completed-tasks.md](archive/completed-tasks.md) for history.)*

## Phase 18: Help & Failures Expansion ✅ DONE
- [x] **Help Page Overhaul**: Added detailed Guardrails explanation and Stripe-based example.
- [x] **Status Guide**: Updated colors/labels to match T1-T4 failure tiers and particle hues.
- [x] **Keyboard Shortcuts**: Added missing 'C' (Controls) shortcut to the help overlay.
- [x] **Failure Expansion**: Added 40+ realistic, high-impact failure messages for T3/T4.
- [x] **Connector Specifics**: Implemented custom scary failure scenarios for AWS, K8s, Stripe, and Slack.

## Phase 17: Robust Agent Automation ✅ DONE
- [x] **Dynamic Path Finding**: Update `agent-merge.sh` to find worktrees via `git worktree list`.
- [x] **Artifact Auto-Cleanup**: Automated discarding of `dist/` and `.vite/` results before merging.
- [x] **Permanent Tool Access**: Moved `.worktrees/` to `.git/info/exclude` to avoid gitignore blindness.
- [x] **Doc Cleanup**: Reverted manual worktree rules in `AGENTS.md` as they are now automated.

## Phase 16: UI Overhaul (Descriptions & Terminal) ✅ DONE
- [x] **Node Descriptions**: Added 2-line descriptions to all connectors in `config.ts`.
- [x] **Mapping**: Verified `description` field mapping in `graph.ts` and `scenarios.ts`.
- [x] **Dual-Mode UI**: Implemented minimal hover tooltips and detailed click info cards.
- [x] **Terminal Log**: Overhauled hidden log into a sleek, continuous bottom-right terminal.
- [x] **Terminal Toggle**: Added a visible "Terminal >_" button to the main control panel.

## Phase 15: Serpentine Flow Aesthetic ✅ DONE
- [x] Horizontal serpentine grid layout (4x15) for global graph
- [x] Left-to-Right, Right-to-Left "S-curve" motion
- [x] Uniform particle spread (spawn at all safe/low risk nodes + serpentine start)
- [x] Reduced layout jitter (35px) for cleaner, "tidier" appearance
- [x] Verified continuous motion and space utilization

## Phase 14: Visual Polish & Layout Fixes ✅ DONE
- [x] Add boundary validation regression tests (prevent out-of-bounds nodes)
- [x] Fix minimap and layout bounds (constrained to canvas dimensions)
- [x] Fix vertical seam in scrolling backgrounds (seamless noise)
- [x] Reduce minimap background opacity (transparency for background visibility)
- [x] Horizontal flow layout (utilize full 3000px canvas width)

## Phase 13: Visual Bug Fix Pass ✅ DONE
- [x] Fix ghosting/after-images (missing `p.background()` call)
- [x] Fix red stripe artifacts (stormFlash moved to screen-space)
- [x] Fix 5-circle layout → flow default
- [x] Fix layout dropdown for non-global scenarios
- [x] Fix stale node sizes in node-renderer.ts
- [x] Increase node sizes + default zoom (less tinny)
- [x] Rescale failure rate slider (max 3, 0.01 step)
- [x] Remove Model Preset + Dark Mode controls
- [x] Default agent speed 0.5x
- [x] Tone down rainbow mode
- [x] Particle path variety
- [x] Wider scrollbar
- [x] Node click tooltip

## Phase 12: Luminous Agent Particles ✅ DONE
- [x] Individual hue identity per particle (cool spectrum cyan→magenta, golden-angle distribution)
- [x] Directional comet shape (elongated ellipse rotated along travel direction)
- [x] Tapered explicit trails from particle.trail[] array
- [x] White-hot core for visibility on dark + rainbow backgrounds
- [x] Journey-progress size variation, reduced node-boundary fade zone

## Phase 11: UI/UX Polish ✅ DONE
- [x] Fix GitLab "foxes" icon bug → 🦊
- [x] Reduce failure rate to 1/100th (failureMultiplier default 0.01)
- [x] Slow particles (baseSpeed 0.0012, spawnRate 8)
- [x] Stop node breathing animation (breatheAmount 0)
- [x] Default zoom 0.6 to show full network, zoomMin 0.3
- [x] Reduce camera shake (±2px), edge opacity (0.15), trail intensity
- [x] Particles fade at node boundaries (no clipping through icons)

## Phase 10: Performance & Dynamic Theming (Cha Cha Cha) ✅ DONE
- [x] **Performance Optimization**: Remove O(N) allocations and object creation in render loop; fix background noise lag spikes.
- [x] **Palette Configuration**: Define `theme.storm` and `theme.rainbow` in `src/config.ts`.
- [x] **Dynamic Background Engine**: Implement state-aware background rendering in `src/rendering/background.ts`.
- [x] **Storm Flash Effects**: Implement event-triggered red/orange flashes in `src/rendering/effects.ts`.
- [x] **Verification**: Ensure smooth transitions between "Storm" and "Rainbow" states based on guardrail toggle.
