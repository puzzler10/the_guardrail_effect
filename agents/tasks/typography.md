# Task: Typography & Design Polish

## Objective
Improve overall typography, font choices, and visual design. Reduce text clutter across all UI panels. Make the interface feel more premium and polished — like a high-end data visualization dashboard.

## Files to Modify
- `src/ui/styles.css` — Main changes
- `index.html` — Add Google Fonts import

## DO NOT MODIFY
- `src/simulation/` — never touch simulation code
- `src/rendering/` — other agents are modifying rendering files
- `src/ui/*.ts` — only modify CSS, not TypeScript

## Current State
CSS uses:
- `--font-main: 'Inter', system-ui, -apple-system, sans-serif`
- `--font-mono: 'JetBrains Mono', 'Fira Code', monospace`
- But these fonts aren't actually loaded — it falls back to system-ui
- Text is functional but generic-looking
- Some panels have too much text density

## What to Build

### 1. Load Real Fonts
Add Google Fonts to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### 2. Typography Scale
Establish a clear type hierarchy in CSS:
- **Heading** (panel titles): Inter 600, 14px, uppercase, 1.5px letter-spacing
- **Body** (descriptions): Inter 400, 13px, 1.4 line-height
- **Label** (control labels): Inter 500, 10px, uppercase, 0.8px letter-spacing
- **Value** (stats, numbers): JetBrains Mono 500, 13px
- **Small** (timestamps, secondary): Inter 400, 10px, opacity 0.6

### 3. Reduce Text Clutter
- Tighten padding in panels (24px → 20px)
- Reduce gap between control groups (24px → 18px)
- Make filter buttons more compact
- Reduce event log entry padding
- Stats bar: tighter spacing, smaller labels

### 4. Visual Polish
- Add subtle text-shadow to panel titles: `0 1px 2px rgba(0,0,0,0.3)`
- Improve select/dropdown styling (currently very basic)
- Add hover transitions to all interactive elements (0.15s ease)
- Improve the glassmorphism: slightly more blur, less opacity variation
- Add a subtle top highlight to panels: `border-top: 1px solid rgba(255,255,255,0.05)`
- Refine scrollbar styling

### 5. Dark/Light Mode Consistency
- Ensure font weights render well in both modes
- Light mode should use slightly heavier font weights (400→500 for body) since light-on-dark is naturally thinner
- Check all color variables have appropriate light mode overrides

### 6. Button & Control Refinement
- Buttons: add subtle gradient or highlight on hover
- Toggle switches: slightly larger, smoother animation
- Range sliders: custom thumb styling if possible
- Select dropdowns: better arrow indicator

## Acceptance Criteria
- [ ] Inter and JetBrains Mono load from Google Fonts
- [ ] Clear visual hierarchy: headings, body, labels, values all distinct
- [ ] Reduced padding/spacing — panels feel tighter and more information-dense
- [ ] All interactive elements have smooth hover/focus transitions
- [ ] Dark and light mode both look polished
- [ ] No text clutter — everything has breathing room but isn't wasteful
- [ ] `npm run check` passes
- [ ] No TypeScript files modified (CSS + HTML only)

## Design Reference
Think: Bloomberg Terminal meets Vercel Dashboard. Clean, information-dense, monospace for data, sans-serif for labels, generous use of opacity and subtle borders.
