# Task: Fix Loading and Performance Bottlenecks

## Objective
Investigate and fix the issue where the application "doesn't load" and optimize the background noise rendering which is a likely performance bottleneck. Add error logging to the startup sequence.

## 1. Optimize `src/rendering/background.ts`
The `updateNoiseBuffer` loop is extremely heavy on large screens. Optimize it by:
- Creating a `noiseBuffer` that is 1/4 the size of the canvas width/height.
- Drawing the noise field with 1/16th the number of rectangles.
- Drawing the buffer scaled up using `p.image(noiseBuffer, 0, 0, p.width, p.height)`.

## 2. Add Error Handling in `src/main.ts`
- Wrap the `init()` call in a `try/catch` block.
- Log errors to the console.
- Add a global `window.onerror` and `window.onunhandledrejection` handler to log any startup errors.

## 3. Investigate "Not Loading" Issue
- Check if `localStorage` access is guarded. Wrap it in a `try/catch` in `onboarding.ts`.
- Ensure `initSoundOverlay` doesn't throw if `document.body` is not ready (though it's called at the end).
- Check if `p5@2.2.2` needs any specific initialization changes compared to `1.x`.

## Acceptance Criteria
- [ ] `updateNoiseBuffer` runs significantly faster (fewer rectangles).
- [ ] Application starts reliably even if `localStorage` is blocked.
- [ ] Errors during `init()` are captured and logged.
- [ ] `npm run check` passes.
- [ ] Verified via manual check that the page loads.
