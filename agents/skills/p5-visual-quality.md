# p5.js Visual Quality Guide

This is a reference for creating OpenProcessing-grade generative art with p5.js in 2D Canvas mode. Apply these techniques to make the visualization feel alive, atmospheric, and gallery-worthy.

## Philosophy

Beauty emerges from the algorithm's execution. Every parameter should feel meticulously tuned. The goal is controlled chaos — complex emergent behavior from simple, well-crafted rules. The final result should look like it took countless hours of refinement by a master of computational aesthetics.

## Trail Rendering

**Current state**: Trails are flat polylines with fixed alpha. This is the biggest visual upgrade opportunity.

### Alpha Gradient (Head-to-Tail Fade)
Draw trail as multiple segments with decreasing opacity:
```javascript
for (let i = 1; i < trail.length; i++) {
  const alpha = (i / trail.length) * 180; // 0 at tail, 180 at head
  const c = p.color(colors.particleHealthy);
  c.setAlpha(alpha);
  p.stroke(c);
  p.strokeWeight(2);
  p.line(trail[i-1].x, trail[i-1].y, trail[i].x, trail[i].y);
}
```

### Width Taper
Thin at tail, thick at head:
```javascript
const weight = 1 + (i / trail.length) * 3; // 1px at tail, 4px at head
p.strokeWeight(weight);
```

### Smooth Curves (Catmull-Rom Splines)
Replace `vertex()` with `curveVertex()`:
```javascript
p.beginShape();
// Catmull-Rom needs the first and last point repeated
p.curveVertex(trail[0].x, trail[0].y);
for (const pt of trail) {
  p.curveVertex(pt.x, pt.y);
}
p.curveVertex(trail[trail.length-1].x, trail[trail.length-1].y);
p.endShape();
```

### Persistent Trail Buffer
For a ghostly, long-lasting trail effect:
```javascript
// In setup:
let trailBuffer = p.createGraphics(p.width, p.height);

// In draw:
trailBuffer.background(0, 0, 0, 10); // Slow fade (alpha 10 out of 255)
// Draw current particle positions to trailBuffer
trailBuffer.fill(255);
trailBuffer.ellipse(pos.x, pos.y, 4);

// Draw buffer under everything
p.image(trailBuffer, 0, 0);
```

## Glow Simulation

p5.js 2D canvas doesn't have shaders, but you can simulate glow:

### Concentric Circles
```javascript
function drawGlow(p, x, y, radius, color, layers = 4) {
  p.noStroke();
  for (let i = layers; i > 0; i--) {
    const c = p.color(color);
    c.setAlpha(30 / i); // Outer = more transparent
    p.fill(c);
    p.ellipse(x, y, radius * (1 + i * 0.5));
  }
}
```

### Canvas Shadow API (Use Sparingly - Expensive)
```javascript
// Only for nodes, NOT per-particle
const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
ctx.shadowBlur = 20;
ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
p.ellipse(x, y, 30);
ctx.shadowBlur = 0; // Reset!
```

## Color Mastery

### HSB Mode for Hue Manipulation
```javascript
p.colorMode(p.HSB, 360, 100, 100, 100);
// Now hue is 0-360, saturation 0-100, brightness 0-100, alpha 0-100
const warm = p.color(20, 80, 90);  // Warm orange
const cool = p.color(200, 60, 70); // Cool blue
```

### Smooth Color Transitions
```javascript
const blend = p.lerpColor(colorA, colorB, progress); // progress 0.0 to 1.0
```

### Risk-Based Color Derivation
Derive all colors from a small base palette. Risk levels should form a clear gradient:
- Safe: cool blues/teals
- Medium: warm ambers
- Critical: hot magentas/whites

Never use random RGB. Every color should relate to the palette.

## Organic Motion

### Noise-Based Movement
```javascript
p.noiseDetail(4, 0.5); // 4 octaves, 0.5 falloff
const angle = p.noise(x * 0.01, y * 0.01, p.frameCount * 0.005) * p.TWO_PI * 2;
const dx = Math.cos(angle) * speed;
const dy = Math.sin(angle) * speed;
```

### Breathing/Pulsing
```javascript
// Smooth oscillation with offset per-node to avoid synchronization
const pulse = 1 + Math.sin(p.millis() * 0.003 + nodeIndex * 0.5) * 0.15;
const displayRadius = baseRadius * pulse;
```

### Exponential Easing (Not Linear)
```javascript
// For fade-outs, use exponential curve
const t = elapsed / duration;
const alpha = 255 * Math.pow(1 - t, 2); // Quadratic ease-out
// Or: Math.pow(1 - t, 3) for cubic (slower start to fade)
```

## Atmosphere & Background

### Noise-Based Gradient Field
```javascript
function drawBackgroundField(p, colors) {
  p.loadPixels();
  for (let x = 0; x < p.width; x += 4) {
    for (let y = 0; y < p.height; y += 4) {
      const n = p.noise(x * 0.005, y * 0.005, p.frameCount * 0.001);
      const c = p.lerpColor(p.color(colors.background), p.color(colors.backgroundAccent), n * 0.3);
      // Set pixel block
    }
  }
  p.updatePixels();
}
```
Note: pixel manipulation is expensive. Use a buffer and update infrequently, or use large step sizes.

### Vignette Effect
```javascript
function drawVignette(p) {
  // Radial gradient from transparent center to dark edges
  const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
  const gradient = ctx.createRadialGradient(
    p.width/2, p.height/2, p.width * 0.3,  // Inner circle
    p.width/2, p.height/2, p.width * 0.7    // Outer circle
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, p.width, p.height);
}
```

### Depth Layering Order
Draw in this order for proper depth:
1. Background gradient/noise field
2. Vignette overlay
3. Edges/connections (if any)
4. Nodes (with glow)
5. Particles + trails
6. Effects (shockwaves, explosions)
7. Floating text
8. UI elements (minimap, stats)

## Performance Rules

- **Batch similar draws**: All trails together, then all dots, then all glows
- **Cache `p.color()` objects**: Create once outside the loop, reuse
- **Avoid per-particle `push()`/`pop()`**: Set state once per batch
- **`noStroke()` when filling only**, `noFill()` when stroking only
- **Minimize state changes**: Group draws by fill/stroke settings
- **Use `createGraphics()` buffers** for expensive static-ish elements (background, vignette)
- **Target**: 60fps with 300+ particles. Profile with `p.frameRate()` display

## What Makes It "OpenProcessing Grade"

1. **Emergent complexity**: Simple particle rules create visually complex patterns
2. **Organic feel**: Nothing moves linearly — noise, sine, easing everywhere
3. **Intentional color**: Every hue relates to the palette, gradients between states
4. **Depth**: Multiple transparency layers create visual richness
5. **Polish**: No harsh edges, no popping, no visual glitches
6. **The screenshot test**: A single frame should look interesting enough to share
7. **Craftsmanship**: It should feel like someone spent a long time tuning every parameter
