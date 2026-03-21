import type { SimulationConfig, LayoutPreset } from '../types';
import { UI, MODEL_PRESETS, SCENARIOS } from '../config';
import './styles.css';

export interface ControlsCallbacks {
  onConfigChange(patch: Partial<SimulationConfig>): void;
  onReset(): void;
  onPause(): void;
  onResume(): void;
}

let panel: HTMLElement;
let toggleBtn: HTMLButtonElement;
let paused = false;

export function initControls(callbacks: ControlsCallbacks): void {
  // Create toggle button
  toggleBtn = document.createElement('button');
  toggleBtn.className = 'controls-toggle';
  toggleBtn.innerHTML = '≡';
  toggleBtn.onclick = () => panel.classList.toggle('open');
  document.body.appendChild(toggleBtn);

  // Create panel
  panel = document.createElement('div');
  panel.className = 'ui-panel controls-panel';

  const title = document.createElement('h2');
  title.textContent = 'Simulation Controls';
  title.style.marginTop = '0';
  panel.appendChild(title);

  // Model Preset
  createDropdown(
    'Model Preset',
    Object.keys(MODEL_PRESETS).map(id => ({ id, name: MODEL_PRESETS[id].name })),
    (val) => callbacks.onConfigChange({ modelPreset: val }),
    'model-preset'
  );

  // Scenario Selector (Phase 8)
  createDropdown(
    'Workflow Scenario',
    SCENARIOS.map(s => ({ id: s.id, name: s.name })),
    (val) => callbacks.onConfigChange({ scenario: val }),
    'scenario-select'
  );

  // Failure Multiplier
  createSlider(
    'Failure Rate',
    UI.failureMultiplierMin,
    UI.failureMultiplierMax,
    0.1,
    (val) => callbacks.onConfigChange({ failureMultiplier: val }),
    (val) => `${val.toFixed(1)}x`,
    'failure-multiplier'
  );

  // Agent Speed
  createSlider(
    'Agent Speed',
    UI.agentSpeedMin,
    UI.agentSpeedMax,
    0.25,
    (val) => callbacks.onConfigChange({ agentSpeed: val }),
    (val) => `${val.toFixed(2)}x`,
    'agent-speed'
  );

  // Particle Count
  createSlider(
    'Particle Count',
    UI.particleCountMin,
    UI.particleCountMax,
    50,
    (val) => callbacks.onConfigChange({ particleCount: Math.round(val) }),
    (val) => Math.round(val).toString(),
    'particle-count'
  );

  // Guardrails Toggle
  createToggle(
    'Guardrails Protection',
    (val) => callbacks.onConfigChange({ guardrailsEnabled: val }),
    'guardrails-enabled',
    true // isGuardrail
  );

  // Auto-zoom Toggle
  createToggle(
    'Auto-zoom on Catastrophe',
    (val) => callbacks.onConfigChange({ autoZoomEnabled: val }),
    'auto-zoom-enabled'
  );

  // Layout Preset
  createDropdown(
    'Layout',
    [
      { id: 'clustered', name: 'Clustered' },
      { id: 'flow', name: 'Flow' },
      { id: 'ring', name: 'Ring' }
    ],
    (val) => callbacks.onConfigChange({ layout: val as LayoutPreset }),
    'layout-preset'
  );

  // Dark Mode Toggle
  createToggle(
    'Dark Mode',
    (val) => {
      callbacks.onConfigChange({ darkMode: val });
      document.body.classList.toggle('light-mode', !val);
    },
    'dark-mode'
  );

  // Sound Volume
  createSlider(
    'Sound Volume',
    0,
    1,
    0.01,
    (val) => callbacks.onConfigChange({ soundVolume: val }),
    (val) => `${Math.round(val * 100)}%`,
    'sound-volume'
  );

  // Buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';

  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'btn btn-primary';
  pauseBtn.id = 'pause-btn';
  pauseBtn.textContent = 'Pause';
  pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (paused) callbacks.onPause();
    else callbacks.onResume();
  };

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn';
  resetBtn.textContent = 'Reset Simulation';
  resetBtn.onclick = () => callbacks.onReset();

  btnRow.appendChild(pauseBtn);
  btnRow.appendChild(resetBtn);
  panel.appendChild(btnRow);

  document.body.appendChild(panel);
}

export function syncControls(config: SimulationConfig): void {
  updateElementValue('model-preset', config.modelPreset);
  updateElementValue('scenario-select', config.scenario);
  updateElementValue('failure-multiplier', config.failureMultiplier);
  updateElementValue('agent-speed', config.agentSpeed);
  updateElementValue('particle-count', config.particleCount);
  updateElementValue('guardrails-enabled', config.guardrailsEnabled);
  updateElementValue('auto-zoom-enabled', config.autoZoomEnabled);
  updateElementValue('layout-preset', config.layout);
  updateElementValue('dark-mode', config.darkMode);
  updateElementValue('sound-volume', config.soundVolume);
  
  document.body.classList.toggle('light-mode', !config.darkMode);
}

export function isPaused(): boolean {
  return paused;
}

function createSlider(
  label: string,
  min: number,
  max: number,
  step: number,
  onChange: (val: number) => void,
  format: (val: number) => string,
  id: string
) {
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
  panel.appendChild(group);
}

function createDropdown(
  label: string,
  options: { id: string; name: string }[],
  onChange: (val: string) => void,
  id: string
) {
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
  panel.appendChild(group);
}

function createToggle(
  label: string,
  onChange: (val: boolean) => void,
  id: string,
  isGuardrail = false
) {
  const group = document.createElement('div');
  group.className = 'control-group' + (isGuardrail ? ' guardrail-control' : '');

  const container = document.createElement('label');
  container.className = 'toggle-container';
  
  const labelText = document.createElement('span');
  labelText.textContent = label;
  labelText.style.fontSize = isGuardrail ? '15px' : '14px';
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
  panel.appendChild(group);
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
      // Re-format if needed based on the slider logic
      if (id === 'failure-multiplier') valDisplay.textContent = `${numValue.toFixed(1)}x`;
      else if (id === 'agent-speed') valDisplay.textContent = `${numValue.toFixed(2)}x`;
      else if (id === 'particle-count') valDisplay.textContent = Math.round(numValue).toString();
      else if (id === 'sound-volume') valDisplay.textContent = `${Math.round(numValue * 100)}%`;
    }
  }
}
