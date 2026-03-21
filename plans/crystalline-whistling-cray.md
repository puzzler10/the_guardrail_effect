# Fix Layout Density + Particle Slider + Title

## Context

The zoomed-out view looks sparse and lifeless — too much vertical space between node rows, everything tiny at default zoom. The particle count slider is broken (fixed spawn rate). The piece also needs a title: **"The Guardrail Effect"**.

## Changes

### 1. Add "The Guardrail Effect" title

**a. Persistent on-screen title (`src/ui/controls.ts` or new `src/ui/title.ts`)**
- Create a fixed-position DOM element at top-center of viewport
- Position: `fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 25`
- Style: `JetBrains Mono`, ~20px, uppercase, letter-spacing: 3px
- Color: `var(--accent)` (`#00f0ff`) with subtle `text-shadow` glow
- Semi-transparent, no background box — floats over the canvas
- Add CSS to `src/ui/styles.css` for the title class

**b. Update sound overlay (`src/ui/sound-overlay.ts`)**
- Change `<h1>AI Guardrail Demo</h1>` -> `<h1>The Guardrail Effect</h1>`

**c. Update onboarding (`src/ui/onboarding.ts`)**
- Change `Welcome to the AI Guardrail Demo` -> `Welcome to The Guardrail Effect`

**d. Update HTML title (`index.html`)**
- Change `<title>Agent Swarm - Civic.com</title>` -> `<title>The Guardrail Effect</title>`

**e. Update docs** — rename references in `docs/project.md`, `docs/spec.md` if they say "AI Guardrail Demo" or "Agent Swarm"

### 2. Duplicate nodes for density (`src/simulation/graph.ts`)

In `buildGraph()`, duplicate each connector template ~1x (so ~120 nodes total instead of 59). For each original template:
- Create a copy with suffixed ID: `salesforce-2`, `github-2`, etc.
- Same icon, name, risk level
- Connect duplicates to the original and to a neighbor in the same tier
- Layout algo handles positioning automatically since it uses `index` and `count`

This roughly doubles the visual density without any performance concern (nodes are cheap — just emoji + circle draw calls).

### 3. Compact the flow layout (`src/simulation/graph.ts`)

In `calculateCoordinates()`:
- `CANVAS_WIDTH`: 2000 -> 1200
- `CANVAS_HEIGHT`: 1400 -> 900
- Flow column spacing: `150 + riskIndex * 400` -> `150 + riskIndex * 200`
- `yPadding`: 150 -> 80
- Clustered distance: 450 -> 280
- Ring base radius: 200 -> 120, increment: 150 -> 90

### 4. Denser graph connectivity (`src/simulation/graph.ts`)

In `buildGraph()`, add 1-2 more cross-tier connections per node. Currently each node has ~2 neighbors. Add:
- A second cross-tier link (skip a tier) using deterministic hash of node ID
- A random same-tier link to a non-adjacent node (if tier has 4+ nodes)

### 5. Update camera defaults (`src/rendering/renderer.ts`)

- `DEFAULT_ZOOM`: 0.8 -> 1.2
- Camera center: (1000, 700) -> (600, 450)

### 6. Higher default particle count + fix spawn rate (`src/simulation/simulation.ts`, `src/config.ts`)

- `DEFAULT_CONFIG.particleCount`: 300 -> 700
- Scale spawn rate with deficit so slider is responsive:
```
const deficit = config.particleCount - activeCount
const rampMultiplier = Math.min(20, Math.max(1, Math.ceil(deficit / 50)))
const spawnInterval = 1000 / (PARTICLE.spawnRate * rampMultiplier)
```

### 7. Raise min zoom (`src/config.ts`)

- `UI.zoomMin`: 0.3 -> 0.5

### 8. Update minimap (`src/rendering/minimap.ts`)

- `virtualHeight`: match new canvas height

## Key files
- `src/ui/styles.css` — add title CSS
- `src/ui/controls.ts` or new `src/ui/title.ts` — create title element
- `src/ui/sound-overlay.ts` — update heading text
- `src/ui/onboarding.ts` — update heading text
- `index.html` — update `<title>`
- `src/simulation/graph.ts` — layout compaction
- `src/rendering/renderer.ts` — camera defaults
- `src/simulation/simulation.ts` — spawn rate fix
- `src/rendering/minimap.ts` — virtual dimensions

## Verification

1. `npm run check` passes
2. Title visible at top-center, glowing cyan, matches theme
3. Sound overlay and onboarding say "The Guardrail Effect"
4. At default zoom, nodes visibly larger and closer together
5. Particle slider responsive — reaches target count within ~10 seconds
6. All three layouts (flow, clustered, ring) denser
