# Visual Quality Review Rubric

Use this rubric when reviewing screenshots of the running application.
Rate each dimension 1-5, then provide an overall assessment and specific action items.

## Dimensions

### 1. Depth & Atmosphere (1-5)
- **1**: Flat solid background, no visual layering, feels like a diagram
- **2**: Basic background color, minimal depth cues
- **3**: Some transparency and layering, hints of atmosphere
- **4**: Clear depth with multiple visual layers, good use of transparency
- **5**: Rich atmospheric depth — vignette, noise textures, layered transparency, feels like you could reach into the screen

### 2. Color Cohesion (1-5)
- **1**: Random/clashing colors, generic or default palette, "AI slop" purple gradients
- **2**: Recognizable palette but inconsistent application
- **3**: Reasonable harmony, colors relate to each other
- **4**: Intentional palette with purposeful accents, risk levels are visually distinct
- **5**: Masterful color — dominant colors with sharp accents, smooth gradients between states, the palette tells the story

### 3. Motion Quality (1-5)
- **1**: Static or jerky, particles teleport between positions
- **2**: Linear interpolation, mechanical feel
- **3**: Smooth but predictable animation, basic easing
- **4**: Organic motion with noise-based variation, particles feel alive
- **5**: Emergent beauty — particles flow like water, effects bloom and decay naturally, nothing feels computed

### 4. Particle & Trail Aesthetics (1-5)
- **1**: Plain dots, no trails, or harsh flat lines
- **2**: Basic trails with uniform opacity
- **3**: Trails with some fade-out, decent particle rendering
- **4**: Gradient trails with alpha fade, width taper, particles glow
- **5**: Gallery-quality trails — smooth Catmull-Rom curves, head-to-tail alpha gradient, width taper, subtle color shift, particles feel luminous

### 5. Node & Effect Polish (1-5)
- **1**: Plain circles, no effects on events
- **2**: Basic colored circles, simple event indicators
- **3**: Pulsing nodes, basic shockwave rings
- **4**: Radial glow halos, multi-ring effects, screen response to events
- **5**: Nodes breathe and pulse with life, effects have debris/afterglow/ripple, catastrophic events feel dramatic and weighty

### 6. Overall "Would Share" Factor (1-5)
- **1**: Looks like a CS homework assignment
- **2**: Functional but forgettable
- **3**: Decent visualization, wouldn't embarrass you
- **4**: Impressive — people would pause and look
- **5**: OpenProcessing/gallery grade — would proudly share, people would ask "how did you make this?"

## Scoring

- **Total < 18**: Needs significant visual work. Create follow-up tasks targeting the lowest-scoring dimensions.
- **Total 18-24**: Good foundation, targeted refinements needed. Focus on dimensions scoring 3 or below.
- **Total 25-30**: OpenProcessing grade. Ship it.

## Assessment Template

```
Depth & Atmosphere:    X/5 — [brief note]
Color Cohesion:        X/5 — [brief note]
Motion Quality:        X/5 — [brief note]
Particle/Trail:        X/5 — [brief note]
Node/Effect Polish:    X/5 — [brief note]
Would Share Factor:    X/5 — [brief note]
---
Total:                 XX/30

Top issues to fix:
1. [specific issue + which dimension]
2. [specific issue + which dimension]
3. [specific issue + which dimension]
```
