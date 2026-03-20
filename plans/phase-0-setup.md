# Phase 0: Project Setup — Implementation Plan

## Goal
Initialize a working Vite + TypeScript project with p5.js rendering a canvas, all tests/checks passing, and shared `types.ts` + `config.ts` ready for parallel module development.

## Steps

### 1. Initialize Vite project
```bash
npm create vite@latest . -- --template vanilla-ts
```
Note: this will scaffold into the existing directory. Keep existing docs/, plans/, AGENTS.md, etc.

### 2. Install dependencies
```bash
npm install p5 tone
npm install -D vitest @playwright/test eslint @types/p5 typescript
```

### 3. Configure package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "vitest run && tsc --noEmit && vite build"
  }
}
```

### 4. Configure vitest in vite.config.ts
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
```

### 5. Create `src/types.ts`

All shared interfaces. See spec section 6.1. Key types:

```typescript
// Node risk levels
type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'

// Failure severity tiers
type FailureTier = 1 | 2 | 3 | 4

// Particle states
type ParticleState = 'spawning' | 'active' | 'recovering' | 'failed' | 'exploded' | 'completed'

// Graph node
interface GraphNode {
  id: string
  name: string
  icon: string
  risk: RiskLevel
  x: number
  y: number
  neighbors: string[]  // adjacency list (supports cycles)
}

// Particle
interface Particle {
  id: number
  state: ParticleState
  currentNodeId: string
  targetNodeId: string
  progress: number  // 0-1 interpolation between nodes
  stepsCompleted: number
  maxSteps: number
  trail: { x: number; y: number }[]
  failureTier?: FailureTier
  failureText?: string
}

// Simulation stats
interface SimulationStats {
  active: number
  completed: number
  selfCorrected: number
  failed: number  // tier 2-3
  catastrophic: number  // tier 4
}

// Model preset
interface ModelPreset {
  name: string
  rates: Record<RiskLevel, number>  // base failure rate per risk level
}

// Failure event
interface FailureEvent {
  text: string
  tier: FailureTier
  nodeId: string
  x: number
  y: number
  timestamp: number
}

// Config (runtime-modifiable)
interface SimulationConfig {
  modelPreset: string
  failureMultiplier: number
  agentSpeed: number
  particleCount: number
  guardrailsEnabled: boolean
  darkMode: boolean
  soundEnabled: boolean
  soundVolume: number
  layout: 'clustered' | 'flow' | 'ring'
}
```

### 6. Create `src/config.ts`

All default values, model presets, failure messages, color palettes. Pull directly from spec sections 2.4, 3.2, 9.1.

### 7. Create `index.html`

Full-screen canvas container, no scroll, dark background.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent Swarm</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0f; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 8. Create `src/main.ts`

Minimal p5.js sketch — dark background, maybe one moving circle to prove it works.

```typescript
import p5 from 'p5'

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(10, 10, 15)
  }

  p.draw = () => {
    p.background(10, 10, 15)
    // Proof of life: spinning circle
    p.fill(0, 240, 255)
    p.noStroke()
    p.ellipse(
      p.width / 2 + Math.cos(p.frameCount * 0.02) * 100,
      p.height / 2 + Math.sin(p.frameCount * 0.02) * 100,
      20
    )
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

new p5(sketch)
```

### 9. Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### 10. Write a smoke test
`tests/unit/config.test.ts` — verify config values are valid (ranges, types). This validates the test infrastructure works.

### 11. Verify everything
```bash
npm run dev      # Canvas visible with spinning circle
npm run check    # Tests pass, types check, build succeeds
```

### 12. Commit
```bash
git add -A
git commit -m "chore: project setup with Vite, p5.js, TypeScript, Vitest"
```

## Verification
- `npm run dev` shows dark canvas with cyan circle
- `npm run check` exits 0
- `npm run build` produces `dist/` directory
- `src/types.ts` exports all interfaces listed above
- `src/config.ts` exports default config, model presets, failure messages, color palettes

## What comes next
After this phase, Phase 1 (simulation core) can begin. All simulation code imports only from `types.ts` and `config.ts`.
