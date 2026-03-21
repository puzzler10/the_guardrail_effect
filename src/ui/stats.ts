import type { SimulationStats } from '../types';

let statsBar: HTMLElement;

export function initStats(): void {
  statsBar = document.createElement('div');
  statsBar.className = 'stats-bar';
  
  statsBar.innerHTML = `
    <div class="stats-item"><span class="stats-label">Active</span><span class="stats-value" id="stat-active">0</span></div>
    <div class="stats-item"><span class="stats-label">Completed</span><span class="stats-value" id="stat-completed">0</span></div>
    <div class="stats-item"><span class="stats-label">Self-corrected</span><span class="stats-value" id="stat-corrected">0</span></div>
    <div class="stats-item"><span class="stats-label">Failures</span><span class="stats-value" id="stat-failed">0</span></div>
    <div class="stats-item" id="catastrophic-container" style="display: none;">
      <span class="catastrophic-stat">☠ <span id="stat-catastrophic">0</span></span>
    </div>
    <div class="stats-item"><span class="stats-label">Uptime</span><span class="stats-value" id="stat-uptime">00:00</span></div>
  `;
  
  document.body.appendChild(statsBar);
}

export function updateStats(stats: SimulationStats, elapsedMs: number): void {
  updateValue('stat-active', stats.active);
  updateValue('stat-completed', stats.completed);
  updateValue('stat-corrected', stats.selfCorrected);
  updateValue('stat-failed', stats.failed);
  
  const catastrophicContainer = document.getElementById('catastrophic-container');
  if (stats.catastrophic > 0) {
    if (catastrophicContainer) catastrophicContainer.style.display = 'flex';
    updateValue('stat-catastrophic', stats.catastrophic);
  } else if (catastrophicContainer) {
    catastrophicContainer.style.display = 'none';
  }
  
  updateValue('stat-uptime', formatTime(elapsedMs));
}

function updateValue(id: string, value: string | number) {
  const el = document.getElementById(id);
  if (el) el.textContent = value.toString();
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
