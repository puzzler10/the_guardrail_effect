export interface SoundOverlayOptions {
  onEnable: () => void
  onSkip: () => void
}

export function initSoundOverlay(options: SoundOverlayOptions) {
  const overlay = document.createElement('div')
  overlay.className = 'sound-overlay'
  
  overlay.innerHTML = `
    <div class="sound-card">
      <h1>The Guardrail Effect</h1>
      <p>This experience includes data-center ambient sound and auditory feedback for agent failures and guardrail interceptions.</p>
      <button class="sound-btn" id="enable-sound-btn">
        <span>🔊</span> ENABLE SOUND
      </button>
      <a class="no-sound-link" id="skip-sound-link">Continue without sound</a>
    </div>
  `
  
  document.body.appendChild(overlay)
  
  const enableBtn = overlay.querySelector('#enable-sound-btn')
  const skipLink = overlay.querySelector('#skip-sound-link')
  
  const hide = () => {
    overlay.classList.add('hidden')
    setTimeout(() => {
      overlay.remove()
    }, 500)
  }
  
  enableBtn?.addEventListener('click', () => {
    options.onEnable()
    hide()
  })
  
  skipLink?.addEventListener('click', (e) => {
    e.preventDefault()
    options.onSkip()
    hide()
  })
}
