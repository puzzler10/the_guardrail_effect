# Plan: Debug Loading Issues and Expand Test Coverage

## 1. Investigation & Optimization (Agent 2)
### Loading Issue Hypothesis
- **Performance bottleneck:** The `updateNoiseBuffer` loop is too heavy (40k+ rectangles) and might be stalling the browser on first load or on large screens.
- **Dependency error:** `p5@2.2.2` or `tone@15.x` might be throwing a silent error.
- **Startup sequence:** The interaction between the `update` loop (via `requestAnimationFrame`) and the `p5` draw loop might be causing a race condition or crash.

### Proposed Fixes
- **Optimized Noise:** Scale down the noise buffer by 4x and use `p.image()` to scale it up. This reduces the pixel count by 16x.
- **Error Handling:** Add a `window.onerror` handler and a `try/catch` block around `init()` in `main.ts` to capture and display errors.
- **Initialization Order:** Ensure `initSoundOverlay` doesn't block other initializations if it fails.

## 2. Test Coverage Expansion (Agent 3)
### Underspecified Areas
- **`src/simulation/scenarios.ts`**: Currently has zero unit tests. Needs to verify all scenarios (`revops`, `devops`, `hr`) have correct node counts and connections.
- **`src/rendering/background.ts`**: Verify initialization logic and that buffers are created.
- **`src/ui/event-log.ts`**: Test that events are correctly added and capped at `UI.eventLogMax`.
- **`src/simulation/simulation.ts`**: Stress test with `particleCount` at maximum.

### New Test Files
- `tests/unit/scenarios.test.ts`
- `tests/unit/background.test.ts`
- `tests/unit/ui-event-log.test.ts`

## 3. Assignment
- **Agent 2**: Dispatch with `agents/tasks/fix-loading-perf.md`
- **Agent 3**: Dispatch with `agents/tasks/test-expansion.md`
