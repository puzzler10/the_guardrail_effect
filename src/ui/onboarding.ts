export function initOnboarding() {
  const seen = localStorage.getItem('onboarding-seen')
  if (seen) return

  const overlay = document.createElement('div')
  overlay.className = 'modal-backdrop open onboarding-overlay'
  overlay.style.zIndex = '150' // Above sound overlay if needed, or just show after

  overlay.innerHTML = `
    <div class="modal-card">
      <h2 style="color: var(--accent); margin-top: 0;">Welcome to the AI Guardrail Demo</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #bbb;">
        This simulation visualizes AI agents navigating a graph of capabilities. 
        Each node represents a tool or action with varying risk levels.
      </p>
      
      <div style="margin: 20px 0;">
        <h3 style="font-size: 14px; margin-bottom: 10px;">Color Guide:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #4488cc;"></div> Safe / Low Risk
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffaa22;"></div> Medium Risk
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5533;"></div> High Risk
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff0066;"></div> Critical Risk
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; background: rgba(0, 255, 136, 0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(0, 255, 136, 0.2);">
        <h3 style="font-size: 14px; margin-top: 0; color: var(--accent-guardrail);">Guardrail System</h3>
        <p style="font-size: 12px; color: #888;">
          Press <span class="key">G</span> at any time to toggle the Guardrail system.
          When enabled, it intercepts high-risk failures and reroutes agents to safety.
        </p>
      </div>

      <button class="btn btn-primary" id="onboarding-close" style="width: 100%; padding: 12px; margin-top: 10px;">
        GET STARTED
      </button>
    </div>
  `

  document.body.appendChild(overlay)

  const closeBtn = overlay.querySelector('#onboarding-close')
  closeBtn?.addEventListener('click', () => {
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
      localStorage.setItem('onboarding-seen', 'true')
    }, 300)
  })
}
