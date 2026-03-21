# Tasks

*(Note: Tasks from Phase 0 to Phase 9 have been completed and archived. See [docs/archive/completed-tasks.md](archive/completed-tasks.md) for history.)*

## Phase 14: Visual Polish & Layout Fixes ✅ DONE
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
