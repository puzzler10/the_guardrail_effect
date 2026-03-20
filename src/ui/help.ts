let backdrop: HTMLElement;

export function initHelp(): void {
  backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  
  const card = document.createElement('div');
  card.className = 'modal-card';
  
  card.innerHTML = `
    <button class="close-btn">&times;</button>
    <h2 style="margin-top:0; color:var(--accent);">AI Failure Visualization</h2>
    
    <div class="help-section">
      <h3>What am I looking at?</h3>
      <p style="font-size:14px; line-height:1.5;">
        This simulation visualizes the failure modes of AI agents. Each moving particle represents an 
        AI agent performing a workflow. Circles are "tools" or "actions" it can take, with varying 
        risk levels (blue=safe, red=critical).
      </p>
    </div>

    <div class="help-grid">
      <div class="help-section">
        <h3>Color Guide</h3>
        <ul class="help-list">
          <li><span>Healthy</span> <span style="color:#00f0ff;">Blue</span></li>
          <li><span>Self-correcting (T1)</span> <span style="color:#ffee00;">Yellow</span></li>
          <li><span>Minor Failure (T2)</span> <span style="color:#ff8800;">Orange</span></li>
          <li><span>Severe Failure (T3)</span> <span style="color:#ff2200;">Red</span></li>
          <li><span>Catastrophic (T4)</span> <span style="color:#ffffff;">White/Skull</span></li>
        </ul>
      </div>
      
      <div class="help-section">
        <h3>Keyboard Shortcuts</h3>
        <ul class="help-list">
          <li><span>Pause / Play</span> <span class="key">Space</span></li>
          <li><span>Guardrails</span> <span class="key">G</span></li>
          <li><span>Dark / Light</span> <span class="key">D</span></li>
          <li><span>Mute Sound</span> <span class="key">M</span></li>
          <li><span>Toggle Log</span> <span class="key">L</span></li>
          <li><span>Help</span> <span class="key">?</span></li>
          <li><span>Reset</span> <span class="key">R</span></li>
        </ul>
      </div>
    </div>

    <div class="help-section" style="margin-top:20px;">
      <h3>Guardrails</h3>
      <p style="font-size:14px; line-height:1.5;">
        When <strong>Guardrails</strong> are enabled, the system intercepts high-risk actions before 
        they cause a failure. You'll see green "shields" and log entries when an action is blocked.
      </p>
    </div>

    <p style="font-size:11px; color:#666; margin-top:30px; border-top:1px solid var(--border); padding-top:10px;">
      Note: Failure rates are illustrative estimates based on general model capability research. 
      Actual performance varies significantly by implementation.
    </p>
  `;
  
  const closeBtn = card.querySelector('.close-btn') as HTMLElement;
  closeBtn.onclick = () => toggleHelp();
  
  backdrop.onclick = (e) => {
    if (e.target === backdrop) toggleHelp();
  };
  
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
}

export function toggleHelp(): void {
  backdrop.classList.toggle('open');
}
