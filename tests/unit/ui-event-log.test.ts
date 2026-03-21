/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { initEventLog, addFailureEvent, addGuardrailEvent, toggleEventLog } from '../../src/ui/event-log';
import type { FailureEvent, GuardrailEvent } from '../../src/types';
import { UI } from '../../src/config';

describe('UI Event Log', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    initEventLog();
  });

  it('should initialize the event log panel', () => {
    const panel = document.querySelector('.event-log');
    expect(panel).not.toBeNull();
    const list = document.querySelector('.event-list');
    expect(list).not.toBeNull();
  });

  it('should add a failure event to the log', () => {
    const event: FailureEvent = {
      text: 'Test failure',
      tier: 2,
      nodeId: 'test-node',
      x: 0,
      y: 0,
      timestamp: 12000, // 00:12
    };

    addFailureEvent(event);

    const entry = document.querySelector('.event-entry') as HTMLElement;
    expect(entry).not.toBeNull();
    expect(entry?.textContent).toContain('Test failure');
    expect(entry?.textContent).toContain('ERR_T2 @ test-node:');
    expect(entry?.dataset.type).toBe('t2');
  });

  it('should add a guardrail event to the log', () => {
    const event: GuardrailEvent = {
      text: 'Intercepted',
      nodeId: 'test-node-2',
      x: 0,
      y: 0,
      timestamp: 54000,
    };

    addGuardrailEvent(event);

    const entry = document.querySelector('.event-entry') as HTMLElement;
    expect(entry).not.toBeNull();
    expect(entry?.textContent).toContain('Intercepted');
    expect(entry?.textContent).toContain('GUARDRAIL @ test-node-2:');
  });

  it('should cap the number of events to UI.eventLogMax', () => {
    for (let i = 0; i < UI.eventLogMax + 10; i++) {
      addFailureEvent({ text: `Event ${i}`, tier: 1, nodeId: 'node', x: 0, y: 0, timestamp: i });
    }

    const entries = document.querySelectorAll('.event-entry');
    expect(entries.length).toBe(UI.eventLogMax);
  });

  it('should toggle panel visibility', () => {
    const panel = document.querySelector('.event-log') as HTMLElement;
    
    expect(panel.classList.contains('open')).toBe(false);
    
    toggleEventLog();
    expect(panel.classList.contains('open')).toBe(true);
    
    toggleEventLog();
    expect(panel.classList.contains('open')).toBe(false);
  });
});
