# The Guardrail Effect (Agent Swarm Simulator)

A high-fidelity p5.js + Tone.js visualization of autonomous AI agent swarms and the cascading failure risks of interconnected agentic workflows. Built for the Encode Hackathon.

![Screenshot](https://res.cloudinary.com/dp9h4v8as/image/upload/v1711000000/guardrail-effect.png)

## 🌐 [Live Demo](https://the-guardrail-effect.netlify.app/)

## 🚀 Concept
Modern AI systems aren't just single LLMs; they are **agentic swarms** orchestrating complex workflows across dozens of platforms (CRM, DevOps, HR, Finance). When an agent hallucinates, fails, or is compromised, the impact can cascade across the entire network.

This simulator visualizes:
- **Luminous Agents**: Each particle is a distinct agent with its own trajectory and "identity."
- **Connector Ecosystem**: 40+ connectors (Salesforce, GitHub, AWS, Stripe, etc.) with specific risk profiles.
- **Cascading Failures**: 4 tiers of severity — from minor hallucinations to catastrophic data leaks.
- **The Guardrail Effect**: Toggleable safety layers that intercept failures before they spiral.

## ✨ Visuals & Atmosphere
- **OpenProcessing-Grade Aesthetics**: Luminous comet trails, ghostly persistence buffers, and noise-based atmospheric backgrounds.
- **Cinematic Easing**: A responsive camera that "snaps" to focus on critical incidents.
- **Dynamic Theming**: Transitions between a tense "Angry Storm" (Guardrails OFF) and a calm "Vivid Rainbow" (Guardrails ON).
- **Audio Feedback**: Generative "data center" drone and event-triggered chimes/alerts via Tone.js.

## 🛠️ Tech Stack
- **p5.js** (WebGL mode) for generative rendering.
- **Tone.js** for interactive sound synthesis.
- **Vite + TypeScript** for build and type safety.
- **Vitest** for unit and integration tests.
- **Playwright** for E2E testing and screenshots.
- **lil-gui** for real-time simulation controls.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/puzzler10/the_guardrail_effect.git
cd the_guardrail_effect
npm install
```

### Development
```bash
npm run dev
```

### Testing & Quality Check
```bash
npm run test    # Run unit/integration tests
npm run check   # Full suite: test + tsc + eslint + build
```

## 🏗️ Architecture
The project follows a strict **Simulation / Rendering Split**:
- `src/simulation/`: Pure TypeScript logic (graph, particles, failures). No browser/p5/Tone dependencies. Fully unit-testable.
- `src/rendering/`: p5.js drawing code (nodes, particles, effects).
- `src/sound/`: Tone.js audio engine.
- `src/ui/`: DOM-based controls and terminal log.

## 🛡️ License
MIT

---
*Created with 💙 by Tom Roth and the Agentic Swarm for the Encode Hackathon.*
