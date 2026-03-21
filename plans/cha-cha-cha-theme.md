# Plan: "Cha Cha Cha" Dynamic Visual Theme

## Objective
Implement a dynamic, music-video-inspired visual theme based on Käärijä's "Cha Cha Cha", transitioning between a tense, edgy "angry storm" state (guardrails OFF) and a relaxed, rolling "rainbow" state (guardrails ON).

## Background & Motivation
The app needs to communicate the state of the simulation's guardrails intuitively and viscerally. The "Cha Cha Cha" aesthetic provides a perfect metaphor:
- **Guardrails OFF**: Tense, dark, neon, high-contrast, erratic. White-knuckling the experience.
- **Guardrails ON**: Relaxed, colorful, flowing, chill. A gentle, rolling rainbow vibe.

The implementation will strictly follow the project's `aesthetic-criteria.md` and `p5-visual-quality.md` guidelines, ensuring a professional, non-amateur, "OpenProcessing-grade" aesthetic.

## Key Files & Context
- `src/config.ts`: Define the color palettes for both states.
- `src/rendering/background.ts`: Implement the dynamic background rendering.
- `src/rendering/effects.ts`: Add the red/orange flash effects for the tense state.
- `docs/tasks.md`: This plan should be appended as a new task once approved.

## Proposed Solution

### State 1: Guardrails OFF (The "Angry Storm")
- **Palette**: OLED-style deep blacks/dark greys, with sharp neon green and harsh red/orange accents.
- **Motion**: Erratic, sharp movements using high-frequency/high-amplitude Perlin noise.
- **Atmosphere**: A high-contrast, tense vignette.
- **Effects**: Sudden bright red or orange canvas flashes (simulating lightning or alarms) triggered by negative events or high risk, utilizing a sharp attack and exponential fade-out.

### State 2: Guardrails ON (The "Rolling Rainbow")
- **Palette**: Dynamic, harmonious HSB spectrum (soft rainbow hues).
- **Motion**: Smooth, flowing, gentle sine-wave or low-frequency noise creating a "breathing" or "rolling" effect.
- **Atmosphere**: Low-contrast, soft easing, washed with gentle layered transparencies.
- **Effects**: Smooth color transitions (`p.lerpColor`) with no harsh pops.

## Implementation Steps

1. **Palette Configuration (`src/config.ts`)**:
   - Add new palette objects for `theme.storm` and `theme.rainbow`.
   - Ensure colors are defined to easily map to `p.colorMode(p.HSB)`.

2. **Dynamic Background Engine (`src/rendering/background.ts`)**:
   - Create a background field using `createGraphics` buffers or optimized drawing.
   - Read the current simulation state (guardrails on/off).
   - If OFF: Render the dark noise field.
   - If ON: Render the rolling rainbow gradients.
   - Implement smooth transition logic (e.g., lerping alpha between the two background buffers) when the state toggles.

3. **Storm Flash Effects (`src/rendering/effects.ts`)**:
   - Add a `drawStormFlash(p, eventSeverity)` function.
   - Use canvas `fill()` with a red/orange color and an alpha calculated via exponential easing (`Math.pow(1 - t, 3)`) to create the jarring visual impact.

4. **Task Management**:
   - Add this specification as a new task in `docs/tasks.md` so that a subsequent agent (running via `./scripts/agent-dispatch.sh` for rendering) can implement it.

## Verification & Testing
- Run `npm run check` to ensure all TypeScript and linting rules are satisfied.
- Manually toggle guardrails in the UI and observe the background transition.
- Trigger negative simulation events with guardrails off and verify the red flash effect looks sharp and professional.
- Take screenshots to evaluate against `agents/quality-rubric.md`.
