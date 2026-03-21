# Task: Node Overhaul — Glow, Icons, Hover Labels

## Objective
Complete visual overhaul of node rendering: add radial glow halos, remove the enclosing circle, make icons much bigger and more visible, and show labels only on hover (via proximity to a "mouse world position" passed in).

## Files to Modify
- `src/rendering/node-renderer.ts` — Main changes
- `src/config.ts` — Add NODE_GLOW config section

## DO NOT MODIFY
- `src/simulation/` — never touch simulation code
- `src/rendering/renderer.ts` — another agent is modifying this

## Current State
`drawNode()` in `node-renderer.ts` draws:
- A flat filled circle (`p.ellipse`) with risk-based color
- A small emoji icon overlaid (textSize = size * 0.6)
- Guardrail pulse ring for high/critical nodes
- Labels shown when zoomed in or high-risk

Node sizes: safe=16, low=18, medium=22, high=28, critical=36

## What to Build

### 1. Remove Enclosing Circle
Delete the `p.ellipse(node.x, node.y, size)` that draws the solid node circle. Nodes should be defined by their icon + glow, not a filled circle.

### 2. Bigger Icons
- Increase icon text size significantly — at least `size * 1.2` or larger
- Icons should be the primary visual element of each node
- Use `p.fill(255)` or the node's risk color for the icon (not dark overlay)
- Consider adding a subtle text shadow/outline for readability against the glow

### 3. Radial Glow Halo
Draw 3-5 concentric semi-transparent circles BEHIND each node to simulate a soft glow:
```typescript
function drawGlow(p: p5, x: number, y: number, size: number, color: string, layers: number = 4) {
  p.noStroke()
  for (let i = layers; i > 0; i--) {
    const c = p.color(color)
    c.setAlpha(40 / i)
    p.fill(c)
    p.ellipse(x, y, size * (1 + i * 0.5))
  }
}
```
- Glow intensity scales with risk: critical = 5 layers, safe = 2 layers
- Glow color matches the node's risk color from `colors.nodeByRisk`

### 4. Breathing Animation
Slow size oscillation so nodes feel alive:
```typescript
const breathe = 1 + Math.sin(p.millis() * 0.002 + hash * 0.7) * 0.08
```
- Use a hash of `node.id` as phase offset so nodes don't pulse in sync
- 8% amplitude, slow frequency (~0.002 rad/ms)
- Apply breathing to glow radius and icon size

### 5. Hover-Only Labels
- Remove the current always-visible label logic
- Labels should only appear when the mouse is near the node
- `drawNodes()` needs a new parameter: `mouseWorldX: number, mouseWorldY: number` (the mouse position in world coordinates, already transformed by camera)
- Show label if distance from mouse to node < `size * 3`
- Fade label alpha based on distance (closer = more opaque)
- Keep the shadow-for-readability pattern

### 6. Guardrail Shield Upgrade
Upgrade the single pulse ring to multiple concentric rings:
- 2-3 rings with staggered pulse phases
- Slight green tint gradient
- Exponential opacity decay on outer rings

### 7. Config Parameters
Add to `src/config.ts`:
```typescript
export const NODE_GLOW = {
  layersByRisk: { safe: 2, low: 2, medium: 3, high: 4, critical: 5 },
  glowSpread: 0.5,
  breatheSpeed: 0.002,
  breatheAmount: 0.08,
  hoverRadius: 3.0,  // multiplier of node size for label visibility
}
```

## Acceptance Criteria
- [ ] No solid circle around nodes — just icon + glow
- [ ] Icons are large and clearly visible as the primary node element
- [ ] Soft radial glow behind each node, intensity scales with risk
- [ ] Breathing animation with desynchronized phase per node
- [ ] Labels only show on mouse proximity (hover), not always
- [ ] Guardrail shield has multiple staggered rings
- [ ] NODE_GLOW config added to config.ts
- [ ] Performance: 45 nodes with glow at 60fps
- [ ] Dark and light mode both look good
- [ ] `npm run check` passes

## Important Notes
- The `drawNodes()` function signature will change (new mouseWorldX/mouseWorldY params). The caller in `renderer.ts` is being modified by another agent, so document the new signature clearly in a code comment.
- Read `src/rendering/renderer.ts` to understand how `drawNodes` is currently called — but do NOT modify renderer.ts yourself. Just update the function signature and add a comment noting the caller needs to pass mouse world coords.
