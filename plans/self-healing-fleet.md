# Plan: Pivot to "waiting for humans" — an agent fleet and its decision bottleneck

Status: DRAFT v2 — awaiting answers on open questions (see bottom)

## Concept

Based on Spawn's "fleet" write-up. A company run by a fleet of agents that work on
real products. Agents constantly hit **decisions of taste** ("add this setting?",
"is this delightful?"). Those decisions either wait for **the human** (slow, sleeps,
almost always right) or go to **judges** — AI approximations of the human (instant,
right most of the time, sometimes wrong). Spawn's real numbers: judges decided 64%,
sent back 19%, held 16% for a human; the CEO personally decided 27 times in 8 days.

The piece shows: work piling up around a human bottleneck; judges releasing the flow;
wrong calls leaving scars that the fleet notices and repairs.

No switch. The piece plays as a looping sequence of acts with one caption each.

## World

- **Products** (3 clusters, petals around the centre). Each product has parts of three kinds:
  - code (e.g. renderer, netcode, database, auth)
  - customer-facing (e.g. signup, checkout, support chat, onboarding)
  - ops (deploy, tests, monitoring, billing)
- **Centre:** the Human (single bright node) ringed by 3 Judges.
- **Agents:** particles doing work, travelling between parts of their product.

## Simulation rules (pure TS, `src/simulation/`)

- Worker arriving at a part: chance `questionRate` it needs a decision → travels to the centre.
- Judge (when active): after ~0.3s → decide 64% / send back 19% (agent returns, retries
  later) / escalate 16% to the human queue. Judge accuracy ~92%.
- Human: one decision per `humanDecisionMs`; awake/asleep cycle; accuracy ~97%. Queue is FIFO.
- Wrong decision: change ships with a latent defect → after a delay the part **scars**
  (dark) → monitoring spawns a **repair burst** (~5 short-lived helper agents) → part heals
  with a rainbow bloom.
- Health (drives rainbow↔storm) = mix of fraction of agents not waiting + fraction of parts unscarred.

## Acts (loop, ~40s each)

1. **"Every decision waits for a human."** Judges off. Human sleeps partway → the queue
   swells into a vortex around the centre, parts starve and dim, storm rolls in.
2. **"Judges that think like you."** Judges appear; the queue drains; rainbow returns.
   Occasional wrong calls scar a part; repair bursts heal it.
3. **"No human at all."** Judges must also decide the questions they'd have held, at much
   lower accuracy → scars arrive faster than repairs; colour drains.
   End card: "In 8 days, Spawn's CEO decided 27 times."

## Steps (tests first in each; `npm run check` after each)

1. **Products + parts data/graph.** Test: each product builds, all parts reachable,
   all three kinds present, layout in bounds. Replace connector data in `config.ts`/`scenarios.ts`.
2. **Decision pipeline.** Test (unit + Monte Carlo): judge split ≈ 64/19/16; human
   throughput capped; asleep → no decisions; queue grows when judges off; FIFO order.
3. **Defects + repair.** Test: wrong call → scar after delay; scar → burst of N repair
   agents; heal after repairers arrive; accuracy rates match config statistically.
4. **Act director.** Test: timeline transitions, per-act config, loops.
5. **Remove old:** guardrails, sound (`src/sound/`, Tone.js), unused controls; update/delete tests.
6. **Rendering:** part glyphs (replace emoji), human + judges, queue vortex, scars,
   repair sparks, heal bloom, health-driven background, captions.
   Verify: Playwright screenshots per act, judged against `agents/quality-rubric.md`.
7. **UI + e2e:** captions, stats (decided by judges / by human / wrong / waiting),
   help text, e2e spec updated and run.
8. **Ship:** README, docs, push → Netlify; confirm live bundle matches build.

## Open questions

- Acts (recommended) vs. steady state vs. a single "how much do judges decide" slider?
- Which 3 products?
- Replace emoji with abstract glyphs?
- Name (TBC).
