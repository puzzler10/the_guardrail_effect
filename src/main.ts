import p5 from 'p5'
import { createSimulation, applyConfig, tick } from './simulation/simulation'
import { createSketch } from './rendering/renderer'
import { soundEngine } from './sound/sound-engine'
import { playFailure, playGuardrailIntercept } from './sound/events'
import { initControls, syncControls, isPaused } from './ui/controls'
import { initEventLog, addFailureEvent, addGuardrailEvent, toggleEventLog } from './ui/event-log'
import { initStats, updateStats } from './ui/stats'
import { initHelp, toggleHelp } from './ui/help'
import { initKeyboard } from './ui/keyboard'
import { initSoundOverlay } from './ui/sound-overlay'
import { initOnboarding } from './ui/onboarding'
import type { SimulationState } from './types'

// 1. State Initialization & Global Variables
let currentState: SimulationState = createSimulation()
let lastTime = performance.now()
let elapsedSimulationTime = 0
const processedEventIds = new Set<string>()

function init() {
  // 2. UI Component Initialization
  initEventLog()
  initStats()
  initHelp()

  initControls({
    onConfigChange: (patch) => {
      currentState = applyConfig(currentState, patch)
      
      if (patch.soundEnabled !== undefined) {
        soundEngine.setEnabled(patch.soundEnabled)
      }
      if (patch.soundVolume !== undefined) {
        soundEngine.setVolume(patch.soundVolume)
      }
      if (patch.darkMode !== undefined) {
        document.body.classList.toggle('light-mode', !patch.darkMode)
      }
    },
    onReset: () => {
      currentState = createSimulation(currentState.config)
      elapsedSimulationTime = 0
      processedEventIds.clear()
      const eventList = document.querySelector('.event-list')
      if (eventList) {
        eventList.innerHTML = ''
      }
    },
    onPause: () => {}, // Handled by isPaused() in tick
    onResume: () => {},
  })

  initKeyboard({
    onPauseToggle: () => {
      const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement
      if (pauseBtn) pauseBtn.click()
    },
    onGuardrailsToggle: () => {
      const newEnabled = !currentState.config.guardrailsEnabled
      currentState = applyConfig(currentState, { guardrailsEnabled: newEnabled })
      syncControls(currentState.config)
    },
    onDarkModeToggle: () => {
      const newDarkMode = !currentState.config.darkMode
      currentState = applyConfig(currentState, { darkMode: newDarkMode })
      document.body.classList.toggle('light-mode', !newDarkMode)
      syncControls(currentState.config)
    },
    onMuteToggle: () => {
      // Toggle sound but also update the volume slider/config? The config has soundVolume, but not soundEnabled exposed in controls directly?
      // Wait, there is no soundEnabled in controls? Let me check controls.ts from before.
      // There is no guardrails toggle sound, wait. Let's look at controls.ts. It has "Sound Volume" slider. It doesn't have "Sound Enabled" toggle! 
      // The spec mentioned "Enable Sound overlay button" in Phase 3. The keyboard shortcut 'M' mutes.
      // We can just toggle soundVolume between 0 and previous or simply use soundEngine.setEnabled.
      // Actually config.soundEnabled is in types.ts. We can toggle it.
      const newSoundEnabled = !currentState.config.soundEnabled
      currentState = applyConfig(currentState, { soundEnabled: newSoundEnabled })
      soundEngine.setEnabled(newSoundEnabled)
      // If we mute, maybe we set volume to 0 in UI? It's better to just use the engine toggle.
      // The UI volume slider might still show > 0, but it won't play if disabled.
      syncControls(currentState.config)
    },
    onLogToggle: () => {
      toggleEventLog()
    },
    onControlsToggle: () => {
      const toggleBtn = document.querySelector('.controls-toggle') as HTMLButtonElement
      if (toggleBtn) toggleBtn.click()
    },
    onHelpToggle: () => {
      toggleHelp()
    },
    onEscape: () => {
      // Close help modal
      const helpModal = document.querySelector('.help-overlay')
      if (helpModal?.classList.contains('open')) {
        toggleHelp()
      }
      
      // Close onboarding if it has a way to close it
      const onboarding = document.querySelector('.onboarding-overlay')
      if (onboarding) {
        const closeBtn = onboarding.querySelector('#onboarding-close') as HTMLButtonElement
        if (closeBtn) closeBtn.click()
      }
    },
    onReset: () => {
      currentState = createSimulation(currentState.config)
      elapsedSimulationTime = 0
      processedEventIds.clear()
      const eventList = document.querySelector('.event-list')
      if (eventList) {
        eventList.innerHTML = ''
      }
    }
  })

  // Initial Sync
  syncControls(currentState.config)
  soundEngine.setVolume(currentState.config.soundVolume)
  document.body.classList.toggle('light-mode', !currentState.config.darkMode)

  // Sound Overlay (required for Web Audio unlock)
  initSoundOverlay({
    onEnable: () => {
      currentState = applyConfig(currentState, { soundEnabled: true })
      soundEngine.setEnabled(true)
      syncControls(currentState.config)
      initOnboarding()
    },
    onSkip: () => {
      currentState = applyConfig(currentState, { soundEnabled: false })
      soundEngine.setEnabled(false)
      syncControls(currentState.config)
      initOnboarding()
    }
  })

  // 3. Rendering Initialization
  const { sketch } = createSketch(() => currentState)
  new p5(sketch, document.getElementById('app') as HTMLElement)

  // 4. Main Update Loop
  requestAnimationFrame(update)
}

function update(now: number) {
  let deltaMs = now - lastTime
  
  // 4a. Tab Backgrounding Safeguard
  if (deltaMs > 50) {
    deltaMs = 50
  }
  lastTime = now

  // 4b. Simulation Tick
  if (!isPaused()) {
    currentState = tick(currentState, deltaMs, now)
    elapsedSimulationTime += deltaMs

    // 4c. Event Reconciliation (Sound & UI Log)
    currentState.recentFailures.forEach(event => {
      const key = `fail-${event.nodeId}-${event.timestamp}`
      if (!processedEventIds.has(key)) {
        processedEventIds.add(key)
        addFailureEvent(event)
        playFailure(event.tier, soundEngine)
      }
    })

    currentState.recentGuardrails.forEach(event => {
      const key = `guard-${event.nodeId}-${event.timestamp}`
      if (!processedEventIds.has(key)) {
        processedEventIds.add(key)
        addGuardrailEvent(event)
        playGuardrailIntercept(soundEngine)
      }
    })

    // Memory Management
    if (processedEventIds.size > 200) {
      processedEventIds.clear()
    }
  }

  // 4d. Stats Update
  updateStats(currentState.stats, elapsedSimulationTime)

  // 4e. Loop Continuation
  requestAnimationFrame(update)
}

// Start application
init()
