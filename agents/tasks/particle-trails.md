# Task: Enhanced Particle Trails

## Objective
Upgrade particle trail rendering from flat polylines to gallery-quality gradient trails with alpha fade, width taper, and smooth curves.

## Files to Modify
- `src/rendering/particle-renderer.ts` — Main changes here
- `src/config.ts` — Add trail tuning parameters

## Current State
The current `drawParticles()` in `particle-renderer.ts` draws trails as:
- A single `beginShape()` / `endShape()` polyline
- Fixed alpha 0.15 on the trail color (no gradient)
- Fixed `strokeWeight(2)` (no taper)
- Angular `vertex()` calls (no smoothing)
- All particles use the same cyan trail color regardless of state

## What to Build

### 1. Alpha Gradient Trails
Instead of one polyline with fixed alpha, draw trail segments individually with alpha that increases from tail (transparent) to head (opaque):
- Tail alpha: ~10
- Head alpha: ~180
- Use exponential curve, not linear: `alpha = Math.pow(i / trail.length, 1.5) * 180`

### 2. Width Taper
Trail should be thin at the tail, thicker at the head:
- Tail: 1px strokeWeight
- Head: 3-4px strokeWeight
- `strokeWeight(1 + (i / trail.length) * 3)`

### 3. Smooth Curves
Replace `vertex()` with `curveVertex()` for Catmull-Rom spline interpolation:
- Remember: curveVertex needs first and last points doubled for proper endpoints
- Falls back gracefully if trail has < 4 points

### 4. State-Based Trail Colors
- **Healthy**: Cyan gradient (current `particleHealthy` color)
- **Recovering**: Pulsing yellow (tier1 color)
- **Failed**: Orange/red depending on tier (tier2/tier3 colors)
- **Exploded**: White fading to nothing

### 5. Config Parameters
Add to `src/config.ts`:
```typescript
export const TRAIL = {
  alphaMax: 180,
  alphaExponent: 1.5,    // Exponential curve for fade
  widthMin: 1,
  widthMax: 3.5,
  smoothing: true,        // Use curveVertex vs vertex
}
```

## Acceptance Criteria
- [ ] Trails fade from transparent (tail) to opaque (head) with exponential curve
- [ ] Trail width tapers from thin (tail) to thick (head)
- [ ] Trails use smooth Catmull-Rom curves (curveVertex)
- [ ] Different particle states show different trail colors
- [ ] New TRAIL config object in config.ts
- [ ] Performance: 300+ particles at 60fps (batch draws, minimize color object creation)
- [ ] `npm run check` passes
- [ ] Both dark and light mode look good

## Performance Notes
- Cache color objects outside loops where possible
- The per-segment drawing (for alpha gradient) is more expensive than the current single-polyline approach. If frame rate drops below 50fps with 300 particles, reduce trail segment resolution (draw every 2nd point).
- Consider using `p.noFill()` once before the trail loop, then `p.noStroke()` once before the dot loop

## Reference
- Read `src/rendering/particle-renderer.ts` for the current implementation
- Read `src/config.ts` for existing color palette (COLORS_DARK, COLORS_LIGHT)
- Read `src/types.ts` for the Particle interface (trail is `Array<{x, y}>`)
