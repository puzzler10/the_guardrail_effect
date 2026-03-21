# Task: Node Glow & Atmosphere

## Objective
Upgrade node rendering with radial glow halos, breathing animation, and activity pulses. Make nodes feel alive and luminous rather than flat colored circles.

## Files to Modify
- `src/rendering/node-renderer.ts` — Main changes here
- `src/config.ts` — Add glow tuning parameters

## Current State
`drawNode()` in `node-renderer.ts` draws:
- A flat filled circle (`p.ellipse`) with color from `colors.nodeByRisk`
- An icon (emoji) overlaid with dark fill
- A single pulsing ring for guardrail-protected nodes
- Labels shown conditionally based on zoom

Node sizes are defined in `NODE_SIZES`: safe=16, low=18, medium=22, high=28, critical=36.

## What to Build

### 1. Radial Glow Halo
Draw 3-4 concentric semi-transparent circles behind each node to simulate a soft glow:
```typescript
function drawGlow(p: p5, x: number, y: number, size: number, color: string, layers: number = 4) {
  p.noStroke()
  for (let i = layers; i > 0; i--) {
    const c = p.color(color)
    c.setAlpha(40 / i)  // Outer layers more transparent
    p.fill(c)
    p.ellipse(x, y, size * (1 + i * 0.4))
  }
}
```
- Glow intensity should scale with risk: critical nodes glow more than safe nodes
- Critical: 5 layers, safe: 2 layers

### 2. Breathing Animation
All nodes should slowly oscillate in size, giving them a "living" feel:
```typescript
const breathe = 1 + Math.sin(p.millis() * 0.002 + nodeIndex * 0.7) * 0.08
const displaySize = size * breathe
```
- Use `nodeIndex` (or hash of node.id) as phase offset so nodes don't pulse in sync
- Keep amplitude subtle: 8% size variation
- Slow frequency: ~0.002 radians per ms

### 3. Guardrail Shield Upgrade
Current: single pulsing ring. Upgrade to:
- Multiple concentric rings (2-3) with staggered pulse phases
- Slight green tint gradient from inner to outer ring
- Ring opacity follows exponential decay, not linear

### 4. Config Parameters
Add to `src/config.ts`:
```typescript
export const NODE_GLOW = {
  layersSafe: 2,
  layersCritical: 5,
  glowSpread: 0.4,     // Multiplier for glow radius per layer
  breatheSpeed: 0.002,  // Radians per ms
  breatheAmount: 0.08,  // Max size variation (8%)
}
```

## Acceptance Criteria
- [ ] Nodes have soft radial glow halos behind them
- [ ] Glow intensity correlates with risk level (critical glows most)
- [ ] All nodes breathe (slow size oscillation) with desynchronized phase
- [ ] Guardrail shield has multiple rings with staggered pulses
- [ ] New NODE_GLOW config in config.ts
- [ ] Labels still readable (glow doesn't obscure text)
- [ ] Performance: 45 nodes with glow at 60fps
- [ ] `npm run check` passes
- [ ] Both dark and light mode look good

## Performance Notes
- Glow is only 45 nodes (not hundreds of particles), so it's much cheaper
- Cache glow colors outside the node loop if possible
- The `drawingContext.shadowBlur` API is an alternative but can be expensive — the concentric circles approach is more predictable

## Reference
- Read `src/rendering/node-renderer.ts` for current implementation
- Read `src/config.ts` for `COLORS_DARK.nodeByRisk` palette
- Nodes are in `src/types.ts` as `GraphNode` with `x, y, risk, icon, name, id, neighbors`
