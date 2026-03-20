import type { FailureEvent, GuardrailEvent, FailureTier } from '../types';
import { UI, COLORS_DARK } from '../config';

let logPanel: HTMLElement;
let listContainer: HTMLElement;
let currentFilter: string = 'all';

export function initEventLog(): void {
  logPanel = document.createElement('div');
  logPanel.className = 'ui-panel event-log';
  
  const header = document.createElement('div');
  header.className = 'event-log-header';
  header.innerHTML = `<h3>Event Log</h3>`;
  
  const filters = document.createElement('div');
  filters.className = 'event-filters';
  
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 't1', label: 'T1' },
    { id: 't2', label: 'T2' },
    { id: 't3', label: 'T3' },
    { id: 't4', label: 'T4' },
    { id: 'guardrail', label: 'Guard' }
  ];
  
  filterOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (opt.id === 'all' ? ' active' : '');
    btn.textContent = opt.label;
    btn.onclick = () => {
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = opt.id;
      filterEntries();
    };
    filters.appendChild(btn);
  });
  
  header.appendChild(filters);
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
  entry.style.borderLeftColor = tierColor;
  
  const dot = document.createElement('span');
  dot.className = 'event-dot';
  dot.style.backgroundColor = tierColor;
  
  const time = document.createElement('span');
  time.className = 'event-time';
  time.textContent = `+${formatTime(event.timestamp)}`;
  
  const text = document.createElement('span');
  text.textContent = event.text;
  
  const node = document.createElement('span');
  node.className = 'event-node';
  node.textContent = `node: ${event.nodeId}`;
  
  entry.appendChild(dot);
  entry.appendChild(time);
  entry.appendChild(text);
  entry.appendChild(node);
  
  listContainer.insertBefore(entry, listContainer.firstChild);
  
  // Cap entries
  while (listContainer.children.length > UI.eventLogMax) {
    listContainer.removeChild(listContainer.lastChild!);
  }
  
  filterEntries();
}

export function addGuardrailEvent(event: GuardrailEvent): void {
  const entry = document.createElement('div');
  entry.className = 'event-entry';
  entry.dataset.type = 'guardrail';
  
  const color = COLORS_DARK.guardrailText;
  entry.style.borderLeftColor = color;
  
  const dot = document.createElement('span');
  dot.className = 'event-dot';
  dot.style.backgroundColor = color;
  
  const time = document.createElement('span');
  time.className = 'event-time';
  time.textContent = `+${formatTime(event.timestamp)}`;
  
  const text = document.createElement('span');
  text.textContent = event.text;
  text.style.color = color;
  
  const node = document.createElement('span');
  node.className = 'event-node';
  node.textContent = `intercepted at: ${event.nodeId}`;
  
  entry.appendChild(dot);
  entry.appendChild(time);
  entry.appendChild(text);
  entry.appendChild(node);
  
  listContainer.insertBefore(entry, listContainer.firstChild);
  
  // Cap entries
  while (listContainer.children.length > UI.eventLogMax) {
    listContainer.removeChild(listContainer.lastChild!);
  }
  
  filterEntries();
}

export function toggleEventLog(): void {
  logPanel.classList.toggle('open');
}

function filterEntries() {
  const entries = listContainer.querySelectorAll('.event-entry');
  entries.forEach(entry => {
    const el = entry as HTMLElement;
    if (currentFilter === 'all' || el.dataset.type === currentFilter) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
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
