# Particle Swarm City — Specification

## 1. Concept

An interactive visualization showing hundreds of AI agents executing workflows as glowing particles flowing through a network of tool-nodes. The piece makes viscerally clear why AI agent guardrails exist.

**Without guardrails:** particles drift off-path, trigger cascading failures, and cause dramatic visual destruction — databases deleted, secrets leaked, PII exposed.

**With guardrails:** dangerous actions are intercepted. Particles deflect off force fields at danger zones, recover, and continue safely. The contrast is immediate and striking.

**Target audience:** Non-technical. Should be self-explanatory within 10 seconds, invite 2 minutes of exploration.

**Tone:** Part data visualization, part generative art, part horror movie. Beautiful when things work. Alarming when they don't.

**Secondary goal:** Polished enough to share publicly (LinkedIn, portfolio, CV).

---

## 2. Simulation Model

### 2.1 The Workflow Graph

The "city" is a graph of **tool-nodes** connected by **paths**. Each node represents an action an AI agent might take. The graph is **not a DAG** — it contains loops (agents revisit nodes, retry sequences, go in circles).

#### Node Categories (by risk level)

| Category | Nodes | Visual | Base failure rate |
|----------|-------|--------|-------------------|
| **Safe** | Read file, Search web, Parse data, Summarize text, Format output | Small, cool-colored (blue/cyan), gentle pulse | 0.1-0.5% (prompt injection, hallucination, subtle errors) |
| **Low risk** | Send email (internal), Log event, Create ticket, Read DB | Medium, green/teal, moderate pulse | 0.5-2% |
| **Medium risk** | Post to Slack, Update record, Call external API, Write file, Send email (external) | Larger, amber/yellow, noticeable pulse | 2-5% |
| **High risk** | Delete records, Deploy to prod, Modify permissions, Access secrets, Run shell command | Large, orange/red, aggressive pulse, danger aura | 5-15% |
| **Critical** | Drop database, Expose PII externally, Leak API keys, Send to wrong external recipient, Execute arbitrary code | Largest, deep red/magenta, pulsing danger rings | 10-25% |

**Key insight:** Even "safe" nodes have nonzero failure rates. Real agents hallucinate, get prompt-injected, loop, produce subtly wrong outputs. This keeps the simulation honest.

#### Node Rendering

- Each node has a **small icon** (emoji or simple glyph) indicating its type: 📄 Read, 🔍 Search, 💬 Slack, 🗄️ Database, 🚀 Deploy, 🔑 Secrets, etc.
- **Hover** on a node shows: name, risk category, current failure rate, recent events
- **Click** on a node shows a brief popup with event history for that node

#### Graph Structure

- ~30-40 nodes total
- **Multiple paths** — particles take different routes through the graph (representing different workflows)
- **Loops exist** — e.g., Read DB → Process → Check → Read DB (retry loop), or Slack → Read response → Slack (conversation loop)
- Some loops are healthy (retry/polling), some are pathological (infinite loops = failure mode)
- **Preset layouts** (user can switch via dropdown):
  - **Clustered** — nodes grouped by risk category in neighborhoods (default)
  - **Flow** — left-to-right workflow arrangement (entry left, exit right, danger toward bottom)
  - **Ring** — concentric rings by risk level (safe center, danger outside)
- Layouts are just different coordinate assignments — same graph, different positions

### 2.2 Particle Agents

Each particle represents one AI agent executing a multi-step workflow. Think of each particle as a parallel universe — one possible trajectory through tool-space.

#### Particle Lifecycle

1. **Spawn** at a random entry node (workflow begins)
2. **Traverse** 8-20 nodes following weighted random paths
3. At each node: roll against failure probability
4. **Success:** continue to next node, trail stays cool blue/white
5. **Minor failure (Tier 1):** particle wobbles, brief yellow flash, self-corrects (loops back 1-2 nodes)
6. **Moderate failure (Tier 2):** particle turns orange, floating text appears ("wrong Slack channel"), drifts off intended path
7. **Severe failure (Tier 3):** particle turns red, dramatic visual event, text label ("PII LEAKED"), shockwave affects nearby particles
8. **Catastrophic failure (Tier 4):** particle explodes, massive shockwave, screen shake, nearby particles scatter, alarm sound, floating text persists longer ("PRODUCTION DATABASE DELETED")
9. **Complete:** particle fades out gracefully at an exit node

#### Particle Count

- Target: 200-500 active particles at any time (should feel like "a lot")
- Spawn rate: ~10-20 per second
- Each particle lives for 3-8 seconds (traversing its workflow)
- High particle count is essential — the percentages need enough volume to "feel right". With 300 particles active and each visiting ~15 nodes, that's ~4500 node-visits per lifecycle window. At 1% failure rate on medium nodes, you get ~45 failures — enough for steady visual feedback without being overwhelming.

### 2.3 Failure Events (with floating text)

Floating text appears at the failure location in the appropriate color, drifts upward, lingers briefly, and fades. Catastrophic text is larger, lasts longer, and may persist on screen.

#### Severity Tiers

**Tier 1 — Self-correcting (yellow flash, particle wobbles, loops back)**
- "retrying API call..."
- "parsing error, reformatting..."
- "timeout, reconnecting..."
- "wrong format, auto-fixing..."
- "rate limited, backing off..."
- "auth token expired, refreshing..."
- "JSON parse failed, retrying..."
- "connection reset, reconnecting..."
- "hallucinated URL, re-searching..."
- "context window exceeded, truncating..."
- "tool call malformed, retrying..."
- "response too long, summarizing..."
- "search returned no results, broadening..."
- "file not found, checking alternatives..."
- "encoding error, converting..."

**Tier 2 — Minor harm (orange glow, drift off path)**
- "posted to #general instead of #eng"
- "sent duplicate email to client"
- "created 47 duplicate JIRA tickets"
- "overwrote draft document"
- "replied-all to company thread"
- "wrong timezone in meeting invite"
- "attached wrong file to email"
- "updated wrong spreadsheet row"
- "sent message to wrong DM"
- "merged to wrong branch"
- "booked meeting room for wrong date"
- "added wrong person to private channel"
- "set ticket priority to critical (it's minor)"
- "pushed debug logs to production"
- "committed .env to version control"
- "sent test data as real report"
- "CC'd external contractor on internal thread"
- "auto-approved PR without review"

**Tier 3 — Significant damage (red pulse, shockwave)**
- "PII included in API response"
- "customer SSN logged to console"
- "sent internal pricing to competitor"
- "deployed untested code to prod"
- "modified production config"
- "granted admin access to wrong user"
- "shared confidential roadmap externally"
- "exposed internal API endpoint"
- "database migration ran in prod"
- "deleted customer support history"
- "sent patient health data in plain text"
- "ran UPDATE without WHERE clause"
- "disabled rate limiting in production"
- "exposed debug endpoint publicly"
- "overwrote production database backup"

**Tier 4 — Catastrophic (explosion, screen shake, alarm)**
- "PRODUCTION DATABASE DROPPED"
- "API KEYS PUSHED TO PUBLIC REPO"
- "ALL CUSTOMER DATA SENT TO WRONG COMPANY"
- "RECURSIVE LOOP: 50,000 EMAILS SENT"
- "ROOT ACCESS CREDENTIALS LEAKED"
- "ENTIRE S3 BUCKET SET TO PUBLIC"
- "BILLING API CHARGED $47,000"
- "PRODUCTION KUBERNETES CLUSTER DELETED"
- "SENT SALARY DATA TO ALL-COMPANY SLACK"
- "WIPED PRODUCTION ELASTICSEARCH INDEX"
- "EXECUTED rm -rf / ON PROD SERVER"
- "POSTED CUSTOMER CREDIT CARDS TO PASTEBIN"
- "DISABLED ALL AUTHENTICATION IN PROD"
- "ENCRYPTED PROD DB WITH RANDOM KEY (LOST)"
- "AUTO-APPROVED $2M PURCHASE ORDER"

### 2.4 Failure Rate Estimation

Base rates (per-node, adjustable via slider). These are **illustrative estimates** inspired by general model capability benchmarks, tool-use evaluations, and incident reports. Not rigorous benchmarks.

| Model Tier | Safe | Low | Medium | High | Critical |
|------------|------|-----|--------|------|----------|
| **Frontier (Claude Opus / GPT-4.5)** | 0.1% | 0.5% | 1.5% | 3% | 5% |
| **Strong (Claude Sonnet / GPT-4o)** | 0.2% | 1% | 3% | 6% | 10% |
| **Mid-tier (Claude Haiku / GPT-4o-mini)** | 0.5% | 2% | 5% | 10% | 18% |
| **Open-source (Llama 3 / Mistral)** | 0.8% | 4% | 8% | 15% | 25% |
| **Small / Local (Phi-3 / Gemma 2B)** | 1.5% | 6% | 12% | 22% | 35% |

The failure rate multiplier slider (0.1x to 10x) lets users explore the full range regardless of model. At 10x on "Small / Local", even safe nodes fail ~15% of the time — chaotic and dramatic.

### 2.5 Guardrail Mode

When toggled ON, guardrails are **perfect** — no catastrophic events (Tier 4) occur, and Tier 3 events are reduced to near-zero. This simplifies the message: guardrails = safety.

Behavior:
- **Force fields** appear around high-risk and critical nodes (visible as translucent green shields)
- Particles approaching danger zones are **deflected** — they curve away, flash green briefly, and route to a safer path
- A **confirmation gate** appears before critical nodes — particles queue briefly, then are redirected
- **Tier 1-2 still happen** — guardrails don't prevent retries or minor mishaps, just dangerous ones
- **Tier 3 reduced by ~95%** — nearly eliminated
- **Tier 4 reduced to 0%** — completely blocked
- The overall visual shifts from chaotic to orderly — soothing, calm, guided
- The **color temperature** of the whole scene could shift slightly warmer/greener when guardrails are on
- Guardrail interceptions show brief green text

#### Guardrail Intercept Messages

```
"blocked: requires human approval"
"redirected to sandbox environment"
"PII automatically redacted"
"action logged for review"
"rate limit enforced"
"permission escalation denied"
"output filtered: sensitive data removed"
"action queued for batch review"
"dry-run mode: no side effects"
"rollback point created"
"input sanitized: injection blocked"
"scope limited: read-only access granted"
```

---

## 3. Visual Design

### 3.1 Aesthetic

- **Dark mode (default):** Deep navy/black background (#0a0a0f), neon particle trails
- **Light mode (toggle):** Off-white background (#f5f5f0), darker particles and nodes, softer glows
- **Neon particle trails** — cyan/blue for healthy, warm colors for failures
- **Bloom/glow effects** on particles and nodes (WebGL post-processing)
- Nodes rendered as **glowing circles** with pulsing halos and **small icons**
- Paths rendered as **faint dotted lines** or subtle curves (visible but not dominant)
- Overall feel: circuit board meets city at night meets music visualizer

### 3.2 Color Palette (Dark Mode)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep navy black | #0a0a0f |
| Healthy particle | Cool cyan | #00f0ff |
| Healthy trail | Faded cyan | #00f0ff @ 30% opacity |
| Safe node | Soft blue | #4488cc |
| Low-risk node | Teal | #44bb88 |
| Medium-risk node | Amber | #ffaa22 |
| High-risk node | Orange-red | #ff5533 |
| Critical node | Hot magenta | #ff0066 |
| Self-correct (tier 1) | Yellow | #ffee00 |
| Minor failure (tier 2) | Orange | #ff8800 |
| Major failure (tier 3) | Red | #ff2200 |
| Catastrophic (tier 4) | White-hot flash | #ffffff → #ff0066 |
| Guardrail shield | Green translucent | #00ff88 @ 20% |
| Guardrail intercept text | Green | #00ff88 |

### 3.3 Color Palette (Light Mode)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Warm off-white | #f5f5f0 |
| Healthy particle | Deep blue | #2266cc |
| Safe node | Steel blue | #5577aa |
| Critical node | Deep red | #cc2244 |
| Guardrail shield | Green translucent | #22aa66 @ 15% |

(Other colors adjusted for contrast against light background.)

### 3.3 Effects

- **Particle trails:** 20-40 frame trail with exponential fade
- **Node pulse:** sinusoidal radius oscillation, frequency increases with risk level
- **Node icons:** emoji or simple glyph rendered in the center of each node
- **Shockwave:** expanding ring on severe/catastrophic failure, pushes nearby particles physically
- **Screen shake:** subtle camera offset on catastrophic events (2-4 frames)
- **Floating text:** appears at failure location in severity color, drifts upward, fades out over 2-3 seconds. Tier 4 text is larger and persists longer (~4 seconds).
- **Bloom:** WebGL post-processing glow on all bright elements
- **Explosion:** particle burst (20-30 sub-particles) on catastrophic failure
- **Guardrail ambient:** gentle green glow overlay on entire scene when guardrails are active
- **Recovery animation:** particle that self-corrects does a small U-turn loop, trail briefly turns yellow then back to cyan

### 3.4 Camera / Viewport

- **Default view:** fits entire graph on screen (laptop: ~1400x800 effective area)
- **Zoom:** mouse wheel, 0.5x to 4x range
- **Pan:** click and drag on empty space
- **Auto-zoom on catastrophe:** brief zoom-in on catastrophic events (0.3s ease-in, hold 0.8s, 0.3s ease-out)
- **Cinematic Camera Easing (Phase 9):** Responsive camera LERP with snap-to-focus on catastrophic events.
- **Minimap** in corner when zoomed in (small rectangle showing full view with viewport indicator)
- **Persistent Trails Buffer (Phase 9):** Ghostly, world-space persistent trails with SCREEN blending for a luminous effect.
- **Background Atmosphere (Phase 9):** Noise-based undulating color field, decorative dust particles, and screen-space vignette.

---

## 4. Sound Design

Using Tone.js for Web Audio synthesis (no audio files needed).

### 4.1 Ambient Layer

- Soft generative drone/pad — warm and stable when things are calm
- Pitch and dissonance increase as failure rate rises (driven by stats)
- Tempo of subtle rhythmic element matches particle spawn rate
- When guardrails are on: ambient becomes more harmonious, warmer
- When chaos increases: drone gets harsher, more atonal

### 4.2 Event Sounds

| Event | Sound | Character |
|-------|-------|-----------|
| Particle spawn | Tiny high pluck | Barely noticeable individually, creates pleasant texture in aggregate |
| Successful completion | Soft chime | Pleasant, brief, satisfying |
| Tier 1 (self-correct) | Small click/blip | Subtle warning, like a UI notification |
| Tier 2 (minor) | Low buzz/thud | Noticeable, slightly unsettling, a "wrong" feeling |
| Tier 3 (major) | Distorted bass hit + alarm tone | Alarming, cuts through ambient, makes you look |
| Tier 4 (catastrophic) | Impact boom + siren wail + distortion | Impossible to miss, physically uncomfortable, jarring |
| Guardrail intercept | Soft "shield" ping | Reassuring, clean, like a gentle bell |

### 4.3 Sound Aesthetic Direction

Think: Brian Eno ambient meets industrial alarm design. The baseline is meditative and beautiful. Failures introduce dissonance and harsh timbres. The contrast should feel like going from a spa to an emergency room.

### 4.4 Controls

- Master volume slider in controls panel
- Mute toggle button (visible in header bar)
- **Sound starts muted** by default (browser autoplay policy)
- Prominent **"🔊 Enable Sound"** button visible on initial load, dismisses after click

---

## 5. UI / Controls

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [≡]                     AGENT SWARM              [🔊] [📋] [?] │
│                                                              │
│                                                              │
│                                                              │
│                    ┌──────────────────┐                      │
│                    │                  │                       │
│                    │   SIMULATION     │                       │
│                    │     CANVAS       │                       │
│                    │  (full screen)   │                       │
│                    │                  │                       │
│                    └──────────────────┘                      │
│                                                              │
│ ┌─ Stats Bar ───────────────────────────────────────────┐    │
│ │ Active: 342 │ Completed: 1,247 │ Failed: 23 │ ☠ 1    │    │
│ └───────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Header icons:**
- `[≡]` — Opens controls panel (slides in from left)
- `[🔊]` — Sound toggle
- `[📋]` — Event log toggle (slides in from right)
- `[?]` — Help/about overlay

### 5.2 Controls Panel (slides from left)

| Control | Type | Range | Default |
|---------|------|-------|---------|
| Model preset | Dropdown | Frontier / Strong / Mid-tier / Open-source / Small-Local | Frontier |
| Failure rate multiplier | Slider | 0.1x — 10x | 1x |
| Agent speed | Slider | 0.25x — 4x | 1x |
| Particle count | Slider | 50 — 1000 | 300 |
| Guardrails | Toggle switch | OFF / ON | OFF |
| Dark / Light mode | Toggle | Dark / Light | Dark |
| Sound volume | Slider | 0 — 100% | 50% |
| [Reset] button | | | |
| [Pause / Play] button | | | |

### 5.3 Stats Bar (always visible, bottom)

- **Active agents:** current particle count
- **Completed:** total successful completions
- **Self-corrected:** tier 1 recoveries
- **Failures:** tier 2-3 count
- **Catastrophic:** tier 4 count (big red number, skull icon ☠ when > 0)
- **Uptime:** simulated time running

### 5.4 Event Log Panel (slides from right)

- Scrollable feed of recent failure events
- Each entry: timestamp, severity color dot, event text, node name
- Latest at top, auto-scrolls
- Can be filtered by severity tier
- Shows last ~50 events

### 5.5 Help / About Overlay

Modal overlay triggered by [?] button. Contains:
- **What am I looking at?** — Brief explanation of the visualization
- **What are the nodes?** — Each circle is a tool/action an AI agent can take
- **What are the particles?** — Each particle is one AI agent executing a workflow
- **What are the colors?** — Severity legend (blue=safe, yellow=retry, orange=minor, red=severe, white=catastrophic)
- **What are guardrails?** — Explanation of how guardrails intercept dangerous actions
- **Where do the numbers come from?** — Brief note that rates are illustrative estimates based on general model capability research
- **Keyboard shortcuts:** Space (pause), G (guardrails), R (reset), M (mute), ? (help)
- **Credits / link**
- Dismissable by click, Escape, or [?] again

### 5.6 Interactions

- **Hover node:** tooltip with name, icon, risk category, current failure rate
- **Hover particle:** tooltip showing current workflow step and status
- **Click node:** brief popup with recent event history at that node
- **Scroll:** zoom in/out
- **Drag (empty space):** pan the canvas
- **Keyboard:** Space = pause, G = toggle guardrails, R = reset, M = mute, ? = help, L = toggle log, D = toggle dark/light

### 5.7 First-Load Experience

1. Page loads with a brief loading indicator (spinner or progress bar)
2. Canvas appears with particles already flowing (no empty state)
3. Semi-transparent "Enable Sound 🔊" button overlays the center, dismisses on click
4. Help overlay does NOT auto-show (let the visuals speak first)
5. Controls panel starts collapsed

---

## 6. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Rendering** | p5.js in **2D canvas mode** | Text/shapes just work, 500 particles fine on modern hardware, simplest to build. Glow faked via `drawingContext.shadowBlur`. Upgrade to WebGL only if perf demands it. |
| **Sound** | Tone.js | Programmatic synthesis, no audio files, cross-browser. **Scope reduced:** event sounds only, ambient drone is stretch goal. |
| **Build** | Vite | Fast dev, instant HMR, trivial config |
| **Language** | TypeScript | Type safety critical for multi-agent development |
| **Unit Testing** | Vitest | Native Vite integration, fast, TS-native |
| **E2E Testing** | Playwright | **Minimal scope:** page loads, no console errors, buttons don't crash. Canvas pixel testing is too fragile. |
| **UI Controls** | Custom HTML/CSS | Styled sliders, toggles, dropdowns. More polished for non-technical audience than lil-gui. |
| **Deployment** | Netlify | User has existing account |
| **Package manager** | npm | Standard |

### 6.1 Architecture

```
src/
├── main.ts                    # Entry point, p5.js sketch setup
├── simulation/                # Pure logic — NO rendering deps
│   ├── graph.ts               # Workflow graph: nodes, edges, loops, layout
│   ├── particle.ts            # Particle agent: state machine, movement, trail
│   ├── failure.ts             # Failure engine: probabilities, events, tier selection
│   ├── guardrails.ts          # Force field logic: deflection, blocking
│   └── simulation.ts          # Orchestrator: spawning, updating, stats, pause/reset
├── rendering/                 # p5.js rendering layer
│   ├── renderer.ts            # Main render loop, camera (zoom/pan), WebGL
│   ├── node-renderer.ts       # Node circles, pulses, halos, icons
│   ├── particle-renderer.ts   # Particle trails, glow, color states
│   ├── effects.ts             # Shockwaves, explosions, screen shake
│   └── text-overlay.ts        # Floating failure/intercept text
├── sound/                     # Tone.js audio layer
│   ├── sound-engine.ts        # Ambient drone, master controls
│   └── events.ts              # Event-triggered sounds by severity
├── ui/                        # UI chrome
│   ├── controls.ts            # lil-gui panel setup
│   ├── stats.ts               # Stats bar rendering
│   ├── event-log.ts           # Scrollable event log panel
│   └── help.ts                # Help/about overlay
├── config.ts                  # All tuneable constants, model presets
└── types.ts                   # Shared TypeScript types/interfaces
```

### 6.2 Key Design Decisions

1. **Simulation fully decoupled from rendering** — all `simulation/` code is pure TypeScript with no p5.js imports. This enables comprehensive unit testing and lets simulation run headless for Monte Carlo tests.

2. **Fixed timestep simulation** — simulation ticks at 60Hz regardless of frame rate. Rendering interpolates. Deterministic behavior with seeded RNG enables reproducible tests.

3. **Spatial hash** — grid-based spatial partitioning for O(1) particle neighbor queries (shockwave propagation, hover detection). Without this, 500 particles = O(250,000) pair checks per frame.

4. **Object pooling** — pre-allocate particle objects and recycle via a free list. Prevents GC pauses during gameplay.

5. **Trail ring buffer** — fixed-size circular buffer per particle for trail positions. No array resizing.

6. **Configuration-driven** — every magic number lives in `config.ts`. Runtime sliders modify config values. Tests can override config to create specific scenarios.

7. **Graph allows cycles** — adjacency list representation supports loops natively. Particle lifecycle has a max-step limit (20) to prevent infinite traversal.

8. **Mega-Scenario Topologies (Phase 8):** Handcrafted branching workflows for RevOps, DevOps, and HR onboarding, selectable via UI.

9. **Scenic Route Routing (Phase 7-8):** Particles follow deterministic, curved paths to simulate "deliberate" agent behavior.

10. **Non-Repetition Engine (Phase 8):** Session-level failure message tracking ensures high-variety error reporting without immediate repetition.

---

## 7. Performance Budget

| Metric | Target |
|--------|--------|
| Frame rate | 60fps with 500 particles on M1 MacBook Air |
| Particle count | Up to 1000 before visible degradation |
| Memory | < 100MB |
| Initial load | < 2 seconds |
| Bundle size | < 500KB gzip |
| Draw calls | Batched — < 50 per frame |

### 7.1 Performance Strategies

- **WebGL mode** in p5.js — GPU-accelerated
- **Instanced rendering** for particles (same shape, different transforms)
- **Trail ring buffer** — no array resizing or GC
- **Spatial hash** — 50x50 grid for neighbor queries
- **Viewport culling** — skip rendering off-screen particles when zoomed in
- **LOD** — reduce trail length when particle count > 500
- **requestAnimationFrame** — p5.js handles this, simulation caps at 60 ticks/sec

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

All `simulation/` logic tested in pure TypeScript. No browser, no canvas.

```
tests/
├── unit/
│   ├── graph.test.ts
│   ├── particle.test.ts
│   ├── failure.test.ts
│   ├── guardrails.test.ts
│   ├── simulation.test.ts
│   ├── config.test.ts
│   └── text-overlay.test.ts
├── integration/
│   ├── simulation-flow.test.ts
│   ├── failure-distribution.test.ts
│   └── guardrail-effectiveness.test.ts
└── e2e/
    ├── canvas-renders.spec.ts
    ├── controls-work.spec.ts
    ├── zoom-pan.spec.ts
    ├── guardrails-toggle.spec.ts
    └── sound-toggle.spec.ts
```

### 8.2 Unit Test Coverage

**graph.test.ts**
- Graph has 30-40 nodes
- All nodes reachable from at least one entry node
- All nodes can reach at least one exit node
- Nodes have correct risk categories
- Graph contains at least 3 cycles (loops)
- Multiple paths exist between common node pairs
- Force-directed layout produces non-overlapping nodes (min distance check)
- Edge weights are normalized per-node (sum to 1.0)

**particle.test.ts**
- Initializes at entry node with `spawning` state
- State machine transitions: spawning → active → (completed | failed_minor | failed_major | failed_catastrophic | exploded)
- Movement interpolation: position stays in [0, 1] between nodes
- Trail buffer: stores exactly N positions, overwrites oldest
- Max step limit prevents infinite traversal (20 steps)
- Recycle resets all state correctly
- Self-correcting failure: particle loops back and re-enters `active` state

**failure.test.ts**
- Failure probability matches config for each risk level
- Multiplier scales linearly (2x multiplier = 2x probability, capped at 95%)
- 0x multiplier = 0% failure rate
- Tier distribution: given a failure occurs, tier 1 most common, tier 4 rarest
- Text selected from correct tier's message pool
- Each model preset produces different base rates
- All failure messages are non-empty strings

**guardrails.test.ts**
- Force field activates on high-risk and critical nodes only
- Deflection probability ~100% for tier 4 (guardrails are perfect)
- Deflection probability ~95% for tier 3
- Deflected particles route to nearest safe alternative
- Guardrail intercept text selected from correct pool
- Tier 1-2 events unaffected by guardrails
- Safe and low-risk nodes unaffected

**simulation.test.ts**
- Spawn rate: correct particles per second within ±10%
- Active count stays within [minParticles, maxParticles]
- Stats aggregate correctly (active, completed, failed by tier, catastrophic)
- Pause: all particles frozen, no state changes
- Reset: clears all particles, zeros all stats
- Speed multiplier: 2x speed = particles traverse twice as fast

**config.test.ts**
- All config values have valid ranges
- Model presets exist for all 5 tiers
- Slider ranges are valid (min < max)
- Default values are within slider ranges
- Color values are valid hex strings

### 8.3 Integration Tests (Vitest)

**simulation-flow.test.ts**
- Spawn 100 particles, run simulation for 1000 ticks
- All particles eventually complete or fail (no stuck particles)
- Completed particle count + failed count = spawned count
- No particles exist with step count > max steps

**failure-distribution.test.ts**
- Run 10,000 particle lifecycles with seeded RNG
- Aggregate failure counts by tier
- Distribution matches expected rates within ±5% tolerance
- Each model preset produces statistically different failure rates (chi-squared test or simple ratio check)
- Multiplier slider: 2x produces ~2x failures, 0.5x produces ~0.5x failures

**guardrail-effectiveness.test.ts**
- Run 10,000 lifecycles without guardrails: record tier 3 and tier 4 counts
- Run 10,000 lifecycles with guardrails (same seed)
- Tier 4 count with guardrails = 0
- Tier 3 count reduced by ≥ 90%
- Tier 1-2 counts approximately unchanged (within ±10%)

### 8.4 E2E Tests (Playwright)

Automated browser tests to verify the visual application works.

**canvas-renders.spec.ts**
- Page loads without errors
- Canvas element exists and has correct dimensions
- No console errors on load
- Canvas is not blank (pixel sampling — check that not all pixels are same color)

**controls-work.spec.ts**
- Controls panel opens when ≡ button clicked
- Particle count slider changes visible particle count (sample canvas)
- Model dropdown changes (no crash)
- Guardrails toggle changes state (verify via stats or visual change)
- Reset button clears stats to zero
- Pause button stops animation (frame comparison)

**zoom-pan.spec.ts**
- Mouse wheel changes zoom level (canvas content scales)
- Click-drag pans the view (canvas content translates)
- Minimap appears when zoomed in past threshold

**guardrails-toggle.spec.ts**
- Toggle guardrails on: catastrophic count stops increasing over 10 seconds
- Toggle guardrails off: catastrophic events resume within 30 seconds (probabilistic, may need retry)

**sound-toggle.spec.ts**
- Sound button exists and is labeled correctly
- Click sound button: no crash (can't easily test audio in headless, just verify no errors)

### 8.5 Automated Check Script (`npm run check`)

```bash
vitest run                  # Unit + integration tests
npx playwright test         # E2E tests (headless)
tsc --noEmit                # Type checking
eslint src/ tests/          # Linting
vite build                  # Build succeeds
```

All must pass for a change to be considered valid.

---

## 9. Interaction Flow (User Journey)

### 9.1 First 10 seconds

1. Page loads — brief spinner, then dark canvas fills the screen
2. Particles begin spawning and flowing through glowing nodes
3. Title "AGENT SWARM" fades in subtly at top
4. "🔊 Enable Sound" button visible in center overlay
5. Occasional yellow wobble (tier 1) — adds life without alarm
6. User thinks: "this is beautiful, what am I looking at?"

### 9.2 Next 30 seconds

7. First orange event: "posted to #general instead of #eng" floats up in orange text
8. A couple more orange texts drift by
9. A red shockwave hits — "PII included in API response"
10. User notices stats bar: "Failures: 7, Catastrophic: 0"
11. User thinks: "oh, things are going wrong"
12. User hovers over a node, sees its name and risk level

### 9.3 First catastrophe (~20-40 seconds in)

13. BOOM — explosion, screen shake, alarm (if sound enabled)
14. "PRODUCTION DATABASE DROPPED" in large white text, persists
15. Nearby particles scatter chaotically
16. Stats bar: "☠ 1" in bright red
17. User thinks: "that's terrifying"
18. (This should happen within the first minute — tune spawn rate and failure rates to ensure it)

### 9.4 Exploration (1-2 minutes)

19. User clicks [≡], opens controls
20. Cranks failure rate to 5x — chaos, explosions everywhere
21. Switches model to "Small / Local" — even more chaos
22. Discovers guardrails toggle, turns it ON
23. Green shields appear, particles deflect, "blocked: requires approval" in green
24. Catastrophic count stops climbing. Scene becomes calm, orderly.
25. User toggles guardrails off — chaos returns instantly
26. User opens [?] help to understand what they're seeing
27. User thinks: "I get it. You need these guardrails."

---

## 10. Deployment

### 10.1 Build & Deploy

```bash
npm run build    # Vite builds to dist/
# Deploy dist/ to Netlify (user has account)
```

### 10.2 URL Structure

- Single page application, no routing
- Query params for presets: `?model=frontier&guardrails=on&rate=2`
- Shareable URLs with embedded state

### 10.3 Netlify Config

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

---

## 11. Parallel Development Strategy

### 11.1 Module Boundaries for Worktrees

The architecture enables parallel development via git worktrees. Each module has clean interfaces:

| Worktree / Branch | Module | Dependencies | Interface |
|-------------------|--------|-------------|-----------|
| `feat/simulation-core` | `simulation/*` | `types.ts`, `config.ts` | Exports `Simulation` class with `tick()`, `getParticles()`, `getStats()`, `reset()`, `toggleGuardrails()` |
| `feat/rendering` | `rendering/*` | `types.ts`, `config.ts`, simulation interfaces | Consumes particle/node state arrays, renders them |
| `feat/sound` | `sound/*` | `types.ts`, `config.ts` | Consumes event stream, produces audio |
| `feat/ui` | `ui/*`, `index.html` | `types.ts`, `config.ts` | Reads/writes config values, displays stats |
| `feat/e2e-tests` | `tests/e2e/*` | Full app | Tests against running dev server |

### 11.2 Merge Order

1. `types.ts` + `config.ts` first (shared foundation)
2. `simulation/*` (pure logic, fully testable alone)
3. `rendering/*` + `sound/*` (can merge in parallel, both depend on simulation)
4. `ui/*` (depends on rendering being present)
5. `main.ts` integration (wires everything together)
6. `e2e tests` last (needs full app)

### 11.3 Shared Contract (`types.ts`)

All modules agree on these interfaces. `types.ts` is created first and not modified without coordination.

---

## 12. Open Questions / Future Ideas

- **Mobile support:** Touch gestures for zoom/pan, lower particle count. Not for hackathon.
- **Tree visualization (Phase 2):** Conversation trees growing, complementary to swarm view.
- **Layout toggle:** Let user switch between force-directed layouts (circular, hierarchical, random). Nice-to-have if force-directed is already working.
- **Portfolio mode:** Cleaner branding, custom domain, longer description for CV/LinkedIn sharing. Post-hackathon.
