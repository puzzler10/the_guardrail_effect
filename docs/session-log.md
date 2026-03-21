# Session Log

## 2026-03-21 — Session 21: E2E Tests & Visual Upgrades

**What was done:**
- Implemented 7 Playwright E2E tests in `tests/e2e/app.spec.ts` covering:
  - Page load and console error check
  - Sound overlay dismissal
  - Controls panel open/close
  - Keyboard shortcuts (C, L, ?, Space, Escape)
  - Stats bar real-time updates
  - Event log filtering and entry generation
  - Canvas rendering verification
- Fixed UI layering issues:
  - Modified `main.ts` to show onboarding overlay ONLY after sound overlay is dismissed
  - Changed `sound-overlay.ts` to append to `document.body` (fixing silent failure on missing `#app`)
  - Added `.help-overlay` class to help backdrop for precise E2E targeting
- Upgraded Node Visuals (Node Glow & Atmosphere):
  - Multi-layered radial halos (3-5 layers based on risk)
  - Desynchronized breathing animations (±8% size oscillation)
  - Upgraded Guardrail Shields: 3 concentric rings with staggered pulses and exponential decay
- Implemented Background Atmosphere:
  - Noise-based undulating color field using an offscreen `p5.Graphics` buffer
  - Performance optimization: noise buffer updates every 30 frames
  - Decorative dust particles with noise-based drifting movement
  - Integrated Vignette effect in screen space
- Refactored `keyboard.ts` to use `e.key` instead of `e.code` for better layout compatibility and shortcut reliability.
- Verified Phase 8 (Civic Scenarios) and Phase 7 (Voice Feedback) implementations which were previously integrated.
- All checks passed: 92 tests green, clean TSC, clean ESLint, successful production build.

**Key decisions:**
- Switched to `e.key` for keyboard shortcuts to fix issues with certain keys (like `?`) and make them more intuitive.
- Sequential overlay display (Sound -> Onboarding) improves user flow and prevents interaction conflicts.
- Offscreen buffering for noise and vignette ensures high performance even with complex background effects.


## 2026-03-21 — Session 23: Phase 9 Visual Upgrades

**What was done:**
- Conducted a comprehensive **Visual Quality Audit** against the project's aesthetic and p5.js quality criteria.
- Implemented **Persistent Trail Buffer** in `src/rendering/trails.ts`:
  - Replaced immediate-mode polylines with a world-space buffer that fades over time.
  - Used `SCREEN` blend mode for luminous, additive trail effects.
- Implemented **Cinematic Camera Easing** in `src/rendering/renderer.ts`:
  - Split LERP factors for pan and zoom.
  - Added "snap-to-focus" behavior for catastrophic failure events.
- Enhanced **Shockwave Effects** in `src/rendering/effects.ts`:
  - Added secondary ripples and 15 noise-directed debris particles per shockwave.
- Documented findings and improvements in `docs/visual-review-feedback-v1.md`.
- Fixed lint/type errors and verified with `npm run check`.

**Key decisions:**
- Using a 2000x1400 world-space buffer for trails allows them to stay fixed to the simulation grid during camera movements, creating a "solid" feel.
- Lowered the trail fade rate (`fill(0, 15)`) to create long, ghostly wakes that emphasize agent paths.

**What's next:**
- Final polish and user feedback review.

## 2026-03-21 — Agent merge: fix-loading

## Tasks completed
- [x] URL query params implemented and tested
- [x] Added unit tests for URL parsing logic
- [x] Integrated URL state with simulation configuration

## Technical details
- Created `src/ui/url-params.ts` with `parseUrlParams` and `updateUrlParams`.
- Parameters: `model`, `scenario`, `layout`, `multiplier`, `speed`, `count`, `guardrails`, `autozoom`, `dark`, `sound`, `volume`.
- Clamped numerical inputs to valid config ranges.
- Initial state in `main.ts` now honors URL params.
- State changes in UI now trigger `window.history.replaceState`.
- Mocked global `location` and `history` in `tests/unit/url-params.test.ts` to verify parsing and updating.

## Results
- `npm run check` passed: 99 tests (including 7 new unit tests), clean build, clean lint.
- URL is now a reactive source of truth for the simulation state.
