# Task: Lower Failure Rates & Auto-Zoom Toggle

## Objective
Two focused changes:
1. Lower failure probability across all model presets to reduce visual chaos (we now have 45 nodes instead of 35)
2. Add a UI toggle to enable/disable the auto-zoom on catastrophic events

## Files to Modify
- `src/config.ts` — Reduce failure rates in MODEL_PRESETS
- `src/types.ts` — Add `autoZoomEnabled` to SimulationConfig
- `src/ui/controls.ts` — Add auto-zoom toggle to controls panel
- `src/rendering/renderer.ts` — Gate auto-zoom behind config flag

## DO NOT MODIFY
- `src/simulation/` — never touch simulation core logic
- `src/rendering/node-renderer.ts` — another agent is modifying this
- `src/rendering/particle-renderer.ts` — another agent is modifying this

## What to Build

### 1. Lower Failure Rates
In `src/config.ts`, reduce all `MODEL_PRESETS` rates by roughly 40-50%:

Current frontier rates: `{ safe: 0.001, low: 0.005, medium: 0.015, high: 0.03, critical: 0.05 }`
New frontier rates: `{ safe: 0.0005, low: 0.003, medium: 0.008, high: 0.018, critical: 0.03 }`

Scale all other presets proportionally. The goal: fewer but more impactful failure events, less visual clutter.

### 2. Add `autoZoomEnabled` to SimulationConfig
In `src/types.ts`, find the `SimulationConfig` interface and add:
```typescript
autoZoomEnabled: boolean
```

In `src/config.ts`, set the default in `DEFAULT_CONFIG`:
```typescript
autoZoomEnabled: true,  // On by default, user can disable
```

### 3. Auto-Zoom Toggle in Controls Panel
In `src/ui/controls.ts`, add a toggle switch for auto-zoom. Place it near the existing camera/visual controls. Follow the same pattern as the existing guardrail toggle:

Look for how the guardrails toggle is implemented and replicate that pattern:
- Label: "Auto-Zoom on Catastrophe"
- Toggle switch with the same CSS classes
- Updates `config.autoZoomEnabled` when toggled
- Syncs state when `syncControls()` is called

### 4. Gate Auto-Zoom in Renderer
In `src/rendering/renderer.ts`, find the auto-zoom block (around line 67-76):
```typescript
if (event.tier === 4) {
  effects.push(createShockwave(event.x, event.y, nowMs))
  effects.push(createScreenShake(nowMs))

  // Auto-zoom on catastrophe
  targetCamX = event.x
  targetCamY = event.y
  targetZoom = 2.0
  focusEndTime = nowMs + 2500
}
```

Wrap ONLY the camera part in a config check:
```typescript
if (event.tier === 4) {
  effects.push(createShockwave(event.x, event.y, nowMs))
  effects.push(createScreenShake(nowMs))

  // Auto-zoom on catastrophe (if enabled)
  if (state.config.autoZoomEnabled) {
    targetCamX = event.x
    targetCamY = event.y
    targetZoom = 2.0
    focusEndTime = nowMs + 2500
  }
}
```

Note: shockwave and screen shake should ALWAYS play on tier 4 regardless of the toggle. Only the camera zoom is gated.

## Acceptance Criteria
- [ ] All model preset failure rates reduced by ~40-50%
- [ ] `autoZoomEnabled: boolean` added to SimulationConfig interface
- [ ] Default config has `autoZoomEnabled: true`
- [ ] Controls panel has an auto-zoom toggle switch
- [ ] Toggle properly updates config and syncs
- [ ] Auto-zoom only triggers when `autoZoomEnabled` is true
- [ ] Shockwave/shake still plays on tier 4 regardless
- [ ] Simulation still produces enough events to be interesting (not too quiet)
- [ ] `npm run check` passes — this includes unit tests that may check failure rates
- [ ] Tests may need threshold adjustments if failure distribution tests are too tight

## Test Notes
There are integration tests in `tests/integration/failure-distribution.test.ts` and `tests/integration/guardrail-effectiveness.test.ts` that check failure event counts. With lower rates, these tests may need adjusted thresholds or longer simulation runs. Check them and update if needed — the tests use ±30% tolerances so they may still pass, but verify.
