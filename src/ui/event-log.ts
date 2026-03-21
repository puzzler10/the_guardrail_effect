import type { FailureEvent, GuardrailEvent, FailureTier } from '../types';
import { UI, COLORS_DARK } from '../config';

let logPanel: HTMLElement;
let listContainer: HTMLElement;

export function initEventLog(): void {
  logPanel = document.createElement('div');
  logPanel.className = 'ui-panel event-log';
  
  const header = document.createElement('div');
  header.className = 'event-log-header';
  header.innerHTML = `<h3>Terminal >_</h3>`;
  
  logPanel.appendChild(header);
  
  listContainer = document.createElement('div');
  listContainer.className = 'event-list';
  logPanel.appendChild(listContainer);
  
  document.body.appendChild(logPanel);
}

export function addFailureEvent(event: FailureEvent): void {
  const entry = document.createElement('div');
  entry.className = 'event-entry';
  entry.dataset.type = `t${event.tier}`;
  
  const tierColor = getTierColor(event.tier);
  
  const time = document.createElement('span');
  time.className = 'event-time';
  time.textContent = `[${formatTime(event.timestamp)}]`;
  
  const node = document.createElement('span');
  node.className = 'event-node';
  node.style.color = tierColor;
  node.textContent = `ERR_T${event.tier} @ ${event.nodeId}:`;
  
  const text = document.createElement('span');
  text.textContent = ` ${event.text}`;
  
  entry.appendChild(time);
  entry.appendChild(node);
  entry.appendChild(text);
  
  listContainer.insertBefore(entry, listContainer.firstChild);
  
  // Cap entries
  while (listContainer.children.length > UI.eventLogMax) {
    listContainer.removeChild(listContainer.lastChild!);
  }
}

export function addGuardrailEvent(event: GuardrailEvent): void {
  const entry = document.createElement('div');
  entry.className = 'event-entry guardrail-entry';
  
  const color = COLORS_DARK.guardrailText;
  
  const time = document.createElement('span');
  time.className = 'event-time';
  time.textContent = `[${formatTime(event.timestamp)}]`;
  
  const node = document.createElement('span');
  node.className = 'event-node';
  node.style.color = color;
  node.textContent = `GUARDRAIL @ ${event.nodeId}:`;
  
  const text = document.createElement('span');
  text.textContent = ` ${event.text}`;
  text.style.color = '#ccc';
  
  entry.appendChild(time);
  entry.appendChild(node);
  entry.appendChild(text);
  
  listContainer.insertBefore(entry, listContainer.firstChild);
  
  // Cap entries
  while (listContainer.children.length > UI.eventLogMax) {
    listContainer.removeChild(listContainer.lastChild!);
  }
}

export function toggleEventLog(): void {
  logPanel.classList.toggle('open');
}

function getTierColor(tier: FailureTier): string {
  switch (tier) {
    case 1: return COLORS_DARK.tier1;
    case 2: return COLORS_DARK.tier2;
    case 3: return COLORS_DARK.tier3;
    case 4: return COLORS_DARK.tier4start; // Using white for T4
    default: return '#fff';
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
