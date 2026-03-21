/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { initEventLog, addFailureEvent, addGuardrailEvent, toggleEventLog } from '../../src/ui/event-log'
import { UI } from '../../src/config'
import type { FailureEvent, GuardrailEvent } from '../../src/types'

describe('UI Event Log', () => {
  beforeEach(() => {
    // Reset the DOM before each test
    document.body.innerHTML = '';
    initEventLog();
  });

  it('should initialize and add the event log panel to the DOM', () => {
    const panel = document.querySelector('.event-log');
    expect(panel).not.toBeNull();
  });

  it('should add a failure event to the log', () => {
    const event: FailureEvent = {
      text: 'Test failure',
      tier: 2,
      nodeId: 'test-node',
      x: 0,
      y: 0,
      timestamp: 12345,
    };
    addFailureEvent(event);
    const entry = document.querySelector('.event-entry') as HTMLElement;
    expect(entry).not.toBeNull();
    expect(entry?.textContent).toContain('Test failure');
    expect(entry?.textContent).toContain('node: test-node');
    expect(entry?.dataset.type).toBe('t2');
  });

  it('should add a guardrail event to the log', () => {
    const event: GuardrailEvent = {
      text: 'Intercepted',
      nodeId: 'test-node-2',
      x: 0,
      y: 0,
      timestamp: 54321,
    };
    addGuardrailEvent(event);
    const entry = document.querySelector('.event-entry') as HTMLElement;
    expect(entry).not.toBeNull();
    expect(entry?.textContent).toContain('Intercepted');
    expect(entry?.textContent).toContain('intercepted at: test-node-2');
    expect(entry?.dataset.type).toBe('guardrail');
  });

  it('should cap the number of events to UI.eventLogMax', () => {
    for (let i = 0; i < UI.eventLogMax + 10; i++) {
      addFailureEvent({ text: `Event ${i}`, tier: 1, nodeId: 'node', x: 0, y: 0, timestamp: i });
    }
    const entries = document.querySelectorAll('.event-entry');
    expect(entries.length).toBe(UI.eventLogMax);
    // The first event added should be gone, the last one should be there
    expect(entries[entries.length - 1].textContent).not.toContain('Event 0');
    expect(entries[0].textContent).toContain(`Event ${UI.eventLogMax + 9}`);
  });

  it('toggleEventLog should open and close the panel', () => {
    const panel = document.querySelector('.event-log');
    expect(panel?.classList.contains('open')).toBe(false);
    toggleEventLog();
    expect(panel?.classList.contains('open')).toBe(true);
    toggleEventLog();
    expect(panel?.classList.contains('open')).toBe(false);
  });
});
