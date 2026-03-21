# Task: Background Atmosphere

## Objective
Replace the flat solid background with an atmospheric depth layer: subtle noise-based color variation, a vignette effect, and an optional decorative dust particle layer. Make the canvas feel like a space you could reach into.

## Files to Create/Modify
- `src/rendering/background.ts` — **NEW FILE**: background rendering functions
- `src/rendering/renderer.ts` — Import and call background functions
- `src/config.ts` — Add background tuning parameters

## Current State
In `renderer.ts`, the background is a single call:
```typescript
p.background(colors.background)  // '#05050a' in dark mode, '#fcfcf7' in light
```

This creates a completely flat canvas with no depth or atmosphere.

## What to Build

### 1. Vignette Effect
Darken the edges of the canvas to draw focus to the center:
```typescript
export function drawVignette(p: p5) {
  const ctx = (p as any).drawingContext as CanvasRenderingContext2D
  const gradient = ctx.createRadialGradient(
    p.width / 2, p.height / 2, p.width * 0.3,   // Inner: transparent
    p.width / 2, p.height / 2, p.width * 0.7     // Outer: dark
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, p.width, p.height)
}
```
- Should work in both dark and light mode (adjust outer color accordingly)
- Light mode: use 'rgba(0,0,0,0.08)' for subtle effect

### 2. Subtle Noise Field
A slowly undulating color variation across the canvas:
- Use a `createGraphics()` offscreen buffer (same size as canvas)
- Update the buffer every ~30 frames (not every frame — too expensive)
- Use `p.noise(x * 0.005, y * 0.005, frameCount * 0.001)` to vary brightness
- Variation should be very subtle: ±5% brightness from base background
- Draw the buffer as the first thing in the render pipeline

### 3. Dust Particles (Decorative)
Tiny floating dots that drift slowly, purely decorative:
- 50-100 dust particles
- Size: 1-2px, very low opacity (alpha 20-40)
- Movement: slow drift using noise-based velocity
- Purpose: adds life to empty areas of the canvas
- Drawn BEFORE nodes/particles (behind everything)

### 4. Integration with renderer.ts
Replace the current `p.background(colors.background)` with:
```typescript
import { initBackground, drawBackground } from './background'

// In setup:
initBackground(p, colors)

// In draw (replaces p.background(...)):
drawBackground(p, colors, p.frameCount)
```

### 5. Config Parameters
Add to `src/config.ts`:
```typescript
export const BACKGROUND = {
  vignetteStrength: 0.4,       // Dark mode outer alpha
  vignetteLightStrength: 0.08, // Light mode outer alpha
  noiseScale: 0.005,           // Spatial frequency
  noiseSpeed: 0.001,           // Temporal speed
  noiseIntensity: 0.05,        // Brightness variation (5%)
  dustCount: 80,               // Number of dust particles
  dustAlpha: 30,               // Dust opacity (out of 255)
  dustSpeed: 0.2,              // Pixels per frame
  noiseUpdateInterval: 30,     // Frames between noise buffer updates
}
```

## Acceptance Criteria
- [ ] New file `src/rendering/background.ts` with `initBackground()` and `drawBackground()`
- [ ] Vignette effect darkens edges, transparent center
- [ ] Subtle noise-based color variation across canvas
- [ ] Decorative dust particles float slowly behind everything
- [ ] BACKGROUND config in config.ts with all tuneable parameters
- [ ] Works in both dark mode and light mode
- [ ] Renderer.ts calls the new background functions
- [ ] Performance: noise buffer updates every 30 frames, not every frame
- [ ] `npm run check` passes
- [ ] Does NOT modify any existing rendering logic — only adds the background layer

## Performance Notes
- The noise field is the most expensive part. Use an offscreen buffer and update infrequently.
- Dust particles are cheap (just 80 small ellipses).
- Vignette can be drawn once to a buffer and reused (only changes on window resize).
- Total budget: < 2ms per frame for the entire background layer.

## Reference
- Read `src/rendering/renderer.ts` to see where background is drawn and the camera transform
- Read `src/config.ts` for COLORS_DARK.background and COLORS_LIGHT.background
- IMPORTANT: The background is drawn BEFORE the camera transform (`p.push()` / `p.translate()` / `p.scale()`). Vignette should also be drawn in screen space (after `p.pop()`).
