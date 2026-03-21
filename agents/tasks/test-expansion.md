# Task: Expand Test Coverage (Underspecified Areas)

## Objective
Implement comprehensive unit tests for `scenarios.ts`, `background.ts`, and `ui/event-log.ts`. Ensure robustness of the simulation core.

## 1. `tests/unit/scenarios.test.ts`
Verify that `buildScenarioGraph` returns the correct number of nodes and connections for all 3 scenarios: `revops`, `devops`, `hr`.
- Test that every connector ID in the scenario exists in `CONNECTOR_LIBRARY`.
- Test that every connection target ID exists within the same scenario.

## 2. `tests/unit/background.test.ts`
Implement basic tests for `initBackground` and `drawBackground`.
- Mock p5's `createGraphics` to ensure buffers are created with expected dimensions.
- Test that `dustParticles` are initialized with the correct count.

## 3. `tests/unit/ui-event-log.test.ts`
Test the `EventLog` UI logic (mocking DOM if necessary or testing the state management part).
- Verify that adding a failure event correctly populates the `listContainer`.
- Verify that events are capped at `UI.eventLogMax`.
- Test that `filterEntries` correctly hides/shows items based on tier.

## 4. `tests/integration/stress.test.ts` (Bonus)
Stress test the simulation with high particle count (e.g. 1000) and verify `tick()` still completes within reasonable time.

## Acceptance Criteria
- [ ] New test files created and passing.
- [ ] `npm run check` passes.
- [ ] 100% coverage for `scenarios.ts`.
- [ ] Significant coverage for UI log logic.
