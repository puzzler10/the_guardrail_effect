import type { SimulationConfig, LayoutPreset } from '../types';
import { UI, SCENARIOS } from '../config';
import './styles.css';

export interface ControlsCallbacks {
  onConfigChange(patch: Partial<SimulationConfig>): void;
  onReset(): void;
  onPause(): void;
  onResume(): void;
  onToggleHelp(): void;
  onToggleSound(): void;
}

let panel: HTMLElement;
let toggleBtn: HTMLButtonElement;
let soundBtn: HTMLButtonElement;
let paused = false;

export function initControls(callbacks: ControlsCallbacks): void {
  // Toggle button (hamburger)
  toggleBtn = document.createElement('button');
  toggleBtn.className = 'controls-toggle';
  toggleBtn.innerHTML = '≡';
  toggleBtn.setAttribute('aria-label', 'Toggle controls');
  toggleBtn.onclick = () => panel.classList.toggle('open');
  document.body.appendChild(toggleBtn);

  // Top-right icon buttons: sound + help
  const topRight = document.createElement('div');
  topRight.className = 'top-right-btns';

  soundBtn = document.createElement('button');
  soundBtn.className = 'icon-btn';
  soundBtn.innerHTML = '🔇';
  soundBtn.setAttribute('aria-label', 'Toggle sound');
  soundBtn.onclick = () => callbacks.onToggleSound();
  topRight.appendChild(soundBtn);

  const helpBtn = document.createElement('button');
  helpBtn.className = 'icon-btn';
  helpBtn.innerHTML = '?';
  helpBtn.setAttribute('aria-label', 'Help');
  helpBtn.onclick = () => callbacks.onToggleHelp();
  topRight.appendChild(helpBtn);

  document.body.appendChild(topRight);

  // Panel
  panel = document.createElement('div');
  panel.className = 'ui-panel controls-panel';

  // Header row with title + pause/reset
  const header = document.createElement('div');
  header.className = 'panel-header';
  const title = document.createElement('span');
  title.className = 'panel-title';
  title.textContent = 'Controls';

  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'icon-btn small';
  pauseBtn.id = 'pause-btn';
  pauseBtn.title = 'Pause / Resume (Space)';
  pauseBtn.innerHTML = '⏸';
  pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerHTML = paused ? '▶' : '⏸';
    if (paused) callbacks.onPause();
    else callbacks.onResume();
  };

  const resetBtn = document.createElement('button');
  resetBtn.className = 'icon-btn small';
  resetBtn.title = 'Reset simulation (R)';
  resetBtn.innerHTML = '↺';
  resetBtn.onclick = () => callbacks.onReset();

  header.appendChild(title);
  header.appendChild(pauseBtn);
  header.appendChild(resetBtn);
  panel.appendChild(header);

  // Section: Simulation
  createSection('Simulation', () => {
    createDropdown('Scenario', SCENARIOS.map(s => ({ id: s.id, name: s.name })),
      (val) => callbacks.onConfigChange({ scenario: val }), 'scenario-select');
    createSlider('Failure Rate', UI.failureMultiplierMin, UI.failureMultiplierMax, 0.01,
      (val) => callbacks.onConfigChange({ failureMultiplier: val }),
      (val) => `${val.toFixed(2)}x`, 'failure-multiplier');
    createSlider('Agent Speed', UI.agentSpeedMin, UI.agentSpeedMax, 0.25,
      (val) => callbacks.onConfigChange({ agentSpeed: val }),
      (val) => `${val.toFixed(2)}x`, 'agent-speed');
    createSlider('Agent Count', UI.particleCountMin, UI.particleCountMax, 50,
      (val) => callbacks.onConfigChange({ particleCount: Math.round(val) }),
      (val) => Math.round(val).toString(), 'particle-count');
  });

  // Section: Display
  createSection('Display', () => {
    createDropdown('Layout', [
      { id: 'spiral', name: 'Spiral' },
      { id: 'flow', name: 'Flow' },
      { id: 'ring', name: 'Ring' },
    ], (val) => callbacks.onConfigChange({ layout: val as LayoutPreset }), 'layout-preset');
    createToggle('Guardrails', (val) => callbacks.onConfigChange({ guardrailsEnabled: val }),
      'guardrails-enabled', true);
    createToggle('Auto-zoom', (val) => callbacks.onConfigChange({ autoZoomEnabled: val }),
      'auto-zoom-enabled');
  });

  // Section: Audio
  createSection('Audio', () => {
    createSlider('Volume', 0, 1, 0.01,
      (val) => callbacks.onConfigChange({ soundVolume: val }),
      (val) => `${Math.round(val * 100)}%`, 'sound-volume');
  });

  document.body.appendChild(panel);
}

export function syncControls(config: SimulationConfig): void {
  updateElementValue('scenario-select', config.scenario);
  updateElementValue('failure-multiplier', config.failureMultiplier);
  updateElementValue('agent-speed', config.agentSpeed);
  updateElementValue('particle-count', config.particleCount);
  updateElementValue('guardrails-enabled', config.guardrailsEnabled);
  updateElementValue('auto-zoom-enabled', config.autoZoomEnabled);
  updateElementValue('layout-preset', config.layout);
  updateElementValue('sound-volume', config.soundVolume);

  document.body.classList.toggle('light-mode', !config.darkMode);

  if (soundBtn) {
    soundBtn.innerHTML = config.soundEnabled ? '🔊' : '🔇';
  }
}

export function isPaused(): boolean {
  return paused;
}

let currentSection: HTMLElement | null = null;

function createSection(label: string, build: () => void) {
  const section = document.createElement('div');
  section.className = 'ctrl-section';

  const sectionHeader = document.createElement('button');
  sectionHeader.className = 'ctrl-section-header';
  sectionHeader.innerHTML = `<span>${label}</span><span class="ctrl-section-arrow">▾</span>`;

  const body = document.createElement('div');
  body.className = 'ctrl-section-body';

  sectionHeader.onclick = () => {
    const collapsed = body.classList.toggle('collapsed');
    const arrow = sectionHeader.querySelector('.ctrl-section-arrow') as HTMLElement;
    if (arrow) arrow.textContent = collapsed ? '▸' : '▾';
  };

  section.appendChild(sectionHeader);
  section.appendChild(body);
  panel.appendChild(section);

  currentSection = body;
  build();
  currentSection = null;
}

function createSlider(
  label: string, min: number, max: number, step: number,
  onChange: (val: number) => void, format: (val: number) => string, id: string
) {
  const target = currentSection ?? panel;
  const group = document.createElement('div');
  group.className = 'control-group';

  const labelEl = document.createElement('div');
  labelEl.className = 'control-label';
  labelEl.innerHTML = `<span>${label}</span><span class="control-value" id="${id}-val"></span>`;
  group.appendChild(labelEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = min.toString();
  input.max = max.toString();
  input.step = step.toString();

  const valDisplay = labelEl.querySelector(`#${id}-val`) as HTMLElement;
  input.oninput = () => {
    const val = parseFloat(input.value);
    valDisplay.textContent = format(val);
    onChange(val);
  };

  group.appendChild(input);
  target.appendChild(group);
}

function createDropdown(
  label: string, options: { id: string; name: string }[],
  onChange: (val: string) => void, id: string
) {
  const target = currentSection ?? panel;
  const group = document.createElement('div');
  group.className = 'control-group';

  const labelEl = document.createElement('div');
  labelEl.className = 'control-label';
  labelEl.textContent = label;
  group.appendChild(labelEl);

  const select = document.createElement('select');
  select.id = id;
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.id;
    o.textContent = opt.name;
    select.appendChild(o);
  });
  select.onchange = () => onChange(select.value);

  group.appendChild(select);
  target.appendChild(group);
}

function createToggle(
  label: string, onChange: (val: boolean) => void, id: string, isGuardrail = false
) {
  const target = currentSection ?? panel;
  const group = document.createElement('div');
  group.className = 'control-group' + (isGuardrail ? ' guardrail-control' : '');

  const container = document.createElement('label');
  container.className = 'toggle-container';

  const labelText = document.createElement('span');
  labelText.textContent = label;
  if (isGuardrail) labelText.style.fontWeight = 'bold';

  const switchEl = document.createElement('span');
  switchEl.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.onchange = () => onChange(input.checked);

  const slider = document.createElement('span');
  slider.className = 'slider' + (isGuardrail ? ' guardrail' : '');

  switchEl.appendChild(input);
  switchEl.appendChild(slider);
  container.appendChild(labelText);
  container.appendChild(switchEl);
  group.appendChild(container);
  target.appendChild(group);
}

function updateElementValue(id: string, value: string | number | boolean) {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
  if (!el) return;

  if (el.type === 'checkbox') {
    (el as HTMLInputElement).checked = value === true || value === 'true';
  } else {
    el.value = value.toString();
    const valDisplay = document.getElementById(`${id}-val`);
    if (valDisplay) {
      const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
      if (id === 'failure-multiplier') valDisplay.textContent = `${numValue.toFixed(2)}x`;
      else if (id === 'agent-speed') valDisplay.textContent = `${numValue.toFixed(2)}x`;
      else if (id === 'particle-count') valDisplay.textContent = Math.round(numValue).toString();
      else if (id === 'sound-volume') valDisplay.textContent = `${Math.round(numValue * 100)}%`;
    }
  }
}
